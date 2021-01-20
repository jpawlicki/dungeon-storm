{
	let unit = {
		ai: [aiData.ATTACK_NEAREST, aiData.MOVE_RANDOMLY],
		abilities: [abilityData.MOVE, abilityData.STRIKE, abilityData.BITE, abilityData.CHARGE, abilityData.CONTROL, abilityData.PANIC],
		id: "Bear",
		portrait: "bear.png",
		recommendedRewards: {experience: 2},
		strengths: [6, 5, 4, 5],
		strengthsFrightened: [6, 5, 4, 5],
		threats: [true, true, false, true],
		threatsFrightened: [true, true, false, true],
	};
	unitData[unit.id] = unit;
}
