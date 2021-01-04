abilityData.OPPORTUNITY = new class extends Ability {
	constructor() {
		super();
		this.name = "Opportunity";
		this.icon = "M10,9V5L3,12L10,19V14.9C15,14.9 18.5,16.5 21,20C20,15 17,10 10,9Z";
		this.minActionPoints = 0;
		this.details = [
			"!REACTION: Gain ♦ whenever a !ENEMY !MOVES such that this !FRIEND !THREATENs it.",
			"Does not apply to !ENEMYs already !THREATENed by this !FRIEND."];
		this.aiHints = [];
	}

	clickOnTile(unit, loc, quadrant) {}

	mouseOverTile(unit, loc, quadrant) {}

	actionEvent(unit, action) {
		let movingUnits = [];
		let reactions = [];
		for (let ev of action.events) if (ev.type == ActionEvent.MOVE) movingUnits.push(ev.who);
		for (let u of movingUnits) {
			for (let ef of action.effects) {
				if (ef.unit == u && ef.property == "pos") {
					if (unit.threatens(u, ef.oldValue)) continue;
					if (unit.threatens(u, ef.value)) {
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
				}
			}
		}
		return reactions;
	}
}();
