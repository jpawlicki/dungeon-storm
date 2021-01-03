{
	// Use the first attack ability on the closest unit.
	// Ties are broken by unit order (player units first, etc).
	aiData.ATTACK_NEAREST = new class {
		getNextMove(units, currentState) {
			for (let u of units) {
				for (let e of currentState.units.map(t => { return {unit: t, dist: Tile.distanceBetween(u.pos, t.pos)} }).sort((a, b) => a.dist - b.dist).map(e => e.unit)) {
					for (let ab of u.abilities.filter(a => a.aiHints.includes(AiHints.ATTACK))) {
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
