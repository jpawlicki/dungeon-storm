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
