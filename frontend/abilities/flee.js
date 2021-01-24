abilityData.FLEE = new class extends Ability {
	constructor() {
		super();
		this.name = "Flee";
		this.icon = "M19,5V19H16V5M14,5V19L3,12";
		this.minActionPoints = 0;
		this.details = [
			"!REACTION: When this !FRIEND !RETREATs, gain ♦.",
			"(The ♦ can't be used in the !RETREAT action.)"];
		this.aiHints = [];
	}

	clickOnTile(unit, loc, quadrant) {}

	mouseOverTile(unit, loc, quadrant) {}

	actionEvent(unit, action) {
		let reactions = [];
		let retreating = 0;
		for (let e of action.events) if (e.type == ActionEvent.RETREAT && e.who == unit) retreating++;
		if (retreating > 0) {
			reactions.push(new Action(
					true,
					[
						new AddingEffect(unit, "actionPoints", 1),
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
