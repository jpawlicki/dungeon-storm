{
	let c = {
		abilities: [abilityData.MOVE, abilityData.SWORD, abilityData.CONTROL],
		id: "Wisher",
		learnableAbilities: [abilityData.FLY, abilityData.TELEPORT, abilityData.DISTRACT],
		portraits: 39,
		strengths: [4, 3, 2, 3],
		strengthsFrightened: [3, 2, 1, 2],
		threats: [true, false, false, false],
		threatsFrightened: [true, false, false, false],
	};
	characterData[c.id] = c;
}
