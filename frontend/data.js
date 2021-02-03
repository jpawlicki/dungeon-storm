abilityData.ADVANCE = new class extends Ability {
	constructor() {
		super();
		this.name = "Advance";
		this.icon = "M12,22A2,2 0 0,1 10,20A2,2 0 0,1 12,18A2,2 0 0,1 14,20A2,2 0 0,1 12,22M13,2V13L17.5,8.5L18.92,9.92L12,16.84L5.08,9.92L6.5,8.5L11,13V2H13Z";
		this.minActionPoints = 1;
		this.details = [
			"Use ♦. Select an adjacent !ENEMY. If ⚅ is greater than the !ENEMY's ○, the !ENEMY becomes !FRIGHTENED and !RETREATs, and this !FRIEND teleports into their space.",
			"Cannot rise more than 1 step.",
			"Cannot be undone."];
		this.aiHints = [AiHints.ATTACK, AiHints.PUSHER];
	}

	clickOnTile(unit, loc, quadrant) {
		if (!this.isActionLegal(unit, loc, quadrant)) return;
		let target = gameState.getUnitAt(loc);
		if (target == null) return;

		let effects = [
			new Effect(unit, "actionPoints", unit.actionPoints - 1)
		];
		let events = [];

		let defenderStr = target.getStrength(Tile.directionTo(target.pos, unit.pos));
		let success = Util.roll() > defenderStr;
		if (success) {
			// Defender retreats
			let retreatDir = Tile.directionTo(unit.pos, target.pos);
			effects.push(new Effect(target, "state", Unit.State.FRIGHTENED));
			effects.push(new Effect(unit, "pos", target.pos.slice()));
			events.push(ActionEvent.retreat(target, retreatDir));
		}

		let tpos = target.pos;
		let upos = unit.pos;
		return new Action(false, effects, events, this.name, () => {
			SpecialEffect.abilityUse(unit, this);
			SpecialEffect.attackClash(tpos, upos, success, false);
		});
	}

	mouseOverTile(unit, loc, quadrant) {
		clearClickContextActors();
		if (!this.isActionLegal(unit, loc, quadrant)) return;
		let target = gameState.getUnitAt(loc);
		if (target == null) return;

		clickContext.actors.push(new AbilityMoveActor(unit, loc, unit.facing));
		let defenderStr = target.getStrength(Tile.directionTo(target.pos, unit.pos));
		let defenderRetreatChance = Math.min(1, Math.max(0, 1 - target.getStrength(Tile.directionTo(target.pos, unit.pos)) / 6.0));
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
		if (gameState.room.getTile(unit.pos).height < gameState.room.getTile(loc).height - 1) return false;
		let target = gameState.getUnitAt(loc);
		if (target == null) return false;
		if (target.player == unit.player) return false;
		return true;
	}
}();
abilityData.BACKSTAB = new class extends Ability {
	constructor() {
		super();
		this.name = "Backstab";
		this.icon = "M22,2L17.39,3.75L10.46,10.68L14,14.22L20.92,7.29C22.43,5.78 22,2 22,2M8.33,10L6.92,11.39L8.33,12.8L2.68,18.46L6.21,22L11.87,16.34L13.28,17.76L14.7,16.34L8.33,10Z";
		this.minActionPoints = 1;
		this.details = [
			"Use ♦. Select an adjacent !ENEMY that is !THREATENed by another !FRIEND. It becomes !FRIGHTENED and !RETREATs.",
			"Cannot select a !ENEMY that !THREATENs this !FRIEND."];
		this.aiHints = [AiHints.ATTACK, AiHints.PUSHER];
	}

	clickOnTile(unit, loc, quadrant) {
		if (!this.isActionLegal(unit, loc, quadrant)) return;
		let target = gameState.getUnitAt(loc);

		return new Action(
				true,
				[
					new Effect(unit, "actionPoints", unit.actionPoints - 1),
					new Effect(target, "state", Unit.State.FRIGHTENED),
				],
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
		let target = gameState.getUnitAt(loc);
		if (target == null) return false;
		if (target.player == unit.player) return false;
		if (target.threatens(unit, unit.pos)) return false;
		let otherThreat = false;
		for (let u of gameState.units) if (u != unit && u.threatens(target, target.pos)) otherThreat = true;
		if (!otherThreat) return false;
		return true;
	}
}();
abilityData.BITE = new class extends Ability {

	constructor() {
		super();
		this.name = "Bite";
		this.icon = "M7,2C4,2 2,5 2,8C2,10.11 3,13 4,14C5,15 6,22 8,22C12.54,22 10,15 12,15C14,15 11.46,22 16,22C18,22 19,15 20,14C21,13 22,10.11 22,8C22,5 20,2 17,2C14,2 14,3 12,3C10,3 10,2 7,2Z"
		this.minActionPoints = 1;
		this.details = [
			"Use ♦. Select an adjacent !ENEMY. If ⚅ is greater than or equal to the !ENEMY's ○, the !ENEMY becomes !FRIGHTENED and !RETREATs.",
			"Otherwise, this !FRIEND becomes !FRIGHTENED and !RETREATs (which may require another ♦).",
			"Cannot be undone."];
		this.aiHints = [AiHints.ATTACK, AiHints.PUSHER];
	}

	clickOnTile(unit, loc, quadrant) {
		if (!this.isActionLegal(unit, loc, quadrant)) return;
		let target = gameState.getUnitAt(loc);
		if (target == null) return;

		let effects = [
			new Effect(unit, "actionPoints", unit.actionPoints - 1)
		];
		let events = [];

		let retreat1 = parseInt(Math.random() * 6 + 1) >= target.getStrength(Tile.directionTo(target.pos, unit.pos));
		if (retreat1) {
			let retreatDir = Tile.directionTo(unit.pos, target.pos);
			effects.push(new Effect(target, "state", Unit.State.FRIGHTENED));
			events.push(ActionEvent.retreat(target, retreatDir));
		}

		let retreat2 = !retreat1;
		if (retreat2) {
			let retreatDir = Tile.directionTo(target.pos, unit.pos);
			effects.push(new Effect(unit, "state", Unit.State.FRIGHTENED));
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

		let successChance = Math.min(1, Math.max(0, 1 - (target.getStrength(Tile.directionTo(target.pos, unit.pos)) - 1) / 6.0));

		// Attacker
		let hypo = Object.assign(new Unit(), unit);
		hypo.actionPoints--;
		let attackerRetreatChance = 1 - successChance;
		let attackerRetreatDir = Tile.directionTo(loc, unit.pos);
		if (hypo.canRetreat(attackerRetreatDir)) {
			clickContext.actors.push(new RetreatActor(unit, attackerRetreatDir, attackerRetreatChance));
		} else {
			clickContext.actors.push(new DefeatActor(unit, attackerRetreatChance));
		}

		// Defender
		let defenderRetreatChance = successChance;
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
		this.g.style.opacity = 1;
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
		this.g.style.opacity = 1;
		this.g.style.pointerEvents = "none";

		let corners = getTilePoints(unit.pos[0], unit.pos[1], gameState.room.getTile(unit.pos).height);
		let center = getTileCenter(unit.pos);
		
		let x = document.createElementNS("http://www.w3.org/2000/svg", "path");
		x.setAttribute("d", "M" + (center[0] - 17) + "," + (center[1] - 17) + "L" + (center[0] + 17) + "," + (center[1] + 17) + "M" + (center[0] - 17) + "," + (center[1] + 17) + "L" + (center[0] + 17) + "," + (center[1] - 17));
		x.setAttribute("stroke-width", "3");
		x.setAttribute("clip-path", "circle()");
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
abilityData.CHALLENGE = new class extends Ability {
	constructor() {
		super();
		this.name = "Challenge";
		this.icon = "M11,17H4A2,2 0 0,1 2,15V3A2,2 0 0,1 4,1H16V3H4V15H11V13L15,16L11,19V17M19,21V7H8V13H6V7A2,2 0 0,1 8,5H19A2,2 0 0,1 21,7V21A2,2 0 0,1 19,23H8A2,2 0 0,1 6,21V19H8V21H19Z";
		this.minActionPoints = 1;
		this.details = ["Use ♦. Teleport to an empty space !THREATENED by an !ENEMY, with any facing."];
		this.aiHints = [AiHints.MOVE];
	}

	clickOnTile(unit, loc, quadrant) {
		if (!this.isLegal(unit, loc, quadrant)) return;
		return new Action(
				true,
				[
					new Effect(unit, "actionPoints", unit.actionPoints - 1),
					new Effect(unit, "pos", loc),
					new Effect(unit, "facing", quadrant),
				],
				[],
				this.name,
				() => {
					SpecialEffect.abilityUse(unit, this);
				});
	}

	mouseOverTile(unit, loc, quadrant) {
		clearClickContextActors();
		if (!this.isLegal(unit, loc, quadrant)) return;
		clickContext.actors.push(new AbilityMoveActor(unit, loc, quadrant));
	}

	isLegal(unit, loc, quadrant) {
		if (gameState.getUnitAt(loc) != null) return false;
		if (unit.actionPoints < 1) return false;
		let hasEnemyThreat = false;
		for (let d = 0; d < 4; d++) {
			let u = gameState.getUnitAt(Tile.offset(loc, d));
			if (u != null && u.threatens(unit, loc)) hasEnemyThreat = true;
		}
		if (!hasEnemyThreat) return false;
		return true;
	}
}();
abilityData.CHARGE = new class extends Ability {
	constructor() {
		super();
		this.name = "Charge";
		this.icon = "M15.59,9C17.7,7.74 19,5.46 19,3H17A5,5 0 0,1 12,8A5,5 0 0,1 7,3H5C5,5.46 6.3,7.74 8.41,9C5.09,11 4,15.28 6,18.6C7.97,21.92 12.27,23 15.59,21C18.91,19.04 20,14.74 18,11.42C17.42,10.43 16.58,9.59 15.59,9M12,20A5,5 0 0,1 7,15A5,5 0 0,1 12,10A5,5 0 0,1 17,15A5,5 0 0,1 12,20Z";
		this.minActionPoints = 2;
		this.details = [
			"Use ♦♦. Select a !ENEMY in a straight line and !MOVE to its space. It becomes !FRIGHTENED and !RETREATs.",
			"Cannot select a !ENEMY behind a rise of 2 or more steps.",
			"Cannot select a !ENEMY behind a different !ENEMY or !FRIEND.",
			"Cannot select an adjacent !ENEMY.",
			"Cannot select a !ENEMY with greater ○."];
		this.aiHints = [AiHints.ATTACK, AiHints.PUSHER];
	}

	clickOnTile(unit, loc, quadrant) {
		if (!this.isActionLegal(unit, loc, quadrant)) return;
		let target = gameState.getUnitAt(loc);
		if (target == null) return;

		let effects = [
			new Effect(unit, "actionPoints", unit.actionPoints - 2),
			new Effect(unit, "pos", loc),
			new Effect(target, "state", Unit.State.FRIGHTENED),
		];
		let events = [
			ActionEvent.retreat(target, Tile.directionTo(unit.pos, loc)),
			ActionEvent.move(unit, unit.pos, loc),
		];

		let tpos = target.pos;
		let upos = unit.pos;
		return new Action(true, effects, events, this.name, () => {
			SpecialEffect.abilityUse(unit, this);
			SpecialEffect.attackClash(Tile.offset(tpos, Tile.directionTo(tpos, upos)), upos, true, false);
		});
	}

	mouseOverTile(unit, loc, quadrant) {
		clearClickContextActors();
		if (!this.isActionLegal(unit, loc, quadrant)) return;
		let target = gameState.getUnitAt(loc);
		if (target == null) return;

		// Defender
		let defenderRetreatChance = 1;
		let defenderRetreatDir = Tile.directionTo(unit.pos, loc);
		if (target.canRetreat(defenderRetreatDir)) {
			clickContext.actors.push(new RetreatActor(target, defenderRetreatDir, defenderRetreatChance));
		} else {
			clickContext.actors.push(new DefeatActor(target, defenderRetreatChance));
		}

		// Attacker
		clickContext.actors.push(new AbilityMoveActor(unit, loc, unit.facing, false, u => u.actionPoints -= 2));
	}

	isActionLegal(unit, loc, quadrant) {
		if (unit.actionPoints < 2) return false;
		if (Tile.distanceBetween(unit.pos, loc) <= 1) return false;
		let dirTo = Tile.directionTo(unit.pos, loc);
		if (dirTo == -1) return false;
		let prevHeight = gameState.room.getTile(unit.pos).height;
		let checkPoint = Tile.offset(unit.pos, dirTo);
		while (checkPoint[0] != loc[0] || checkPoint[1] != loc[1]) {
			let checkHeight = gameState.room.getTile(checkPoint).height;
			if (checkHeight >= prevHeight + 2) return false;
			if (gameState.getUnitAt(checkPoint) != null) return false;
			checkPoint = Tile.offset(checkPoint, dirTo);
			prevHeight = checkHeight;
		}
		if (gameState.room.getTile(loc).height >= prevHeight + 2) return false;
		let target = gameState.getUnitAt(loc);
		if (target == null) return false;
		if (target.player == unit.player) return false;
		if (target.getStrength(Tile.directionTo(target.pos, unit.pos)) > unit.getStrength(Tile.directionTo(unit.pos, target.pos))) return false;
		return true;
	}
}();
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
abilityData.CONTROL = new class extends Ability {
	constructor() {
		super();
		this.name = "Control";
		this.icon = "M14.8 7V5.5C14.8 4.1 13.4 3 12 3S9.2 4.1 9.2 5.5V7C8.6 7 8 7.6 8 8.2V11.7C8 12.4 8.6 13 9.2 13H14.7C15.4 13 16 12.4 16 11.8V8.3C16 7.6 15.4 7 14.8 7M13.5 7H10.5V5.5C10.5 4.7 11.2 4.2 12 4.2S13.5 4.7 13.5 5.5V7M6 17V20L2 16L6 12V15H18V12L22 16L18 20V17H6Z";
		this.minActionPoints = 0;
		this.details = ["!REACTION: !ENEMYs !THREATENed by this !FRIEND are !DEFEATed if they !MOVE in any direction other than directly away from this !FRIEND."];
		this.aiHints = [];
	}

	clickOnTile(unit, loc, quadrant) {}

	mouseOverTile(unit, loc, quadrant) {}

	actionEvent(unit, action) {
		let movingUnits = [];
		let reactions = [];
		for (let ev of action.events) if (ev.type == ActionEvent.MOVE) movingUnits.push(ev.who);
		for (let u of movingUnits) {
			for (let ef of action.effects) {
				if (ef.unit == u && ef.property == "pos") {
					if (unit.threatens(u, ef.oldValue) && Tile.directionTo(unit.pos, ef.oldValue) != Tile.directionTo(ef.oldValue, ef.value)) {
						reactions.push(new Action(
								true,
								[
									new Effect(u, "state", Unit.State.DEFEATED),
								],
								[ActionEvent.defeat(u)],
								this.name,
								() => {
									SpecialEffect.abilityUse(unit, this);
								}));
					}
				}
			}
		}
		return reactions;
	}
}();
abilityData.DEFENDER = new class extends Ability {
	constructor() {
		super();
		this.name = "Defender";
		this.icon = "M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1Z";
		this.minActionPoints = 0;
		this.details = ["!REACTION: When another !FRIEND !RETREATs, gain ♦."];
		this.aiHints = [];
	}

	clickOnTile(unit, loc, quadrant) {}

	mouseOverTile(unit, loc, quadrant) {}

	actionEvent(unit, action) {
		let reactions = [];
		let retreating = 0;
		for (let e of action.events) if (e.type == ActionEvent.RETREAT && e.who != unit && e.who.player == unit.player) retreating++;
		if (retreating > 0) {
			reactions.push(new Action(
					true,
					[
						new Effect(unit, "actionPoints", unit.actionPoints + retreating),
					],
					[],
					this.name,
					() => {
						SpecialEffect.abilityUse(unit, this);
					}));
		}
		return reactions;
	}
}();
abilityData.DESPERATION = new class extends Ability {
	constructor() {
		super();
		this.name = "Desperation";
		this.icon = "M11,15H13V17H11V15M11,7H13V13H11V7M12,3A9,9 0 0,0 3,12A9,9 0 0,0 12,21A9,9 0 0,0 21,12A9,9 0 0,0 12,3M12,19C8.14,19 5,15.86 5,12C5,8.14 8.14,5 12,5C15.86,5 19,8.14 19,12C19,15.86 15.86,19 12,19M20.5,20.5C22.66,18.31 24,15.31 24,12C24,8.69 22.66,5.69 20.5,3.5L19.42,4.58C21.32,6.5 22.5,9.11 22.5,12C22.5,14.9 21.32,17.5 19.42,19.42L20.5,20.5M4.58,19.42C2.68,17.5 1.5,14.9 1.5,12C1.5,9.11 2.68,6.5 4.58,4.58L3.5,3.5C1.34,5.69 0,8.69 0,12C0,15.31 1.34,18.31 3.5,20.5L4.58,19.42Z";
		this.minActionPoints = 1;
		this.details = [
			"Use ♦. Become !FRIGHTENED. !DEFEAT an adjacent !ENEMY.",
			"Cannot be used if !FRIGHTENED."];
		this.aiHints = [AiHints.ATTACK];
	}

	clickOnTile(unit, loc, quadrant) {
		if (!this.isActionLegal(unit, loc, quadrant)) return;
		let target = gameState.getUnitAt(loc);

		return new Action(
				true,
				[
					new Effect(unit, "actionPoints", unit.actionPoints - 1),
					new Effect(target, "state", Unit.State.DEFEATED),
					new Effect(unit, "state", Unit.State.FRIGHTENED),
				],
				[ActionEvent.defeat(target)],
				this.name,
					() => {
						SpecialEffect.abilityUse(unit, this);
						SpecialEffect.attackClash(target.pos, unit.pos, false, false);
					});
	}

	mouseOverTile(unit, loc, quadrant) {
		clearClickContextActors();
		if (!this.isActionLegal(unit, loc, quadrant)) return;
		clickContext.actors.push(new DefeatActor(gameState.getUnitAt(loc), 1));
		clickContext.actors.push(new AbilityMoveActor(unit, unit.pos, unit.facing, false, u => u.state = Unit.State.FRIGHTENED));
	}

	isActionLegal(unit, loc, quadrant) {
		if (unit.actionPoints < 1) return false;
		if (unit.state == Unit.State.FRIGHTENED) return false;
		if (Tile.distanceBetween(unit.pos, loc) != 1) return false;
		let target = gameState.getUnitAt(loc);
		if (target == null) return false;
		if (target.player == unit.player) return false;
		return true;
	}
}();
abilityData.DISTRACT = new class extends Ability {
	constructor() {
		super();
		this.name = "Distract";
		this.icon = "M16.89,15.5L18.31,16.89C19.21,15.73 19.76,14.39 19.93,13H17.91C17.77,13.87 17.43,14.72 16.89,15.5M13,17.9V19.92C14.39,19.75 15.74,19.21 16.9,18.31L15.46,16.87C14.71,17.41 13.87,17.76 13,17.9M19.93,11C19.76,9.61 19.21,8.27 18.31,7.11L16.89,8.53C17.43,9.28 17.77,10.13 17.91,11M15.55,5.55L11,1V4.07C7.06,4.56 4,7.92 4,12C4,16.08 7.05,19.44 11,19.93V17.91C8.16,17.43 6,14.97 6,12C6,9.03 8.16,6.57 11,6.09V10L15.55,5.55Z";
		this.minActionPoints = 1;
		this.details = ["Use ♦. Rotate an adjacent !FRIEND or !ENEMY."];
		this.aiHints = [AiHints.ATTACK];
	}

	clickOnTile(unit, loc, quadrant) {
		if (!this.isMoveLegal(unit, loc, quadrant)) return null;
		let target = gameState.getUnitAt(loc);
		return new Action(
				true,
				[
					new Effect(target, "facing", quadrant),
					new Effect(unit, "actionPoints", unit.actionPoints - 1)
				],
				[],
				this.name,
				() => {
					SpecialEffect.abilityUse(unit, this);
				});
	}

	mouseOverTile(unit, loc, quadrant) {
		clearClickContextActors();
		if (!this.isMoveLegal(unit, loc, quadrant)) return;
		let target = gameState.getUnitAt(loc);
		clickContext.actors.push(new AbilityMoveActor(target, loc, quadrant, false));
	}

	isMoveLegal(unit, loc, quadrant) {
		if (unit.actionPoints < 1) return false;
		if (Tile.distanceBetween(unit.pos, loc) != 1) return false;
		let dstUnit = gameState.getUnitAt(loc);
		if (dstUnit == null) return false;
		return true;
	}
}();
abilityData.EFFORTTELEPORT = new class extends Ability {
	constructor() {
		super();
		this.name = "EffortTeleport";
		this.icon = "M20 8V16L17 17L13.91 11.5C13.65 11.04 12.92 11.27 13 11.81L14 21L4 17L5.15 8.94C5.64 5.53 8.56 3 12 3H20L18.42 5.37C19.36 5.88 20 6.86 20 8Z";
		this.minActionPoints = 1;
		this.details = ["Teleport to an open space. Use ♦ equal to the distance travelled."];
		this.aiHints = [AiHints.MOVE, AiHints.BASIC_MOVE];
	}

	clickOnTile(unit, loc, quadrant) {
		if (!this.isMoveLegal(unit, loc, quadrant)) return null;

		let effects = [
			new AddingEffect(unit, "actionPoints", -Tile.distanceBetween(unit.pos, loc)),
			new Effect(unit, "pos", loc),
		];

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
		clickContext.actors.push(new AbilityMoveActor(unit, loc, unit.facing, false, u => {u.actionPoints -= Tile.distanceBetween(unit.pos, loc)}));
	}

	isMoveLegal(unit, loc, quadrant) {
		if (unit.actionPoints < Tile.distanceBetween(unit.pos, loc)) return false;
		let dstUnit = gameState.getUnitAt(loc);
		if (dstUnit != null) return false;
		return true;
	}
}();
abilityData.EMPATHY = new class extends Ability {
	constructor() {
		super();
		this.name = "Empathy";
		this.icon = "M12 18C12 18.7 12.12 19.36 12.34 20C12.23 20 12.12 20 12 20C8.69 20 6 17.31 6 14C6 10 12 3.25 12 3.25S16.31 8.1 17.62 12C14.5 12.22 12 14.82 12 18M21.54 15.88L20.13 14.47L18 16.59L15.88 14.47L14.47 15.88L16.59 18L14.47 20.12L15.88 21.53L18 19.41L20.12 21.53L21.53 20.12L19.41 18L21.54 15.88Z";
		this.minActionPoints = 1;
		this.details = [
				"Use ♦. Become !FRIGHTENED. Select a !FRIGHTENED !FRIEND. They are no longer !FRIGHTENED.",
				"Cannot be used if !FRIGHTENED."];
		this.aiHints = [AiHints.BUFF];
	}

	clickOnTile(unit, loc, quadrant) {
		if (!this.isMoveLegal(unit, loc, quadrant)) return null;
		let target = gameState.getUnitAt(loc);
		return new Action(
				true,
				[
					new Effect(unit, "state", Unit.State.FRIGHTENED),
					new Effect(target, "state", Unit.State.NORMAL),
				],
				[],
				this.name,
				() => {
					SpecialEffect.abilityUse(unit, this);
				});
	}

	mouseOverTile(unit, loc, quadrant) {
		clearClickContextActors();
		if (!this.isMoveLegal(unit, loc, quadrant)) return;
		let target = gameState.getUnitAt(loc);
		clickContext.actors.push(new AbilityMoveActor(unit, unit.pos, unit.facing, false, u => u.state = Unit.State.FRIGHTENED));
		clickContext.actors.push(new AbilityMoveActor(target, target.pos, target.facing, true, u => u.state = Unit.State.NORMAL));
	}

	isMoveLegal(unit, loc, quadrant) {
		if (unit.actionPoints < 1) return false;
		let target = gameState.getUnitAt(loc);
		if (target == null) return false;
		if (target.player != unit.player) return false;
		if (target.state != Unit.State.FRIGHTENED) return false;
		if (unit.state == Unit.State.FRIGHTENED) return false;
		return true;
	}
}();
abilityData.ENCOURAGE = new class extends Ability {
	constructor() {
		super();
		this.name = "Encourage";
		this.icon = "M21,9L17,5V8H10V10H17V13M7,11L3,15L7,19V16H14V14H7V11Z";
		this.minActionPoints = 1;
		this.details = [
			"Give ♦ to an adjacent !FRIEND."];
		this.aiHints = [AiHints.BUFF];
	}

	clickOnTile(unit, loc, quadrant) {
		if (!this.isMoveLegal(unit, loc, quadrant)) return null;
		let target = gameState.getUnitAt(loc);
		return new Action(
				true,
				[
					new Effect(unit, "actionPoints", unit.actionPoints - 1),
					new Effect(target, "actionPoints", target.actionPoints + 1),
				],
				[],
				this.name,
				() => {
					SpecialEffect.abilityUse(unit, this);
				});
	}

	mouseOverTile(unit, loc, quadrant) {
		clearClickContextActors();
		if (!this.isMoveLegal(unit, loc, quadrant)) return;
		let target = gameState.getUnitAt(loc);
		clickContext.actors.push(new AbilityMoveActor(unit, unit.pos, unit.facing));
		clickContext.actors.push(new AbilityMoveActor(target, target.pos, target.facing, false, u => u.actionPoints++));
	}

	isMoveLegal(unit, loc, quadrant) {
		if (unit.actionPoints < 1) return false;
		if (Tile.distanceBetween(unit.pos, loc) != 1) return false;
		if (gameState.getUnitAt(loc) == null) return false;
		return true;
	}
}();
abilityData.ENERGIZE = new class extends Ability {
	constructor() {
		super();
		this.name = "Energize";
		this.icon = "M7,2V13H10V22L17,10H13L17,2H7Z";
		this.minActionPoints = 0;
		this.details = ["!REACTION: Gain ♦ at the end of the turn, if not !FRIGHTENED."];
		this.aiHints = [];
	}

	clickOnTile(unit, loc, quadrant) {}

	mouseOverTile(unit, loc, quadrant) {}

	actionEvent(unit, action) {
		let reactions = [];
		let endedTurn = false;
		for (let ev of action.events) if (ev.type == ActionEvent.ENDTURN && ev.who == unit) endedTurn = true;
		if (endedTurn && unit.state != Unit.State.FRIGHTENED) {
			reactions.push(new Action(
					true,
					[
						new Effect(unit, "actionPoints", unit.actionPoints + 1),
					],
					[],
					this.name,
					() => {
						SpecialEffect.abilityUse(unit, this);
					}));
		}
		return reactions;
	}
}();
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
abilityData.FEARMONGER = new class extends Ability {
	constructor() {
		super();
		this.name = "Fearmonger";
		this.icon = "M12 18C12 18.7 12.12 19.36 12.34 20C12.23 20 12.12 20 12 20C8.69 20 6 17.31 6 14C6 10 12 3.25 12 3.25S16.31 8.1 17.62 12C14.5 12.22 12 14.82 12 18M19 17V14H17V17H14V19H17V22H19V19H22V17H19Z";
		this.minActionPoints = 0;
		this.details = ["!REACTION: Gain ♦ whenever a !ENEMY becomes !FRIGHTENED."];
		this.aiHints = [];
	}

	clickOnTile(unit, loc, quadrant) {}

	mouseOverTile(unit, loc, quadrant) {}

	actionEvent(unit, action) {
		let reactions = [];
		let newFrightened = 0;
		for (let e of action.effects) if (e.property == "state" && e.unit.player != unit.player && e.value == Unit.State.FRIGHTENED && e.oldValue != Unit.State.FRIGHTENED) newFrightened++;
		if (newFrightened > 0) {
			reactions.push(new Action(
					true,
					[
						new AddingEffect(unit, "actionPoints", newFrightened),
					],
					[],
					this.name,
					() => {
						SpecialEffect.abilityUse(unit, this);
					}));
		}
		return reactions;
	}
}();
abilityData.FLEE = new class extends Ability {
	constructor() {
		super();
		this.name = "Flee";
		this.icon = "M19,5V19H16V5M14,5V19L3,12";
		this.minActionPoints = 0;
		this.details = [
			"!REACTION: When this !FRIEND !RETREATs, gain ♦.",
			"(The ♦ can't be used in the !RETREAT action.)"];
		this.aiHints = [];
	}

	clickOnTile(unit, loc, quadrant) {}

	mouseOverTile(unit, loc, quadrant) {}

	actionEvent(unit, action) {
		let reactions = [];
		let retreating = 0;
		for (let e of action.events) if (e.type == ActionEvent.RETREAT && e.who == unit) retreating++;
		if (retreating > 0) {
			reactions.push(new Action(
					true,
					[
						new AddingEffect(unit, "actionPoints", 1),
					],
					[],
					this.name,
					() => {
						SpecialEffect.abilityUse(unit, this);
					}));
		}
		return reactions;
	}
}();
abilityData.FLY = new class extends Ability {
	constructor() {
		super();
		this.name = "Fly";
		this.icon = "M22,2C22,2 14.36,1.63 8.34,9.88C3.72,16.21 2,22 2,22L3.94,21C5.38,18.5 6.13,17.47 7.54,16C10.07,16.74 12.71,16.65 15,14C13,13.44 11.4,13.57 9.04,13.81C11.69,12 13.5,11.6 16,12L17,10C15.2,9.66 14,9.63 12.22,10.04C14.19,8.65 15.56,7.87 18,8L19.21,6.07C17.65,5.96 16.71,6.13 14.92,6.57C16.53,5.11 18,4.45 20.14,4.32C20.14,4.32 21.19,2.43 22,2Z";
		this.minActionPoints = 1;
		this.details = ["Use ♦. !MOVE to an adjacent empty space and rotate. If the destination has lower elevation, gain ♦."];
		this.aiHints = [AiHints.MOVE, AiHints.BASIC_MOVE];
	}

	clickOnTile(unit, loc, quadrant) {
		if (!this.isMoveLegal(unit, loc, quadrant)) return null;

		let effects = [
			new Effect(unit, "pos", loc),
			new Effect(unit, "facing", quadrant),
		];

		if (gameState.room.getTile(unit.pos).height <= gameState.room.getTile(loc).height) {
			effects.push(new Effect(unit, "actionPoints", unit.actionPoints - 1));
		}

		return new Action(
				true,
				effects,
				loc[0] == unit.pos[0] && loc[1] == unit.pos[1] ? [] : [ActionEvent.move(unit, unit.pos, loc)],
				this.name,
				() => {
					SpecialEffect.abilityUse(unit, this);
				});
	}

	mouseOverTile(unit, loc, quadrant) {
		clearClickContextActors();
		if (!this.isMoveLegal(unit, loc, quadrant)) return;
		clickContext.actors.push(new AbilityMoveActor(unit, loc, quadrant, gameState.room.getTile(unit.pos).height <= gameState.room.getTile(loc).height));
	}

	isMoveLegal(unit, loc, quadrant) {
		if (unit.actionPoints < 1) return false;
		if (Math.abs(unit.pos[0] - loc[0]) + Math.abs(unit.pos[1] - loc[1]) != 1) return false;
		let dstUnit = gameState.getUnitAt(loc);
		if (dstUnit != null && dstUnit != unit) return false;
		return true;
	}
}();
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
		this.aiHints = [AiHints.MOVE, AiHints.BASIC_MOVE];
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
abilityData.HIGHGROUND = new class extends Ability {
	constructor() {
		super();
		this.name = "Highground";
		this.icon = "M22,19V22H2V13L22,19M19.09,7.5L18.25,10.26L8.13,7.26C8.06,5.66 6.7,4.42 5.1,4.5C3.5,4.57 2.26,5.93 2.34,7.53C2.41,9.13 3.77,10.36 5.37,10.29C6.24,10.25 7.05,9.82 7.57,9.11L17.69,12.11L16.85,14.89L21.67,12.29L19.09,7.5Z";
		this.minActionPoints = 1;
		this.details = ["Use ♦. Select an adjacent !ENEMY at a lower elevation. It !RETREATs."];
		this.aiHints = [AiHints.ATTACK, AiHints.PUSHER];
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
		if (gameState.room.getTile(loc).height >= gameState.room.getTile(unit.pos).height) return false;
		let target = gameState.getUnitAt(loc);
		if (target == null) return false;
		if (target.player == unit.player) return false;
		return true;
	}
}();
abilityData.HURRY = new class extends Ability {
	constructor() {
		super();
		this.name = "Hurry";
		this.icon = "M13 14H11V9H13M13 18H11V16H13M1 21H23L12 2L1 21Z";
		this.minActionPoints = 0;
		this.details = ["!REACTION: At the start of the turn, gain ♦ for each !ENEMY !THREATENing this !FRIEND."];
		this.aiHints = [];
	}

	clickOnTile(unit, loc, quadrant) {}

	mouseOverTile(unit, loc, quadrant) {}

	actionEvent(unit, action) {
		let reactions = [];
		let startedTurn = false;
		for (let ev of action.events) if (ev.type == ActionEvent.STARTTURN && ev.who == unit) startedTurn = true;
		let threats = 0;
		for (let i = 0; i < 4; i++) {
			let u = gameState.getUnitAt(Tile.offset(unit.pos, i));
			if (u != null && u.threatens(unit, unit.pos)) threats++;
		}

		if (startedTurn && threats > 0) {
			reactions.push(new Action(
					true,
					[
						new AddingEffect(unit, "actionPoints", threats),
					],
					[],
					this.name,
					() => {
						SpecialEffect.abilityUse(unit, this);
					}));
		}
		return reactions;
	}
}();
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
		this.aiHints = [AiHints.MOVE, AiHints.BASIC_MOVE];
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
abilityData.OPPORTUNITY = new class extends Ability {
	constructor() {
		super();
		this.name = "Opportunity";
		this.icon = "M10,9V5L3,12L10,19V14.9C15,14.9 18.5,16.5 21,20C20,15 17,10 10,9Z";
		this.minActionPoints = 0;
		this.details = [
			"!REACTION: Gain ♦ whenever a !ENEMY !MOVES such that this !FRIEND !THREATENs it.",
			"Does not apply to !ENEMYs already !THREATENed by this !FRIEND."];
		this.aiHints = [];
	}

	clickOnTile(unit, loc, quadrant) {}

	mouseOverTile(unit, loc, quadrant) {}

	actionEvent(unit, action) {
		let movingUnits = [];
		let reactions = [];
		for (let ev of action.events) if (ev.type == ActionEvent.MOVE) movingUnits.push(ev.who);
		for (let u of movingUnits) {
			for (let ef of action.effects) {
				if (ef.unit == u && ef.property == "pos") {
					if (unit.threatens(u, ef.oldValue)) continue;
					if (unit.threatens(u, ef.value)) {
						reactions.push(new Action(
								true,
								[
									new Effect(unit, "actionPoints", unit.actionPoints + 1),
								],
								[],
								this.name,
								() => {
									SpecialEffect.abilityUse(unit, this);
								}));
					}
				}
			}
		}
		return reactions;
	}
}();
abilityData.OUTMANEUVER = new class extends Ability {
	constructor() {
		super();
		this.name = "Outmaneuver";
		this.icon = "M14.58,16.59L19.17,12L14.58,7.41L16,6L22,12L16,18L14.58,16.59M8.58,16.59L13.17,12L8.58,7.41L10,6L16,12L10,18L8.58,16.59M2.58,16.59L7.17,12L2.58,7.41L4,6L10,12L4,18L2.58,16.59Z";
		this.minActionPoints = 2;
		this.details = ["Select an adjacent !ENEMY with less ♦. They become !FRIGHTENED and !RETREAT. Use ♦♦."];
		this.aiHints = [AiHints.ATTACK, AiHints.PUSHER];
	}

	clickOnTile(unit, loc, quadrant) {
		if (!this.isActionLegal(unit, loc, quadrant)) return;
		let target = gameState.getUnitAt(loc);
		if (target == null) return;

		let effects = [
			new Effect(unit, "actionPoints", unit.actionPoints - 2)
		];
		let events = [];

		let retreatDir = Tile.directionTo(unit.pos, target.pos);
		effects.push(new Effect(target, "state", Unit.State.FRIGHTENED));
		events.push(ActionEvent.retreat(target, retreatDir));

		return new Action(true, effects, events, this.name, () => {
			SpecialEffect.abilityUse(unit, this);
			SpecialEffect.attackClash(target.pos, unit.pos, true, false);
		});
	}

	mouseOverTile(unit, loc, quadrant) {
		clearClickContextActors();
		if (!this.isActionLegal(unit, loc, quadrant)) return;
		let target = gameState.getUnitAt(loc);
		if (target == null) return;

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
		if (unit.actionPoints < 2) return false;
		if (Math.abs(unit.pos[0] - loc[0]) + Math.abs(unit.pos[1] - loc[1]) != 1) return false;
		let target = gameState.getUnitAt(loc);
		if (target == null) return false;
		if (target.player == unit.player) return false;
		if (target.actionPoints >= unit.actionPoints) return false;
		return true;
	}
}();
abilityData.PANIC = new class extends Ability {
	constructor() {
		super();
		this.name = "Panic";
		this.icon = "M7.5,4A5.5,5.5 0 0,0 2,9.5C2,10 2.09,10.5 2.22,11H6.3L7.57,7.63C7.87,6.83 9.05,6.75 9.43,7.63L11.5,13L12.09,11.58C12.22,11.25 12.57,11 13,11H21.78C21.91,10.5 22,10 22,9.5A5.5,5.5 0 0,0 16.5,4C14.64,4 13,4.93 12,6.34C11,4.93 9.36,4 7.5,4V4M3,12.5A1,1 0 0,0 2,13.5A1,1 0 0,0 3,14.5H5.44L11,20C12,20.9 12,20.9 13,20L18.56,14.5H21A1,1 0 0,0 22,13.5A1,1 0 0,0 21,12.5H13.4L12.47,14.8C12.07,15.81 10.92,15.67 10.55,14.83L8.5,9.5L7.54,11.83C7.39,12.21 7.05,12.5 6.6,12.5H3Z";
		this.minActionPoints = 0;
		this.details = ["!REACTION: Gain ♦ at the end of the turn, if !FRIGHTENED."];
		this.aiHints = [];
	}

	clickOnTile(unit, loc, quadrant) {}

	mouseOverTile(unit, loc, quadrant) {}

	actionEvent(unit, action) {
		let reactions = [];
		let endedTurn = false;
		for (let ev of action.events) if (ev.type == ActionEvent.ENDTURN && ev.who == unit) endedTurn = true;
		if (endedTurn && unit.state == Unit.State.FRIGHTENED) {
			reactions.push(new Action(
					true,
					[
						new Effect(unit, "actionPoints", unit.actionPoints + 1),
					],
					[],
					this.name,
					() => {
						SpecialEffect.abilityUse(unit, this);
					}));
		}
		return reactions;
	}
}();
abilityData.PRESS = new class extends Ability {
	constructor() {
		super();
		this.name = "Press";
		this.icon = "M13,6V18L21.5,12M4,18L12.5,12L4,6V18Z";
		this.minActionPoints = 0;
		this.details = ["!REACTION: Gain ♦ whenever a !ENEMY !THREATENed by this !FRIEND !RETREATs."];
		this.aiHints = [];
	}

	clickOnTile(unit, loc, quadrant) {}

	mouseOverTile(unit, loc, quadrant) {}

	actionEvent(unit, action) {
		let reactions = [];
		let retreating = 0;
		for (let e of action.events) if (e.type == ActionEvent.RETREAT && unit.threatens(e.who, e.who.pos)) retreating++;
		if (retreating > 0) {
			reactions.push(new Action(
					true,
					[
						new Effect(unit, "actionPoints", unit.actionPoints + retreating),
					],
					[],
					this.name,
					() => {
						SpecialEffect.abilityUse(unit, this);
					}));
		}
		return reactions;
	}
}();
abilityData.PUSH = new class extends Ability {
	constructor() {
		super();
		this.name = "Push";
		this.icon = "M18,16V13H15V22H13V2H15V11H18V8L22,12L18,16M2,12L6,16V13H9V22H11V2H9V11H6V8L2,12Z"
		this.minActionPoints = 1;
		this.details = [
			"Use ♦. Select an adjacent !ENEMY. !MOVE into an open space away from the !ENEMY. Cannot rise 2 or more steps.",
			"Roll ⚅. If greater than the !ENEMY's ○, they become !FRIGHTENED and !RETREAT.",
			"Cannot be undone."];
		this.aiHints = [AiHints.ATTACK, AiHints.PUSHER];
	}

	clickOnTile(unit, loc, quadrant) {
		if (!this.isActionLegal(unit, loc, quadrant)) return;
		let target = gameState.getUnitAt(loc);
		let dstPos = Tile.offset(unit.pos, Tile.directionTo(loc, unit.pos));

		let effects = [
			new Effect(unit, "actionPoints", unit.actionPoints - 1),
			new Effect(unit, "pos", dstPos),
		];
		let events = [
			ActionEvent.move(unit, unit.pos, dstPos),
		];

		let retreat1 = parseInt(Math.random() * 6 + 1) > target.getStrength(Tile.directionTo(target.pos, unit.pos));
		if (retreat1) {
			let retreatDir = Tile.directionTo(unit.pos, target.pos);
			events.push(ActionEvent.retreat(target, retreatDir));
			effects.push(new Effect(target, "state", Unit.State.FRIGHTENED));
		}

		let tpos = target.pos;
		let upos = unit.pos;
		return new Action(false, effects, events, this.name, () => {
			SpecialEffect.abilityUse(unit, this);
			SpecialEffect.attackClash(tpos, upos, retreat1, false);
		});
	}

	mouseOverTile(unit, loc, quadrant) {
		clearClickContextActors();
		if (!this.isActionLegal(unit, loc, quadrant)) return;
		let target = gameState.getUnitAt(loc);
		let dstPos = Tile.offset(unit.pos, Tile.directionTo(loc, unit.pos));

		// Attacker
		clickContext.actors.push(new AbilityMoveActor(unit, dstPos, unit.facing));

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
		if (Tile.distanceBetween(unit.pos, loc) != 1) return false;
		let target = gameState.getUnitAt(loc);
		if (target == null) return false;
		if (target.player == unit.player) return false;

		let dstPos = Tile.offset(unit.pos, Tile.directionTo(loc, unit.pos));
		if (!Tile.inBounds(dstPos)) return false;
		if (gameState.getUnitAt(dstPos) != null) return false;
		if (gameState.room.getTile(unit.pos).height < gameState.room.getTile(dstPos).height - 1) return false;
		return true;
	}
}();
abilityData.RESCUE = new class extends Ability {
	constructor() {
		super();
		this.name = "Rescue";
		this.icon = "M20 14H14V20H10V14H4V10H10V4H14V10H20V14Z"
		this.minActionPoints = 2;
		this.details = [
			"Use ♦♦. Select a !FRIEND. That !FRIEND teleports to a random open space that is not !THREATENED by a !ENEMY.",
			"Cannot be undone."];
		this.aiHints = [];
	}

	clickOnTile(unit, loc, quadrant) {
		if (!this.isActionLegal(unit, loc, quadrant)) return;
		let target = gameState.getUnitAt(loc);
		let dests = this.getPossibleDests(target);
		Util.shuffle(dests);

		let effects = [
			new Effect(unit, "actionPoints", unit.actionPoints - 2),
			new Effect(target, "pos", dests[0]),
		];
		let events = [];

		return new Action(false, effects, events, this.name, () => {
			SpecialEffect.abilityUse(unit, this);
		});
	}

	mouseOverTile(unit, loc, quadrant) {
		clearClickContextActors();
		if (!this.isActionLegal(unit, loc, quadrant)) return;
		let target = gameState.getUnitAt(loc);
		for (let p of this.getPossibleDests(target)) clickContext.actors.push(new AbilityMoveActor(target, p, target.facing, false));
	}

	isActionLegal(unit, loc, quadrant) {
		if (unit.actionPoints < 2) return false;
		let target = gameState.getUnitAt(loc);
		if (target == null) return false;
		if (target.player != unit.player) return false;
		if (this.getPossibleDests(target).length == 0) return false;
		return true;
	}

	getPossibleDests(unit) {
		let dests = [];
		for (let i = 0; i < gameState.room.tiles.length; i++) {
			for (let j = 0; j < gameState.room.tiles[i].length; j++) {
				let threatened = false;
				for (let u of gameState.units) {
					if (u.state != Unit.State.DEFEATED && u.pos[0] == i && u.pos[1] == j) threatened = true;
					if (u.threatens(unit, [i, j])) threatened = true;
				}
				if (!threatened) dests.push([i, j]);
			}
		}
		return dests;
	}
}();
abilityData.REVENGE = new class extends Ability {
	constructor() {
		super();
		this.name = "Revenge";
		this.icon = "M20 6.91L17.09 4L12 9.09L6.91 4L4 6.91L9.09 12L4 17.09L6.91 20L12 14.91L17.09 20L20 17.09L14.91 12L20 6.91Z";
		this.minActionPoints = 0;
		this.details = ["!REACTION: When a !FRIEND is !DEFEATED, gain ♦♦♦♦."];
		this.aiHints = [];
	}

	clickOnTile(unit, loc, quadrant) {}

	mouseOverTile(unit, loc, quadrant) {}

	actionEvent(unit, action) {
		let reactions = [];
		let defeats = 0;
		for (let e of action.events) if (e.type == ActionEvent.DEFEAT && e.who.player == unit.player) defeats++;
		if (defeats > 0) {
			reactions.push(new Action(
					true,
					[
						new AddingEffect(unit, "actionPoints", defeats * 4),
					],
					[],
					this.name,
					() => {
						SpecialEffect.abilityUse(unit, this);
					}));
		}
		return reactions;
	}
}();
abilityData.RUN = new class extends Ability {
	constructor() {
		super();
		this.name = "Run";
		this.icon = "M13.5,5.5C14.59,5.5 15.5,4.58 15.5,3.5C15.5,2.38 14.59,1.5 13.5,1.5C12.39,1.5 11.5,2.38 11.5,3.5C11.5,4.58 12.39,5.5 13.5,5.5M9.89,19.38L10.89,15L13,17V23H15V15.5L12.89,13.5L13.5,10.5C14.79,12 16.79,13 19,13V11C17.09,11 15.5,10 14.69,8.58L13.69,7C13.29,6.38 12.69,6 12,6C11.69,6 11.5,6.08 11.19,6.08L6,8.28V13H8V9.58L9.79,8.88L8.19,17L3.29,16L2.89,18L9.89,19.38Z";
		this.minActionPoints = 1;
		this.details = [
			"Use ♦. !MOVE to an adjacent empty space and rotate. If ⚅ is greater than 3, gain ♦",
			"Cannot rise more than 1 step.",
			"Cannot be undone."];
		this.aiHints = [AiHints.MOVE, AiHints.BASIC_MOVE];
	}

	clickOnTile(unit, loc, quadrant) {
		if (!this.isMoveLegal(unit, loc, quadrant)) return null;

		let effects = [
			new Effect(unit, "pos", loc),
			new Effect(unit, "facing", quadrant),
		];

		if (Util.roll() <= 3) {
			effects.push(new Effect(unit, "actionPoints", unit.actionPoints - 1));
		}

		return new Action(
				false,
				effects,
				[ActionEvent.move(unit, unit.pos, loc)],
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
		if (Tile.distanceBetween(unit.pos, loc) != 1) return false;
		if (gameState.room.getTile(unit.pos).height < gameState.room.getTile(loc).height - 1) return false;
		let dstUnit = gameState.getUnitAt(loc);
		if (dstUnit != null) return false;
		return true;
	}
}();
abilityData.SCORCHEDEARTH = new class extends Ability {
	constructor() {
		super();
		this.name = "ScorchedEarth";
		this.icon = "M17.66 11.2C17.43 10.9 17.15 10.64 16.89 10.38C16.22 9.78 15.46 9.35 14.82 8.72C13.33 7.26 13 4.85 13.95 3C13 3.23 12.17 3.75 11.46 4.32C8.87 6.4 7.85 10.07 9.07 13.22C9.11 13.32 9.15 13.42 9.15 13.55C9.15 13.77 9 13.97 8.8 14.05C8.57 14.15 8.33 14.09 8.14 13.93C8.08 13.88 8.04 13.83 8 13.76C6.87 12.33 6.69 10.28 7.45 8.64C5.78 10 4.87 12.3 5 14.47C5.06 14.97 5.12 15.47 5.29 15.97C5.43 16.57 5.7 17.17 6 17.7C7.08 19.43 8.95 20.67 10.96 20.92C13.1 21.19 15.39 20.8 17.03 19.32C18.86 17.66 19.5 15 18.56 12.72L18.43 12.46C18.22 12 17.66 11.2 17.66 11.2M14.5 17.5C14.22 17.74 13.76 18 13.4 18.1C12.28 18.5 11.16 17.94 10.5 17.28C11.69 17 12.4 16.12 12.61 15.23C12.78 14.43 12.46 13.77 12.33 13C12.21 12.26 12.23 11.63 12.5 10.94C12.69 11.32 12.89 11.7 13.13 12C13.9 13 15.11 13.44 15.37 14.8C15.41 14.94 15.43 15.08 15.43 15.23C15.46 16.05 15.1 16.95 14.5 17.5H14.5Z";
		this.minActionPoints = 0;
		this.details = ["!REACTION: When this !FRIEND !RETREATs, all adjacent !ENEMYs use ♦ if able."];
		this.aiHints = [];
	}

	clickOnTile(unit, loc, quadrant) {}

	mouseOverTile(unit, loc, quadrant) {}

	actionEvent(unit, action) {
		let reactions = [];
		let retreating = 0;
		for (let e of action.events) if (e.type == ActionEvent.RETREAT && e.who == unit) retreating++;
		if (retreating > 0) {
			let effects = [];
			for (let i = 0; i < 4; i++) {
				let u = gameState.getUnitAt(Tile.offset(unit.pos, i));
				if (u == null || u.player == unit.player) continue;
				effects.push(new AddingEffect(u, "actionPoints", -1));
			}
			if (effects.length > 0) {
				reactions.push(new Action(
						true,
						effects,
						[],
						this.name,
						() => {
							SpecialEffect.abilityUse(unit, this);
						}));
			}
		}
		return reactions;
	}
}();
abilityData.SHOOT = new class extends Ability {
	constructor() {
		super();
		this.name = "Shoot";
		this.icon = "M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12C22,10.84 21.79,9.69 21.39,8.61L19.79,10.21C19.93,10.8 20,11.4 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4C12.6,4 13.2,4.07 13.79,4.21L15.4,2.6C14.31,2.21 13.16,2 12,2M19,2L15,6V7.5L12.45,10.05C12.3,10 12.15,10 12,10A2,2 0 0,0 10,12A2,2 0 0,0 12,14A2,2 0 0,0 14,12C14,11.85 14,11.7 13.95,11.55L16.5,9H18L22,5H19V2M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12H16A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8V6Z"
		this.minActionPoints = 1;
		this.details = [
			"Use ♦. Select a !ENEMY in a straight line.",
			"Roll ⚅. If greater than the !ENEMY's ○, it becomes !FRIGHTENED and !RETREATs.",
			"Cannot select an adjacent !ENEMY.",
			"Cannot be undone."];
		this.aiHints = [AiHints.ATTACK, AiHints.PUSHER];
	}

	clickOnTile(unit, loc, quadrant) {
		if (!this.isActionLegal(unit, loc, quadrant)) return;
		let target = gameState.getUnitAt(loc);
		if (target == null) return;

		let effects = [
			new Effect(unit, "actionPoints", unit.actionPoints - 1)
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
		if (unit.actionPoints < 1) return false;
		if (Tile.distanceBetween(unit.pos, loc) <= 1) return false;
		if (Tile.directionTo(unit.pos, loc) == -1) return false;
		let target = gameState.getUnitAt(loc);
		if (target == null) return false;
		if (target.player == unit.player) return false;
		return true;
	}
}();
abilityData.SIPHON = new class extends Ability {
	constructor() {
		super();
		this.name = "Siphon";
		this.icon = "M22 13V15H18.32C18.75 14.09 19 13.08 19 12C19 8.14 15.86 5 12 5H2V3H12C16.97 3 21 7.03 21 12C21 12.34 20.97 12.67 20.94 13H22M12 19C8.14 19 5 15.86 5 12C5 10.93 5.25 9.91 5.69 9H2V11H3.06C3.03 11.33 3 11.66 3 12C3 16.97 7.03 21 12 21H22V19H12M16.86 12.2C15.93 12.94 14.72 12.47 14 12.05V12C16.79 10.31 15.39 7.89 15.39 7.89S14.33 6.04 14.61 7.89C14.78 9.07 13.76 9.88 13.04 10.3L13 10.28C12.93 7 10.13 7 10.13 7S8 7 9.74 7.69C10.85 8.13 11.04 9.42 11.05 10.25L11 10.28C8.14 8.7 6.74 11.12 6.74 11.12S5.67 12.97 7.14 11.8C8.07 11.07 9.28 11.54 10 11.95V12C7.21 13.7 8.61 16.12 8.61 16.12S9.67 17.97 9.4 16.11C9.22 14.94 10.25 14.13 10.97 13.7L11 13.73C11.07 17 13.87 17 13.87 17S16 17 14.26 16.31C13.15 15.87 12.96 14.58 12.95 13.75L13 13.73C15.86 15.31 17.26 12.88 17.26 12.88S18.33 11.04 16.86 12.2Z";
		this.minActionPoints = 0;
		this.details = [
			"!REACTION: When an adjacent !ENEMY uses ♦ and ⚅ is greater than 3, gain ♦.",
			"(If the !ENEMY caused this !FRIEND to !RETREAT, the ♦ can't be used in the !RETREAT action.)",
			"Actions that trigger this reaction cannot be undone.",
		];
		this.aiHints = [];
	}

	clickOnTile(unit, loc, quadrant) {}

	mouseOverTile(unit, loc, quadrant) {}

	actionEvent(unit, action) {
		let reactions = [];
		let usedDiamonds = 0;
		let adjEnemies = [];
		let movedEnemies = [];
		for (let e of action.effects) if (e.property == "pos") {
			if (e.unit.player == unit.player) continue;
			movedEnemies.push(e.unit);
			if (Tile.distanceBetween(e.oldValue, unit.pos) != 1) continue;
			adjEnemies.push(e.unit);
		}
		for (let u of gameState.units) {
			if (movedEnemies.includes(u)) continue;
			if (u.state == Unit.State.DEFEATED) continue;
			if (u.player == unit.player) continue;
			if (Tile.distanceBetween(u.pos, unit.pos) != 1) continue;
			adjEnemies.push(u);
		}
		for (let e of action.effects) if (e.property == "actionPoints") {
			if (!adjEnemies.includes(e.unit)) continue;
			let spent = 0;
			if (e instanceof AddingEffect) spent = -e.value;
			else spent = e.oldValue - e.value;
			if (spent < 0) continue;
			for (let i = 0; i < spent; i++) if (Util.roll() > 3) usedDiamonds++;
		}

		if (usedDiamonds > 0) {
			reactions.push(new Action(
					false,
					[
						new AddingEffect(unit, "actionPoints", usedDiamonds),
					],
					[],
					this.name,
					() => {
						SpecialEffect.abilityUse(unit, this);
					}));
		}
		return reactions;
	}
}();
abilityData.SLIDE = new class extends Ability {
	constructor() {
		super();
		this.name = "Slide";
		this.icon = "M17.45,17.55L12,23L6.55,17.55L7.96,16.14L11,19.17V4.83L7.96,7.86L6.55,6.45L12,1L17.45,6.45L16.04,7.86L13,4.83V19.17L16.04,16.14L17.45,17.55ZM6.45,17.45L1,12L6.45,6.55L7.86,7.96L4.83,11H19.17L16.14,7.96L17.55,6.55L23,12L17.55,17.45L16.14,16.04L19.17,13H4.83L7.86,16.04L6.45,17.45Z";
		this.minActionPoints = 1;
		this.details = ["Use ♦. !MOVE to a nearest diagonal empty space and rotate. Cannot rise more than 1 step."];
		this.aiHints = [AiHints.MOVE, AiHints.BASIC_MOVE];
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
				[ActionEvent.move(unit, unit.pos, loc)],
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
		if (Tile.distanceBetween(unit.pos, loc) != 2) return false;
		if (Tile.directionTo(unit.pos, loc) != -1) return false;
		if (gameState.room.getTile(unit.pos).height < gameState.room.getTile(loc).height - 1) return false;
		let dstUnit = gameState.getUnitAt(loc);
		if (dstUnit != null && dstUnit != unit) return false;
		return true;
	}
}();
abilityData.SLOW = new class extends Ability {
	constructor() {
		super();
		this.name = "Slow";
		this.icon = "M14,19H18V5H14M6,19H10V5H6V19Z";
		this.minActionPoints = 1;
		this.details = [
			"Use ♦. Remove ♦ from an adjacent !ENEMY."];
		this.aiHints = [AiHints.ATTACK];
	}

	clickOnTile(unit, loc, quadrant) {
		if (!this.isMoveLegal(unit, loc, quadrant)) return null;
		let target = gameState.getUnitAt(loc);
		return new Action(
				true,
				[
					new Effect(unit, "actionPoints", unit.actionPoints - 1),
					new Effect(target, "actionPoints", target.actionPoints - 1),
				],
				[],
				this.name,
				() => {
					SpecialEffect.abilityUse(unit, this);
				});
	}

	mouseOverTile(unit, loc, quadrant) {
		clearClickContextActors();
		if (!this.isMoveLegal(unit, loc, quadrant)) return;
		let target = gameState.getUnitAt(loc);
		clickContext.actors.push(new AbilityMoveActor(unit, unit.pos, unit.facing));
		clickContext.actors.push(new AbilityMoveActor(target, target.pos, target.facing));
	}

	isMoveLegal(unit, loc, quadrant) {
		if (unit.actionPoints < 1) return false;
		if (Tile.distanceBetween(unit.pos, loc) != 1) return false;
		let target = gameState.getUnitAt(loc);
		if (target == null) return false;
		if (gameState.getUnitAt(loc).actionPoints < 1) return false;
		return true;
	}
}();
abilityData.SOLARPOWER = new class extends Ability {
	constructor() {
		super();
		this.name = "Solarpower";
		this.icon = "M3,12H7A5,5 0 0,1 12,7A5,5 0 0,1 17,12H21A1,1 0 0,1 22,13A1,1 0 0,1 21,14H3A1,1 0 0,1 2,13A1,1 0 0,1 3,12M15,12A3,3 0 0,0 12,9A3,3 0 0,0 9,12H15M12,2L14.39,5.42C13.65,5.15 12.84,5 12,5C11.16,5 10.35,5.15 9.61,5.42L12,2M3.34,7L7.5,6.65C6.9,7.16 6.36,7.78 5.94,8.5C5.5,9.24 5.25,10 5.11,10.79L3.34,7M20.65,7L18.88,10.79C18.74,10 18.47,9.23 18.05,8.5C17.63,7.78 17.1,7.15 16.5,6.64L20.65,7M12.71,16.3L15.82,19.41C16.21,19.8 16.21,20.43 15.82,20.82C15.43,21.21 14.8,21.21 14.41,20.82L12,18.41L9.59,20.82C9.2,21.21 8.57,21.21 8.18,20.82C7.79,20.43 7.79,19.8 8.18,19.41L11.29,16.3C11.5,16.1 11.74,16 12,16C12.26,16 12.5,16.1 12.71,16.3Z";
		this.minActionPoints = 0;
		this.details = [
			"!REACTION: At the end of the turn:",
			"  Gain ♦ if 1 step above ground level.",
			"  Gain ♦♦ if 2 or more steps above ground level."];
		this.aiHints = [];
	}

	clickOnTile(unit, loc, quadrant) {}

	mouseOverTile(unit, loc, quadrant) {}

	actionEvent(unit, action) {
		let reactions = [];
		let endedTurn = false;
		for (let ev of action.events) if (ev.type == ActionEvent.ENDTURN && ev.who == unit) endedTurn = true;
		let gain = Math.min(2, gameState.room.getTile(unit.pos).height);
		if (endedTurn && gain > 0) {
			reactions.push(new Action(
					true,
					[
						new Effect(unit, "actionPoints", unit.actionPoints + gain),
					],
					[],
					this.name,
					() => {
						SpecialEffect.abilityUse(unit, this);
					}));
		}
		return reactions;
	}
}();
abilityData.STARTUP = new class extends Ability {
	constructor() {
		super();
		this.name = "Startup";
		this.icon = "M12,16A3,3 0 0,1 9,13C9,11.88 9.61,10.9 10.5,10.39L20.21,4.77L14.68,14.35C14.18,15.33 13.17,16 12,16M12,3C13.81,3 15.5,3.5 16.97,4.32L14.87,5.53C14,5.19 13,5 12,5A8,8 0 0,0 4,13C4,15.21 4.89,17.21 6.34,18.65H6.35C6.74,19.04 6.74,19.67 6.35,20.06C5.96,20.45 5.32,20.45 4.93,20.07V20.07C3.12,18.26 2,15.76 2,13A10,10 0 0,1 12,3M22,13C22,15.76 20.88,18.26 19.07,20.07V20.07C18.68,20.45 18.05,20.45 17.66,20.06C17.27,19.67 17.27,19.04 17.66,18.65V18.65C19.11,17.2 20,15.21 20,13C20,12 19.81,11 19.46,10.1L20.67,8C21.5,9.5 22,11.18 22,13Z";
		this.minActionPoints = 0;
		this.details = ["!REACTION: Gain ♦♦♦ on the first turn, or ♦♦ if !FRIGHTENED."];
		this.aiHints = [];
	}

	clickOnTile(unit, loc, quadrant) {}

	mouseOverTile(unit, loc, quadrant) {}

	actionEvent(unit, action) {
		let reactions = [];
		let loadedRoom = false;
		for (let ev of action.events) if (ev.type == ActionEvent.LOADROOM) loadedRoom = true;
		if (loadedRoom) {
			reactions.push(new Action(
					true,
					[
						new Effect(unit, "actionPoints", unit.actionPoints + (unit.state == Unit.State.FRIGHTENED ? 2 : 3)),
					],
					[],
					this.name,
					() => {
						SpecialEffect.abilityUse(unit, this);
					}));
		}
		return reactions;
	}
}();
abilityData.STRIKE = new class extends Ability {
	constructor() {
		super();
		this.name = "Strike";
		this.icon = "M14.79,10.62L3.5,21.9L2.1,20.5L13.38,9.21L14.79,10.62M19.27,7.73L19.86,7.14L19.07,6.35L19.71,5.71L18.29,4.29L17.65,4.93L16.86,4.14L16.27,4.73C14.53,3.31 12.57,2.17 10.47,1.37L9.64,3.16C11.39,4.08 13,5.19 14.5,6.5L14,7L17,10L17.5,9.5C18.81,11 19.92,12.61 20.84,14.36L22.63,13.53C21.83,11.43 20.69,9.47 19.27,7.73Z";
		this.minActionPoints = 2;
		this.details = ["Use ♦♦. Select an adjacent !ENEMY with less ○. They become !FRIGHTENED and !RETREAT."];
		this.aiHints = [AiHints.ATTACK, AiHints.PUSHER];
	}

	clickOnTile(unit, loc, quadrant) {
		if (!this.isActionLegal(unit, loc, quadrant)) return;
		let target = gameState.getUnitAt(loc);
		if (target == null) return;

		let effects = [
			new Effect(unit, "actionPoints", unit.actionPoints - 2)
		];
		let events = [];

		let retreatDir = Tile.directionTo(unit.pos, target.pos);
		effects.push(new Effect(target, "state", Unit.State.FRIGHTENED));
		events.push(ActionEvent.retreat(target, retreatDir));

		return new Action(true, effects, events, this.name, () => {
			SpecialEffect.abilityUse(unit, this);
			SpecialEffect.attackClash(target.pos, unit.pos, true, false);
		});
	}

	mouseOverTile(unit, loc, quadrant) {
		clearClickContextActors();
		if (!this.isActionLegal(unit, loc, quadrant)) return;
		let target = gameState.getUnitAt(loc);
		if (target == null) return;

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
		if (unit.actionPoints < 2) return false;
		if (Math.abs(unit.pos[0] - loc[0]) + Math.abs(unit.pos[1] - loc[1]) != 1) return false;
		let target = gameState.getUnitAt(loc);
		if (target == null) return false;
		if (target.player == unit.player) return false;
		if (target.getStrength(Tile.directionTo(target.pos, unit.pos)) >= unit.getStrength(Tile.directionTo(unit.pos, target.pos))) return false;
		return true;
	}
}();
abilityData.SWAP = new class extends Ability {
	constructor() {
		super();
		this.name = "Swap";
		this.icon = "M12,18A6,6 0 0,1 6,12C6,11 6.25,10.03 6.7,9.2L5.24,7.74C4.46,8.97 4,10.43 4,12A8,8 0 0,0 12,20V23L16,19L12,15M12,4V1L8,5L12,9V6A6,6 0 0,1 18,12C18,13 17.75,13.97 17.3,14.8L18.76,16.26C19.54,15.03 20,13.57 20,12A8,8 0 0,0 12,4Z";
		this.minActionPoints = 1;
		this.details = ["Use ♦. Swap positions and facing with an adjacent !FRIEND or !ENEMY."];
		this.aiHints = [AiHints.MOVE];
	}

	clickOnTile(unit, loc, quadrant) {
		if (!this.isMoveLegal(unit, loc, quadrant)) return null;
		let swap = gameState.getUnitAt(loc);
		return new Action(
				true,
				[
					new Effect(unit, "pos", loc),
					new Effect(unit, "facing", swap.facing),
					new Effect(unit, "actionPoints", unit.actionPoints - 1),
					new Effect(swap, "pos", unit.pos),
					new Effect(swap, "facing", unit.facing),
				],
				[],
				this.name,
				() => {
					SpecialEffect.abilityUse(unit, this);
				});
	}

	mouseOverTile(unit, loc, quadrant) {
		clearClickContextActors();
		if (!this.isMoveLegal(unit, loc, quadrant)) return;
		clickContext.actors.push(new AbilityMoveActor(unit, loc, gameState.getUnitAt(loc).facing));
		clickContext.actors.push(new AbilityMoveActor(gameState.getUnitAt(loc), unit.pos, unit.facing, false));
	}

	isMoveLegal(unit, loc, quadrant) {
		if (unit.actionPoints < 1) return false;
		if (Tile.distanceBetween(unit.pos, loc) != 1) return false;
		if (gameState.getUnitAt(loc) == null) return false;
		// If unit is retreating, another unit may already be occupying its space. In this case, swap is not legal.
		for (let u of gameState.units) if (u != unit && u.state != Unit.State.DEFEATED && u.pos[0] == unit.pos[0] && u.pos[1] == unit.pos[1]) return false;
		return true;
	}
}();
abilityData.SWORD = new class extends Ability {
	constructor() {
		super();
		this.name = "Sword";
		this.icon = "M6.92,5H5L14,14L15,13.06M19.96,19.12L19.12,19.96C18.73,20.35 18.1,20.35 17.71,19.96L14.59,16.84L11.91,19.5L10.5,18.09L11.92,16.67L3,7.75V3H7.75L16.67,11.92L18.09,10.5L19.5,11.91L16.83,14.58L19.95,17.7C20.35,18.1 20.35,18.73 19.96,19.12Z";
		this.minActionPoints = 1;
		this.details = [
			"Use ♦. Select an adjacent !ENEMY. If ⚅ is greater than the !ENEMY's ○, the !ENEMY becomes !FRIGHTENED and !RETREATS.",
			"Cannot be undone."];
		this.aiHints = [AiHints.ATTACK, AiHints.PUSHER];
	}

	clickOnTile(unit, loc, quadrant) {
		if (!this.isActionLegal(unit, loc, quadrant)) return;
		let target = gameState.getUnitAt(loc);
		if (target == null) return;

		let effects = [
			new Effect(unit, "actionPoints", unit.actionPoints - 1)
		];
		let events = [];

		let defenderStr = target.getStrength(Tile.directionTo(target.pos, unit.pos));
		let attackerStr = unit.getStrength(Tile.directionTo(unit.pos, target.pos));
		let success = Math.floor(Math.random() * 6 + 1) > defenderStr;
		if (success) {
			// Defender retreats
			let retreatDir = Tile.directionTo(unit.pos, target.pos);
			effects.push(new Effect(target, "state", Unit.State.FRIGHTENED));
			events.push(ActionEvent.retreat(target, retreatDir));
		}

		let tpos = target.pos;
		let upos = unit.pos;
		return new Action(false, effects, events, this.name, () => {
			SpecialEffect.abilityUse(unit, this);
			SpecialEffect.attackClash(tpos, upos, success, false);
		});
	}

	mouseOverTile(unit, loc, quadrant) {
		clearClickContextActors();
		if (!this.isActionLegal(unit, loc, quadrant)) return;
		let target = gameState.getUnitAt(loc);
		if (target == null) return;

		let defenderStr = target.getStrength(Tile.directionTo(target.pos, unit.pos));
		let attackerStr = unit.getStrength(Tile.directionTo(unit.pos, target.pos));

		// Defender
		let defenderRetreatChance = Math.min(1, Math.max(0, 1 - target.getStrength(Tile.directionTo(target.pos, unit.pos)) / 6.0));
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
abilityData.TAUNT = new class extends Ability {
	constructor() {
		super();
		this.name = "Taunt";
		this.icon = "M11.92,19.92L4,12L11.92,4.08L13.33,5.5L7.83,11H22V13H7.83L13.34,18.5L11.92,19.92M4,12V2H2V22H4V12Z"
		this.minActionPoints = 1;
		this.details = [
			"Use ♦. Select a !ENEMY in a straight line. That !ENEMY !MOVEs toward this !FRIEND.",
			"The !ENEMY cannot rise more than 1 step.",
			"The !ENEMY cannot enter an occupied space."];
		this.aiHints = [AiHints.ATTACK];
	}

	clickOnTile(unit, loc, quadrant) {
		if (!this.isActionLegal(unit, loc, quadrant)) return;
		let target = gameState.getUnitAt(loc);
		let dstPos = Tile.offset(target.pos, Tile.directionTo(loc, unit.pos));

		let effects = [
			new Effect(unit, "actionPoints", unit.actionPoints - 1),
			new Effect(target, "pos", dstPos),
		];
		let events = [
			ActionEvent.move(target, target.pos, dstPos),
		];

		return new Action(true, effects, events, this.name, () => {
			SpecialEffect.abilityUse(unit, this);
		});
	}

	mouseOverTile(unit, loc, quadrant) {
		clearClickContextActors();
		if (!this.isActionLegal(unit, loc, quadrant)) return;
		let target = gameState.getUnitAt(loc);
		clickContext.actors.push(new AbilityMoveActor(target, Tile.offset(loc, Tile.directionTo(loc, unit.pos)), target.facing, false));
	}

	isActionLegal(unit, loc, quadrant) {
		if (unit.actionPoints < 1) return false;
		let dir = Tile.directionTo(unit.pos, loc);
		if (dir == -1) return false;
		let target = gameState.getUnitAt(loc);
		if (target == null) return false;
		if (target.player == unit.player) return false;

		let dstPos = Tile.offset(target.pos, (dir + 2) % 4);
		if (gameState.getUnitAt(dstPos) != null) return false;
		if (gameState.room.getTile(target.pos).height + 1 < gameState.room.getTile(dstPos).height) return false;
		return true;
	}
}();
abilityData.TELEPORT = new class extends Ability {
	constructor() {
		super();
		this.name = "Teleport";
		this.icon = "M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z";
		this.minActionPoints = 1;
		this.details = ["Use ♦. Teleport to an empty space adjacent to a !FRIEND, with any facing."];
		this.aiHints = [AiHints.MOVE, AiHints.BASIC_MOVE];
	}

	clickOnTile(unit, loc, quadrant) {
		if (!this.isLegal(unit, loc, quadrant)) return;
		return new Action(
				true,
				[
					new Effect(unit, "actionPoints", unit.actionPoints - 1),
					new Effect(unit, "pos", loc),
					new Effect(unit, "facing", quadrant),
				],
				[],
				this.name,
				() => {
					SpecialEffect.abilityUse(unit, this);
				});
	}

	mouseOverTile(unit, loc, quadrant) {
		clearClickContextActors();
		if (!this.isLegal(unit, loc, quadrant)) return;
		clickContext.actors.push(new AbilityMoveActor(unit, loc, quadrant));
	}

	isLegal(unit, loc, quadrant) {
		if (gameState.getUnitAt(loc) != null) return false;
		if (unit.actionPoints < 1) return false;
		let hasFriend = false;
		for (let d = 0; d < 4; d++) {
			let u = gameState.getUnitAt(Tile.offset(loc, d));
			if (u != null && u.player == unit.player) hasFriend = true;
		}
		if (!hasFriend) return false;
		return true;
	}
}();
abilityData.TERRIFY = new class extends Ability {
	constructor() {
		super();
		this.name = "Terrify";
		this.icon = "M10 3.25C10 3.25 16 10 16 14C16 17.31 13.31 20 10 20S4 17.31 4 14C4 10 10 3.25 10 3.25M20 7V13H18V7H20M18 17H20V15H18V17Z";
		this.minActionPoints = 1;
		this.details = ["Use ♦. Select an adjacent !FRIGHTENED !ENEMY. They !RETREAT."];
		this.aiHints = [AiHints.ATTACK, AiHints.PUSHER];
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
		let target = gameState.getUnitAt(loc);
		if (target == null) return false;
		if (target.player == unit.player) return false;
		if (target.state != Unit.State.FRIGHTENED) return false;
		return true;
	}
}();
abilityData.VAULT = new class extends Ability {
	constructor() {
		super();
		this.name = "Vault";
		this.icon = "M12,14A2,2 0 0,1 14,16A2,2 0 0,1 12,18A2,2 0 0,1 10,16A2,2 0 0,1 12,14M23.46,8.86L21.87,15.75L15,14.16L18.8,11.78C17.39,9.5 14.87,8 12,8C8.05,8 4.77,10.86 4.12,14.63L2.15,14.28C2.96,9.58 7.06,6 12,6C15.58,6 18.73,7.89 20.5,10.72L23.46,8.86Z";
		this.minActionPoints = 1;
		this.details = ["Use ♦. Teleport to an empty space on the opposite side of an adjacent !FRIEND or !ENEMY."];
		this.aiHints = [AiHints.MOVE];
	}

	clickOnTile(unit, loc, quadrant) {
		if (!this.isMoveLegal(unit, loc, quadrant)) return null;

		return new Action(
				true,
				[
					new Effect(unit, "pos", loc),
					new Effect(unit, "actionPoints", unit.actionPoints - 1),
				],
				[],
				this.name,
				() => {
					SpecialEffect.abilityUse(unit, this);
				});
	}

	mouseOverTile(unit, loc, quadrant) {
		clearClickContextActors();
		if (!this.isMoveLegal(unit, loc, quadrant)) return;
		clickContext.actors.push(new AbilityMoveActor(unit, loc, unit.facing));
	}

	isMoveLegal(unit, loc, quadrant) {
		if (unit.actionPoints < 1) return false;
		if (Tile.distanceBetween(unit.pos, loc) != 2) return false;
		let dir = Tile.directionTo(unit.pos, loc);
		if (dir == -1) return false;
		if (gameState.getUnitAt(loc) != null) return false;
		if (gameState.getUnitAt(Tile.offset(unit.pos, dir)) == null) return false;
		return true;
	}
}();
abilityData.VICTORIOUS = new class extends Ability {
	constructor() {
		super();
		this.name = "Victorious";
		this.icon = "M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z";
		this.minActionPoints = 0;
		this.details = ["!REACTION: When a !ENEMY is !DEFEATED, gain ♦♦."];
		this.aiHints = [];
	}

	clickOnTile(unit, loc, quadrant) {}

	mouseOverTile(unit, loc, quadrant) {}

	actionEvent(unit, action) {
		let reactions = [];
		let defeats = 0;
		for (let e of action.events) if (e.type == ActionEvent.DEFEAT && e.who.player != unit.player) defeats++;
		if (defeats > 0) {
			reactions.push(new Action(
					true,
					[
						new AddingEffect(unit, "actionPoints", defeats * 2),
					],
					[],
					this.name,
					() => {
						SpecialEffect.abilityUse(unit, this);
					}));
		}
		return reactions;
	}
}();
{
	// Use the first attack ability on the closest unit.
	// Ties are broken by unit order (player units first, etc).
	aiData.ATTACK_NEAREST = new class {
		getNextMove(units, currentState) {
			for (let u of units) {
				for (let e of currentState.units.map(t => { return {unit: t, dist: Tile.distanceBetween(u.pos, t.pos)} }).sort((a, b) => a.dist - b.dist).map(e => e.unit)) {
					for (let ab of u.abilities.filter(a => a.aiHints.includes(AiHints.ATTACK))) {
						for (let q = 0; q < 4; q++) {
							let action = ab.clickOnTile(u, e.pos, q);
							if (action != undefined) return action;
						}
					}
				}
			}
		}
	}();
}
{
	// Use the first attack ability on a threatened unit.
	aiData.ATTACK_THREATENED = new class {
		getNextMove(units, currentState) {
			for (let u of units) {
				let targets = currentState.units.filter(t => u.threatens(t, t.pos));
				for (let ab of u.abilities.filter(a => a.aiHints.includes(AiHints.ATTACK))) {
					for (let e of targets) {
						for (let q = 0; q < 4; q++) {
							let action = ab.clickOnTile(u, e.pos, (q + u.facing) % 4);
							if (action != undefined) return action;
						}
					}
				}
			}
		}
	}();
}
{
	// This behavior moves to the highest elevation possible. It will not move to another space of the same elevation.
	// If there are multiple highest elevation spaces, it will choose one randomly.
	aiData.MOVE_CLIMB = new class {
		getNextMove(units, currentState) {
			for (let u of units) {
				let moveAbilities = u.abilities.filter(a => a.aiHints.includes(AiHints.MOVE));
				let currentHeight = currentState.room.getTile(u.pos).height;
				let coords = [];
				for (let i = 0; i < currentState.room.tiles.length; i++) {
					for (let j = 0; j < currentState.room.tiles[i].length; j++) {
						if (currentState.room.getTile([i, j]).height <= currentHeight) continue;
						for (let q = 0; q < 4; q++) {
							coords.push([i, j, q]);
						}
					}
				}
				Util.shuffle(coords);

				coords.sort((a, b) => currentState.room.getTile(b).height - currentState.room.getTile(a).height);
				for (let ab of moveAbilities) {
					for (let c of coords) {
						let action = ab.clickOnTile(u, [c[0], c[1]], c[2]);
						if (action != undefined) return action;
					}
				}
			}
		}
	}();
}
{
	// This behavior moves closer to the closest enemy, preferring motions that put as many threatening circles as possible on enemies.
	// Ties are broken by preferring the strongest face closest to the enemy, then randomly.
	aiData.MOVE_CLOSER_AND_THREATEN = new class {
		getNextMove(units, currentState) {
			for (let u of units) {
				let coords = [];
				for (let i = 0; i < currentState.room.tiles.length; i++) {
					for (let j = 0; j < currentState.room.tiles[i].length; j++) {
						for (let q = 0; q < 4; q++) {
							coords.push([i, j, q]);
						}
					}
				}
				Util.shuffle(coords);

				function moveOutcome(action) {
					let outcomePos = null;
					let outcomeFacing = null;
					let cp = false;
					let cf = false;
					for (let effect of action.effects) {
						if (effect.unit == u && effect.property == "pos") outcomePos = effect.value;
						if (effect.unit == u && effect.property == "facing") outcomeFacing = effect.value;
					}
					if (outcomePos == null) {
						outcomePos = u.pos;
					} else {
						cp = true;
					}
					if (outcomeFacing == null) {
						outcomeFacing = u.facing;
					} else {
						cf = true;
					}
					return {
						"pos": outcomePos,
						"facing": outcomeFacing,
						"posSet": cp,
						"facingSet": cf,
					};
				}

				function countThreats(loc, facing) {
					let num = 0;
					for (let i = 0; i < 4; i++) {
						let t = Tile.offset(loc, i);
						let dir = (4 + i - facing) % 4;
						let threatGroup = u.state == Unit.State.FRIGHTENED ? u.threatsFrightened : u.threats;
						if (!threatGroup[dir]) continue;
						if (!Tile.inBounds(t)) continue;
						let unit = currentState.getUnitAt(t);
						if (unit == null || unit.player == u.player) continue;
						num += Unit.State.FRIGHTENED ? u.strengthsFrightened[dir] : u.strengths[dir];
					}
					return num;
				}

				function getClosestEnemy(loc) {
					let minDist = Number.MAX_VALUE;
					let minUnit = null;
					for (let uu of currentState.units) {
						if (uu.player == u.player) continue;
						if (uu.state == Unit.State.DEFEATED) continue;
						let d = Tile.distanceBetween(uu.pos, loc);
						if (d < minDist) {
							minDist = d;
							minUnit = uu;
						}
					}
					return minUnit;
				}

				function scoreFacingToUnit(unit, loc, facing) {
					let str = 0;
					for (let dir of Tile.directionsToLenient(loc, unit.pos)) {
						let face = (4 + dir - facing) % 4;
						str = Math.max(str, u.state == Unit.State.NORMAL ? u.strengths[face] : u.strengthsFrightened[face]);
					}
					return str;
				}

				function evaluate(action) {
					let outcome = moveOutcome(action);
					return {
					 "dist": Tile.distanceBetween(outcome.pos, getClosestEnemy(outcome.pos).pos),
					 "threat": countThreats(outcome.pos, outcome.facing),
					 "strength": scoreFacingToUnit(getClosestEnemy(outcome.pos), outcome.pos, outcome.facing),
					};
				}

				let maxDist = Tile.distanceBetween(u.pos, getClosestEnemy(u.pos).pos);
				let minThreat = countThreats(u.pos, u.facing);
				let minStrength = scoreFacingToUnit(getClosestEnemy(u.pos), u.pos, u.facing);

				function actionPointless(action) {
					let o = evaluate(action);

					if (o.dist < maxDist) return false;
					if (o.dist > maxDist) return true;
					if (o.threat < minThreat) return true;
					if (o.threat > minThreat) return false;
					if (o.strength < minStrength) return true;
					if (o.strength > minStrength) return false;
					return true;
				}

				for (let ab of u.abilities.filter(a => a.aiHints.includes(AiHints.MOVE))) {
					let options = [];
					for (let c of coords) {
						let action = ab.clickOnTile(u, [c[0], c[1]], c[2]);
						if (action != null && !actionPointless(action)) options.push(action);
					}

					function compare(a1, a2) {
						let o1 = evaluate(a1);
						let o2 = evaluate(a2);
						if (o1.dist < o2.dist) return -1;
						if (o1.dist > o2.dist) return 1;
						if (o1.threat < o2.threat) return 1;
						if (o1.threat > o2.threat) return -1;
						if (o1.strength < o2.strength) return 1;
						if (o1.strength > o2.strength) return -1;
						return 0;
					}

					if (options.length > 0) {
						options.sort((a, b) => compare(a, b));
						return options[0];
					}
				}
			}
		}
	}();
}
{
	// This behavior moves to the lowest elevation possible. It will not move to another space of the same elevation.
	// If there are multiple lowest elevation spaces, it will choose one randomly.
	aiData.MOVE_DOWNHILL = new class {
		getNextMove(units, currentState) {
			for (let u of units) {
				let moveAbilities = u.abilities.filter(a => a.aiHints.includes(AiHints.MOVE));
				let currentHeight = currentState.room.getTile(u.pos).height;
				let coords = [];
				for (let i = 0; i < currentState.room.tiles.length; i++) {
					for (let j = 0; j < currentState.room.tiles[i].length; j++) {
						if (currentState.room.getTile([i, j]).height >= currentHeight) continue;
						for (let q = 0; q < 4; q++) {
							coords.push([i, j, q]);
						}
					}
				}
				Util.shuffle(coords);

				coords.sort((a, b) => currentState.room.getTile(a).height - currentState.room.getTile(b).height);
				for (let ab of moveAbilities) {
					for (let c of coords) {
						let action = ab.clickOnTile(u, [c[0], c[1]], c[2]);
						if (action != undefined) return action;
					}
				}
			}
		}
	}();
}
{
	// This behavior identifies the set of closest enemies and turns to face one of them.
	// The closest enemies are the enemies at the shortest distance.
	// If there are closest enemies in a direct line, turn to face one of them.
	// Enemies on a pure diagonal are considered faced in both directions.
	// If there are multiple acceptable facings, will prefer the current facing, else choose one randomly.
	// This behavior will only yield an action if there is an action that does not change the position (but does change the facing correctly).
	aiData.MOVE_FACE_NEAREST = new class {
		getNextMove(units, currentState) {
			for (let u of units) {
				let objectiveFacings = new Set();

				{ // Calculate objectiveFacings.
					let closeUnits = [];
					for (let uu of currentState.units) {
						if (uu.player == u.player) continue;
						if (uu.state == Unit.State.DEFEATED) continue;
						closeUnits.push(uu);
					}
					closeUnits.sort((a, b) => {
						let da = Tile.distanceBetween(u.pos, a.pos);
						let db = Tile.distanceBetween(u.pos, b.pos);
						if (da != db) return da - db;
					});
					if (closeUnits.length != 0) {
						let d = Tile.distanceBetween(u.pos, closeUnits[0].pos);
						closeUnits = closeUnits.filter(uu => Tile.distanceBetween(uu.pos, u.pos) == d);

						let directCloseUnits = closeUnits.filter(uu => Tile.directionTo(u.pos, uu.pos) != -1);
						if (directCloseUnits.length != 0) closeUnits = directCloseUnits;

						for (let uu of closeUnits) for (let d of Tile.directionsToLenient(u.pos, uu.pos)) objectiveFacings.add(d);
					}
				}

				if (objectiveFacings.has(u.facing)) return;

				let moveAbilities = u.abilities.filter(a => a.aiHints.includes(AiHints.MOVE));
				let coords = [];
				for (let i = 0; i < currentState.room.tiles.length; i++) {
					for (let j = 0; j < currentState.room.tiles[i].length; j++) {
						for (let q = 0; q < 4; q++) {
							coords.push([i, j, q]);
						}
					}
				}
				Util.shuffle(coords);
				for (let ab of moveAbilities) {
					for (let c of coords) {
						let action = ab.clickOnTile(u, [c[0], c[1]], c[2]);
						if (action != undefined) {
							let actionChangesPos = false;
							let actionChangesFacingOK = false;
							for (let ef of action.effects) {
								if (ef.unit != u) continue;
								if (ef.property == "pos" && (ef.value[0] != u.pos[0] || ef.value[1] != u.pos[1])) actionChangesPos = true;
								if (ef.property == "facing" && objectiveFacings.has(ef.value)) actionChangesFacingOK = true;
							}
							if (!actionChangesPos && actionChangesFacingOK)	return action;
						}
					}
				}
			}
		}
	}();
}
{
	// This behavior maximizes distance from enemies, otherwise moving randomly.
	// If no move takes the unit further away, it will not act.
	aiData.MOVE_FLEE = new class {
		getNextMove(units, currentState) {
			for (let u of units) {
				let coords = [];
				for (let i = 0; i < currentState.room.tiles.length; i++) {
					for (let j = 0; j < currentState.room.tiles[i].length; j++) {
						for (let q = 0; q < 4; q++) {
							coords.push([i, j, q]);
						}
					}
				}
				Util.shuffle(coords);

				for (let ab of u.abilities.filter(a => a.aiHints.includes(AiHints.MOVE))) {
					function getDistToClosestFoe(pos) {
						let minDist = Number.MAX_VALUE; 
						for (let uu of currentState.units) {
							if (uu.player == u.player) continue;
							if (uu.state == Unit.State.DEFEATED) continue;
							let d = Tile.distanceBetween(uu.pos, pos);
							if (d < minDist) {
								minDist = d;
							}
						}
						return minDist;
					}

					let cutoffDist = getDistToClosestFoe(u.pos);

					function actionPointless(action) {
						let outcomePos = null;
						for (let effect of action.effects) {
							if (effect.unit == u && effect.property == "pos") outcomePos = effect.value;
						}
						if (outcomePos == null) outcomePos = u.pos;
						return getDistToClosestFoe(outcomePos) <= cutoffDist;
					}

					for (let c of coords) {
						let action = ab.clickOnTile(u, [c[0], c[1]], c[2]);
						if (action != null && !actionPointless(action)) return action;
					}
				}
			}
		}
	}();
}
{
	// This behavior moves randomly.
	aiData.MOVE_RANDOMLY = new class {
		getNextMove(units, currentState) {
			for (let u of units) {
				let moveAbilities = u.abilities.filter(a => a.aiHints.includes(AiHints.MOVE));
				let coords = [];
				for (let i = 0; i < currentState.room.tiles.length; i++) {
					for (let j = 0; j < currentState.room.tiles[i].length; j++) {
						for (let q = 0; q < 4; q++) {
							coords.push([i, j, q]);
						}
					}
				}
				Util.shuffle(coords);
				for (let ab of moveAbilities) {
					for (let c of coords) {
						let action = ab.clickOnTile(u, [c[0], c[1]], c[2]);
						if (action != undefined) return action;
					}
				}
			}
		}
	}();
}
{
	let c = {
		abilities: [abilityData.MOVE, abilityData.SHOOT, abilityData.CONTROL],
		id: "Archer",
		learnableAbilities: [abilityData.SOLARPOWER, abilityData.HIGHGROUND, abilityData.EMPATHY],
		portraits: 7,
		strengths: [1, 3, 4, 3],
		strengthsFrightened: [1, 3, 4, 3],
		threats: [true, false, false, false],
		threatsFrightened: [true, false, false, false],
	};
	characterData[c.id] = c;
}
{
	let c = {
		abilities: [abilityData.MOVE, abilityData.TERRIFY, abilityData.CONTROL],
		id: "Berserker",
		learnableAbilities: [abilityData.CHALLENGE, abilityData.DESPERATION, abilityData.PANIC],
		portraits: 5,
		strengths: [2, 2, 2, 2],
		strengthsFrightened: [5, 4, 1, 4],
		threats: [false, false, false, false],
		threatsFrightened: [true, true, false, true],
	};
	characterData[c.id] = c;
}
{
	let c = {
		abilities: [abilityData.FORMATION, abilityData.CLEAVE, abilityData.CONTROL],
		id: "Commander",
		learnableAbilities: [abilityData.TAUNT, abilityData.RESCUE, abilityData.DEFENDER],
		portraits: 8,
		strengths: [4, 1, 1, 4],
		strengthsFrightened: [3, 1, 1, 2],
		threats: [true, false, false, true],
		threatsFrightened: [true, false, false, true],
	};
	characterData[c.id] = c;
}
{
	let c = {
		abilities: [abilityData.MOVE, abilityData.PUSH, abilityData.CONTROL],
		id: "Dancer",
		learnableAbilities: [abilityData.SWAP, abilityData.PRESS, abilityData.SLOW],
		portraits: 7,
		strengths: [3, 3, 1, 3],
		strengthsFrightened: [2, 1, 2, 1],
		threats: [true, true, true, true],
		threatsFrightened: [true, false, false, false],
	};
	characterData[c.id] = c;
}
{
	let c = {
		abilities: [abilityData.MOVE, abilityData.BITE, abilityData.CONTROL],
		id: "Dog",
		learnableAbilities: [abilityData.ENERGIZE, abilityData.FRIGHTEN, abilityData.FEARMONGER],
		portraits: 13,
		strengths: [5, 2, 1, 2],
		strengthsFrightened: [4, 1, 1, 1],
		threats: [true, false, false, false],
		threatsFrightened: [true, false, false, false],
	};
	characterData[c.id] = c;
}
{
	let c = {
		abilities: [abilityData.MOVE, abilityData.CHARGE, abilityData.CONTROL],
		id: "Journeyman",
		learnableAbilities: [abilityData.STRIKE, abilityData.ENCOURAGE, abilityData.STARTUP],
		portraits: 6,
		strengths: [4, 3, 2, 2],
		strengthsFrightened: [3, 2, 2, 2],
		threats: [true, true, false, false],
		threatsFrightened: [false, false, false, false],
	};
	characterData[c.id] = c;
}
{
	let c = {
		abilities: [abilityData.EFFORTTELEPORT, abilityData.OUTMANEUVER, abilityData.SIPHON],
		id: "Kinetic",
		learnableAbilities: [abilityData.FACEENEMY, abilityData.VICTORIOUS, abilityData.REVENGE],
		portraits: 9,
		strengths: [5, 5, 2, 2],
		strengthsFrightened: [2, 2, 1, 1],
		threats: [false, false, false, false],
		threatsFrightened: [false, false, false, false],
	};
	characterData[c.id] = c;
}
{
	let c = {
		abilities: [abilityData.RUN, abilityData.ADVANCE, abilityData.CONTROL],
		id: "Skirmisher",
		learnableAbilities: [abilityData.FLEE, abilityData.SCORCHEDEARTH, abilityData.HURRY],
		portraits: 7,
		strengths: [3, 2, 2, 2],
		strengthsFrightened: [2, 2, 2, 2],
		threats: [true, true, true, true],
		threatsFrightened: [true, true, true, true],
	};
	characterData[c.id] = c;
}
{
	let c = {
		abilities: [abilityData.MOVE, abilityData.BACKSTAB, abilityData.CONTROL],
		id: "Thief",
		learnableAbilities: [abilityData.OPPORTUNITY, abilityData.VAULT, abilityData.SLIDE],
		portraits: 4,
		strengths: [4, 2, 3, 2],
		strengthsFrightened: [3, 1, 2, 1],
		threats: [true, false, true, false],
		threatsFrightened: [true, false, false, false],
	};
	characterData[c.id] = c;
}
{
	let c = {
		abilities: [abilityData.MOVE, abilityData.SWORD, abilityData.CONTROL],
		id: "Wisher",
		learnableAbilities: [abilityData.FLY, abilityData.TELEPORT, abilityData.DISTRACT],
		portraits: 19,
		strengths: [4, 3, 2, 3],
		strengthsFrightened: [3, 2, 1, 2],
		threats: [true, false, false, false],
		threatsFrightened: [true, false, false, false],
	};
	characterData[c.id] = c;
}
{
	let unit = {
		ai: [aiData.ATTACK_NEAREST],
		abilities: [abilityData.SHOOT],
		id: "Archer Statue",
		portrait: "archer_statue.png",
		recommendedRewards: {time: 1},
		strengths: [5, 5, 3, 5],
		strengthsFrightened: [4, 4, 2, 4],
		threats: [false, false, false, false],
		threatsFrightened: [false, false, false, false],
	};
	unitData[unit.id] = unit;
}
{
	let unit = {
		ai: [aiData.ATTACK_NEAREST, aiData.MOVE_RANDOMLY],
		abilities: [abilityData.MOVE, abilityData.STRIKE, abilityData.BITE, abilityData.CHARGE, abilityData.CONTROL, abilityData.PANIC],
		id: "Bear",
		portrait: "bear.png",
		recommendedRewards: {experience: 2},
		strengths: [6, 5, 4, 5],
		strengthsFrightened: [6, 5, 4, 5],
		threats: [true, true, false, true],
		threatsFrightened: [true, true, false, true],
	};
	unitData[unit.id] = unit;
}
{
	let unit = {
		ai: [aiData.MOVE_FACE_NEAREST, aiData.ATTACK_NEAREST],
		abilities: [abilityData.MOVE, abilityData.CHARGE, abilityData.CONTROL],
		id: "Bull",
		portrait: "bull.png",
		recommendedRewards: {experience: 1.3},
		strengths: [5, 3, 2, 3],
		strengthsFrightened: [6, 1, 1, 1],
		threats: [true, false, false, false],
		threatsFrightened: [true, false, false, false],
	};
	unitData[unit.id] = unit;
}
{
	let unit = {
		ai: [aiData.ATTACK_NEAREST, aiData.MOVE_CLOSER_AND_THREATEN],
		abilities: [abilityData.TELEPORT, abilityData.DESPERATION, abilityData.FRIGHTEN, abilityData.TERRIFY, abilityData.PRESS, abilityData.OPPORTUNITY],
		id: "Darkness",
		portrait: "moon.png",
		recommendedRewards: {experience: 5},
		strengths: [6, 6, 5, 6],
		strengthsFrightened: [5, 5, 4, 5],
		threats: [true, true, true, true],
		threatsFrightened: [true, true, false, true],
	};
	unitData[unit.id] = unit;
}
{
	let unit = {
		ai: [aiData.ATTACK_NEAREST, aiData.MOVE_CLOSER_AND_THREATEN, aiData.MOVE_CLIMB],
		abilities: [abilityData.TELEPORT, abilityData.HIGHGROUND, abilityData.CONTROL, abilityData.FLEE, abilityData.SCORCHEDEARTH],
		id: "Jaguar",
		portrait: "jaguar.png",
		recommendedRewards: {experience: 1, time: 1},
		strengths: [4, 3, 2, 3],
		strengthsFrightened: [3, 2, 2, 2],
		threats: [true, false, false, false],
		threatsFrightened: [false, false, false, false],
	};
	unitData[unit.id] = unit;
}
{
	let unit = {
		ai: [aiData.ATTACK_NEAREST, aiData.MOVE_RANDOMLY],
		abilities: [abilityData.MOVE, abilityData.BITE, abilityData.PANIC, abilityData.CONTROL, abilityData.PRESS, abilityData.OPPORTUNITY],
		id: "Opossum",
		portrait: "opossum.png",
		recommendedRewards: {heal: 1},
		strengths: [3, 3, 2, 3],
		strengthsFrightened: [4, 4, 3, 4],
		threats: [true, false, false, false],
		threatsFrightened: [true, true, true, false],
	};
	unitData[unit.id] = unit;
}
{
	let unit = {
		ai: [aiData.ATTACK_NEAREST, aiData.MOVE_RANDOMLY],
		abilities: [abilityData.MOVE, abilityData.BITE, abilityData.FEARMONGER],
		id: "Rat",
		portrait: "rat.png",
		recommendedRewards: {time: 1},
		strengths: [2, 1, 1, 1],
		strengthsFrightened: [1, 1, 1, 1],
		threats: [false, false, false, false],
		threatsFrightened: [false, false, false, false],
	};
	unitData[unit.id] = unit;
}
{
	let unit = {
		ai: [aiData.MOVE_DOWNHILL, aiData.ATTACK_NEAREST],
		abilities: [abilityData.MOVE, abilityData.FRIGHTEN, abilityData.CONTROL],
		id: "Snake",
		portrait: "snake.png",
		recommendedRewards: {heal: 1},
		strengths: [3, 3, 3, 3],
		strengthsFrightened: [2, 1, 1, 1],
		threats: [true, false, true, false],
		threatsFrightened: [false, false, false, false],
	};
	unitData[unit.id] = unit;
}
{
	let unit = {
		ai: [aiData.MOVE_CLOSER_AND_THREATEN, aiData.ATTACK_NEAREST],
		abilities: [abilityData.CHALLENGE, abilityData.BACKSTAB, abilityData.SLOW, abilityData.CONTROL],
		id: "Spider",
		portrait: "spider.png",
		recommendedRewards: {unlock: 1},
		strengths: [3, 3, 3, 3],
		strengthsFrightened: [1, 1, 1, 1],
		threats: [true, true, true, true],
		threatsFrightened: [false, false, false, false],
	};
	unitData[unit.id] = unit;
}
{
	let unit = {
		ai: [aiData.ATTACK_NEAREST],
		abilities: [abilityData.STRIKE],
		id: "Statue",
		portrait: "statue.png",
		recommendedRewards: {unlock: 1},
		strengths: [5, 5, 3, 5],
		strengthsFrightened: [4, 4, 2, 4],
		threats: [false, false, false, false],
		threatsFrightened: [false, false, false, false],
	};
	unitData[unit.id] = unit;
}
{
	let unit = {
		ai: [aiData.MOVE_CLIMB, aiData.ATTACK_NEAREST],
		abilities: [abilityData.FLY, abilityData.BITE],
		id: "Vulture",
		portrait: "vulture.png",
		recommendedRewards: {unlock: 1},
		strengths: [4, 2, 1, 2],
		strengthsFrightened: [2, 1, 1, 1],
		threats: [false, false, false, false],
		threatsFrightened: [false, false, false, false],
	};
	unitData[unit.id] = unit;
}
{
	let unit = {
		ai: [aiData.MOVE_CLOSER_AND_THREATEN, aiData.ATTACK_THREATENED, aiData.ATTACK_NEAREST],
		abilities: [abilityData.MOVE, abilityData.TERRIFY, abilityData.BITE, abilityData.CONTROL],
		id: "Wolf",
		portrait: "wolf.png",
		recommendedRewards: {experience: 1.4},
		strengths: [4, 3, 2, 3],
		strengthsFrightened: [3, 1, 0, 1],
		threats: [true, true, false, true],
		threatsFrightened: [true, false, false, false],
	};
	unitData[unit.id] = unit;
}
{ let room = {"entry":[2,0],"id":"CEREMONY_BOSS","random":"","reward":{"experience":0,"healing":0,"unlock":6,"character":2,"time":0},"tiles":[[{"t":"machine_2","h":0},{"t":"machine_4","h":0},{"t":"machine_2","h":0},{"t":"machine_4","h":0},{"t":"machine_2","h":0},{"t":"machine_4","h":0}],[{"t":"machine_3","h":0},{"t":"machine_8","h":1},{"t":"machine_3","h":0},{"t":"machine_8","h":1},{"t":"machine_3","h":0},{"t":"machine_2","h":0}],[{"t":"machine_1","h":0},{"t":"machine_1","h":0},{"t":"machine_1","h":0},{"t":"machine_1","h":0},{"t":"machine_8","h":1},{"t":"machine_5","h":2}],[{"t":"machine_1","h":0},{"t":"machine_1","h":0},{"t":"machine_1","h":0},{"t":"machine_1","h":0},{"t":"machine_8","h":1},{"t":"machine_5","h":2}],[{"t":"machine_3","h":0},{"t":"machine_8","h":1},{"t":"machine_3","h":0},{"t":"machine_8","h":1},{"t":"machine_3","h":0},{"t":"machine_2","h":0}],[{"t":"machine_2","h":0},{"t":"machine_4","h":0},{"t":"machine_2","h":0},{"t":"machine_4","h":0},{"t":"machine_2","h":0},{"t":"machine_4","h":0}]],"units":[{"player":1,"pos":[4,1],"facing":0,"type":"Statue"},{"player":1,"pos":[1,1],"facing":2,"type":"Statue"},{"player":1,"pos":[2,5],"facing":2,"type":"Bear"},{"player":1,"pos":[0,0],"facing":0,"type":"Spider"}]}; roomData[room.id] = room; }
{ let room = {"entry":[1,0],"id":"CEREMONY_R10","random":"CEREMONY_RR","reward":{"experience":1,"healing":0,"unlock":5,"character":0,"time":3},"tiles":[[{"t":"machine_5","h":1},{"t":"machine_2","h":0},{"t":"machine_3","h":0},{"t":"machine_2","h":0},{"t":"machine_5","h":1}],[{"t":"machine_7","h":2},{"t":"machine_8","h":1},{"t":"machine_4","h":0},{"t":"machine_8","h":1},{"t":"machine_7","h":2}],[{"t":"machine_7","h":2},{"t":"machine_4","h":0},{"t":"machine_1","h":0},{"t":"machine_4","h":0},{"t":"machine_7","h":2}],[{"t":"machine_7","h":2},{"t":"machine_8","h":1},{"t":"machine_4","h":0},{"t":"machine_8","h":1},{"t":"machine_7","h":2}],[{"t":"machine_5","h":1},{"t":"machine_2","h":0},{"t":"machine_3","h":0},{"t":"machine_2","h":0},{"t":"machine_5","h":1}]],"units":[{"player":1,"pos":[4,1],"facing":0,"type":"Bull"},{"player":1,"pos":[0,1],"facing":2,"type":"Bull"},{"player":1,"pos":[3,3],"facing":3,"type":"Bull"},{"player":1,"pos":[1,3],"facing":3,"type":"Bull"},{"player":1,"pos":[2,4],"facing":3,"type":"Statue"}]}; roomData[room.id] = room; }
{ let room = {"entry":[1,0],"id":"CEREMONY_R1","random":"CEREMONY_RR","reward":{"experience":1,"healing":0,"unlock":1,"character":0,"time":2},"tiles":[[{"t":"machine_7","h":2},{"t":"machine_7","h":1},{"t":"machine_3","h":0},{"t":"machine_8","h":1}],[{"t":"machine_6","h":1},{"t":"machine_2","h":0},{"t":"machine_1","h":0},{"t":"machine_4","h":0}],[{"t":"machine_4","h":0},{"t":"machine_1","h":0},{"t":"machine_2","h":0},{"t":"machine_6","h":1}],[{"t":"machine_8","h":1},{"t":"machine_3","h":0},{"t":"machine_7","h":1},{"t":"machine_7","h":2}]],"units":[{"player":1,"pos":[2,2],"facing":0,"type":"Spider"},{"player":1,"pos":[0,0],"facing":0,"type":"Spider"},{"player":1,"pos":[0,3],"facing":0,"type":"Rat"}]}; roomData[room.id] = room; }
{ let room = {"entry":[1,0],"id":"CEREMONY_R2","random":"CEREMONY_RR","reward":{"experience":0,"healing":0,"unlock":0,"character":0,"time":1},"tiles":[[{"t":"machine_7","h":1},{"t":"machine_2","h":0},{"t":"machine_2","h":0},{"t":"machine_7","h":1}],[{"t":"machine_2","h":0},{"t":"machine_1","h":0},{"t":"machine_5","h":0},{"t":"machine_2","h":0}],[{"t":"machine_2","h":0},{"t":"machine_5","h":0},{"t":"machine_1","h":0},{"t":"machine_2","h":0}],[{"t":"machine_7","h":1},{"t":"machine_2","h":0},{"t":"machine_2","h":0},{"t":"machine_7","h":1}]],"units":[{"player":1,"pos":[1,2],"facing":0,"type":"Opossum"},{"player":1,"pos":[2,3],"facing":3,"type":"Opossum"}]}; roomData[room.id] = room; }
{ let room = {"entry":[2,0],"id":"CEREMONRY_R3","random":"CEREMONY_RR","reward":{"experience":0,"healing":0,"unlock":0,"character":0,"time":1},"tiles":[[{"t":"machine_7","h":2},{"t":"machine_4","h":0},{"t":"machine_2","h":0},{"t":"machine_4","h":0},{"t":"machine_7","h":2}],[{"t":"machine_5","h":1},{"t":"machine_7","h":2},{"t":"machine_3","h":0},{"t":"machine_7","h":2},{"t":"machine_5","h":1}],[{"t":"machine_6","h":1},{"t":"machine_8","h":1},{"t":"machine_1","h":0},{"t":"machine_8","h":1},{"t":"machine_6","h":1}],[{"t":"machine_5","h":1},{"t":"machine_7","h":2},{"t":"machine_3","h":0},{"t":"machine_7","h":2},{"t":"machine_5","h":1}],[{"t":"machine_7","h":2},{"t":"machine_4","h":0},{"t":"machine_2","h":0},{"t":"machine_4","h":0},{"t":"machine_7","h":2}]],"units":[{"player":1,"pos":[2,2],"facing":3,"type":"Bear"}]}; roomData[room.id] = room; }
{ let room = {"entry":[0,0],"id":"CEREMONY_R4","random":"CEREMONY_RR","reward":{"experience":2,"healing":0,"unlock":0,"character":0,"time":2},"tiles":[[{"t":"machine_1","h":0},{"t":"machine_2","h":0},{"t":"machine_8","h":1},{"t":"machine_2","h":0},{"t":"machine_1","h":0}],[{"t":"machine_2","h":0},{"t":"machine_4","h":0},{"t":"machine_3","h":0},{"t":"machine_4","h":0},{"t":"machine_2","h":0}],[{"t":"machine_8","h":1},{"t":"machine_3","h":0},{"t":"machine_8","h":1},{"t":"machine_3","h":0},{"t":"machine_8","h":1}],[{"t":"machine_2","h":0},{"t":"machine_4","h":0},{"t":"machine_3","h":0},{"t":"machine_4","h":0},{"t":"machine_2","h":0}],[{"t":"machine_1","h":0},{"t":"machine_2","h":0},{"t":"machine_8","h":1},{"t":"machine_2","h":0},{"t":"machine_1","h":0}]],"units":[{"player":1,"pos":[3,4],"facing":0,"type":"Spider"},{"player":1,"pos":[2,2],"facing":3,"type":"Archer Statue"},{"player":1,"pos":[0,3],"facing":2,"type":"Wolf"}]}; roomData[room.id] = room; }
{ let room = {"entry":[0,0],"id":"CEREMONY_R5","random":"CEREMONY_RR","reward":{"experience":0,"healing":2,"unlock":0,"character":0,"time":1},"tiles":[[{"t":"machine_4","h":0},{"t":"machine_8","h":1},{"t":"machine_4","h":0}],[{"t":"machine_7","h":2},{"t":"machine_6","h":1},{"t":"machine_7","h":2}],[{"t":"machine_4","h":0},{"t":"machine_8","h":1},{"t":"machine_4","h":0}]],"units":[{"player":1,"pos":[1,2],"facing":3,"type":"Bear"}]}; roomData[room.id] = room; }
{ let room = {"entry":[2,0],"id":"CEREMONY_R6","random":"CEREMONY_RR","reward":{"experience":1,"healing":0,"unlock":0,"character":0,"time":2},"tiles":[[{"t":"machine_3","h":0},{"t":"machine_3","h":0},{"t":"machine_3","h":0},{"t":"machine_3","h":0}],[{"t":"machine_5","h":2},{"t":"machine_5","h":2},{"t":"machine_8","h":1},{"t":"machine_1","h":0}],[{"t":"machine_4","h":0},{"t":"machine_2","h":0},{"t":"machine_4","h":0},{"t":"machine_2","h":0}],[{"t":"machine_2","h":0},{"t":"machine_4","h":0},{"t":"machine_2","h":0},{"t":"machine_4","h":0}],[{"t":"machine_5","h":2},{"t":"machine_5","h":2},{"t":"machine_8","h":1},{"t":"machine_1","h":0}],[{"t":"machine_3","h":0},{"t":"machine_3","h":0},{"t":"machine_3","h":0},{"t":"machine_3","h":0}]],"units":[{"player":1,"pos":[5,0],"facing":0,"type":"Vulture"},{"player":1,"pos":[0,0],"facing":2,"type":"Vulture"},{"player":1,"pos":[1,2],"facing":0,"type":"Snake"},{"player":1,"pos":[4,2],"facing":0,"type":"Snake"}]}; roomData[room.id] = room; }
{ let room = {"entry":[2,0],"id":"CEREMONY_R7","random":"CEREMONY_RR","reward":{"experience":1,"healing":1,"unlock":0,"character":0,"time":2},"tiles":[[{"t":"machine_8","h":1},{"t":"machine_7","h":2},{"t":"machine_8","h":1},{"t":"machine_7","h":2},{"t":"machine_8","h":1}],[{"t":"machine_2","h":0},{"t":"machine_2","h":0},{"t":"machine_2","h":0},{"t":"machine_2","h":0},{"t":"machine_2","h":0}],[{"t":"machine_1","h":0},{"t":"machine_4","h":0},{"t":"machine_1","h":0},{"t":"machine_4","h":0},{"t":"machine_1","h":0}],[{"t":"machine_1","h":0},{"t":"machine_4","h":0},{"t":"machine_1","h":0},{"t":"machine_4","h":0},{"t":"machine_1","h":0}],[{"t":"machine_2","h":0},{"t":"machine_2","h":0},{"t":"machine_2","h":0},{"t":"machine_2","h":0},{"t":"machine_2","h":0}],[{"t":"machine_8","h":1},{"t":"machine_7","h":2},{"t":"machine_8","h":1},{"t":"machine_7","h":2},{"t":"machine_8","h":1}]],"units":[{"player":1,"pos":[4,2],"facing":0,"type":"Opossum"},{"player":1,"pos":[4,4],"facing":0,"type":"Opossum"},{"player":1,"pos":[1,4],"facing":2,"type":"Opossum"},{"player":1,"pos":[1,2],"facing":2,"type":"Opossum"},{"player":1,"pos":[4,0],"facing":0,"type":"Opossum"},{"player":1,"pos":[1,0],"facing":2,"type":"Opossum"}]}; roomData[room.id] = room; }
{ let room = {"entry":[0,0],"id":"CEREMONY_R8","random":"CEREMONY_RR","reward":{"experience":0,"healing":0,"unlock":0,"character":0,"time":1},"tiles":[[{"t":"machine_2","h":0},{"t":"machine_4","h":0},{"t":"machine_2","h":0}],[{"t":"machine_4","h":0},{"t":"machine_7","h":2},{"t":"machine_4","h":0}],[{"t":"machine_2","h":0},{"t":"machine_4","h":0},{"t":"machine_2","h":0}]],"units":[{"player":1,"pos":[1,2],"facing":0,"type":"Spider"},{"player":1,"pos":[2,1],"facing":3,"type":"Wolf"}]}; roomData[room.id] = room; }
{ let room = {"entry":[0,0],"id":"CEREMONY_R9","random":"CEREMONY_RR","reward":{"experience":0,"healing":2,"unlock":0,"character":0,"time":2},"tiles":[[{"t":"machine_7","h":2},{"t":"machine_6","h":1},{"t":"machine_3","h":0},{"t":"machine_6","h":1},{"t":"machine_7","h":2}],[{"t":"machine_7","h":2},{"t":"machine_5","h":1},{"t":"machine_1","h":0},{"t":"machine_5","h":1},{"t":"machine_7","h":2}],[{"t":"machine_7","h":2},{"t":"machine_6","h":1},{"t":"machine_3","h":0},{"t":"machine_6","h":1},{"t":"machine_7","h":2}]],"units":[{"player":1,"pos":[2,4],"facing":2,"type":"Archer Statue"},{"player":1,"pos":[1,4],"facing":2,"type":"Archer Statue"},{"player":1,"pos":[0,4],"facing":1,"type":"Archer Statue"}]}; roomData[room.id] = room; }
{ let room = {"entry":[1,0],"id":"1611027518489_23009","random":"COMMUNITY_ANY","reward":{"experience":2,"healing":0,"unlock":1,"character":0,"time":0},"tiles":[[{"t":"portuguese_12","h":0},{"t":"portuguese_15","h":1},{"t":"portuguese_14","h":2},{"t":"portuguese_16","h":1},{"t":"portuguese_11","h":0}],[{"t":"portuguese_9","h":0},{"t":"portuguese_11","h":0},{"t":"portuguese_13","h":2},{"t":"portuguese1","h":1},{"t":"portuguese_12","h":0}],[{"t":"portuguese_9","h":0},{"t":"portuguese_11","h":0},{"t":"portuguese_13","h":2},{"t":"portuguese1","h":1},{"t":"portuguese_12","h":0}],[{"t":"portuguese_12","h":0},{"t":"portuguese_15","h":1},{"t":"portuguese_14","h":2},{"t":"portuguese_16","h":1},{"t":"portuguese_11","h":0}]],"units":[{"player":1,"pos":[0,4],"facing":3,"type":"Vulture"},{"player":1,"pos":[1,4],"facing":3,"type":"Vulture"},{"player":1,"pos":[2,4],"facing":3,"type":"Vulture"},{"player":1,"pos":[3,4],"facing":3,"type":"Vulture"}]}; roomData[room.id] = room; }
{ let room = {"entry":[1,0],"id":"1611025797596_76429","random":"COMMUNITY_ANY","reward":{"experience":2,"healing":1,"unlock":1,"character":0,"time":0},"tiles":[[{"t":"portuguese_9","h":0},{"t":"portuguese_12","h":0},{"t":"portuguese_11","h":0}],[{"t":"portuguese_16","h":2},{"t":"portuguese8","h":1},{"t":"portuguese7","h":0}],[{"t":"portuguese_16","h":2},{"t":"portuguese8","h":1},{"t":"portuguese7","h":0}],[{"t":"portuguese_9","h":0},{"t":"portuguese_12","h":0},{"t":"portuguese_11","h":0}]],"units":[{"player":1,"pos":[3,1],"facing":0,"type":"Statue"},{"player":1,"pos":[0,1],"facing":2,"type":"Statue"},{"player":1,"pos":[1,2],"facing":3,"type":"Vulture"},{"player":1,"pos":[2,2],"facing":3,"type":"Vulture"}]}; roomData[room.id] = room; }
{ let room = {"entry":[1,0],"id":"1611026127996_42381","random":"COMMUNITY_ANY","reward":{"experience":1,"healing":2,"unlock":0,"character":0,"time":2},"tiles":[[{"t":"portuguese5","h":0},{"t":"portuguese_14","h":1},{"t":"portuguese_16","h":2},{"t":"portuguese_16","h":2},{"t":"portuguese_14","h":1},{"t":"portuguese5","h":0}],[{"t":"portuguese_11","h":0},{"t":"portuguese_9","h":0},{"t":"portuguese_11","h":0},{"t":"portuguese_9","h":0},{"t":"portuguese_11","h":0},{"t":"portuguese_9","h":0}],[{"t":"portuguese_12","h":0},{"t":"portuguese_10","h":0},{"t":"portuguese_12","h":0},{"t":"portuguese_10","h":0},{"t":"portuguese_12","h":0},{"t":"portuguese_10","h":0}],[{"t":"portuguese5","h":0},{"t":"portuguese_14","h":1},{"t":"portuguese_16","h":2},{"t":"portuguese_16","h":2},{"t":"portuguese_14","h":1},{"t":"portuguese5","h":0}]],"units":[{"player":1,"pos":[0,5],"facing":3,"type":"Bull"},{"player":1,"pos":[3,5],"facing":3,"type":"Bull"},{"player":1,"pos":[1,2],"facing":2,"type":"Statue"},{"player":1,"pos":[2,2],"facing":0,"type":"Statue"}]}; roomData[room.id] = room; }
{ let room = {"entry":[1,0],"id":"1611023886912_3682","random":"COMMUNITY_ANY","reward":{"experience":2,"healing":1,"unlock":1,"character":0,"time":0},"tiles":[[{"t":"portuguese_14","h":2},{"t":"portuguese_15","h":1},{"t":"portuguese_16","h":1},{"t":"portuguese_13","h":1}],[{"t":"portuguese_9","h":0},{"t":"portuguese_10","h":0},{"t":"portuguese_11","h":0},{"t":"portuguese_14","h":1}],[{"t":"portuguese_9","h":0},{"t":"portuguese_10","h":0},{"t":"portuguese_11","h":0},{"t":"portuguese_14","h":1}],[{"t":"portuguese_14","h":2},{"t":"portuguese_15","h":1},{"t":"portuguese_16","h":1},{"t":"portuguese_13","h":1}]],"units":[{"player":1,"pos":[3,0],"facing":0,"type":"Bull"},{"player":1,"pos":[0,0],"facing":2,"type":"Bull"},{"player":1,"pos":[1,2],"facing":3,"type":"Rat"},{"player":1,"pos":[2,3],"facing":3,"type":"Rat"}]}; roomData[room.id] = room; }
{ let room = {"entry":[0,0],"id":"1611370017571_18100","random":"COMMUNITY_ANY","reward":{"experience":2,"healing":0,"unlock":0,"character":0,"time":0},"tiles":[[{"t":"forest_11","h":0},{"t":"forest_12","h":0},{"t":"forest_9","h":0},{"t":"forest_14","h":2},{"t":"forest_6","h":1},{"t":"forest_9","h":0}],[{"t":"forest_10","h":0},{"t":"forest_10","h":0},{"t":"forest_13","h":1},{"t":"forest_16","h":2},{"t":"forest_13","h":1},{"t":"forest_10","h":0}],[{"t":"forest_12","h":0},{"t":"forest_12","h":0},{"t":"forest_9","h":0},{"t":"forest_14","h":2},{"t":"forest_6","h":1},{"t":"forest_9","h":0}]],"units":[{"player":1,"pos":[2,3],"facing":3,"type":"Wolf"},{"player":1,"pos":[1,3],"facing":3,"type":"Wolf"},{"player":1,"pos":[0,3],"facing":3,"type":"Wolf"}]}; roomData[room.id] = room; }
{ let room = {"entry":[2,0],"id":"1611196405601_49655","random":"COMMUNITY_ANY","reward":{"experience":1,"healing":0,"unlock":1,"character":0,"time":1},"tiles":[[{"t":"portuguese1","h":2},{"t":"portuguese6","h":2},{"t":"portuguese3","h":1},{"t":"portuguese8","h":1}],[{"t":"portuguese6","h":2},{"t":"portuguese1","h":2},{"t":"portuguese8","h":1},{"t":"portuguese3","h":1}],[{"t":"portuguese8","h":1},{"t":"portuguese3","h":1},{"t":"portuguese7","h":0},{"t":"portuguese4","h":0}],[{"t":"portuguese3","h":1},{"t":"portuguese8","h":1},{"t":"portuguese4","h":0},{"t":"portuguese7","h":0}]],"units":[{"player":1,"pos":[1,0],"facing":2,"type":"Bull"},{"player":1,"pos":[3,2],"facing":3,"type":"Vulture"},{"player":1,"pos":[1,1],"facing":1,"type":"Statue"},{"player":1,"pos":[2,2],"facing":3,"type":"Rat"}]}; roomData[room.id] = room; }
{ let room = {"entry":[2,0],"id":"1611371192940_7214","random":"COMMUNITY_ANY","reward":{"experience":0,"healing":0,"unlock":0,"character":0,"time":2},"tiles":[[{"t":"forest_9","h":0},{"t":"forest_11","h":0},{"t":"forest_12","h":0}],[{"t":"forest_16","h":2},{"t":"forest_15","h":2},{"t":"forest_14","h":2}],[{"t":"forest_11","h":0},{"t":"forest_9","h":0},{"t":"forest_14","h":1}],[{"t":"forest_11","h":0},{"t":"forest_9","h":0},{"t":"forest_14","h":1}],[{"t":"forest_16","h":2},{"t":"forest_15","h":2},{"t":"forest_14","h":2}],[{"t":"forest_9","h":0},{"t":"forest_11","h":0},{"t":"forest_12","h":0}]],"units":[{"player":1,"pos":[5,0],"facing":3,"type":"Archer Statue"},{"player":1,"pos":[5,1],"facing":0,"type":"Archer Statue"},{"player":1,"pos":[0,1],"facing":2,"type":"Archer Statue"},{"player":1,"pos":[0,0],"facing":3,"type":"Archer Statue"},{"player":1,"pos":[0,2],"facing":1,"type":"Archer Statue"},{"player":1,"pos":[5,2],"facing":1,"type":"Archer Statue"}]}; roomData[room.id] = room; }
{ let room = {"entry":[1,0],"id":"1611372991745_41490","random":"COMMUNITY_ANY","reward":{"experience":0,"healing":0,"unlock":2,"character":0,"time":0},"tiles":[[{"t":"machine_1","h":0},{"t":"machine_1","h":0},{"t":"machine_1","h":0},{"t":"machine_1","h":0}],[{"t":"ceremony_9","h":0},{"t":"ceremony_11","h":0},{"t":"ceremony_10","h":0},{"t":"ceremony_11","h":0}],[{"t":"ceremony_9","h":0},{"t":"ceremony_11","h":0},{"t":"ceremony_10","h":0},{"t":"ceremony_11","h":0}],[{"t":"machine_1","h":0},{"t":"machine_1","h":0},{"t":"machine_1","h":0},{"t":"machine_1","h":0}]],"units":[{"player":1,"pos":[1,2],"facing":3,"type":"Statue"},{"player":1,"pos":[2,2],"facing":3,"type":"Statue"},{"player":1,"pos":[1,3],"facing":0,"type":"Spider"},{"player":1,"pos":[2,3],"facing":0,"type":"Spider"}]}; roomData[room.id] = room; }
{ let room = {"entry":[2,0],"id":"1611373634028_26363","random":"COMMUNITY_ANY","reward":{"experience":2,"healing":0,"unlock":0,"character":0,"time":2},"tiles":[[{"t":"forest_13","h":2},{"t":"forest_16","h":2},{"t":"forest_16","h":2},{"t":"forest_15","h":2},{"t":"forest_13","h":2}],[{"t":"forest_15","h":2},{"t":"forest_12","h":0},{"t":"forest_9","h":0},{"t":"forest_12","h":0},{"t":"forest_16","h":2}],[{"t":"forest_16","h":2},{"t":"forest_11","h":0},{"t":"forest_9","h":0},{"t":"forest_11","h":0},{"t":"forest_16","h":2}],[{"t":"forest_16","h":2},{"t":"forest_12","h":0},{"t":"forest_9","h":0},{"t":"forest_12","h":0},{"t":"forest_15","h":2}],[{"t":"forest_13","h":2},{"t":"forest_15","h":2},{"t":"forest_16","h":2},{"t":"forest_16","h":2},{"t":"forest_13","h":2}]],"units":[{"player":1,"pos":[2,2],"facing":3,"type":"Jaguar"},{"player":1,"pos":[3,2],"facing":3,"type":"Jaguar"},{"player":1,"pos":[1,2],"facing":3,"type":"Jaguar"}]}; roomData[room.id] = room; }
{ let room = {"entry":[0,1],"id":"1611374438480_5131","random":"COMMUNITY_ANY","reward":{"experience":2,"healing":0,"unlock":0,"character":0,"time":2},"tiles":[[{"t":"forest_11","h":0},{"t":"forest_10","h":0},{"t":"forest_16","h":2},{"t":"forest_13","h":1},{"t":"forest_12","h":0},{"t":"forest_11","h":0},{"t":"forest_10","h":0},{"t":"forest_9","h":0}],[{"t":"forest_9","h":0},{"t":"forest_9","h":0},{"t":"forest_11","h":0},{"t":"forest_12","h":0},{"t":"forest_16","h":2},{"t":"forest_13","h":1},{"t":"forest_12","h":0},{"t":"forest_11","h":0}],[{"t":"forest_11","h":0},{"t":"forest_10","h":0},{"t":"forest_16","h":2},{"t":"forest_13","h":1},{"t":"forest_12","h":0},{"t":"forest_11","h":0},{"t":"forest_10","h":0},{"t":"forest_9","h":0}]],"units":[{"player":1,"pos":[1,6],"facing":3,"type":"Bear"},{"player":1,"pos":[0,0],"facing":1,"type":"Archer Statue"},{"player":1,"pos":[1,0],"facing":3,"type":"Archer Statue"},{"player":1,"pos":[2,0],"facing":1,"type":"Archer Statue"}]}; roomData[room.id] = room; }
{
	let room = {
		dependencies: [],
		difficulty: 0,
		entry: [1, 0],
		exit: [3, 3],
		id: "BUILTIN_DEMO_00",
		random: "GARDEN_RR",
		reward: {
			experience: 1,
			healing: 2,
		},
		tiles: [
			[{t: "portuguese1", h: 1}, {t: "portuguese2", h: 0}, {t: "portuguese2", h: 0}, {t: "portuguese1", h: 1}],
			[{t: "portuguese2", h: 0}, {t: "portuguese3", h: 0}, {t: "portuguese4", h: 0}, {t: "portuguese2", h: 0}],
			[{t: "portuguese2", h: 0}, {t: "portuguese4", h: 0}, {t: "portuguese3", h: 0}, {t: "portuguese2", h: 0}],
			[{t: "portuguese1", h: 1}, {t: "portuguese2", h: 0}, {t: "portuguese2", h: 0}, {t: "portuguese1", h: 1}],
		],
		units: [
			{
				type: "Rat",
				facing: 3,
				pos: [2, 3],
				player: 1,
			},
			{
				type: "Rat",
				facing: 0,
				pos: [1, 2],
				player: 1,
			},
		],
	};
	roomData[room.id] = room;
}
{
	let room = {
		dependencies: [],
		difficulty: 0,
		entry: [0, 0],
		exit: [3, 3],
		id: "BUILTIN_DEMO_01",
		random: "GARDEN_RR",
		reward: {
			healing: 2,
		},
		tiles: [
			[{t: "portuguese1", h: 0}, {t: "portuguese2", h: 0}, {t: "portuguese2", h: 0}, {t: "portuguese1", h: 0}],
			[{t: "portuguese2", h: 0}, {t: "portuguese3", h: 1}, {t: "portuguese4", h: 1}, {t: "portuguese2", h: 0}],
			[{t: "portuguese2", h: 0}, {t: "portuguese4", h: 1}, {t: "portuguese3", h: 1}, {t: "portuguese2", h: 0}],
			[{t: "portuguese1", h: 0}, {t: "portuguese2", h: 0}, {t: "portuguese2", h: 0}, {t: "portuguese1", h: 0}],
		],
		units: [
			{
				type: "Statue",
				facing: 0,
				pos: [1, 2],
				player: 1,
			},
			{
				type: "Statue",
				facing: 3,
				pos: [2, 1],
				player: 1,
			},
		],
	};
	roomData[room.id] = room;
}
{ let room = {"difficulty":1,"entry":[1,0],"id":"BUILTIN_DEMO_02",random: "GARDEN_RR","reward":{"experience":1,"healing":1,"unlock":0,"character":0},"tiles":[[{"t":"portuguese6","h":1},{"t":"portuguese2","h":0},{"t":"portuguese4","h":0}],[{"t":"portuguese1","h":2},{"t":"portuguese4","h":0},{"t":"portuguese1","h":2}],[{"t":"portuguese6","h":1},{"t":"portuguese2","h":0},{"t":"portuguese4","h":0}]],"units":[{"player":1,"pos":[1,2],"facing":3,"type":"Vulture"}]}; roomData[room.id] = room; }
{
	let room = {
		dependencies: [],
		difficulty: 0,
		entry: [0, 2],
		exit: [3, 3],
		id: "BUILTIN_DEMO_10",
		random: "GARDEN_RR",
		reward: {
			experience: 1,
			healing: 0,
		},
		tiles: [
			[{t: "portuguese3", h: 1}, {t: "portuguese1", h: 2}, {t: "portuguese5", h: 0}, {t: "portuguese7", h: 0}, {t: "portuguese1", h: 2}, {t: "portuguese3", h: 1}],
			[{t: "portuguese4", h: 0}, {t: "portuguese5", h: 0}, {t: "portuguese7", h: 0}, {t: "portuguese2", h: 0}, {t: "portuguese7", h: 0}, {t: "portuguese5", h: 0}],
			[{t: "portuguese5", h: 0}, {t: "portuguese1", h: 2}, {t: "portuguese1", h: 2}, {t: "portuguese3", h: 1}, {t: "portuguese1", h: 2}, {t: "portuguese7", h: 0}],
			[{t: "portuguese7", h: 0}, {t: "portuguese1", h: 2}, {t: "portuguese3", h: 1}, {t: "portuguese1", h: 2}, {t: "portuguese1", h: 2}, {t: "portuguese2", h: 0}],
			[{t: "portuguese2", h: 0}, {t: "portuguese4", h: 0}, {t: "portuguese5", h: 0}, {t: "portuguese7", h: 0}, {t: "portuguese2", h: 0}, {t: "portuguese4", h: 0}],
			[{t: "portuguese1", h: 2}, {t: "portuguese3", h: 1}, {t: "portuguese7", h: 0}, {t: "portuguese2", h: 0}, {t: "portuguese3", h: 1}, {t: "portuguese1", h: 2}],
		],
		units: [
			{
				type: "Rat",
				facing: 3,
				pos: [5, 1],
				player: 1,
			},
			{
				type: "Rat",
				facing: 0,
				pos: [5, 4],
				player: 1,
			},
			{
				type: "Rat",
				facing: 0,
				pos: [3, 3],
				player: 1,
			},
		],
	};
	roomData[room.id] = room;
}
{ let room = {"difficulty":1,"entry":[1,0],"id":"BUILTIN_DEMO_11",random: "GARDEN_RR","reward":{"experience":1,"healing":0,"unlock":1,"character":0},"tiles":[[{"t":"portuguese2","h":0},{"t":"portuguese6","h":1},{"t":"portuguese1","h":1},{"t":"portuguese5","h":0},{"t":"portuguese4","h":0}],[{"t":"portuguese5","h":0},{"t":"portuguese1","h":0},{"t":"portuguese1","h":0},{"t":"portuguese1","h":0},{"t":"portuguese6","h":1}],[{"t":"portuguese1","h":1},{"t":"portuguese2","h":0},{"t":"portuguese3","h":0},{"t":"portuguese2","h":0},{"t":"portuguese1","h":1}],[{"t":"portuguese6","h":1},{"t":"portuguese1","h":0},{"t":"portuguese1","h":0},{"t":"portuguese1","h":0},{"t":"portuguese5","h":0}],[{"t":"portuguese4","h":0},{"t":"portuguese5","h":0},{"t":"portuguese1","h":1},{"t":"portuguese6","h":1},{"t":"portuguese2","h":0}]],"units":[{"player":1,"pos":[2,2],"facing":3,"type":"Statue"},{"player":1,"pos":[4,2],"facing":0,"type":"Rat"},{"player":1,"pos":[1,4],"facing":3,"type":"Rat"}]}; roomData[room.id] = room; }
{ let room = {"difficulty":1,"entry":[1,0],"id":"BUILTIN_DEMO_12",random: "GARDEN_RR","reward":{"experience":0,"healing":1,"unlock":2,"character":0},"tiles":[[{"t":"portuguese1","h":2},{"t":"portuguese3","h":1},{"t":"portuguese5","h":0},{"t":"portuguese1","h":2}],[{"t":"portuguese5","h":0},{"t":"portuguese4","h":0},{"t":"portuguese7","h":0},{"t":"portuguese3","h":1}],[{"t":"portuguese3","h":1},{"t":"portuguese7","h":0},{"t":"portuguese4","h":0},{"t":"portuguese5","h":0}],[{"t":"portuguese1","h":2},{"t":"portuguese5","h":0},{"t":"portuguese3","h":1},{"t":"portuguese1","h":2}]],"units":[{"player":1,"pos":[3,3],"facing":3,"type":"Rat"},{"player":1,"pos":[1,3],"facing":2,"type":"Vulture"},{"player":1,"pos":[0,0],"facing":3,"type":"Statue"}]}; roomData[room.id] = room; }
{ let room = {
  "difficulty": 3,
  "entry": [
    1,
    0
  ],
  "id": "BUILTIN_DEMO_20",
  random: "GARDEN_RR",
  "reward": {
    "experience": 3,
    "healing": 0,
    "unlock": 0,
    "character": 0
  },
  "tiles": [
    [
      {
        "t": "portuguese2",
        "h": 0
      },
      {
        "t": "portuguese1",
        "h": 2
      },
      {
        "t": "portuguese2",
        "h": 0
      },
      {
        "t": "portuguese1",
        "h": 2
      },
      {
        "t": "portuguese2",
        "h": 0
      }
    ],
    [
      {
        "t": "portuguese7",
        "h": 0
      },
      {
        "t": "portuguese4",
        "h": 0
      },
      {
        "t": "portuguese7",
        "h": 0
      },
      {
        "t": "portuguese4",
        "h": 0
      },
      {
        "t": "portuguese7",
        "h": 0
      }
    ],
    [
      {
        "t": "portuguese2",
        "h": 0
      },
      {
        "t": "portuguese7",
        "h": 0
      },
      {
        "t": "portuguese1",
        "h": 2
      },
      {
        "t": "portuguese7",
        "h": 0
      },
      {
        "t": "portuguese1",
        "h": 2
      }
    ],
    [
      {
        "t": "portuguese1",
        "h": 2
      },
      {
        "t": "portuguese4",
        "h": 0
      },
      {
        "t": "portuguese7",
        "h": 0
      },
      {
        "t": "portuguese4",
        "h": 0
      },
      {
        "t": "portuguese7",
        "h": 0
      }
    ],
    [
      {
        "t": "portuguese2",
        "h": 0
      },
      {
        "t": "portuguese7",
        "h": 0
      },
      {
        "t": "portuguese1",
        "h": 2
      },
      {
        "t": "portuguese7",
        "h": 0
      },
      {
        "t": "portuguese2",
        "h": 0
      }
    ]
  ],
  "units": [
    {
      "player": 1,
      "pos": [
        0,
        1
      ],
      "facing": 2,
      "type": "Vulture"
    },
    {
      "player": 1,
      "pos": [
        3,
        0
      ],
      "facing": 0,
      "type": "Vulture"
    },
    {
      "player": 1,
      "pos": [
        2,
        2
      ],
      "facing": 3,
      "type": "Vulture"
    },
    {
      "player": 1,
      "pos": [
        2,
        4
      ],
      "facing": 2,
      "type": "Vulture"
    }
  ]
}; roomData[room.id] = room; }
{ let room = {"difficulty":1,"entry":[2,0],"id":"BUILTIN_DEMO_21",random: "GARDEN_RR","reward":{"experience":3,"healing":1,"unlock":0,"character":0},"tiles":[[{"t":"portuguese1","h":2},{"t":"portuguese8","h":1},{"t":"portuguese3","h":1},{"t":"portuguese8","h":1},{"t":"portuguese3","h":1}],[{"t":"portuguese5","h":0},{"t":"portuguese3","h":1},{"t":"portuguese5","h":0},{"t":"portuguese1","h":2},{"t":"portuguese8","h":1}],[{"t":"portuguese7","h":0},{"t":"portuguese7","h":0},{"t":"portuguese7","h":0},{"t":"portuguese2","h":0},{"t":"portuguese7","h":0}],[{"t":"portuguese8","h":1},{"t":"portuguese5","h":0},{"t":"portuguese4","h":0},{"t":"portuguese1","h":2},{"t":"portuguese8","h":1}],[{"t":"portuguese1","h":2},{"t":"portuguese2","h":0},{"t":"portuguese4","h":0},{"t":"portuguese8","h":1},{"t":"portuguese3","h":1}]],"units":[{"player":1,"pos":[4,1],"facing":3,"type":"Bull"},{"player":1,"pos":[0,1],"facing":2,"type":"Bull"},{"player":1,"pos":[2,3],"facing":1,"type":"Bull"}]}; roomData[room.id] = room; }
{ let room = {"difficulty":1,"entry":[0,0],"id":"BUILTIN_DEMO_22",random: "GARDEN_RR","reward":{"experience":0,"healing":0,"unlock":3,"character":0},"tiles":[[{"t":"portuguese1","h":2},{"t":"portuguese5","h":0},{"t":"portuguese5","h":0},{"t":"portuguese5","h":0},{"t":"portuguese2","h":0},{"t":"portuguese3","h":1}],[{"t":"portuguese3","h":1},{"t":"portuguese4","h":0},{"t":"portuguese3","h":1},{"t":"portuguese6","h":1},{"t":"portuguese3","h":1},{"t":"portuguese7","h":0}],[{"t":"portuguese7","h":0},{"t":"portuguese7","h":0},{"t":"portuguese4","h":0},{"t":"portuguese5","h":0},{"t":"portuguese1","h":2},{"t":"portuguese2","h":0}],[{"t":"portuguese7","h":0},{"t":"portuguese7","h":0},{"t":"portuguese3","h":1},{"t":"portuguese5","h":0},{"t":"portuguese1","h":2},{"t":"portuguese2","h":0}],[{"t":"portuguese3","h":1},{"t":"portuguese4","h":0},{"t":"portuguese4","h":0},{"t":"portuguese6","h":1},{"t":"portuguese3","h":1},{"t":"portuguese4","h":0}],[{"t":"portuguese1","h":2},{"t":"portuguese5","h":0},{"t":"portuguese5","h":0},{"t":"portuguese5","h":0},{"t":"portuguese2","h":0},{"t":"portuguese3","h":1}]],"units":[{"player":1,"pos":[5,2],"facing":0,"type":"Rat"},{"player":1,"pos":[5,1],"facing":0,"type":"Rat"},{"player":1,"pos":[3,2],"facing":3,"type":"Vulture"},{"player":1,"pos":[1,2],"facing":3,"type":"Statue"},{"player":1,"pos":[4,5],"facing":3,"type":"Bull"},{"player":1,"pos":[1,5],"facing":3,"type":"Bull"}]}; roomData[room.id] = room; }
{ let room = {"entry":[1,3],"id":"DEPARTURE_10","random":"","reward":{"experience":0,"healing":0,"unlock":16,"character":0,"time":0},"tiles":[[{"t":"departure_14","h":2},{"t":"departure_8","h":1},{"t":"departure_9","h":0},{"t":"departure_2","h":0},{"t":"departure_9","h":0}],[{"t":"departure_15","h":2},{"t":"departure_11","h":0},{"t":"departure_2","h":0},{"t":"departure_13","h":2},{"t":"departure_2","h":0}],[{"t":"departure_14","h":2},{"t":"departure_8","h":1},{"t":"departure_9","h":0},{"t":"departure_2","h":0},{"t":"departure_9","h":0}]],"units":[{"player":1,"pos":[1,0],"facing":1,"type":"Archer Statue"},{"player":1,"pos":[1,2],"facing":1,"type":"Vulture"},{"player":1,"pos":[1,4],"facing":3,"type":"Vulture"},{"player":1,"pos":[0,3],"facing":2,"type":"Vulture"},{"player":1,"pos":[2,3],"facing":0,"type":"Vulture"}]}; roomData[room.id] = room; }
{ let room = {"entry":[1,1],"id":"DEPARTURE_11","random":"","reward":{"experience":0,"healing":0,"unlock":14,"character":1,"time":0},"tiles":[[{"t":"departure_10","h":0},{"t":"departure_11","h":0},{"t":"departure_10","h":0},{"t":"departure_9","h":0},{"t":"departure_10","h":0},{"t":"departure_15","h":1}],[{"t":"departure_12","h":0},{"t":"departure_13","h":2},{"t":"departure_15","h":1},{"t":"departure_12","h":0},{"t":"departure_15","h":1},{"t":"departure_13","h":2}],[{"t":"departure_10","h":0},{"t":"departure_11","h":0},{"t":"departure_10","h":0},{"t":"departure_9","h":0},{"t":"departure_10","h":0},{"t":"departure_15","h":1}]],"units":[{"player":1,"pos":[1,3],"facing":3,"type":"Darkness"}]}; roomData[room.id] = room; }
{ let room = {"entry":[1,0],"id":"DEPARTURE_1","random":"DEPARTURE_RR","reward":{"experience":0,"healing":0,"unlock":0,"character":0,"time":4},"tiles":[[{"t":"departure_12","h":0},{"t":"departure_1","h":0},{"t":"departure_10","h":0},{"t":"departure_1","h":0}],[{"t":"departure_2","h":2},{"t":"departure_4","h":1},{"t":"departure_2","h":0},{"t":"departure_4","h":0}],[{"t":"departure_12","h":0},{"t":"departure_1","h":0},{"t":"departure_10","h":0},{"t":"departure_1","h":0}]],"units":[{"player":1,"pos":[1,2],"facing":3,"type":"Jaguar"}]}; roomData[room.id] = room; }
{ let room = {"entry":[2,2],"id":"DEPARTURE_2","random":"DEPARTURE_RR","reward":{"experience":0,"healing":0,"unlock":0,"character":0,"time":4},"tiles":[[{"t":"departure_15","h":1},{"t":"departure_14","h":2},{"t":"departure_12","h":0},{"t":"departure_14","h":2},{"t":"departure_15","h":1}],[{"t":"departure_14","h":2},{"t":"departure_4","h":0},{"t":"departure_11","h":0},{"t":"departure_4","h":0},{"t":"departure_14","h":2}],[{"t":"departure_9","h":0},{"t":"departure_10","h":0},{"t":"departure_16","h":2},{"t":"departure_10","h":0},{"t":"departure_9","h":0}],[{"t":"departure_14","h":2},{"t":"departure_4","h":0},{"t":"departure_11","h":0},{"t":"departure_4","h":0},{"t":"departure_14","h":2}],[{"t":"departure_15","h":1},{"t":"departure_14","h":2},{"t":"departure_12","h":0},{"t":"departure_14","h":2},{"t":"departure_15","h":1}]],"units":[{"player":1,"pos":[1,0],"facing":1,"type":"Vulture"},{"player":1,"pos":[3,4],"facing":3,"type":"Vulture"},{"player":1,"pos":[4,0],"facing":0,"type":"Wolf"},{"player":1,"pos":[0,4],"facing":2,"type":"Opossum"}]}; roomData[room.id] = room; }
{ let room = {"entry":[2,2],"id":"DEPARTURE_3","random":"DEPARTURE_RR","reward":{"experience":1,"healing":0,"unlock":0,"character":0,"time":3},"tiles":[[{"t":"departure_14","h":2},{"t":"departure_8","h":1},{"t":"departure_1","h":0},{"t":"departure_8","h":1},{"t":"departure_14","h":2}],[{"t":"departure_8","h":1},{"t":"departure_2","h":0},{"t":"departure_4","h":0},{"t":"departure_2","h":0},{"t":"departure_8","h":1}],[{"t":"departure_1","h":0},{"t":"departure_4","h":0},{"t":"departure_13","h":2},{"t":"departure_4","h":0},{"t":"departure_1","h":0}],[{"t":"departure_8","h":1},{"t":"departure_2","h":0},{"t":"departure_4","h":0},{"t":"departure_2","h":0},{"t":"departure_8","h":1}],[{"t":"departure_14","h":2},{"t":"departure_8","h":1},{"t":"departure_1","h":0},{"t":"departure_8","h":1},{"t":"departure_14","h":2}]],"units":[{"player":1,"pos":[3,1],"facing":0,"type":"Statue"},{"player":1,"pos":[1,3],"facing":2,"type":"Statue"},{"player":1,"pos":[1,1],"facing":1,"type":"Jaguar"}]}; roomData[room.id] = room; }
{ let room = {"entry":[0,0],"id":"DEPARTURE_4","random":"DEPARTURE_RR","reward":{"experience":2,"healing":0,"unlock":0,"character":0,"time":2},"tiles":[[{"t":"departure_15","h":2},{"t":"departure_12","h":0},{"t":"departure_7","h":1}],[{"t":"departure_12","h":0},{"t":"departure_1","h":0},{"t":"departure_11","h":0}],[{"t":"departure_7","h":1},{"t":"departure_11","h":0},{"t":"departure_1","h":0}]],"units":[{"player":1,"pos":[2,1],"facing":3,"type":"Archer Statue"},{"player":1,"pos":[0,2],"facing":0,"type":"Archer Statue"},{"player":1,"pos":[2,0],"facing":0,"type":"Snake"}]}; roomData[room.id] = room; }
{ let room = {"entry":[2,2],"id":"DEPARTURE_5","random":"DEPARTURE_RR","reward":{"experience":3,"healing":0,"unlock":0,"character":0,"time":1},"tiles":[[{"t":"departure_15","h":2},{"t":"departure_16","h":1},{"t":"departure_9","h":0},{"t":"departure_16","h":1},{"t":"departure_13","h":2}],[{"t":"departure_16","h":1},{"t":"departure_14","h":1},{"t":"departure_10","h":0},{"t":"departure_14","h":1},{"t":"departure_16","h":1}],[{"t":"departure_9","h":0},{"t":"departure_10","h":0},{"t":"departure_15","h":1},{"t":"departure_10","h":0},{"t":"departure_9","h":0}],[{"t":"departure_16","h":1},{"t":"departure_14","h":1},{"t":"departure_10","h":0},{"t":"departure_14","h":1},{"t":"departure_16","h":1}],[{"t":"departure_13","h":2},{"t":"departure_16","h":1},{"t":"departure_9","h":0},{"t":"departure_16","h":1},{"t":"departure_13","h":2}]],"units":[{"player":1,"pos":[1,1],"facing":1,"type":"Jaguar"},{"player":1,"pos":[4,4],"facing":0,"type":"Jaguar"}]}; roomData[room.id] = room; }
{ let room = {"entry":[2,2],"id":"DEPARTURE_6","random":"DEPARTURE_RR","reward":{"experience":4,"healing":0,"unlock":0,"character":0,"time":0},"tiles":[[{"t":"departure_13","h":2},{"t":"departure_16","h":2},{"t":"departure_11","h":0},{"t":"departure_8","h":1},{"t":"departure_13","h":2}],[{"t":"departure_8","h":1},{"t":"departure_8","h":1},{"t":"departure_9","h":0},{"t":"departure_8","h":1},{"t":"departure_16","h":2}],[{"t":"departure_11","h":0},{"t":"departure_9","h":0},{"t":"departure_15","h":1},{"t":"departure_9","h":0},{"t":"departure_11","h":0}],[{"t":"departure_16","h":2},{"t":"departure_8","h":1},{"t":"departure_9","h":0},{"t":"departure_8","h":1},{"t":"departure_8","h":1}],[{"t":"departure_13","h":2},{"t":"departure_8","h":1},{"t":"departure_11","h":0},{"t":"departure_16","h":2},{"t":"departure_13","h":2}]],"units":[{"player":1,"pos":[2,0],"facing":1,"type":"Bull"},{"player":1,"pos":[4,2],"facing":0,"type":"Bull"},{"player":1,"pos":[2,4],"facing":3,"type":"Bull"},{"player":1,"pos":[0,2],"facing":2,"type":"Bull"}]}; roomData[room.id] = room; }
{ let room = {"entry":[1,1],"id":"DEPARTURE_7","random":"DEPARTURE_RR","reward":{"experience":3,"healing":1,"unlock":0,"character":0,"time":0},"tiles":[[{"t":"departure_6","h":1},{"t":"departure_1","h":0},{"t":"departure_6","h":1}],[{"t":"departure_1","h":0},{"t":"departure_11","h":0},{"t":"departure_1","h":0}],[{"t":"departure_6","h":1},{"t":"departure_1","h":0},{"t":"departure_6","h":1}]],"units":[{"player":1,"pos":[2,0],"facing":0,"type":"Spider"},{"player":1,"pos":[0,2],"facing":0,"type":"Spider"}]}; roomData[room.id] = room; }
{ let room = {"entry":[0,0],"id":"DEPARTURE_8","random":"DEPARTURE_RR","reward":{"experience":2,"healing":2,"unlock":0,"character":0,"time":0},"tiles":[[{"t":"departure_13","h":2},{"t":"departure_1","h":0},{"t":"departure_16","h":1},{"t":"departure_1","h":0}],[{"t":"departure_1","h":0},{"t":"departure_11","h":0},{"t":"departure_1","h":0},{"t":"departure_12","h":0}],[{"t":"departure_16","h":1},{"t":"departure_1","h":0},{"t":"departure_16","h":1},{"t":"departure_1","h":0}],[{"t":"departure_1","h":0},{"t":"departure_12","h":0},{"t":"departure_1","h":0},{"t":"departure_9","h":0}]],"units":[{"player":1,"pos":[2,0],"facing":0,"type":"Rat"},{"player":1,"pos":[0,2],"facing":3,"type":"Rat"},{"player":1,"pos":[2,2],"facing":0,"type":"Rat"},{"player":1,"pos":[3,1],"facing":0,"type":"Rat"},{"player":1,"pos":[1,3],"facing":3,"type":"Rat"},{"player":1,"pos":[3,3],"facing":3,"type":"Rat"}]}; roomData[room.id] = room; }
{ let room = {"entry":[1,0],"id":"DEPARTURE_9","random":"DEPARTURE_RR","reward":{"experience":1,"healing":1,"unlock":7,"character":0,"time":0},"tiles":[[{"t":"departure_14","h":2},{"t":"departure_8","h":1},{"t":"departure_9","h":0},{"t":"departure_2","h":0},{"t":"departure_9","h":0}],[{"t":"departure_15","h":2},{"t":"departure_11","h":0},{"t":"departure_2","h":0},{"t":"departure_13","h":2},{"t":"departure_2","h":0}],[{"t":"departure_14","h":2},{"t":"departure_8","h":1},{"t":"departure_9","h":0},{"t":"departure_2","h":0},{"t":"departure_9","h":0}]],"units":[{"player":1,"pos":[2,3],"facing":0,"type":"Vulture"},{"player":1,"pos":[1,2],"facing":1,"type":"Vulture"},{"player":1,"pos":[1,4],"facing":3,"type":"Vulture"},{"player":1,"pos":[0,3],"facing":2,"type":"Vulture"},{"player":1,"pos":[1,3],"facing":0,"type":"Statue"}]}; roomData[room.id] = room; }
{ let room = {"entry":[1,0],"id":"FAMILY_R10","random":"FAMILY_RR","reward":{"experience":0,"healing":0,"unlock":0,"character":1,"time":3},"tiles":[[{"t":"family_8","h":1},{"t":"family_5","h":1},{"t":"family_7","h":1},{"t":"family_7","h":1},{"t":"family_5","h":1},{"t":"family_8","h":1}],[{"t":"family_5","h":1},{"t":"family_1","h":0},{"t":"family_3","h":0},{"t":"family_3","h":0},{"t":"family_4","h":0},{"t":"family_4","h":0}],[{"t":"family_7","h":1},{"t":"family_4","h":0},{"t":"family_2","h":0},{"t":"family_6","h":2},{"t":"family_5","h":1},{"t":"family_1","h":0}],[{"t":"family_7","h":1},{"t":"family_8","h":1},{"t":"family_8","h":1},{"t":"family_6","h":2},{"t":"family_5","h":1},{"t":"family_1","h":0}],[{"t":"family_5","h":1},{"t":"family_3","h":0},{"t":"family_2","h":0},{"t":"family_2","h":0},{"t":"family_3","h":0},{"t":"family_4","h":0}],[{"t":"family_8","h":1},{"t":"family_4","h":0},{"t":"family_7","h":1},{"t":"family_7","h":1},{"t":"family_4","h":0},{"t":"family_8","h":1}]],"units":[{"player":1,"pos":[3,3],"facing":0,"type":"Jaguar"},{"player":1,"pos":[2,5],"facing":3,"type":"Jaguar"},{"player":1,"pos":[4,4],"facing":3,"type":"Bull"},{"player":1,"pos":[1,4],"facing":2,"type":"Bull"},{"player":1,"pos":[5,2],"facing":0,"type":"Bear"}]}; roomData[room.id] = room; }
{ let room = {"entry":[1,1],"id":"FAMILY_R11","random":"FAMILY_RR","reward":{"experience":3,"healing":3,"unlock":0,"character":0,"time":3},"tiles":[[{"t":"family_4","h":0},{"t":"family_1","h":0},{"t":"family_3","h":0},{"t":"family_4","h":0}],[{"t":"family_3","h":0},{"t":"family_6","h":2},{"t":"family_6","h":2},{"t":"family_1","h":0}],[{"t":"family_1","h":0},{"t":"family_6","h":2},{"t":"family_6","h":2},{"t":"family_3","h":0}],[{"t":"family_4","h":0},{"t":"family_3","h":0},{"t":"family_1","h":0},{"t":"family_4","h":0}]],"units":[{"player":1,"pos":[1,0],"facing":1,"type":"Opossum"},{"player":1,"pos":[3,1],"facing":0,"type":"Opossum"},{"player":1,"pos":[2,3],"facing":3,"type":"Opossum"},{"player":1,"pos":[0,2],"facing":2,"type":"Opossum"},{"player":1,"pos":[2,0],"facing":1,"type":"Snake"},{"player":1,"pos":[3,2],"facing":0,"type":"Snake"},{"player":1,"pos":[1,3],"facing":3,"type":"Snake"},{"player":1,"pos":[0,1],"facing":2,"type":"Snake"},{"player":1,"pos":[0,0],"facing":0,"type":"Spider"},{"player":1,"pos":[3,0],"facing":0,"type":"Spider"},{"player":1,"pos":[3,3],"facing":0,"type":"Spider"},{"player":1,"pos":[0,3],"facing":0,"type":"Spider"}]}; roomData[room.id] = room; }
{ let room = {"entry":[0,0],"id":"FAMILY_R12","random":"FAMILY_RR","reward":{"experience":0,"healing":0,"unlock":0,"character":0,"time":9},"tiles":[[{"t":"family_4","h":0},{"t":"family_2","h":0},{"t":"family_8","h":1},{"t":"family_3","h":0},{"t":"family_4","h":0},{"t":"family_5","h":1}],[{"t":"family_2","h":0},{"t":"family_4","h":0},{"t":"family_5","h":1},{"t":"family_1","h":0},{"t":"family_3","h":0},{"t":"family_8","h":1}],[{"t":"family_8","h":1},{"t":"family_5","h":1},{"t":"family_6","h":2},{"t":"family_2","h":0},{"t":"family_1","h":0},{"t":"family_5","h":1}],[{"t":"family_3","h":0},{"t":"family_1","h":0},{"t":"family_2","h":0},{"t":"family_4","h":0},{"t":"family_2","h":0},{"t":"family_8","h":1}],[{"t":"family_4","h":0},{"t":"family_3","h":0},{"t":"family_1","h":0},{"t":"family_2","h":0},{"t":"family_4","h":0},{"t":"family_5","h":1}],[{"t":"family_5","h":1},{"t":"family_8","h":1},{"t":"family_5","h":1},{"t":"family_8","h":1},{"t":"family_5","h":1},{"t":"family_6","h":2}]],"units":[{"player":1,"pos":[3,0],"facing":0,"type":"Spider"},{"player":1,"pos":[2,3],"facing":0,"type":"Spider"},{"player":1,"pos":[4,2],"facing":0,"type":"Spider"},{"player":1,"pos":[5,1],"facing":0,"type":"Spider"},{"player":1,"pos":[1,5],"facing":0,"type":"Spider"},{"player":1,"pos":[0,4],"facing":0,"type":"Spider"},{"player":1,"pos":[3,4],"facing":0,"type":"Spider"},{"player":1,"pos":[5,5],"facing":0,"type":"Spider"}]}; roomData[room.id] = room; }
{ let room = {"entry":[1,1],"id":"FAMILY_R13","random":"FAMILY_RR","reward":{"experience":3,"healing":1,"unlock":1,"character":0,"time":1},"tiles":[[{"t":"family_8","h":1},{"t":"family_3","h":0},{"t":"family_6","h":2},{"t":"family_3","h":0},{"t":"family_8","h":1}],[{"t":"family_3","h":0},{"t":"family_4","h":0},{"t":"family_7","h":1},{"t":"family_4","h":0},{"t":"family_3","h":0}],[{"t":"family_6","h":2},{"t":"family_7","h":1},{"t":"family_4","h":0},{"t":"family_7","h":1},{"t":"family_6","h":2}],[{"t":"family_3","h":0},{"t":"family_4","h":0},{"t":"family_7","h":1},{"t":"family_4","h":0},{"t":"family_3","h":0}],[{"t":"family_8","h":1},{"t":"family_3","h":0},{"t":"family_6","h":2},{"t":"family_3","h":0},{"t":"family_8","h":1}]],"units":[{"player":1,"pos":[2,0],"facing":0,"type":"Snake"},{"player":1,"pos":[4,2],"facing":0,"type":"Snake"},{"player":1,"pos":[2,4],"facing":0,"type":"Snake"},{"player":1,"pos":[0,2],"facing":0,"type":"Snake"},{"player":1,"pos":[3,1],"facing":0,"type":"Jaguar"},{"player":1,"pos":[1,3],"facing":3,"type":"Jaguar"}]}; roomData[room.id] = room; }
{ let room = {"entry":[3,3],"id":"FAMILY_R14","random":"FAMILY_RR","reward":{"experience":3,"healing":4,"unlock":1,"character":0,"time":1},"tiles":[[{"t":"family_6","h":2},{"t":"family_5","h":2},{"t":"family_6","h":2},{"t":"family_5","h":2},{"t":"family_6","h":2}],[{"t":"family_5","h":2},{"t":"family_6","h":2},{"t":"family_5","h":2},{"t":"family_6","h":2},{"t":"family_5","h":2}],[{"t":"family_6","h":2},{"t":"family_5","h":2},{"t":"family_7","h":1},{"t":"family_8","h":1},{"t":"family_7","h":1}],[{"t":"family_5","h":2},{"t":"family_6","h":2},{"t":"family_8","h":1},{"t":"family_3","h":0},{"t":"family_2","h":0}],[{"t":"family_6","h":2},{"t":"family_5","h":2},{"t":"family_7","h":1},{"t":"family_1","h":0},{"t":"family_4","h":0}]],"units":[{"player":1,"pos":[4,1],"facing":0,"type":"Snake"},{"player":1,"pos":[3,1],"facing":0,"type":"Snake"},{"player":1,"pos":[1,3],"facing":0,"type":"Snake"},{"player":1,"pos":[1,4],"facing":0,"type":"Snake"},{"player":1,"pos":[1,0],"facing":2,"type":"Archer Statue"},{"player":1,"pos":[0,1],"facing":1,"type":"Archer Statue"},{"player":1,"pos":[1,1],"facing":1,"type":"Jaguar"}]}; roomData[room.id] = room; }
{ let room = {"entry":[3,3],"id":"FAMILY_R15","random":"FAMILY_RR","reward":{"experience":4,"healing":0,"unlock":4,"character":0,"time":1},"tiles":[[{"t":"family_4","h":0},{"t":"family_8","h":1},{"t":"family_7","h":1},{"t":"family_5","h":2},{"t":"family_6","h":2},{"t":"family_6","h":2}],[{"t":"family_8","h":1},{"t":"family_7","h":1},{"t":"family_6","h":2},{"t":"family_5","h":2},{"t":"family_7","h":1},{"t":"family_8","h":1}],[{"t":"family_7","h":1},{"t":"family_6","h":2},{"t":"family_6","h":2},{"t":"family_7","h":1},{"t":"family_8","h":1},{"t":"family_4","h":0}],[{"t":"family_5","h":2},{"t":"family_5","h":2},{"t":"family_7","h":1},{"t":"family_8","h":1},{"t":"family_2","h":0},{"t":"family_3","h":0}],[{"t":"family_6","h":2},{"t":"family_7","h":1},{"t":"family_8","h":1},{"t":"family_2","h":0},{"t":"family_4","h":0},{"t":"family_1","h":0}],[{"t":"family_6","h":2},{"t":"family_8","h":1},{"t":"family_4","h":0},{"t":"family_3","h":0},{"t":"family_1","h":0},{"t":"family_8","h":1}]],"units":[{"player":1,"pos":[3,1],"facing":0,"type":"Jaguar"},{"player":1,"pos":[1,3],"facing":3,"type":"Jaguar"},{"player":1,"pos":[1,1],"facing":1,"type":"Bull"},{"player":1,"pos":[5,5],"facing":0,"type":"Snake"},{"player":1,"pos":[5,3],"facing":3,"type":"Statue"},{"player":1,"pos":[3,5],"facing":0,"type":"Archer Statue"}]}; roomData[room.id] = room; }
{ let room = {"entry":[1,0],"id":"FAMILY_R16","random":"FAMILY_RR","reward":{"experience":3,"healing":1,"unlock":0,"character":0,"time":0},"tiles":[[{"t":"family_11","h":0},{"t":"family_12","h":0},{"t":"family_15","h":1},{"t":"family_16","h":1}],[{"t":"family_5","h":1},{"t":"family_5","h":1},{"t":"family_9","h":0},{"t":"family_13","h":1}],[{"t":"family_5","h":1},{"t":"family_5","h":1},{"t":"family_9","h":0},{"t":"family_13","h":1}],[{"t":"family_11","h":0},{"t":"family_12","h":0},{"t":"family_15","h":1},{"t":"family_16","h":1}]],"units":[{"player":1,"pos":[0,2],"facing":0,"type":"Snake"},{"player":1,"pos":[1,3],"facing":1,"type":"Snake"},{"player":1,"pos":[2,3],"facing":1,"type":"Snake"},{"player":1,"pos":[3,2],"facing":0,"type":"Snake"},{"player":1,"pos":[0,1],"facing":2,"type":"Vulture"},{"player":1,"pos":[1,2],"facing":3,"type":"Vulture"},{"player":1,"pos":[2,2],"facing":3,"type":"Vulture"},{"player":1,"pos":[3,1],"facing":0,"type":"Vulture"}]}; roomData[room.id] = room; }
{ let room = {"entry":[3,3],"id":"FAMILY_R1","random":"FAMILY_RR","reward":{"experience":5,"healing":0,"unlock":0,"character":0,"time":0},"tiles":[[{"t":"family_5","h":2},{"t":"family_8","h":1},{"t":"family_3","h":0},{"t":"family_1","h":0},{"t":"family_2","h":0},{"t":"family_6","h":1},{"t":"family_7","h":2},{"t":"family_5","h":2}],[{"t":"family_8","h":1},{"t":"family_4","h":0},{"t":"family_3","h":0},{"t":"family_2","h":0},{"t":"family_1","h":0},{"t":"family_3","h":0},{"t":"family_8","h":1},{"t":"family_7","h":2}],[{"t":"family_3","h":0},{"t":"family_3","h":0},{"t":"family_4","h":0},{"t":"family_6","h":1},{"t":"family_8","h":1},{"t":"family_4","h":0},{"t":"family_3","h":0},{"t":"family_6","h":1}],[{"t":"family_2","h":0},{"t":"family_1","h":0},{"t":"family_6","h":1},{"t":"family_7","h":2},{"t":"family_5","h":2},{"t":"family_8","h":1},{"t":"family_2","h":0},{"t":"family_1","h":0}],[{"t":"family_1","h":0},{"t":"family_2","h":0},{"t":"family_8","h":1},{"t":"family_5","h":2},{"t":"family_7","h":2},{"t":"family_6","h":1},{"t":"family_1","h":0},{"t":"family_2","h":0}],[{"t":"family_6","h":1},{"t":"family_3","h":0},{"t":"family_4","h":0},{"t":"family_8","h":1},{"t":"family_6","h":1},{"t":"family_4","h":0},{"t":"family_3","h":0},{"t":"family_3","h":0}],[{"t":"family_7","h":2},{"t":"family_8","h":1},{"t":"family_3","h":0},{"t":"family_1","h":0},{"t":"family_2","h":0},{"t":"family_3","h":0},{"t":"family_4","h":0},{"t":"family_8","h":1}],[{"t":"family_5","h":2},{"t":"family_7","h":2},{"t":"family_6","h":1},{"t":"family_2","h":0},{"t":"family_1","h":0},{"t":"family_3","h":0},{"t":"family_8","h":1},{"t":"family_5","h":2}]],"units":[{"player":1,"pos":[3,1],"facing":1,"type":"Bull"},{"player":1,"pos":[1,4],"facing":2,"type":"Bull"},{"player":1,"pos":[6,3],"facing":0,"type":"Bull"},{"player":1,"pos":[4,6],"facing":3,"type":"Bull"},{"player":1,"pos":[0,0],"facing":1,"type":"Wolf"},{"player":1,"pos":[7,7],"facing":3,"type":"Wolf"},{"player":1,"pos":[5,2],"facing":0,"type":"Rat"},{"player":1,"pos":[2,5],"facing":2,"type":"Rat"}]}; roomData[room.id] = room; }
{ let room = {"entry":[1,1],"id":"FAMILY_R2","random":"FAMILY_RR","reward":{"experience":2,"healing":2,"unlock":0,"character":0,"time":0},"tiles":[[{"t":"family_5","h":1},{"t":"family_8","h":1},{"t":"family_8","h":1},{"t":"family_5","h":1}],[{"t":"family_6","h":1},{"t":"family_1","h":0},{"t":"family_3","h":0},{"t":"family_6","h":1}],[{"t":"family_6","h":1},{"t":"family_4","h":0},{"t":"family_2","h":0},{"t":"family_6","h":1}],[{"t":"family_5","h":1},{"t":"family_8","h":1},{"t":"family_8","h":1},{"t":"family_5","h":1}]],"units":[{"player":1,"pos":[1,0],"facing":1,"type":"Statue"},{"player":1,"pos":[3,1],"facing":0,"type":"Statue"},{"player":1,"pos":[2,3],"facing":3,"type":"Statue"},{"player":1,"pos":[0,2],"facing":2,"type":"Statue"}]}; roomData[room.id] = room; }
{ let room = {"entry":[2,2],"id":"FAMILY_R3","random":"FAMILY_RR","reward":{"experience":3,"healing":0,"unlock":1,"character":0,"time":0},"tiles":[[{"t":"family_2","h":0},{"t":"family_1","h":0},{"t":"family_7","h":1},{"t":"family_8","h":1},{"t":"family_1","h":0}],[{"t":"family_1","h":0},{"t":"family_4","h":0},{"t":"family_6","h":2},{"t":"family_6","h":2},{"t":"family_2","h":0}],[{"t":"family_7","h":1},{"t":"family_6","h":2},{"t":"family_4","h":0},{"t":"family_3","h":0},{"t":"family_6","h":2}],[{"t":"family_8","h":1},{"t":"family_6","h":2},{"t":"family_3","h":0},{"t":"family_4","h":0},{"t":"family_8","h":1}],[{"t":"family_1","h":0},{"t":"family_2","h":0},{"t":"family_6","h":2},{"t":"family_8","h":1},{"t":"family_7","h":1}]],"units":[{"player":1,"pos":[4,0],"facing":0,"type":"Vulture"},{"player":1,"pos":[0,4],"facing":3,"type":"Vulture"},{"player":1,"pos":[1,0],"facing":2,"type":"Vulture"},{"player":1,"pos":[0,1],"facing":1,"type":"Vulture"},{"player":1,"pos":[4,2],"facing":0,"type":"Spider"},{"player":1,"pos":[2,4],"facing":0,"type":"Spider"}]}; roomData[room.id] = room; }
{ let room = {"entry":[6,3],"id":"FAMILY_R4","random":"FAMILY_RR","reward":{"experience":6,"healing":0,"unlock":0,"character":0,"time":3},"tiles":[[{"t":"family_7","h":0},{"t":"family_4","h":0},{"t":"family_7","h":0},{"t":"family_4","h":0},{"t":"family_7","h":0},{"t":"family_4","h":0},{"t":"family_7","h":0},{"t":"family_4","h":0}],[{"t":"family_4","h":0},{"t":"family_7","h":0},{"t":"family_4","h":0},{"t":"family_7","h":0},{"t":"family_4","h":0},{"t":"family_7","h":0},{"t":"family_4","h":0},{"t":"family_7","h":0}],[{"t":"family_7","h":0},{"t":"family_4","h":0},{"t":"family_7","h":0},{"t":"family_4","h":0},{"t":"family_7","h":0},{"t":"family_4","h":0},{"t":"family_7","h":0},{"t":"family_4","h":0}],[{"t":"family_4","h":0},{"t":"family_7","h":0},{"t":"family_4","h":0},{"t":"family_7","h":0},{"t":"family_4","h":0},{"t":"family_7","h":0},{"t":"family_4","h":0},{"t":"family_7","h":0}],[{"t":"family_7","h":0},{"t":"family_4","h":0},{"t":"family_7","h":0},{"t":"family_4","h":0},{"t":"family_7","h":0},{"t":"family_4","h":0},{"t":"family_7","h":0},{"t":"family_4","h":0}],[{"t":"family_4","h":0},{"t":"family_7","h":0},{"t":"family_4","h":0},{"t":"family_7","h":0},{"t":"family_4","h":0},{"t":"family_7","h":0},{"t":"family_4","h":0},{"t":"family_7","h":0}],[{"t":"family_7","h":0},{"t":"family_4","h":0},{"t":"family_7","h":0},{"t":"family_4","h":0},{"t":"family_7","h":0},{"t":"family_4","h":0},{"t":"family_7","h":0},{"t":"family_4","h":0}],[{"t":"family_4","h":0},{"t":"family_7","h":0},{"t":"family_4","h":0},{"t":"family_7","h":0},{"t":"family_4","h":0},{"t":"family_7","h":0},{"t":"family_4","h":0},{"t":"family_7","h":0}]],"units":[{"player":1,"pos":[1,0],"facing":2,"type":"Rat"},{"player":1,"pos":[1,1],"facing":2,"type":"Rat"},{"player":1,"pos":[1,2],"facing":2,"type":"Rat"},{"player":1,"pos":[1,3],"facing":2,"type":"Rat"},{"player":1,"pos":[1,4],"facing":2,"type":"Rat"},{"player":1,"pos":[1,5],"facing":2,"type":"Rat"},{"player":1,"pos":[1,6],"facing":2,"type":"Rat"},{"player":1,"pos":[1,7],"facing":2,"type":"Rat"},{"player":1,"pos":[0,1],"facing":0,"type":"Spider"},{"player":1,"pos":[0,6],"facing":0,"type":"Spider"},{"player":1,"pos":[0,2],"facing":2,"type":"Wolf"},{"player":1,"pos":[0,5],"facing":2,"type":"Wolf"},{"player":1,"pos":[0,0],"facing":2,"type":"Bull"},{"player":1,"pos":[0,7],"facing":2,"type":"Bull"},{"player":1,"pos":[0,4],"facing":2,"type":"Bear"},{"player":1,"pos":[0,3],"facing":2,"type":"Archer Statue"}]}; roomData[room.id] = room; }
{ let room = {"entry":[6,3],"id":"FAMILY_R5","random":"FAMILY_RR","reward":{"experience":6,"healing":0,"unlock":0,"character":0,"time":3},"tiles":[[{"t":"family_7","h":0},{"t":"family_4","h":0},{"t":"family_7","h":0},{"t":"family_4","h":0},{"t":"family_7","h":0},{"t":"family_4","h":0},{"t":"family_7","h":0},{"t":"family_4","h":0}],[{"t":"family_4","h":0},{"t":"family_7","h":0},{"t":"family_4","h":0},{"t":"family_7","h":0},{"t":"family_4","h":0},{"t":"family_7","h":0},{"t":"family_4","h":0},{"t":"family_7","h":0}],[{"t":"family_7","h":0},{"t":"family_4","h":0},{"t":"family_7","h":0},{"t":"family_4","h":0},{"t":"family_7","h":0},{"t":"family_4","h":0},{"t":"family_7","h":0},{"t":"family_4","h":0}],[{"t":"family_4","h":0},{"t":"family_7","h":0},{"t":"family_4","h":0},{"t":"family_7","h":0},{"t":"family_4","h":0},{"t":"family_7","h":0},{"t":"family_4","h":0},{"t":"family_7","h":0}],[{"t":"family_7","h":0},{"t":"family_4","h":0},{"t":"family_7","h":0},{"t":"family_4","h":0},{"t":"family_7","h":0},{"t":"family_4","h":0},{"t":"family_7","h":0},{"t":"family_4","h":0}],[{"t":"family_4","h":0},{"t":"family_7","h":0},{"t":"family_4","h":0},{"t":"family_7","h":0},{"t":"family_4","h":0},{"t":"family_7","h":0},{"t":"family_4","h":0},{"t":"family_7","h":0}],[{"t":"family_7","h":0},{"t":"family_4","h":0},{"t":"family_7","h":0},{"t":"family_4","h":0},{"t":"family_7","h":0},{"t":"family_4","h":0},{"t":"family_7","h":0},{"t":"family_4","h":0}],[{"t":"family_4","h":0},{"t":"family_7","h":0},{"t":"family_4","h":0},{"t":"family_7","h":0},{"t":"family_4","h":0},{"t":"family_7","h":0},{"t":"family_4","h":0},{"t":"family_7","h":0}]],"units":[{"player":1,"pos":[2,0],"facing":2,"type":"Opossum"},{"player":1,"pos":[1,1],"facing":2,"type":"Opossum"},{"player":1,"pos":[2,2],"facing":2,"type":"Opossum"},{"player":1,"pos":[1,3],"facing":2,"type":"Opossum"},{"player":1,"pos":[2,4],"facing":2,"type":"Opossum"},{"player":1,"pos":[1,5],"facing":2,"type":"Opossum"},{"player":1,"pos":[2,6],"facing":2,"type":"Opossum"},{"player":1,"pos":[1,7],"facing":2,"type":"Opossum"},{"player":1,"pos":[0,0],"facing":2,"type":"Opossum"},{"player":1,"pos":[0,2],"facing":2,"type":"Opossum"},{"player":1,"pos":[0,4],"facing":2,"type":"Opossum"},{"player":1,"pos":[0,6],"facing":2,"type":"Opossum"}]}; roomData[room.id] = room; }
{ let room = {"entry":[2,2],"id":"FAMILY_R6","random":"FAMILY_RR","reward":{"experience":2,"healing":2,"unlock":5,"character":0,"time":0},"tiles":[[{"t":"family_8","h":1},{"t":"family_3","h":0},{"t":"family_2","h":0},{"t":"family_2","h":0},{"t":"family_3","h":0},{"t":"family_7","h":2}],[{"t":"family_3","h":0},{"t":"family_6","h":2},{"t":"family_5","h":1},{"t":"family_5","h":1},{"t":"family_8","h":1},{"t":"family_3","h":0}],[{"t":"family_2","h":0},{"t":"family_8","h":1},{"t":"family_6","h":2},{"t":"family_7","h":2},{"t":"family_8","h":1},{"t":"family_2","h":0}],[{"t":"family_2","h":0},{"t":"family_8","h":1},{"t":"family_7","h":2},{"t":"family_6","h":2},{"t":"family_8","h":1},{"t":"family_2","h":0}],[{"t":"family_3","h":0},{"t":"family_8","h":1},{"t":"family_5","h":1},{"t":"family_5","h":1},{"t":"family_6","h":2},{"t":"family_3","h":0}],[{"t":"family_7","h":2},{"t":"family_3","h":0},{"t":"family_2","h":0},{"t":"family_2","h":0},{"t":"family_3","h":0},{"t":"family_8","h":1}]],"units":[{"player":1,"pos":[1,0],"facing":2,"type":"Wolf"},{"player":1,"pos":[0,1],"facing":1,"type":"Wolf"},{"player":1,"pos":[5,4],"facing":3,"type":"Wolf"},{"player":1,"pos":[4,5],"facing":0,"type":"Wolf"},{"player":1,"pos":[5,0],"facing":0,"type":"Spider"},{"player":1,"pos":[0,5],"facing":0,"type":"Spider"}]}; roomData[room.id] = room; }
{ let room = {"entry":[0,0],"id":"FAMILY_R7","random":"FAMILY_RR","reward":{"experience":0,"healing":0,"unlock":0,"character":1,"time":0},"tiles":[[{"t":"family_6","h":2},{"t":"family_8","h":1},{"t":"family_2","h":0},{"t":"family_3","h":0},{"t":"family_1","h":0}],[{"t":"family_5","h":2},{"t":"family_7","h":1},{"t":"family_4","h":0},{"t":"family_2","h":0},{"t":"family_4","h":0}],[{"t":"family_6","h":2},{"t":"family_8","h":1},{"t":"family_1","h":0},{"t":"family_3","h":0},{"t":"family_2","h":0}]],"units":[{"player":1,"pos":[2,3],"facing":3,"type":"Bear"},{"player":1,"pos":[0,3],"facing":3,"type":"Bear"},{"player":1,"pos":[1,4],"facing":2,"type":"Archer Statue"},{"player":1,"pos":[1,3],"facing":0,"type":"Archer Statue"}]}; roomData[room.id] = room; }
{ let room = {"entry":[1,1],"id":"FAMILY_R8","random":"FAMILY_RR","reward":{"experience":2,"healing":2,"unlock":2,"character":0,"time":3},"tiles":[[{"t":"family_5","h":2},{"t":"family_1","h":0},{"t":"family_2","h":0},{"t":"family_5","h":2}],[{"t":"family_2","h":0},{"t":"family_3","h":0},{"t":"family_4","h":0},{"t":"family_1","h":0}],[{"t":"family_1","h":0},{"t":"family_4","h":0},{"t":"family_3","h":0},{"t":"family_2","h":0}],[{"t":"family_5","h":2},{"t":"family_2","h":0},{"t":"family_1","h":0},{"t":"family_5","h":2}]],"units":[{"player":1,"pos":[1,3],"facing":0,"type":"Statue"},{"player":1,"pos":[2,0],"facing":2,"type":"Statue"},{"player":1,"pos":[0,1],"facing":3,"type":"Statue"},{"player":1,"pos":[3,2],"facing":1,"type":"Statue"},{"player":1,"pos":[1,0],"facing":0,"type":"Archer Statue"},{"player":1,"pos":[3,1],"facing":3,"type":"Archer Statue"},{"player":1,"pos":[2,3],"facing":2,"type":"Archer Statue"},{"player":1,"pos":[0,2],"facing":1,"type":"Archer Statue"}]}; roomData[room.id] = room; }
{ let room = {"entry":[0,0],"id":"FAMILY_R9","random":"FAMILY_RR","reward":{"experience":1,"healing":1,"unlock":1,"character":0,"time":1},"tiles":[[{"t":"family_7","h":2},{"t":"family_5","h":1},{"t":"family_4","h":0},{"t":"family_6","h":1},{"t":"family_7","h":2}],[{"t":"family_5","h":1},{"t":"family_3","h":0},{"t":"family_8","h":1},{"t":"family_3","h":0},{"t":"family_6","h":1}],[{"t":"family_4","h":0},{"t":"family_8","h":1},{"t":"family_2","h":0},{"t":"family_8","h":1},{"t":"family_4","h":0}],[{"t":"family_6","h":1},{"t":"family_3","h":0},{"t":"family_8","h":1},{"t":"family_3","h":0},{"t":"family_5","h":1}],[{"t":"family_7","h":2},{"t":"family_6","h":1},{"t":"family_4","h":0},{"t":"family_5","h":1},{"t":"family_7","h":2}]],"units":[{"player":1,"pos":[3,1],"facing":0,"type":"Jaguar"},{"player":1,"pos":[1,3],"facing":3,"type":"Jaguar"},{"player":1,"pos":[2,0],"facing":0,"type":"Vulture"},{"player":1,"pos":[0,2],"facing":3,"type":"Vulture"}]}; roomData[room.id] = room; }
{ let room = {"difficulty":1,"entry":[0,0],"id":"FOREST_00","random": "","reward":{"experience":1,"healing":0,"unlock":0,"character":0},"tiles":[[{"t":"forest_5","h":2},{"t":"forest_8","h":1},{"t":"forest_6","h":1},{"t":"forest_7","h":1},{"t":"forest_8","h":1},{"t":"forest_6","h":1},{"t":"forest_6","h":1}],[{"t":"forest_6","h":1},{"t":"forest_7","h":1},{"t":"forest_2","h":0},{"t":"forest_4","h":0},{"t":"forest_2","h":0},{"t":"forest_3","h":0},{"t":"forest_8","h":1}],[{"t":"forest_5","h":2},{"t":"forest_6","h":1},{"t":"forest_1","h":0},{"t":"forest_4","h":0},{"t":"forest_1","h":0},{"t":"forest_5","h":2},{"t":"forest_7","h":1}]],"units":[{"player":1,"pos":[1,2],"facing":3,"type":"Rat"},{"player":1,"pos":[2,5],"facing":3,"type":"Wolf"}]}; roomData[room.id] = room; }
{ let room = {"difficulty":3,"entry":[0,0],"id":"FOREST_01","random": "","reward":{"experience":2,"healing":1,"unlock":0,"character":0},"tiles":[[{"t":"forest_5","h":2},{"t":"forest_5","h":2},{"t":"forest_8","h":1},{"t":"forest_8","h":1},{"t":"forest_8","h":1}],[{"t":"forest_5","h":2},{"t":"forest_4","h":0},{"t":"forest_1","h":0},{"t":"forest_1","h":0},{"t":"forest_4","h":0}],[{"t":"forest_8","h":1},{"t":"forest_1","h":0},{"t":"forest_2","h":0},{"t":"forest_3","h":0},{"t":"forest_1","h":0}],[{"t":"forest_8","h":1},{"t":"forest_1","h":0},{"t":"forest_3","h":0},{"t":"forest_2","h":0},{"t":"forest_1","h":0}],[{"t":"forest_8","h":1},{"t":"forest_4","h":0},{"t":"forest_1","h":0},{"t":"forest_1","h":0},{"t":"forest_4","h":0}]],"units":[{"player":1,"pos":[3,2],"facing":3,"type":"Wolf"},{"player":1,"pos":[1,3],"facing":0,"type":"Wolf"},{"player":1,"pos":[2,3],"facing":3,"type":"Snake"}]}; roomData[room.id] = room; }
{ let room = {"difficulty":1,"entry":[0,0],"id":"FOREST_03","random":"","reward":{"experience":0,"healing":2,"unlock":0,"character":0},"tiles":[[{"t":"forest_8","h":1},{"t":"forest_7","h":1},{"t":"forest_6","h":2},{"t":"forest_7","h":1}],[{"t":"forest_7","h":1},{"t":"forest_2","h":0},{"t":"forest_1","h":0},{"t":"forest_6","h":2}],[{"t":"forest_6","h":2},{"t":"forest_1","h":0},{"t":"forest_4","h":0},{"t":"forest_7","h":1}],[{"t":"forest_4","h":0},{"t":"forest_3","h":0},{"t":"forest_4","h":0},{"t":"forest_3","h":0}]],"units":[{"player":1,"pos":[2,0],"facing":0,"type":"Statue"},{"player":1,"pos":[0,2],"facing":3,"type":"Vulture"}]}; roomData[room.id] = room; }
{ let room = {"entry":[1,0],"id":"FOREST_14","random":"","reward":{"experience":0,"healing":2,"unlock":0,"character":0},"tiles":[[{"t":"forest_3","h":0},{"t":"forest_1","h":0},{"t":"forest_6","h":2},{"t":"forest_8","h":1},{"t":"forest_2","h":0}],[{"t":"forest_4","h":0},{"t":"forest_3","h":0},{"t":"forest_6","h":2},{"t":"forest_8","h":1},{"t":"forest_2","h":0}],[{"t":"forest_1","h":0},{"t":"forest_1","h":0},{"t":"forest_2","h":0},{"t":"forest_4","h":0},{"t":"forest_4","h":0}]],"units":[{"player":1,"pos":[1,3],"facing":3,"type":"Vulture"},{"player":1,"pos":[1,4],"facing":3,"type":"Vulture"},{"player":1,"pos":[0,3],"facing":3,"type":"Vulture"},{"player":1,"pos":[0,4],"facing":3,"type":"Vulture"}]}; roomData[room.id] = room; }
{ let room = {"entry":[2,0],"id":"FOREST_31","random":"","reward":{"experience":4,"healing":0,"unlock":0,"character":0},"tiles":[[{"t":"forest_3","h":0},{"t":"forest_1","h":0},{"t":"forest_8","h":1},{"t":"forest_8","h":1},{"t":"forest_1","h":0},{"t":"forest_3","h":0}],[{"t":"forest_6","h":2},{"t":"forest_7","h":2},{"t":"forest_8","h":1},{"t":"forest_5","h":1},{"t":"forest_1","h":0},{"t":"forest_1","h":0}],[{"t":"forest_3","h":0},{"t":"forest_8","h":1},{"t":"forest_1","h":0},{"t":"forest_3","h":0},{"t":"forest_6","h":2},{"t":"forest_8","h":1}],[{"t":"forest_1","h":0},{"t":"forest_8","h":1},{"t":"forest_3","h":0},{"t":"forest_1","h":0},{"t":"forest_8","h":1},{"t":"forest_5","h":1}],[{"t":"forest_6","h":2},{"t":"forest_7","h":2},{"t":"forest_5","h":1},{"t":"forest_8","h":1},{"t":"forest_1","h":0},{"t":"forest_8","h":1}],[{"t":"forest_3","h":0},{"t":"forest_1","h":0},{"t":"forest_8","h":1},{"t":"forest_1","h":0},{"t":"forest_1","h":0},{"t":"forest_3","h":0}]],"units":[{"player":1,"pos":[5,0],"facing":0,"type":"Wolf"},{"player":1,"pos":[5,5],"facing":3,"type":"Wolf"},{"player":1,"pos":[0,5],"facing":3,"type":"Wolf"},{"player":1,"pos":[0,0],"facing":2,"type":"Wolf"},{"player":1,"pos":[2,3],"facing":3,"type":"Bull"}]}; roomData[room.id] = room; }
{ let room = {"entry":[0,0],"id":"FOREST_34","random":"","reward":{"experience":0,"healing":4,"unlock":0,"character":0},"tiles":[[{"t":"forest_3","h":0},{"t":"forest_1","h":0},{"t":"forest_3","h":0},{"t":"forest_8","h":1}],[{"t":"forest_2","h":0},{"t":"forest_5","h":1},{"t":"forest_2","h":0},{"t":"forest_1","h":0}],[{"t":"forest_6","h":2},{"t":"forest_7","h":1},{"t":"forest_6","h":2},{"t":"forest_7","h":1}],[{"t":"forest_2","h":0},{"t":"forest_5","h":1},{"t":"forest_2","h":0},{"t":"forest_1","h":0}],[{"t":"forest_3","h":0},{"t":"forest_1","h":0},{"t":"forest_3","h":0},{"t":"forest_8","h":1}]],"units":[{"player":1,"pos":[2,1],"facing":0,"type":"Vulture"},{"player":1,"pos":[4,1],"facing":0,"type":"Bull"},{"player":1,"pos":[0,3],"facing":2,"type":"Bull"},{"player":1,"pos":[0,2],"facing":3,"type":"Rat"}]}; roomData[room.id] = room; }
{ let room = {"entry":[1,0],"id":"FOREST_43","random":"","reward":{"experience":1,"healing":1,"unlock":0,"character":1},"tiles":[[{"t":"forest_6","h":2},{"t":"forest_4","h":0},{"t":"forest_3","h":0},{"t":"forest_1","h":0}],[{"t":"forest_5","h":1},{"t":"forest_8","h":1},{"t":"forest_2","h":0},{"t":"forest_5","h":1}],[{"t":"forest_6","h":2},{"t":"forest_3","h":0},{"t":"forest_4","h":0},{"t":"forest_7","h":1}],[{"t":"forest_5","h":1},{"t":"forest_8","h":1},{"t":"forest_1","h":0},{"t":"forest_2","h":0}]],"units":[{"player":1,"pos":[1,3],"facing":2,"type":"Wolf"},{"player":1,"pos":[3,3],"facing":0,"type":"Wolf"},{"player":1,"pos":[2,3],"facing":2,"type":"Bull"},{"player":1,"pos":[0,3],"facing":2,"type":"Bull"},{"player":1,"pos":[0,2],"facing":0,"type":"Snake"}]}; roomData[room.id] = room; }
{ let room = {"entry":[1,0],"id":"FOREST_44","random":"","reward":{"experience":0,"healing":0,"unlock":3,"character":0},"tiles":[[{"t":"forest_1","h":0},{"t":"forest_1","h":0},{"t":"forest_5","h":1},{"t":"forest_6","h":2},{"t":"forest_5","h":1}],[{"t":"forest_8","h":1},{"t":"forest_1","h":0},{"t":"forest_2","h":0},{"t":"forest_8","h":1},{"t":"forest_4","h":0}],[{"t":"forest_6","h":2},{"t":"forest_2","h":0},{"t":"forest_4","h":0},{"t":"forest_3","h":0},{"t":"forest_1","h":0}],[{"t":"forest_5","h":1},{"t":"forest_1","h":0},{"t":"forest_3","h":0},{"t":"forest_8","h":1},{"t":"forest_6","h":2}],[{"t":"forest_4","h":0},{"t":"forest_4","h":0},{"t":"forest_1","h":0},{"t":"forest_5","h":1},{"t":"forest_8","h":1}]],"units":[{"player":1,"pos":[4,2],"facing":0,"type":"Wolf"},{"player":1,"pos":[2,4],"facing":3,"type":"Wolf"},{"player":1,"pos":[2,2],"facing":1,"type":"Wolf"},{"player":1,"pos":[0,0],"facing":0,"type":"Snake"},{"player":1,"pos":[3,2],"facing":2,"type":"Bull"},{"player":1,"pos":[2,3],"facing":1,"type":"Bull"}]}; roomData[room.id] = room; }
{ let room = {"entry":[0,0],"id":"FOREST_R10","random":"FOREST_RR","reward":{"experience":2,"healing":0,"unlock":2,"character":0,"time":2},"tiles":[[{"t":"forest_6","h":2},{"t":"forest_8","h":1},{"t":"forest_1","h":0},{"t":"forest_3","h":0},{"t":"forest_6","h":2},{"t":"forest_7","h":1}],[{"t":"forest_7","h":1},{"t":"forest_3","h":0},{"t":"forest_2","h":0},{"t":"forest_4","h":0},{"t":"forest_1","h":0},{"t":"forest_5","h":1}],[{"t":"forest_6","h":2},{"t":"forest_4","h":0},{"t":"forest_7","h":1},{"t":"forest_7","h":1},{"t":"forest_1","h":0},{"t":"forest_8","h":1}],[{"t":"forest_5","h":1},{"t":"forest_1","h":0},{"t":"forest_7","h":1},{"t":"forest_3","h":0},{"t":"forest_2","h":0},{"t":"forest_3","h":0}],[{"t":"forest_3","h":0},{"t":"forest_2","h":0},{"t":"forest_1","h":0},{"t":"forest_4","h":0},{"t":"forest_1","h":0},{"t":"forest_4","h":0}],[{"t":"forest_4","h":0},{"t":"forest_8","h":1},{"t":"forest_6","h":2},{"t":"forest_5","h":1},{"t":"forest_3","h":0},{"t":"forest_8","h":1}]],"units":[{"player":1,"pos":[5,0],"facing":0,"type":"Bull"},{"player":1,"pos":[4,5],"facing":3,"type":"Bull"},{"player":1,"pos":[1,4],"facing":2,"type":"Bull"},{"player":1,"pos":[3,3],"facing":0,"type":"Wolf"},{"player":1,"pos":[2,2],"facing":2,"type":"Statue"}]}; roomData[room.id] = room; }
{ let room = {"entry":[0,0],"id":"FOREST_R11","random":"FOREST_RR","reward":{"experience":1,"healing":0,"unlock":0,"character":0,"time":3},"tiles":[[{"t":"forest_6","h":2},{"t":"forest_5","h":1},{"t":"forest_1","h":0},{"t":"forest_5","h":1}],[{"t":"forest_5","h":1},{"t":"forest_4","h":0},{"t":"forest_2","h":0},{"t":"forest_1","h":0}],[{"t":"forest_1","h":0},{"t":"forest_2","h":0},{"t":"forest_5","h":1},{"t":"forest_2","h":0}],[{"t":"forest_5","h":1},{"t":"forest_1","h":0},{"t":"forest_2","h":0},{"t":"forest_4","h":0}]],"units":[{"player":1,"pos":[3,2],"facing":0,"type":"Rat"},{"player":1,"pos":[2,3],"facing":0,"type":"Rat"},{"player":1,"pos":[2,2],"facing":0,"type":"Statue"},{"player":1,"pos":[3,3],"facing":0,"type":"Wolf"}]}; roomData[room.id] = room; }
{ let room = {"entry":[0,0],"id":"FOREST_R12","random":"FOREST_RR","reward":{"experience":1,"healing":1,"unlock":1,"character":0,"time":0},"tiles":[[{"t":"forest_6","h":2},{"t":"forest_7","h":1},{"t":"forest_1","h":0}],[{"t":"forest_7","h":1},{"t":"forest_7","h":1},{"t":"forest_3","h":0}],[{"t":"forest_1","h":0},{"t":"forest_3","h":0},{"t":"forest_1","h":0}]],"units":[{"player":1,"pos":[2,0],"facing":0,"type":"Snake"},{"player":1,"pos":[2,1],"facing":0,"type":"Snake"},{"player":1,"pos":[2,2],"facing":0,"type":"Snake"},{"player":1,"pos":[1,2],"facing":0,"type":"Snake"},{"player":1,"pos":[0,2],"facing":0,"type":"Snake"}]}; roomData[room.id] = room; }
{ let room = {"entry":[0,0],"id":"FOREST_R13","random":"FOREST_RR","reward":{"experience":1,"healing":0,"unlock":1,"character":0,"time":0},"tiles":[[{"t":"forest_3","h":0},{"t":"forest_1","h":0},{"t":"forest_6","h":2},{"t":"forest_3","h":0}],[{"t":"forest_1","h":0},{"t":"forest_7","h":1},{"t":"forest_5","h":1},{"t":"forest_1","h":0}],[{"t":"forest_6","h":2},{"t":"forest_5","h":1},{"t":"forest_3","h":0},{"t":"forest_4","h":0}],[{"t":"forest_3","h":0},{"t":"forest_1","h":0},{"t":"forest_6","h":2},{"t":"forest_5","h":1}]],"units":[{"player":1,"pos":[1,3],"facing":2,"type":"Vulture"},{"player":1,"pos":[3,1],"facing":1,"type":"Vulture"},{"player":1,"pos":[2,3],"facing":0,"type":"Vulture"}]}; roomData[room.id] = room; }
{ let room = {"entry":[0,0],"id":"FOREST_R14","random":"FOREST_RR","reward":{"experience":4,"healing":0,"unlock":0,"character":0,"time":0},"tiles":[[{"t":"forest_1","h":0},{"t":"forest_5","h":0},{"t":"forest_1","h":0},{"t":"forest_5","h":0},{"t":"forest_4","h":0}],[{"t":"forest_5","h":0},{"t":"forest_1","h":0},{"t":"forest_5","h":0},{"t":"forest_1","h":0},{"t":"forest_5","h":0}],[{"t":"forest_1","h":0},{"t":"forest_5","h":0},{"t":"forest_1","h":0},{"t":"forest_5","h":0},{"t":"forest_1","h":0}],[{"t":"forest_5","h":0},{"t":"forest_1","h":0},{"t":"forest_5","h":0},{"t":"forest_4","h":0},{"t":"forest_5","h":0}],[{"t":"forest_1","h":0},{"t":"forest_5","h":0},{"t":"forest_1","h":0},{"t":"forest_5","h":0},{"t":"forest_1","h":0}]],"units":[{"player":1,"pos":[4,1],"facing":0,"type":"Archer Statue"},{"player":1,"pos":[2,0],"facing":1,"type":"Archer Statue"},{"player":1,"pos":[3,3],"facing":0,"type":"Archer Statue"},{"player":1,"pos":[1,2],"facing":3,"type":"Archer Statue"},{"player":1,"pos":[0,4],"facing":3,"type":"Archer Statue"}]}; roomData[room.id] = room; }
{ let room = {"entry":[0,0],"id":"FOREST_R15","random":"FOREST_RR","reward":{"experience":1,"healing":0,"unlock":1,"character":0,"time":0},"tiles":[[{"t":"forest_8","h":1},{"t":"forest_6","h":2},{"t":"forest_1","h":0}],[{"t":"forest_6","h":2},{"t":"forest_1","h":0},{"t":"forest_2","h":0}],[{"t":"forest_2","h":0},{"t":"forest_4","h":0},{"t":"forest_3","h":0}],[{"t":"forest_1","h":0},{"t":"forest_6","h":2},{"t":"forest_2","h":0}]],"units":[{"player":1,"pos":[3,1],"facing":0,"type":"Archer Statue"},{"player":1,"pos":[2,0],"facing":0,"type":"Vulture"}]}; roomData[room.id] = room; }
{ let room = {"entry":[2,0],"id":"FOREST_R16","random":"FOREST_RR","reward":{"experience":3,"healing":0,"unlock":0,"character":0,"time":0},"tiles":[[{"t":"forest_8","h":1},{"t":"forest_1","h":0},{"t":"forest_2","h":0},{"t":"forest_6","h":2},{"t":"forest_3","h":0},{"t":"forest_1","h":0}],[{"t":"forest_7","h":1},{"t":"forest_5","h":1},{"t":"forest_4","h":0},{"t":"forest_1","h":0},{"t":"forest_6","h":2},{"t":"forest_4","h":0}],[{"t":"forest_6","h":2},{"t":"forest_6","h":2},{"t":"forest_8","h":1},{"t":"forest_1","h":0},{"t":"forest_3","h":0},{"t":"forest_1","h":0}],[{"t":"forest_6","h":2},{"t":"forest_5","h":1},{"t":"forest_2","h":0},{"t":"forest_6","h":2},{"t":"forest_1","h":0},{"t":"forest_6","h":2}],[{"t":"forest_8","h":1},{"t":"forest_1","h":0},{"t":"forest_6","h":2},{"t":"forest_3","h":0},{"t":"forest_1","h":0},{"t":"forest_1","h":0}],[{"t":"forest_1","h":0},{"t":"forest_2","h":0},{"t":"forest_4","h":0},{"t":"forest_1","h":0},{"t":"forest_6","h":2},{"t":"forest_3","h":0}]],"units":[{"player":1,"pos":[3,5],"facing":0,"type":"Archer Statue"},{"player":1,"pos":[5,4],"facing":2,"type":"Archer Statue"},{"player":1,"pos":[3,3],"facing":0,"type":"Statue"},{"player":1,"pos":[3,4],"facing":3,"type":"Wolf"},{"player":1,"pos":[1,4],"facing":3,"type":"Vulture"}]}; roomData[room.id] = room; }
{ let room = {"entry":[0,0],"id":"FOREST_R17","random":"FOREST_RR","reward":{"experience":1,"healing":0,"unlock":2,"character":0,"time":0},"tiles":[[{"t":"forest_1","h":0},{"t":"forest_7","h":1},{"t":"forest_8","h":1},{"t":"forest_1","h":0}],[{"t":"forest_6","h":1},{"t":"forest_4","h":0},{"t":"forest_3","h":0},{"t":"forest_5","h":1}],[{"t":"forest_5","h":1},{"t":"forest_3","h":0},{"t":"forest_4","h":0},{"t":"forest_6","h":1}],[{"t":"forest_1","h":0},{"t":"forest_8","h":1},{"t":"forest_7","h":1},{"t":"forest_1","h":0}]],"units":[{"player":1,"pos":[3,1],"facing":3,"type":"Archer Statue"},{"player":1,"pos":[1,3],"facing":0,"type":"Archer Statue"},{"player":1,"pos":[2,2],"facing":0,"type":"Snake"},{"player":1,"pos":[1,2],"facing":3,"type":"Rat"},{"player":1,"pos":[2,1],"facing":0,"type":"Rat"}]}; roomData[room.id] = room; }
{ let room = {"entry":[1,0],"id":"FOREST_R18","random":"FOREST_RR","reward":{"experience":2,"healing":1,"unlock":0,"character":0,"time":0},"tiles":[[{"t":"forest_8","h":1},{"t":"forest_6","h":2},{"t":"forest_4","h":0},{"t":"forest_3","h":0},{"t":"forest_2","h":0},{"t":"forest_1","h":0},{"t":"forest_8","h":1},{"t":"forest_6","h":2}],[{"t":"forest_2","h":0},{"t":"forest_1","h":0},{"t":"forest_8","h":1},{"t":"forest_6","h":2},{"t":"forest_1","h":0},{"t":"forest_8","h":1},{"t":"forest_5","h":1},{"t":"forest_6","h":2}],[{"t":"forest_1","h":0},{"t":"forest_8","h":1},{"t":"forest_6","h":2},{"t":"forest_3","h":0},{"t":"forest_2","h":0},{"t":"forest_1","h":0},{"t":"forest_8","h":1},{"t":"forest_6","h":2}],[{"t":"forest_3","h":0},{"t":"forest_2","h":0},{"t":"forest_1","h":0},{"t":"forest_8","h":1},{"t":"forest_6","h":2},{"t":"forest_1","h":0},{"t":"forest_5","h":1},{"t":"forest_6","h":2}]],"units":[{"player":1,"pos":[3,7],"facing":1,"type":"Bull"},{"player":1,"pos":[2,7],"facing":1,"type":"Bull"},{"player":1,"pos":[1,7],"facing":1,"type":"Bull"},{"player":1,"pos":[0,7],"facing":1,"type":"Bull"}]}; roomData[room.id] = room; }
{ let room = {"entry":[1,0],"id":"FOREST_R19","random":"FOREST_RR","reward":{"experience":3,"healing":0,"unlock":0,"character":0,"time":0},"tiles":[[{"t":"forest_2","h":0},{"t":"forest_1","h":0},{"t":"forest_1","h":0},{"t":"forest_2","h":0}],[{"t":"forest_3","h":0},{"t":"forest_8","h":1},{"t":"forest_6","h":2},{"t":"forest_4","h":0}],[{"t":"forest_4","h":0},{"t":"forest_6","h":2},{"t":"forest_8","h":1},{"t":"forest_3","h":0}],[{"t":"forest_2","h":0},{"t":"forest_1","h":0},{"t":"forest_1","h":0},{"t":"forest_2","h":0}]],"units":[{"player":1,"pos":[3,1],"facing":0,"type":"Vulture"},{"player":1,"pos":[0,2],"facing":3,"type":"Vulture"},{"player":1,"pos":[1,3],"facing":3,"type":"Wolf"},{"player":1,"pos":[3,2],"facing":0,"type":"Wolf"},{"player":1,"pos":[0,0],"facing":0,"type":"Snake"}]}; roomData[room.id] = room; }
{ let room = {"entry":[1,0],"id":"FOREST_R1","random":"FOREST_RR","reward":{"experience":1,"healing":1,"unlock":0,"character":0},"tiles":[[{"t":"forest_1","h":0},{"t":"forest_2","h":0},{"t":"forest_4","h":0},{"t":"forest_2","h":0},{"t":"forest_1","h":0}],[{"t":"forest_2","h":0},{"t":"portuguese4","h":1},{"t":"portuguese6","h":1},{"t":"portuguese4","h":1},{"t":"forest_2","h":0}],[{"t":"forest_4","h":0},{"t":"portuguese3","h":1},{"t":"portuguese7","h":2},{"t":"portuguese8","h":1},{"t":"forest_4","h":0}],[{"t":"forest_2","h":0},{"t":"portuguese4","h":1},{"t":"portuguese1","h":1},{"t":"portuguese4","h":1},{"t":"forest_2","h":0}],[{"t":"forest_1","h":0},{"t":"forest_2","h":0},{"t":"forest_4","h":0},{"t":"forest_2","h":0},{"t":"forest_1","h":0}]],"units":[{"player":1,"pos":[3,3],"facing":0,"type":"Wolf"},{"player":1,"pos":[2,2],"facing":3,"type":"Statue"}]}; roomData[room.id] = room; }
{ let room = {"entry":[0,0],"id":"FOREST_R20","random":"FOREST_RR","reward":{"experience":1,"healing":0,"unlock":2,"character":0,"time":0},"tiles":[[{"t":"forest_7","h":1},{"t":"forest_5","h":1},{"t":"forest_7","h":1}],[{"t":"forest_3","h":0},{"t":"forest_8","h":1},{"t":"forest_3","h":0}],[{"t":"forest_8","h":1},{"t":"forest_6","h":2},{"t":"forest_8","h":1}],[{"t":"forest_4","h":0},{"t":"forest_8","h":1},{"t":"forest_4","h":0}],[{"t":"forest_1","h":0},{"t":"forest_2","h":0},{"t":"forest_1","h":0}]],"units":[{"player":1,"pos":[4,0],"facing":0,"type":"Archer Statue"},{"player":1,"pos":[3,1],"facing":0,"type":"Statue"},{"player":1,"pos":[4,2],"facing":0,"type":"Archer Statue"}]}; roomData[room.id] = room; }
{ let room = {"entry":[2,0],"id":"FOREST_R21","random":"FOREST_RR","reward":{"experience":3,"healing":0,"unlock":1,"character":0,"time":2},"tiles":[[{"t":"forest_6","h":2},{"t":"forest_5","h":2},{"t":"forest_6","h":2},{"t":"forest_5","h":2},{"t":"forest_6","h":2}],[{"t":"forest_8","h":1},{"t":"forest_7","h":1},{"t":"forest_8","h":1},{"t":"forest_7","h":1},{"t":"forest_5","h":2}],[{"t":"forest_1","h":0},{"t":"forest_1","h":0},{"t":"forest_1","h":0},{"t":"forest_8","h":1},{"t":"forest_6","h":2}],[{"t":"forest_8","h":1},{"t":"forest_7","h":1},{"t":"forest_8","h":1},{"t":"forest_7","h":1},{"t":"forest_5","h":2}],[{"t":"forest_6","h":2},{"t":"forest_5","h":2},{"t":"forest_6","h":2},{"t":"forest_5","h":2},{"t":"forest_6","h":2}]],"units":[{"player":1,"pos":[2,3],"facing":3,"type":"Bull"},{"player":1,"pos":[4,2],"facing":0,"type":"Snake"},{"player":1,"pos":[0,2],"facing":0,"type":"Snake"},{"player":1,"pos":[1,0],"facing":0,"type":"Snake"},{"player":1,"pos":[4,0],"facing":0,"type":"Vulture"}]}; roomData[room.id] = room; }
{ let room = {"entry":[0,0],"id":"FOREST_R22","random":"FOREST_RR","reward":{"experience":2,"healing":0,"unlock":2,"character":0,"time":0},"tiles":[[{"t":"forest_14","h":2},{"t":"forest_15","h":2},{"t":"forest_13","h":1},{"t":"forest_4","h":0}],[{"t":"forest_15","h":2},{"t":"forest_16","h":2},{"t":"forest_6","h":1},{"t":"forest_12","h":0}],[{"t":"forest_13","h":1},{"t":"forest_6","h":1},{"t":"forest_5","h":1},{"t":"forest_11","h":0}],[{"t":"forest_4","h":0},{"t":"forest_12","h":0},{"t":"forest_11","h":0},{"t":"forest_9","h":0}]],"units":[{"player":1,"pos":[3,0],"facing":0,"type":"Vulture"},{"player":1,"pos":[2,1],"facing":0,"type":"Vulture"},{"player":1,"pos":[0,2],"facing":3,"type":"Vulture"},{"player":1,"pos":[1,2],"facing":3,"type":"Vulture"},{"player":1,"pos":[3,2],"facing":0,"type":"Bull"}]}; roomData[room.id] = room; }
{ let room = {"entry":[0,0],"id":"FOREST_R23","random":"FOREST_RR","reward":{"experience":1,"healing":2,"unlock":0,"character":0,"time":0},"tiles":[[{"t":"forest_3","h":0},{"t":"forest_15","h":1},{"t":"forest_3","h":0},{"t":"forest_15","h":1}],[{"t":"forest_3","h":0},{"t":"forest_15","h":1},{"t":"forest_3","h":0},{"t":"forest_15","h":1}],[{"t":"forest_3","h":0},{"t":"forest_15","h":1},{"t":"forest_3","h":0},{"t":"forest_15","h":1}],[{"t":"forest_3","h":0},{"t":"forest_15","h":1},{"t":"forest_3","h":0},{"t":"forest_15","h":1}]],"units":[{"player":1,"pos":[3,1],"facing":3,"type":"Archer Statue"},{"player":1,"pos":[1,3],"facing":0,"type":"Archer Statue"},{"player":1,"pos":[2,0],"facing":0,"type":"Vulture"},{"player":1,"pos":[0,2],"facing":0,"type":"Vulture"},{"player":1,"pos":[2,2],"facing":0,"type":"Vulture"}]}; roomData[room.id] = room; }
{ let room = {"entry":[0,0],"id":"FOREST_R2","random":"FOREST_RR","reward":{"experience":0,"healing":0,"unlock":1,"character":0},"tiles":[[{"t":"forest_7","h":1},{"t":"forest_8","h":1},{"t":"forest_2","h":0},{"t":"forest_4","h":0}],[{"t":"forest_6","h":2},{"t":"forest_2","h":0},{"t":"forest_3","h":0},{"t":"forest_1","h":0}],[{"t":"forest_5","h":2},{"t":"forest_4","h":0},{"t":"forest_3","h":0},{"t":"forest_1","h":0}]],"units":[{"player":1,"pos":[2,2],"facing":0,"type":"Snake"},{"player":1,"pos":[1,2],"facing":0,"type":"Snake"}]}; roomData[room.id] = room; }
{ let room = {"entry":[1,0],"id":"FOREST_R3","random":"FOREST_RR","reward":{"experience":1,"healing":0,"unlock":1,"character":0},"tiles":[[{"t":"forest_8","h":1},{"t":"forest_2","h":0},{"t":"forest_6","h":2},{"t":"forest_7","h":1},{"t":"forest_1","h":0}],[{"t":"forest_7","h":1},{"t":"forest_1","h":0},{"t":"forest_1","h":0},{"t":"forest_5","h":1},{"t":"forest_3","h":0}],[{"t":"forest_5","h":1},{"t":"forest_3","h":0},{"t":"forest_4","h":0},{"t":"forest_8","h":1},{"t":"forest_7","h":1}],[{"t":"forest_7","h":1},{"t":"forest_8","h":1},{"t":"forest_1","h":0},{"t":"forest_2","h":0},{"t":"forest_1","h":0}]],"units":[{"player":1,"pos":[2,3],"facing":3,"type":"Statue"},{"player":1,"pos":[1,3],"facing":3,"type":"Statue"},{"player":1,"pos":[0,4],"facing":0,"type":"Vulture"},{"player":1,"pos":[1,2],"facing":0,"type":"Snake"}]}; roomData[room.id] = room; }
{ let room = {"entry":[1,0],"id":"FOREST_R4","random":"FOREST_RR","reward":{"experience":0,"healing":0,"unlock":0,"character":0,"time":5},"tiles":[[{"t":"forest_1","h":0},{"t":"forest_3","h":0},{"t":"forest_2","h":0}],[{"t":"forest_5","h":1},{"t":"forest_6","h":1},{"t":"forest_1","h":0}],[{"t":"forest_6","h":1},{"t":"forest_5","h":1},{"t":"forest_4","h":0}],[{"t":"forest_4","h":0},{"t":"forest_1","h":0},{"t":"forest_3","h":0}]],"units":[{"player":1,"pos":[3,0],"facing":0,"type":"Snake"},{"player":1,"pos":[0,0],"facing":0,"type":"Snake"},{"player":1,"pos":[3,1],"facing":0,"type":"Snake"},{"player":1,"pos":[0,1],"facing":0,"type":"Snake"}]}; roomData[room.id] = room; }
{ let room = {"entry":[0,0],"id":"FOREST_R5","random":"FOREST_RR","reward":{"experience":1,"healing":0,"unlock":1,"character":0,"time":1},"tiles":[[{"t":"forest_7","h":1},{"t":"forest_8","h":1},{"t":"forest_3","h":0},{"t":"forest_6","h":2},{"t":"forest_7","h":1}],[{"t":"forest_8","h":1},{"t":"forest_4","h":0},{"t":"forest_6","h":2},{"t":"forest_4","h":0},{"t":"forest_6","h":2}],[{"t":"forest_3","h":0},{"t":"forest_2","h":0},{"t":"forest_3","h":0},{"t":"forest_2","h":0},{"t":"forest_4","h":0}],[{"t":"portuguese6","h":1},{"t":"portuguese1","h":1},{"t":"forest_2","h":0},{"t":"forest_3","h":0},{"t":"forest_1","h":0}],[{"t":"portuguese1","h":1},{"t":"portuguese6","h":1},{"t":"forest_8","h":1},{"t":"forest_1","h":0},{"t":"forest_1","h":0}]],"units":[{"player":1,"pos":[4,4],"facing":0,"type":"Rat"},{"player":1,"pos":[3,4],"facing":3,"type":"Rat"},{"player":1,"pos":[3,2],"facing":0,"type":"Snake"},{"player":1,"pos":[2,3],"facing":0,"type":"Snake"},{"player":1,"pos":[1,2],"facing":2,"type":"Vulture"},{"player":1,"pos":[3,1],"facing":0,"type":"Statue"}]}; roomData[room.id] = room; }
{ let room = {"entry":[0,0],"id":"FOREST_R6","random":"FOREST_RR","reward":{"experience":0,"healing":0,"unlock":3,"character":0,"time":0},"tiles":[[{"t":"forest_6","h":2},{"t":"forest_4","h":0},{"t":"forest_8","h":1},{"t":"forest_7","h":1}],[{"t":"forest_4","h":0},{"t":"forest_1","h":0},{"t":"forest_1","h":0},{"t":"forest_5","h":1}],[{"t":"forest_8","h":1},{"t":"forest_1","h":0},{"t":"forest_1","h":0},{"t":"forest_2","h":0}],[{"t":"forest_7","h":1},{"t":"forest_5","h":1},{"t":"forest_2","h":0},{"t":"forest_6","h":2}]],"units":[{"player":1,"pos":[2,1],"facing":0,"type":"Snake"},{"player":1,"pos":[3,1],"facing":3,"type":"Statue"},{"player":1,"pos":[1,3],"facing":0,"type":"Statue"}]}; roomData[room.id] = room; }
{ let room = {"entry":[0,0],"id":"FOREST_R7","random":"FOREST_RR","reward":{"experience":2,"healing":0,"unlock":0,"character":0,"time":0},"tiles":[[{"t":"forest_5","h":1},{"t":"forest_4","h":0},{"t":"forest_6","h":2},{"t":"forest_1","h":0},{"t":"forest_4","h":0}],[{"t":"forest_7","h":1},{"t":"forest_3","h":0},{"t":"forest_6","h":2},{"t":"forest_8","h":1},{"t":"forest_3","h":0}],[{"t":"forest_5","h":1},{"t":"forest_4","h":0},{"t":"forest_6","h":2},{"t":"forest_1","h":0},{"t":"forest_4","h":0}],[{"t":"forest_7","h":1},{"t":"forest_3","h":0},{"t":"forest_8","h":1},{"t":"forest_2","h":0},{"t":"forest_3","h":0}]],"units":[{"player":1,"pos":[3,3],"facing":3,"type":"Wolf"},{"player":1,"pos":[2,3],"facing":0,"type":"Wolf"},{"player":1,"pos":[1,3],"facing":3,"type":"Vulture"}]}; roomData[room.id] = room; }
{ let room = {"entry":[0,0],"id":"FOREST_R8","random":"FOREST_RR","reward":{"experience":2,"healing":0,"unlock":0,"character":0,"time":0},"tiles":[[{"t":"forest_6","h":2},{"t":"forest_5","h":2},{"t":"forest_7","h":2},{"t":"forest_8","h":2},{"t":"forest_6","h":2}],[{"t":"forest_8","h":2},{"t":"forest_4","h":1},{"t":"forest_2","h":1},{"t":"forest_1","h":1},{"t":"forest_5","h":2}],[{"t":"forest_7","h":2},{"t":"forest_3","h":1},{"t":"forest_1","h":0},{"t":"forest_3","h":1},{"t":"forest_7","h":2}],[{"t":"forest_5","h":2},{"t":"forest_1","h":1},{"t":"forest_2","h":1},{"t":"forest_4","h":1},{"t":"forest_8","h":2}],[{"t":"forest_6","h":2},{"t":"forest_8","h":2},{"t":"forest_7","h":2},{"t":"forest_5","h":2},{"t":"forest_6","h":2}]],"units":[{"player":1,"pos":[2,2],"facing":0,"type":"Vulture"},{"player":1,"pos":[4,2],"facing":0,"type":"Bull"},{"player":1,"pos":[2,4],"facing":3,"type":"Bull"}]}; roomData[room.id] = room; }
{ let room = {"entry":[0,0],"id":"FOREST_R9","random":"FOREST_RR","reward":{"experience":0,"healing":2,"unlock":0,"character":0,"time":2},"tiles":[[{"t":"forest_7","h":1},{"t":"forest_2","h":0},{"t":"forest_3","h":0}],[{"t":"forest_2","h":0},{"t":"forest_1","h":0},{"t":"forest_1","h":0}],[{"t":"forest_3","h":0},{"t":"forest_2","h":0},{"t":"forest_4","h":0}]],"units":[{"player":1,"pos":[2,0],"facing":1,"type":"Statue"},{"player":1,"pos":[2,1],"facing":1,"type":"Statue"},{"player":1,"pos":[2,2],"facing":1,"type":"Statue"},{"player":1,"pos":[1,2],"facing":0,"type":"Statue"}]}; roomData[room.id] = room; }
{
	let adventure = {
		description: {
			"en": "Two undertook the ceremony...",
		},
		descriptionDefeat: {
			"en": "...but the ceremony was not what they expected.",
		},
		descriptionVictory: {
			"en": "...and through the ceremony, they were made whole.",
		},
		characters: 2,
		entry: [0, 0],
		id: "CEREMONY",
		maxAbilities: 6,
		onVictory: [Adventure.Consequence.CHARACTER_NOABILITY],
		onDefeat: [Adventure.Consequence.ABILITY_LOSS],
		rooms: [
			["CEREMONY_RR", "CEREMONY_RR", "CEREMONY_RR"],
			["CEREMONY_RR", "CEREMONY_RR", "CEREMONY_RR"],
			["CEREMONY_RR", "CEREMONY_RR", roomData.CEREMONY_BOSS]
		],
		title: {
			"en": "The Ceremony",
		},
		timeLimit: 5,
		unlocks: ["FAMILY"],
		victory: [[2, 2]],
	};
	adventureData[adventure.id] = adventure;
}
{
	let adventure = {
		description: {
			"en": "Challenges created by other players can be overcome...",
		},
		descriptionDefeat: {
			"en": "...but sometimes they cannot be overcome.",
		},
		descriptionVictory: {
			"en": "...and community challenges often yield rewards.",
		},
		characters: 2,
		entry: [0, 0],
		id: "COMMUNITY",
		maxAbilities: 7,
		onVictory: [Adventure.Consequence.ABILITY],
		onDefeat: [],
		random: false,
		rooms: [
			["COMMUNITY_ANY", "COMMUNITY_ANY", "COMMUNITY_ANY", "COMMUNITY_ANY"],
			["COMMUNITY_ANY", "COMMUNITY_ANY", "COMMUNITY_ANY", "COMMUNITY_ANY"],
			["COMMUNITY_ANY", "COMMUNITY_ANY", "COMMUNITY_ANY", "COMMUNITY_ANY"],
			["COMMUNITY_ANY", "COMMUNITY_ANY", "COMMUNITY_ANY", "COMMUNITY_ANY"],
		],
		title: {
			"en": "The Community (Bonus)",
		},
		timeLimit: 12,
		unlocks: [],
		victory: [[3, 3]],
	};
	adventureData[adventure.id] = adventure;
}
{
	let adventure = {
		description: {
			"en": "There is a time too, for good-byes...",
		},
		descriptionDefeat: {
			"en": "...and the heartaches that follow.",
		},
		descriptionVictory: {
			"en": "...but the departed are always with us.",
		},
		characters: 1,
		entry: [0, 0],
		id: "DEPARTURE",
		maxAbilities: 8,
		onVictory: [Adventure.Consequence.VICTORY],
		onDefeat: [Adventure.Consequence.ABILITY_LOSS],
		rooms: [
			[roomData.DEPARTURE_1, null, roomData.DEPARTURE_7, roomData.DEPARTURE_8, roomData.DEPARTURE_9],
			[roomData.DEPARTURE_2, null, roomData.DEPARTURE_6, null, roomData.DEPARTURE_10],
			[roomData.DEPARTURE_3, roomData.DEPARTURE_4, roomData.DEPARTURE_5, null, roomData.DEPARTURE_11],
		],
		title: {
			"en": "The Departure",
		},
		timeLimit: 1,
		unlocks: [],
		victory: [[2, 4]],
	};
	adventureData[adventure.id] = adventure;
}
{
	let adventure = {
		description: {
			"en": "Four were a family...",
		},
		descriptionDefeat: {
			"en": "...but the family was broken.",
		},
		descriptionVictory: {
			"en": "...and the family grew.",
		},
		characters: 4,
		entry: [3, 3],
		id: "FAMILY",
		maxAbilities: 7,
		onVictory: [Adventure.Consequence.CHARACTER],
		onDefeat: [Adventure.Consequence.ABILITY_LOSS],
		rooms: [
			["FAMILY_RR", "FAMILY_RR", "CEREMONY_RR", null,        "CEREMONY_RR", "FAMILY_RR", "FAMILY_RR"],
			["FAMILY_RR", "FAMILY_RR", "CEREMONY_RR", "CEREMONY_RR", "CEREMONY_RR", "FAMILY_RR", "FAMILY_RR"],
			["FAMILY_RR", "FAMILY_RR", null,        "CEREMONY_RR", null,        "GARDEN_RR", "GARDEN_RR"],
			[null,        "FAMILY_RR", "FAMILY_RR", "FAMILY_RR", "GARDEN_RR", "GARDEN_RR", null       ],
			["FAMILY_RR", "FAMILY_RR", null,        "FOREST_RR", null,        "GARDEN_RR", "GARDEN_RR"],
			["FAMILY_RR", "FAMILY_RR", "FOREST_RR", "FOREST_RR", "FOREST_RR", "FAMILY_RR", "FAMILY_RR"],
			["FAMILY_RR", "FAMILY_RR", "FOREST_RR", null,        "FOREST_RR", "FAMILY_RR", "FAMILY_RR"]
		],
		title: {
			"en": "The Family",
		},
		timeLimit: 12,
		unlocks: ["DEPARTURE"],
		victory: [[0, 0], [0, 6], [6, 0], [6, 6]],
	};
	adventureData[adventure.id] = adventure;
}
{
	let adventure = {
		description: {
			"en": "Three journeyed into the wild, dark forest...",
		},
		descriptionDefeat: {
			"en": "...but the darkness of the forest overcame them.",
		},
		descriptionVictory: {
			"en": "...and in the forest, they discovered who they are and who they wish to be.",
		},
		characters: 3,
		entry: [0, 0],
		id: "FOREST",
		maxAbilities: 6,
		onVictory: [Adventure.Consequence.ABILITY],
		onDefeat: [],
		random: false,
		rooms: [
			[roomData.FOREST_00, roomData.FOREST_01, "FOREST_RR"       , roomData.FOREST_03, "FOREST_RR"       ],
			[null              , "FOREST_RR"       , "FOREST_RR"       , null              , roomData.FOREST_14],
			["FOREST_RR"       , "FOREST_RR"       , "FOREST_RR"       , null              , "FOREST_RR"       ],
			["FOREST_RR"       , roomData.FOREST_31, null              , null              , roomData.FOREST_34],
			["FOREST_RR"       , "FOREST_RR"       , "FOREST_RR"       , roomData.FOREST_43, roomData.FOREST_44],
		],
		title: {
			"en": "The Forest",
		},
		timeLimit: 30,
		unlocks: ["CEREMONY"],
		victory: [[4, 4]],
	};
	adventureData[adventure.id] = adventure;
}
{
	let adventure = {
		description: {
			"en": "Two started in the garden...",
		},
		descriptionDefeat: {
			"en": "...but the garden terrified them.",
		},
		descriptionVictory: {
			"en": "...and the garden paths showed them the way to greater things.",
		},
		characters: 2,
		entry: [0, 0],
		id: "GARDEN",
		maxAbilities: 5,
		onVictory: [],
		onDefeat: [],
		random: false,
		rooms: [
			[roomData.BUILTIN_DEMO_00, roomData.BUILTIN_DEMO_01, roomData.BUILTIN_DEMO_02],
			[roomData.BUILTIN_DEMO_10, roomData.BUILTIN_DEMO_11, roomData.BUILTIN_DEMO_12],
			[roomData.BUILTIN_DEMO_20, roomData.BUILTIN_DEMO_21, roomData.BUILTIN_DEMO_22]
		],
		title: {
			"en": "The Garden",
		},
		timeLimit: 40,
		unlocks: ["FOREST"],
		victory: [[2, 2]],
	};
	adventureData[adventure.id] = adventure;
}
