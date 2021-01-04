// A UnitCard is a card displaying unit stats and abilities. It may be interactive or not.
class UnitCard {
	// div
	// unit
	// interactive

	constructor(unit, interactive, cardDiv) {
		this.unit = unit;
		this.interactive = interactive;
		this.div = document.createElement("unit-card");
		this.div.unit = this.unit;
		this.div.actor = this;
		cardDiv.appendChild(this.div);
		this.update();
	}

	select() {
		this.div.setHighlightOverride(true)
		this.div.update();
	}

	deselect() {
		this.div.setHighlightOverride(false);
		this.div.update();
	}

	update() {
		this.div.update();
	}
}

class UnitCardElement extends HTMLElement {
	// actor
	// icons
	// portraitActor
	// unit
	// shadow
	// highlightOverride

	connectedCallback() {
		this.highlightOveride = false;
		this.icons = {};

		let shadow = this.attachShadow({mode: "open"});
		this.shadow = shadow;
		shadow.innerHTML = `
			<style>
				:host {
					display: flex;
					flex-direction: row;
				}
				svg {
					height: 5em;
					width: 5em;
				}
				#abilities {
					color: #888;
					display: flex;
					flex-direction: column;
					flex-wrap: wrap;
					height: 5em;
				}
				#abilities svg { 
					transition: color 0.3s;
					cursor: pointer;
					width: 2.5em;
					height: 2.5em;
				}
				#abilities svg.active {
					color: #ff0;
				}
				#abilities svg:hover {
					color: #ccc;
				}
				#abilities svg.active:hover {
					color: #cc4;
				}
				#abilities svg.hidden {
					visibility: hidden;
				}
			</style>
			<svg id="portrait" viewBox="-18 -18 36 36">
			</svg>
			<div id="abilities">
			</div>
		`;
		{
			let abilityDiv = shadow.getElementById("abilities");
			for (let ability of this.unit.abilities) {
				let d = document.createElement("div");
				let icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
				icon.setAttribute("viewBox", "0 0 24 24");
				let p = document.createElementNS("http://www.w3.org/2000/svg", "path");
				p.setAttribute("d", ability.icon);
				p.setAttribute("fill", "currentColor");
				icon.addEventListener("click", () => clickOnAbility(this.unit, ability));
				this.icons[ability.name] = {"ability": ability, "element": icon};
				icon.appendChild(p);
				icon.setAttribute("title", ability.name);
				d.appendChild(icon);
				abilityDiv.appendChild(d);
			}
		}
		this.portraitActor = new PortraitActor(this.unit, shadow.getElementById("portrait"));
	}

	update() {
		for (let i in this.icons) {
			if (this.unit.state == Unit.State.DEFEATED || this.unit.actionPoints < this.icons[i].ability.minActionPoints) {
				this.icons[i].element.setAttribute("class", "hidden");
			} else if (clickContext.selectedUnit == this.unit && clickContext.selectedAbility.name == i) {
				this.icons[i].element.setAttribute("class", "active");
			} else {
				this.icons[i].element.setAttribute("class", "");
			}
		}
		this.style.backgroundColor = (this.highlightOverride || clickContext.selectedUnit == this.unit) ? "#444" : "#000";
		this.portraitActor.update();
	}

	setHighlightOverride(val) {
		this.highlightOverride = val;
	}

	// num: Which ability to select, numbered from 1 to 10. Passing -1 will select the first non-hidden ability.
	selectAbility(num) {
		if (num == -1) {
			for (let i in this.icons) {
				if (this.icons[i].element.getAttribute("class") == "hidden") continue;
				if (this.icons[i].element.getAttribute("class") == "active") continue;
				clickOnAbility(this.unit, this.icons[i].ability);
				return;
			}
			return;
		}

		let abname = "";
		for (let i in this.icons) {
			num--;
			if (num == 0) abname = i;
		}
		if (abname == "") return;
		if (this.icons[abname].element.getAttribute("class") == "hidden") return;
		if (this.icons[abname].element.getAttribute("class") == "active") return;
		clickOnAbility(this.unit, this.icons[abname].ability);
	}
}
customElements.define("unit-card", UnitCardElement);
