{
	let unit = {
		ai: [aiData.MOVE_CLOSER_AND_THREATEN, aiData.ATTACK_THREATENED, aiData.ATTACK_NEAREST],
		abilities: [abilityData.MOVE, abilityData.TERRIFY, abilityData.BITE, abilityData.CONTROL],
		id: "Wolf",
		portrait: "wolf.png",
		recommendedRewards: {experience: 1.4},
		strengths: [4, 3, 2, 3],
		strengthsFrightened: [3, 1, 0, 1],
		threats: [true, true, false, true],
		threatsFrightened: [true, false, false, false],
	};
	unitData[unit.id] = unit;
}
