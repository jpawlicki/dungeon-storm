abilityData.OUTMANEUVER = new class extends Ability {
	constructor() {
		super();
		this.name = "Outmaneuver";
		this.icon = "M14.58,16.59L19.17,12L14.58,7.41L16,6L22,12L16,18L14.58,16.59M8.58,16.59L13.17,12L8.58,7.41L10,6L16,12L10,18L8.58,16.59M2.58,16.59L7.17,12L2.58,7.41L4,6L10,12L4,18L2.58,16.59Z";
		this.minActionPoints = 2;
		this.details = ["Select an adjacent !ENEMY with less ♦. They become !FRIGHTENED and !RETREAT. Use ♦♦."];
		this.aiHints = [AiHints.ATTACK, AiHints.PUSHER];
	}

	clickOnTile(unit, loc, quadrant) {
		if (!this.isActionLegal(unit, loc, quadrant)) return;
		let target = gameState.getUnitAt(loc);
		if (target == null) return;

		let effects = [
			new Effect(unit, "actionPoints", unit.actionPoints - 2)
		];
		let events = [];

		let retreatDir = Tile.directionTo(unit.pos, target.pos);
		effects.push(new Effect(target, "state", Unit.State.FRIGHTENED));
		events.push(ActionEvent.retreat(target, retreatDir));

		return new Action(true, effects, events, this.name, () => {
			SpecialEffect.abilityUse(unit, this);
			SpecialEffect.attackClash(target.pos, unit.pos, true, false);
		});
	}

	mouseOverTile(unit, loc, quadrant) {
		clearClickContextActors();
		if (!this.isActionLegal(unit, loc, quadrant)) return;
		let target = gameState.getUnitAt(loc);
		if (target == null) return;

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
		if (unit.actionPoints < 2) return false;
		if (Math.abs(unit.pos[0] - loc[0]) + Math.abs(unit.pos[1] - loc[1]) != 1) return false;
		let target = gameState.getUnitAt(loc);
		if (target == null) return false;
		if (target.player == unit.player) return false;
		if (target.actionPoints >= unit.actionPoints) return false;
		return true;
	}
}();
