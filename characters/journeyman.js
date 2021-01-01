{
	let c = {
		abilities: [abilityData.MOVE, abilityData.CHARGE, abilityData.CONTROL],
		id: "Journeyman",
		learnableAbilities: [abilityData.STRIKE, abilityData.ENCOURAGE, abilityData.STARTUP],
		portraits: 1,
		strengths: [4, 3, 2, 2],
		strengthsFrightened: [3, 2, 2, 2],
		threats: [true, true, false, false],
		threatsFrightened: [false, false, false, false],
	};
	characterData[c.id] = c;
}
