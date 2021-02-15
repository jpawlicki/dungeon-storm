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
	BUFF: 2,
	BASIC_MOVE: 3,
	PUSHER: 4,
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

	// Returns -1 if the positions are not in the same rank or column. Else returns the facing from pos1 to pos2.
	static directionTo(pos1, pos2) {
		if (pos1[0] > pos2[0] && pos1[1] == pos2[1]) return 0;
		if (pos1[0] == pos2[0] && pos1[1] < pos2[1]) return 1;
		if (pos1[0] < pos2[0] && pos1[1] == pos2[1]) return 2;
		if (pos1[0] == pos2[0] && pos1[1] > pos2[1]) return 3;
		return -1;
	}

	// Returns a list of fuzzy directions from pos1 to pos2:
	//  3  3,0  0
	//    3   0
	// 2,3  .  0,1
	//    2   1
	//  2  2,1  1
	static directionsToLenient(pos1, pos2) {
		let directions = [];
		let offsetX = pos2[0] - pos1[0];
		let offsetY = pos2[1] - pos1[1];
		if (offsetX < 0 && Math.abs(offsetX) >= Math.abs(offsetY)) directions.push(0);
		if (offsetY > 0 && Math.abs(offsetY) >= Math.abs(offsetX)) directions.push(1);
		if (offsetX > 0 && Math.abs(offsetX) >= Math.abs(offsetY)) directions.push(2);
		if (offsetY < 0 && Math.abs(offsetY) >= Math.abs(offsetX)) directions.push(3);
		return directions;
	}

	static distanceBetween(pos1, pos2) {
		return Math.abs(pos1[0] - pos2[0]) + Math.abs(pos1[1] - pos2[1]);
	}

	static equals(pos1, pos2) {
		return pos1[0] == pos2[0] && pos1[1] == pos2[1];
	}

	static inBounds(pos) {
		let tiles = gameState.room.tiles;
		return pos[0] >= 0 && pos[1] >= 0 && pos[0] < tiles.length && pos[1] < tiles[pos[0]].length;
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
		if (Tile.inBounds(pos)) return this.tiles[pos[0]][pos[1]];
		return new Tile(0, null);
	}

	inBounds(pos) {
		return pos[0] >= 0 && pos[1] >= 0 && pos[0] < this.tiles.length && pos[1] < this.tiles[pos[0]].length;
	}
}

class Unit {
	// abilities[]
	// actionPoints
	// actors
	// facing: 0-3
	// id
	// player
	// portrait
	// pos[2]: rank, file
	// state
	// strengths[4]: 0-5
	// threats[4]: bool
	// strengthsFrightened[4]: 0-5
	// threatsFrightened[4]: bool
	// learnableAbilities[]
	// completedAdventure: bool, may be undefined

