abilityData.SHOOT = new class extends Ability {
	constructor() {
		super();
		this.name = "Shoot";
		this.icon = "M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12C22,10.84 21.79,9.69 21.39,8.61L19.79,10.21C19.93,10.8 20,11.4 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4C12.6,4 13.2,4.07 13.79,4.21L15.4,2.6C14.31,2.21 13.16,2 12,2M19,2L15,6V7.5L12.45,10.05C12.3,10 12.15,10 12,10A2,2 0 0,0 10,12A2,2 0 0,0 12,14A2,2 0 0,0 14,12C14,11.85 14,11.7 13.95,11.55L16.5,9H18L22,5H19V2M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12H16A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8V6Z"
		this.minActionPoints = 2;
		this.details = [
			"Use ♦♦. Select an !ENEMY in a straight line.",
			"Roll ⚅. If greater than the !ENEMY's ○, it becomes !FRIGHTENED and !RETREATs.",
			"Cannot select an adjacent !ENEMY.",
			"Cannot be undone."];
		this.aiHints = [AiHints.ATTACK];
	}

	clickOnTile(unit, loc, quadrant) {
		if (!this.isActionLegal(unit, loc, quadrant)) return;
		let target = gameState.getUnitAt(loc);
		if (target == null) return;

		let effects = [
			new Effect(unit, "actionPoints", unit.actionPoints - 2)
		];
		let events = [];

		let retreat = parseInt(Math.random() * 6 + 1) > target.getStrength(Tile.directionTo(target.pos, unit.pos));
		if (retreat) {
			let retreatDir = Tile.directionTo(unit.pos, target.pos);
			effects.push(new Effect(target, "state", Unit.State.FRIGHTENED));
			events.push(ActionEvent.retreat(target, retreatDir));
		}

		let tpos = target.pos;
		let upos = unit.pos;
		return new Action(false, effects, events, this.name, () => {
			SpecialEffect.abilityUse(unit, this);
			SpecialEffect.arrowShot(upos, tpos, retreat);
		});
	}

	mouseOverTile(unit, loc, quadrant) {
		clearClickContextActors();
		if (!this.isActionLegal(unit, loc, quadrant)) return;
		let target = gameState.getUnitAt(loc);
		if (target == null) return;

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
		if (unit.actionPoints < 2) return false;
		if (Tile.distanceBetween(unit.pos, loc) <= 1) return false;
		if (Tile.directionTo(unit.pos, loc) == -1) return false;
		let target = gameState.getUnitAt(loc);
		if (target == null) return false;
		if (target.player == unit.player) return false;
		return true;
	}
}();
