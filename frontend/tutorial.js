class Tutorial {
	// eventCounts
	// messageStack
	// tutorialWindow
	// tutorialOverlay
	// introState

	static hook(event) {
		if (tutorial == undefined) return;
		tutorial.hookNonStatic(event);
	}

	constructor() {
		this.eventCounts = {};
		this.messageStack = [];

		this.tutorialWindow = document.createElement("div");
		this.tutorialWindow.style.display = "none";
		this.tutorialWindow.style.position = "absolute";
		this.tutorialWindow.style.margin = "auto";
		this.tutorialWindow.style.top = "20%";
		this.tutorialWindow.style.bottom = "20%";
		this.tutorialWindow.style.left = "20%";
		this.tutorialWindow.style.right = "20%";
		this.tutorialWindow.style.borderRadius = "2em";
		this.tutorialWindow.style.border = "2px solid #fff";
		this.tutorialWindow.style.backgroundColor = "rgba(0, 0, 0, 0.95)";
		this.tutorialWindow.style.color = "#fff";
		this.tutorialWindow.style.padding = "0.5em";
		this.tutorialWindow.style.fontSize = "150%";
		document.querySelector("body").appendChild(this.tutorialWindow);

		let closeSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		closeSvg.setAttribute("viewBox", "0 0 24 24");
		let path = document.createElementNS("http://www.w3.org/2000/svg", "path");
		path.setAttribute("fill", "#fff");
		path.setAttribute("d", "M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z");
		closeSvg.appendChild(path);
		closeSvg.style.cssFloat = "right";
		closeSvg.style.height = "2em";
		closeSvg.style.width = "2em";
		closeSvg.style.cursor = "pointer";
		let othis = this;
		closeSvg.addEventListener("click", () => othis.tutorialClose());
		this.tutorialWindow.appendChild(closeSvg);

		this.tutorialWindow.appendChild(document.createElement("div"));

		this.tutorialOverlay = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		this.tutorialOverlay.style.pointerEvents = "none";
		this.tutorialOverlay.style.position = "absolute";
		this.tutorialOverlay.style.top = 0;
		this.tutorialOverlay.style.bottom = 0;
		this.tutorialOverlay.style.left = 0;
		this.tutorialOverlay.style.right = 0;
		this.tutorialOverlay.style.fontSize = "150%";
		this.tutorialOverlay.style.filter = "drop-shadow(0 0 2px #fff)";
		this.tutorialOverlay.style.display = "none";
		function resize() {
			let vb = document.querySelector("body").getBoundingClientRect();
			othis.tutorialOverlay.setAttribute("viewBox", "0 0 " + vb.width + " " + vb.height);
		}
		resize();
		window.addEventListener("resize", resize);
		document.querySelector("body").appendChild(this.tutorialOverlay);
	}

	makeOverlay(circleElements, text, closeable) {
		this.clearOverlay();
		this.tutorialOverlay.style.display = "";
		let g = document.createElementNS("http://www.w3.org/2000/svg", "g");
		g.style.fill = "#000";
		let mapDivB = document.querySelector("#mapDiv").getBoundingClientRect();
		let textCenter = [mapDivB.x + mapDivB.width / 5, mapDivB.height / 5];

		function rotOff(center, offset, radians) {
			let off = [Math.cos(radians) * offset, Math.sin(radians) * offset];
			return [off[0] + center[0], off[1] + center[1]];
		}
		function sub(p1, p2) {
			return [p1[0] - p2[0], p1[1] - p2[1]];
		}

		for (let e of circleElements) {
			let br = e.getBoundingClientRect();
			let radius = Math.sqrt(br.width * br.width / 4 + br.height * br.height / 4);
			let p1x = br.x + br.width / 2 - radius;
			let p1y = br.y + br.height / 2;
			let circleCenter = [br.x + br.width / 2, br.y + br.height / 2];

			let ray = sub(circleCenter, textCenter); // textCenter to circle center
			let theta = Math.atan2(ray[1], ray[0]);

			let l1pr = rotOff(circleCenter, radius + 2, theta + Math.PI);
			let l1p1 = rotOff(l1pr, 2, theta + Math.PI / 2);
			let l1p2 = rotOff(l1pr, 2, theta - Math.PI / 2);
			let l2p1 = rotOff(textCenter, 2, theta + Math.PI / 2);
			let l2p2 = rotOff(textCenter, 2, theta - Math.PI / 2);
			let linePath = [l1p1, l1p2, l2p2, l2p1].map(p => p[0] + " " + p[1]).join("L");

			let p = document.createElementNS("http://www.w3.org/2000/svg", "path");
			p.style.fillRule = "evenodd";
			p.setAttribute(
				"d",
				"M" + p1x + " " + p1y + " A" + radius + " " + radius + " 0 1 0 " + (p1x + radius * 2) + " " + p1y + " A" + radius + " " + radius + " 0 1 0 " + p1x + " " + p1y + " Z " + // inner circle
				"M" + (p1x - 4) + " " + p1y + " A" + (radius + 4) + " " + (radius + 4) + " 0 1 0 " + (p1x - 4 + (radius + 4) * 2) + " " + p1y + " A" + (radius + 4) + " " + (radius + 4) + " 0 1 0 " + (p1x - 4) + " " + p1y + " Z"); // outer circle
			g.appendChild(p);
			p = document.createElementNS("http://www.w3.org/2000/svg", "path");
			p.setAttribute("d", "M" + linePath + "Z");
			g.appendChild(p);
		}

		this.tutorialOverlay.appendChild(g);

		let textE = document.createElementNS("http://www.w3.org/2000/svg", "text");
		textE.style.fill = "#fff";
		textE.appendChild(document.createTextNode(text));
		textE.style.textAnchor = "middle";
		textE.setAttribute("x", textCenter[0]);
		textE.setAttribute("y", textCenter[1]);
		this.tutorialOverlay.appendChild(textE);
		let bb = textE.getBBox();
		let rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
		rect.setAttribute("x", bb.x - 10);
		rect.setAttribute("y", bb.y - 10);
		rect.setAttribute("width", bb.width + 20);
		rect.setAttribute("height", bb.height + 20 + (closeable ? bb.height + 5 : 0));
		rect.setAttribute("rx", 13);
		g.appendChild(rect);
		if (closeable) {
			let textE = document.createElementNS("http://www.w3.org/2000/svg", "text");
			textE.style.fill = "#fc0";
			textE.appendChild(document.createTextNode("OK"));
			textE.style.textAnchor = "middle";
			textE.setAttribute("x", textCenter[0]);
			textE.setAttribute("y", textCenter[1] + bb.height + 5);
			textE.style.pointerEvents = "auto";
			textE.style.cursor = "pointer";
			textE.addEventListener("click", () => Tutorial.hook(Tutorial.Hook.TUTORIAL_CHECK));
			this.tutorialOverlay.appendChild(textE);
		}
	}

	clearOverlay() {
		this.tutorialOverlay.innerHTML = "";
		this.tutorialOverlay.style.display = "none";
	}

	hookNonStatic(event) {
		if (this.eventCounts[event] == undefined) this.eventCounts[event] = 0;
		this.eventCounts[event]++;
		
		if (event == Tutorial.Hook.MAINMENU_START && this.eventCounts[event] == 1) {
			this.makeOverlay([
					document.querySelector("main-menu").shadow.querySelector("menu-character").shadow.querySelector("img"),
					document.querySelector("main-menu").shadow.querySelector("menu-character:nth-child(2)").shadow.querySelector("img"),
			], "Tap these characters.", false);
			this.introState = 1;
		}
		
		if (event == Tutorial.Hook.MAINMENU_CHARACTERSELECT && this.introState == 1) {
			let selected = 0;
			for (let c of document.querySelector("main-menu").shadow.querySelectorAll("menu-character")) if (c.selected()) selected++;
			if (selected == 2) {
				this.makeOverlay([document.querySelector("main-menu").shadow.querySelector("#adventures svg:nth-child(2)")], "Tap this adventure.", false);
			}
			this.introState = 1;
		}
		
		if (event == Tutorial.Hook.ROOM_LOAD) {
			if (this.eventCounts[event] == 1) {
				this.makeOverlay([document.querySelector("unit-card").shadow.querySelector("#abilities svg")], "Tap this ability.", false);
				this.introState = 1;
			} else {
				this.clearOverlay();
			}
		}
		
		if (event == Tutorial.Hook.UI_ABILITYSELECT && this.introState == 1 && clickContext.selectedUnit == gameState.units[0] && clickContext.selectedAbility == abilityData["MOVE"]) {
			this.makeOverlay([document.querySelector("#mapDiv svg > g:nth-child(10)")], "Tap this space.", false);
			this.introState = 2;
		}
		
		if (event == Tutorial.Hook.UI_ABILITYUSE && this.introState == 2) {
			this.makeOverlay([document.querySelector("#undo")], "Undo that.", false);
			this.introState = 3;
		}
		
		if (event == Tutorial.Hook.UI_UNDO && this.introState == 3) {
			this.makeOverlay([document.querySelector("unit-card").shadow.querySelector("#abilities svg"), document.querySelector("unit-card:nth-child(3)").shadow.querySelector("#abilities svg")], "These move.", true);
			this.introState = 4;
		}
		
		if (event == Tutorial.Hook.TUTORIAL_CHECK) {
			if (this.introState == 4) {
				this.makeOverlay([document.querySelector("unit-card").shadow.querySelector("#abilities div:nth-child(2) svg"), document.querySelector("unit-card:nth-child(3)").shadow.querySelector("#abilities div:nth-child(2) svg")], "These push dangers away.", true);
				this.introState = 5;
			} else if (this.introState == 5) {
				this.makeOverlay(gameState.units[3].actors[0].edges.querySelectorAll("circle[r=\"3\"]"), "Circles are defenses. There are strong sides and weak sides.", true);
				this.introState = 6;
			} else if (this.introState == 6) {
				// Diamonds
				let diamonds = [
					gameState.units[0].actors[0].portraitActor.moveActor.diamonds[0],
					gameState.units[0].actors[0].portraitActor.moveActor.diamonds[1],
					gameState.units[0].actors[0].portraitActor.moveActor.diamonds[2],
					gameState.units[0].actors[1].div.portraitActor.moveActor.diamonds[0],
					gameState.units[0].actors[1].div.portraitActor.moveActor.diamonds[1],
					gameState.units[0].actors[1].div.portraitActor.moveActor.diamonds[2],
					gameState.units[1].actors[0].portraitActor.moveActor.diamonds[0],
					gameState.units[1].actors[0].portraitActor.moveActor.diamonds[1],
					gameState.units[1].actors[0].portraitActor.moveActor.diamonds[2],
					gameState.units[1].actors[1].div.portraitActor.moveActor.diamonds[0],
					gameState.units[1].actors[1].div.portraitActor.moveActor.diamonds[1],
					gameState.units[1].actors[1].div.portraitActor.moveActor.diamonds[2],
				];
				this.makeOverlay(diamonds, "Moving and pushing costs ♦.", true);
				this.introState = 7;
			} else if (this.introState == 7) {
				// End turn
				this.makeOverlay([document.querySelector("#done")], "When you run out of ♦, end your turn.", true);
				this.introState = 8;
			} else if (this.introState == 8) {
				this.makeOverlay(gameState.units[0].actors[0].edges.querySelectorAll("g > g:nth-child(1), g > g:nth-child(2), g > g:nth-child(3), g > g:nth-child(4)"), "Red circles threaten.", true);
				this.introState = 9;
			} else if (this.introState == 9) {
				this.makeOverlay([document.querySelector("unit-card").shadow.querySelector("#abilities div:nth-child(3) svg"), document.querySelector("unit-card:nth-child(3)").shadow.querySelector("#abilities div:nth-child(3) svg")], "These automatically overcome threatened dangers that you push sideways.", true);
				this.introState = 10;
			} else if (this.introState == 10) {
				// Dangers
				this.makeOverlay([gameState.units[2].actors[0].edges, gameState.units[3].actors[0].edges], "These are dangers.", true);
				this.introState = 11;
			} else if (this.introState == 11) {
				// Defeat them
				this.makeOverlay([], "Overcome the dangers.", true);
				this.introState = 12;
			} else if (this.introState == 101) {
				this.makeOverlay(document.querySelector("adventure-nextroom-element").shadow.querySelectorAll("#resources > span"), "Clearing challenges earns rewards.", true);
				this.introState = 102;
			} else if (this.introState == 102) {
				this.makeOverlay(document.querySelector("adventure-nextroom-element").shadow.querySelectorAll("#resources span[data-resource=\"time\"]"), "Time is limited.", true);
				this.introState = 103;
			} else if (this.introState == 103) {
				this.makeOverlay(document.querySelector("adventure-nextroom-element").shadow.querySelectorAll("#resources span[data-resource=\"experience\"]"), "Experience teaches abilities.", true);
				this.introState = 104;
			} else if (this.introState == 104) {
				this.makeOverlay(document.querySelector("adventure-nextroom-element").shadow.querySelectorAll("#resources span[data-resource=\"healing\"]"), "Cookies recover characters.", true);
				this.introState = 105;
			} else if (this.introState == 105) {
				this.makeOverlay(document.querySelector("adventure-nextroom-element").shadow.querySelectorAll("path.roomAccess"), "Choose the next challenge.", true);
				this.introState = 106;
			} else if (this.introState == 201) {
				let frightened = [];
				for (let u of gameState.units) if (u.state == Unit.State.FRIGHTENED) frightened.push(u.actors[0].portraitActor.frightened);
				this.makeOverlay(frightened, "They are Frightened (lost circles).", true);
				this.introState = 202;
			} else {
				this.clearOverlay();
			}
		}
		
		if (event == Tutorial.Hook.GAME_RETREAT && this.eventCounts[event] == 1) {
			let retreater = null;
			for (let e of gameState.actionHistory[gameState.actionHistory.length - 1].events) if (e.type == ActionEvent.RETREAT) retreater = e.who;
			this.makeOverlay([retreater.actors[0].edges], "They used an ability to Retreat. If they can't Retreat, they are Defeated.", true);
			this.introState = 201;
		}
		
		if (event == Tutorial.Hook.GAME_DEFEAT && this.eventCounts[event] == 1) {
			let retreater = null;
			for (let e of gameState.actionHistory[gameState.actionHistory.length - 1].events) if (e.type == ActionEvent.DEFEAT) retreater = e.who;
			let control = gameState.actionHistory[gameState.actionHistory.length - 1].note == "Control";
			this.makeOverlay([retreater.actors[0].edges], "They were Defeated" + (control ? "." : " because they could not Retreat (no space or no ♦)."), true);
		}
		
		if (event == Tutorial.Hook.ACTION_TAKEN && this.eventCounts[event] == 12) {
			window.setTimeout(() => this.addMessage("Hotkeys:<br/><br/><b>Backtick (`)</b>: Select next character<br/><b>1 - 8</b>: Select the corresponding ability<br/><b>z</b>: Undo<br/><b>Enter</b>: end turn or close popup<br/><b>d</b>: end turn or close popup<br/><b>Escape</b>: close popup.<br/><b>F11</b>: Fullscreen."), 750);
		}
		
		if (event == Tutorial.Hook.ADVENTURE_NEXTROOM && this.eventCounts[event] == 1) {
			this.makeOverlay([document.querySelector("adventure-nextroom-element").shadow.querySelector("#adventure path")], "You cleared this challenge.", true);
			this.introState = 101;
		}
		
		if (event == Tutorial.Hook.ADVENTURE_NEXTROOM && this.eventCounts[event] == 2 && gameState.resources.experience >= 2) {
			this.makeOverlay(document.querySelector("adventure-nextroom-element").shadow.querySelectorAll("div.learnable"), "Learn an ability or recover.", true);
			this.introState = -1;
		}
		
		if (event == Tutorial.Hook.ADVENTURE_NEXTROOM && this.eventCounts[event] == 3) {
			this.makeOverlay([document.querySelector("adventure-nextroom-element").shadow.querySelector("#adventure path:nth-of-type(9)")], "Clear this challenge to win.", true);
			this.introState = -1;
		}
		
		if (event == Tutorial.Hook.ADVENTURE_END && this.eventCounts[event] == 1) {
			this.addMessage("This adventure is over! Click on the treasure chest to view the rewards you accumulated. Complete adventures to unlock new !CHARACTERs and adventures.");
		}
		
		if (event == Tutorial.Hook.MAINMENU_START && this.eventCounts[event] == 2) {
			this.addMessage("!CHARACTERs who successfully complete adventures can retire and pass their abilities on to another !CHARACTER.");
		}
		
		if (event == Tutorial.Hook.MAINMENU_START && this.eventCounts[event] == 5) {
			this.addMessage("You can create challenges of your own and contribute them to the game using the map icon in the menu in the upper-right.");
		}
		
		if (event == Tutorial.Hook.EXPLAIN_REACTION) {
			this.addMessage("!REACTIONs are abilities that are automatically used. Most !REACTIONs only apply to !THREATENed units.");
		}

		if (event == Tutorial.Hook.EXPLAIN_DEFEAT) {
			this.addMessage("!DEFEATed !DANGERs and !CHARACTERs disappear. You win when all !DANGERs are !DEFEATed, but lose if your !CHARACTERs are all !DEFEATed.");
		}

		if (event == Tutorial.Hook.EXPLAIN_MOVE) {
			this.addMessage("!MOVEing !THREATENed !CHARACTERs is dangerous because it often causes !REACTIONs from !DANGERs. Check the abilities of each !DANGER and consider using abilities without the !MOVE keyword.");
		}

		if (event == Tutorial.Hook.EXPLAIN_THREATEN) {
			this.addMessage("Red and flashing ○ indicate a threat to adjacent !CHARACTERs. Check the !DANGER's abilities for !REACTIONs, and avoid causing them. You can also manipulate !DANGERs into causing !REACTIONs from your !THREATENing !CHARACTERs.");
		}

		if (event == Tutorial.Hook.EXPLAIN_RETREAT) {
			this.addMessage("A !CHARACTER or !DANGER !RETREATs by using its first possible ability to flee from its attacker. If retreat is impossible, it is !DEFEATed.");
		}

		if (event == Tutorial.Hook.EXPLAIN_FRIGHTENED) {
			this.addMessage("!FRIGHTENED !CHARACTERs and !DANGERs have less ○. (Some exceptions exist.) Also, some abilities treat !FRIGHTENED !CHARACTERs or !DANGERs specially.");
		}

		if (event == Tutorial.Hook.EXPLAIN_DANGER) {
			this.addMessage("!DEFEAT all the !DANGERs to win, but don't let them !DEFEAT all your !CHARACTERs.");
		}

		if (event == Tutorial.Hook.EXPLAIN_CHARACTER) {
			this.addMessage("Your !CHARACTERs are the pieces you can control. Use their abilities to defeat !DANGERs.");
		}

		if (event == Tutorial.Hook.EXPLAIN_EXPERIENCE) {
			this.addMessage("!EXPERIENCE is used by !CHARACTERs to acquire new abilities. Gained abilities are permanent.");
		}

		if (event == Tutorial.Hook.EXPLAIN_UNLOCK) {
			this.addMessage("!UNLOCK are used to unlock new !CHARACTERs and adventures.");
		}

		if (event == Tutorial.Hook.EXPLAIN_HEALING) {
			this.addMessage("!HEALING can be used to recover !FRIGHTENED or !DEFEATED !CHARACTERs.");
		}

		if (event == Tutorial.Hook.EXPLAIN_VICTORY) {
			this.addMessage("Acquiring one or more !VICTORY successfully completes the adventure. !VICTORY grows as the adventure continues.");
		}

		if (event == Tutorial.Hook.EXPLAIN_TIME) {
			this.addMessage("Every time you end your turn, you lose !TIME. If you have no !TIME left at the start of your turn, the adventure ends in failure.");
		}

		if (event == Tutorial.Hook.EXPLAIN_DICE) {
			this.addMessage("⚅ represents a random number between 1 and 6, as you would get by rolling a six-sided die.");
		}

		if (event == Tutorial.Hook.EXPLAIN_DIAMOND) {
			this.addMessage("Each !CHARACTER and !DANGER has a number of ♦. Abilities spend ♦ when they are used. (Exception: !REACTIONs rarely spend ♦.) As soon as you end your turn (and before any !DANGERs act), each !CHARACTER is set to ♦♦♦.");
		}

		if (event == Tutorial.Hook.EXPLAIN_CIRCLE) {
			this.addMessage("Each !CHARACTER and !DANGER has ○ in each direction representing how difficult that !CHARACTER or !DANGER is to !DEFEAT from that direction. Many abilities compare ○ to other quantities to determine the effects. Additionally, if a ○ is red and pulsing, it indicates that the !CHARACTER (or !DANGER) !THREATENs !DANGERs (or !CHARACTERs) in the adjacent space.");
		}
	}  

	addMessage(msg) {
		if (this.messageStack.length > 0 && this.messageStack[this.messageStack.length - 1] == msg) return;
		this.messageStack.push(msg);
		this.tutorialWindow.querySelector("div").innerHTML = "";
		this.tutorialWindow.querySelector("div").appendChild(expandAbilityDetails([this.messageStack[this.messageStack.length - 1]]));
		this.tutorialWindow.style.display = "block";
	}

	tutorialClose() {
		if (this.messageStack.length > 0) this.messageStack.pop();
		if (this.messageStack.length == 0) {
			this.tutorialWindow.style.display = "none";
		} else {
			this.tutorialWindow.querySelector("div").innerHTML = "";
			this.tutorialWindow.querySelector("div").appendChild(expandAbilityDetails([this.messageStack[this.messageStack.length - 1]]));
		}
		if (this.tutorialOverlay.childElementCount != 0) Tutorial.hook(Tutorial.Hook.TUTORIAL_CHECK);
	}

	isOpen() {
		return this.messageStack.length != 0 || this.tutorialOverlay.childElementCount != 0;
	}
}
Tutorial.Hook = {
	ADVENTURE_START: 0, // DEPRECATED
	ADVENTURE_NEXTROOM: 1,
	ADVENTURE_END: 2,
	ROOM_LOAD: 3,
	ACTION_TAKEN: 4,
	UNIT_FRIGHTENED: 5, // NYI
	UNIT_DEFEATED: 6, // NYI
	MAINMENU_START: 7,
	EXPLAIN_REACTION: 8,
	EXPLAIN_DEFEAT: 9,
	EXPLAIN_MOVE: 10,
	EXPLAIN_THREATEN: 11,
	EXPLAIN_RETREAT: 12,
	EXPLAIN_FRIGHTENED: 13,
	EXPLAIN_DANGER: 14,
	EXPLAIN_CHARACTER: 15,
	EXPLAIN_EXPERIENCE: 16,
	EXPLAIN_UNLOCK: 17,
	EXPLAIN_HEALING: 18,
	EXPLAIN_VICTORY: 19,
	EXPLAIN_TIME: 20,
	EXPLAIN_DICE: 21,
	EXPLAIN_DIAMOND: 22,
	EXPLAIN_CIRCLE: 23,
	UI_ABILITYSELECT: 24,
	UI_ABILITYUSE: 25,
	UI_UNDO: 26,
	TUTORIAL_CHECK: 27,
	MAINMENU_CHARACTERSELECT: 28,
	GAME_RETREAT: 29,
	GAME_DEFEAT: 30,
}
