{
	let adventure = {
		description: {
			"en": "This short adventure will teach you how to play. Choose two characters by clicking on their portraits, then click the play button to venture forth!",
		},
		descriptionDefeat: {
			"en": "Forced from the garden by fear, the girl and her dog gave up on their wish.\n\nWhen you are defeated, the adventure stops and you must choose the next one. Your characters are scarred by their experiences, and permanently lose a random ability. However, new characters join your cast, and if you cleared enough rooms, you may unlock additional character types.\n\nCharacters who have lost too many abilities to be useful can be retired. When characters retire, they teach another character in your cast, expanding that character's learnable abilities, and making room for new characters.",
		},
		descriptionVictory: {
			"en": "Overcoming fear, the girl and her dog passed through the garden, and made their wish.\n\nWhen you clear the final room of an adventure, the adventure is over and you must choose the next one. Additionally, new characters may join your cast. If you cleared enough rooms, you may unlock additional character types.\n\nYou may also choose to retire characters. Retired characters teach other characters in your cast, allowing them to learn the abilities that the retiring character knows, and are replaced by new characters.",
		},
		characters: 2,
		id: "A_GIRL_AND_HER_DOG",
		random: false,
		rooms: [
			[roomData.BUILTIN_DEMO_00, roomData.BUILTIN_DEMO_01, roomData.BUILTIN_DEMO_00],
			[roomData.BUILTIN_DEMO_10, roomData.BUILTIN_DEMO_00, roomData.BUILTIN_DEMO_00],
			[roomData.BUILTIN_DEMO_00, roomData.BUILTIN_DEMO_00, roomData.BUILTIN_DEMO_00]
		],
		title: {
			"en": "A Girl and Her Dog (Tutorial)",
		},
		victory: [[2, 2]],
	};
	adventureData[adventure.id] = adventure;
}
