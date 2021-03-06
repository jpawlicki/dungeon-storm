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
						if (uu.state == Unit.State.DEFEATED) continue;
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

						for (let uu of closeUnits) for (let d of Tile.directionsToLenient(u.pos, uu.pos)) objectiveFacings.add(d);
					}
				}

				if (objectiveFacings.has(u.facing)) return;

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
