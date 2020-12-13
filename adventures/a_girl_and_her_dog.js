{
	let adventure = {
		description: {
			"en": "This short adventure will teach you how to play. Choose two characters by clicking on their portraits, then click the play button to venture forth!",
		},
		characterPool: [
			"Wisher",
			"Dog",
		],
		characters: 2,
		id: "A_GIRL_AND_HER_DOG",
		random: false,
		rooms: [
			[roomData.BUILTIN_DEMO, roomData.BUILDIN_DEMO],
			[roomData.BUILTIN_DEMO, roomData.BUILTIN_DEMO]
		],
		title: {
			"en": "A Girl and Her Dog (Tutorial)",
		},
	};
	adventureData[adventure.id] = adventure;
}
