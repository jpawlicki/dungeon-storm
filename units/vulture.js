{
	let unit = {
		ai: [aiData.MOVE_CLIMB, aiData.ATTACK_NEAREST],
		abilities: [abilityData.FLY, abilityData.ATTACK],
		id: "Vulture",
		portrait: "vulture.png",
		strengths: [4, 2, 1, 2],
		strengthsBloodied: [2, 1, 1, 1],
		threats: [false, false, false, false],
		threatsBloodied: [false, false, false, false],
	};
	unitData[unit.id] = unit;
}
