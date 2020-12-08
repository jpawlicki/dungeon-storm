let clickContext = {
	selectedUnit: null,
	selectedAbility: null,
	actors: [],
};

function clearClickContextActors() {
	for (let a of clickContext.actors) a.destroy();
	clickContext.actors = [];
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
	if (clickContext.selectedUnit != null && clickContext.selectedAbility != null) {
		let action = clickContext.selectedAbility.clickOnTile(clickContext.selectedUnit, loc, quadrant);
		if (action != null) {
			gameState.addAction(action);
			showHideUiElements();
		}
	}
}

function mouseOverTile(loc, quadrant) {
	if (clickContext.selectedUnit != null && clickContext.selectedAbility != null) {
		clickContext.selectedAbility.mouseOverTile(clickContext.selectedUnit, loc, quadrant);
	}
}

function clickOnUndo() {
	gameState.undoAction();
	showHideUiElements();
}

function clickOnDone() {
	gameState.turnDone();
	showHideUiElements();
}

function showHideUiElements() {
	document.getElementById("undo").style.visibility = gameState.actionHistory.length > 0 && gameState.actionHistory[gameState.actionHistory.length - 1].undoable ? "visible" : "hidden";
	if (clickContext.selectedUnit != null && clickContext.selectedAbility != null && clickContext.selectedUnit.actionPoints < clickContext.selectedAbility.minActionPoints) clickOnAbility(clickContext.selectedUnit, clickContext.selectedAbility);
}
