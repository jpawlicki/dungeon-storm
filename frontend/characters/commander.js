{
	let c = {
		abilities: [abilityData.FORMATION, abilityData.CLEAVE, abilityData.CONTROL],
		id: "Commander",
		learnableAbilities: [abilityData.TAUNT, abilityData.RESCUE, abilityData.DEFENDER],
		portraits: 8,
		strengths: [4, 1, 1, 4],
		strengthsFrightened: [3, 1, 1, 2],
		threats: [true, false, false, true],
		threatsFrightened: [true, false, false, true],
	};
	characterData[c.id] = c;
}
