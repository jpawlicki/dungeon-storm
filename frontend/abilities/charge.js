abilityData.CHARGE = new class extends Ability {
	constructor() {
		super();
		this.name = "Charge";
		this.icon = "M15.59,9C17.7,7.74 19,5.46 19,3H17A5,5 0 0,1 12,8A5,5 0 0,1 7,3H5C5,5.46 6.3,7.74 8.41,9C5.09,11 4,15.28 6,18.6C7.97,21.92 12.27,23 15.59,21C18.91,19.04 20,14.74 18,11.42C17.42,10.43 16.58,9.59 15.59,9M12,20A5,5 0 0,1 7,15A5,5 0 0,1 12,10A5,5 0 0,1 17,15A5,5 0 0,1 12,20Z";
		this.minActionPoints = 2;
		this.details = [
			"Use ♦♦. Select a !ENEMY in a straight line and !MOVE to its space. It becomes !FRIGHTENED and !RETREATs.",
			"Cannot select a !ENEMY behind a rise of 2 or more steps.",
			"Cannot select a !ENEMY behind a different !ENEMY or !FRIEND.",
			"Cannot select an adjacent !ENEMY.",
			"Cannot select a !ENEMY with greater ○."];
		this.aiHints = [AiHints.ATTACK, AiHints.PUSHER];
	}

	clickOnTile(unit, loc, quadrant) {
		if (!this.isActionLegal(unit, loc, quadrant)) return;
		let target = gameState.getUnitAt(loc);
		if (target == null) return;

		let effects = [
			new Effect(unit, "actionPoints", unit.actionPoints - 2),
			new Effect(unit, "pos", loc),
			new Effect(target, "state", Unit.State.FRIGHTENED),
		];
		let events = [
			ActionEvent.retreat(target, Tile.directionTo(unit.pos, loc)),
			ActionEvent.move(unit, unit.pos, loc),
		];

		let tpos = target.pos;
		let upos = unit.pos;
		return new Action(true, effects, events, this.name, () => {
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
		clickContext.actors.push(new AbilityMoveActor(unit, loc, unit.facing, false, u => u.actionPoints -= 2));
	}

	isActionLegal(unit, loc, quadrant) {
		if (unit.actionPoints < 2) return false;
		if (Tile.distanceBetween(unit.pos, loc) <= 1) return false;
		let dirTo = Tile.directionTo(unit.pos, loc);
		if (dirTo == -1) return false;
		let prevHeight = gameState.room.getTile(unit.pos).height;
		let checkPoint = Tile.offset(unit.pos, dirTo);
		while (checkPoint[0] != loc[0] || checkPoint[1] != loc[1]) {
			let checkHeight = gameState.room.getTile(checkPoint).height;
			if (checkHeight >= prevHeight + 2) return false;
			if (gameState.getUnitAt(checkPoint) != null) return false;
			checkPoint = Tile.offset(checkPoint, dirTo);
			prevHeight = checkHeight;
		}
		if (gameState.room.getTile(loc).height >= prevHeight + 2) return false;
		let target = gameState.getUnitAt(loc);
		if (target == null) return false;
		if (target.player == unit.player) return false;
		if (target.getStrength(Tile.directionTo(target.pos, unit.pos)) > unit.getStrength(Tile.directionTo(unit.pos, target.pos))) return false;
		return true;
	}
}();
