{
	let adventure = {
		description: {
			"en": "Two undertook the ceremony...",
		},
		descriptionDefeat: {
			"en": "...but the ceremony was not what they expected.",
		},
		descriptionVictory: {
			"en": "...and through the ceremony, they were made whole.",
		},
		characters: 2,
		entry: [0, 0],
		id: "CEREMONY",
		maxAbilities: 6,
		onVictory: [Adventure.Consequence.CHARACTER_NOABILITY],
		onDefeat: [],
		rooms: [
			["CEREMONY_RR", "CEREMONY_RR", "CEREMONY_RR"],
			["CEREMONY_RR", "CEREMONY_RR", "CEREMONY_RR"],
			["CEREMONY_RR", "CEREMONY_RR", roomData.CEREMONY_BOSS]
		],
		title: {
			"en": "The Ceremony",
		},
		timeLimit: 5,
		unlocks: ["FAMILY"],
		victory: [[2, 2]],
	};
	adventureData[adventure.id] = adventure;
}
