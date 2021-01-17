abilityData.CLEAVE = new class extends Ability {
	constructor() {
		super();
		this.name = "Cleave";
		this.icon = "M6.2,2.44L18.1,14.34L20.22,12.22L21.63,13.63L19.16,16.1L22.34,19.28C22.73,19.67 22.73,20.3 22.34,20.69L21.63,21.4C21.24,21.79 20.61,21.79 20.22,21.4L17,18.23L14.56,20.7L13.15,19.29L15.27,17.17L3.37,5.27V2.44H6.2M15.89,10L20.63,5.26V2.44H17.8L13.06,7.18L15.89,10M10.94,15L8.11,12.13L5.9,14.34L3.78,12.22L2.37,13.63L4.84,16.1L1.66,19.29C1.27,19.68 1.27,20.31 1.66,20.7L2.37,21.41C2.76,21.8 3.39,21.8 3.78,21.41L7,18.23L9.44,20.7L10.85,19.29L8.73,17.17L10.94,15Z";
		this.minActionPoints = 1;
		this.details = [
			"Use ♦. If ⚅ is greater than any adjacent !FRIEND or !ENEMY's ○, that !FRIEND or !ENEMY !RETREATs.",
			"Cannot be used if there is no adjacent !FRIENDs or !ENEMYs.",
			"Cannot be undone."];
		this.aiHints = [AiHints.ATTACK, AiHints.PUSHER];
	}

	clickOnTile(unit, loc, quadrant) {
		if (!this.isActionLegal(unit, loc, quadrant)) return;

		let effects = [
			new Effect(unit, "actionPoints", unit.actionPoints - 1)
		];
		let events = [];
		let sfx = [() => SpecialEffect.abilityUse(unit, this)];

		let roll = Math.floor(Math.random() * 6 + 1);

		for (let dir = 0; dir < 4; dir++) {
			let target = gameState.getUnitAt(Tile.offset(unit.pos, dir));
			if (target == null) continue;
			let defenderStr = target.getStrength(Tile.directionTo(target.pos, unit.pos));
			let success = roll > defenderStr;
			if (success) {
				events.push(ActionEvent.retreat(target, dir));
			}
			let tpos = target.pos;
			let upos = unit.pos;
			sfx.push(() => SpecialEffect.attackClash(tpos, upos, success, false));
		}

		return new Action(false, effects, events, this.name, () => {
			for (let s of sfx) s();
		});
	}

	mouseOverTile(unit, loc, quadrant) {
		clearClickContextActors();
		if (!this.isActionLegal(unit, loc, quadrant)) return;
		for (let dir = 0; dir < 4; dir++) {
			let target = gameState.getUnitAt(Tile.offset(unit.pos, dir));
			if (target == null) continue;
			let defenderRetreatChance = Math.min(1, Math.max(0, 1 - target.getStrength((dir + 2) % 4) / 6.0));
			if (target.canRetreat(dir)) {
				clickContext.actors.push(new RetreatActor(target, dir, defenderRetreatChance));
			} else {
				clickContext.actors.push(new DefeatActor(target, defenderRetreatChance));
			}
		}
	}

	isActionLegal(unit, loc, quadrant) {
		if (unit.actionPoints < 1) return false;
		if (Tile.distanceBetween(unit.pos, loc) != 1) return false;
		let target = gameState.getUnitAt(loc);
		if (target == null) return false;
		return true;
	}
}();
