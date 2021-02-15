{
	// Use the first buff ability on a random allied unit.
	// Will not use an ability on another unit that has the same ability, to avoid infinite looping.
	aiData.BUFF_RANDOM = new class {
		getNextMove(units, currentState) {
			for (let u of units) {
				let abilities = u.abilities.filter(a => a.aiHints.includes(AiHints.BUFF));
				let coords = [];
				for (let ab of abilities) {
					let units = [];
					for (let e of currentState.units.filter(t => t.state != Unit.State.DEFEATED && !t.abilities.includes(ab) && t.player == u.player)) units.push(e);
					Util.shuffle(units);
					for (let e of units) {
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
