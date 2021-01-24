abilityData.FACEENEMY = new class extends Ability {
	constructor() {
		super();
		this.name = "FaceEnemy";
		this.icon = "M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z";
		this.minActionPoints = 1;
		this.details = ["Use ♦. Rotate. If a !ENEMY is directly ahead, gain ♦."];
		this.aiHints = [AiHints.MOVE];
	}

	clickOnTile(unit, loc, quadrant) {
		if (!this.isMoveLegal(unit, loc, quadrant)) return null;

		let effects = [
			new AddingEffect(unit, "actionPoints", -1),
			new Effect(unit, "facing", quadrant),
		];

		if (this.isEnemyAhead(unit, quadrant)) {
			effects.push(new AddingEffect(unit, "actionPoints", 1));
		}

		return new Action(
				true,
				effects,
				[],
				this.name,
				() => {
					SpecialEffect.abilityUse(unit, this);
				});
	}

	mouseOverTile(unit, loc, quadrant) {
		clearClickContextActors();
		if (!this.isMoveLegal(unit, loc, quadrant)) return;
		clickContext.actors.push(new AbilityMoveActor(unit, loc, quadrant, !this.isEnemyAhead(unit, quadrant)));
	}

	isEnemyAhead(unit, newFacing) {
		for (let u of gameState.units) {
			if (u.player == unit.player) continue;
			if (u.state == Unit.State.DEFEATED) continue;
			if (Tile.directionTo(unit.pos, u.pos) != newFacing) continue;
			return true;
		}
		return false;
	}

	isMoveLegal(unit, loc, quadrant) {
		if (unit.actionPoints < 1) return false;
		if (Tile.distanceBetween(unit.pos, loc) != 0) return false;
		return true;
	}
}();
