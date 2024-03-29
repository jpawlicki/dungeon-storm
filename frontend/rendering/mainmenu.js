class MainMenu extends HTMLElement {
	// victorious: true if the most recent adventure was completed victoriously, else false.
	// message: previous adventure message.
	// retirements[]: A list of retirements the player chooses to make.
	// charSelectListeners[]: A list of callback(player count)s.
	// shadow

	connectedCallback() {
		this.retirements = [];
		this.charSelectListeners = [];

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
          max-height: calc(100% - 3em);
          overflow: auto;
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
					padding-top: 3em;
				}
				#adventures > div {
					margin-bottom: 1em;
					background-color: #000;
					border-radius: 4em;
					display: flex;
					justify-content: space-between;
					align-items: center;
				}
				#adventures svg {
					width: 2em;
					height: 2em;
					cursor: pointer;
					margin: 0.2em;
				}
				#unlockTrack {
					overflow: hidden;
					width: 100vw;
				}
				.explicable {
					color: #ccf;
					cursor: pointer;
				}
				.begin path {
					transition: all 0.4s;
          fill: #aaa;
				}
				#adventures div:hover .begin path {
					fill: #fff;
          transform: scale(1.2);
				}
				h2, h3 {
					margin-bottom: 0;
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
			let mc = renderMenuCharacter(c, () => othis.charClicked(), gameState.numUnlocksEarned != 0 ? retireCallback : undefined, this.shadow.getElementById("desc"), retireOptions);
			this.shadow.getElementById("cast").appendChild(mc);
		}
	}

	charClicked() {
		let count = 0;
		for (let x of this.shadow.querySelectorAll("menu-character")) if (x.selected()) count++;
		for (let c of this.charSelectListeners) c(count);
		Tutorial.hook(Tutorial.Hook.MAINMENU_CHARACTERSELECT);
	}

	addAdventures() {
		for (let adventure of gameState.unlockedAdventures) {
			let d = document.createElement("div");
			let descNode = this.shadow.getElementById("desc");
			let describe = () => {
				descNode.textContent = "";
				descNode.appendChild(document.createTextNode(adventureData[adventure].description[lang]));
				let rules = document.createElement("div");
				let h2 = document.createElement("h2");
				h2.appendChild(document.createTextNode("Rules:"));
				rules.appendChild(h2);
				let learns = document.createElement("div");
				learns.appendChild(document.createTextNode("Characters can learn up to " + adventureData[adventure].maxAbilities + " abilities."));
				rules.appendChild(learns);
				descNode.appendChild(rules);
				function describeConsequences(c) {
					if (c == Adventure.Consequence.ABILITY) return "Gain a random ability.";
					if (c == Adventure.Consequence.CHARACTER) return "Gain a random character.";
					if (c == Adventure.Consequence.CHARACTER_NOABILITY) return "Gain a random character that has no abilities.";
					if (c == Adventure.Consequence.ABILITY_LOSS) return "Lose a random ability.";
					if (c == Adventure.Consequence.VICTORY) return "Win the game.";
				}
				{
					let d = document.createElement("div");
					let t = document.createElement("h3");
					t.appendChild(document.createTextNode("When passed:"));
					d.appendChild(t);
					let consequences = [];
					for (let u of adventureData[adventure].unlocks) if (!gameState.unlockedAdventures.includes(u)) consequences.push("Unlock " + adventureData[u].title[lang] + ".");
					for (let c of adventureData[adventure].onVictory) consequences.push(describeConsequences(c));
					if (consequences.length == 0) d.appendChild(document.createTextNode("No consequence."));
					else for (let c of consequences) {
						let dd = document.createElement("div");
						dd.appendChild(document.createTextNode(c));
						d.appendChild(dd);
					}
					descNode.appendChild(d);
				}
				{
					let d = document.createElement("div");
					let t = document.createElement("h3");
					t.appendChild(document.createTextNode("If defeated:"));
					d.appendChild(t);
					let consequences = [];
					for (let c of adventureData[adventure].onDefeat) consequences.push(describeConsequences(c));
					if (consequences.length == 0) d.appendChild(document.createTextNode("No consequence."));
					else for (let c of consequences) {
						let dd = document.createElement("div");
						dd.appendChild(document.createTextNode(c));
						d.appendChild(dd);
					}
					descNode.appendChild(d);
				}
			};
			d.addEventListener("mouseover", describe);
			d.addEventListener("click", describe);
			{
				let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
				svg.setAttribute("viewBox", "-2 -3 28 28");
				let c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
				c.setAttribute("r", "14");
				c.setAttribute("cx", "12");
				c.setAttribute("cy", "11");
				c.setAttribute("fill", "#333");
				svg.appendChild(c);
				if (gameState.completedAdventures.includes(adventure)) {
					Util.makeCup(svg);
					svg.querySelector("path").style.fill = "#fc0";
				}
				d.appendChild(svg);
			}
			d.appendChild(document.createTextNode(adventureData[adventure].title[lang]));
			let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
			svg.setAttribute("viewBox", "-12 -12 24 24");
			svg.setAttribute("class", "begin");
			let c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
			c.setAttribute("r", "12");
			c.setAttribute("fill", "#333");
			svg.appendChild(c);
			let t = document.createElementNS("http://www.w3.org/2000/svg", "text");
			svg.appendChild(t);
			t.setAttribute("text-anchor", "middle");
			t.setAttribute("dominant-baseline", "central");
			t.appendChild(document.createTextNode(Math.min(gameState.characterPool.length, adventureData[adventure].characters)));
			let p = document.createElementNS("http://www.w3.org/2000/svg", "path");
			p.setAttribute("d", "M8,0L-4,6.9282L-4,-6.9282Z");
			p.style.opacity = 0;
			svg.appendChild(p);
			d.appendChild(svg);
			let othis = this;
			d.addEventListener("click", () => { othis.adventureClicked(adventure); });

			this.charSelectListeners.push(count => {
				count = Math.min(adventureData[adventure].characters, gameState.characterPool.length) - count;
				t.style.opacity = count == 0 ? 0 : 1;
				t.innerHTML = count;
				p.style.opacity = count != 0 ? 0 : 1;
				d.style.cursor = count == 0 ? "pointer" : "default";
			});

			this.shadow.getElementById("adventures").appendChild(d);
		}
	}

	adventureClicked(adventure) {
		let chars = [];
		let i = 0;
		for (let x of this.shadow.querySelectorAll("menu-character")) {
			if (x.selected()) {
				chars.push(gameState.characterPool[i]);
			}
			i++;
		}
		if (chars.length == Math.min(gameState.characterPool.length, adventureData[adventure].characters)) {
			this.applyRetirements();
			loadAdventure(adventureData[adventure])
			for (let c of chars) gameState.characters.push(c);
			loadRoom(adventureData[adventure].entry);
		} else if (chars.length == 0) {
      Tutorial.hook(Tutorial.Hook.MAINMENU_ADVENTUREWITHWRONGCHARNUM);
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
