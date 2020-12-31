{
	let c = {
		abilities: [abilityData.MOVE, abilityData.SWORD, abilityData.CONTROL],
		id: "Dancer",
		learnableAbilities: [abilityData.ENERGIZE, abilityData.SWAP],
		portrait: "port3.png",
		strengths: [3, 2, 2, 2],
		strengthsBloodied: [2, 1, 1, 1],
		threats: [true, true, true, true],
		threatsBloodied: [true, false, false, false],
	};
	characterData[c.id] = c;
}
