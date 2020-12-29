abilityData.CONTROL = new class extends Ability {
	constructor() {
		super();
		this.name = "Control";
		this.icon = "M14.8 7V5.5C14.8 4.1 13.4 3 12 3S9.2 4.1 9.2 5.5V7C8.6 7 8 7.6 8 8.2V11.7C8 12.4 8.6 13 9.2 13H14.7C15.4 13 16 12.4 16 11.8V8.3C16 7.6 15.4 7 14.8 7M13.5 7H10.5V5.5C10.5 4.7 11.2 4.2 12 4.2S13.5 4.7 13.5 5.5V7M6 17V20L2 16L6 12V15H18V12L22 16L18 20V17H6Z";
		this.minActionPoints = 0;
		this.details = ["!REACTION: Enemies !THREATENed by this unit that !MOVE in a direction other than directly away are !DEFEATed."];
		this.aiHints = [];
		this.cost = {experience: 1};
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
					if (unit.threatens(u, ef.oldValue) && Tile.directionTo(unit.pos, ef.oldValue) != Tile.directionTo(ef.oldValue, ef.value)) {
						reactions.push(new Action(
								true,
								[
									new Effect(u, "state", Unit.State.DEFEATED),
								],
								[ActionEvent.defeat(u)],
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
