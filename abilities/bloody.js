abilityData.BLOODY = new class extends Ability {
	constructor() {
		super();
		this.name = "Bloody";
		this.icon = "M12,20A6,6 0 0,1 6,14C6,10 12,3.25 12,3.25C12,3.25 18,10 18,14A6,6 0 0,1 12,20Z";
		this.minActionPoints = 1;
		this.details = ["Spend ♦ and !BLOODY an adjacent unbloodied unit."];
		this.aiHints = [AiHints.ATTACK];
		this.cost = {experience: 4};
	}

	clickOnTile(unit, loc, quadrant) {
		if (!this.isActionLegal(unit, loc, quadrant)) return;
		let target = gameState.getUnitAt(loc);
		if (target == null) return;

		let effects = [
			new Effect(unit, "actionPoints", unit.actionPoints - this.minActionPoints),
			new Effect(target, "state", Unit.State.BLOODIED),
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
		clickContext.actors.push(new BloodyOverlayActor(target));
	}

	isActionLegal(unit, loc, quadrant) {
		if (unit.actionPoints < this.minActionPoints) return false;
		if (Tile.distanceBetween(unit.pos, loc) != 1) return false;
		let target = gameState.getUnitAt(loc);
		if (target == null) return false;
		if (target.state == Unit.State.BLOODIED) return false;
		return true;
	}
}();

class BloodyOverlayActor {
	// g

	constructor(unit) {
		this.g = document.createElementNS("http://www.w3.org/2000/svg", "g");
		this.g.style.opacity = 0.9;
		this.g.style.pointerEvents = "none";

		let bloodied = document.createElementNS("http://www.w3.org/2000/svg", "path");
		bloodied.style.transition = "opacity 0.5s cubic-bezier(0, 2, 1, -1)";
		bloodied.setAttribute("d", "M-17 0A17 13 0 0 0 17 0A17 19 0 0 1 -17 0M0,8A6,6 0 0,1 -6,2C-6,-2 0,-8.75 0,-8.75C0,-8.25 6,-2 6,2A6,6 0 0,1 0,8Z");
		bloodied.setAttribute("fill", "#8a0303");
		this.g.appendChild(bloodied);

		let center = getTileCenter(unit.pos);
		this.g.style.transform = "translate(" + center[0] + "px, " + center[1] + "px)";

		document.getElementById("clickContextGroup").appendChild(this.g);
	}

	destroy() {
		this.g.parentNode.removeChild(this.g);
	}
}
