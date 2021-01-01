abilityData.DISTRACT = new class extends Ability {
	constructor() {
		super();
		this.name = "Distract";
		this.icon = "M16.89,15.5L18.31,16.89C19.21,15.73 19.76,14.39 19.93,13H17.91C17.77,13.87 17.43,14.72 16.89,15.5M13,17.9V19.92C14.39,19.75 15.74,19.21 16.9,18.31L15.46,16.87C14.71,17.41 13.87,17.76 13,17.9M19.93,11C19.76,9.61 19.21,8.27 18.31,7.11L16.89,8.53C17.43,9.28 17.77,10.13 17.91,11M15.55,5.55L11,1V4.07C7.06,4.56 4,7.92 4,12C4,16.08 7.05,19.44 11,19.93V17.91C8.16,17.43 6,14.97 6,12C6,9.03 8.16,6.57 11,6.09V10L15.55,5.55Z";
		this.minActionPoints = 1;
		this.details = ["Use ♦. Rotate an adjacent !FRIEND or !ENEMY."];
		this.aiHints = [AiHints.ATTACK];
		this.cost = {experience: 3};
	}

	clickOnTile(unit, loc, quadrant) {
		if (!this.isMoveLegal(unit, loc, quadrant)) return null;
		let target = gameState.getUnitAt(loc);
		return new Action(
				true,
				[
					new Effect(target, "facing", quadrant),
					new Effect(unit, "actionPoints", unit.actionPoints - 1)
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
		clickContext.actors.push(new AbilityMoveActor(target, loc, quadrant, false));
	}

	isMoveLegal(unit, loc, quadrant) {
		if (unit.actionPoints < 1) return false;
		if (Tile.distanceBetween(unit.pos, loc) != 1) return false;
		let dstUnit = gameState.getUnitAt(loc);
		if (dstUnit == null) return false;
		return true;
	}
}();
