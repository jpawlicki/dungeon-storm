{
	let unit = {
		ai: [aiData.BUFF_RANDOM],
		abilities: [abilityData.EMPATHY, abilityData.ENCOURAGE, abilityData.PANIC, abilityData.STARTUP],
		id: "Fountain",
		portrait: "fountain.png",
		recommendedRewards: {experience: 1, time: 1},
		strengths: [2, 2, 2, 2],
		strengthsFrightened: [5, 5, 5, 5],
		threats: [false, false, false, false],
		threatsFrightened: [false, false, false, false],
	};
	unitData[unit.id] = unit;
}
