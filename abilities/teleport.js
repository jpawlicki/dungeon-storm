abilityData.TELEPORT = new class extends Ability {
	constructor() {
		super();
		this.name = "Teleport";
		this.icon = "M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z";
		this.minActionPoints = 2;
		this.details = [
			"Spend ♦♦ and move to an empty space."];
		this.aiHints = [AiHints.MOVE];
		this.cost = {experience: 3};
	}

	clickOnTile(unit, loc, quadrant) {
		if (gameState.currentState.getUnitAt(loc) != null) return;
		clearClickContextActors();
		return new Action(
				true,
				[
					new Effect(unit, "actionPoints", unit.actionPoints - 2),
					new Effect(unit, "pos", loc),
				],
				this.name);
	}

	mouseOverTile(unit, loc, quadrant) {
		clearClickContextActors();
		if (gameState.currentState.getUnitAt(loc) != null) return;
		clickContext.actors.push(new AbilityMoveActor(unit, loc, unit.facing));
	}
}();
