{
	let room = {
		dependencies: [],
		difficulty: 0,
		entry: [0, 2],
		exit: [3, 3],
		id: "BUILTIN_DEMO_10",
		random: false,
		reward: {
			experience: 2,
			healing: 0,
		},
		tiles: [
			[{t: "portuguese3", h: 1}, {t: "portuguese1", h: 2}, {t: "portuguese5", h: 0}, {t: "portuguese7", h: 0}, {t: "portuguese1", h: 2}, {t: "portuguese3", h: 1}],
			[{t: "portuguese4", h: 0}, {t: "portuguese5", h: 0}, {t: "portuguese7", h: 0}, {t: "portuguese2", h: 0}, {t: "portuguese7", h: 0}, {t: "portuguese5", h: 0}],
			[{t: "portuguese5", h: 0}, {t: "portuguese1", h: 2}, {t: "portuguese1", h: 2}, {t: "portuguese3", h: 1}, {t: "portuguese1", h: 2}, {t: "portuguese7", h: 0}],
			[{t: "portuguese7", h: 0}, {t: "portuguese1", h: 2}, {t: "portuguese3", h: 1}, {t: "portuguese1", h: 2}, {t: "portuguese1", h: 2}, {t: "portuguese2", h: 0}],
			[{t: "portuguese2", h: 0}, {t: "portuguese4", h: 0}, {t: "portuguese5", h: 0}, {t: "portuguese7", h: 0}, {t: "portuguese2", h: 0}, {t: "portuguese4", h: 0}],
			[{t: "portuguese1", h: 2}, {t: "portuguese3", h: 1}, {t: "portuguese7", h: 0}, {t: "portuguese2", h: 0}, {t: "portuguese3", h: 1}, {t: "portuguese1", h: 2}],
		],
		units: [
			{
				type: "Rat",
				facing: 3,
				pos: [5, 1],
				player: 1,
			},
			{
				type: "Rat",
				facing: 0,
				pos: [5, 4],
				player: 1,
			},
			{
				type: "Rat",
				facing: 0,
				pos: [3, 3],
				player: 1,
			},
		],
	};
	roomData[room.id] = room;
}
