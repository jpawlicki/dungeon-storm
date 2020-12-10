let tileSize = 64;
let angle = Math.PI * .4;
let yShortening = Math.sin(angle);
let zShortening = Math.cos(angle);

function transformSurface(origin, element) {
	element.setAttribute("transform", "translate(" + origin[0] + "," + origin[1] + ") scale(1, " + yShortening + ") rotate(45, 0, 0)");
	return element;
}

// rank, file, height
function getTilePoints(i, j, h) {
	return [
		getTilePoint(i, j, h, 0),
		getTilePoint(i, j, h, 1),
		getTilePoint(i, j, h, 2),
		getTilePoint(i, j, h, 3)];
}

// rank, file, height, corner
// Tile corners:
//       0
//      /\
//   3 /  \ 
//     \  / 1
//      \/
//      2
// TODO: replace with getTileCorners
function getTilePoint(i, j, h, c) {
	let ox = (j - i) * Math.sqrt(2) / 2 * tileSize;
	let oy = (j + i) * Math.sqrt(2) / 2 * yShortening * tileSize - h * tileSize / 2 * zShortening;
	if (c == 0) return [ox, oy];
	if (c == 1) return [ox + Math.sqrt(2) / 2 * tileSize, oy + Math.sqrt(2) / 2 * yShortening * tileSize];
	if (c == 2) return [ox, oy + Math.sqrt(2) * yShortening * tileSize];
	else return [ox - Math.sqrt(2) / 2 * tileSize, oy + Math.sqrt(2) / 2 * yShortening * tileSize]
}

// Returns an array of 4 points.
// Tile corners:
//       0
//      /\
//   3 /  \ 
//     \  / 1
//      \/
//      2
function getTileCorners(pos) {
	return getTilePoints(pos[0], pos[1], gameState.currentState.fortress.getTile(pos).height);
}

// Returns the midpoint of the tile's edge.
// Tile edges:
//    3 /\ 0
//     /  \ 
//     \  / 
//    2 \/ 1
function getTileEdgeCenter(pos, facing) {
	let points = getTilePoints(pos[0], pos[1], gameState.currentState.fortress.getTile(pos).height);
	let p1 = points[facing];
	let p2 = points[(facing + 1) % 4];
	return [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2];
}

// position
function getTileCenter(pos) {
	let h = gameState.currentState.fortress.getTile(pos).height;
	return [getTilePoint(pos[0], pos[1], h, 0)[0], getTilePoint(pos[0], pos[1], h, 1)[1]];
}

