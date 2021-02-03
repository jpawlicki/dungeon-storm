abilityData.CHALLENGE = new class extends Ability {
	constructor() {
		super();
		this.name = "Challenge";
		this.icon = "M11,17H4A2,2 0 0,1 2,15V3A2,2 0 0,1 4,1H16V3H4V15H11V13L15,16L11,19V17M19,21V7H8V13H6V7A2,2 0 0,1 8,5H19A2,2 0 0,1 21,7V21A2,2 0 0,1 19,23H8A2,2 0 0,1 6,21V19H8V21H19Z";
		this.minActionPoints = 1;
		this.details = ["Use ♦. Teleport to an empty space !THREATENED by an !ENEMY, with any facing."];
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
		if (unit.actionPoints < 1) return false;
		let hasEnemyThreat = false;
		for (let d = 0; d < 4; d++) {
			let u = gameState.getUnitAt(Tile.offset(loc, d));
			if (u != null && u.threatens(unit, loc)) hasEnemyThreat = true;
		}
		if (!hasEnemyThreat) return false;
		return true;
	}
}();
