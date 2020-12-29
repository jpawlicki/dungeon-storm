class Unlock {
	static CHARACTER = 0;
	static ADVENTURE = 1;

	static unlockData = [
		{type: Unlock.CHARACTER, value: "Dog", at: 0},
		{type: Unlock.CHARACTER, value: "Wisher", at: 0},
//		{type: Unlock.CHARACTER, value: "", at: 5},
	];

	// Every 10 unlocks will unlock a random one from this set.
	static unlockDataRandom10 = [
	];
}
