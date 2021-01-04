{
	let c = {
		abilities: [abilityData.MOVE, abilityData.SHOOT, abilityData.CONTROL],
		id: "Archer",
		learnableAbilities: [abilityData.SOLARPOWER, abilityData.HIGHGROUND, abilityData.EMPATHY],
		portraits: 1,
		strengths: [2, 1, 1, 1],
		strengthsFrightened: [2, 1, 1, 1],
		threats: [true, false, false, false],
		threatsFrightened: [true, false, false, false],
	};
	characterData[c.id] = c;
}
