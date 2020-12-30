class AdventureIntroElement extends HTMLElement {
	static makeAbilitySvg(ability, known, descElement) {
		let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		svg.setAttribute("viewBox", "0 0 24 24");
		let d = document.createElementNS("http://www.w3.org/2000/svg", "path");
		d.setAttribute("d", ability.icon);
		svg.appendChild(d);
		if (descElement != undefined) {
			let info = () => {
				descElement.textContent = expandAbilityDetails(ability.details);
			};
			svg.addEventListener("mouseover", info);
			svg.addEventListener("click", info);
		}
		svg.setAttribute("class", known ? "abilityKnown" : "abilityLearned");
		return svg;
	}

	static makeCap(container) {
		let d = document.createElementNS("http://www.w3.org/2000/svg", "path");
		d.setAttribute("d", "M12,3L1,9L12,15L21,10.09V17H23V9ZM5,13.18V17.18L12,21L19,17.18V13.18L12,17L5,13.18Z");
		d.setAttribute("fill", "currentColor");
		container.appendChild(d);
	}

	static makePlus(container) {
		let d = document.createElementNS("http://www.w3.org/2000/svg", "path");
		d.setAttribute("d", "M10,3L8,5V7H5C3.85,7 3.12,8 3,9L2,19C1.88,20 2.54,21 4,21H20C21.46,21 22.12,20 22,19L21,9C20.88,8 20.06,7 19,7H16V5L14,3H10M10,5H14V7H10V5M11,10H13V13H16V15H13V18H11V15H8V13H11V10Z");
		d.setAttribute("fill", "currentColor");
		container.appendChild(d);
	}

	static makeCup(container) {
		let d = document.createElementNS("http://www.w3.org/2000/svg", "path");
		d.setAttribute("d", "M18 2C17.1 2 16 3 16 4H8C8 3 6.9 2 6 2H2V11C2 12 3 13 4 13H6.2C6.6 15 7.9 16.7 11 17V19.08C8 19.54 8 22 8 22H16C16 22 16 19.54 13 19.08V17C16.1 16.7 17.4 15 17.8 13H20C21 13 22 12 22 11V2H18M6 11H4V4H6V11M20 11H18V4H20V11Z");
		d.setAttribute("fill", "currentColor");
		container.appendChild(d);
	}

	static makeUnlock(container) {
		let d = document.createElementNS("http://www.w3.org/2000/svg", "path");
		d.setAttribute("d", "M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6C4.89,22 4,21.1 4,20V10A2,2 0 0,1 6,8H15V6A3,3 0 0,0 12,3A3,3 0 0,0 9,6H7A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,17A2,2 0 0,0 14,15A2,2 0 0,0 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17Z");
		d.setAttribute("fill", "currentColor");
		container.appendChild(d);
	}

	static makeCharacter(container) {
		let d = document.createElementNS("http://www.w3.org/2000/svg", "path");
		d.setAttribute("d", "M15,14C12.33,14 7,15.33 7,18V20H23V18C23,15.33 17.67,14 15,14M6,10V7H4V10H1V12H4V15H6V12H9V10M15,12A4,4 0 0,0 19,8A4,4 0 0,0 15,4A4,4 0 0,0 11,8A4,4 0 0,0 15,12Z");
		d.setAttribute("fill", "currentColor");
		container.appendChild(d);
	}

	connectedCallback() {
		let shadow = this.attachShadow({mode: "open"});
		this.shadow = shadow;
		shadow.innerHTML = `
			<style>
				:host {
					display: grid;
					grid-template-rows: min-content min-content 1fr;
					grid-template-columns: 40% 60%;
					color: #fff;
					height: 100%;
				}
				h1, #desc {
					grid-column: 2;
					text-align: center;
				}
				h2 {
					text-align: center;
				}
				#begin {
					height: calc(5em + 6px);
					width: calc(5em + 6px);
				}
				input {
					display: none;
				}
				#abilityDescText2 {
					white-space: pre-wrap;
					padding: 2em;
				}
				#begin:hover #play {
					fill: #fff;
					transition: fill 0.4s;
				}
				#desc {
					max-width: 50em;
					margin: auto;
					overflow: auto;
				}
				#begin:hover #play {
					fill: #fff;
					transition: fill 0.4s;
				}
			</style>
			<h1>${gameState.adventure.title[lang]}</h1>
			<div id="desc">${gameState.adventure.description[lang].replaceAll("\n", "<br/>")}<hr width="50%"/></div>
			<div id="characterSelect">
				<svg id="begin" viewBox="-12 -12 24 24">
					<circle fill="#333" r="12"></circle>
					<text id="remaining" text-anchor="middle" alignment-baseline="central" fill="#fff">${gameState.adventure.characters}</text>
					<path id="play" fill="#eee" d="M8,0L-4,6.9282L-4,-6.9282Z" opacity="0"></path>
				</svg>
			</div>
			<div id="abilityDescText2">
			</div>
		`;
		for (let c of gameState.characterPool) {
			// Add character.
			let d = renderMenuCharacter(c, true, false, shadow.getElementById("abilityDescText2"));
			let othis = this;
			d.addEventListener("click", () => othis.charClicked());
			shadow.querySelector("#characterSelect").insertBefore(d, shadow.querySelector("#begin"));
		}

		this.shadow.querySelector("#begin").addEventListener("click", () => {
			let chars = [];
			let i = 0;
			for (let x of this.shadow.querySelectorAll("menu-character")) {
				if (x.selected()) {
					chars.push(gameState.characterPool[i]);
				}
				i++;
			}
			if (chars.length == gameState.adventure.characters) {
				for (let c of chars) gameState.characters.push(c);
				loadRoom([0, 0]);
			}
		});
	}

	charClicked() {
		let count = gameState.adventure.characters;
		for (let x of this.shadow.querySelectorAll("menu-character")) if (x.selected()) count--;
		this.shadow.querySelector("#remaining").style.opacity = count == 0 ? 0 : 1;
		this.shadow.querySelector("#remaining").innerHTML = count;
		this.shadow.querySelector("#play").style.opacity = count != 0 ? 0 : 1;
		this.shadow.querySelector("#begin").style.cursor = count == 0 ? "pointer" : "default";
	}
}
customElements.define("adventure-intro-element", AdventureIntroElement);

