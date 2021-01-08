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

				function moveOutcome(action) {
					let outcomePos = null;
					let outcomeFacing = null;
					let cp = false;
					let cf = false;
					for (let effect of action.effects) {
						if (effect.unit == u && effect.property == "pos") outcomePos = effect.value;
						if (effect.unit == u && effect.property == "facing") outcomeFacing = effect.value;
					}
					if (outcomePos == null) {
						outcomePos = u.pos;
					} else {
						cp = true;
					}
					if (outcomeFacing == null) {
						outcomeFacing = u.facing;
					} else {
						cf = true;
					}
					return {
						"pos": outcomePos,
						"facing": outcomeFacing,
						"posSet": cp,
						"facingSet": cf,
					};
				}

				function countThreats(loc, facing) {
					let num = 0;
					for (let i = 0; i < 4; i++) {
						let t = Tile.offset(loc, i);
						let dir = (4 + i - facing) % 4;
						let threatGroup = u.state == Unit.State.FRIGHTENED ? u.threatsFrightened : u.threats;
						if (!threatGroup[dir]) continue;
						if (!Tile.inBounds(t)) continue;
						let unit = currentState.getUnitAt(t);
						if (unit == null || unit.player == u.player) continue;
						num += Unit.State.FRIGHTENED ? u.strengthsFrightened[dir] : u.strengths[dir];
					}
					return num;
				}

				function getClosestEnemy(loc) {
					let minDist = Number.MAX_VALUE;
					let minUnit = null;
					for (let uu of currentState.units) {
						if (uu.player == u.player) continue;
						if (uu.state == Unit.State.DEFEATED) continue;
						let d = Tile.distanceBetween(uu.pos, loc);
						if (d < minDist) {
							minDist = d;
							minUnit = uu;
						}
					}
					return minUnit;
				}

				function scoreFacingToUnit(unit, loc, facing) {
					let str = 0;
					for (let dir of Tile.directionsToLenient(loc, unit.pos)) {
						let face = (4 + dir - facing) % 4;
						str = Math.max(str, u.state == Unit.State.NORMAL ? u.strengths[face] : u.strengthsFrightened[face]);
					}
					return str;
				}

				function evaluate(action) {
					let outcome = moveOutcome(action);
					return {
					 "dist": Tile.distanceBetween(outcome.pos, getClosestEnemy(outcome.pos).pos),
					 "threat": countThreats(outcome.pos, outcome.facing),
					 "strength": scoreFacingToUnit(getClosestEnemy(outcome.pos), outcome.pos, outcome.facing),
					};
				}

				let maxDist = Tile.distanceBetween(u.pos, getClosestEnemy(u.pos).pos);
				let minThreat = countThreats(u.pos, u.facing);
				let minStrength = scoreFacingToUnit(getClosestEnemy(u.pos), u.pos, u.facing);

				function actionPointless(action) {
					let o = evaluate(action);

					if (o.dist < maxDist) return false;
					if (o.dist > maxDist) return true;
					if (o.threat < minThreat) return true;
					if (o.threat > minThreat) return false;
					if (o.strength < minStrength) return true;
					if (o.strength > minStrength) return false;
					return true;
				}

				for (let ab of u.abilities.filter(a => a.aiHints.includes(AiHints.MOVE))) {
					let options = [];
					for (let c of coords) {
						let action = ab.clickOnTile(u, [c[0], c[1]], c[2]);
						if (action != null && !actionPointless(action)) options.push(action);
					}

					function compare(a1, a2) {
						let o1 = evaluate(a1);
						let o2 = evaluate(a2);
						if (o1.dist < o2.dist) return -1;
						if (o1.dist > o2.dist) return 1;
						if (o1.threat < o2.threat) return 1;
						if (o1.threat > o2.threat) return -1;
						if (o1.strength < o2.strength) return 1;
						if (o1.strength > o2.strength) return -1;
						return 0;
					}

					if (options.length > 0) {
						options.sort((a, b) => compare(a, b));
						return options[0];
					}
				}
			}
		}
	}();
}
