{
	let unit = {
		ai: [aiData.ATTACK_NEAREST],
		abilities: [abilityData.SHOOT, abilityData.ENERGIZE],
		id: "Archer Statue",
		portrait: "archer_statue.png",
		strengths: [5, 5, 3, 5],
		strengthsFrightened: [4, 4, 2, 4],
		threats: [false, false, false, false],
		threatsFrightened: [false, false, false, false],
	};
	unitData[unit.id] = unit;
}
