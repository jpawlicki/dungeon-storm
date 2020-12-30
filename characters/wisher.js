{
	let c = {
		abilities: [abilityData.MOVE, abilityData.ATTACK, abilityData.CONTROL],
		id: "Wisher",
		learnableAbilities: [abilityData.FLY, abilityData.TELEPORT],
		portrait: "port.png",
		strengths: [4, 3, 2, 3],
		strengthsBloodied: [3, 2, 1, 2],
		threats: [true, false, false, false],
		threatsBloodied: [true, false, false, false],
	};
	characterData[c.id] = c;
}
