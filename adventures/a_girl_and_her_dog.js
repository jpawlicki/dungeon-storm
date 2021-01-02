{
	let adventure = {
		description: {
			"en": "Two journey into the garden...",
		},
		descriptionDefeat: {
			"en": "Forced from the garden by fear, the girl and her dog gave up on their wish.",
		},
		descriptionVictory: {
			"en": "Overcoming fear, the girl and her dog passed through the garden, and made their wish.",
		},
		characters: 2,
		id: "A_GIRL_AND_HER_DOG",
		random: false,
		rooms: [
			[roomData.BUILTIN_DEMO_00, roomData.BUILTIN_DEMO_01, roomData.BUILTIN_DEMO_02],
			[roomData.BUILTIN_DEMO_10, roomData.BUILTIN_DEMO_11, roomData.BUILTIN_DEMO_12],
			[roomData.BUILTIN_DEMO_20, roomData.BUILTIN_DEMO_21, roomData.BUILTIN_DEMO_22]
		],
		title: {
			"en": "A Girl and Her Dog",
		},
		timeLimit: 40,
		victory: [[2, 2]],
	};
	adventureData[adventure.id] = adventure;
}
