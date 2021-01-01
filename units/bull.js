{
	let unit = {
		ai: [aiData.MOVE_FACE_NEAREST, aiData.ATTACK_NEAREST],
		abilities: [abilityData.MOVE, abilityData.CHARGE, abilityData.CONTROL],
		id: "Bull",
		portrait: "bull.png",
		strengths: [5, 3, 2, 3],
		strengthsFrightened: [6, 1, 1, 1],
		threats: [true, false, false, false],
		threatsFrightened: [true, false, false, false],
	};
	unitData[unit.id] = unit;
}
