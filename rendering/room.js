let tileSize = 64;
let angle = Math.PI * .4;
let yShortening = Math.sin(angle);
let zShortening = Math.cos(angle);
let assetPrefix = "";

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
	return getTilePoints(pos[0], pos[1], gameState.room.getTile(pos).height);
}

// Returns the midpoint of the tile's edge.
// Tile edges:
//    3 /\ 0
//     /  \ 
//     \  / 
//    2 \/ 1
function getTileEdgeCenter(pos, facing) {
	let points = getTilePoints(pos[0], pos[1], gameState.room.getTile(pos).height);
	let p1 = points[facing];
	let p2 = points[(facing + 1) % 4];
	return [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2];
}

// pos[]: The tile coordinates. If there is a third dimension, that is used instead of tile height.
function getTileCenter(pos) {
	let h = pos.length < 3 ? gameState.room.getTile(pos).height : pos[2];
	return [getTilePoint(pos[0], pos[1], h, 0)[0], getTilePoint(pos[0], pos[1], h, 1)[1]];
}

function setupRoomSvg(currentState) {
	let room = currentState.room;
	let h = [];
	let width = (room.tiles.length + 1) * tileSize * Math.sqrt(2);
	let height = (room.tiles[1].length + 1) * tileSize * yShortening * Math.sqrt(2);

	function createTile(asset, pos) {
		let g = document.createElementNS("http://www.w3.org/2000/svg", "g");
		let tile = document.createElementNS("http://www.w3.org/2000/svg", "image");
		tile.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", assetPrefix + "assets/" + asset);
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
			quad.addEventListener("mouseout", () => mouseOutTile());
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

	for (let i = 0; i < room.tiles.length; i++) {
		h[i] = [];
		for (let j = 0; j < room.tiles[i].length; j++) {
			h[i][j] = room.tiles[i][j].height;
		}
	}

	// Add one more row and column of height -1.
	h[h.length] = [];
	for (let i = 0; i < h.length; i++) h[i][h[i].length] = -1;
	for (let j = 0; j < h[0].length; j++) h[h.length - 1][j] = -1;

	for (let i = 0; i < h.length - 1; i++) {
		for (let j = 0; j < h[i].length - 1; j++) {
			svg.appendChild(transformSurface(getTilePoint(i, j, h[i][j], 0), createTile(room.tiles[i][j].decoration, [i, j])));

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
		unit.registerActor(new UnitActor(unit, g, room));
		svg.appendChild(g);
	}

	let sfx = document.createElementNS("http://www.w3.org/2000/svg", "g");
	sfx.setAttribute("id", "sfxGroup");
	svg.appendChild(sfx);

	let overlay = document.createElementNS("http://www.w3.org/2000/svg", "g");
	overlay.setAttribute("id", "clickContextGroup");
	svg.appendChild(overlay);

	return svg;
}

function showSplash(text) {
	let d = document.createElementNS("http://www.w3.org/2000/svg", "text");
	d.appendChild(document.createTextNode(text));
	d.setAttribute("text-anchor", "middle");
	d.style.fontSize = "300%";
	d.style.fill = "#fff";
	d.style.textShadow = "#000 -3px 3px 5px";
	document.querySelector("#mapDiv > svg").appendChild(d);
}
