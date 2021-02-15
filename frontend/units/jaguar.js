{
	let unit = {
		ai: [aiData.ATTACK_NEAREST, aiData.MOVE_CLOSER_AND_THREATEN, aiData.MOVE_CLIMB],
		abilities: [abilityData.TELEPORT, abilityData.HIGHGROUND, abilityData.CONTROL, abilityData.FLEE, abilityData.SCORCHEDEARTH, abilityData.STARTUP],
		id: "Jaguar",
		portrait: "jaguar.png",
		recommendedRewards: {experience: 1, time: 1},
		strengths: [4, 3, 2, 3],
		strengthsFrightened: [3, 2, 2, 2],
		threats: [true, false, false, false],
		threatsFrightened: [false, false, false, false],
	};
	unitData[unit.id] = unit;
}
