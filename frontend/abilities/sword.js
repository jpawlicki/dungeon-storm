abilityData.SWORD = new class extends Ability {
	constructor() {
		super();
		this.name = "Sword";
		this.icon = "M6.92,5H5L14,14L15,13.06M19.96,19.12L19.12,19.96C18.73,20.35 18.1,20.35 17.71,19.96L14.59,16.84L11.91,19.5L10.5,18.09L11.92,16.67L3,7.75V3H7.75L16.67,11.92L18.09,10.5L19.5,11.91L16.83,14.58L19.95,17.7C20.35,18.1 20.35,18.73 19.96,19.12Z";
		this.minActionPoints = 1;
		this.details = [
			"Use ♦. Select an adjacent !ENEMY. If ⚅ is greater than the !ENEMY's ○, the !ENEMY becomes !FRIGHTENED and !RETREATS.",
			"Cannot be undone."];
		this.aiHints = [AiHints.ATTACK];
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
		let attackerStr = unit.getStrength(Tile.directionTo(unit.pos, target.pos));
		let success = Math.floor(Math.random() * 6 + 1) > defenderStr;
		if (success) {
			// Defender retreats
			let retreatDir = Tile.directionTo(unit.pos, target.pos);
			effects.push(new Effect(target, "state", Unit.State.FRIGHTENED));
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

		let defenderStr = target.getStrength(Tile.directionTo(target.pos, unit.pos));
		let attackerStr = unit.getStrength(Tile.directionTo(unit.pos, target.pos));

		// Defender
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
		let target = gameState.getUnitAt(loc);
		if (target == null) return false;
		if (target.player == unit.player) return false;
		return true;
	}
}();
