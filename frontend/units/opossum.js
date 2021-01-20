{
	let unit = {
		ai: [aiData.ATTACK_NEAREST, aiData.MOVE_RANDOMLY],
		abilities: [abilityData.MOVE, abilityData.BITE, abilityData.PANIC, abilityData.CONTROL, abilityData.PRESS, abilityData.OPPORTUNITY],
		id: "Opossum",
		portrait: "opossum.png",
		recommendedRewards: {heal: 1},
		strengths: [3, 3, 2, 3],
		strengthsFrightened: [4, 4, 3, 4],
		threats: [true, false, false, false],
		threatsFrightened: [true, true, true, false],
	};
	unitData[unit.id] = unit;
}
