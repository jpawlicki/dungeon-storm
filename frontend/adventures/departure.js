{
	let adventure = {
		description: {
			"en": "There is a time too, for good-byes...",
		},
		descriptionDefeat: {
			"en": "...and the heartaches that follow.",
		},
		descriptionVictory: {
			"en": "...but the departed are always with us.",
		},
		characters: 1,
		entry: [0, 0],
		id: "DEPARTURE",
		maxAbilities: 8,
		rooms: [
			["DEPARTURE_1", null, "DEPARTURE_7", "DEPARTURE_8", "DEPARTURE_9"],
			["DEPARTURE_2", null, "DEPARTURE_6", null, "DEPARTURE_10"],
			["DEPARTURE_3", "DEPARTURE_4", "DEPARTURE_5", null, "DEPARTURE_11"],
		],
		title: {
			"en": "The Family",
		},
		timeLimit: 12,
		unlocks: [],
		victory: [[2, 4]],
	};
	adventureData[adventure.id] = adventure;
}
