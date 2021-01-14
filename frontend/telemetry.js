class Telemetry {
	static send(message) {
		if (window.location.protocol == "file:") return;
		let req = new XMLHttpRequest();
		// If you clone this, please change the below URL to point to your server.
		req.open("POST", "https://dungeon-storm.uk.r.appspot.com/metric_report");
		req.setRequestHeader("API-Key", "DS Telemetry");
		req.send(message);
	}

	static reportRoomOutcome(victory) {
		let msg = {
			"version": versionId,
			"roomOutcome": victory,
			"roomPos": gameState.currentRoom,
			"room": gameState.adventure.rooms[gameState.currentRoom[0]][gameState.currentRoom[1]].id,
		};
		Telemetry.addCommonData(msg);
		Telemetry.send(JSON.stringify(msg));
	}

	static reportAdventureOutcome(victory) {
		let msg = {
			"adventureOutcome": victory
		};
		Telemetry.addCommonData(msg);
		Telemetry.send(JSON.stringify(msg));
	}

	static addCommonData(m) {
		m.version = versionId; // version.js
		m.totalRooms = gameState.totalRooms;
		m.numUnlocksEarned = gameState.numUnlocksEarned;
		m.adventure = gameState.adventure.id;
		m.timeRemaining = gameState.resources.time;
		m.characters = [];
		for (let c of gameState.characters) {
			m.characters.push({
				"id": c.id,
				"state": c.state,
				"abilities": c.abilities.map(a => a.name)
			});
		}
	}
}
