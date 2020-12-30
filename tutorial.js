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
		this.tutorialWindow.style.right = 0;
		this.tutorialWindow.style.bottom = 0;
		this.tutorialWindow.style.borderRadius = "2em 0 0 0";
		this.tutorialWindow.style.backgroundColor = "#000";
		this.tutorialWindow.style.maxWidth = "30em";
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
		closeSvg.style.height = "1em";
		closeSvg.style.width = "1em";
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
			this.addMessage("Welcome! Tutorial text will appear here. To get started, click on two characters to select them and then press play. You can also mouse over the characters' abilities to learn more about them.");
		}
		
		if (event == Tutorial.Hook.ROOM_LOAD && this.eventCounts[event] == 1) {
			this.addMessage("You are in a room with danger. You must defeat the dangers to proceed. Select an ability on one of your characters, then click a tile on the map to use it.");
		}
		
		if (event == Tutorial.Hook.ACTION_TAKEN && this.eventCounts[event] == 1) {
			this.addMessage("You have used an ability that costs ♦. ♦ are replenished at the end of your turn. If you make a mistake, most actions can be undone by clicking the undo arrow above your characters. Keep taking actions to defeat the dangers, and when you are ready, end your turn by clicking the check above your characters to regain ♦.");
		}
		
		if (event == Tutorial.Hook.ACTION_TAKEN && this.eventCounts[event] == 2) {
			this.addMessage("Tip: Avoid spending your final ♦ on an attack: if you lose the dice roll, your character must use an ability to retreat or be defeated, and if they don't have a ♦ to spend, they won't be able to use an ability to retreat.");
		}
		
		if (event == Tutorial.Hook.ACTION_TAKEN && this.eventCounts[event] == 6) {
			this.addMessage("You can end your turn by pressing 'Enter' on the keyboard or by clicking the check mark above your characters.");
		}
		
		if (event == Tutorial.Hook.ACTION_TAKEN && this.eventCounts[event] == 10) {
			this.addMessage("Other hotkeys: you can use number keys to switch abilities of the currently-selected character, and the backtick (`) key to cycle through your characters. You can undo actions by pressing 'z'.");
		}
		
		if (event == Tutorial.Hook.ADVENTURE_NEXTROOM && this.eventCounts[event] == 1) {
			this.addMessage("Congratulations! You have defeated the dangers in the room. Now, you can select the next room go to by clicking a flashing diamond. Different rooms have different rewards.");
		}
		
		if (event == Tutorial.Hook.ADVENTURE_NEXTROOM && this.eventCounts[event] == 2) {
			this.addMessage("Your characters can spend experience rewards to permanently learn new abilities, or healing rewards to recover from injury or defeat.");
		}
		
		if (event == Tutorial.Hook.ADVENTURE_NEXTROOM && this.eventCounts[event] == 3) {
			this.addMessage("Your goal is to defeat the dangers in the room with the victory cup rewards.");
		}
		
		if (event == Tutorial.Hook.ADVENTURE_END && this.eventCounts[event] == 1) {
			this.addMessage("Caution: when you are defeated in an adventure, your characters each lose an ability. This loss is permanent - try to avoid this.");
			this.addMessage("This adventure is over! All adventures yield rewards (unless you are defeated in the very first room - it happens), but successful adventures yield more. Click on the treasure chest to view your rewards. Accumulate rewards to unlock new character types and new adventures.");
		}
		
		if (event == Tutorial.Hook.MAINMENU_START && this.eventCounts[event] == 1) {
			this.addMessage("In between adventures, you can retire your characters. Retiring characters pass on the abilities they know to another character (though the character must still spend experience to learn them). Build up a mighty group!");
		}
	}

	addMessage(msg) {
		this.messageStack.push(msg);
		this.tutorialWindow.querySelector("div").textContent = this.messageStack[this.messageStack.length - 1];
		this.tutorialWindow.style.display = "block";
	}

	tutorialClose() {
		this.messageStack.pop();
		if (this.messageStack.length == 0) {
			this.tutorialWindow.style.display = "none";
		} else {
			this.tutorialWindow.querySelector("div").textContent = this.messageStack[this.messageStack.length - 1];
		}
	}
}