	// characterOrUnitClass: the template for this unit
	// randomizeAbilities: whether to randomize the unit's abilities from all known abilities.
	constructor(characterOrUnitClass, randomizeAbilities=false) {
		this.actionPoints = 3;
		this.actors = [];
		this.facing = 0;
		this.player = 0;
		this.pos = [0, 0];
		this.state = Unit.State.NORMAL;

		// Remainder of attributes come from the class.
		Object.assign(this, characterOrUnitClass);

		// Copies must be made of non-primitive data that is mutable.
		// TODO: wiser to just list the properties and ditch the Object.assign.
		if (this.abilities != undefined) this.abilities = this.abilities.slice();
		if (this.threats != undefined) this.threats = this.threats.slice();
		if (this.threatsFrightened != undefined) this.threatsFrightened = this.threatsFrightened.slice();
		if (this.strengths != undefined) this.strengths = this.strengths.slice();
		if (this.strengthsFrightened != undefined) this.strengthsFrightened = this.strengthsFrightened.slice();
		if (this.learnableAbilities != undefined) this.learnableAbilities = this.learnableAbilities.slice();

		if (this.portrait == undefined && this.id != undefined && this.portraits != undefined) {
			let options = [];
			let usedSet = new Set();
			for (let c of gameState.characterPool) {
				usedSet.add(c.portrait); 
			}
			for (let i = 0; i < this.portraits; i++) {
				let opt = this.id.toLowerCase() + "/" + i + ".png";
				if (!usedSet.has(opt)) options.push(opt);
			}
			if (options.length > 0) {
				this.portrait = options[Math.floor(Math.random() * options.length)];
			} else {
				this.portrait = this.id.toLowerCase() + "/" + Math.floor(Math.random() * this.portraits) + ".png";
			}
		}

		if (randomizeAbilities) {
			this.abilities = [];
			this.learnableAbilities = [];
			let possibleAbilities = [];
			{
				let possibleAbilitiesSet = new Set();
				for (let c of gameState.unlockedCharacters) {
					for (let a of characterData[c].abilities) possibleAbilitiesSet.add(a.name.toUpperCase());
					for (let a of characterData[c].learnableAbilities) possibleAbilitiesSet.add(a.name.toUpperCase());
				}
				for (let a of possibleAbilitiesSet) possibleAbilities.push(a);
			}
			let moveAbilities = possibleAbilities.filter(a => abilityData[a].aiHints.includes(AiHints.BASIC_MOVE));
			let attackAbilities = possibleAbilities.filter(a => abilityData[a].aiHints.includes(AiHints.PUSHER));
			Util.shuffle(possibleAbilities);
			Util.shuffle(moveAbilities);
			Util.shuffle(attackAbilities);

			let added = new Set();
			let othis = this;
			function addOne(abilityArray, learnable) {
				for (let a of abilityArray) {
					if (added.has(a)) continue;
					added.add(a);
					if (learnable) othis.learnableAbilities.push(abilityData[a]);
					else othis.abilities.push(abilityData[a]);
					break;
				}
			}
			addOne(moveAbilities, false);
			addOne(attackAbilities, false);
			addOne(possibleAbilities, false);
			addOne(possibleAbilities, true);
			addOne(possibleAbilities, true);
			addOne(possibleAbilities, true);
		}
	}

	serialize() {
		return JSON.stringify(this, (key, value) => {
			if (key == "ai") return;
			if (key == "actors") return [];
			if (value instanceof Ability) return value.serialize();
			return value;
		});
	}

