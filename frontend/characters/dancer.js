{
	let c = {
		abilities: [abilityData.MOVE, abilityData.PUSH, abilityData.CONTROL],
		id: "Dancer",
		learnableAbilities: [abilityData.SWAP, abilityData.PRESS, abilityData.SLOW],
		portraits: 7,
		strengths: [3, 3, 1, 3],
		strengthsFrightened: [2, 1, 2, 1],
		threats: [true, true, true, true],
		threatsFrightened: [true, false, false, false],
	};
	characterData[c.id] = c;
}
