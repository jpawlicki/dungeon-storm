abilityData.SLOW = new class extends Ability {
	constructor() {
		super();
		this.name = "Slow";
		this.icon = "M14,19H18V5H14M6,19H10V5H6V19Z";
		this.minActionPoints = 1;
		this.details = [
			"Spend ♦. Select an adjacent !ENEMY with ♦. They spend ♦."];
		this.aiHints = [];
		this.cost = {experience: 3};
	}

	clickOnTile(unit, loc, quadrant) {
		if (!this.isMoveLegal(unit, loc, quadrant)) return null;
		let target = gameState.getUnitAt(loc);
		return new Action(
				true,
				[
					new Effect(unit, "actionPoints", unit.actionPoints - 1),
					new Effect(target, "actionPoints", target.actionPoints - 1),
				],
				[],
				this.name,
				() => {
					SpecialEffect.abilityUse(unit, this);
				});
	}

	mouseOverTile(unit, loc, quadrant) {
		clearClickContextActors();
		if (!this.isMoveLegal(unit, loc, quadrant)) return;
		let target = gameState.getUnitAt(loc);
		clickContext.actors.push(new AbilityMoveActor(unit, unit.pos, unit.facing));
		clickContext.actors.push(new AbilityMoveActor(target, target.pos, target.facing));
	}

	isMoveLegal(unit, loc, quadrant) {
		if (unit.actionPoints < 1) return false;
		if (Tile.distanceBetween(unit.pos, loc) != 1) return false;
		let target = gameState.getUnitAt(loc);
		if (target == null) return false;
		if (gameState.getUnitAt(loc).actionPoints < 1) return false;
		return true;
	}
}();
