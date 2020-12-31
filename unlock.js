class Unlock {
	static CHARACTER = 0;
	static ADVENTURE = 1;

	static unlockData = [
		{type: Unlock.CHARACTER, value: "Dog", at: 0},
		{type: Unlock.CHARACTER, value: "Wisher", at: 0},
		{type: Unlock.CHARACTER, value: "Journeyman", at: 5},
		{type: Unlock.CHARACTER, value: "Dancer", at: 22},
	];

	// Every 10 unlocks will unlock a random one from this set.
	static unlockDataRandom10 = [
	];
}