	static deserialize(val) {
		let obj = new Unit(JSON.parse(val, (key, value) => {
			if (key == "abilities" || key == "learnableAbilities") return value.map(x => Ability.deserialize(x));
			return value;
		}));
		if (unitData[obj.id]) obj.ai = unitData[obj.id].ai;
		return obj;
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

	// Returns true if and only if this unit threatens the given unit while it's in pos.
	threatens(unit, pos) {
		if (unit.player == this.player) return false;
		if (this.state == Unit.State.DEFEATED) return false;
		if (Tile.distanceBetween(this.pos, pos) != 1) return false;
		let facing = Tile.directionTo(this.pos, pos);
		if (facing == -1) return false;
		let threatGroup = this.state == Unit.State.FRIGHTENED ? this.threatsFrightened : this.threats;
		return threatGroup[(4 + facing - this.facing) % 4];
	}

	getStrength(direction) {
		let dir = (4 + direction - this.facing) % 4;
		return this.state == Unit.State.NORMAL ? this.strengths[dir] : this.strengthsFrightened[dir];
	}

	getThreat(direction) {
		let dir = (4 + direction - this.facing) % 4;
		return this.state == Unit.State.NORMAL ? this.threats[dir] : this.threatsFrightened[dir];
	}

	canAct() {
		if (this.state == Unit.State.DEFEATED) return false;
		for (let a of this.abilities) if (a.minActionPoints <= this.actionPoints) return true;
		return false;
	}

	getRetreatAction(direction) {
		let retreatOption = null;
		let retreatLocationOptions = [];
		{
			let nextTile = Tile.offset(this.pos, direction);
			while (Tile.inBounds(nextTile)) {
				retreatLocationOptions.push(nextTile);
				nextTile = Tile.offset(nextTile, direction);
			}
		}
		outer: for (let a of this.abilities) {
			for (let retreatLocationOption of retreatLocationOptions) {
				for (let quad of [0, 1, 2, 3]) {
					let action = a.clickOnTile(this, retreatLocationOption, (this.facing + quad) % 4);
					if (action != null) {
						let posConsequence = null;
						for (let e of action.effects) if (e.unit == this && e.property == "pos") posConsequence = e.value;
						if (posConsequence != null) {
							for (let option of retreatLocationOptions) {
								if (option[0] == posConsequence[0] && option[1] == posConsequence[1]) {
									retreatOption = action;
									break outer;
								}
							}
						}
					}
				}
			}
		}
		return retreatOption;
	}

	canRetreat(direction) {
		return this.getRetreatAction(direction) != null;
	}

	actionEvent(action) {
		if (this.state == Unit.State.DEFEATED) return [];

		let reactions = [];

		// If evented to retreat, that happens first.
		for (let e of action.events) if (e.type == ActionEvent.RETREAT && e.who == this) {
			let retreatOption = this.getRetreatAction(e.data.direction);
			if (retreatOption != null) {
				reactions.push(retreatOption);
			} else {
				reactions.push(new Action(true, [new Effect(this, "state", Unit.State.DEFEATED)], [ActionEvent.defeat(this)], "Failed Retreat"));
			}
		}
		for (let a of this.abilities) for (let r of a.actionEvent(this, action)) reactions.push(r);
		return reactions;
	}
}
Unit.State = {
	NORMAL: 1,
	FRIGHTENED: 2,
	DEFEATED: 3
}

class Ability {
	// name
	// icon
	// minActionPoints
	// details
	// aiHints
	// cost

	actionEvent(unit, action) { return []; }

	serialize() {
		return this.name.toUpperCase();
	}

	static deserialize(val) {
		return abilityData[val];
	}
}

class RandomRoomProvider {
	// randomRooms{}: A map of sets to shuffles of random rooms.

	constructor() {
		this.randomRooms = {};
		for (let r in roomData) {
			let room = roomData[r];
			if (room.random != undefined) {
				if (this.randomRooms[room.random] == undefined) this.randomRooms[room.random] = [];
				this.randomRooms[room.random].push(roomData[r]);
			}
		}
		for (let k in this.randomRooms) Util.shuffle(this.randomRooms[k]);
	}

	replenish(set) {
		for (let r in roomData) if (roomData[r].random == set) this.randomRooms[set].push(roomData[r]);
		Util.shuffle(this.randomRooms[set]);
	}

	draw(set) {
		if (this.randomRooms[set].length == 0) this.replenish(set);
		return this.randomRooms[set].pop();
	}
}

class Adventure {
	// description{}: lang strings
	// descriptionDefeat{}: lang strings
	// descriptionVictory{}: lang strings
	// characters
	// id
	// maxAbilities
	// rooms[][]: rooms
	// title{}: lang strings
	// timeLimit
	// unlocks[]
	// victory[]

	constructor(spec) {
		this.description = spec.description;
		this.descriptionDefeat = spec.descriptionDefeat;
		this.descriptionVictory = spec.descriptionVictory;
		this.characters = spec.characters;
		this.id = spec.id;
		this.maxAbilities = spec.maxAbilities;
		this.title = spec.title;
		this.timeLimit = spec.timeLimit;
		this.victory = spec.victory;
		this.unlocks = spec.unlocks;
		this.onVictory = spec.onVictory;
		this.onDefeat = spec.onDefeat;
		this.rooms = [];

		let randomRooms = new RandomRoomProvider();

		for (let r of spec.rooms) {
			let row = [];
			for (let cell of r) {
				if (typeof cell === "string") cell = randomRooms.draw(cell);
				row.push(cell);
			}
			this.rooms.push(row);
		}
	}

