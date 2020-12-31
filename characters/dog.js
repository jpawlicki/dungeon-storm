{
	let c = {
		abilities: [abilityData.MOVE, abilityData.BITE, abilityData.CONTROL],
		id: "Dog",
		learnableAbilities: [abilityData.ENERGIZE, abilityData.BLOODY, abilityData.BLOODLUST],
		portrait: "dog.png",
		strengths: [5, 2, 1, 2],
		strengthsBloodied: [4, 1, 1, 1],
		threats: [true, false, false, false],
		threatsBloodied: [true, false, false, false],
	};
	characterData[c.id] = c;
}
