abilityData.CHARGE = new class extends Ability {
	constructor() {
		super();
		this.name = "Charge";
		this.icon = "M15.59,9C17.7,7.74 19,5.46 19,3H17A5,5 0 0,1 12,8A5,5 0 0,1 7,3H5C5,5.46 6.3,7.74 8.41,9C5.09,11 4,15.28 6,18.6C7.97,21.92 12.27,23 15.59,21C18.91,19.04 20,14.74 18,11.42C17.42,10.43 16.58,9.59 15.59,9M12,20A5,5 0 0,1 7,15A5,5 0 0,1 12,10A5,5 0 0,1 17,15A5,5 0 0,1 12,20Z";
		this.minActionPoints = 1;
		this.details = [
			"Spend ♦ and select the first unit directly ahead. !MOVE to the space of that unit. That unit becomes !BLOODY and !RETREATs.",
			"Cannot select a friendly unit.",
			"Cannot select an adjacent unit.",
			"Cannot select a unit with greater strength."];
		this.aiHints = [AiHints.ATTACK];
		this.cost = {experience: 3};
	}

	clickOnTile(unit, loc, quadrant) {
		if (!this.isActionLegal(unit, loc, quadrant)) return;
		let target = gameState.getUnitAt(loc);
		if (target == null) return;

		let effects = [
			new Effect(unit, "actionPoints", unit.actionPoints - 1),
			new Effect(unit, "pos", loc),
			new Effect(target, "state", Unit.State.BLOODIED),
		];
		let events = [
			ActionEvent.retreat(target, unit.facing),
			ActionEvent.move(unit, unit.pos, loc),
		];

		let tpos = target.pos;
		let upos = unit.pos;
		return new Action(false, effects, events, this.name, () => {
			SpecialEffect.abilityUse(unit, this);
			SpecialEffect.attackClash(Tile.offset(tpos, Tile.directionTo(tpos, upos)), upos, true, false);
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

		// Attacker
		clickContext.actors.push(new AbilityMoveActor(unit, loc, unit.facing));
	}

	isActionLegal(unit, loc, quadrant) {
		if (unit.actionPoints < 1) return false;
		if (Tile.distanceBetween(unit.pos, loc) <= 1) return false;
		if (Tile.directionTo(unit.pos, loc) != unit.facing) return false;
		let checkPoint = Tile.offset(unit.pos, unit.facing);
		while (checkPoint[0] != loc[0] || checkPoint[1] != loc[1]) {
			if (gameState.getUnitAt(checkPoint) != null) return false;
			checkPoint = Tile.offset(checkPoint, unit.facing);
		}
		let target = gameState.getUnitAt(loc);
		if (target == null) return false;
		if (target.player == unit.player) return false;
		if (target.getStrength(Tile.directionTo(target.pos, unit.pos)) > unit.getStrength(Tile.directionTo(unit.pos, target.pos))) return false;
		return true;
	}
}();
