// A UnitActor is composed of:
//   A background highlight.
//   A portrait.
//   A portrait overlay (to indicate state)
//   Four stat-face actors (one per side)
//   A movement pips actor.
class UnitActor {
	// unit
	// group
	// edges: The edges group
	// statActors[]
	// selectionActor
	// portraitActor
	// fortress: the fortress

	// The unit this actor is for, and an SVG group to manage its position.
	constructor(unit, g, fortress) {
		this.unit = unit;
		this.fortress = fortress;
		this.group = g;
		let plane = document.createElementNS("http://www.w3.org/2000/svg", "g");
		this.edges = document.createElementNS("http://www.w3.org/2000/svg", "g");
		let portrait = document.createElementNS("http://www.w3.org/2000/svg", "g");
		this.portraitActor = new PortraitActor(this.unit, portrait);
		portrait.style.transform = "translate(0, " + (Math.pow(2 * tileSize * tileSize, .5) / 2 * yShortening) + "px)";

		this.statActors = [
			new StatFaceActor(this, 0),
			new StatFaceActor(this, 1),
			new StatFaceActor(this, 2),
			new StatFaceActor(this, 3)
		];

		this.edges.setAttribute("transform", "rotate(" + (90 * unit.facing) + "," + (tileSize / 2) + "," + (tileSize / 2) + ")");
		this.edges.style.transition = "transform 0.3s";

		let shadow = document.createElementNS("http://www.w3.org/2000/svg", "g");
		// Shadow colors could indicate team alignment.
		// Border around portrait image?
		shadow.innerHTML = `
			<defs>
				<radialGradient id="unitShadow">
					<stop offset="30%" stop-color="white"/>
					<stop offset="100%" stop-color="white" stop-opacity="0"/>
				</radialGradient>
			</defs>
			<circle fill="url(#unitShadow)" cx="32" cy="32" r="32"/>
		`;
		plane.appendChild(shadow);
		plane.appendChild(this.edges);
		plane.style.pointerEvents = "none";
		transformSurface([0, 0], plane);

		g.appendChild(plane);
		g.appendChild(portrait);
		let loc = getTilePoint(this.unit.pos[0], this.unit.pos[1], this.fortress.tiles[this.unit.pos[0]][this.unit.pos[1]].height, 0);

		g.setAttribute("transform", "translate(" + loc[0] + "," + loc[1] + ")");
		g.style.transition = "transform 0.3s, opacity 0.5s cubic-bezier(0, 2, 1, -1)";
		g.setAttribute("id", "unit_" + unit.id);
		g.style.pointerEvents = "none";
		g.style.opacity = 1.0;

		this.selectActor = new SelectionActor(this);

		this.update();
	}

	update() {
		this.edges.setAttribute("transform", "rotate(" + (90 * this.unit.facing) + "," + (tileSize / 2) + "," + (tileSize / 2) + ")");
		let loc = getTilePoint(this.unit.pos[0], this.unit.pos[1], this.fortress.tiles[this.unit.pos[0]][this.unit.pos[1]].height, 0);
		this.group.setAttribute("transform", "translate(" + loc[0] + "," + loc[1] + ")");
		this.group.style.opacity = this.unit.state == Unit.State.DEFEATED ? 0 : 1;
		this.portraitActor.update();
		for (let sf of this.statActors) sf.update();
	}

	select() {
		this.selectActor.select();
	}

	deselect() {
		this.selectActor.deselect();
	}
}

// A StatFaceActor has a series of circles indicating the strength of a unit on a face.
// The circles are colored according to threat.
class StatFaceActor {
	// unitActor
	// facing
	// strengthPips[]
	
	constructor(unitActor, facing) {
		this.unitActor = unitActor;
		this.facing = facing;
		this.strengthPips = [];
		for (let i = 0; i < 10; i++) {
			let eg = document.createElementNS("http://www.w3.org/2000/svg", "g");
			let c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
			c.setAttribute("cy", 9);
			c.style.transition = "r 0.4s, cx 0.4s";
			this.strengthPips.push(c);
			eg.appendChild(c);
			eg.setAttribute("transform", "rotate(" + (90 * facing) + "," + (tileSize / 2) + "," + (tileSize / 2) + ")");
			unitActor.edges.appendChild(eg);
		}
		this.update();
	}

	update() {
		let str = this.unitActor.unit.getStrength(this.unitActor.unit.facing + this.facing);
		let threat = this.unitActor.unit.getThreat(this.unitActor.unit.facing + this.facing);
		for (let i = 0; i < this.strengthPips.length; i++) {
			let p = this.strengthPips[i];
			p.setAttribute("class", threat ? "unitedge threat" : "unitedge");
			p.setAttribute("r", i < str ? 3 : 0);
			p.setAttribute("cx", tileSize / 2 + 8 * (i - str / 2.0 + 0.5));
		}
	}
}

