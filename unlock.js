class Unlock {
	static CHARACTER = 0;
	static ADVENTURE = 1;

	static unlockData = [
		{type: Unlock.CHARACTER, value: "Dog", at: 0},
		{type: Unlock.CHARACTER, value: "Wisher", at: 0},
		{type: Unlock.CHARACTER, value: "Journeyman", at: 6},
		{type: Unlock.ADVENTURE, value: "FOREST", at: 20},
		{type: Unlock.CHARACTER, value: "Dancer", at: 26},
	];

	static getMaxUnlock() {
		return Unlock.unlockData.map(a => a.at).reduce((a, b) => Math.max(a, b));
	}
}
