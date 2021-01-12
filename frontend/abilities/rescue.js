abilityData.RESCUE = new class extends Ability {
	constructor() {
		super();
		this.name = "Rescue";
		this.icon = "M20 14H14V20H10V14H4V10H10V4H14V10H20V14Z"
		this.minActionPoints = 2;
		this.details = [
			"Use ♦♦. Select a !FRIEND. That !FRIEND teleports to a random open space that is not !THREATENED by a !ENEMY.",
			"Cannot be undone."];
		this.aiHints = [];
	}

	clickOnTile(unit, loc, quadrant) {
		if (!this.isActionLegal(unit, loc, quadrant)) return;
		let target = gameState.getUnitAt(loc);
		let dests = this.getPossibleDests(target);
		Util.shuffle(dests);

		let effects = [
			new Effect(unit, "actionPoints", unit.actionPoints - 2),
			new Effect(target, "pos", dests[0]),
		];
		let events = [];

		return new Action(false, effects, events, this.name, () => {
			SpecialEffect.abilityUse(unit, this);
		});
	}

	mouseOverTile(unit, loc, quadrant) {
		clearClickContextActors();
		if (!this.isActionLegal(unit, loc, quadrant)) return;
		let target = gameState.getUnitAt(loc);
		for (let p of this.getPossibleDests(target)) clickContext.actors.push(new AbilityMoveActor(target, p, target.facing, false));
	}

	isActionLegal(unit, loc, quadrant) {
		if (unit.actionPoints < 2) return false;
		let target = gameState.getUnitAt(loc);
		if (target == null) return false;
		if (target.player != unit.player) return false;
		if (this.getPossibleDests(target).length == 0) return false;
		return true;
	}

	getPossibleDests(unit) {
		let dests = [];
		for (let i = 0; i < gameState.room.tiles.length; i++) {
			for (let j = 0; j < gameState.room.tiles[i].length; j++) {
				let threatened = false;
				for (let u of gameState.units) {
					if (u.state != Unit.State.DEFEATED && u.pos[0] == i && u.pos[1] == j) threatened = true;
					if (u.threatens(unit, [i, j])) threatened = true;
				}
				if (!threatened) dests.push([i, j]);
			}
		}
		return dests;
	}
}();
