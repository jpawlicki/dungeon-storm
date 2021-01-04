{
	let c = {
		abilities: [abilityData.MOVE, abilityData.TERRIFY, abilityData.CONTROL],
		id: "Berserker",
		learnableAbilities: [abilityData.CHALLENGE, abilityData.DESPERATION, abilityData.PANIC],
		portraits: 5,
		strengths: [3, 3, 2, 3],
		strengthsFrightened: [5, 5, 1, 5],
		threats: [false, false, false, false],
		threatsFrightened: [true, true, false, true],
	};
	characterData[c.id] = c;
}
