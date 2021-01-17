abilityData.ADVANCE = new class extends Ability {
	constructor() {
		super();
		this.name = "Advance";
		this.icon = "M12,22A2,2 0 0,1 10,20A2,2 0 0,1 12,18A2,2 0 0,1 14,20A2,2 0 0,1 12,22M13,2V13L17.5,8.5L18.92,9.92L12,16.84L5.08,9.92L6.5,8.5L11,13V2H13Z";
		this.minActionPoints = 1;
		this.details = [
			"Use ♦. Select an adjacent !ENEMY. If ⚅ is greater than the !ENEMY's ○, the !ENEMY becomes !FRIGHTENED and !RETREATs, and this !FRIEND teleports into their space.",
			"Cannot rise more than 1 step.",
			"Cannot be undone."];
		this.aiHints = [AiHints.ATTACK, AiHints.PUSHER];
	}

	clickOnTile(unit, loc, quadrant) {
		if (!this.isActionLegal(unit, loc, quadrant)) return;
		let target = gameState.getUnitAt(loc);
		if (target == null) return;

		let effects = [
			new Effect(unit, "actionPoints", unit.actionPoints - 1)
		];
		let events = [];

		let defenderStr = target.getStrength(Tile.directionTo(target.pos, unit.pos));
		let success = Util.roll() > defenderStr;
		if (success) {
			// Defender retreats
			let retreatDir = Tile.directionTo(unit.pos, target.pos);
			effects.push(new Effect(target, "state", Unit.State.FRIGHTENED));
			effects.push(new Effect(unit, "pos", target.pos.slice()));
			events.push(ActionEvent.retreat(target, retreatDir));
		}

		let tpos = target.pos;
		let upos = unit.pos;
		return new Action(false, effects, events, this.name, () => {
			SpecialEffect.abilityUse(unit, this);
			SpecialEffect.attackClash(tpos, upos, success, false);
		});
	}

	mouseOverTile(unit, loc, quadrant) {
		clearClickContextActors();
		if (!this.isActionLegal(unit, loc, quadrant)) return;
		let target = gameState.getUnitAt(loc);
		if (target == null) return;

		clickContext.actors.push(new AbilityMoveActor(unit, loc, unit.facing));
		let defenderStr = target.getStrength(Tile.directionTo(target.pos, unit.pos));
		let defenderRetreatChance = Math.min(1, Math.max(0, 1 - target.getStrength(Tile.directionTo(target.pos, unit.pos)) / 6.0));
		let defenderRetreatDir = Tile.directionTo(unit.pos, loc);
		if (target.canRetreat(defenderRetreatDir)) {
			clickContext.actors.push(new RetreatActor(target, defenderRetreatDir, defenderRetreatChance));
		} else {
			clickContext.actors.push(new DefeatActor(target, defenderRetreatChance));
		}
	}

	isActionLegal(unit, loc, quadrant) {
		if (unit.actionPoints < 1) return false;
		if (Math.abs(unit.pos[0] - loc[0]) + Math.abs(unit.pos[1] - loc[1]) != 1) return false;
		if (gameState.room.getTile(unit.pos).height < gameState.room.getTile(loc).height - 1) return false;
		let target = gameState.getUnitAt(loc);
		if (target == null) return false;
		if (target.player == unit.player) return false;
		return true;
	}
}();
