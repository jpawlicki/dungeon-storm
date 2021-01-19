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
			[roomData.DEPARTURE_1, null, roomData.DEPARTURE_7, roomData.DEPARTURE_8, roomData.DEPARTURE_9],
			[roomData.DEPARTURE_2, null, roomData.DEPARTURE_6, null, roomData.DEPARTURE_10],
			[roomData.DEPARTURE_3, roomData.DEPARTURE_4, roomData.DEPARTURE_5, null, roomData.DEPARTURE_11],
		],
		title: {
			"en": "The Departure",
		},
		timeLimit: 1,
		unlocks: [],
		victory: [[2, 4]],
	};
	adventureData[adventure.id] = adventure;
}
