{
	aiData.ATTACK_NEAREST = new class {
		getNextMove(units, currentState) {
			for (let u of units) {
				let enemyUnits = currentState.units.filter(t => ((u.player == 1 && t.player != 1) || (u.player == 2 && t.player == 1)));
				let attackAbilities = u.abilities.filter(a => a.aiHints.includes(AiHints.ATTACK));
				enemyUnits.map(t => { return {unit: t, dist: Tile.distanceBetween(u.pos, t.pos)} }).sort((a, b) => a.dist - b.dist).map(e => e.unit);
				for (let e of enemyUnits) {
					for (let ab of attackAbilities) {
						for (let q = 0; q < 4; q++) {
							let action = ab.clickOnTile(u, e.pos, q);
							if (action != undefined) return action;
						}
					}
				}
			}
		}
	}();
}
