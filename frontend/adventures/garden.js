{
	let adventure = {
		description: {
			"en": "Two started in the garden...",
		},
		descriptionDefeat: {
			"en": "...but the garden terrified them.",
		},
		descriptionVictory: {
			"en": "...and the garden paths showed them the way to greater things.",
		},
		characters: 2,
		entry: [0, 0],
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
		unlocks: ["FOREST"],
		victory: [[2, 2]],
	};
	adventureData[adventure.id] = adventure;
}
