abilityData.EFFORTTELEPORT = new class extends Ability {
	constructor() {
		super();
		this.name = "EffortTeleport";
		this.icon = "M20 8V16L17 17L13.91 11.5C13.65 11.04 12.92 11.27 13 11.81L14 21L4 17L5.15 8.94C5.64 5.53 8.56 3 12 3H20L18.42 5.37C19.36 5.88 20 6.86 20 8Z";
		this.minActionPoints = 1;
		this.details = ["Teleport to an open space. Use ♦ equal to the distance travelled."];
		this.aiHints = [AiHints.MOVE, AiHints.BASIC_MOVE];
	}

	clickOnTile(unit, loc, quadrant) {
		if (!this.isMoveLegal(unit, loc, quadrant)) return null;

		let effects = [
			new AddingEffect(unit, "actionPoints", -Tile.distanceBetween(unit.pos, loc)),
			new Effect(unit, "pos", loc),
		];

		return new Action(
				true,
				effects,
				[],	
				this.name,
				() => {
					SpecialEffect.abilityUse(unit, this);
				});
	}

	mouseOverTile(unit, loc, quadrant) {
		clearClickContextActors();
		if (!this.isMoveLegal(unit, loc, quadrant)) return;
		clickContext.actors.push(new AbilityMoveActor(unit, loc, unit.facing, false, u => {u.actionPoints -= Tile.distanceBetween(unit.pos, loc)}));
	}

	isMoveLegal(unit, loc, quadrant) {
		if (unit.actionPoints < Tile.distanceBetween(unit.pos, loc)) return false;
		let dstUnit = gameState.getUnitAt(loc);
		if (dstUnit != null) return false;
		return true;
	}
}();
