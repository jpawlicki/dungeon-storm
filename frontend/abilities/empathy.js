abilityData.EMPATHY = new class extends Ability {
	constructor() {
		super();
		this.name = "Empathy";
		this.icon = "M12 18C12 18.7 12.12 19.36 12.34 20C12.23 20 12.12 20 12 20C8.69 20 6 17.31 6 14C6 10 12 3.25 12 3.25S16.31 8.1 17.62 12C14.5 12.22 12 14.82 12 18M21.54 15.88L20.13 14.47L18 16.59L15.88 14.47L14.47 15.88L16.59 18L14.47 20.12L15.88 21.53L18 19.41L20.12 21.53L21.53 20.12L19.41 18L21.54 15.88Z";
		this.minActionPoints = 1;
		this.details = [
				"Use ♦. Become !FRIGHTENED. Select a !FRIGHTENED !FRIEND. They are no longer !FRIGHTENED.",
				"Cannot be used if !FRIGHTENED."];
		this.aiHints = [AiHints.BUFF];
	}

	clickOnTile(unit, loc, quadrant) {
		if (!this.isMoveLegal(unit, loc, quadrant)) return null;
		let target = gameState.getUnitAt(loc);
		return new Action(
				true,
				[
					new Effect(unit, "state", Unit.State.FRIGHTENED),
					new Effect(target, "state", Unit.State.NORMAL),
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
		clickContext.actors.push(new AbilityMoveActor(unit, unit.pos, unit.facing, false, u => u.state = Unit.State.FRIGHTENED));
		clickContext.actors.push(new AbilityMoveActor(target, target.pos, target.facing, true, u => u.state = Unit.State.NORMAL));
	}

	isMoveLegal(unit, loc, quadrant) {
		if (unit.actionPoints < 1) return false;
		let target = gameState.getUnitAt(loc);
		if (target == null) return false;
		if (target.player != unit.player) return false;
		if (target.state != Unit.State.FRIGHTENED) return false;
		if (unit.state == Unit.State.FRIGHTENED) return false;
		return true;
	}
}();