function setupSvg(currentState) {
	let fortress = currentState.fortress;
	let h = [];
	let width = (fortress.tiles.length + 1) * tileSize * Math.sqrt(2);
	let height = (fortress.tiles[1].length + 1) * tileSize * yShortening * Math.sqrt(2);

	function createTile(asset, pos) {
		let g = document.createElementNS("http://www.w3.org/2000/svg", "g");
		let tile = document.createElementNS("http://www.w3.org/2000/svg", "image");
		tile.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "assets/" + asset);
		tile.setAttribute("width", tileSize);
		tile.setAttribute("height", tileSize);
		g.appendChild(tile);

		let points = [
			"0,0",
			tileSize + ",0",
			tileSize + "," + tileSize,
			"0," + tileSize
		];
		for (let i = 0; i < 4; i++) {
			let quad = document.createElementNS("http://www.w3.org/2000/svg", "path");
			quad.setAttribute("fill", "transparent");
			quad.addEventListener("mouseover", () => mouseOverTile(pos, i));
			quad.addEventListener("click", () => clickOnTile(pos, i));
			quad.setAttribute("d", "M" + points[i] + "L" + points[(i + 1) % 4] + "L" + tileSize / 2 + "," + tileSize / 2 + "Z");
			g.appendChild(quad);
		}

		let shade = document.createElementNS("http://www.w3.org/2000/svg", "rect");
		shade.setAttribute("opacity", 0.3);
		shade.setAttribute("width", tileSize);
		shade.setAttribute("height", tileSize);
		shade.setAttribute("fill", "#000");
		shade.style.pointerEvents = "none";
		g.appendChild(shade);
		return g;
	}

	let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	svg.setAttribute("viewBox", -width / 2 + " " + -tileSize + " " + width + " " + height);
	svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
	svg.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");

	for (let i = 0; i < fortress.tiles.length; i++) {
		h[i] = [];
		for (let j = 0; j < fortress.tiles[i].length; j++) {
			h[i][j] = fortress.tiles[i][j].height;
		}
	}

	// Add one more row and column of height -1.
	h[h.length] = [];
	for (let i = 0; i < h.length; i++) h[i][h[i].length] = -1;
	for (let j = 0; j < h[0].length; j++) h[h.length - 1][j] = -1;

	for (let i = 0; i < h.length - 1; i++) {
		for (let j = 0; j < h[i].length - 1; j++) {
			svg.appendChild(transformSurface(getTilePoint(i, j, h[i][j], 0), createTile(fortress.tiles[i][j].decoration, [i, j])));

			if (h[i+1][j] < h[i][j]) { // Add left (i) wall.
				let tile = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
				let points = [
					getTilePoint(i, j, h[i][j], 3),
					getTilePoint(i, j, h[i][j], 2),
					getTilePoint(i+1, j, h[i+1][j], 1),
					getTilePoint(i+1, j, h[i+1][j], 0),
				];
				tile.setAttribute("points", points.map((p) => p[0] + "," + p[1]).join(" "));
				tile.setAttribute("fill", "rgb(16, 16, 16)");
				svg.appendChild(tile);
			}
			if (h[i][j+1] < h[i][j]) { // Add right (j) wall.
				let tile = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
				let points = [
					getTilePoint(i, j, h[i][j], 2),
					getTilePoint(i, j, h[i][j], 1),
					getTilePoint(i, j+1, h[i][j+1], 0),
					getTilePoint(i, j+1, h[i][j+1], 3),
				];
				tile.setAttribute("points", points.map((p) => p[0] + "," + p[1]).join(" "));
				tile.setAttribute("fill", "rgb(48, 48, 48)");
				svg.appendChild(tile);
			}
		}
	}
	
	for (let unit of currentState.units) {
		let g = document.createElementNS("http://www.w3.org/2000/svg", "g");
		unit.registerActor(new UnitActor(unit, g, fortress));
		svg.appendChild(g);
	}

	let overlay = document.createElementNS("http://www.w3.org/2000/svg", "g");
	overlay.setAttribute("id", "clickContextGroup");
	svg.appendChild(overlay);

	return svg;
}

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
	// bloodied: The bloodied overlay
	// statActors[]
	// moveActor
	// selectionActor
	// fortress: the fortress

	// The unit this actor is for, and an SVG group to manage its position.
	constructor(unit, g, fortress) {
		this.unit = unit;
		this.fortress = fortress;
		this.group = g;
		let plane = document.createElementNS("http://www.w3.org/2000/svg", "g");
		this.edges = document.createElementNS("http://www.w3.org/2000/svg", "g");
		let portraitimg = document.createElementNS("http://www.w3.org/2000/svg", "image");
		portraitimg.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "assets/portraits/" + unit.portrait);
		portraitimg.setAttribute("clip-path", "circle()");
		portraitimg.setAttribute("width", 34);
		portraitimg.setAttribute("height", 34);
		portraitimg.setAttribute("x", -17);
		let porty = Math.pow(2 * tileSize * tileSize, .5) / 2 * yShortening - 17;
		portraitimg.setAttribute("y", porty);

		this.bloodied = document.createElementNS("http://www.w3.org/2000/svg", "path");
		this.bloodied.style.opacity = 0;
		this.bloodied.style.transition = "opacity 0.5s cubic-bezier(0, 2, 1, -1)";
		this.bloodied.setAttribute("d", "M-17 " + (porty + 17) + "A17 13 0 0 0 17 " + (porty + 17) + "A17 19 0 0 1 -17 " + (porty + 17));
		this.bloodied.setAttribute("fill", "#8a0303");


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
		g.appendChild(portraitimg);
		g.appendChild(this.bloodied);
		let loc = getTilePoint(this.unit.pos[0], this.unit.pos[1], this.fortress.tiles[this.unit.pos[0]][this.unit.pos[1]].height, 0);

		g.setAttribute("transform", "translate(" + loc[0] + "," + loc[1] + ")");
		g.style.transition = "transform 0.3s, opacity 0.5s cubic-bezier(0, 2, 1, -1)";
		g.setAttribute("id", "unit_" + unit.id);
		g.style.pointerEvents = "none";
		g.style.opacity = 1.0;

		this.moveActor = new MovePipsActor(this.unit, this.group);
		this.selectActor = new SelectionActor(this);
	}

	update() {
		this.edges.setAttribute("transform", "rotate(" + (90 * this.unit.facing) + "," + (tileSize / 2) + "," + (tileSize / 2) + ")");
		let loc = getTilePoint(this.unit.pos[0], this.unit.pos[1], this.fortress.tiles[this.unit.pos[0]][this.unit.pos[1]].height, 0);
		this.group.setAttribute("transform", "translate(" + loc[0] + "," + loc[1] + ")");
		this.group.style.opacity = this.unit.state == Unit.State.DEFEATED ? 0 : 1;
		this.moveActor.update();
		this.bloodied.style.opacity = this.unit.state == Unit.State.BLOODIED ? 1 : 0;
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
		g.style.transform = "translate(0px,33px) scale(0.9)";
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
		for (let i = 0; i < this.diamonds.length; i++) {
			this.diamonds[i].style.transform = MovePipsActor.getTransform(i, this.unit.actionPoints > i);
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
