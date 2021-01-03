{
	// Use the first attack ability on a threatened unit.
	aiData.ATTACK_THREATENED = new class {
		getNextMove(units, currentState) {
			for (let u of units) {
				let targets = currentState.units.filter(t => u.threatens(t, t.pos));
				for (let ab of u.abilities.filter(a => a.aiHints.includes(AiHints.ATTACK))) {
					for (let e of targets) {
						for (let q = 0; q < 4; q++) {
							let action = ab.clickOnTile(u, e.pos, (q + u.facing) % 4);
							if (action != undefined) return action;
						}
					}
				}
			}
		}
	}();
}
