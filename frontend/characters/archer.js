{
	let c = {
		abilities: [abilityData.MOVE, abilityData.SHOOT, abilityData.CONTROL],
		id: "Archer",
		learnableAbilities: [abilityData.SOLARPOWER, abilityData.HIGHGROUND, abilityData.EMPATHY],
		portraits: 7,
		strengths: [1, 3, 4, 3],
		strengthsFrightened: [1, 3, 4, 3],
		threats: [true, false, false, false],
		threatsFrightened: [true, false, false, false],
	};
	characterData[c.id] = c;
}
