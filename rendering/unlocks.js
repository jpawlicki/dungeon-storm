class UnlockTrack {
	// g
	// start
	// steps
	// icons[]
	// bursts[]

	constructor(start, buffer, container) {
		this.icons = [];
		this.bursts = [];
		this.start = start;
		this.steps = 0;

		let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		svg.setAttribute("viewBox", "-2 -2 300 6");
		svg.style.height = "100%";
		svg.style.overflowY = "visible";

		let unlockable = new Set();
		for (let u of Unlock.unlockData) {
			unlockable.add(u.at);
		}

		let g = document.createElementNS("http://www.w3.org/2000/svg", "g");
		this.g = g;
		g.style.transform = "translate(0px, 0px)";
		svg.appendChild(g);
		for (let i = 1; i < Math.min(200 + buffer, Unlock.getMaxUnlock() + 1 - start); i++) {
			let v = start + i;
			if (!unlockable.has(v)) {
				let c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
				c.setAttribute("r", v % 10 == 0 ? 0.6 : v % 5 == 0 ? 0.4 : 0.3);
				c.setAttribute("fill", "rgba(255, 255, 255, 0.4)");
				c.setAttribute("cx", i * 4);
				this.icons.push(c);
				g.appendChild(c);
				if (v % 10 == 0) {
					let c = document.createElementNS("http://www.w3.org/2000/svg", "text");
					c.appendChild(document.createTextNode(v));
					c.setAttribute("text-anchor", "middle");
					c.setAttribute("font-size", "2px");
					c.style.dominantBaseline = "middle";
					c.setAttribute("fill", "#fff");
					c.setAttribute("x", i * 4);
					c.setAttribute("y", 2);
					g.appendChild(c);
				}
			} else {
				let c = document.createElementNS("http://www.w3.org/2000/svg", "path");
				c.setAttribute("d", "M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z");
				c.setAttribute("fill", "#fff");
				c.setAttribute("data-bursts", "true");
				c.style.transform = "translate(" + (i * 4) + "px, 0px) scale(0.15) translate(-12px, -12px)";
				g.appendChild(c);
				this.icons.push(c);

				let burst = document.createElementNS("http://www.w3.org/2000/svg", "circle");
				burst.setAttribute("r", "0");
				burst.setAttribute("fill", "#fc0");
				burst.style.transition = "r 1s linear, opacity 1s linear";
				svg.appendChild(burst);
				this.bursts.push(burst);
			}
		}

		let key = document.createElementNS("http://www.w3.org/2000/svg", "g");
		Util.makeUnlock(key);
		key.style.transform = "scale(0.15) translate(-12px, -12px)";
		key.querySelector("path").setAttribute("fill", "#fff");
		svg.appendChild(key);

		container.appendChild(svg);
	}

	// Animates the step. If it strikes an unlock, animates the lock burst. 
	step(time) {
		let icon = this.icons[this.steps];
		let burst = undefined;
		if (icon.getAttribute("data-bursts") == "true") burst = this.bursts.pop();
		this.steps++;
		this.g.style.transition = "transform " + time + "s linear";
		this.g.style.transform = "translate(" + -this.steps * 4 + "px, 0px)";
		window.setTimeout(
			() => {
				icon.style.display = "none";
				if (burst != undefined) {
					burst.setAttribute("r", 10);
					burst.style.opacity = 0;
				}
			},
			time * 1000);
	}
}
