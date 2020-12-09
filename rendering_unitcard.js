// A UnitCard is a collapsable card displaying unit stats and abilities. It may be interactive or not.
class UnitCard {
	// div
	// unit
	// interactive

	constructor(unit, interactive, cardDiv) {
		this.unit = unit;
		this.interactive = interactive;
		this.div = document.createElement("unit-card");
		this.div.unit = this.unit;
		cardDiv.appendChild(this.div);
		this.update();
	}

	select() {
		this.div.update();
	}

	deselect() {
		this.div.update();
	}

	update() {
		this.div.update();
	}
}

class UnitCardElement extends HTMLElement {
	// icons
	// movePipsActor
	// unit

	connectedCallback() {
		this.icons = {};

		let shadow = this.attachShadow({mode: "open"});
		shadow.innerHTML = `
			<style>
				:host {
					display: flex;
					flex-direction: row;
				}
				svg {
					height: 4em;
					width: 4em;
				}
				#abilities {
					background-color: #000;
					color: #888;
					display: flex;
					flex-direction: column;
					flex-wrap: wrap;
					height: 4em;
				}
				#abilities svg { 
					transition: color 0.3s;
					cursor: pointer;
					width: 2em;
					height: 2em;
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
			<svg id="portrait" viewBox="-18 26 36 36">
				<image xlink:href="assets/portraits/${this.unit.portrait}" width="36" height="36" x="-18" y="26" />
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
		this.movePipsActor = new MovePipsActor(this.unit, shadow.getElementById("portrait"));
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
		this.movePipsActor.update();
	}
}
customElements.define("unit-card", UnitCardElement);
