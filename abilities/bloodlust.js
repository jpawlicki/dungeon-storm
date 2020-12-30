abilityData.BLOODLUST = new class extends Ability {
	constructor() {
		super();
		this.name = "Bloodlust";
		this.icon = "M12 18C12 18.7 12.12 19.36 12.34 20C12.23 20 12.12 20 12 20C8.69 20 6 17.31 6 14C6 10 12 3.25 12 3.25S16.31 8.1 17.62 12C14.5 12.22 12 14.82 12 18M19 17V14H17V17H14V19H17V22H19V19H22V17H19Z";
		this.minActionPoints = 0;
		this.details = ["!REACTION: Gain ♦ whenever someone becomes !BLOODY."];
		this.aiHints = [];
		this.cost = {experience: 3};
	}

	clickOnTile(unit, loc, quadrant) {}

	mouseOverTile(unit, loc, quadrant) {}

	actionEvent(unit, action) {
		let reactions = [];
		let newBloodied = 0;
		for (let e of action.effects) if (e.property == "state" && e.value == Unit.State.BLOODIED && e.oldValue != Unit.State.BLOODIED) newBloodied++;
		if (newBloodied > 0) {
			reactions.push(new Action(
					true,
					[
						new Effect(unit, "actionPoints", unit.actionPoints + newBloodied),
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