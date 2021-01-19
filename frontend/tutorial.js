class Tutorial {
	// eventCounts
	// messageStack
	// tutorialWindow


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
		this.tutorialWindow.style.backgroundColor = "#000";
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

		document.getElementById("tutorialPopup");
	}

	hookNonStatic(event) {
		if (this.eventCounts[event] == undefined) this.eventCounts[event] = 0;
		this.eventCounts[event]++;
		
		if (event == Tutorial.Hook.MAINMENU_START && this.eventCounts[event] == 1) {
			this.addMessage("Welcome! To get started, click on two !CHARACTERs and press play. To learn more about abilities, mouse over the icons beside the !CHARACTERs.");
		}
		
		if (event == Tutorial.Hook.ROOM_LOAD && this.eventCounts[event] == 1) {
			this.addMessage("You must defeat the !DANGERs to proceed. Select a character ability, then click on a space to use it.");
		}
		
		if (event == Tutorial.Hook.ACTION_TAKEN && this.eventCounts[event] == 1) {
			window.setTimeout(() => this.addMessage("Using abilities costs ♦. ♦ are replenished when you end your turn. Most actions can be undone by clicking the undo arrow in the upper left. Continue using abilities to !DEFEAT the !DANGERs. When you are ready, end your turn by clicking the check mark in the upper left."), 750);
		}
		
		if (event == Tutorial.Hook.ACTION_TAKEN && this.eventCounts[event] == 5) {
			window.setTimeout(() => this.addMessage("When !DANGERs or !CHARACTERs !RETREAT, they must spend ♦ to use an ability to exit the space they occupy. If they can't, they are !DEFEATed. Be careful about spending a !CHARACTER's last ♦ on an ability that might cause that !CHARACTER to retreat."), 750);
		}
		
		if (event == Tutorial.Hook.ACTION_TAKEN && this.eventCounts[event] == 10) {
			window.setTimeout(() => this.addMessage("Hotkeys:<br/><br/><b>Backtick (`)</b>: Select next character<br/><b>1 - 8</b>: Select the corresponding ability<br/><b>z</b>: Undo<br/><b>Enter</b>: end turn or close popup<br/><b>d</b>: end turn or close popup<br/><b>Escape</b>: close popup."), 750);
		}
		
		if (event == Tutorial.Hook.ADVENTURE_NEXTROOM && this.eventCounts[event] == 1) {
			this.addMessage("Congratulations! You have defeated the !DANGERs. Now, click a flashing diamond to select the next area. Different choices earn different rewards.");
		}
		
		if (event == Tutorial.Hook.ADVENTURE_NEXTROOM && this.eventCounts[event] == 2) {
			this.addMessage("Spend !EXPERIENCE to learn new abilities, and !HEALING to recover !FRIGHTENED or !DEFEATED !CHARACTERs.");
		}
		
		if (event == Tutorial.Hook.ADVENTURE_NEXTROOM && this.eventCounts[event] == 3) {
			this.addMessage("Your goal is to defeat the !DANGERs in the room with the !VICTORY icons before you run out of !TIME.");
		}
		
		if (event == Tutorial.Hook.ADVENTURE_END && this.eventCounts[event] == 1) {
			this.addMessage("This adventure is over! Click on the treasure chest to view the rewards you accumulated. Complete adventures to unlock new !CHARACTERs and adventures. But be careful: if you are !DEFEATED or run out of !TIME, each of your !CHARACTERs may lose an ability.");
		}
		
		if (event == Tutorial.Hook.MAINMENU_START && this.eventCounts[event] == 2) {
			this.addMessage("!CHARACTERs who successfully complete adventures can retire and pass their abilities on to another !CHARACTER. Build up a mighty team!");
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
		this.messageStack.pop();
		if (this.messageStack.length == 0) {
			this.tutorialWindow.style.display = "none";
		} else {
			this.tutorialWindow.querySelector("div").innerHTML = "";
			this.tutorialWindow.querySelector("div").appendChild(expandAbilityDetails([this.messageStack[this.messageStack.length - 1]]));
		}
	}

	isOpen() {
		return this.messageStack.length != 0;
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
}
