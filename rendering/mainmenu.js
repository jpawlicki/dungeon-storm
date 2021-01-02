class MainMenu extends HTMLElement {
	// victorious: true if the most recent adventure was completed victoriously, else false.
	// message: previous adventure message.
	// retirements[]: A list of retirements the player chooses to make.
	// shadow

	connectedCallback() {
		this.retirements = [];

		let shadow = this.attachShadow({mode: "open"});
		this.shadow = shadow;
		shadow.innerHTML = `
			<style>
				:host {
					display: grid;
					grid-template-rows: min-content 1fr min-content;
					grid-template-columns: 1fr 1fr;
					color: #fff;
					height: 100%;
				}
				#cast {
					grid-row: 1 / 3;
					grid-column: 1;
				}
				#unlockTrack {
					grid-column: 1 / 3;
					height: 3em;
				}
				#desc {
					white-space: pre-wrap;
					padding: 2em;
				}
				#adventures {
					font-size: 150%;
					padding-left: 1em;
					padding-right: 0.5em;
				}
				#cast, #adventures {
					padding-top: 1em;
				}
				#adventures > div {
					margin-bottom: 2em;
					background-color: #000;
					border-radius: 4em;
					padding: 0.2em 0.2em 0.2em 0.65em;
					display: flex;
					justify-content: space-between;
					align-items: center;
				}
				#adventures svg {
					width: 2em;
					height: 2em;
					cursor: pointer;
				}
				#adventures svg:hover path {
					fill: #fff;
				}
				#unlockTrack {
					overflow: hidden;
					width: 100vw;
				}
				.explicable {
					color: #ccf;
					cursor: pointer;
				}
			</style>
			<div id="cast"></div>
			<div id="adventures"></div>
			<div id="desc"></div>
			<div id="unlockTrack"></div>
		`;
		this.addCharacters();
		this.addAdventures();
		this.addUnlockTrack();
		Tutorial.hook(Tutorial.Hook.MAINMENU_START);
	}

	addCharacters() {
		let retireOptions = [];
		let othis = this;
		function retireCallback(who, prev, current) {
			for (let o of retireOptions) if (o.unit == who) o.allowed = current == null;
			if (prev != null) othis.retirements = othis.retirements.filter(a => a.unit != who);
			if (current != null) othis.retirements.push({"unit": who, "to": current});
			for (let x of othis.shadow.querySelectorAll("menu-character")) {
				let bonusAbilities = [];
				let retireable = true;
				for (let r of othis.retirements) {
					if (r.to == x.character) {
						for (let a of r.unit.abilities) bonusAbilities.push(a);
						retireable = false;
					}
				}
				x.update(retireable, bonusAbilities);
			}
		}
		for (let c of gameState.characterPool) retireOptions.push({"unit": c, "allowed": true});
		for (let c of gameState.characterPool) {
			let mc = renderMenuCharacter(c, false, true, this.shadow.getElementById("desc"), retireOptions, retireCallback);
			this.shadow.getElementById("cast").appendChild(mc);
		}
	}

	addAdventures() {
		for (let adventure of gameState.unlockedAdventures) {
			let d = document.createElement("div");
			d.appendChild(document.createTextNode(adventureData[adventure].title[lang]));
			let descNode = this.shadow.getElementById("desc");
			let describe = () => { descNode.textContent = adventureData[adventure].description[lang]; };
			d.addEventListener("mouseover", describe);
			d.addEventListener("click", describe);

			let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
			svg.setAttribute("viewBox", "-12 -12 24 24");
			let c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
			c.setAttribute("r", "12");
			c.setAttribute("fill", "#333");
			svg.appendChild(c);
			let p = document.createElementNS("http://www.w3.org/2000/svg", "path");
			p.setAttribute("fill", "#eee");
			p.setAttribute("d", "M8,0L-4,6.9282L-4,-6.9282Z");
			svg.appendChild(p);
			d.appendChild(svg);
			let othis = this;
			svg.addEventListener("click", () => { othis.applyRetirements(); loadAdventure(adventureData[adventure]) });

			this.shadow.getElementById("adventures").appendChild(d);
		}
	}

	addUnlockTrack() {
		new UnlockTrack(gameState.numUnlocksEarned, 0, this.shadow.getElementById("unlockTrack"));
	}

	applyRetirements() {
		for (let r of this.retirements) {
			for (let ability of r.unit.abilities) {
				if (r.to.abilities.includes(ability) || r.to.learnableAbilities.includes(ability)) continue;
				r.to.learnableAbilities.push(ability);
			}
			gameState.characterPool = gameState.characterPool.filter(x => x != r.unit);
		}
	}
}
customElements.define("main-menu", MainMenu);

function setupMainMenu() {
	hideSidePane();
	document.querySelector("#mapDiv").innerHTML = "";
	document.querySelector("#mapDiv").appendChild(document.createElement("main-menu"));
}
