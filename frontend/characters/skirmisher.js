{
	let c = {
		abilities: [abilityData.RUN, abilityData.ADVANCE, abilityData.CONTROL],
		id: "Skirmisher",
		learnableAbilities: [abilityData.FLEE, abilityData.SCORCHEDEARTH, abilityData.HURRY],
		portraits: 7,
		strengths: [3, 2, 2, 2],
		strengthsFrightened: [2, 2, 2, 2],
		threats: [true, true, true, true],
		threatsFrightened: [true, true, true, true],
	};
	characterData[c.id] = c;
}
