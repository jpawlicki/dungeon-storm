let clickContext = {
	selectedUnit: null,
	selectedAbility: null,
	lastMouseOver: null,
	actors: [],
};

function clearClickContextActors() {
	for (let a of clickContext.actors) a.destroy();
	clickContext.actors = [];
}

function clearClickContext() {
	clearClickContextActors();
	if (clickContext.selectedUnit != null) clickContext.selectedUnit.deselect();
	clickContext.selectedAbility = null;
	clickContext.selectedUnit = null;
}

function clickOnAbility(unit, ability) {
	if (clickContext.selectedUnit == unit && clickContext.selectedAbility == ability) {
		clickContext.selectedUnit = null;
		clickContext.selectedAbility = null;
		document.getElementById("abilityDescTitle").textContent = "";
		document.getElementById("abilityDescText").textContent = "";
		unit.deselect();
		return;
	} else {
		let prev = clickContext.selectedUnit;
		clickContext.selectedUnit = unit;
		clickContext.selectedAbility = ability;
		document.getElementById("abilityDescTitle").textContent = ability.name;
		document.getElementById("abilityDescText").textContent = expandAbilityDetails(ability.details);
		if (prev != null && prev != unit) prev.deselect();
		unit.select();
		if (clickContext.lastMouseOver != null) {
			mouseOverTile(clickContext.lastMouseOver.loc, clickContext.lastMouseOver.quadrant);
		}
		return;
	}
}

// Tile quadrants:
//      /\
//     /30\
//     \21/
//      \/
function clickOnTile(loc, quadrant) {
	if (gameState.currentPlayer != 0) return;
	if (clickContext.selectedUnit != null && clickContext.selectedAbility != null) {
		if (clickContext.selectedUnit.player != 0) return;
		let action = clickContext.selectedAbility.clickOnTile(clickContext.selectedUnit, loc, quadrant);
		if (action != null) {
			clearClickContextActors();
			gameState.addAction(action);
			showHideUiElements();
			Tutorial.hook(Tutorial.Hook.ACTION_TAKEN);
			mouseOverTile(loc, quadrant);
		}
	}
}

function mouseOverTile(loc, quadrant) {
	clickContext.lastMouseOver = {"loc": loc, "quadrant": quadrant};
	if (gameState.currentPlayer != 0) return;
	if (clickContext.selectedUnit != null && clickContext.selectedAbility != null) {
		if (clickContext.selectedUnit.player != 0) return;
		clickContext.selectedAbility.mouseOverTile(clickContext.selectedUnit, loc, quadrant);
	}
}

function mouseOutTile() {
	clickContext.lastMouseOver = null;
	clearClickContextActors();
}

function clickOnUndo() {
	gameState.undoAction();
	showHideUiElements();
}

function clickOnDone() {
	clearClickContext();
	gameState.turnDone();
	showHideUiElements();
}

function showHideUiElements() {
	document.getElementById("undo").style.visibility = gameState.canPlayerUndo() ? "visible" : "hidden";
	if (clickContext.selectedUnit != null && clickContext.selectedAbility != null && clickContext.selectedUnit.actionPoints < clickContext.selectedAbility.minActionPoints) clickOnAbility(clickContext.selectedUnit, clickContext.selectedAbility);
	document.getElementById("done").style.visibility = gameState.currentPlayer == 0 ? "visible" : "hidden";
}

function loadAdventure(adventure) {
	document.querySelector("#mapDiv").innerHTML = "";
	gameState.loadAdventure(adventure);
	document.querySelector("#mapDiv").appendChild(setupAdventureSituation());
}

function loadRoom(coords) {
	gameState.loadRoom(coords);
	for (let c of gameState.characters) c.clearActors();
	document.querySelector("#mapDiv").innerHTML = "";
	document.querySelector("#mapDiv").appendChild(setupRoomSvg(gameState));
	for (let u of document.querySelectorAll("unit-card")) u.parentNode.removeChild(u);
	for (let unit of gameState.units) if (unit.player == 0) unit.registerActor(new UnitCard(unit, true, document.getElementById("unitCards")));
	for (let unit of gameState.units) if (unit.player != 0) unit.registerActor(new UnitCard(unit, false, document.getElementById("unitCardsEnemy")));
	showSidePane();
	showHideUiElements();
	Tutorial.hook(Tutorial.Hook.ROOM_LOAD);
}

function hideSidePane() {
	document.querySelector("body").setAttribute("class", "nosidepane");
}

function showSidePane() {
	document.querySelector("body").setAttribute("class", "");
}

function expandAbilityDetails(descAr) {
	let desc = descAr.join("\n");
	let expansions = {
		"!REACTION": "Reactions are actions that are automatically triggered by certain conditions.",
		"!DEFEAT": "Defeated units are removed from the room. Win by defeating all dangers. Lose by having all your characters defeated.",
		"!MOVE": "Moving threatened units often triggers common reactions.",
		"!THREATEN": "Units with red markers threaten units next to those markers, and have automatic reactions to actions they take.",
		"!RETREAT": "A unit retreats by using the first possible ability to move directly away from the unit causing it to retreat. If it cannot vacate the space, it is !DEFEATed.",
		"!BLOODY": "Bloody units typically have decreased strength on each side.",
	};

	let replaced = true;
	let suffixSet = new Set();
	while (replaced) {
		replaced = false;
		for (let ex in expansions) {
			if (desc.includes(ex)) {
				let exRead = ex.substr(1, 1) + ex.substr(2).toLowerCase();
				replaced = true;
				if (!suffixSet.has(ex)) {
					desc += "\n\n(" + expansions[ex] + ")";
					suffixSet.add(ex);
				}
				desc = desc.replaceAll(ex, exRead);
			}
		}
	}
	return desc;
}

window.addEventListener("keypress", (ev) => {
	if (document.querySelector("body").getAttribute("class") == "nosidepane") return;
	if (ev.key == "Enter" || ev.key == "d") {
		clickOnDone();
	} else if (ev.key == "z") {
		clickOnUndo();
	} else if (ev.key == "`") {
		let selected = false;
		for (let unitCard of document.querySelectorAll("unit-card")) {
			if (unitCard.unit.player != 0) continue;
			if (selected == true) {
				unitCard.selectAbility(-1);
				return;
			}
			if (unitCard.unit == clickContext.selectedUnit) selected = true;
		}
		for (let unitCard of document.querySelectorAll("unit-card")) {
			if (unitCard.unit.player != 0) continue;
			if (unitCard.unit.canAct()) {
				unitCard.selectAbility(-1);
				return;
			}
		}
	} else if (ev.keyCode >= 48 && ev.keyCode <= 57) {
		let num = ev.keyCode == 48 ? 10 : ev.keyCode - 48;
		for (let unitCard of document.querySelectorAll("unit-card")) {
			if (unitCard.unit == clickContext.selectedUnit) {
				unitCard.selectAbility(num);
			}
		}
	}
});
