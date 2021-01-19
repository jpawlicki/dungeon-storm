{
	let unit = {
		ai: [aiData.ATTACK_NEAREST, aiData.MOVE_CLOSER_AND_THREATEN],
		abilities: [abilityData.TELEPORT, abilityData.DESPERATION, abilityData.FRIGHTEN, abilityData.TERRIFY, abilityData.PRESS, abilityData.OPPORTUNITY],
		id: "Darkness",
		portrait: "moon.png",
		strengths: [6, 6, 5, 6],
		strengthsFrightened: [5, 5, 4, 5],
		threats: [true, true, true, true],
		threatsFrightened: [true, true, false, true],
	};
	unitData[unit.id] = unit;
}
