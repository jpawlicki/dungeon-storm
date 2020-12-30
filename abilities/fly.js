abilityData.FLY = new class extends Ability {
	constructor() {
		super();
		this.name = "Fly";
		this.icon = "M22,2C22,2 14.36,1.63 8.34,9.88C3.72,16.21 2,22 2,22L3.94,21C5.38,18.5 6.13,17.47 7.54,16C10.07,16.74 12.71,16.65 15,14C13,13.44 11.4,13.57 9.04,13.81C11.69,12 13.5,11.6 16,12L17,10C15.2,9.66 14,9.63 12.22,10.04C14.19,8.65 15.56,7.87 18,8L19.21,6.07C17.65,5.96 16.71,6.13 14.92,6.57C16.53,5.11 18,4.45 20.14,4.32C20.14,4.32 21.19,2.43 22,2Z";
		this.minActionPoints = 1;
		this.details = [
			"Spend ♦ and either:",
			"  1. !MOVE to an adjacent empty space, and rotate.",
			"  2. Rotate in the same space.",
			"If you !MOVE to a space of lower elevation, gain ♦."];
		this.aiHints = [AiHints.MOVE];
		this.cost = {experience: 3};
	}

	clickOnTile(unit, loc, quadrant) {
		if (!this.isMoveLegal(unit, loc, quadrant)) return null;

		let effects = [
			new Effect(unit, "pos", loc),
			new Effect(unit, "facing", quadrant),
		];

		if (gameState.room.getTile(unit.pos).height <= gameState.room.getTile(loc).height) {
			effects.push(new Effect(unit, "actionPoints", unit.actionPoints - 1));
		}

		return new Action(
				true,
				effects,
				loc[0] == unit.pos[0] && loc[1] == unit.pos[1] ? [] : [ActionEvent.move(unit, unit.pos, loc)],
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
		if (Math.abs(unit.pos[0] - loc[0]) + Math.abs(unit.pos[1] - loc[1]) > 1) return false;
		let dstUnit = gameState.getUnitAt(loc);
		if (dstUnit != null && dstUnit != unit) return false;
		return true;
	}
}();
