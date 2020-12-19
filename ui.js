let clickContext = {
	selectedUnit: null,
	selectedAbility: null,
	actors: [],
};

function clearClickContextActors() {
	for (let a of clickContext.actors) a.destroy();
	clickContext.actors = [];
}

function clearClickContext() {
	clearClickContextActors();
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
		document.getElementById("abilityDescText").textContent = ability.details.join("\n");
		if (prev != null && prev != unit) prev.deselect();
		unit.select();
		return;
	}
}

// Tile quadrants:
//      /\
//     /30\
//     \21/
//      \/
function clickOnTile(loc, quadrant) {
	if (gameState.currentState.currentPlayer != 0) return;
	if (clickContext.selectedUnit != null && clickContext.selectedAbility != null) {
		let action = clickContext.selectedAbility.clickOnTile(clickContext.selectedUnit, loc, quadrant);
		if (action != null) {
			gameState.addAction(action);
			showHideUiElements();
		}
	}
}

function mouseOverTile(loc, quadrant) {
	if (gameState.currentState.currentPlayer != 0) return;
	if (clickContext.selectedUnit != null && clickContext.selectedAbility != null) {
		clickContext.selectedAbility.mouseOverTile(clickContext.selectedUnit, loc, quadrant);
	}
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
	document.getElementById("undo").style.visibility = gameState.currentState.currentPlayer == 0 && gameState.actionHistory.length > 0 && gameState.actionHistory[gameState.actionHistory.length - 1].undoable ? "visible" : "hidden";
	if (clickContext.selectedUnit != null && clickContext.selectedAbility != null && clickContext.selectedUnit.actionPoints < clickContext.selectedAbility.minActionPoints) clickOnAbility(clickContext.selectedUnit, clickContext.selectedAbility);

	let actionsLeft = false;
	for (let unit of gameState.currentState.units) if (unit.player == 0 && unit.canAct()) actionsLeft = true;
	document.getElementById("done").setAttribute("class", actionsLeft ? "warn" : "suggest");

	document.getElementById("done").style.visibility = gameState.currentState.currentPlayer == 0 ? "visible" : "hidden";
}

function loadAdventure(adventure) {
	document.querySelector("#mapDiv").innerHTML = "";
	gameState = new GameState(adventure);
	document.querySelector("#mapDiv").appendChild(setupAdventureSituation());
}

function loadRoom(coords) {
	gameState.loadRoom(coords);
	for (let c of gameState.characters) c.clearActors();
	document.querySelector("#mapDiv").innerHTML = "";
	document.querySelector("#mapDiv").appendChild(setupRoomSvg(gameState.currentState));
	for (let u of document.querySelectorAll("unit-card")) u.parentNode.removeChild(u);
	for (let unit of gameState.currentState.units) if (unit.player == 0) unit.registerActor(new UnitCard(unit, true, document.getElementById("unitCards")));
	showSidePane();
}

function hideSidePane() {
	document.querySelector("body").setAttribute("class", "nosidepane");
}

function showSidePane() {
	document.querySelector("body").setAttribute("class", "");
}
