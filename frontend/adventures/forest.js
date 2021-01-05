{
	let adventure = {
		description: {
			"en": "Three journey into the forest...",
		},
		descriptionDefeat: {
			"en": "Forced from the forest by fear, the companions gave up on their wish.",
		},
		descriptionVictory: {
			"en": "Overcoming fear, the companions passed through the forest, and made their wish.",
		},
		characters: 3,
		id: "FOREST",
		random: false,
		rooms: [
			[roomData.FOREST_00, roomData.FOREST_01, "FOREST_RR"       , roomData.FOREST_03, "FOREST_RR"       ],
			[null              , "FOREST_RR"       , "FOREST_RR"       , null              , roomData.FOREST_14],
			["FOREST_RR"       , "FOREST_RR"       , "FOREST_RR"       , null              , "FOREST_RR"       ],
			["FOREST_RR"       , roomData.FOREST_31, null              , null              , roomData.FOREST_34],
			["FOREST_RR"       , "FOREST_RR"       , "FOREST_RR"       , roomData.FOREST_43, roomData.FOREST_44],
		],
		title: {
			"en": "The Forest",
		},
		timeLimit: 30,
		victory: [[4, 4]],
	};
	adventureData[adventure.id] = adventure;
}
