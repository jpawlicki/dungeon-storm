// SFX_FRAMEPERIOD is the period (in milliseconds) between rendering frames.
// CSS transitions will increase the framerate to the browser's rendering rate in most linear cases, but not for complex effects.
const SFX_FRAMEPERIOD = 16;

class SpecialEffect {
	// a[]: color at i=0, assumed to be RGBA or HSLA.
	// b[]: color at i=1, assumed to be RGBA or HSLA.
	// i: an interpolation value from 0 to 1.
	static interpolateColor(a, b, i) {
		return [
			a[0] * (1 - i) + b[0] * i,
			a[1] * (1 - i) + b[1] * i,
			a[2] * (1 - i) + b[2] * i,
			a[3] * (1 - i) + b[3] * i,
		];
	}

	// loc[]: The location to place the particle, in tile positions (with height), e.g. [1, 2, 3] is tile (1, 2) (center) with height 3.
	// angle: The initial rotation of the path in radians.
	// velocity[]: The velocity for the effect to move, in tile positions per second.
	// angVelocity: The angular velocity of the particle, in radians per second clockwise.
	// path: The shape of the particle.
	// yShorten: How much yShortening to apply to the path post-rotation as a number from 0 to 1. Flat particles on the plane of the map should use 1. 
	// colors[]: An array of color fills, each of which is an array [R, G, B, A]. RGB should be 0-255, A should be 0-1.
	// stops[]: When to hit each color fill, in seconds. At the final stop, the particle is removed. Should be a strictly ascending sequence.
	static particle(loc, angle, velocity, angVelocity, path, yShorten, colors, stops) {
		let g = document.createElementNS("http://www.w3.org/2000/svg", "g");
		let particle = document.createElementNS("http://www.w3.org/2000/svg", "path");
		let newPoint = getTileCenter(loc);
		g.style.transition = "transform " + SFX_FRAMEPERIOD + "ms linear";
		particle.style.transition = "fill " + SFX_FRAMEPERIOD + "ms linear";
		particle.style.pointerEvents = "none";
		particle.setAttribute("d", path);
		g.appendChild(particle);

		for (let i = 0; i < stops[stops.length - 1] * 1000; i += SFX_FRAMEPERIOD) {
			window.setTimeout(() => {
				let prevStop = 0;
				for (let j = 0; j < stops.length; j++) {
					if (stops[j] * 1000 <= i) prevStop = j;
				}
				let progress = (i / 1000 - stops[prevStop]) / (stops[prevStop + 1] - stops[prevStop]);
				let color = SpecialEffect.interpolateColor(colors[prevStop], colors[prevStop + 1], progress);
				let newAngle = angle + angVelocity * i / 1000;
				let newPoint = getTileCenter([loc[0] + velocity[0] * i / 1000, loc[1] + velocity[1] * i / 1000, loc[2] + velocity[2] * i / 1000]);
				g.style.transform = "translate(" + newPoint[0] + "px, " + newPoint[1] + "px) scaleY(" + (yShorten * yShortening + 1 - yShorten) + ") rotate(" + newAngle + "rad)";
				particle.style.fill = "rgba(" + color[0] + ", " + color[1] + ", " + color[2] + ", " + color[3] + ")";
				if (i == 0) document.getElementById("sfxGroup").appendChild(g);
			}, i);
		}
		window.setTimeout(() => {
			if (g.parentNode != null) g.parentNode.removeChild(g);
		}, stops[stops.length - 1] * 1000);
	}

	static abilityUse(unit, ability) {
		let p = [unit.pos[0], unit.pos[1], gameState.room.getTile(unit.pos).height + 2];
		SpecialEffect.particle(p, 0, [0, 0, 4], 0, ability.icon, 0, [[255, 255, 255, 1], [255, 255, 255, 1], [255, 255, 255, 0]], [0, 1.5, 2]);
	}

