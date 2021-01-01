abilityData.PRESS = new class extends Ability {
	constructor() {
		super();
		this.name = "Press";
		this.icon = "M13,6V18L21.5,12M4,18L12.5,12L4,6V18Z";
		this.minActionPoints = 0;
		this.details = ["!REACTION: Gain ♦ whenever a !ENEMY !THREATENed by this !FRIEND !RETREATs."];
		this.aiHints = [];
		this.cost = {experience: 3};
	}

	clickOnTile(unit, loc, quadrant) {}

	mouseOverTile(unit, loc, quadrant) {}

	actionEvent(unit, action) {
		let reactions = [];
		let retreating = 0;
		for (let e of action.events) if (e.type == ActionEvent.RETREAT && unit.threatens(e.who, e.who.pos)) retreating++;
		if (retreating > 0) {
			reactions.push(new Action(
					true,
					[
						new Effect(unit, "actionPoints", unit.actionPoints + retreating),
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
