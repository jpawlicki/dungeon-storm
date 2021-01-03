abilityData.FRIGHTEN = new class extends Ability {
	constructor() {
		super();
		this.name = "Frighten";
		this.icon = "M12,20A6,6 0 0,1 6,14C6,10 12,3.25 12,3.25C12,3.25 18,10 18,14A6,6 0 0,1 12,20Z";
		this.minActionPoints = 1;
		this.details = ["Use ♦. !FRIGHTEN an adjacent !FRIEND or !ENEMY that is not already !FRIGHTENED."];
		this.aiHints = [AiHints.ATTACK];
	}

	clickOnTile(unit, loc, quadrant) {
		if (!this.isActionLegal(unit, loc, quadrant)) return;
		let target = gameState.getUnitAt(loc);
		if (target == null) return;

		let effects = [
			new Effect(unit, "actionPoints", unit.actionPoints - this.minActionPoints),
			new Effect(target, "state", Unit.State.FRIGHTENED),
		];
		return new Action(true, effects, [], this.name, () => {
			SpecialEffect.abilityUse(unit, this);
		});
	}

	mouseOverTile(unit, loc, quadrant) {
		if (!this.isActionLegal(unit, loc, quadrant)) return;
		let target = gameState.getUnitAt(loc);
		if (target == null) return;

		// Attacker
		clickContext.actors.push(new FrightenedOverlayActor(target));
	}

	isActionLegal(unit, loc, quadrant) {
		if (unit.actionPoints < this.minActionPoints) return false;
		if (Tile.distanceBetween(unit.pos, loc) != 1) return false;
		let target = gameState.getUnitAt(loc);
		if (target == null) return false;
		if (target.state == Unit.State.FRIGHTENED) return false;
		return true;
	}
}();

class FrightenedOverlayActor {
	// g

	constructor(unit) {
		this.g = document.createElementNS("http://www.w3.org/2000/svg", "g");
		this.g.style.opacity = 0.9;
		this.g.style.pointerEvents = "none";

		let frightened = document.createElementNS("http://www.w3.org/2000/svg", "path");
		frightened.style.transition = "opacity 0.5s cubic-bezier(0, 2, 1, -1)";
		frightened.setAttribute("d", "M-14,-8.66C-14,-11.33 -10,-15.83 -10,-15.83C-10,-15.83 -6,-11.66 -6,-8.66A4,4 0 0,1 -14,-8.66Z");
		frightened.setAttribute("fill", "#cdf");
		frightened.setAttribute("stroke", "#000");
		frightened.setAttribute("stroke-width", "1");
		this.g.appendChild(frightened);

		let center = getTileCenter(unit.pos);
		this.g.style.transform = "translate(" + center[0] + "px, " + center[1] + "px)";

		document.getElementById("clickContextGroup").appendChild(this.g);
	}

	destroy() {
		this.g.parentNode.removeChild(this.g);
	}
}