	serialize() {
		return JSON.stringify(this);
	}

	static deserialize(val) {
		let d = JSON.parse(val);
		if (!d.hasOwnProperty("onVictory")) d.onVictory = [];
		if (!d.hasOwnProperty("onDefeat")) d.onDefeat = [];
		return new Adventure(d);
	}
}
Adventure.Consequence = {
	ABILITY: 1,
  CHARACTER: 2,
	CHARACTER_NOABILITY: 3,
	ABILITY_LOSS: 4,
	VICTORY: 5,
};

class GameState {
	// room
	// units[]
	// currentPlayer
	// actionHistory[]
	// reactionQueue
	// characters
	// characterPool
	// adventure
	// adventureProgress
	// currentRoom
	// disableActions
	// numUnlocksEarned
	// resource: {experience: int, healing: int, unlock: int, character: int}
	// unlockedAdventures[]
	// completedAdventures[]
	// unlockedCharacters[]
	// roomLoads

	serialize() {
		return JSON.stringify(
				this,
				(key, value) => {
					if (key == "actionHistory") return null;
					if (key == "units") return value.filter(x => !this.characters.includes(x)).map(x => x.serialize());
					if (key == "characters" && Array.isArray(value)) return value.map(x => this.characterPool.indexOf(x));
					if (key == "characterPool") return value.map(x => x.serialize(x));
					if (value instanceof Adventure) return value.serialize();
					if (value instanceof Tile) return {"h": value.height, "t": value.decoration.substring(0, value.decoration.length - 4)};
					return value;
				});
	}

	static deserialize(val) {
		let obj = new GameState();
		Object.assign(obj, JSON.parse(val, (key, value) => {
			if (key == "units" || key == "characterPool") return value.map(x => Unit.deserialize(x));
			if (key == "room") return new Room(value);
			if (key == "adventure") return Adventure.deserialize(value);
			return value;
		}));
		obj.actionHistory = [];
		if (obj.characters) {
			obj.characters = obj.characters.map(x => obj.characterPool[x]);
			if (obj.units) for (let c of obj.characters.slice().reverse()) obj.units.splice(0, 0, c);
		}
		return obj;
	}

	constructor() {
		this.characterPool = [];
		this.resources = {};
		this.unlockedAdventures = [];
		this.completedAdventures = [];
		this.unlockedCharacters = [];
		this.numUnlocksEarned = 0;
		this.roomLoads = 0;
	}

	loadAdventure(adventure) {
		this.adventure = new Adventure(adventure);
		this.characters = [];
		this.actionHistory = [];
		this.reactionQueue = [];
		this.adventureProgress = [];
		for (let i = 0; i < adventure.rooms.length; i++) {
			this.adventureProgress.push([]);
			for (let j = 0; j < adventure.rooms[i].length; j++) {
				this.adventureProgress[i][j] = false;
			}
		}
		this.resources.time = adventure.timeLimit;
	}

	turnDone() {
		if (this.disableActions) return;
		let effects = [];
		let events = [];
		if (this.currentPlayer == 0) {
			this.resources.time = Math.max(0, this.resources.time - 1);
		}
		for (let u of this.units) if (u.player == this.currentPlayer) {
			effects.push(new Effect(u, "actionPoints", 3));
			events.push(ActionEvent.endTurn(u));
		}
		for (let u of this.units) if (u.player == (this.currentPlayer + 1) % 3) {
			events.push(ActionEvent.startTurn(u));
		}
		this.addAction(new Action(false, effects, events, "END TURN"), () => {
			this.currentPlayer = (this.currentPlayer + 1) % 3;
			notifyTurn();
			showHideUiElements();
			if (this.currentPlayer == 0) {
				if (this.resources.time <= 0) {
					Telemetry.reportRoomOutcome(false);
					this.roomDefeat();
				} else {
					Persistence.save();
				}
			}
			this.runAi();
		});
	}

