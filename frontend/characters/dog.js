{
	let c = {
		abilities: [abilityData.MOVE, abilityData.BITE, abilityData.CONTROL],
		id: "Dog",
		learnableAbilities: [abilityData.ENERGIZE, abilityData.FRIGHTEN, abilityData.FEARMONGER],
		portraits: 13,
		strengths: [5, 2, 1, 2],
		strengthsFrightened: [4, 1, 1, 1],
		threats: [true, false, false, false],
		threatsFrightened: [true, false, false, false],
	};
	characterData[c.id] = c;
}
