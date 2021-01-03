abilityData.TERRIFY = new class extends Ability {
	constructor() {
		super();
		this.name = "Terrify";
		this.icon = "M10 3.25C10 3.25 16 10 16 14C16 17.31 13.31 20 10 20S4 17.31 4 14C4 10 10 3.25 10 3.25M20 7V13H18V7H20M18 17H20V15H18V17Z";
		this.minActionPoints = 1;
		this.details = ["Use ♦. Select an adjacent !FRIGHTENED !ENEMY. They !RETREAT."];
		this.aiHints = [AiHints.ATTACK];
	}

	clickOnTile(unit, loc, quadrant) {
		if (!this.isActionLegal(unit, loc, quadrant)) return;
		let target = gameState.getUnitAt(loc);

		return new Action(
				true,
				[new Effect(unit, "actionPoints", unit.actionPoints - 1)],
				[ActionEvent.retreat(target, Tile.directionTo(unit.pos, target.pos))],
				this.name,
				() => {
					SpecialEffect.abilityUse(unit, this);
					SpecialEffect.attackClash(target.pos, unit.pos, true, false);
				});
	}

	mouseOverTile(unit, loc, quadrant) {
		clearClickContextActors();
		if (!this.isActionLegal(unit, loc, quadrant)) return;
		let target = gameState.getUnitAt(loc);

		// Defender
		let defenderRetreatChance = 1;
		let defenderRetreatDir = Tile.directionTo(unit.pos, loc);
		if (target.canRetreat(defenderRetreatDir)) {
			clickContext.actors.push(new RetreatActor(target, defenderRetreatDir, defenderRetreatChance));
		} else {
			clickContext.actors.push(new DefeatActor(target, defenderRetreatChance));
		}
	}

	isActionLegal(unit, loc, quadrant) {
		if (unit.actionPoints < 1) return false;
		if (Tile.distanceBetween(unit.pos, loc) != 1) return false;
		let target = gameState.getUnitAt(loc);
		if (target == null) return false;
		if (target.player == unit.player) return false;
		if (target.state != Unit.State.FRIGHTENED) return false;
		return true;
	}
}();
