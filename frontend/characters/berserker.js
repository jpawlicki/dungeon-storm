{
	let c = {
		abilities: [abilityData.MOVE, abilityData.TERRIFY, abilityData.CONTROL],
		id: "Berserker",
		learnableAbilities: [abilityData.CHALLENGE, abilityData.DESPERATION, abilityData.PANIC],
		portraits: 5,
		strengths: [2, 2, 2, 2],
		strengthsFrightened: [5, 4, 1, 4],
		threats: [false, false, false, false],
		threatsFrightened: [true, true, false, true],
	};
	characterData[c.id] = c;
}
