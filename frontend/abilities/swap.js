abilityData.SWAP = new class extends Ability {
	constructor() {
		super();
		this.name = "Swap";
		this.icon = "M12,18A6,6 0 0,1 6,12C6,11 6.25,10.03 6.7,9.2L5.24,7.74C4.46,8.97 4,10.43 4,12A8,8 0 0,0 12,20V23L16,19L12,15M12,4V1L8,5L12,9V6A6,6 0 0,1 18,12C18,13 17.75,13.97 17.3,14.8L18.76,16.26C19.54,15.03 20,13.57 20,12A8,8 0 0,0 12,4Z";
		this.minActionPoints = 1;
		this.details = ["Use ♦. Swap positions and facing with an adjacent !FRIEND or !ENEMY."];
		this.aiHints = [AiHints.MOVE];
	}

	clickOnTile(unit, loc, quadrant) {
		if (!this.isMoveLegal(unit, loc, quadrant)) return null;
		let swap = gameState.getUnitAt(loc);
		return new Action(
				true,
				[
					new Effect(unit, "pos", loc),
					new Effect(unit, "facing", swap.facing),
					new Effect(unit, "actionPoints", unit.actionPoints - 1),
					new Effect(swap, "pos", unit.pos),
					new Effect(swap, "facing", unit.facing),
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
		clickContext.actors.push(new AbilityMoveActor(unit, loc, gameState.getUnitAt(loc).facing));
		clickContext.actors.push(new AbilityMoveActor(gameState.getUnitAt(loc), unit.pos, unit.facing, false));
	}

	isMoveLegal(unit, loc, quadrant) {
		if (unit.actionPoints < 1) return false;
		if (Tile.distanceBetween(unit.pos, loc) != 1) return false;
		if (gameState.getUnitAt(loc) == null) return false;
		return true;
	}
}();
