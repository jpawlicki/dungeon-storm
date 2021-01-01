{
	let c = {
		abilities: [abilityData.MOVE, abilityData.PUSH, abilityData.CONTROL],
		id: "Dancer",
		learnableAbilities: [abilityData.SWAP, abilityData.PRESS, abilityData.SLOW],
		portraits: 7,
		strengths: [3, 2, 2, 2],
		strengthsBloodied: [2, 1, 1, 1],
		threats: [true, true, true, true],
		threatsBloodied: [true, false, false, false],
	};
	characterData[c.id] = c;
}
