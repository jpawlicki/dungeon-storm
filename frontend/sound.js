class Sound {
	// Static members:
	//   enabled
	//   listeners[]
	//   *: audio elements

	static setEnabled(enabled) {
		Sound.enabled = enabled;
		Persistence.saveSoundPref(enabled);
		for (let l of Sound.listeners) l();
	}

	static addEnabledListener(f) {
		Sound.listeners.push(f);
	}

	static action() {
		if (!Sound.enabled) return;
		Sound.effects["action"].play();
	}

	static turnBegin() {
		if (!Sound.enabled) return;
		Sound.effects["turn_begin"].play();
	}

	static attack(success, enemyContext) {
		if (!Sound.enabled) return;
		Sound.effects[
			success && enemyContext ? "enemy_attack_success" :
			!success && enemyContext ? "enemy_attack_fail" :
			success && !enemyContext ? "attack_success" :
			"attack_fail"
		].play();
	}
	
	static roomClear(success) {
		if (!Sound.enabled) return;
		Sound.effects[success ? "room_clear" : "room_defeat"].play();
	}
}
Sound.enabled = false;
Sound.effects = {};
Sound.listeners = [];
Sound.effects["action"] = new Audio("assets/sound/action.flac");
Sound.effects["attack_fail"] = new Audio("assets/sound/attack_fail.flac");
Sound.effects["attack_success"] = new Audio("assets/sound/attack_success.flac");
Sound.effects["enemy_attack_fail"] = new Audio("assets/sound/enemy_attack_fail.flac");
Sound.effects["enemy_attack_success"] = new Audio("assets/sound/enemy_attack_success.flac");
Sound.effects["room_clear"] = new Audio("assets/sound/room_clear.flac");
Sound.effects["room_defeat"] = new Audio("assets/sound/room_defeat.flac");
Sound.effects["turn_begin"] = new Audio("assets/sound/turnbegin.flac");
