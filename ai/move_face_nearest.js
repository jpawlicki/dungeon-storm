{
	// This behavior identifies the set of closest enemies and turns to face one of them.
	// The closest enemies are the enemies at the shortest distance.
	// If there are closest enemies in a direct line, turn to face one of them.
	// Enemies on a pure diagonal are considered faced in both directions.
	// If there are multiple acceptable facings, will prefer the current facing, else choose one randomly.
	// This behavior will only yield an action if there is an action that does not change the position (but does change the facing correctly).
	aiData.MOVE_FACE_NEAREST = new class {
		getNextMove(units, currentState) {
			for (let u of units) {
				let objectiveFacings = new Set();

				{ // Calculate objectiveFacings.
					let closeUnits = [];
					for (let uu of currentState.units) {
						if (uu.player == u.player) continue;
						closeUnits.push(uu);
					}
					closeUnits.sort((a, b) => {
						let da = Tile.distanceBetween(u.pos, a.pos);
						let db = Tile.distanceBetween(u.pos, b.pos);
						if (da != db) return da - db;
					});
					if (closeUnits.length != 0) {
						let d = Tile.distanceBetween(u.pos, closeUnits[0].pos);
						closeUnits = closeUnits.filter(uu => Tile.distanceBetween(uu.pos, u.pos) == d);

						let directCloseUnits = closeUnits.filter(uu => Tile.directionTo(u.pos, uu.pos) != -1);
						if (directCloseUnits.length != 0) closeUnits = directCloseUnits;

						function directionToLenient(loc) {
							let directions = [];
							let offsetX = loc[0] - u.pos[0];
							let offsetY = loc[1] - u.pos[1];
							if (offsetX < 0 && Math.abs(offsetX) >= Math.abs(offsetY)) directions.push(0);
							if (offsetY > 0 && Math.abs(offsetY) >= Math.abs(offsetX)) directions.push(1);
							if (offsetX > 0 && Math.abs(offsetX) >= Math.abs(offsetY)) directions.push(2);
							if (offsetY < 0 && Math.abs(offsetY) >= Math.abs(offsetX)) directions.push(3);
							return directions;
						}

						for (let uu of closeUnits) for (let d of directionToLenient(uu.pos)) objectiveFacings.add(d);
					}
				}

				if (objectiveFacings.has(u.facing)) return;

				let moveAbilities = u.abilities.filter(a => a.aiHints.includes(AiHints.MOVE));
				let coords = [];
				for (let i = 0; i < currentState.room.tiles.length; i++) {
					for (let j = 0; j < currentState.room.tiles.length; j++) {
						for (let q = 0; q < 4; q++) {
							coords.push([i, j, q]);
						}
					}
				}
				function shuffle(array) {
					for (var i = array.length - 1; i > 0; i--) {
							var j = Math.floor(Math.random() * (i + 1));
							var temp = array[i];
							array[i] = array[j];
							array[j] = temp;
					}
				}
				shuffle(coords);
				for (let ab of moveAbilities) {
					for (let c of coords) {
						let action = ab.clickOnTile(u, [c[0], c[1]], c[2]);
						if (action != undefined) {
							let actionChangesPos = false;
							let actionChangesFacingOK = false;
							for (let ef of action.effects) {
								if (ef.unit != u) continue;
								if (ef.property == "pos" && (ef.value[0] != u.pos[0] || ef.value[1] != u.pos[1])) actionChangesPos = true;
								if (ef.property == "facing" && objectiveFacings.has(ef.value)) actionChangesFacingOK = true;
							}
							if (!actionChangesPos && actionChangesFacingOK)	return action;
						}
					}
				}
			}
		}
	}();
}
