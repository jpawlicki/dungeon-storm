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

	static equals(pos1, pos2) {
		return pos1[0] == pos2[0] && pos1[1] == pos2[1];
	}

	constructor(height, decoration) {
		this.height = height;
		this.decoration = decoration;
	}
}

class Fortress {
	// tiles[][]

	constructor(ranks, files) {
		this.tiles = [];
		for (let i = 0; i < ranks; i++) {
			this.tiles.push([]);
			for (let j = 0; j < files; j++) {
				this.tiles[i].push(new Tile(parseInt(Math.random() * 3), "portuguese" + parseInt(1 + Math.random() * 8) + ".svg"));
			}
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
	// card
	// facing: 0-3
	// name
	// player
	// player
	// portrait
	// pos[2]: rank, file
	// state
	// strengths[4]: 0-5
	// threats[4]: bool
	// strengthsBloodied[4]: 0-5
	// threatsBloodied[4]: bool

	static State = {
		NORMAL: 1,
		BLOODIED: 2,
		DEFEATED: 3
	}

	constructor(id) {
		this.abilities = [abilityData.MOVE, abilityData.ATTACK]
		this.actionPoints = 3;
		this.actors = [];
		this.card = undefined;
		this.facing = 0;
		this.id = id;
		this.name = "Example Unit";
		this.player = 0;
		this.portrait = "port.png";
		this.pos = [4, 3];
		this.state = Unit.State.NORMAL;
		this.strengths = [4, 3, 2, 3];
		this.strengthsBloodied = [3, 2, 1, 2];
		this.threats = [true, false, false, false];
	}

	registerActor(actor) {
		this.actors.push(actor);
	}

	updateActors() {
		for (let a of this.actors) a.update();
	}

	select() {
		for (let a of this.actors) a.select();
	}

	deselect() {
		for (let a of this.actors) a.deselect();
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
		return this.threats[(4 + direction - this.facing) % 4];
	}

	canAct() {
		if (this.state == Unit.State.DEFEATED) return false;
		for (let a of this.abilities) if (a.minActionPoints <= this.actionPoints) return true;
		return false;
	}
}

class CurrentState {
	// fortress
	// units
	// currentPlayer

	constructor() {
		this.currentPlayer = 0;
		this.fortress = new Fortress(6, 6);
		this.units = [
			new Unit(0),
			new Unit(1),
		];

		this.units[1].pos = [5, 3];
		this.units[1].portrait = "port2.png";
		this.units[1].player = 2;
	}

	// Returns the unit in the position, or null if there is no unit in the position.
	getUnitAt(pos) {
		for (let u of this.units) if (u.state != Unit.State.DEFEATED && u.pos[0] == pos[0] && u.pos[1] == pos[1]) return u;
		return null;
	}
}

let abilityData = {};
class Ability {
	// name

}

class GameState {
	// currentState
	// actionHistory

	constructor() {
		this.currentState = new CurrentState();
		this.actionHistory = [];
	}

	turnDone() {
		let effects = [];
		for (let u of this.currentState.units) if (u.player == this.currentState.currentPlayer) effects.push(new Effect(u, "actionPoints", 3));
		this.addAction(new Action(false, effects, "END TURN"));
		// TODO
		// this.currentState.currentPlayer = this.currentState.currentPlayer + 1;
	}

	undoAction() {
		if (this.actionHistory.length == 0) return;
		if (!this.actionHistory[this.actionHistory.length - 1].undoable) return;
		this.actionHistory.pop().undo();
	}

	addAction(action) {
		this.actionHistory.push(action);
		action.apply();
	}
}

// All game effects are implemented as atomic "actions". An action has a collection of effects, and may be undoable.
class Action {
	// undoable
	// effects[]
	// note

	constructor(undoable, effects, note) {
		this.undoable = undoable;
		this.effects = effects;
		this.note = note;
	}

	apply() {
		for (let e of this.effects) e.apply();
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
