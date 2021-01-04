abilityData.VAULT = new class extends Ability {
	constructor() {
		super();
		this.name = "Vault";
		this.icon = "M12,14A2,2 0 0,1 14,16A2,2 0 0,1 12,18A2,2 0 0,1 10,16A2,2 0 0,1 12,14M23.46,8.86L21.87,15.75L15,14.16L18.8,11.78C17.39,9.5 14.87,8 12,8C8.05,8 4.77,10.86 4.12,14.63L2.15,14.28C2.96,9.58 7.06,6 12,6C15.58,6 18.73,7.89 20.5,10.72L23.46,8.86Z";
		this.minActionPoints = 1;
		this.details = ["Use ♦. !MOVE to an empty space on the opposite side of an adjacent !FRIEND or !ENEMY."];
		this.aiHints = [AiHints.MOVE];
	}

	clickOnTile(unit, loc, quadrant) {
		if (!this.isMoveLegal(unit, loc, quadrant)) return null;

		return new Action(
				true,
				[
					new Effect(unit, "pos", loc),
					new Effect(unit, "actionPoints", unit.actionPoints - 1),
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
		clickContext.actors.push(new AbilityMoveActor(unit, loc, unit.facing));
	}

	isMoveLegal(unit, loc, quadrant) {
		if (unit.actionPoints < 1) return false;
		if (Tile.distanceBetween(unit.pos, loc) != 2) return false;
		let dir = Tile.directionTo(unit.pos, loc);
		if (dir == -1) return false;
		if (gameState.getUnitAt(loc) != null) return false;
		if (gameState.getUnitAt(Tile.offset(unit.pos, dir)) == null) return false;
		return true;
	}
}();
