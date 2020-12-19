class AdventureIntroElement extends HTMLElement {
	static makeAbilitySvg(ability, known, shadow) {
		let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		svg.setAttribute("viewBox", "0 0 24 24");
		let d = document.createElementNS("http://www.w3.org/2000/svg", "path");
		d.setAttribute("d", ability.icon);
		svg.appendChild(d);
		let info = () => {
			shadow.getElementById("abilityDescText2").textContent = ability.details.join("\n");
		};
		svg.addEventListener("mouseover", info);
		svg.addEventListener("click", info);
		return svg;
	}

	connectedCallback() {
		let shadow = this.attachShadow({mode: "open"});
		this.shadow = shadow;
		shadow.innerHTML = `
			<style>
				:host {
					display: grid;
					grid-template-rows: min-content min-content 1fr;
					grid-template-columns: min-content 1fr;
					color: #fff;
					height: 100%;
				}
				h1, #desc {
					grid-column: 2;
					text-align: center;
					white-space: pre-wrap;
				}
				h2 {
					text-align: center;
				}
				hr {
					margin-bottom: 4em;
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
					justify-content: space-around;
					align-items: center;
					width: 7em;
					cursor: pointer;
					margin-bottom: 1em;
				}
				svg.arrow {
					width: 2em;
					height: 2em;
				}
				#stats svg {
					width: 12em;
					height: 12em;
				}
				#stats {
					display: flex;
					justify-content: space-around;
				}
				:checked + img {
					filter: brightness(100%) grayscale(0%);
					border: 3px solid white;
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
					grid-column: 3;
					grid-row: 2;
				}
				#characterDescription {
					display: grid;
					grid-template-columns: min-content 1fr 1fr;
					grid-template-rows: 1fr 1fr 1fr;
					height: 100%;
				}
				#stats {
					grid-column: 1 / 4;
				}
				#abilities, #abilitiesLearns {
					display: flex;
					justify-content: space-around;
				}
				#abilities svg, #abilitiesLearns svg {
					width: 3em;
					height: 3em;
				}
				#abilities svg path {
					fill: #eee;
				}
				#abilitiesLearns svg path {
					fill: #888;
				}
				#begin:hover #play {
					fill: #fff;
					transition: fill 0.4s;
				}
				#desc {
					max-width: 50em;
					margin: auto;
				}
			</style>
			<h1>${gameState.adventure.title[lang]}</h1>
			<div id="desc">${gameState.adventure.description[lang]}<hr width="50%"/></div>
			<div id="characterSelect">
				<svg id="begin" viewBox="-12 -12 24 24">
					<circle fill="#333" r="12"></circle>
					<text id="remaining" text-anchor="middle" alignment-baseline="central" fill="#fff">${gameState.adventure.characters}</text>
					<path id="play" fill="#eee" d="M8,0L-4,6.9282L-4,-6.9282Z" opacity="0"></path>
				</svg>
			</div>
			<div id="characterDescription"></div>
		`;
		for (let c of gameState.characterPool) {
			// Add character.
			let d = document.createElement("label");
			let check = document.createElement("input");
			check.setAttribute("type", "checkbox");
			d.appendChild(check);
			let img = document.createElement("img");
			img.setAttribute("src", "assets/portraits/" + c.portrait);
			img.setAttribute("draggable", false);
			d.appendChild(img);
			let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
			svg.setAttribute("viewBox", "0 0 24 24");
			let p = document.createElementNS("http://www.w3.org/2000/svg", "path");
			p.setAttribute("d", "M4,4L12,12L4,20M12,4L20,12L12,20");
			p.setAttribute("fill", "transparent");
			p.setAttribute("stroke", "#ccc");
			p.setAttribute("stroke-width", "3");
			p.setAttribute("stroke-linecap", "round");
			svg.appendChild(p);
			svg.setAttribute("class", "arrow");
			svg.style.visibility = "hidden";
			d.appendChild(svg);
			d.addEventListener("mouseover", () => this.showCharacterDescription(c, svg));
			d.addEventListener("click", () => this.showCharacterDescription(c, svg));
			shadow.querySelector("#characterSelect").insertBefore(d, shadow.querySelector("#begin"));
		}

		this.shadow.querySelector("#begin").addEventListener("click", () => {
			let chars = [];
			let i = 0;
			for (let x of this.shadow.querySelectorAll("input")) {
				if (x.checked) {
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

	showCharacterDescription(character, svg) {
		for (let s of this.shadow.querySelectorAll("svg.arrow")) s.style.visibility = s == svg ? "visible" : "hidden";
		let p = this.shadow.querySelector("#characterDescription");
		p.innerHTML = `
			<div id="stats">
			</div>
			<div id="abilityDescText2">
			</div>
			<h2>Knows:</h2>
			<div id="abilities">
			</div>
			<h2>Learns:</h2>
			<div id="abilitiesLearns">
			</div>
		`;

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

			return svg;
		}

		this.shadow.querySelector("#stats").appendChild(makeSvg(character.strengths, character.threats, false));
		this.shadow.querySelector("#stats").appendChild(makeSvg(character.strengthsBloodied, character.threatsBloodied, true));


		for (let x of character.abilities) this.shadow.querySelector("#abilities").appendChild(AdventureIntroElement.makeAbilitySvg(x, true, this.shadow));
		for (let x of character.learnableAbilities) this.shadow.querySelector("#abilitiesLearns").appendChild(AdventureIntroElement.makeAbilitySvg(x, false, this.shadow));

		let count = gameState.adventure.characters;
		for (let x of this.shadow.querySelectorAll("input:checked")) count--;
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
				#characters svg {
					height: 4em;
					width: 4em;
				}
				#characters svg path {
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

		function makeCap(container) {
			let d = document.createElementNS("http://www.w3.org/2000/svg", "path");
			d.setAttribute("d", "M12,3L1,9L12,15L21,10.09V17H23V9ZM5,13.18V17.18L12,21L19,17.18V13.18L12,17L5,13.18Z");
			d.setAttribute("fill", "currentColor");
			container.appendChild(d);
		}

		function makePlus(container) {
			let d = document.createElementNS("http://www.w3.org/2000/svg", "path");
			d.setAttribute("d", "M10,3L8,5V7H5C3.85,7 3.12,8 3,9L2,19C1.88,20 2.54,21 4,21H20C21.46,21 22.12,20 22,19L21,9C20.88,8 20.06,7 19,7H16V5L14,3H10M10,5H14V7H10V5M11,10H13V13H16V15H13V18H11V15H8V13H11V10Z");
			d.setAttribute("fill", "currentColor");
			container.appendChild(d);
		}

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
				makeCap(svg);
				span.appendChild(svg);
			} else if (r == "healing") {
				let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
				svg.setAttribute("viewBox", "0 0 24 24");
				makePlus(svg);
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
			cdiv.appendChild(img);
			{
				let abilityDiv = document.createElement("div");
				for (let a of character.abilities) {
					abilityDiv.appendChild(AdventureIntroElement.makeAbilitySvg(a, true, shadow));
				}
				cdiv.appendChild(abilityDiv);
			}
			{
				let learnableAbilityDiv = document.createElement("div");

				function makeLearnableSpot(icon, cost, effect, undoEffect) {
					let miniDiv = document.createElement("div");
					miniDiv.appendChild(icon);
					for (let r in cost) {
						if (r == "experience") miniDiv.appendChild(addText(-cost[r], makeCap));
						else if (r == "healing") miniDiv.appendChild(addText(-cost[r], makePlus));
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
					makeLearnableSpot(AdventureIntroElement.makeAbilitySvg(a, false, shadow), a.cost, () => {character.learn(a)}, () => {character.unlearn(a)});
				}
				if (character.state == Unit.State.DEFEATED) {
					let img = document.createElementNS("http://www.w3.org/2000/svg", "svg");
					img.setAttribute("viewBox", "0 0 24 24");
					makePlus(img);
					img.addEventListener("mouseover", () => shadow.getElementById("abilityDescText2").textContent = "Heal character.");
					img.addEventListener("click", () => shadow.getElementById("abilityDescText2").textContent = "Heal character.");
					makeLearnableSpot(img, {healing: 3}, () => {character.state = Unit.State.NORMAL; portrait.update();}, () => {character.state = Unit.State.DEFEATED; portrait.update();});
				} else if (character.state == Unit.State.BLOODIED) {
					let img = document.createElementNS("http://www.w3.org/2000/svg", "svg");
					img.setAttribute("viewBox", "0 0 24 24");
					makePlus(img);
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
							if (rewards[k] == "experience") makeCap(g);
							else if (rewards[k] == "healing") makePlus(g);
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

class AdventureDefeatElement extends HTMLElement {
	connectedCallback() {
		let shadow = this.attachShadow({mode: "open"});
		this.shadow = shadow;
		shadow.innerHTML = `
			<style>
				:host {
					display: grid;
					grid-template-rows: min-content min-content 1fr;
					grid-template-columns: min-content 1fr;
					color: #fff;
					height: 100%;
				}
			</style>
			<h1>${gameState.adventure.title[lang]}</h1>
			Defeat...
		`;
	}
}
customElements.define("adventure-defeat-element", AdventureDefeatElement);

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
	window.setTimeout(() => showSplash("DEFEAT"), 1000);
	function setup() {
		hideSidePane();
		document.querySelector("#mapDiv").innerHTML = "";
		document.querySelector("#mapDiv").appendChild(document.createElement("adventure-defeat-element"));
	}
	window.setTimeout(setup, 2500);
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
