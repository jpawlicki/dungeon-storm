abilityData.REVENGE = new class extends Ability {
	constructor() {
		super();
		this.name = "Revenge";
		this.icon = "M20 6.91L17.09 4L12 9.09L6.91 4L4 6.91L9.09 12L4 17.09L6.91 20L12 14.91L17.09 20L20 17.09L14.91 12L20 6.91Z";
		this.minActionPoints = 0;
		this.details = ["!REACTION: When a !FRIEND is !DEFEATED, gain ♦♦♦♦."];
		this.aiHints = [];
	}

	clickOnTile(unit, loc, quadrant) {}

	mouseOverTile(unit, loc, quadrant) {}

	actionEvent(unit, action) {
		let reactions = [];
		let defeats = 0;
		for (let e of action.events) if (e.type == ActionEvent.DEFEAT && e.who.player == unit.player) defeats++;
		if (defeats > 0) {
			reactions.push(new Action(
					true,
					[
						new AddingEffect(unit, "actionPoints", defeats * 4),
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
