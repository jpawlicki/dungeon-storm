{
	let unit = {
		ai: [aiData.ATTACK_NEAREST, aiData.MOVE_RANDOMLY],
		abilities: [abilityData.MOVE, abilityData.BITE, abilityData.FEARMONGER],
		id: "Rat",
		portrait: "rat.png",
		recommendedRewards: {time: 1},
		strengths: [2, 1, 1, 1],
		strengthsFrightened: [1, 1, 1, 1],
		threats: [false, false, false, false],
		threatsFrightened: [false, false, false, false],
	};
	unitData[unit.id] = unit;
}
