{
	let unit = {
		ai: [aiData.ATTACK_NEAREST],
		abilities: [abilityData.SHOOT],
		id: "Archer Statue",
		portrait: "archer_statue.png",
		recommendedRewards: {time: 1},
		strengths: [5, 5, 3, 5],
		strengthsFrightened: [4, 4, 2, 4],
		threats: [false, false, false, false],
		threatsFrightened: [false, false, false, false],
	};
	unitData[unit.id] = unit;
}
