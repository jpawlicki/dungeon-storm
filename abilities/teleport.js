abilityData.TELEPORT = new class extends Ability {
	constructor() {
		super();
		this.name = "Teleport";
		this.icon = "M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z";
		this.minActionPoints = 1;
		this.details = ["Use ♦. Teleport to an empty space adjacent to a !FRIEND, with any facing."];
		this.aiHints = [AiHints.MOVE];
	}

	clickOnTile(unit, loc, quadrant) {
		if (!this.isLegal(unit, loc, quadrant)) return;
		return new Action(
				true,
				[
					new Effect(unit, "actionPoints", unit.actionPoints - 1),
					new Effect(unit, "pos", loc),
					new Effect(unit, "facing", quadrant),
				],
				[],
				this.name,
				() => {
					SpecialEffect.abilityUse(unit, this);
				});
	}

	mouseOverTile(unit, loc, quadrant) {
		clearClickContextActors();
		if (!this.isLegal(unit, loc, quadrant)) return;
		clickContext.actors.push(new AbilityMoveActor(unit, loc, quadrant));
	}

	isLegal(unit, loc, quadrant) {
		if (gameState.getUnitAt(loc) != null) return false;
		let hasFriend = false;
		for (let d = 0; d < 4; d++) {
			let u = gameState.getUnitAt(Tile.offset(loc, d));
			if (u != null && u.player == unit.player) hasFriend = true;
		}
		if (!hasFriend) return false;
		return true;
	}
}();
