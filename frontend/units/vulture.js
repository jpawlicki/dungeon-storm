{
	let unit = {
		ai: [aiData.MOVE_CLIMB, aiData.ATTACK_NEAREST],
		abilities: [abilityData.FLY, abilityData.BITE],
		id: "Vulture",
		portrait: "vulture.png",
		strengths: [4, 2, 1, 2],
		strengthsFrightened: [2, 1, 1, 1],
		threats: [false, false, false, false],
		threatsFrightened: [false, false, false, false],
	};
	unitData[unit.id] = unit;
}
