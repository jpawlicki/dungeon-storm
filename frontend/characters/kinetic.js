{
	let c = {
		abilities: [abilityData.EFFORTTELEPORT, abilityData.OUTMANEUVER, abilityData.SIPHON],
		id: "Kinetic",
		learnableAbilities: [abilityData.FACEENEMY, abilityData.VICTORIOUS, abilityData.REVENGE],
		portraits: 9,
		strengths: [5, 5, 2, 2],
		strengthsFrightened: [2, 2, 1, 1],
		threats: [false, false, false, false],
		threatsFrightened: [false, false, false, false],
	};
	characterData[c.id] = c;
}
