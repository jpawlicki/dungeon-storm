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
		entry: [3, 3],
		id: "FAMILY",
		maxAbilities: 8,
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
		timeLimit: 10,
		unlocks: [],
		victory: [[0, 0], [0, 6], [6, 0], [6, 6]],
	};
	adventureData[adventure.id] = adventure;
}
