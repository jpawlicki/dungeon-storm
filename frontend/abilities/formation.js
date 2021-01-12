abilityData.FORMATION = new class extends Ability {
	constructor() {
		super();
		this.name = "Formation";
		this.icon = "M11,5H8L12,1L16,5H13V9.43C12.25,9.89 11.58,10.46 11,11.12V5M22,11L18,7V10C14.39,9.85 11.31,12.57 11,16.17C9.44,16.72 8.62,18.44 9.17,20C9.72,21.56 11.44,22.38 13,21.83C14.56,21.27 15.38,19.56 14.83,18C14.53,17.14 13.85,16.47 13,16.17C13.47,12.17 17.47,11.97 17.95,11.97V14.97L22,11M10.63,11.59C9.3,10.57 7.67,10 6,10V7L2,11L6,15V12C7.34,12.03 8.63,12.5 9.64,13.4C9.89,12.76 10.22,12.15 10.63,11.59Z";
		this.minActionPoints = 1;
		this.details = [
			"Use ♦. !MOVE to an adjacent space and rotate.",
			"All adjacent !FRIENDs !MOVE in the same direction, if possible.",
			"No !FRIEND may end !MOVEment in an occupied space.",
			"No !FRIEND may rise more than 1 step."];
		this.aiHints = [AiHints.MOVE];
	}

	clickOnTile(unit, loc, quadrant) {
		if (!this.isMoveLegal(unit, loc, quadrant)) return null;
		let dir = Tile.directionTo(unit.pos, loc);
		let effects = [
			new Effect(unit, "actionPoints", unit.actionPoints - 1),
			new Effect(unit, "facing", quadrant),
		];
		let events = [];
		for (let u of this.getMovingSet(unit, loc, quadrant)) {
			effects.push(new Effect(u, "pos", Tile.offset(u.pos, dir)));
			events.push(ActionEvent.move(u, u.pos, Tile.offset(u.pos, dir)));
		}
		return new Action(
				true,
				effects,
				events,
				this.name,
				() => {
					SpecialEffect.abilityUse(unit, this);
				});
	}

	mouseOverTile(unit, loc, quadrant) {
		clearClickContextActors();
		if (!this.isMoveLegal(unit, loc, quadrant)) return;
		let dir = Tile.directionTo(unit.pos, loc);
		for (let u of this.getMovingSet(unit, loc, quadrant)) {
			clickContext.actors.push(new AbilityMoveActor(u, Tile.offset(u.pos, dir), u == unit ? quadrant : u.facing, u == unit));
		}
	}

	isMoveLegal(unit, loc, quadrant) {
		if (unit.actionPoints < 1) return false;
		if (Tile.distanceBetween(unit.pos, loc) != 1) return false;
		if (!this.getMovingSet(unit, loc, quadrant).includes(unit)) return false;
		return true;
	}

	getMovingSet(unit, loc, quadrant) {
		let moveDir = Tile.directionTo(unit.pos, loc);
		let movers = [unit];
		for (let dir = 0; dir < 4; dir++) {
			let u = gameState.getUnitAt(Tile.offset(unit.pos, dir));
			if (u == null || u.player != unit.player) continue;
			movers.push(u);
		}
		let s = 0;
		while (s != movers.length) {
			s = movers.length;
			movers = movers.filter(u => {
				let dest = Tile.offset(u.pos, moveDir);
				if (!Tile.inBounds(dest)) return false;
				if (gameState.room.getTile(dest).height > gameState.room.getTile(u.pos).height + 1) return false;
				let occupier = gameState.getUnitAt(dest);
				if (occupier != null && !movers.includes(occupier)) return false;
				return true;
			});
		}
		return movers;
	}
}();
