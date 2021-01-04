abilityData.DESPERATION = new class extends Ability {
	constructor() {
		super();
		this.name = "Desperation";
		this.icon = "M11,15H13V17H11V15M11,7H13V13H11V7M12,3A9,9 0 0,0 3,12A9,9 0 0,0 12,21A9,9 0 0,0 21,12A9,9 0 0,0 12,3M12,19C8.14,19 5,15.86 5,12C5,8.14 8.14,5 12,5C15.86,5 19,8.14 19,12C19,15.86 15.86,19 12,19M20.5,20.5C22.66,18.31 24,15.31 24,12C24,8.69 22.66,5.69 20.5,3.5L19.42,4.58C21.32,6.5 22.5,9.11 22.5,12C22.5,14.9 21.32,17.5 19.42,19.42L20.5,20.5M4.58,19.42C2.68,17.5 1.5,14.9 1.5,12C1.5,9.11 2.68,6.5 4.58,4.58L3.5,3.5C1.34,5.69 0,8.69 0,12C0,15.31 1.34,18.31 3.5,20.5L4.58,19.42Z";
		this.minActionPoints = 1;
		this.details = [
			"Use ♦. Become !FRIGHTENED. !DEFEAT an adjacent !ENEMY.",
			"Cannot be used if !FRIGHTENED."];
		this.aiHints = [AiHints.ATTACK];
	}

	clickOnTile(unit, loc, quadrant) {
		if (!this.isActionLegal(unit, loc, quadrant)) return;
		let target = gameState.getUnitAt(loc);

		return new Action(
				true,
				[
					new Effect(unit, "actionPoints", unit.actionPoints - 1),
					new Effect(target, "state", Unit.State.DEFEATED),
					new Effect(unit, "state", Unit.State.FRIGHTENED),
				],
				[ActionEvent.defeat(target)],
				this.name,
					() => {
						SpecialEffect.abilityUse(unit, this);
						SpecialEffect.attackClash(target.pos, unit.pos, false, false);
					});
	}

	mouseOverTile(unit, loc, quadrant) {
		clearClickContextActors();
		if (!this.isActionLegal(unit, loc, quadrant)) return;
		clickContext.actors.push(new DefeatActor(gameState.getUnitAt(loc), 1));
		clickContext.actors.push(new AbilityMoveActor(unit, unit.pos, unit.facing, false, u => u.state = Unit.State.FRIGHTENED));
	}

	isActionLegal(unit, loc, quadrant) {
		if (unit.actionPoints < 1) return false;
		if (unit.state == Unit.State.FRIGHTENED) return false;
		if (Tile.distanceBetween(unit.pos, loc) != 1) return false;
		let target = gameState.getUnitAt(loc);
		if (target == null) return false;
		if (target.player == unit.player) return false;
		return true;
	}
}();
