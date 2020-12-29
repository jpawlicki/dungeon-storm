// Returns a DOM node for the character.
function renderMenuCharacter(character, selectable, retireable, descContainer) {
	let e = document.createElement("menu-character");
	e.character = character;
	e.selectable = selectable;
	e.retireable = retireable;
	e.descContainer = descContainer;
	return e;
}

class MenuCharacter extends HTMLElement {
	// shadow
	// character
	// selectable
	// retireable

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
				label > div > svg.abilityLearned > path {
					fill: #777;
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
		}

		function makeSvg(strengths, threats, bloodied) {
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
				if (bloodied) {
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
		abd.appendChild(makeSvg(this.character.strengthsBloodied, this.character.threatsBloodied, true));

		for (let x of this.character.abilities) abd.appendChild(AdventureIntroElement.makeAbilitySvg(x, true, this.descContainer));
		for (let x of this.character.learnableAbilities) abd.appendChild(AdventureIntroElement.makeAbilitySvg(x, false, this.descContainer));
	}

	selected() {
		return this.shadow.querySelector("input").checked;
	}
}
customElements.define("menu-character", MenuCharacter);
