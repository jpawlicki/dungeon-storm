class Persistence {
	static deleteAll() {
		try {
			localStorage.clear();
		} catch (exception) {
			console.log("Exception while loading: ", exception);
		}
	}

	static save() {
		try {
			localStorage.setItem("savedgame", gameState.serialize());
			if (tutorial) localStorage.setItem("tutorialCounts", JSON.stringify(tutorial.eventCounts));
		} catch (exception) {
			// Do nothing.
		}
	}

	static saveSoundPref() {
		try {
			localStorage.setItem("soundEnabled", Sound.enabled);
		} catch (exception) {
			// Do nothing.
		}
	}

	static load() {
		if (tutorial != null) {
			let tutVal = localStorage.getItem("tutorialCounts");
			if (tutVal != null) {
				tutorial.eventCounts = JSON.parse(tutVal);
			}
		}
		let soundEnabled = localStorage.getItem("soundEnabled");
		if (soundEnabled != null) {
			Sound.setEnabled(soundEnabled);
		}
		let val = null;
		try {
			val = localStorage.getItem("savedgame");
		} catch (exception) {
			console.log("Exception while loading: ", exception);
		}
		if (val != null) {
			gameState = GameState.deserialize(val);
			if (gameState.currentRoom) {
				setupRoomSituation();
			} else if (gameState.adventure) {
				hideSidePane();
				document.querySelector("#mapDiv").innerHTML = "";
				document.querySelector("#mapDiv").appendChild(document.createElement("adventure-nextroom-element"));
			} else {
				setupMainMenu();
			}
		} else {
			gameState = new GameState();

			if (location.protocol == "file:") {
				// For playtesting
				for (let a in adventureData) gameState.unlockedAdventures.push(a);
				for (let c in characterData) {
					gameState.unlockedCharacters.push(c);
					gameState.characterPool.push(new Unit(characterData[c]));
				}
			} else {
				gameState.characterPool.push(new Unit(characterData["Wisher"]));
				gameState.characterPool.push(new Unit(characterData["Dog"]));
				gameState.unlockedAdventures.push("GARDEN");
				gameState.unlockedCharacters.push("Dog");
				gameState.unlockedCharacters.push("Wisher");
			}

			setupMainMenu();
		}
	}
}
