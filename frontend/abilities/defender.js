abilityData.DEFENDER = new class extends Ability {
	constructor() {
		super();
		this.name = "Defender";
		this.icon = "M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1Z";
		this.minActionPoints = 0;
		this.details = ["!REACTION: When another !FRIEND !RETREATs, gain ♦."];
		this.aiHints = [];
	}

	clickOnTile(unit, loc, quadrant) {}

	mouseOverTile(unit, loc, quadrant) {}

	actionEvent(unit, action) {
		let reactions = [];
		let retreating = 0;
		for (let e of action.events) if (e.type == ActionEvent.RETREAT && e.who != unit && e.who.player == unit.player) retreating++;
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
