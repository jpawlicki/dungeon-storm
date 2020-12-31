abilityData.BITE = new class extends Ability {
	constructor() {
		super();
		this.name = "Bite";
		this.icon = "M7,2C4,2 2,5 2,8C2,10.11 3,13 4,14C5,15 6,22 8,22C12.54,22 10,15 12,15C14,15 11.46,22 16,22C18,22 19,15 20,14C21,13 22,10.11 22,8C22,5 20,2 17,2C14,2 14,3 12,3C10,3 10,2 7,2Z"
		this.minActionPoints = 1;
		this.details = [
			"Spend ♦ and select an adjacent enemy:",
			"  Roll ⚅. If greater than their strength, they !RETREAT.",
			"  Roll ⚅. If greater than your strength, !RETREAT.",
			"Anyone who !RETREATs becomes !BLOODY.",
			"This action cannot be undone."];
		this.aiHints = [AiHints.ATTACK];
		this.cost = {experience: 3};
	}

	clickOnTile(unit, loc, quadrant) {
		if (!this.isActionLegal(unit, loc, quadrant)) return;
		let target = gameState.getUnitAt(loc);
		if (target == null) return;

		let effects = [
			new Effect(unit, "actionPoints", unit.actionPoints - 1)
		];
		let events = [];

		let retreat1 = parseInt(Math.random() * 6 + 1) > target.getStrength(Tile.directionTo(target.pos, unit.pos));
		if (retreat1) {
			let retreatDir = Tile.directionTo(unit.pos, target.pos);
			effects.push(new Effect(target, "state", Unit.State.BLOODIED));
			events.push(ActionEvent.retreat(target, retreatDir));
		}

		let retreat2 = parseInt(Math.random() * 6 + 1) > unit.getStrength(Tile.directionTo(unit.pos, target.pos));
		if (retreat2) {
			let retreatDir = Tile.directionTo(target.pos, unit.pos);
			effects.push(new Effect(unit, "state", Unit.State.BLOODIED));
			events.push(ActionEvent.retreat(unit, retreatDir));
		}

		let tpos = target.pos;
		let upos = unit.pos;
		return new Action(false, effects, events, this.name, () => {
			SpecialEffect.abilityUse(unit, this);
			SpecialEffect.attackClash(tpos, upos, retreat1, retreat2);
		});
	}

	mouseOverTile(unit, loc, quadrant) {
		clearClickContextActors();
		if (!this.isActionLegal(unit, loc, quadrant)) return;
		let target = gameState.getUnitAt(loc);
		if (target == null) return;

		// Attacker
		let hypo = Object.assign(new Unit(), unit);
		hypo.actionPoints--;
		let attackerRetreatChance = Math.min(1, Math.max(0, 1 - unit.getStrength(Tile.directionTo(unit.pos, loc)) / 6.0));
		let attackerRetreatDir = Tile.directionTo(loc, unit.pos);
		if (hypo.canRetreat(attackerRetreatDir)) {
			clickContext.actors.push(new RetreatActor(unit, attackerRetreatDir, attackerRetreatChance));
		} else {
			clickContext.actors.push(new DefeatActor(unit, attackerRetreatChance));
		}

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
		if (unit.actionPoints < 1) return false;
		if (Math.abs(unit.pos[0] - loc[0]) + Math.abs(unit.pos[1] - loc[1]) != 1) return false;
		let target = gameState.getUnitAt(loc);
		if (target == null) return false;
		if (target.player == unit.player) return false;
		return true;
	}
}();

class RetreatActor {
	// g