	static attackClash(c1, c2, flow1, flow2) {
		let midpoint = [(c1[0] + c2[0]) / 2, (c1[1] + c2[1]) / 2, (gameState.room.getTile(c1).height + gameState.room.getTile(c2).height) / 2];
		SpecialEffect.particle(midpoint, 0, [0, 0, 0], 0, "M-18 0C0 0 0 0 0 18C0 0 0 0 18 0C0 0 0 0 0 -18C 0 0 0 0 -18 0Z", 0, [[255, 255, 255, 0.7], [255, 255, 128, 1], [255, 128, 128, 0]], [0, 0.1, 0.2]);

		if (flow1) {
			let dir = [c1[0] - c2[0], c1[1] - c2[1], gameState.room.getTile(c1).height - gameState.room.getTile(c2).height];
			for (let i = 0; i < 10; i++) {
				let offset = [midpoint[0] + Math.random() * .6 - .3, midpoint[1] + Math.random() * .6 - .3, midpoint[2]];
				let speed = Math.random() * 0.6 + 0.7;
				let velocity = [dir[0] * speed, dir[1] * speed, dir[2] * speed];
				let angle = -Math.PI / 4 -Math.atan2(velocity[1], velocity[0]);
				SpecialEffect.particle(offset, angle, velocity, 0, "M-3 0L2 -2L0 0L2 2Z", 0, [[255, 200, 200, 0.7], [255, 150, 150, 1], [255, 64, 64, 0]], [0, 0.1, 0.5]);
			}
		}

		if (flow2) {
			let dir = [c2[0] - c1[0], c2[1] - c1[1], gameState.room.getTile(c2).height - gameState.room.getTile(c1).height];
			for (let i = 0; i < 10; i++) {
				let offset = [midpoint[0] + Math.random() * .6 - .3, midpoint[1] + Math.random() * .6 - .3, midpoint[2]];
				let speed = Math.random() * 0.6 + 0.7;
				let velocity = [dir[0] * speed, dir[1] * speed, dir[2] * speed];
				let angle = -Math.PI / 4 -Math.atan2(velocity[1], velocity[0]);
				SpecialEffect.particle(offset, angle, velocity, 0, "M-3 0L2 -2L0 0L2 2Z", 0, [[255, 200, 200, 0.7], [255, 150, 150, 1], [255, 64, 64, 0]], [0, 0.1, 0.5]);
			}
		}
	}

	static arrowShot(from, to, retreats) {
		let flightTime = 0.2;
		from = [from[0], from[1], gameState.room.getTile(from).height];
		let velocity = [(to[0] - from[0]) / flightTime, (to[1] - from[1]) / flightTime, (gameState.room.getTile(to).height - from[2]) / flightTime];
		SpecialEffect.particle(
			from,
			-Math.PI / 4 -Math.atan2(velocity[1], velocity[0]),
			velocity,
			0,
			"M6.45,5.45L1,0L6.45,-5.45L7.86,-4.04L4.83,-1H20V1H4.83L7.86,4.04L6.45,5.45Z",
			1,
			[[255, 255, 255, 1], [255, 255, 255, 1], [255, 255, 255, 0]],
			[0, !retreats ? flightTime : flightTime - 0.01, !retreats ? flightTime + 0.001 : flightTime + 0.001 - 0.01]);
		if (!retreats) {
			window.setTimeout(() => {
				flightTime -= 0.01;
				SpecialEffect.particle(
					[from[0] + velocity[0] * flightTime, from[1] + velocity[1] * flightTime, from[2] + velocity[2] * flightTime],
					-Math.PI / 4 -Math.atan2(velocity[1], velocity[0]),
					[-velocity[0] / 20 + Math.random() * .2, -velocity[1] / 20 + Math.random() * .2, velocity[2] / 15],
					Math.random() * 16 - 8,
					"M6.45,5.45L1,0L6.45,-5.45L7.86,-4.04L4.83,-1H20V1H4.83L7.86,4.04L6.45,5.45Z",
					1,
					[[255, 255, 255, 1], [255, 255, 255, 0.8], [255, 255, 255, 0]],
					[0, 0.2, 0.35]);
			}, 95);
		}
	}
}
