{
	let unit = {
		ai: [aiData.MOVE_DOWNHILL, aiData.ATTACK_NEAREST],
		abilities: [abilityData.MOVE, abilityData.FRIGHTEN, abilityData.CONTROL],
		id: "Snake",
		portrait: "snake.png",
		strengths: [3, 3, 3, 3],
		strengthsFrightened: [2, 1, 1, 1],
		threats: [true, false, true, false],
		threatsFrightened: [false, false, false, false],
	};
	unitData[unit.id] = unit;
}
