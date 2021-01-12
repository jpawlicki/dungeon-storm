abilityData.TAUNT = new class extends Ability {
	constructor() {
		super();
		this.name = "Taunt";
		this.icon = "M11.92,19.92L4,12L11.92,4.08L13.33,5.5L7.83,11H22V13H7.83L13.34,18.5L11.92,19.92M4,12V2H2V22H4V12Z"
		this.minActionPoints = 1;
		this.details = [
			"Use ♦. Select a !ENEMY in a straight line. That !ENEMY !MOVEs toward this !FRIEND.",
			"The !ENEMY cannot rise more than 1 step.",
			"The !ENEMY cannot enter an occupied space."];
		this.aiHints = [AiHints.ATTACK];
	}

	clickOnTile(unit, loc, quadrant) {
		if (!this.isActionLegal(unit, loc, quadrant)) return;
		let target = gameState.getUnitAt(loc);
		let dstPos = Tile.offset(target.pos, Tile.directionTo(loc, unit.pos));

		let effects = [
			new Effect(unit, "actionPoints", unit.actionPoints - 1),
			new Effect(target, "pos", dstPos),
		];
		let events = [
			ActionEvent.move(target, target.pos, dstPos),
		];

		return new Action(true, effects, events, this.name, () => {
			SpecialEffect.abilityUse(unit, this);
		});
	}

	mouseOverTile(unit, loc, quadrant) {
		clearClickContextActors();
		if (!this.isActionLegal(unit, loc, quadrant)) return;
		let target = gameState.getUnitAt(loc);
		clickContext.actors.push(new AbilityMoveActor(target, Tile.offset(loc, Tile.directionTo(loc, unit.pos)), target.facing, false));
	}

	isActionLegal(unit, loc, quadrant) {
		if (unit.actionPoints < 1) return false;
		let dir = Tile.directionTo(unit.pos, loc);
		if (dir == -1) return false;
		let target = gameState.getUnitAt(loc);
		if (target == null) return false;
		if (target.player == unit.player) return false;

		let dstPos = Tile.offset(target.pos, (dir + 2) % 4);
		if (gameState.getUnitAt(dstPos) != null) return false;
		if (gameState.room.getTile(target.pos).height + 1 < gameState.room.getTile(dstPos).height) return false;
		return true;
	}
}();
