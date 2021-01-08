{
	let unit = {
		ai: [aiData.MOVE_CLOSER_AND_THREATEN, aiData.ATTACK_NEAREST],
		abilities: [abilityData.CHALLENGE, abilityData.BACKSTAB, abilityData.SLOW, abilityData.CONTROL],
		id: "Spider",
		portrait: "spider.png",
		strengths: [3, 3, 3, 3],
		strengthsFrightened: [1, 1, 1, 1],
		threats: [true, true, true, true],
		threatsFrightened: [false, false, false, false],
	};
	unitData[unit.id] = unit;
}
