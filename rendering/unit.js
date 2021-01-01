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
	// room: the room

	// The unit this actor is for, and an SVG group to manage its position.
	constructor(unit, g, room) {
		this.unit = unit;
		this.room = room;
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
		let loc = getTilePoint(this.unit.pos[0], this.unit.pos[1], this.room.tiles[this.unit.pos[0]][this.unit.pos[1]].height, 0);

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
		let loc = getTilePoint(this.unit.pos[0], this.unit.pos[1], this.room.tiles[this.unit.pos[0]][this.unit.pos[1]].height, 0);
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

	static POSITIONS = [
		[0, 2],
		[0, 1],
		[1, 2],
		[0, 0],
		[2, 2],
		[1, 1],
		[1, 0],
		[2, 1],
		[2, 0],
		[-1, 1],
		[1, 3],
		[1, -1],
		[3, 1],
		[2, -1],
		[3, 0],
		[2, -2],
		[4, 0],
	];

	static getTransform(i, active) {
		let x = MovePipsActor.POSITIONS[i][1] - MovePipsActor.POSITIONS[i][0];
		let y = MovePipsActor.POSITIONS[i][1] + MovePipsActor.POSITIONS[i][0];
		return "translate(" + (x * 3 + 11) + "px," + (y * 6) + "px)" + "scale(" + (active ? "1" : "0") + ")";
	}

	constructor(unit, group) {
		this.unit = unit;
		this.diamonds = [];
		let g = document.createElementNS("http://www.w3.org/2000/svg", "g");
		g.style.transform = "translate(0px,-12px) scale(0.9)";
		for (let i = 0; i < MovePipsActor.POSITIONS.length; i++) {
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
	// frightened
	// defeated
	// moveActor

	constructor(unit, container) {
		this.unit = unit;
		let portraitimg = document.createElementNS("http://www.w3.org/2000/svg", "image");
		portraitimg.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", assetPrefix + "assets/portraits/" + unit.portrait);
		portraitimg.setAttribute("clip-path", "circle()");
		portraitimg.setAttribute("width", 34);
		portraitimg.setAttribute("height", 34);
		portraitimg.setAttribute("x", -17);
		portraitimg.setAttribute("y", -17);

		this.frightened = document.createElementNS("http://www.w3.org/2000/svg", "path");
		this.frightened.style.opacity = 0;
		this.frightened.style.transition = "opacity 0.5s cubic-bezier(0, 2, 1, -1)";
		this.frightened.setAttribute("d", "M-14,-8.66C-14,-11.33 -10,-15.83 -10,-15.83C-10,-15.83 -6,-11.66 -6,-8.66A4,4 0 0,1 -14,-8.66Z");
		this.frightened.setAttribute("fill", "#cdf");
		this.frightened.setAttribute("stroke", "#000");
		this.frightened.setAttribute("stroke-width", "1");

		this.defeated = document.createElementNS("http://www.w3.org/2000/svg", "path");
		this.defeated.style.opacity = 0;
		this.defeated.style.transition = "opacity 0.5s cubic-bezier(0, 2, 1, -1)";
		this.defeated.setAttribute("d", "M-17 -17L17 17M17 -17L-17 17");
		this.defeated.setAttribute("fill", "transparent");
		this.defeated.setAttribute("stroke", "#000");
		this.defeated.setAttribute("stroke-width", "4");
		this.defeated.setAttribute("clip-path", "circle()");

		container.appendChild(portraitimg);
		container.appendChild(this.frightened);
		container.appendChild(this.defeated);
		this.moveActor = new MovePipsActor(this.unit, container);

		this.update();
	}

	update() {
		this.frightened.style.opacity = this.unit.state == Unit.State.BLOODIED ? 1 : 0;
		this.defeated.style.opacity = this.unit.state == Unit.State.DEFEATED ? 1 : 0;
		this.moveActor.update();
	}
}
