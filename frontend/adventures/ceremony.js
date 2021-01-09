{
	let adventure = {
		description: {
			"en": "Two undertook the ceremony...",
		},
		descriptionDefeat: {
			"en": "But the ceremony was not what they expected.",
		},
		descriptionVictory: {
			"en": "And through the ceremony, they were made whole.",
		},
		characters: 2,
		id: "CEREMONY",
		rooms: [
			["CEREMONY_RR", "CEREMONY_RR", "CEREMONY_RR"],
			["CEREMONY_RR", "CEREMONY_RR", "CEREMONY_RR"],
			["CEREMONY_RR", "CEREMONY_RR", roomData.CEREMONY_BOSS]
		],
		title: {
			"en": "The Ceremony",
		},
		timeLimit: 4,
		victory: [[2, 2]],
	};
	adventureData[adventure.id] = adventure;
}
