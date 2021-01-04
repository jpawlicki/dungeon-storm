{
	// This behavior moves randomly.
	aiData.MOVE_RANDOMLY = new class {
		getNextMove(units, currentState) {
			for (let u of units) {
				let moveAbilities = u.abilities.filter(a => a.aiHints.includes(AiHints.MOVE));
				let coords = [];
				for (let i = 0; i < currentState.room.tiles.length; i++) {
					for (let j = 0; j < currentState.room.tiles[i].length; j++) {
						for (let q = 0; q < 4; q++) {
							coords.push([i, j, q]);
						}
					}
				}
				Util.shuffle(coords);
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
