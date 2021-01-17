{
	let adventure = {
		description: {
			"en": "Three journeyed into the wild, dark forest...",
		},
		descriptionDefeat: {
			"en": "...but the darkness of the forest overcame them.",
		},
		descriptionVictory: {
			"en": "...and in the forest, they discovered who they are and who they wish to be.",
		},
		characters: 3,
		entry: [0, 0],
		id: "FOREST",
		maxAbilities: 6,
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
		unlocks: ["CEREMONY"],
		victory: [[4, 4]],
	};
	adventureData[adventure.id] = adventure;
}
