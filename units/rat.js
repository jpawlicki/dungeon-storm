{
	let unit = {
		ai: aiData.ATTACK_NEAREST,
		abilities: [abilityData.MOVE, abilityData.ATTACK],
		id: "Rat",
		portrait: "rat.png",
		strengths: [2, 1, 1, 1],
		strengthsBloodied: [1, 1, 1, 1],
		threats: [false, false, false, false],
		threatsBloodied: [false, false, false, false],
	};
	unitData[unit.id] = unit;
}
