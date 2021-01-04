{
	// This behavior maximizes distance from enemies, otherwise moving randomly.
	// If no move takes the unit further away, it will not act.
	aiData.MOVE_FLEE = new class {
		getNextMove(units, currentState) {
			for (let u of units) {
				let coords = [];
				for (let i = 0; i < currentState.room.tiles.length; i++) {
					for (let j = 0; j < currentState.room.tiles[i].length; j++) {
						for (let q = 0; q < 4; q++) {
							coords.push([i, j, q]);
						}
					}
				}
				Util.shuffle(coords);

				for (let ab of u.abilities.filter(a => a.aiHints.includes(AiHints.MOVE))) {
					function getDistToClosestFoe(pos) {
						let minDist = Number.MAX_VALUE; 
						for (let uu of currentState.units) {
							if (uu.player == u.player) continue;
							if (uu.state == Unit.State.DEFEATED) continue;
							let d = Tile.distanceBetween(uu.pos, pos);
							if (d < minDist) {
								minDist = d;
							}
						}
						return minDist;
					}

					let cutoffDist = getDistToClosestFoe(u.pos);

					function actionPointless(action) {
						let outcomePos = null;
						for (let effect of action.effects) {
							if (effect.unit == u && effect.property == "pos") outcomePos = effect.value;
						}
						if (outcomePos == null) outcomePos = u.pos;
						return getDistToClosestFoe(outcomePos) <= cutoffDist;
					}

					for (let c of coords) {
						let action = ab.clickOnTile(u, [c[0], c[1]], c[2]);
						if (action != null && !actionPointless(action)) return action;
					}
				}
			}
		}
	}();
}
