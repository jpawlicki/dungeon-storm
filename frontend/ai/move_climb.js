{
	// This behavior moves to the highest elevation possible. It will not move to another space of the same elevation.
	// If there are multiple highest elevation spaces, it will choose one randomly.
	aiData.MOVE_CLIMB = new class {
		getNextMove(units, currentState) {
			for (let u of units) {
				let moveAbilities = u.abilities.filter(a => a.aiHints.includes(AiHints.MOVE));
				let currentHeight = currentState.room.getTile(u.pos).height;
				let coords = [];
				for (let i = 0; i < currentState.room.tiles.length; i++) {
					for (let j = 0; j < currentState.room.tiles[i].length; j++) {
						if (currentState.room.getTile([i, j]).height <= currentHeight) continue;
						for (let q = 0; q < 4; q++) {
							coords.push([i, j, q]);
						}
					}
				}
				Util.shuffle(coords);

				coords.sort((a, b) => currentState.room.getTile(b).height - currentState.room.getTile(a).height);
				for (let ab of moveAbilities) {
					for (let c of coords) {
						let action = ab.clickOnTile(u, [c[0], c[1]], c[2]);
						if (action != undefined) return action;
					}
				}
			}
		}
	}();
}
