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

	static load() {
		if (tutorial != null) {
			let tutVal = localStorage.getItem("tutorialCounts");
			if (tutVal != null) {
				tutorial.eventCounts = JSON.parse(tutVal);
			}
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
			gameState.characterPool.push(new Unit(characterData["Wisher"]));
			gameState.characterPool.push(new Unit(characterData["Dog"]));

			gameState.unlockedAdventures.push("GARDEN");
			gameState.unlockedCharacters.push("Dog");
			gameState.unlockedCharacters.push("Wisher");

			// For playtesting
			/*
			gameState.unlockedAdventures.push("FOREST");
			gameState.unlockedAdventures.push("CEREMONY");
			gameState.characterPool.push(new Unit(characterData["Journeyman"]));
			gameState.characterPool.push(new Unit(characterData["Dancer"]));
			gameState.characterPool.push(new Unit(characterData["Berserker"]));
			gameState.characterPool.push(new Unit(characterData["Thief"]));
			gameState.characterPool.push(new Unit(characterData["Archer"]));
			*/

			setupMainMenu();
		}
	}
}
