let abilityData = {};
let adventureData = {};
let aiData = {};
let characterData = {};
let roomData = {};
let unitData = {};

// Abilities have AiHints to suggest to the AI how to use the ability.
const AiHints = {
	ATTACK: 0,
	MOVE: 1,
}

class Tile {
	// height
	// decoration

	static offset(pos, facing) {
		if (facing == 0) return [pos[0] - 1, pos[1]];
		if (facing == 1) return [pos[0], pos[1] + 1];
		if (facing == 2) return [pos[0] + 1, pos[1]];
		if (facing == 3) return [pos[0], pos[1] - 1];
	}

	// Returns -1 if the positions are not adjacent. Else returns the facing from pos1 to pos2.
	static directionTo(pos1, pos2) {
		if (pos1[0] - 1 == pos2[0] && pos1[1] == pos2[1]) return 0;
		if (pos1[0] == pos2[0] && pos1[1] + 1 == pos2[1]) return 1;
		if (pos1[0] + 1 == pos2[0] && pos1[1] == pos2[1]) return 2;
		if (pos1[0] == pos2[0] && pos1[1] - 1 == pos2[1]) return 3;
		return -1;
	}

	static distanceBetween(pos1, pos2) {
		return Math.abs(pos1[0] - pos2[0]) + Math.abs(pos1[1] - pos2[1]);
	}

	static equals(pos1, pos2) {
		return pos1[0] == pos2[0] && pos1[1] == pos2[1];
	}

	constructor(height, decoration) {
		this.height = height;
		this.decoration = decoration;
	}
}

class Room {
	// tiles[][]

	constructor(room) {
		this.tiles = [];
		for (let row of room.tiles) {
			let rout = [];
			for (let cell of row) {
				rout.push(new Tile(cell.h, cell.t + ".svg"));
			}
			this.tiles.push(rout);
		}
	}

	getTile(pos) {
		return this.tiles[pos[0]][pos[1]];
	}

	inBounds(pos) {
		return pos[0] >= 0 && pos[1] >= 0 && pos[0] < this.tiles.length && pos[1] < this.tiles[pos[0]].length;
	}
}

class Unit {
	// abilities
	// actionPoints
	// actors
	// facing: 0-3
	// name
	// player
	// portrait
	// pos[2]: rank, file
	// state
	// strengths[4]: 0-5
	// threats[4]: bool
	// strengthsBloodied[4]: 0-5
	// threatsBloodied[4]: bool
	// learnableAbilities

	static State = {
		NORMAL: 1,
		BLOODIED: 2,
		DEFEATED: 3
	}

	constructor(characterOrUnitClass) {
		this.actionPoints = 3;
		this.actors = [];
		this.facing = 0;
		this.player = 0;
		this.pos = [0, 0];
		this.state = Unit.State.NORMAL;
		// Remainder of attributes come from the class.
		Object.assign(this, characterOrUnitClass);
	}

	registerActor(actor) {
		this.actors.push(actor);
	}

	updateActors() {
		for (let a of this.actors) a.update();
	}

	clearActors() {
		this.actors = [];
	}

	select() {
		for (let a of this.actors) a.select();
	}

	deselect() {
		for (let a of this.actors) a.deselect();
	}

	learn(ability) {
		this.abilities.push(ability);
		let index = this.learnableAbilities.indexOf(ability);
		if (index >= 0) this.learnableAbilities.splice(index, 1);
	}

	unlearn(ability) {
		let index = this.abilities.indexOf(ability);
		if (index >= 0) this.abilities.splice(index, 1);
		this.learnableAbilities.push(ability);
	}

	// Returns true if and only if this unit threatens the given unit.
	threatens(unit) {
		if (unit.player == this.player) return false;
		if (this.state == Unit.State.DEFEATED) return false;
		let offset = [unit.pos[0] - this.pos[0], unit.pos[1] - this.pos[1]];
		let facing =
			offset[0] == -1 && offset[1] == 0 ? 0 :
			offset[0] == 0 && offset[1] == 1 ? 1 :
			offset[0] == 1 && offset[1] == 0 ? 2 :
			offset[0] == 0 && offset[1] == -1 ? 3 :
			-1;
		if (facing == -1) return false;
		return this.threats[(4 + facing - this.facing) % 4];
	}

	getStrength(direction) {
		let dir = (4 + direction - this.facing) % 4;
		return this.state == Unit.State.NORMAL ? this.strengths[dir] : this.strengthsBloodied[dir];
	}

	getThreat(direction) {
		let dir = (4 + direction - this.facing) % 4;
		return this.state == Unit.State.NORMAL ? this.threats[dir] : this.threatsBloodied[dir];
	}

	canAct() {
		if (this.state == Unit.State.DEFEATED) return false;
		for (let a of this.abilities) if (a.minActionPoints <= this.actionPoints) return true;
		return false;
	}
}

class CurrentState { // TODO: combine into GameState.
	// fortress // TODO: rename to "room"
	// units
	// currentPlayer

	constructor(room, playerUnits) {
		this.currentPlayer = 0;
		this.fortress = new Room(room);
		this.units = [];
		for (let u of playerUnits) this.units.push(u);
		for (let i = 0; i < playerUnits.length; i++) {
			playerUnits[i].pos[0] = room.entry[0] + i % 2;
			playerUnits[i].pos[1] = room.entry[1] + parseInt(i / 2);
			playerUnits[i].facing = 1;
		}
		for (let u of room.units) {
			let unit = new Unit(u.type);
			unit.player = u.player;
			unit.pos[0] = u.pos[0];
			unit.pos[1] = u.pos[1];
			unit.facing = u.facing;
			this.units.push(unit);
		}
	}

