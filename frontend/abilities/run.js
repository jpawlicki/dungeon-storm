abilityData.RUN = new class extends Ability {
	constructor() {
		super();
		this.name = "Run";
		this.icon = "M13.5,5.5C14.59,5.5 15.5,4.58 15.5,3.5C15.5,2.38 14.59,1.5 13.5,1.5C12.39,1.5 11.5,2.38 11.5,3.5C11.5,4.58 12.39,5.5 13.5,5.5M9.89,19.38L10.89,15L13,17V23H15V15.5L12.89,13.5L13.5,10.5C14.79,12 16.79,13 19,13V11C17.09,11 15.5,10 14.69,8.58L13.69,7C13.29,6.38 12.69,6 12,6C11.69,6 11.5,6.08 11.19,6.08L6,8.28V13H8V9.58L9.79,8.88L8.19,17L3.29,16L2.89,18L9.89,19.38Z";
		this.minActionPoints = 1;
		this.details = [
			"Use ♦. !MOVE to an adjacent empty space and rotate. If ⚅ is greater than 3, gain ♦",
			"Cannot rise more than 1 step.",
			"Cannot be undone."];
		this.aiHints = [AiHints.MOVE];
	}

	clickOnTile(unit, loc, quadrant) {
		if (!this.isMoveLegal(unit, loc, quadrant)) return null;

		let effects = [
			new Effect(unit, "pos", loc),
			new Effect(unit, "facing", quadrant),
		];

		if (Util.roll() <= 3) {
			effects.push(new Effect(unit, "actionPoints", unit.actionPoints - 1));
		}

		return new Action(
				false,
				effects,
				[ActionEvent.move(unit, unit.pos, loc)],
				this.name,
				() => {
					SpecialEffect.abilityUse(unit, this);
				});
	}

	mouseOverTile(unit, loc, quadrant) {
		clearClickContextActors();
		if (!this.isMoveLegal(unit, loc, quadrant)) return;
		clickContext.actors.push(new AbilityMoveActor(unit, loc, quadrant));
	}

	isMoveLegal(unit, loc, quadrant) {
		if (unit.actionPoints < 1) return false;
		if (Tile.distanceBetween(unit.pos, loc) != 1) return false;
		if (gameState.room.getTile(unit.pos).height < gameState.room.getTile(loc).height - 1) return false;
		let dstUnit = gameState.getUnitAt(loc);
		if (dstUnit != null) return false;
		return true;
	}
}();
