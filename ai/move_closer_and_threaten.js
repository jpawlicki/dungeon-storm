{
	// This behavior moves closer to the closest enemy, preferring motions that put as many threatening circles as possible on enemies.
	// Ties are broken by preferring the strongest face closest to the enemy, then randomly.
	aiData.MOVE_CLOSER_AND_THREATEN = new class {
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
					let options = [];
					for (let c of coords) {
						let action = ab.clickOnTile(u, [c[0], c[1]], c[2]);
						if (action != null) options.push(action);
					}

					function actionPointless(action) {
						let outcomePos = null;
						let outcomeFacing = null;
						for (let effect of action.effects) {
							if (effect.unit == u && effect.property == "pos") outcomePos = effect.value;
							if (effect.unit == u && effect.property == "facing") outcomeFacing = effect.value;
						}
						if (outcomePos == null) outcomePos = u.pos;
						if (outcomeFacing == null) outcomeFacing = u.facing;
						return outcomePos[0] == u.pos[0] && outcomePos[1] == u.pos[1] && outcomeFacing == u.facing;
					}

					function score(action) {
						let outcomePos = null;
						let outcomeFacing = null;
						for (let effect of action.effects) {
							if (effect.unit == u && effect.property == "pos") outcomePos = effect.value;
							if (effect.unit == u && effect.property == "facing") outcomeFacing = effect.value;
						}
						if (outcomePos == null) outcomePos = u.pos;
						if (outcomeFacing == null) outcomeFacing = u.facing;
						let strengthClosest = 0;
						let minDist = Number.MAX_VALUE;
						for (let uu of currentState.units) {
							if (uu.player == u.player) continue;
							if (uu.state == Unit.State.DEFEATED) continue;
							let d = Tile.distanceBetween(uu.pos, outcomePos);
							if (d < minDist) {
								minDist = d;
								let localStrClosest = 0;
								for (let dir of Tile.directionsToLenient(outcomePos, uu.pos)) {
									let face = (4 + dir - outcomeFacing) % 4;
									localStrClosest = Math.max(localStrClosest, u.state == Unit.State.NORMAL ? u.strengths[face] : u.strengthsFrightened[face]);
								}
								strengthClosest = localStrClosest;
							}
						}
						let travel = 0;
						if (outcomePos[0] != u.pos[0] || outcomePos[1] != u.pos[1]) travel = 1;
						if (outcomeFacing != u.facing) travel += 0.1;
						let threatened = 0;
						for (let uu of currentState.units) {
							if (uu.player == u.player) continue;
							if (uu.state == Unit.State.DEFEATED) continue;
							if (Tile.distanceBetween(uu.pos, outcomePos) != 1) continue;
							let threatGroup = u.state == Unit.State.FRIGHTENED ? u.threatsFrightened : u.threats;
							let dir = (4 + Tile.directionTo(outcomePos, uu.pos) - outcomeFacing) % 4;
							if (!threatGroup[dir]) continue;
							threatened += u.state == Unit.State.NORMAL ? u.strengths[dir] : u.strengthsFrightened[dir];
						}
						return minDist * 100 - threatened - (strengthClosest / 50) + travel / 100;
					}

					if (options.length > 0) {
						options.sort((a, b) => score(a) - score(b));
						if (!actionPointless(options[0])) return options[0];
					}
				}
			}
		}
	}();
}