	constructor(unit, facing, chance) {
		this.g = document.createElementNS("http://www.w3.org/2000/svg", "g");
		this.g.style.opacity = 0.9;
		this.g.style.pointerEvents = "none";

		let corners = getTilePoints(unit.pos[0], unit.pos[1], gameState.room.getTile(unit.pos).height);
		let center = [corners[0][0], corners[1][1]];

		let circ = document.createElementNS("http://www.w3.org/2000/svg", "circle");
		circ.setAttribute("cx", center[0]);
		circ.setAttribute("cy", center[1]);
		circ.setAttribute("r", "17");
		circ.setAttribute("stroke", "#c00");
		circ.setAttribute("stroke-width", "3");
		circ.setAttribute("fill", "transparent");
		this.g.appendChild(circ);

		let dest = Tile.offset(unit.pos, facing);
		let srcEdgePoint = getTileEdgeCenter(unit.pos, facing);
		let dstEdgePoint = getTileEdgeCenter(dest, (facing + 2) % 4);
		let dstCenterPoint = getTileCenter(dest);
		let dstPoints = getTileCorners(dest);
		function meanPoint(p1, p2, amt) {
			return [p1[0] * (1 - amt) + p2[0] * amt, p1[1] * (1 - amt) + p2[1] * amt];
		}
		let destCenter = getTilePoints(Tile.offset(unit.pos, facing))
		let arrow = document.createElementNS("http://www.w3.org/2000/svg", "path");
		arrow.setAttribute("d", "M" + [
			meanPoint(center, srcEdgePoint, 0.55),	
			srcEdgePoint,
			dstEdgePoint,
			dstCenterPoint,
			meanPoint(dstCenterPoint, dstPoints[(facing + 2) % 4], 0.3),
			dstCenterPoint,
			meanPoint(dstCenterPoint, dstPoints[(facing + 3) % 4], 0.3),
		].map(a => a[0] + "," + a[1]).join("L"));
		arrow.setAttribute("stroke", "#c00");
		arrow.setAttribute("stroke-width", "3");
		arrow.setAttribute("stroke-linecap", "round");
		arrow.setAttribute("stroke-linejoin", "round");
		arrow.setAttribute("fill", "transparent");
		this.g.appendChild(arrow);


		let text = document.createElementNS("http://www.w3.org/2000/svg", "text");
		text.setAttribute("x", corners[0][0]);
		text.setAttribute("y", corners[0][1] * .7 + corners[2][1] * .3);
		text.setAttribute("text-anchor", "middle");
		text.setAttribute("fill", "#f00");
		text.setAttribute("stroke", "#000");
		text.setAttribute("stroke-width", "0.5");
		text.setAttribute("font-weight", "bold");
		text.setAttribute("style", "text-shadow: #000 2px 2px 3px, #000 0 0 5px");
		text.appendChild(document.createTextNode(Math.round(chance * 100) + "%"));
		this.g.appendChild(text);

		document.getElementById("clickContextGroup").appendChild(this.g);
	}

	destroy() {
		this.g.parentNode.removeChild(this.g);
	}
}

class DefeatActor {
	// g

	constructor(unit, chance) {
		this.g = document.createElementNS("http://www.w3.org/2000/svg", "g");
		this.g.style.opacity = 0.9;
		this.g.style.pointerEvents = "none";

		let corners = getTilePoints(unit.pos[0], unit.pos[1], gameState.room.getTile(unit.pos).height);
		
		let x = document.createElementNS("http://www.w3.org/2000/svg", "path");
		x.setAttribute("d", "M" + (corners[0][0] + corners[1][0]) / 2 + "," + (corners[0][1] + corners[1][1]) / 2 + "L" + (corners[2][0] + corners[3][0]) / 2 + "," + (corners[2][1] + corners[3][1]) / 2);
		x.setAttribute("stroke-width", "3");
		x.setAttribute("stroke", "#c00");
		this.g.appendChild(x);

		let text = document.createElementNS("http://www.w3.org/2000/svg", "text");
		text.setAttribute("x", corners[0][0]);
		text.setAttribute("y", corners[0][1] * .7 + corners[2][1] * .3);
		text.setAttribute("text-anchor", "middle");
		text.setAttribute("fill", "#f00");
		text.setAttribute("stroke", "#000");
		text.setAttribute("stroke-width", "0.5");
		text.setAttribute("font-weight", "bold");
		text.setAttribute("style", "text-shadow: #000 2px 2px 3px, #000 0 0 5px");
		text.appendChild(document.createTextNode(Math.round(chance * 100) + "%"));
		this.g.appendChild(text);

		document.getElementById("clickContextGroup").appendChild(this.g);
	}

	destroy() {
		this.g.parentNode.removeChild(this.g);
	}
}