// A MovePipsActor has a number of pips displaying action points available to a unit.
class MovePipsActor {
	// unitActor
	// diamonds[]

	static getTransform(i, active) {
		let x = (i % 2 == 0 ? 0 : 3);
		if (i >= 5) x = x - 11 - 3;
		else x += 11;
		return "translate(" + x + "px," + ((i % 5) * 6) + "px)" + "scale(" + (active ? "1" : "0") + ")";
	}

	constructor(unit, group) {
		this.unit = unit;
		this.diamonds = [];
		let MAX_ACTIONS = 10;
		let g = document.createElementNS("http://www.w3.org/2000/svg", "g");
		g.style.transform = "translate(0px,-12px) scale(0.9)";
		for (let i = 0; i < MAX_ACTIONS; i++) {
			let diamond = document.createElementNS("http://www.w3.org/2000/svg", "path");
			diamond.setAttribute("d", "M0,-6L3,0L0,6L-3,0Z");
			diamond.style.fill = "#fff";
			diamond.style.stroke = "#000";
			diamond.style.strokeWidth = "0.2";
			diamond.style.transition = "transform 1s";
			diamond.style.transform = MovePipsActor.getTransform(i, this.unit.actionPoints > i);
			this.diamonds.push(diamond);
			g.appendChild(diamond);
		}
		group.appendChild(g);
	}

	update() {
		let showNum = this.unit.state == Unit.State.DEFEATED ? 0 : this.unit.actionPoints;
		for (let i = 0; i < this.diamonds.length; i++) {
			this.diamonds[i].style.transform = MovePipsActor.getTransform(i, showNum > i);
		}
	}
}

// A SelectionActor has a circle when selected.
class SelectionActor {
	// circle

	constructor(unitActor) {
		this.circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
		this.circle.style.visibility = "hidden";
		this.circle.setAttribute("class", "selection");
		this.circle.setAttribute("r", 17);
		this.circle.setAttribute("cx", "0");
		this.circle.setAttribute("cy", Math.pow(2 * tileSize * tileSize, .5) / 2 * yShortening);
		unitActor.group.appendChild(this.circle);
	}

	select() {
		this.circle.style.visibility = "visible";
	}

	deselect() {
		this.circle.style.visibility = "hidden";
	}
}

// A PortraitActor has a circular portrait and some overlays indicating state.
class PortraitActor {
	// unit
	// bloodied
	// defeated
	// moveActor

	constructor(unit, container) {
		this.unit = unit;
		let portraitimg = document.createElementNS("http://www.w3.org/2000/svg", "image");
		portraitimg.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "assets/portraits/" + unit.portrait);
		portraitimg.setAttribute("clip-path", "circle()");
		portraitimg.setAttribute("width", 34);
		portraitimg.setAttribute("height", 34);
		portraitimg.setAttribute("x", -17);
		portraitimg.setAttribute("y", -17);

		this.bloodied = document.createElementNS("http://www.w3.org/2000/svg", "path");
		this.bloodied.style.opacity = 0;
		this.bloodied.style.transition = "opacity 0.5s cubic-bezier(0, 2, 1, -1)";
		this.bloodied.setAttribute("d", "M-17 0A17 13 0 0 0 17 0A17 19 0 0 1 -17 0M0,8A6,6 0 0,1 -6,2C-6,-2 0,-8.75 0,-8.75C0,-8.25 6,-2 6,2A6,6 0 0,1 0,8Z");
		this.bloodied.setAttribute("fill", "#8a0303");

		this.defeated = document.createElementNS("http://www.w3.org/2000/svg", "path");
		this.defeated.style.opacity = 0;
		this.defeated.style.transition = "opacity 0.5s cubic-bezier(0, 2, 1, -1)";
		this.defeated.setAttribute("d", "M-17 -17L17 17M17 -17L-17 17");
		this.defeated.setAttribute("fill", "transparent");
		this.defeated.setAttribute("stroke", "#000");
		this.defeated.setAttribute("stroke-width", "4");
		this.defeated.setAttribute("clip-path", "circle()");

		container.appendChild(portraitimg);
		container.appendChild(this.bloodied);
		container.appendChild(this.defeated);
		this.moveActor = new MovePipsActor(this.unit, container);

		this.update();
	}

	update() {
		this.bloodied.style.opacity = this.unit.state == Unit.State.BLOODIED ? 1 : 0;
		this.defeated.style.opacity = this.unit.state == Unit.State.DEFEATED ? 1 : 0;
		this.moveActor.update();
	}
}
