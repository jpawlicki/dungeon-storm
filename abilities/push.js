abilityData.PUSH = new class extends Ability {
	constructor() {
		super();
		this.name = "Push";
		this.icon = "M18,16V13H15V22H13V2H15V11H18V8L22,12L18,16M2,12L6,16V13H9V22H11V2H9V11H6V8L2,12Z"
		this.minActionPoints = 1;
		this.details = [
			"Use ♦. Select an adjacent !ENEMY. !MOVE into an open space away from the !ENEMY. Cannot rise 2 or more steps.",
			"Roll ⚅. If greater than the !ENEMY's ○, they !RETREAT.",
			"Cannot be undone."];
		this.aiHints = [AiHints.ATTACK];
		this.cost = {experience: 3};
	}

	clickOnTile(unit, loc, quadrant) {
		if (!this.isActionLegal(unit, loc, quadrant)) return;
		let target = gameState.getUnitAt(loc);
		let dstPos = Tile.offset(unit.pos, Tile.directionTo(loc, unit.pos));

		let effects = [
			new Effect(unit, "actionPoints", unit.actionPoints - 1),
			new Effect(unit, "pos", dstPos),
		];
		let events = [
			ActionEvent.move(unit, unit.pos, dstPos),
		];

		let retreat1 = parseInt(Math.random() * 6 + 1) > target.getStrength(Tile.directionTo(target.pos, unit.pos));
		if (retreat1) {
			let retreatDir = Tile.directionTo(unit.pos, target.pos);
			events.push(ActionEvent.retreat(target, retreatDir));
		}

		let tpos = target.pos;
		let upos = unit.pos;
		return new Action(false, effects, events, this.name, () => {
			SpecialEffect.abilityUse(unit, this);
			SpecialEffect.attackClash(tpos, upos, retreat1, false);
		});
	}

	mouseOverTile(unit, loc, quadrant) {
		clearClickContextActors();
		if (!this.isActionLegal(unit, loc, quadrant)) return;
		let target = gameState.getUnitAt(loc);
		let dstPos = Tile.offset(unit.pos, Tile.directionTo(loc, unit.pos));

		// Attacker
		clickContext.actors.push(new AbilityMoveActor(unit, dstPos, unit.facing));

		// Defender
		let defenderRetreatChance = Math.min(1, Math.max(0, 1 - target.getStrength(Tile.directionTo(loc, unit.pos)) / 6.0));
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

		let dstPos = Tile.offset(unit.pos, Tile.directionTo(loc, unit.pos));
		if (gameState.getUnitAt(dstPos) != null) return false;
		if (gameState.room.getTile(unit.pos).height < gameState.room.getTile(dstPos).height - 1) return false;
		return true;
	}
}();
