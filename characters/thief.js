{
	let c = {
		abilities: [abilityData.MOVE, abilityData.BACKSTAB, abilityData.CONTROL],
		id: "Thief",
		learnableAbilities: [abilityData.OPPORTUNITY, abilityData.VAULT, abilityData.SLIDE],
		portraits: 1,
		strengths: [4, 2, 3, 2],
		strengthsFrightened: [3, 1, 2, 1],
		threats: [true, false, true, false],
		threatsFrightened: [true, false, false, false],
	};
	characterData[c.id] = c;
}
