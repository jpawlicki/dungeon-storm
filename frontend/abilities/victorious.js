abilityData.VICTORIOUS = new class extends Ability {
	constructor() {
		super();
		this.name = "Victorious";
		this.icon = "M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z";
		this.minActionPoints = 0;
		this.details = ["!REACTION: When a !ENEMY is !DEFEATED, gain ♦♦."];
		this.aiHints = [];
	}

	clickOnTile(unit, loc, quadrant) {}

	mouseOverTile(unit, loc, quadrant) {}

	actionEvent(unit, action) {
		let reactions = [];
		let defeats = 0;
		for (let e of action.events) if (e.type == ActionEvent.DEFEAT && e.who.player != unit.player) defeats++;
		if (defeats > 0) {
			reactions.push(new Action(
					true,
					[
						new AddingEffect(unit, "actionPoints", defeats * 2),
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
