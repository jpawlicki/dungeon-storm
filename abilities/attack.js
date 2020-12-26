abilityData.ATTACK = new class extends Ability {
	constructor() {
		super();
		this.name = "Attack";
		this.icon = "M6.92,5H5L14,14L15,13.06M19.96,19.12L19.12,19.96C18.73,20.35 18.1,20.35 17.71,19.96L14.59,16.84L11.91,19.5L10.5,18.09L11.92,16.67L3,7.75V3H7.75L16.67,11.92L18.09,10.5L19.5,11.91L16.83,14.58L19.95,17.7C20.35,18.1 20.35,18.73 19.96,19.12Z";
		this.minActionPoints = 1;
		this.details = [
			"Spend ♦ and select an adjacent enemy:",
			"  Roll ⚅. If greater than their strength, they retreat.",
			"  Roll ⚅. If greater than your strength, retreat.",
			"Anyone who retreats becomes bloodied.",
			"Anyone who retreats into a wall or another unit is defeated.",
			"This action cannot be undone."];
		this.aiHints = [AiHints.ATTACK];
		this.cost = {experience: 1};
	}

	clickOnTile(unit, loc, quadrant) {
		if (!this.isMoveLegal(unit, loc, quadrant)) return;
		let target = gameState.currentState.getUnitAt(loc);
		if (target == null) return;
		clearClickContextActors();

		let effects = [
			new Effect(unit, "actionPoints", unit.actionPoints - 1)
		];

		let retreat1 = parseInt(Math.random() * 6 + 1) > target.getStrength(Tile.directionTo(target.pos, unit.pos));
		if (retreat1) {
			let retreatDir = Tile.directionTo(unit.pos, target.pos);
			if (this.canRetreat(target, retreatDir)) {
				effects.push(new Effect(target, "state", Unit.State.BLOODIED));
				effects.push(new Effect(target, "pos", Tile.offset(target.pos, retreatDir)));
			} else {
				effects.push(new Effect(target, "state", Unit.State.DEFEATED));
			}
		}

		let retreat2 = parseInt(Math.random() * 6 + 1) > unit.getStrength(Tile.directionTo(unit.pos, target.pos));
		if (retreat2) {
			let retreatDir = Tile.directionTo(target.pos, unit.pos);
			if (this.canRetreat(unit, retreatDir)) {
				effects.push(new Effect(unit, "state", Unit.State.BLOODIED));
				effects.push(new Effect(unit, "pos", Tile.offset(unit.pos, retreatDir)));
			} else {
				effects.push(new Effect(unit, "state", Unit.State.DEFEATED));
			}
		}

		let tpos = target.pos;
		let upos = unit.pos;
		return new Action(false, effects, this.name, () => {
			SpecialEffect.attackClash(tpos, upos, retreat1, retreat2);
		});
	}

	mouseOverTile(unit, loc, quadrant) {
		clearClickContextActors();
		if (!this.isMoveLegal(unit, loc, quadrant)) return;
		let target = gameState.currentState.getUnitAt(loc);
		if (target == null) return;

		// Attacker
		let attackerRetreatChance = Math.min(1, Math.max(0, 1 - unit.getStrength(Tile.directionTo(unit.pos, loc)) / 6.0));
		let attackerRetreatDir = Tile.directionTo(loc, unit.pos);
		if (this.canRetreat(unit, attackerRetreatDir)) {
			clickContext.actors.push(new RetreatActor(unit, attackerRetreatDir, attackerRetreatChance));
		} else {
			clickContext.actors.push(new DefeatActor(unit, attackerRetreatChance));
		}

		// Defender
		let defenderRetreatChance = Math.min(1, Math.max(0, 1 - target.getStrength(Tile.directionTo(loc, unit.pos)) / 6.0));
		let defenderRetreatDir = Tile.directionTo(unit.pos, loc);
		if (this.canRetreat(target, defenderRetreatDir)) {
			clickContext.actors.push(new RetreatActor(target, defenderRetreatDir, defenderRetreatChance));
		} else {
			clickContext.actors.push(new DefeatActor(target, defenderRetreatChance));
		}
	}

	isMoveLegal(unit, loc, quadrant) {
		if (unit.actionPoints < 1) return false;
		if (Math.abs(unit.pos[0] - loc[0]) + Math.abs(unit.pos[1] - loc[1]) != 1) return false;
		let target = gameState.currentState.getUnitAt(loc);
		if (target == null) return false;
		if (target.player == unit.player) return false;
		return true;
	}

	canRetreat(unit, direction) {
		let newPos = Tile.offset(unit.pos, direction);
		if (!gameState.currentState.fortress.inBounds(newPos)) return false;
		if (gameState.currentState.getUnitAt(newPos) != undefined) return false;
		// TODO: test if unit is threatened by a perpendicular unit.
		return true;
	}
}();

class RetreatActor {
	// g

	constructor(unit, facing, chance) {
		this.g = document.createElementNS("http://www.w3.org/2000/svg", "g");
		this.g.style.opacity = 0.9;
		this.g.style.pointerEvents = "none";

		let corners = getTilePoints(unit.pos[0], unit.pos[1], gameState.currentState.fortress.getTile(unit.pos).height);
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

		let corners = getTilePoints(unit.pos[0], unit.pos[1], gameState.currentState.fortress.getTile(unit.pos).height);
		
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
