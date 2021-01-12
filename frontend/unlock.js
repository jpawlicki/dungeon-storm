class Unlock {
	static CHARACTER = 0;
	static ADVENTURE = 1;

	static unlockData = [
		{type: Unlock.CHARACTER, value: "Dog", at: 0},
		{type: Unlock.CHARACTER, value: "Wisher", at: 0},
		{type: Unlock.CHARACTER, value: "Journeyman", at: 11},
		{type: Unlock.CHARACTER, value: "Dancer", at: 31},
		{type: Unlock.CHARACTER, value: "Archer", at: 61},
		{type: Unlock.CHARACTER, value: "Berserker", at: 101},
		{type: Unlock.CHARACTER, value: "Thief", at: 151},
		{type: Unlock.CHARACTER, value: "Commander", at: 211},
	];

	static getMaxUnlock() {
		return Unlock.unlockData.map(a => a.at).reduce((a, b) => Math.max(a, b));
	}
}
