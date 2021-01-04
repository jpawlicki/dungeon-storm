{
	let unit = {
		ai: [aiData.MOVE_FLEE, aiData.ATTACK_NEAREST],
		abilities: [abilityData.MOVE, abilityData.FRIGHTEN],
		id: "Snake",
		portrait: "snake.png",
		strengths: [3, 3, 3, 3],
		strengthsFrightened: [2, 1, 1, 1],
		threats: [false, false, false, false],
		threatsFrightened: [false, false, false, false],
	};
	unitData[unit.id] = unit;
}