	runAi() {
		if (this.currentPlayer == 0) return;
		this.runAiSubtask(this.units.filter(u => u.player == this.currentPlayer));
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
		for (let u of unitSelection) u.select();
		let patternIndex = 0;
		let action = aiPattern[patternIndex].getNextMove(unitSelection, this);
		while (action == undefined && patternIndex < aiPattern.length - 1) {
			patternIndex++
			action = aiPattern[patternIndex].getNextMove(unitSelection, this);
		}
		if (action == undefined) {
			// The first unit has no valid moves. Remove it and try again.
			for (let u of this.units) if (u.player == this.currentPlayer) u.deselect();
			this.runAiSubtask(units.splice(1));
			return;
		}
		this.addAction(action, () => window.setTimeout(() => this.runAiSubtask(units), 700));
	}

	undoAction() {
		if (this.disableActions) return;
		let lastUserActionIndex = this.actionHistory.length - 1;
		while (lastUserActionIndex >= 0 && this.actionHistory[lastUserActionIndex].cause != undefined) lastUserActionIndex--;
		if (lastUserActionIndex < 0 || !this.actionHistory[lastUserActionIndex].undoable) return;
		for (let i = this.actionHistory.length - 1; i >= lastUserActionIndex; i--) this.actionHistory.pop().undo();
	}

	canPlayerUndo() {
		let lastUserActionIndex = this.actionHistory.length - 1;
		while (lastUserActionIndex >= 0 && this.actionHistory[lastUserActionIndex].cause != undefined) lastUserActionIndex--;
		if (lastUserActionIndex < 0 || !this.actionHistory[lastUserActionIndex].undoable) return false;
		return true;
	}

	addAction(action, callback) {
		if (this.disableActions) return;
		this.actionHistory.push(action);
		action.apply();
		
		for (let e of action.events) {
			if (e.type == ActionEvent.RETREAT) Tutorial.hook(Tutorial.Hook.GAME_RETREAT);
			if (e.type == ActionEvent.DEFEAT) Tutorial.hook(Tutorial.Hook.GAME_DEFEAT);
		}

		for (let u of this.units) {
			for (let reaction of u.actionEvent(action)) {
				reaction.cause = action;
				this.reactionQueue.push(reaction);
			}
		}
		if (this.reactionQueue.length > 0) {
			window.setTimeout(() => this.addAction(this.reactionQueue.shift(), callback), 250);
		}	else {
			this.checkRoomClear();
			if (callback != undefined) callback();
		}
	}

	checkRoomClear() {
		// Check for room clear.
		let numPlayer = 0;
		let numEnemy = 0;
		for (let u of this.units) {
			if (u.state == Unit.State.DEFEATED) continue;
			if (u.player == 0) numPlayer++;
			if (u.player == 1) numEnemy++;
		}
		if (numPlayer == 0) {
			this.roomDefeat();
		}	else if (numEnemy == 0) {
			this.roomVictory();
		}
	}

	loadRoom(coords) {
		lockUi();
		this.roomLoads++;
		this.disableActions = false;
		this.currentPlayer = 0;
		let room = this.adventure.rooms[coords[0]][coords[1]];
		this.room = new Room(room);
		this.units = [];
		for (let u of this.characters) this.units.push(u);
		for (let i = 0; i < this.characters.length; i++) {
			this.units[i].pos[0] = room.entry[0] + i % 2;
			this.units[i].pos[1] = room.entry[1] + parseInt(i / 2);
			this.units[i].facing = 1;
		}
		for (let u of room.units) {
			let unit = new Unit(unitData[u.type]);
			unit.player = u.player;
			unit.pos[0] = u.pos[0];
			unit.pos[1] = u.pos[1];
			unit.facing = u.facing;
			this.units.push(unit);
		}
		this.currentRoom = coords;
		for (let c of this.characters) c.actionPoints = 3;
		this.addAction(new Action(false, [], [ActionEvent.loadRoom()], "(Room Load)", () => { unlockUi(); }));
	}

