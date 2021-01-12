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
