{
	let adventure = {
		description: {
			"en": "Journey into the garden...",
		},
		descriptionDefeat: {
			"en": "Forced from the garden by fear, the companions gave up on their wish.",
		},
		descriptionVictory: {
			"en": "Overcoming fear, the companions passed through the garden, and made their wish.",
		},
		characters: 2,
		id: "GARDEN",
		random: false,
		rooms: [
			[roomData.BUILTIN_DEMO_00, roomData.BUILTIN_DEMO_01, roomData.BUILTIN_DEMO_02],
			[roomData.BUILTIN_DEMO_10, roomData.BUILTIN_DEMO_11, roomData.BUILTIN_DEMO_12],
			[roomData.BUILTIN_DEMO_20, roomData.BUILTIN_DEMO_21, roomData.BUILTIN_DEMO_22]
		],
		title: {
			"en": "The Garden",
		},
		timeLimit: 40,
		victory: [[2, 2]],
	};
	adventureData[adventure.id] = adventure;
}
