{
	let c = {
		abilities: [abilityData.MOVE, abilityData.CHARGE, abilityData.CONTROL],
		id: "Journeyman",
		learnableAbilities: [abilityData.ENERGIZE],
		portraits: 1,
		strengths: [4, 3, 2, 2],
		strengthsBloodied: [3, 2, 2, 2],
		threats: [true, true, false, false],
		threatsBloodied: [false, false, false, false],
	};
	characterData[c.id] = c;
}
