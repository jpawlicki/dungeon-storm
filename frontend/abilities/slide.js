abilityData.SLIDE = new class extends Ability {
	constructor() {
		super();
		this.name = "Slide";
		this.icon = "M17.45,17.55L12,23L6.55,17.55L7.96,16.14L11,19.17V4.83L7.96,7.86L6.55,6.45L12,1L17.45,6.45L16.04,7.86L13,4.83V19.17L16.04,16.14L17.45,17.55ZM6.45,17.45L1,12L6.45,6.55L7.86,7.96L4.83,11H19.17L16.14,7.96L17.55,6.55L23,12L17.55,17.45L16.14,16.04L19.17,13H4.83L7.86,16.04L6.45,17.45Z";
		this.minActionPoints = 1;
		this.details = ["Use ♦. !MOVE to a nearest diagonal empty space and rotate. Cannot rise more than 1 step."];
		this.aiHints = [AiHints.MOVE];
	}

	clickOnTile(unit, loc, quadrant) {
		if (!this.isMoveLegal(unit, loc, quadrant)) return null;
		return new Action(
				true,
				[
					new Effect(unit, "pos", loc),
					new Effect(unit, "facing", quadrant),
					new Effect(unit, "actionPoints", unit.actionPoints - 1)
				],
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
		if (Tile.distanceBetween(unit.pos, loc) != 2) return false;
		if (Tile.directionTo(unit.pos, loc) != -1) return false;
		if (gameState.room.getTile(unit.pos).height < gameState.room.getTile(loc).height - 1) return false;
		let dstUnit = gameState.getUnitAt(loc);
		if (dstUnit != null && dstUnit != unit) return false;
		return true;
	}
}();
