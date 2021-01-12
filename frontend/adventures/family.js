{
	let adventure = {
		description: {
			"en": "Four were a family...",
		},
		descriptionDefeat: {
			"en": "...but the family was broken.",
		},
		descriptionVictory: {
			"en": "...and the family grew.",
		},
		characters: 4,
		entry: [2, 2],
		id: "FAMILY",
		rooms: [
			["FAMILY_RR", "FAMILY_RR", "FAMILY_RR", "FAMILY_RR", "FAMILY_RR", "FAMILY_RR", "FAMILY_RR"],
			["FAMILY_RR", "FAMILY_RR", "FAMILY_RR", "FAMILY_RR", "FAMILY_RR", "FAMILY_RR", "FAMILY_RR"],
			["FAMILY_RR", "FAMILY_RR", "FAMILY_RR", "FAMILY_RR", "FAMILY_RR", "FAMILY_RR", "FAMILY_RR"],
			["FAMILY_RR", "FAMILY_RR", "FAMILY_RR", "FAMILY_RR", "FAMILY_RR", "FAMILY_RR", "FAMILY_RR"],
			["FAMILY_RR", "FAMILY_RR", "FAMILY_RR", "FAMILY_RR", "FAMILY_RR", "FAMILY_RR", "FAMILY_RR"],
			["FAMILY_RR", "FAMILY_RR", "FAMILY_RR", "FAMILY_RR", "FAMILY_RR", "FAMILY_RR", "FAMILY_RR"],
			["FAMILY_RR", "FAMILY_RR", "FAMILY_RR", "FAMILY_RR", "FAMILY_RR", "FAMILY_RR", "FAMILY_RR"]
		],
		title: {
			"en": "The Family",
		},
		timeLimit: 5,
		unlocks: [],
		victory: [[0, 0], [0, 6], [6, 0], [6, 6]],
	};
	adventureData[adventure.id] = adventure;
}
