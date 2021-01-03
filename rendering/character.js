// Returns a DOM node for the character.
//   character: the Unit represented
//   selectCallback: a function() called when the character is selected or deselected. If undefined, selection is not possible.
//   retireCallback: a function(unit, previousRetire, currentRetire) called when the character retirement is changed. If undefined, retirement is disabled.
//   descContainer: a DOM node to render ability mouseover text into. If undefined, mousing over abilities does nothing.
//   retireTargetOptions: a [{unit: unit, allowed: bool}, ...] representing what options are allowed for retirement. Saved by reference, so mutations will be observed.
function renderMenuCharacter(character, selectCallback, retireCallback, descContainer, retireTargetOptions) {
	let e = document.createElement("menu-character");
	e.character = character;
	e.selectCallback = selectCallback;
	e.selectable = selectCallback != undefined;
	e.retireable = retireCallback != undefined;
	e.descContainer = descContainer;
	e.retireTargetOptions = retireTargetOptions;
	e.retireCallback = retireCallback;
	return e;
}

class MenuCharacter extends HTMLElement {
	// shadow
	// character
	// selectable
	// retireable
	// retireTargetOptions[]
	// retireTargetOptions
	// selectCallback
	// retireCallback

	connectedCallback() {
		let shadow = this.attachShadow({mode: "open"});
		this.shadow = shadow;
		shadow.innerHTML = `
			<style>
				:host {
				}
				img {
					height: 5em;
					width: 5em;
					vertical-align: middle;
					filter: brightness(50%) grayscale(80%);
					border: 3px solid transparent;
					transition: filter 0.3s;
					border-radius: 2.5em;
				}
				label {
					display: flex;
					align-items: center;
					cursor: pointer;
					margin-bottom: 1em;
					background-color: #000;
					border-radius: 5em;
				}
				:checked + img {
					filter: brightness(100%) grayscale(0%);
					border: 3px solid white;
				}
				input {
					display: none;
				}
				label > div {
					display: flex;
					flex-direction: column;
					flex-wrap: wrap;
					max-height: 4em;
					overflow: auto;
					width: 20em;
					align-content: flex-start;
					flex-grow: 1;
					transition: opacity 0.5s;
				}
				label > div > svg {
					height: 2em;
					width: 2em;
				}
				label > div > .statBlock {
					height: 4em;
					width: 4em;
				}
				label > div > svg.abilityKnown > path {
					fill: #fff;
				}
				label > div > svg.abilityLearned > path, label > div > svg.abilityBonus > path {
					fill: #777;
				}
				label > .retireOption {
					height: 5em;
					width: 5em;
					padding-right: 3px;
					text-align: right;
					cursor: pointer;
				}
			</style>
			<label>
				<input type="checkbox" />
				<img src="assets/portraits/${this.character.portrait}" draggable="false"></img>
				<div id="abilities">
				</div>
			</label>
		`;

		if (!this.selectable) {
			this.shadow.querySelector("img").style.filter = "brightness(100%) grayscale(0%)";
			this.shadow.querySelector("input").disabled = true;
			this.shadow.querySelector("label").style.cursor = "default";
		} else {
			let othis = this;
			this.shadow.querySelector("input").addEventListener("change", () => {
				if (othis.retireable) othis.retireOption.style.visibility = !this.selected() ? "visible" : "hidden";
				othis.selectCallback();
			});
		}

		function makeSvg(strengths, threats, frightened) {
			let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
			svg.setAttribute("viewBox", "-12 -12 24 24");

			for (let i = 0; i < 4; i++) {
				let g = document.createElementNS("http://www.w3.org/2000/svg", "g");
				g.setAttribute("transform", "rotate(" + (90 * (i + 2)) + ", 0, 0)");
				for (let n = 0; n < strengths[i]; n++) {
					let c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
					c.setAttribute("cx", 3 * (n - strengths[i] / 2.0 + 0.5));
					c.setAttribute("cy", 10);
					c.setAttribute("fill", threats[i] ? "#f00" : "#fff");
					c.setAttribute("stroke", "#000");
					c.setAttribute("stroke-width", "0.4");
					c.setAttribute("r", 1);
					g.appendChild(c);
				}
				if (frightened) {
					let d = document.createElementNS("http://www.w3.org/2000/svg", "path");
					d.setAttribute("d", "M0,8A6,6 0 0,1 -6,2C-6,-2 0,-8.75 0,-8.75C0,-8.25 6,-2 6,2A6,6 0 0,1 0,8Z");
					d.setAttribute("fill", "#8a0303");
					d.style.transform = "scale(0.5)";
					svg.appendChild(d);
				}
				svg.appendChild(g);
			}
			svg.setAttribute("class", "statblock");

			return svg;
		}

		let abd = shadow.getElementById("abilities");
		abd.appendChild(makeSvg(this.character.strengths, this.character.threats, false));
		abd.appendChild(makeSvg(this.character.strengthsFrightened, this.character.threatsFrightened, true));

		for (let x of this.character.abilities) abd.appendChild(Util.makeAbilitySvg(x, true, this.descContainer));
		for (let x of this.character.learnableAbilities) abd.appendChild(Util.makeAbilitySvg(x, false, this.descContainer));

		if (this.retireable) {
			this.retireOption = document.createElementNS("http://www.w3.org/2000/svg", "svg");
			this.retireOption.setAttribute("viewBox", "0 0 24 24");
			this.retireOption.setAttribute("preserveAspectRatio", "xMaxYMin meet");
			this.retireOption.setAttribute("class", "retireOption");

			let c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
			c.setAttribute("r", 12);
			c.setAttribute("cx", 12);
			c.setAttribute("cy", 12);
			c.setAttribute("fill", "#222");
			this.retireOption.appendChild(c);

			let p = document.createElementNS("http://www.w3.org/2000/svg", "path");
			p.setAttribute("d", "M18 12.24V22H17.06V12.24C17.06 12.09 17 12 16.93 11.89C16.84 11.8 16.74 11.76 16.62 11.76C16.47 11.76 16.36 11.8 16.27 11.89C16.18 12 16.14 12.1 16.14 12.24V13.16H15.23V12.5C14.53 12.33 13.9 12.04 13.35 11.63C12.8 11.22 12.34 10.74 11.96 10.19L11.61 11.39C11.5 11.81 11.5 12.24 11.5 12.68L11.5 13L11.5 13.33L13.35 15.94V22H11.5V17.34L9.82 15L9.65 18.25L6.86 22L5.38 20.87L7.77 17.64V12.68C7.77 12.15 7.82 11.63 7.91 11.11L8.25 9.54L6.86 10.32V13.63H5V9.23L10 6.4C10.29 6.26 10.59 6.18 10.91 6.18C11.23 6.18 11.54 6.27 11.83 6.44C12.15 6.62 12.39 6.88 12.57 7.23L13.31 8.8C13.6 9.38 14.04 9.87 14.64 10.26C15.23 10.65 15.89 10.85 16.62 10.85C17 10.85 17.32 11 17.6 11.24C17.88 11.5 18 11.83 18 12.24M12 2C13.11 2 14 2.9 14 4C14 5.11 13.11 6 12 6C10.9 6 10 5.11 10 4C10 2.9 10.9 2 12 2Z");
			p.setAttribute("fill", "#555");
			this.retireOption.appendChild(p);

			let currentRetireUnit = null;

			for (let c of this.retireTargetOptions) {
				let portraitimg = document.createElementNS("http://www.w3.org/2000/svg", "image");
				portraitimg.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "assets/portraits/" + c.unit.portrait);
				portraitimg.setAttribute("clip-path", "circle()");
				portraitimg.setAttribute("width", 24);
				portraitimg.setAttribute("height", 24);
				portraitimg.style.opacity = 0;
				portraitimg.style.transition = "opacity 0.3s";
				this.retireOption.appendChild(portraitimg);
			}

			let othis = this;
			this.retireOption.addEventListener("click", (ev) => {
				ev.stopPropagation();
				ev.preventDefault();
				for (let img of othis.retireOption.querySelectorAll("image")) img.style.opacity = 0;
				let pos = 0;
				while (pos < othis.retireTargetOptions.length && othis.retireTargetOptions[pos].unit != currentRetireUnit) pos++;
				if (pos >= othis.retireTargetOptions.length) {
					pos = 0;
				} else {
					pos++;
				}
				while (pos < othis.retireTargetOptions.length && (!othis.retireTargetOptions[pos].allowed || othis.retireTargetOptions[pos].unit == othis.character)) pos++;
				if (pos >= othis.retireTargetOptions.length) {
					// back to null
					othis.retireCallback(othis.character, currentRetireUnit, null);
					currentRetireUnit = null;
					othis.shadow.getElementById("abilities").style.opacity = 1;
					othis.shadow.querySelector("label > img").style.filter = "brightness(100%) grayscale(0%)";
					if (this.selectable) {
						this.shadow.querySelector("input").disabled = false;
						this.shadow.querySelector("label").style.cursor = "pointer";
					}
				} else {
					othis.retireCallback(othis.character, currentRetireUnit, othis.retireTargetOptions[pos].unit);
					currentRetireUnit = othis.retireTargetOptions[pos].unit;
					othis.retireOption.querySelectorAll("image")[pos].style.opacity = 1;
					othis.shadow.getElementById("abilities").style.opacity = 0.1;
					othis.shadow.querySelector("label > img").style.filter = "brightness(30%) grayscale(80%)";
					if (this.selectable) {
						this.shadow.querySelector("input").disabled = true;
						this.shadow.querySelector("label").style.cursor = "default";
					}
				}
			});

			this.shadow.querySelector("label").appendChild(this.retireOption);
		}
	}

	update(retireable, bonusAbilities) {
		this.retireOption.style.visibility = retireable && !this.selected() ? "visible" : "hidden";
		for (let a of this.shadow.querySelectorAll(".abilityBonus")) a.parentNode.removeChild(a);
		let addedAbilities = [];
		for (let bonus of bonusAbilities) {
			if (this.character.abilities.includes(bonus) || this.character.learnableAbilities.includes(bonus) || addedAbilities.includes(bonus)) continue;
			addedAbilities.push(bonus);
			let svg = Util.makeAbilitySvg(bonus, false, this.descContainer);
			svg.setAttribute("class", "abilityBonus");
			this.shadow.getElementById("abilities").appendChild(svg);
		}
	}

	selected() {
		return this.shadow.querySelector("input").checked;
	}
}
customElements.define("menu-character", MenuCharacter);