class AdventureNextRoomElement extends HTMLElement {
	connectedCallback() {
		let shadow = this.attachShadow({mode: "open"});
		this.shadow = shadow;
		shadow.innerHTML = `
			<style>
				:host {
					display: grid;
					grid-template-rows: 1fr 30em;
					grid-template-columns: 50% 50%;
					color: #fff;
					height: 100%;
					width: 100%;
				}
				:host > div {
				}
				#characters {
					display: flex;
					flex-direction: column;
					justify-content: space-around;
					min-height: 100%;
				}
				#characters > div {
					display: flex;
					align-items: center;
				}
				#characters > div > img {
					width: 4em;
					height: 4em;
					border-radius: 2em;
				}
				#characters > div > div {
					display: flex;
				}
				#characters > div > div:nth-child(1) {
					flex-direction: column;
					flex-wrap: wrap;
					max-height: 4em;
				}
				#characters > div > div > svg:nth-child(1) {
					height: 4em;
					width: 4em;
				}
				#characters > div > div > svg {
					height: 2em;
					width: 2em;
				}
				#characters > div > div > svg:nth-child(n + 2) path {
					fill: #eee;
				}
				.learnable {
					display: flex;
					flex-direction: column;
					align-items: center;
					transition: color 0.3s;
				}
				#characters .learnable svg {
					height: 2em;
					width: 2em;
				}
				.learnable svg path {
					fill: #888;
					transition: fill 0.3s;
				}
				#characters .activated svg path {
					fill: #fc0;
				}
				#characters .activated svg path {
					color: #fc0;
				}
				#abilityDescText2 {
					white-space: pre-wrap;
					overflow: auto;
				}
				#adventure {
					width: 100%;
					height: 100%;
					grid-row: 1/3;
					grid-column: 2;
				}
				#adventure .roomClear {
					fill: #888;
				}
				#adventure .roomAccess {
					cursor: pointer;
					animation: nextRoom 1s alternate infinite;
				}
				#adventure .roomAccess:hover {
					fill: #fff;
					cursor: pointer;
					animation: none;
				}
				#adventure .roomHidden {
					fill: #000;
				}
				@keyframes nextRoom {
					0% {
						fill: #aaa;
					}
					100% {
						fill: #ddd;
					}
				}
				#characters #resources {
					display: flex;
					width: 100%;
					justify-content: space-around;
					font-size: 300%;
					background-color: transparent;
				}
				#characters #resources svg {
					height: 1em;
					width: 1em;
				}
				#characters div {
					background-color: #000;
					border-radius: 0 1em 1em 0;
					justify-content: space-between;
				}
			</style>
			<div id="characters">
				<div id="resources"></div>
			</div>
			<svg id="adventure"></svg>
			<div id="abilityDescText2">
			</div>
		`;

		function updateResources() {
			for (let c of shadow.querySelectorAll("#resources > span > span")) {
				c.innerHTML = gameState.resources[c.getAttribute("data-resource")];
			}
		}

		for (let r in gameState.resources) {
			let span = document.createElement("span");
			let spanc = document.createElement("span");
			spanc.setAttribute("data-resource", r);
			spanc.appendChild(document.createTextNode(gameState.resources[r]));
			span.appendChild(spanc);
			if (r == "experience") {
				let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
				svg.setAttribute("viewBox", "0 0 24 24");
				AdventureIntroElement.makeCap(svg);
				span.appendChild(svg);
			} else if (r == "healing") {
				let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
				svg.setAttribute("viewBox", "0 0 24 24");
				AdventureIntroElement.makePlus(svg);
				span.appendChild(svg);
			} else if (r == "unlock") {
				let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
				svg.setAttribute("viewBox", "0 0 24 24");
				AdventureIntroElement.makeUnlock(svg);
				span.appendChild(svg);
			} else if (r == "character") {
				let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
				svg.setAttribute("viewBox", "0 0 24 24");
				AdventureIntroElement.makeCharacter(svg);
				span.appendChild(svg);
			} else {
				span.appendChild(document.createTextNode("?"));
			}
			this.shadow.querySelector("#resources").appendChild(span);
		}

		function addCharacter(character) {
			function addText(text, iconFunc) {
				let span = document.createElement("span");
				span.appendChild(document.createTextNode(text));
				let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
				svg.setAttribute("viewBox", "0 0 24 24");
				iconFunc(svg);
				svg.style.width = "1em";
				svg.style.height = "1em";
				span.appendChild(svg);
				return span;
			}

			let cdiv = document.createElement("div");
			let img = document.createElementNS("http://www.w3.org/2000/svg", "svg");
			img.setAttribute("viewBox", "-18 -18 36 36");
			let portrait = new PortraitActor(character, img);
			{
				let abilityDiv = document.createElement("div");
				abilityDiv.appendChild(img);
				for (let a of character.abilities) {
					abilityDiv.appendChild(AdventureIntroElement.makeAbilitySvg(a, true, shadow.getElementById("abilityDescText2")));
				}
				cdiv.appendChild(abilityDiv);
			}
			{
				let learnableAbilityDiv = document.createElement("div");

				function makeLearnableSpot(icon, cost, effect, undoEffect) {
					let miniDiv = document.createElement("div");
					miniDiv.appendChild(icon);
					for (let r in cost) {
						if (r == "experience") miniDiv.appendChild(addText(-cost[r], AdventureIntroElement.makeCap));
						else if (r == "healing") miniDiv.appendChild(addText(-cost[r], AdventureIntroElement.makePlus));
						else miniDiv.appendChild(document.createTextNode(cost[r] + "?"));
					}
					miniDiv.setAttribute("class", "learnable");
					let state = false;
					miniDiv.addEventListener("click", () => {
						if (!state) {
							for (let r in cost) if (gameState.resources[r] < cost[r]) return;
							for (let r in cost) gameState.resources[r] -= cost[r];
							state = true;
							effect();
							miniDiv.setAttribute("class", "learnable activated");
						} else {
							for (let r in cost) gameState.resources[r] += cost[r];
							state = false;
							undoEffect();
							miniDiv.setAttribute("class", "learnable");
						}
						updateResources();
					});
					learnableAbilityDiv.appendChild(miniDiv);
				}

				for (let a of character.learnableAbilities) {
					makeLearnableSpot(AdventureIntroElement.makeAbilitySvg(a, false, shadow.getElementById("abilityDescText2")), a.cost, () => {character.learn(a)}, () => {character.unlearn(a)});
				}
				if (character.state == Unit.State.DEFEATED) {
					let img = document.createElementNS("http://www.w3.org/2000/svg", "svg");
					img.setAttribute("viewBox", "0 0 24 24");
					AdventureIntroElement.makePlus(img);
					img.addEventListener("mouseover", () => shadow.getElementById("abilityDescText2").textContent = "Heal character.");
					img.addEventListener("click", () => shadow.getElementById("abilityDescText2").textContent = "Heal character.");
					makeLearnableSpot(img, {healing: 3}, () => {character.state = Unit.State.NORMAL; portrait.update();}, () => {character.state = Unit.State.DEFEATED; portrait.update();});
				} else if (character.state == Unit.State.BLOODIED) {
					let img = document.createElementNS("http://www.w3.org/2000/svg", "svg");
					img.setAttribute("viewBox", "0 0 24 24");
					AdventureIntroElement.makePlus(img);
					img.addEventListener("mouseover", () => shadow.getElementById("abilityDescText2").textContent = "Heal character.");
					img.addEventListener("click", () => shadow.getElementById("abilityDescText2").textContent = "Heal character.");
					makeLearnableSpot(img, {healing: 1}, () => {character.state = Unit.State.NORMAL; portrait.update();}, () => {character.state = Unit.State.BLOODIED; portrait.update();});
				}
				cdiv.appendChild(learnableAbilityDiv);
			}
			shadow.getElementById("characters").appendChild(cdiv);
		}

		for (let c of gameState.characters) addCharacter(c);

		// Adventure Status
		{
			let adventureSvg = shadow.querySelector("#adventure");
			{
				let maxW = 0;
				let maxH = 0;
				for (let i = 0; i < gameState.adventure.rooms.length; i++) {
					for (let j = 0 ; j < gameState.adventure.rooms[i].length; j++) {
						let room = gameState.adventure.rooms[i][j];
						if (room == null || room == undefined) continue;
						let w = 3 + i * -3 + j * 3;
						let h = 6 + i * 3 + j * 3;
						if (maxW < w) maxW = w;
						if (maxH < h) maxH = h;
					}
				}
				adventureSvg.setAttribute("viewBox", (gameState.adventure.rooms.length * -3 - 1) + " -4 " + (maxW + gameState.adventure.rooms.length * 3 + 2) + " " + (maxH + 2));
			}
			let roomClears = 0;
			for (let i = 0; i < gameState.adventure.rooms.length; i++) {
				for (let j = 0 ; j < gameState.adventure.rooms[i].length; j++) {
					if (gameState.adventureProgress[i][j]) roomClears++;
				}
			}
			for (let i = 0; i < gameState.adventure.rooms.length; i++) {
				for (let j = 0 ; j < gameState.adventure.rooms[i].length; j++) {
					let room = gameState.adventure.rooms[i][j];
					if (room == null) continue;
					let access = false;
					for (let neighbor of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
						let x = i + neighbor[0];
						let y = j + neighbor[1];
						if (x < 0 || x >= gameState.adventure.rooms.length || y < 0 || y >= gameState.adventure.rooms[x].length) continue;
						access = access || gameState.adventureProgress[x][y];
					}
					// Add diamond to map.
					let diamond = document.createElementNS("http://www.w3.org/2000/svg", "path");
					diamond.setAttribute("d", "M0,-3L3,0L0,3L-3,0Z");
					diamond.style.strokeWidth = "0.2";
					diamond.style.transform = "translate(" + (i * -3 + j * 3) + "px, " + (i * 3 + j * 3) + "px)";
					diamond.setAttribute("class", gameState.adventureProgress[i][j] ? "roomClear" : access ? "roomAccess" : "roomHidden");
					if (access && !gameState.adventureProgress[i][j]) diamond.addEventListener("click", () => { loadRoom([i, j]); });
					adventureSvg.appendChild(diamond);

					if (gameState.adventureProgress[i][j]) {
						let text = document.createElementNS("http://www.w3.org/2000/svg", "text");
						text.appendChild(document.createTextNode("✓"));
						text.setAttribute("text-anchor", "middle");
						text.setAttribute("fill", "#aaf");
						text.setAttribute("font-weight", "bold");
						text.setAttribute("font-size", "3px");
						text.setAttribute("style", "text-shadow: #000 2px 2px 3px, #000 0 0 5px; pointer-events: none; dominant-baseline: middle");
						text.setAttribute("x", i * -3 + j * 3);
						text.setAttribute("y", i * 3 + j * 3);
						adventureSvg.appendChild(text);
					} else {
						let rewards = [];
						let victoryRoom = false;
						for (let vRoom of gameState.adventure.victory) if (vRoom[0] == i && vRoom[1] == j) victoryRoom = true;
						if (victoryRoom) {
							for (let i = 0 ; i < roomClears + 1; i++) rewards.push("victory");
						}
						for (let x in gameState.adventure.rooms[i][j].reward) {
							for (let y = 0; y < gameState.adventure.rooms[i][j].reward[x]; y++) rewards.push(x);
						}
						let rewardDimension = Math.ceil(Math.sqrt(rewards.length));
						for (let k = 0; k < rewards.length; k++) {
							let g = document.createElementNS("http://www.w3.org/2000/svg", "g");
							let px = k % rewardDimension;
							let py = Math.floor(k / rewardDimension);
							let step = 3 / (rewardDimension);
							g.style.transform = "translate(" + (i * -3 + j * 3) + "px, " + (i * 3 + j * 3 - 3) + "px) translate(" + (px * -step + py * step) + "px, " + (px * step + py * step + step) + "px) scale(" + (0.15 / rewardDimension) + ") translate(-12px, -12px)";
							g.style.pointerEvents = "none";
							if (rewards[k] == "experience") AdventureIntroElement.makeCap(g);
							else if (rewards[k] == "healing") AdventureIntroElement.makePlus(g);
							else if (rewards[k] == "victory") AdventureIntroElement.makeCup(g);
							else if (rewards[k] == "unlock") AdventureIntroElement.makeUnlock(g);
							else if (rewards[k] == "character") AdventureIntroElement.makeCharacter(g);
							else {
								let text = document.createElementNS("http://www.w3.org/2000/svg", "text");
								text.appendChild(document.createTextNode("?"));
								text.setAttribute("text-anchor", "middle");
								text.setAttribute("font-size", "3px");
								text.setAttribute("style", "text-shadow: #000 2px 2px 3px, #000 0 0 5px; pointer-events: none; dominant-baseline: middle");
								g.appendChild(text);
							}
							for (let ele of g.querySelectorAll("path")) {
								ele.style.fill = "#444";
							}
							adventureSvg.appendChild(g);
						}
					}
				}
			}
		}
	}
}
customElements.define("adventure-nextroom-element", AdventureNextRoomElement);

