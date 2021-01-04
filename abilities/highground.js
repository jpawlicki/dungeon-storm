abilityData.HIGHGROUND = new class extends Ability {
	constructor() {
		super();
		this.name = "Highground";
		this.icon = "M22,19V22H2V13L22,19M19.09,7.5L18.25,10.26L8.13,7.26C8.06,5.66 6.7,4.42 5.1,4.5C3.5,4.57 2.26,5.93 2.34,7.53C2.41,9.13 3.77,10.36 5.37,10.29C6.24,10.25 7.05,9.82 7.57,9.11L17.69,12.11L16.85,14.89L21.67,12.29L19.09,7.5Z";
		this.minActionPoints = 1;
		this.details = ["Use ♦. Select an adjacent !ENEMY at a lower elevation. It !RETREATs."];
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
		if (gameState.room.getTile(loc).height >= gameState.room.getTile(unit.pos)) return false;
		let target = gameState.getUnitAt(loc);
		if (target == null) return false;
		if (target.player == unit.player) return false;
		return true;
	}
}();
