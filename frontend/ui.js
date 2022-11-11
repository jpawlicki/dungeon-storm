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
		document.getElementById("abilityDescText").textContent = "";
		unit.deselect();
		return;
	} else {
		let prev = clickContext.selectedUnit;
		clickContext.selectedUnit = unit;
		clickContext.selectedAbility = ability;
		document.getElementById("abilityDescText").innerHTML = "";
		document.getElementById("abilityDescText").appendChild(expandAbilityDetails(ability.details, unit.player != 0));
		if (prev != null && prev != unit) prev.deselect();
		unit.select();
		if (clickContext.lastMouseOver != null) {
			mouseOverTile(clickContext.lastMouseOver.loc, clickContext.lastMouseOver.quadrant);
		}
		Tutorial.hook(Tutorial.Hook.UI_ABILITYSELECT);
		return;
	}
}

let uiLocked = false;
function lockUi() {
	if (uiLocked) return false;
	uiLocked = true;
	return true;
}

function unlockUi() {
	uiLocked = false;
}

// Tile quadrants:
//      /\
//     /30\
//     \21/
//      \/
function clickOnTile() {
	if (gameState.currentPlayer != 0) return;
	if (clickContext.lastMouseOver == null) return;
	if (clickContext.selectedUnit != null && clickContext.selectedAbility != null) {
		if (clickContext.selectedUnit.player != 0) return;
		if (clickContext.selectedUnit.state == Unit.State.DEFEATED) return;
		let action = clickContext.selectedAbility.clickOnTile(clickContext.selectedUnit, clickContext.lastMouseOver.loc, clickContext.lastMouseOver.quadrant);
		if (action != null) {
			if (!lockUi()) return;
			Tutorial.hook(Tutorial.Hook.UI_ABILITYUSE);
			clearClickContextActors();
			gameState.addAction(action, () => {
				unlockUi();
				showHideUiElements();
				if (clickContext.lastMouseOver != null) mouseOverTile(clickContext.lastMouseOver.loc, clickContext.lastMouseOver.quadrant);
				Tutorial.hook(Tutorial.Hook.ACTION_TAKEN);
			});
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

function mouseMoveTile(tile, loc, event) {
	let bounds = tile.getBoundingClientRect();
	if (event.clientX > bounds.x + bounds.width * 2.2
			|| event.clientX < bounds.x - bounds.width * 1.2
			|| event.clientY < bounds.y - bounds.height * 1.2
			|| event.clientY > bounds.y + bounds.height * 2.2) {
		mouseOutTile();
		return;
	}
	let quad =
			event.clientX >= bounds.x + bounds.width / 2 && event.clientY < bounds.y + bounds.height / 2 ? 0 :
			event.clientX >= bounds.x + bounds.width / 2 && event.clientY >= bounds.y + bounds.height / 2 ? 1 :
			event.clientX < bounds.x + bounds.width / 2 && event.clientY >= bounds.y + bounds.height / 2 ? 2 : 3;
	if (clickContext.lastMouseOver == null || clickContext.lastMouseOver.loc[0] != loc[0] || clickContext.lastMouseOver.loc[1] != loc[1] || clickContext.lastMouseOver.quadrant != quad) mouseOverTile(loc, quad);
}

function mouseOutTile() {
	clickContext.lastMouseOver = null;
	clearClickContextActors();
}

function clickOnUndo() {
	if (uiLocked) return;
	if (gameState.disableActions) return;
	if (gameState.currentPlayer != 0) return;
	Tutorial.hook(Tutorial.Hook.UI_UNDO);
	gameState.undoAction();
	showHideUiElements();
}

function clickOnDone() {
	if (uiLocked) return;
	if (gameState.disableActions) return;
	if (gameState.currentPlayer != 0) return;
	clearClickContext();
	gameState.turnDone();
	showHideUiElements();
}

function notifyTurn() {
	if (gameState.currentPlayer == 0) {
		selectNext();
		Sound.turnBegin();
	}
}

function showHideUiElements() {
	document.getElementById("undo").style.visibility = gameState.canPlayerUndo() ? "visible" : "hidden";
	if (clickContext.selectedUnit != null && clickContext.selectedAbility != null && clickContext.selectedUnit.actionPoints < clickContext.selectedAbility.minActionPoints) selectNext();
	document.getElementById("done").style.visibility = gameState.currentPlayer == 0 ? "visible" : "hidden";
	document.getElementById("timeleft").textContent = gameState.resources.time != undefined ? gameState.resources.time : "";
}

function loadAdventure(adventure) {
	gameState.loadAdventure(adventure);
}

function loadRoom(coords) {
	gameState.loadRoom(coords);
	setupRoomSituation();
	Tutorial.hook(Tutorial.Hook.ROOM_LOAD);
}

function setupRoomSituation() {
	for (let c of gameState.characters) c.clearActors();
	document.querySelector("#mapDiv").innerHTML = "";
	document.querySelector("#mapDiv").appendChild(setupRoomSvg(gameState));
	for (let u of document.querySelectorAll("unit-card")) u.parentNode.removeChild(u);
	for (let unit of gameState.units) if (unit.player == 0) unit.registerActor(new UnitCard(unit, true, document.getElementById("unitCards")));
	for (let unit of gameState.units) if (unit.player != 0) unit.registerActor(new UnitCard(unit, false, document.getElementById("unitCardsEnemy")));
	showSidePane();
	showHideUiElements();
}

function hideSidePane() {
	document.querySelector("body").setAttribute("class", "nosidepane");
}

function showSidePane() {
	document.querySelector("body").setAttribute("class", "");
}

function expandAbilityDetails(descAr, enemyContext = false) {
	let p = document.createElement("p");
	let desc = descAr.join("<br/>").replaceAll("!ENEMY", enemyContext ? "!CHARACTER" : "!DANGER").replaceAll("!FRIEND", enemyContext ? "!DANGER" : "!CHARACTER");

	let expandable = {
		"!NOTLEARNED": "This !CHARACTER does not yet know this ability, but can learn it by spending !EXPERIENCE.",
	};

	for (let ex in expandable) {
		desc = desc.replaceAll(new RegExp(ex, 'g'), match => {
			return expandable[ex];
		});
	}

	let expansions = {
		"!REACTION": Tutorial.Hook.EXPLAIN_REACTION,
		"!DEFEAT": Tutorial.Hook.EXPLAIN_DEFEAT,
		"!MOVE": Tutorial.Hook.EXPLAIN_MOVE,
		"!THREATEN": Tutorial.Hook.EXPLAIN_THREATEN,
		"!RETREAT": Tutorial.Hook.EXPLAIN_RETREAT,
		"!FRIGHTENED": Tutorial.Hook.EXPLAIN_FRIGHTENED,
		"!FRIGHTEN": Tutorial.Hook.EXPLAIN_FRIGHTENED,
		"!DANGER": Tutorial.Hook.EXPLAIN_DANGER,
		"!CHARACTER": Tutorial.Hook.EXPLAIN_CHARACTER,
	};

	for (let ex in expansions) {
		desc = desc.replaceAll(new RegExp(ex + "[^.\\- ]*", 'g'), match => {
			return "<span class=\"explicable\" onclick=\"Tutorial.hook(" + expansions[ex] + ");\">" + match.substr(1, 1) + match.substr(2).toLowerCase() + "</span>";
		});
	}

	let icons = {
		"!EXPERIENCE": {f: Util.makeCap, tutorial: Tutorial.Hook.EXPLAIN_EXPERIENCE },
		"!UNLOCK": {f: Util.makeUnlock, tutorial: Tutorial.Hook.EXPLAIN_UNLOCK },
		"!HEALING": {f: Util.makePlus, tutorial: Tutorial.Hook.EXPLAIN_HEALING },
		"!VICTORY": {f: Util.makeCup, tutorial: Tutorial.Hook.EXPLAIN_VICTORY },
		"!TIME": {f: Util.makeTime, tutorial: Tutorial.Hook.EXPLAIN_TIME },
		"⚅": {f: Util.makeDice, tutorial: Tutorial.Hook.EXPLAIN_DICE },
		"♦": {f: Util.makeDiamond, tutorial: Tutorial.Hook.EXPLAIN_DIAMOND },
		"○": {f: Util.makeCircle, tutorial: Tutorial.Hook.EXPLAIN_CIRCLE },
	};

	for (let ex in icons) {
		desc = desc.replaceAll(new RegExp(ex, 'g'), match => {
			let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
			svg.setAttribute("viewBox", "0 0 24 24");
			svg.style.height = "1em";
			svg.style.verticalAlign = "bottom";
			icons[ex].f(svg);
			return "<span class=\"explicable\" onclick=\"Tutorial.hook(" + icons[ex].tutorial + ");\">" + svg.outerHTML + "</span>";
		});
	}

	p.innerHTML = desc;
	return p;
}

function selectNext() {
	let selected = false;
	for (let unitCard of document.querySelectorAll("unit-card")) {
		if (unitCard.unit.player != 0) continue;
		if (!unitCard.unit.canAct()) continue;
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
}

window.addEventListener("keypress", (ev) => {
	if (document.querySelector("body").getAttribute("class") == "nosidepane") return;
  let abilityKeys = ["1", "q", "2", "w", "3", "e", "4", "r", "5", "t"];
	if (ev.key == "Enter" || ev.key == " ") {
		if (tutorial != undefined && tutorial.isOpen()) tutorial.tutorialClose();
		else clickOnDone();
	} else if (ev.key == "h") {
		Tutorial.hook(Tutorial.Hook.SHOW_HOTKEYS);
	} else if (ev.key == "z") {
		clickOnUndo();
	} else if (ev.key == "`") {
		selectNext();
	} else if (abilityKeys.includes(ev.key)) {
		for (let unitCard of document.querySelectorAll("unit-card")) {
			if (unitCard.unit == clickContext.selectedUnit) {
				unitCard.selectAbility(abilityKeys.indexOf(ev.key) + 1);
			}
		}
	}
});

window.addEventListener("keyup", (ev) => {
	if (ev.key == "Escape") {
		if (tutorial != undefined) tutorial.tutorialClose();
	}
});