class AdventureCompleteElement extends HTMLElement {
	connectedCallback() {
		let shadow = this.attachShadow({mode: "open"});
		this.shadow = shadow;
		shadow.innerHTML = `
			<style>
				:host {
					display: flex;
					flex-direction: column;
					align-items: center;
					width: 100%;
					color: #fff;
					height: 100%;
				}
				#rewards {
					display: flex;
					align-content: flex-start;
					width: 100%;
					align-items: center;
				}
				#text {
					max-width: 50em;
					margin-bottom: 1em;
				}
				#treasureBox {
					cursor: pointer;
					width: 8em;
					height: 8em;
				}
				#treasureBox > path {
					transition: d 0.3s, fill 1s;
					fill: #fff;
				}
				.clickMe {
					animation: clickMe 1s alternate infinite;
				}
				@keyframes clickMe {
					0% {
						fill: #fff;
					}
					100% {
						fill: #fc0;
					}
				}
				#clears {
					display: flex;
					flex-wrap: wrap;
				}
				#clears > svg {
					height: 2em;
					width: 2em;
				}
				#clears > svg > text {
					dominant-baseline: middle;
					transition: opacity 0.3s;
				}
				#clears > svg > path {
					transition: opacity 0.3s;
				}
				.lockicon {
					opacity: 0;
				}
				.unlocked path, .unlocked text {
					opacity: 0;
				}
				.unlocked path.lockicon {
					opacity: 1;
					fill: #fff;
				}
				#continue {
					visibility: hidden;
					height: 6em;
					width: 6em;
					cursor: pointer;
				}
				#continue:hover #play {
					fill: #fff;
					transition: fill 0.4s;
				}
			</style>
			<h1>${gameState.adventure.title[lang]}</h1>
			<div id="text">${(gameState.getAdventureVictorious() ? gameState.adventure.descriptionVictory[lang] : gameState.adventure.descriptionDefeat[lang]).replaceAll("\n", "<br/>")}</div>
			<div id="rewards">
				<svg id="treasureBox" viewBox="0 0 24 24">
					<path class="clickMe" d="M5,4H19A3,3 0 0,1 22,7V11H15V10H9V11H2V7A3,3 0 0,1 5,4M11,11L13,11L13,13L11,13M2,12H9V13L11,15H13L15,13V12H22V20H2V12Z" />
				</svg>
				<div id="clears"></div>
			</div>
			<svg id="continue" viewBox="-12 -12 24 24">
				<circle fill="#333" r="12"></circle>
				<path id="play" fill="#eee" d="M8,0L-4,6.9282L-4,-6.9282Z"></path>
			</svg>
		`;

		shadow.getElementById("continue").addEventListener("click", () => { setupMainMenu(); });

		let numClears = 0;
		let victory = gameState.getAdventureVictorious();
		for (let a of gameState.adventureProgress) for (let b of a) if (b) numClears++;
		gameState.numUnlocksEarned += numClears;
		if (victory) gameState.numUnlocksEarned += numClears;
		let newCharacters = gameState.resources.character;
		if (newCharacters == undefined) newCharacters = 0;

		let resourceAwards = [];
		for (let r in gameState.resources) {
			for (let i = 0; i < gameState.resources[r]; i++) resourceAwards.push(r);
			if (r != "character") gameState.numUnlocksEarned += gameState.resources[r];
			gameState.resources[r] = 0;
		}

		let numAwards = numClears + (victory ? numClears : 0) + resourceAwards.length;

		// TODO: unlock new character types.
		// TODO: actually add new characters.
		let numNewChars = 0;
		// TODO: save game.

		let boxOpened = false;
		shadow.getElementById("treasureBox").addEventListener("click", () => {
			if (boxOpened) return;
			boxOpened = true;
			shadow.getElementById("treasureBox").style.cursor = "default";
			shadow.querySelector("#treasureBox > path").setAttribute("d", "M5,4H19A3,3 0 0,1 22,7V11H15V10H9V11H2V7A3,3 0 0,1 5,4M10,12L12,10L14,12L12,14M2,12H9V13L11,15H13L15,13V12H22V20H2V12Z");
			shadow.querySelector("#treasureBox > path").setAttribute("class", "");
			window.setTimeout(() => {
				shadow.querySelector("#treasureBox > path").setAttribute("d", "M5,0H19A3,3 0 0,1 22,3V7H15V6H9V7H2V3A3,3 0 0,1 5,0M10,12L12,10L14,12L12,14M2,12H9V13L11,15H13L15,13V12H22V20H2V12Z");
			}, 330);
			window.setTimeout(() => {
				// Show rewards.
				shadow.querySelector("#treasureBox > path").style.fill = "#888";
				for (let i = 0; i < numClears; i++) {
					window.setTimeout(() => {
						let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
						svg.setAttribute("class", "unlockable");
						svg.setAttribute("viewBox", "0 0 24 24");
						let text = document.createElementNS("http://www.w3.org/2000/svg", "text");
						text.appendChild(document.createTextNode("✓"));
						text.setAttribute("text-anchor", "middle");
						text.setAttribute("fill", "#aaf");
						text.setAttribute("font-weight", "bold");
						text.setAttribute("font-size", "26px");
						text.setAttribute("x", "12");
						text.setAttribute("y", "12");
						svg.appendChild(text);
						let p2 = document.createElementNS("http://www.w3.org/2000/svg", "path");
						p2.setAttribute("d", "M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6C4.89,22 4,21.1 4,20V10A2,2 0 0,1 6,8H15V6A3,3 0 0,0 12,3A3,3 0 0,0 9,6H7A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,17A2,2 0 0,0 14,15A2,2 0 0,0 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17Z");
						p2.setAttribute("class", "lockicon");
						svg.appendChild(p2);
						shadow.getElementById("clears").appendChild(svg);
					}, 1000 / numAwards * i);
				}
				if (victory) {
					for (let i = 0; i < numClears; i++) {
						window.setTimeout(() => {
							let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
							svg.setAttribute("class", "unlockable");
							svg.setAttribute("viewBox", "0 0 24 24");
							let d = document.createElementNS("http://www.w3.org/2000/svg", "path");
							d.setAttribute("d", "M18 2C17.1 2 16 3 16 4H8C8 3 6.9 2 6 2H2V11C2 12 3 13 4 13H6.2C6.6 15 7.9 16.7 11 17V19.08C8 19.54 8 22 8 22H16C16 22 16 19.54 13 19.08V17C16.1 16.7 17.4 15 17.8 13H20C21 13 22 12 22 11V2H18M6 11H4V4H6V11M20 11H18V4H20V11Z");
							d.setAttribute("fill", "#fc0");
							svg.appendChild(d);
							let p2 = document.createElementNS("http://www.w3.org/2000/svg", "path");
							p2.setAttribute("d", "M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6C4.89,22 4,21.1 4,20V10A2,2 0 0,1 6,8H15V6A3,3 0 0,0 12,3A3,3 0 0,0 9,6H7A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,17A2,2 0 0,0 14,15A2,2 0 0,0 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17Z");
							p2.setAttribute("class", "lockicon");
							svg.appendChild(p2);
							shadow.getElementById("clears").appendChild(svg);
						}, 1000 / numAwards * (i + numClears));
					}
				}
				for (let i = 0; i < resourceAwards.length; i++) {
					window.setTimeout(() => {
						let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
						svg.setAttribute("viewBox", "0 0 24 24");
						if (resourceAwards[i] == "experience") {
							AdventureIntroElement.makeCap(svg);
						} else if (resourceAwards[i] == "healing") {
							AdventureIntroElement.makePlus(svg);
						} else if (resourceAwards[i] == "unlock") {
							AdventureIntroElement.makeUnlock(svg);
						} else if (resourceAwards[i] == "character") {
							AdventureIntroElement.makeCharacter(svg);
						}
						if (resourceAwards[i] != "character" && resourceAwards[i] != "unlock") {
							svg.setAttribute("class", "unlockable");
							let p2 = document.createElementNS("http://www.w3.org/2000/svg", "path");
							p2.setAttribute("d", "M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6C4.89,22 4,21.1 4,20V10A2,2 0 0,1 6,8H15V6A3,3 0 0,0 12,3A3,3 0 0,0 9,6H7A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,17A2,2 0 0,0 14,15A2,2 0 0,0 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17Z");
							p2.setAttribute("class", "lockicon");
							svg.appendChild(p2);
						}
						shadow.getElementById("clears").appendChild(svg);
					}, 1000 / numAwards * (i + numClears + (victory ? numClears : 0)));
				}
				window.setTimeout(() => {
					for (let e of shadow.querySelectorAll("#clears > svg.unlockable")) e.setAttribute("class", "unlocked");
				}, 1500);
				let time = 2000;
				// TODO: at time+1000, add new characters: one per character unlock and one per bonus character. (time increases by 300 for each)
				// TODO: at time+1000, remark on newly unlocked character types, add 1s to time per character type
				// TODO: at time+2000, add new characters.
				// TODO: at time+1000
				window.setTimeout(() => {
					shadow.getElementById("continue").style.visibility = "visible";
				}, time + 1000);
			}, 660);
		});
	}
}
customElements.define("adventure-complete-element", AdventureCompleteElement);

function setupAdventureSituation() {
	hideSidePane();
	return document.createElement("adventure-intro-element");
}

function setupRoomClear() {
	let div = document.createElement("div");
	div.innerHTML = `
	`;
	return div;
}

function setupDefeatSituation() {
	window.setTimeout(() => showSplash("✗"), 1500);
	function setup() {
		hideSidePane();
		document.querySelector("#mapDiv").innerHTML = "";
		document.querySelector("#mapDiv").appendChild(document.createElement("adventure-complete-element"));
	}
	window.setTimeout(setup, 3500);
}

function setupVictorySituation() {
	window.setTimeout(() => showSplash("✓"), 1000);
	function setup() {
		hideSidePane();
		document.querySelector("#mapDiv").innerHTML = "";
		document.querySelector("#mapDiv").appendChild(document.createElement("adventure-nextroom-element"));
	}
	window.setTimeout(setup, 2500);
}

function setupAdventureVictorySituation() {
	window.setTimeout(() => showSplash("✓"), 1000);
	function setup() {
		hideSidePane();
		document.querySelector("#mapDiv").innerHTML = "";
		document.querySelector("#mapDiv").appendChild(document.createElement("adventure-complete-element"));
	}
	window.setTimeout(setup, 2500);
}