{
	let adventure = {
		description: {
			"en": "Challenges created by other players can be overcome...",
		},
		descriptionDefeat: {
			"en": "...but sometimes they cannot be overcome.",
		},
		descriptionVictory: {
			"en": "...and community challenges often yield rewards.",
		},
		characters: 2,
		entry: [0, 0],
		id: "COMMUNITY",
		maxAbilities: 7,
		random: false,
		rooms: [
			["COMMUNITY_ANY", "COMMUNITY_ANY", "COMMUNITY_ANY", "COMMUNITY_ANY"],
			["COMMUNITY_ANY", "COMMUNITY_ANY", "COMMUNITY_ANY", "COMMUNITY_ANY"],
			["COMMUNITY_ANY", "COMMUNITY_ANY", "COMMUNITY_ANY", "COMMUNITY_ANY"],
			["COMMUNITY_ANY", "COMMUNITY_ANY", "COMMUNITY_ANY", "COMMUNITY_ANY"],
		],
		title: {
			"en": "The Community",
		},
		timeLimit: 12,
		unlocks: [],
		victory: [[3, 3]],
	};
	adventureData[adventure.id] = adventure;
}
