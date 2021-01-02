class Tutorial {
	// eventCounts
	// messageStack
	// tutorialWindow

	static Hook = {
		ADVENTURE_START: 0,
		ADVENTURE_NEXTROOM: 1,
		ADVENTURE_END: 2,
		ROOM_LOAD: 3,
		ACTION_TAKEN: 4,
		UNIT_BLOODIED: 5, // NYI
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
	}

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
		this.tutorialWindow.style.padding = "1em";
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
		
		if (event == Tutorial.Hook.ADVENTURE_START && this.eventCounts[event] == 1) {
			this.addMessage("Welcome! To get started, click on two !CHARACTERs and press play. To learn more about abilities, mouse over the icons beside the !CHARACTERs.");
		}
		
		if (event == Tutorial.Hook.ROOM_LOAD && this.eventCounts[event] == 1) {
			this.addMessage("You must defeat the !DANGERs to proceed. Select a character ability, then click on a space to use it.");
		}
		
		if (event == Tutorial.Hook.ACTION_TAKEN && this.eventCounts[event] == 1) {
			window.setTimeout(() => this.addMessage("Using abilities costs ♦. ♦ are replenished when you end your turn. Most actions can be undone by clicking the undo arrow in the upper left. Continue using abilities to !DEFEAT the !DANGERs. When you are ready, end your turn by clicking the check mark in the upper left."), 750);
		}
		
		if (event == Tutorial.Hook.ACTION_TAKEN && this.eventCounts[event] == 2) {
			window.setTimeout(() => this.addMessage("Tip: Avoid spending your final ♦ on an attack: if you lose the ⚅ roll, your character must !RETREAT. If they don't have another ♦ to retreat, they will be !DEFEATed."), 750);
		}
		
		if (event == Tutorial.Hook.ACTION_TAKEN && this.eventCounts[event] == 10) {
			window.setTimeout(() => this.addMessage("Hotkeys:<br/>Backtick (`): Select next character<br/>1 - 8<br/>Select the corresponding ability<br/>z: Undo<br/>Enter: end turn or close popup<br/>d: end turn or close popup<br/>Escape: close popup."), 750);
		}
		
		if (event == Tutorial.Hook.ADVENTURE_NEXTROOM && this.eventCounts[event] == 1) {
			this.addMessage("Congratulations! You have defeated the !DANGERs. Now, click a flashing diamond to select the next area. Different rooms have different rewards.");
		}
		
		if (event == Tutorial.Hook.ADVENTURE_NEXTROOM && this.eventCounts[event] == 2) {
			this.addMessage("Spend !EXPERIENCE to learn new abilities, and !HEALING to recover !FRIGHTENED or !DEFEATED !CHARACTERs.");
		}
		
		if (event == Tutorial.Hook.ADVENTURE_NEXTROOM && this.eventCounts[event] == 3) {
			this.addMessage("Your goal is to defeat the !DANGERs in the room with the victory cups.");
		}
		
		if (event == Tutorial.Hook.ADVENTURE_END && this.eventCounts[event] == 1) {
			this.addMessage("Caution: when you are defeated in an adventure, your characters each lose an ability. This loss is permanent - try to avoid this.");
			this.addMessage("This adventure is over! All adventures yield rewards (unless you are defeated in the very first room - it happens), but successful adventures yield more. Click on the treasure chest to view your rewards. Accumulate rewards to unlock new character types and new adventures.");
		}
		
		if (event == Tutorial.Hook.MAINMENU_START && this.eventCounts[event] == 1) {
			this.addMessage("In between adventures, you can retire your characters. Retiring characters pass on the abilities they know to another character (though the character must still spend experience to learn them). Build up a mighty group!");
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
	}

	addMessage(msg) {
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
