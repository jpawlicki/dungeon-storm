{
	let room = {
		dependencies: [],
		difficulty: 0,
		entry: [0, 0],
		exit: [3, 3],
		id: "BUILTIN_DEMO_01",
		random: "",
		reward: {
			healing: 2,
		},
		tiles: [
			[{t: "portuguese1", h: 0}, {t: "portuguese2", h: 0}, {t: "portuguese2", h: 0}, {t: "portuguese1", h: 0}],
			[{t: "portuguese2", h: 0}, {t: "portuguese3", h: 1}, {t: "portuguese4", h: 1}, {t: "portuguese2", h: 0}],
			[{t: "portuguese2", h: 0}, {t: "portuguese4", h: 1}, {t: "portuguese3", h: 1}, {t: "portuguese2", h: 0}],
			[{t: "portuguese1", h: 0}, {t: "portuguese2", h: 0}, {t: "portuguese2", h: 0}, {t: "portuguese1", h: 0}],
		],
		units: [
			{
				type: "Statue",
				facing: 0,
				pos: [1, 2],
				player: 1,
			},
			{
				type: "Statue",
				facing: 3,
				pos: [2, 1],
				player: 1,
			},
		],
	};
	roomData[room.id] = room;
}
