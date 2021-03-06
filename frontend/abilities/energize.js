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
