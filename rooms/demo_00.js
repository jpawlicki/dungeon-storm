{
	let room = {
		dependencies: [],
		difficulty: 0,
		entry: [1, 0],
		exit: [3, 3],
		id: "BUILTIN_DEMO_00",
		random: false,
		reward: {
			experience: 2,
			healing: 1,
		},
		tiles: [
			[{t: "portuguese1", h: 1}, {t: "portuguese2", h: 0}, {t: "portuguese2", h: 0}, {t: "portuguese1", h: 1}],
			[{t: "portuguese2", h: 0}, {t: "portuguese3", h: 0}, {t: "portuguese4", h: 0}, {t: "portuguese2", h: 0}],
			[{t: "portuguese2", h: 0}, {t: "portuguese4", h: 0}, {t: "portuguese3", h: 0}, {t: "portuguese2", h: 0}],
			[{t: "portuguese1", h: 1}, {t: "portuguese2", h: 0}, {t: "portuguese2", h: 0}, {t: "portuguese1", h: 1}],
		],
		units: [
			{
				type: unitData.Rat,
				facing: 3,
				pos: [2, 2],
				player: 1,
			},
			{
				type: unitData.Rat,
				facing: 0,
				pos: [1, 2],
				player: 1,
			},
		],
	};
	roomData[room.id] = room;
}
