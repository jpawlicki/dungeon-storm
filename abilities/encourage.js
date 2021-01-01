abilityData.ENCOURAGE = new class extends Ability {
	constructor() {
		super();
		this.name = "Encourage";
		this.icon = "M21,9L17,5V8H10V10H17V13M7,11L3,15L7,19V16H14V14H7V11Z";
		this.minActionPoints = 1;
		this.details = [
			"Give ♦ to an adjacent !FRIEND."];
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
					new Effect(target, "actionPoints", target.actionPoints + 1),
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
		clickContext.actors.push(new AbilityMoveActor(target, target.pos, target.facing, false, u => u.actionPoints++));
	}

	isMoveLegal(unit, loc, quadrant) {
		if (unit.actionPoints < 1) return false;
		if (Tile.distanceBetween(unit.pos, loc) != 1) return false;
		if (gameState.getUnitAt(loc) == null) return false;
		return true;
	}
}();