	// Returns the unit in the position, or null if there is no unit in the position.
	getUnitAt(pos) {
		for (let u of this.units) if (u.state != Unit.State.DEFEATED && u.pos[0] == pos[0] && u.pos[1] == pos[1]) return u;
		return null;
	}

	roomVictory() {
		this.disableActions = true;
		Telemetry.reportRoomOutcome(true);
		this.adventureProgress[this.currentRoom[0]][this.currentRoom[1]] = true;
		let room = this.adventure.rooms[this.currentRoom[0]][this.currentRoom[1]];
		for (let reward in room.reward) {
			if (this.resources.hasOwnProperty(reward)) this.resources[reward] += room.reward[reward];
			else this.resources[reward] = room.reward[reward];
		}
		for (let c of this.characters) c.actionPoints = 0;
		this.currentRoom = null;
		if (this.getAdventureVictorious()) {
			this.adventureOver(true);
		} else {
			setupVictorySituation();
		}
	}

	roomDefeat() {
		if (this.currentRoom == null) return;
		Telemetry.reportRoomOutcome(false);
		this.currentRoom = null;
		this.disableActions = true;
		this.adventureOver(false);
	}

	getAdventureVictorious() {
		for (let victoryRoom of this.adventure.victory) if (this.adventureProgress[victoryRoom[0]][victoryRoom[1]]) return true;
		return false;
	}

	adventureOver(victorious) {
		Telemetry.reportAdventureOutcome(victorious);
		for (let c of this.characters) {
			c.state = Unit.State.NORMAL;
		}
		if (victorious) {
			if (!this.completedAdventures.includes(this.adventure.id)) this.completedAdventures.push(this.adventure.id);
			for (let c of this.characters) c.completedAdventure = true;
			setupAdventureVictorySituation();
		} else {
			setupDefeatSituation();
		}
	}
}

// All game effects are implemented as atomic "actions". An action has a collection of effects, and may be undoable.
class Action {
	// undoable
	// effects[]
	// events[]
	// note
	// specialEffect: a function to call to spawn sfx.
	// cause: an action that caused this reaction.

	constructor(undoable, effects, events, note, specialEffect, cause) {
		this.undoable = undoable;
		this.effects = effects;
		this.events = events;
		this.note = note;
		this.specialEffect = specialEffect;
		this.cause = cause;
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

// An AddingEffect is like an Effect, but can be combined additively rather than an absolute setting.
class AddingEffect {
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
		this.unit[this.property] = Math.max(0, this.unit[this.property] + this.value);
		this.unit.updateActors();
	}

	undo() {
		this.unit[this.property] = this.oldValue;
		this.unit.updateActors();
	}
}

class ActionEvent {
	// who: the unit receiving the event
	// type: a numeric value indicating the type of event
	// data: an object, depending on the eventType

	static retreat(who, direction) {
		return new ActionEvent(who, ActionEvent.RETREAT, {"direction": direction});
	}

	static move(who, fromLoc, toLoc) {
		return new ActionEvent(who, ActionEvent.MOVE, {"from": fromLoc, "to": toLoc});
	}

	static defeat(who) {
		return new ActionEvent(who, ActionEvent.DEFEAT, {});
	}

	static endTurn(who) {
		return new ActionEvent(who, ActionEvent.ENDTURN, {});
	}

	static startTurn(who) {
		return new ActionEvent(who, ActionEvent.STARTTURN, {});
	}

	static loadRoom() {
		return new ActionEvent(null, ActionEvent.LOADROOM, {});
	}

	constructor(who, type, data) {
		this.who = who;
		this.type = type;
		this.data = data;
	}
}
ActionEvent.RETREAT = 1;
ActionEvent.MOVE = 2;
ActionEvent.DEFEAT = 3;
ActionEvent.ENDTURN = 4;
ActionEvent.STARTTURN = 5;
ActionEvent.LOADROOM = 6;
