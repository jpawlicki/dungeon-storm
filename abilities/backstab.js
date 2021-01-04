abilityData.BACKSTAB = new class extends Ability {
	constructor() {
		super();
		this.name = "Backstab";
		this.icon = "M22,2L17.39,3.75L10.46,10.68L14,14.22L20.92,7.29C22.43,5.78 22,2 22,2M8.33,10L6.92,11.39L8.33,12.8L2.68,18.46L6.21,22L11.87,16.34L13.28,17.76L14.7,16.34L8.33,10Z";
		this.minActionPoints = 1;
		this.details = [
			"Use ♦. Select an adjacent !ENEMY that is !THREATENed by another !FRIEND. It becomes !FRIGHTENED and !RETREATs.",
			"Cannot select an !ENEMY that !THREATENs this !FRIEND."];
		this.aiHints = [AiHints.ATTACK];
	}

	clickOnTile(unit, loc, quadrant) {
		if (!this.isActionLegal(unit, loc, quadrant)) return;
		let target = gameState.getUnitAt(loc);

		return new Action(
				true,
				[
					new Effect(unit, "actionPoints", unit.actionPoints - 1),
					new Effect(target, "state", Unit.State.FRIGHTENED),
				],
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
		if (target.threatens(unit, unit.pos)) return false;
		let otherThreat = false;
		for (let u of gameState.units) if (u != unit && u.threatens(target, target.pos)) otherThreat = true;
		if (!otherThreat) return false;
		return true;
	}
}();
