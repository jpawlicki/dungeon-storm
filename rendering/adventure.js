class AdventureIntroElement extends HTMLElement {
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
				#abilities, #abilities_learns {
					display: flex;
					justify-content: space-around;
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
				loadRoom(gameState.adventure.rooms[0][0]);
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
			<div id="abilities_learns">
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


		function makeAbilitySvg(ability, known, shadow) {
			let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
			svg.setAttribute("viewBox", "0 0 24 24");
			let d = document.createElementNS("http://www.w3.org/2000/svg", "path");
			d.setAttribute("d", ability.icon);
			d.setAttribute("fill", known ? "#eee" : "#ccc");
			svg.style.width = "4em";
			svg.style.height = "4em";
			svg.appendChild(d);
			shadow.querySelector(known ? "#abilities" : "#abilitiesLearns").appendChild(svg);
			let info = () => {
				shadow.getElementById("abilityDescText2").textContent = ability.details.join("\n");
			};
			svg.addEventListener("mouseover", info);
			svg.addEventListener("click", info);
		}

		for (let x of character.abilities) makeAbilitySvg(x, true, this.shadow);
		for (let x of character.learnableAbilities) makeAbilitySvg(x, false, this.shadow);

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
					grid-template-rows: min-content min-content 1fr;
					grid-template-columns: min-content 1fr;
					color: #fff;
					height: 100%;
				}
			</style>
			<h1>${gameState.adventure.title[lang]}</h1>
			Next room...
		`;
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
	window.setTimeout(() => showSplash("CLEAR"), 1000);
	function setup() {
		hideSidePane();
		document.querySelector("#mapDiv").innerHTML = "";
		document.querySelector("#mapDiv").appendChild(document.createElement("adventure-nextroom-element"));
	}
	window.setTimeout(setup, 2500);
}
