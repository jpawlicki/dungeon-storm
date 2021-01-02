abilityData.MOVE = new class extends Ability {
	constructor() {
		super();
		this.name = "Move";
		this.icon = "M16 2A2 2 0 1 1 14 4A2 2 0 0 1 16 2M12.04 3A1.5 1.5 0 1 1 10.54 4.5A1.5 1.5 0 0 1 12.04 3M9.09 4.5A1 1 0 1 1 8.09 5.5A1 1 0 0 1 9.09 4.5M7.04 6A1 1 0 1 1 6.04 7A1 1 0 0 1 7.04 6M14.53 12A2.5 2.5 0 0 0 17 9.24A2.6 2.6 0 0 0 14.39 7H11.91A6 6 0 0 0 6.12 11.4A2 2 0 0 0 6.23 12.8A6.8 6.8 0 0 1 6.91 15.76A6.89 6.89 0 0 1 6.22 18.55A1.92 1.92 0 0 0 6.3 20.31A3.62 3.62 0 0 0 10.19 21.91A3.5 3.5 0 0 0 12.36 16.63A2.82 2.82 0 0 1 11.91 15S11.68 12 14.53 12Z";
		this.minActionPoints = 1;
		this.details = [
			"Use ♦. Either:",
			"  1. !MOVE to an adjacent empty space and rotate. Cannot rise more than 1 step.",
			"Or:",
			"  2. Rotate in the same space."];
		this.aiHints = [AiHints.MOVE];
	}

	clickOnTile(unit, loc, quadrant) {
		if (!this.isMoveLegal(unit, loc, quadrant)) return null;
		return new Action(
				true,
				[
					new Effect(unit, "pos", loc),
					new Effect(unit, "facing", quadrant),
					new Effect(unit, "actionPoints", unit.actionPoints - 1)
				],
				loc[0] == unit.pos[0] && loc[1] == unit.pos[1] ? [] : [ActionEvent.move(unit, unit.pos, loc)],
				this.name,
				() => {
					SpecialEffect.abilityUse(unit, this);
				});
	}

	mouseOverTile(unit, loc, quadrant) {
		clearClickContextActors();
		if (!this.isMoveLegal(unit, loc, quadrant)) return;
		clickContext.actors.push(new AbilityMoveActor(unit, loc, quadrant));
	}

	isMoveLegal(unit, loc, quadrant) {
		if (unit.actionPoints < 1) return false;
		if (Tile.distanceBetween(unit.pos, loc) > 1) return false;
		if (gameState.room.getTile(unit.pos).height < gameState.room.getTile(loc).height - 1) return false;
		let dstUnit = gameState.getUnitAt(loc);
		if (dstUnit != null && dstUnit != unit) return false;
		return true;
	}
}();

class AbilityMoveActor {
	// g

	constructor(unit, loc, facing, deductActionPoint=true, unitTransformFunc) {
		this.g = document.createElementNS("http://www.w3.org/2000/svg", "g");
		this.g.style.opacity = 0.7;
		this.g.style.pointerEvents = "none";
		let u = Object.assign(new Unit(), unit);
		u.facing = facing;
		u.pos = loc;
		if (deductActionPoint) u.actionPoints -= 1;
		if (unitTransformFunc != undefined) unitTransformFunc(u);
		new UnitActor(u, this.g, gameState.room);
		document.getElementById("clickContextGroup").appendChild(this.g);
	}

	destroy() {
		this.g.parentNode.removeChild(this.g);
	}
}
