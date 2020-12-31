{
	let c = {
		abilities: [abilityData.MOVE, abilityData.CHARGE, abilityData.CONTROL],
		id: "Journeyman",
		learnableAbilities: [abilityData.ENERGIZE],
		portrait: "port2.png",
		strengths: [5, 4, 3, 3],
		strengthsBloodied: [4, 3, 2, 2],
		threats: [true, true, false, false],
		threatsBloodied: [false, false, false, false],
	};
	characterData[c.id] = c;
}