	// Returns the unit in the position, or null if there is no unit in the position.
	getUnitAt(pos) {
		for (let u of this.units) if (u.state != Unit.State.DEFEATED && u.pos[0] == pos[0] && u.pos[1] == pos[1]) return u;
		return null;
	}
}

class Ability {
	// name

}

class GameState {
	// currentState
	// actionHistory
	// characters
	// characterPool
	// adventure
	// adventureProgress
	// currentRoom
	// disableActions
	// resource: {experience: int, healing: int}

	constructor(adventure) {
		this.adventure = adventure;
		this.actionHistory = [];
		this.characters = [];
		this.characterPool = [];
		this.adventureProgress = [];
		this.resources = {};

		for (let cname of adventure.characterPool) {
			this.characterPool.push(new Unit(characterData[cname]));
		}

		for (let i = 0; i < adventure.rooms.length; i++) {
			this.adventureProgress.push([]);
			for (let j = 0; j < adventure.rooms[i].length; j++) {
				this.adventureProgress[i][j] = false;
			}
		}
	}

	turnDone() {
		let effects = [];
		for (let u of this.currentState.units) if (u.player == this.currentState.currentPlayer) effects.push(new Effect(u, "actionPoints", 3));
		this.addAction(new Action(false, effects, "END TURN"));
		this.currentState.currentPlayer = (this.currentState.currentPlayer + 1) % 3;
		this.runAi();
		showHideUiElements();
	}

	runAi() {
		if (this.currentState.currentPlayer == 0) return;
		this.runAiSubtask(this.currentState.units.filter(u => u.player == this.currentState.currentPlayer));
	}

	runAiSubtask(units) {
		if (this.disableActions) return false;
		units = units.filter(u => u.canAct());
		if (units.length == 0) {
			this.turnDone();
			return;
		}
		let aiPattern = units[0].ai;
		function aiEquals(a, b) {
			if (a.length != b.length) return false;
			for (let i = 0; i < a.length; i++) if (a[i] != b[i]) return false;
			return true;
		}
		let unitSelection = units.filter(u => aiEquals(aiPattern, u.ai));
		let patternIndex = 0;
		let action = aiPattern[patternIndex].getNextMove(unitSelection, this.currentState);
		while (action == undefined && patternIndex < aiPattern.length - 1) {
			patternIndex++
			action = aiPattern[patternIndex].getNextMove(unitSelection, this.currentState);
		}
		if (action == undefined) {
			// The first unit has no valid moves. Remove it and try again.
			this.runAiSubtask(units.splice(1));
			return;
		}
		this.addAction(action);
		window.setTimeout(() => this.runAiSubtask(units), 700);
	}

	undoAction() {
		if (this.actionHistory.length == 0) return;
		if (!this.actionHistory[this.actionHistory.length - 1].undoable) return;
		this.actionHistory.pop().undo();
	}

	addAction(action) {
		if (this.disableActions) return;
		this.actionHistory.push(action);
		action.apply();

		// TODO: fire listeners for passive abilities.

		// Check for room clear.
		let numPlayer = 0;
		let numEnemy = 0;
		for (let u of this.currentState.units) {
			if (u.state == Unit.State.DEFEATED) continue;
			if (u.player == 0) numPlayer++;
			if (u.player == 1) numEnemy++;
		}
		if (numEnemy == 0) this.roomVictory();
		else if (numPlayer == 0) this.roomDefeat();
	}

	loadRoom(coords) {
		this.disableActions = false;
		this.currentState = new CurrentState(this.adventure.rooms[coords[0]][coords[1]], this.characters);
		this.currentRoom = coords;
		for (let c of this.characters) c.actionPoints = 3;
	}

	roomVictory() {
		this.disableActions = true;
		this.adventureProgress[this.currentRoom[0]][this.currentRoom[1]] = true;
		let room = this.adventure.rooms[this.currentRoom[0]][this.currentRoom[1]];
		for (let reward in room.reward) {
			if (this.resources.hasOwnProperty(reward)) this.resources[reward] += room.reward[reward];
			else this.resources[reward] = room.reward[reward];
		}
		for (let c of this.characters) c.actionPoints = 0;
		setupVictorySituation();
	}

	roomDefeat() {
		this.disableActions = true;
		setupDefeatSituation();
	}
}

// All game effects are implemented as atomic "actions". An action has a collection of effects, and may be undoable.
class Action {
	// undoable
	// effects[]
	// note
	// specialEffect: a function to call to spawn sfx.

	constructor(undoable, effects, note, specialEffect) {
		this.undoable = undoable;
		this.effects = effects;
		this.note = note;
		this.specialEffect = specialEffect;
	}

	apply() {
		for (let e of this.effects) e.apply();
		if (this.specialEffect != undefined) this.specialEffect();
	}

	undo() {
		for (let e of this.effects) e.undo();
	}
}

class Effect {
	// unit
	// property
	// value
	// oldValue

	constructor(unit, property, value) {
		this.oldValue = unit[property];
		this.value = value;
		this.unit = unit;
		this.property = property;
	}

	apply() {
		this.oldValue = this.unit[this.property];
		this.unit[this.property] = this.value;
		this.unit.updateActors();
	}

	undo() {
		this.unit[this.property] = this.oldValue;
		this.unit.updateActors();
	}
}

// A Fortress is a collection of rooms. Fortresses are square. The player starts in the upper-left and is trying to reach the lower-right.
class Fortress {
	// id
	// rooms
	// random: whether to include the fortress in randomized fortress pools.
}
