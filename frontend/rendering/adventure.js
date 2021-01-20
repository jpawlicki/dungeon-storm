class AdventureNextRoomElement extends HTMLElement {
	connectedCallback() {
		let shadow = this.attachShadow({mode: "open"});
		this.shadow = shadow;
		shadow.innerHTML = `
			<style>
				:host {
					display: grid;
					grid-template-rows: 1fr minmax(3em, 35%);
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
					justify-content: space-between;
					min-height: 80%;
					overflow-y: auto;
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
					max-height: 6em;
				}
				#characters > div > div > svg:nth-child(1) {
					height: 6em;
					width: 6em;
				}
				#characters > div > div > svg {
					height: 3em;
					width: 3em;
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
				.healing {
					margin-left: 1em;
				}
				#characters .learnable svg {
					height: 2.5em;
					width: 2.5em;
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
					font-size: 150%;
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
					align-items: center;
					font-size: 270%;
					background-color: transparent;
				}
				#characters #resources > span {
					display: flex;
					align-items: center;
				}
				#characters #resources svg {
					height: 1em;
					width: 1em;
				}
				#characters #resources svg > path {
					fill: #ccc;
				}
				#characters div {
					background-color: #000;
					border-radius: 0 1em 1em 0;
					justify-content: space-between;
				}
				.explicable {
					color: #ccf;
					cursor: pointer;
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
			if (gameState.resources[r] == 0) continue;
			spanc.appendChild(document.createTextNode(gameState.resources[r]));
			span.appendChild(spanc);
			if (r == "experience") {
				let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
				svg.setAttribute("viewBox", "0 0 24 24");
				Util.makeCap(svg);
				span.appendChild(svg);
			} else if (r == "healing") {
				let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
				svg.setAttribute("viewBox", "0 0 24 24");
				Util.makePlus(svg);
				span.appendChild(svg);
			} else if (r == "unlock") {
				let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
				svg.setAttribute("viewBox", "0 0 24 24");
				Util.makeUnlock(svg);
				span.appendChild(svg);
			} else if (r == "character") {
				let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
				svg.setAttribute("viewBox", "0 0 24 24");
				Util.makeCharacter(svg);
				span.appendChild(svg);
			} else if (r == "time") {
				let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
				svg.setAttribute("viewBox", "0 0 24 24");
				Util.makeTime(svg);
				span.appendChild(svg);
			} else {
				let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
				svg.setAttribute("viewBox", "0 0 24 24");
				Util.makeQuestion(svg);
				span.appendChild(svg);
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
					abilityDiv.appendChild(Util.makeAbilitySvg(a, true, shadow.getElementById("abilityDescText2")));
				}
				cdiv.appendChild(abilityDiv);
			}
			{
				let learnableAbilityDiv = document.createElement("div");

				// Returns a function that can be called to update the cost, which is saved by reference.
				function makeLearnableSpot(icon, cost, effect, undoEffect) {
					let miniDiv = document.createElement("div");
					let state = false;
					function updateMiniDiv() {
						miniDiv.innerHTML = "";
						miniDiv.appendChild(icon);
						if (state) return;
						if (character.abilities.length >= gameState.adventure.maxAbilities) return;
						for (let r in cost) {
							miniDiv.appendChild(addText(-cost[r], Util.makeCap));
						}
					}
					updateMiniDiv();
					miniDiv.setAttribute("class", "learnable");
					miniDiv.addEventListener("click", () => {
						if (!state) {
							if (character.abilities.length >= gameState.adventure.maxAbilities) return;
							for (let r in cost) if (gameState.resources[r] < cost[r]) return;
							for (let r in cost) gameState.resources[r] -= cost[r];
							state = true;
							effect();
							miniDiv.setAttribute("class", "learnable activated");
						} else {
							for (let r in cost) gameState.resources[r] += Math.max(0, cost[r] - 1);
							state = false;
							undoEffect();
							miniDiv.setAttribute("class", "learnable");
						}
						updateResources();
					});
					learnableAbilityDiv.appendChild(miniDiv);
					return updateMiniDiv;
				}

				function makeHealSpot(icon, cost, effect, undoEffect) {
					let miniDiv = document.createElement("div");
					let state = false;
					function updateMiniDiv() {
						miniDiv.innerHTML = "";
						miniDiv.appendChild(icon);
						if (state) return;
						for (let r in cost) {
							miniDiv.appendChild(addText(-cost[r], Util.makePlus));
						}
					}
					updateMiniDiv();
					miniDiv.setAttribute("class", "learnable healing");
					miniDiv.addEventListener("click", () => {
						if (!state) {
							for (let r in cost) if (gameState.resources[r] < cost[r]) return;
							for (let r in cost) gameState.resources[r] -= cost[r];
							state = true;
							effect();
							miniDiv.setAttribute("class", "learnable healing activated");
							updateMiniDiv();
						} else {
							for (let r in cost) gameState.resources[r] += cost[r];
							state = false;
							undoEffect();
							miniDiv.setAttribute("class", "learnable healing");
							updateMiniDiv();
						}
						updateResources();
					});
					learnableAbilityDiv.appendChild(miniDiv);
				}

				let updaters = [];
				let learnAbilityCosts = {"experience": 0};
				function updateCosts() {
					learnAbilityCosts.experience = Math.max(0, character.abilities.length - 1);
					for (let u of updaters) u();
				}
				updateCosts();
				for (let a of character.learnableAbilities) {
					updaters.push(makeLearnableSpot(Util.makeAbilitySvg(a, false, shadow.getElementById("abilityDescText2")), learnAbilityCosts, () => {character.learn(a); updateCosts();}, () => {character.unlearn(a); updateCosts();}));
				}
				if (character.state == Unit.State.DEFEATED) {
					let img = document.createElementNS("http://www.w3.org/2000/svg", "svg");
					img.setAttribute("viewBox", "0 0 24 24");
					Util.makePlus(img);
					function details() {
						shadow.getElementById("abilityDescText2").innerHTML = "";
						shadow.getElementById("abilityDescText2").appendChild(expandAbilityDetails(["Use !HEALING to encourage this !CHARACTER so that they are no longer !DEFEATED."]));
					}
					img.addEventListener("mouseover", details);
					img.addEventListener("click", details);
					makeHealSpot(img, {healing: 2}, () => {character.state = Unit.State.NORMAL; portrait.update();}, () => {character.state = Unit.State.DEFEATED; portrait.update();});
				} else if (character.state == Unit.State.FRIGHTENED) {
					let img = document.createElementNS("http://www.w3.org/2000/svg", "svg");
					img.setAttribute("viewBox", "0 0 24 24");
					Util.makePlus(img);
					function details() {
						shadow.getElementById("abilityDescText2").innerHTML = "";
						shadow.getElementById("abilityDescText2").appendChild(expandAbilityDetails(["Use !HEALING to encourage this !CHARACTER so that they are no longer !FRIGHTENED."]));
					}
					img.addEventListener("mouseover", details);
					img.addEventListener("click", details);
					makeHealSpot(img, {healing: 1}, () => {character.state = Unit.State.NORMAL; portrait.update();}, () => {character.state = Unit.State.FRIGHTENED; portrait.update();});
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
							if (rewards[k] == "experience") Util.makeCap(g);
							else if (rewards[k] == "healing") Util.makePlus(g);
							else if (rewards[k] == "victory") Util.makeCup(g);
							else if (rewards[k] == "unlock") Util.makeUnlock(g);
							else if (rewards[k] == "character") Util.makeCharacter(g);
							else if (rewards[k] == "time") Util.makeTime(g);
							else Util.makeQuestion(g);
							for (let ele of g.querySelectorAll("path")) {
								ele.style.fill = "#444";
							}
							adventureSvg.appendChild(g);
						}
					}
				}
			}
		}
		Persistence.save();
		Tutorial.hook(Tutorial.Hook.ADVENTURE_NEXTROOM);
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
					min-height: 100%;
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
				.newAdventure {
					background: #000;
					border-radius: 2em;
					text-align: center;
					padding: 0.5em;
					font-size: 200%;
				}
				.clickMe {
					animation: clickMe 1s alternate infinite;
				}
				@keyframes clickMe {
					0% {
						fill: #fff;
					}
					100% {
						fill: #bbb;
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
				#newStuff div, #newStuff menu-character {
					margin-bottom: 1em;
				}
				.abilityLoss {
					border-radius: 3em;
					height: 5em;
					background-color: #000;
				}
				.abilityLoss img {
					border-radius: 3em;
					height: 5em;
					width: 5em;
				}
				.abilityLoss svg {
					height: 5em;
					width: 5em;
				}
				.abilityLossX {
					animation: 1s 1s forwards fadeIn;
					fill: rgba(255, 0, 0, 0);
				}
				@keyframes fadeIn {
					0% {
						fill: rgba(255, 0, 0, 0);
					}
					100% {
						fill: rgba(255, 0, 0, 1);
					}
				}
				#track {
					height: 3em;
					width: 100%;
					overflow-x: hidden;
				}
				#rewards {
					max-width: 40em;
				}
			</style>
			<h1>${gameState.adventure.title[lang]}</h1>
			<div id="text">${(gameState.getAdventureVictorious() ? gameState.adventure.descriptionVictory[lang] : gameState.adventure.descriptionDefeat[lang]).replaceAll("\n", "<br/>")}</div>
			<div id="consequences"></div>
			<div id="track"></div>
			<div id="rewards">
				<svg id="treasureBox" viewBox="0 0 24 24">
					<path class="clickMe" d="M5,4H19A3,3 0 0,1 22,7V11H15V10H9V11H2V7A3,3 0 0,1 5,4M11,11L13,11L13,13L11,13M2,12H9V13L11,15H13L15,13V12H22V20H2V12Z" />
				</svg>
				<div id="clears"></div>
			</div>
			<div id="newStuff"></div>
			<svg id="continue" viewBox="-12 -12 24 24">
				<circle fill="#333" r="12"></circle>
				<path id="play" fill="#eee" d="M8,0L-4,6.9282L-4,-6.9282Z"></path>
			</svg>
		`;

		shadow.getElementById("continue").addEventListener("click", () => { setupMainMenu(); });

		let numClears = 0;
		let victory = gameState.getAdventureVictorious();
		let prevUnlockPoint = gameState.numUnlocksEarned;
		for (let a of gameState.adventureProgress) for (let b of a) if (b) numClears++;
		gameState.numUnlocksEarned += numClears;
		if (victory) gameState.numUnlocksEarned += numClears;
		let newCharacters = gameState.resources.character;
		if (newCharacters == undefined) newCharacters = 0;

		let resourceAwards = [];
		for (let r in gameState.resources) {
			if (r == "time") continue;
			for (let i = 0; i < gameState.resources[r]; i++) resourceAwards.push(r);
			if (r != "character") gameState.numUnlocksEarned += gameState.resources[r];
			gameState.resources[r] = 0;
		}

		gameState.numUnlocksEarned = Math.min(gameState.numUnlocksEarned, Unlock.getMaxUnlock());
		let numAwards = numClears + (victory ? numClears : 0) + resourceAwards.length;

		let addedCharacters = [];
		let addedAdventures = [];
		for (let u of Unlock.unlockData) {
			if (u.at > prevUnlockPoint && u.at <= gameState.numUnlocksEarned) {
				if (u.type == Unlock.CHARACTER) {
					gameState.unlockedCharacters.push(u.value);
					let c = new Unit(characterData[u.value]);
					gameState.characterPool.push(c);
					addedCharacters.push(c);
				} else if (u.type == Unlock.ADVENTURE) {
					gameState.unlockedAdventures.push(u.value);
					addedAdventures.push(u.value);
				}
			}
		}
		if (victory) {
			for (let adv of gameState.adventure.unlocks) {
				if (!gameState.unlockedAdventures.includes(adv) && !addedAdventures.includes(adv)) {
					gameState.unlockedAdventures.push(adv);
					addedAdventures.push(adv);
				}
			}
		}
		for (let i = 0; i < newCharacters; i++) {
			let c = new Unit(characterData[gameState.unlockedCharacters[parseInt(Math.random() * gameState.unlockedCharacters.length)]], true);
			gameState.characterPool.push(c);
			addedCharacters.push(c);
		}
		let abilityLosses = [];
		let abilityGains = [];
		let consequenceCharacterGains = [];
		let consequenceVictory = [];
		let consequences = victory ? gameState.adventure.onVictory : gameState.adventure.onDefeat;
		for (let c of consequences) {
			if (c == Adventure.Consequence.ABILITY_LOSS) {
				for (let c of gameState.characters) {
					if (c.abilities.length > 0) {
						let mayLoseIndex = parseInt(Math.random() * c.abilities.length);
						// Never remove the last PUSHER or BASIC_MOVE ability.
						if (c.abilities[mayLoseIndex].aiHints.includes(AiHints.PUSHER)) {
							if (c.abilities.filter(a => a.aiHints.includes(AiHints.PUSHER)).length == 1) continue;
						}
						if (c.abilities[mayLoseIndex].aiHints.includes(AiHints.BASIC_MOVE)) {
							if (c.abilities.filter(a => a.aiHints.includes(AiHints.BASIC_MOVE)).length == 1) continue;
						}
						let lost = c.abilities.splice(mayLoseIndex, 1)[0];
						abilityLosses.push({"c": c, "a": lost});
					}
				}
			} else if (c == Adventure.Consequence.ABILITY) {
				let abilities = [];
				for (let c in abilityData) abilities.push(c);
				Util.shuffle(abilities);
				let index = 0;
				for (let c of gameState.characters) {
					let a = abilityData[abilities[index++]];
					c.learnableAbilities.push(a);
					abilityGains.push({"c": c, "a": a});
				}
			} else if (c == Adventure.Consequence.CHARACTER) {
				let c = new Unit(characterData[gameState.unlockedCharacters[parseInt(Math.random() * gameState.unlockedCharacters.length)]], true);
				gameState.characterPool.push(c);
				consequenceCharacterGains.push({"c": c});	
			} else if (c == Adventure.Consequence.CHARACTER_NOABILITY) {
				let c = new Unit(characterData[gameState.unlockedCharacters[parseInt(Math.random() * gameState.unlockedCharacters.length)]], true);
				c.abilities = [];
				c.learnableAbilities = [];
				gameState.characterPool.push(c);
				consequenceCharacterGains.push({"c": c});	
			} else if (c == Adventure.Consequence.VICTORY) {
				consequenceVictory.push(true);	
			}
		}
		delete gameState.adventure;
		Persistence.save();

		let unlockTrack = new UnlockTrack(prevUnlockPoint, numAwards, shadow.getElementById("track"));

		for (let a of abilityLosses) {
			let div = document.createElement("div");
			div.setAttribute("class", "abilityLoss");
			let img = document.createElement("img");
			img.setAttribute("src", "assets/portraits/" + a.c.portrait);
			div.appendChild(img);
			let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
			svg.setAttribute("viewBox", "0 0 24 24");
			let path = document.createElementNS("http://www.w3.org/2000/svg", "path");
			path.setAttribute("d", a.a.icon);
			path.setAttribute("fill", "#fff");
			svg.appendChild(path);
			let path2 = document.createElementNS("http://www.w3.org/2000/svg", "path");
			path2.setAttribute("d", "M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z");
			path2.setAttribute("class", "abilityLossX");
			svg.appendChild(path2);
			div.appendChild(svg);
			shadow.querySelector("#consequences").appendChild(div);
		}
		for (let a of abilityGains) {
			let div = document.createElement("div");
			div.setAttribute("class", "abilityLoss");
			let img = document.createElement("img");
			img.setAttribute("src", "assets/portraits/" + a.c.portrait);
			div.appendChild(img);
			let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
			svg.setAttribute("viewBox", "0 0 24 24");
			let path = document.createElementNS("http://www.w3.org/2000/svg", "path");
			path.setAttribute("d", a.a.icon);
			path.setAttribute("fill", "#888");
			svg.appendChild(path);
			div.appendChild(svg);
			shadow.querySelector("#consequences").appendChild(div);
		}
		for (let a of consequenceCharacterGains) {
			let div = document.createElement("div");
			div.setAttribute("class", "abilityLoss");
			let img = document.createElement("img");
			img.setAttribute("src", "assets/portraits/" + a.c.portrait);
			div.appendChild(img);
			shadow.querySelector("#consequences").appendChild(div);
		}
		for (let a of consequenceVictory) {
			let div = document.createElement("div");
			div.setAttribute("class", "abilityLoss");
			let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
			svg.setAttribute("viewBox", "0 0 24 24");
			let path = document.createElementNS("http://www.w3.org/2000/svg", "path");
			path.setAttribute("d", "M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.42,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z");
			path.setAttribute("fill", "#f00");
			svg.appendChild(path);
			div.appendChild(svg);
			svg.style.verticalAlign = "middle";
			div.style.padding = "0.5em";
			div.style.fontSize = "150%";
			div.appendChild(document.createTextNode("Thank you for playing!"));
			shadow.querySelector("#consequences").appendChild(div);
		}


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
					let index = i;
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
						Util.makeUnlock(svg);
						svg.querySelector("path:nth-child(2)").setAttribute("class", "lockicon");
						shadow.getElementById("clears").appendChild(svg);
						for (let u of Unlock.unlockData) {
							if (u.at != prevUnlockPoint + index + 1) continue;
							if (u.type == Unlock.CHARACTER) svg.setAttribute("show", "character");
							if (u.type == Unlock.ADVENTURE) svg.setAttribute("show", "adventure");
						}
					}, 1000 / numAwards * i);
				}
				if (victory) {
					for (let i = 0; i < numClears; i++) {
						let index = i + numClears;
						window.setTimeout(() => {
							let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
							svg.setAttribute("class", "unlockable");
							svg.setAttribute("viewBox", "0 0 24 24");
							let d = document.createElementNS("http://www.w3.org/2000/svg", "path");
							d.setAttribute("d", "M18 2C17.1 2 16 3 16 4H8C8 3 6.9 2 6 2H2V11C2 12 3 13 4 13H6.2C6.6 15 7.9 16.7 11 17V19.08C8 19.54 8 22 8 22H16C16 22 16 19.54 13 19.08V17C16.1 16.7 17.4 15 17.8 13H20C21 13 22 12 22 11V2H18M6 11H4V4H6V11M20 11H18V4H20V11Z");
							d.setAttribute("fill", "#fc0");
							svg.appendChild(d);
							Util.makeUnlock(svg);
							svg.querySelector("path:nth-child(2)").setAttribute("class", "lockicon");
							shadow.getElementById("clears").appendChild(svg);
							for (let u of Unlock.unlockData) {
								if (u.at != prevUnlockPoint + index + 1) continue;
								if (u.type == Unlock.CHARACTER) svg.setAttribute("show", "character");
								if (u.type == Unlock.ADVENTURE) svg.setAttribute("show", "adventure");
							}
						}, 1000 / numAwards * index);
					}
				}
				for (let i = 0; i < resourceAwards.length; i++) {
					let index = i + numClears + (victory ? numClears : 0);
					window.setTimeout(() => {
						let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
						svg.setAttribute("viewBox", "0 0 24 24");
						if (resourceAwards[i] == "experience") {
							Util.makeCap(svg);
						} else if (resourceAwards[i] == "healing") {
							Util.makePlus(svg);
						} else if (resourceAwards[i] == "unlock") {
							Util.makeUnlock(svg);
						} else if (resourceAwards[i] == "character") {
							Util.makeCharacter(svg);
							svg.setAttribute("show", "character");
							svg.setAttribute("steps", "skip");
						}
						if (resourceAwards[i] != "character" && resourceAwards[i] != "unlock") {
							svg.setAttribute("class", "unlockable");
							Util.makeUnlock(svg);
							svg.querySelector("path:nth-child(2)").setAttribute("class", "lockicon");
						}
						if (svg.getAttribute("steps") != "skip") {
							for (let u of Unlock.unlockData) {
								if (u.at != prevUnlockPoint + index + 1) continue;
								if (u.type == Unlock.CHARACTER) svg.setAttribute("show", "character");
								if (u.type == Unlock.ADVENTURE) svg.setAttribute("show", "adventure");
							}
						}
						shadow.getElementById("clears").appendChild(svg);
					}, 1000 / numAwards * index);
				}
				window.setTimeout(() => {
					let time = 200;
					for (let e of shadow.querySelectorAll("#clears > svg.unlockable")) e.setAttribute("class", "unlocked");
					for (let x of shadow.querySelectorAll("#clears svg")) {
						window.setTimeout(() => {
							x.style.opacity = 0;
							if (x.getAttribute("steps") != "skip") {
								unlockTrack.step(.1);
							}
							window.setTimeout(() => {
								if (x.getAttribute("show") == "character") {
									shadow.querySelector("#newStuff").appendChild(renderMenuCharacter(addedCharacters.shift()));
								} else if (x.getAttribute("show") == "adventure") {
									let div = document.createElement("div");
									div.setAttribute("class", "newAdventure");
									div.appendChild(document.createTextNode(adventureData[addedAdventures.shift()].title[lang]));
									shadow.querySelector("#newStuff").appendChild(div);
								}
							}, 110);
						}, time);
						time += 100;
					}
					window.setTimeout(() => {
						while (addedAdventures.length > 0) {
							let div = document.createElement("div");
							div.setAttribute("class", "newAdventure");
							div.appendChild(document.createTextNode(adventureData[addedAdventures.shift()].title[lang]));
							shadow.querySelector("#newStuff").appendChild(div);
						}
					}, time);
					window.setTimeout(() => {
						shadow.getElementById("continue").style.visibility = "visible";
					}, time + 300);
				}, 1500);
			}, 660);
		});
		Tutorial.hook(Tutorial.Hook.ADVENTURE_END);
	}
}
customElements.define("adventure-complete-element", AdventureCompleteElement);

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
