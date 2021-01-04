class Util {
	static makeAbilitySvg(ability, known, descElement, hostileContext = false) {
		let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		svg.setAttribute("viewBox", "0 0 24 24");
		let d = document.createElementNS("http://www.w3.org/2000/svg", "path");
		d.setAttribute("d", ability.icon);
		svg.appendChild(d);
		let details = ability.details.slice();
		if (!known) details.push("!NOTLEARNED");
		if (descElement != undefined) {
			let info = () => {
				descElement.innerHTML = "";
				descElement.appendChild(expandAbilityDetails(details, hostileContext));
			};
			svg.addEventListener("mouseover", info);
			svg.addEventListener("click", info);
		}
		svg.setAttribute("class", known ? "abilityKnown" : "abilityLearned");
		return svg;
	}

	static makeCap(container) {
		let d = document.createElementNS("http://www.w3.org/2000/svg", "path");
		d.setAttribute("d", "M12,3L1,9L12,15L21,10.09V17H23V9ZM5,13.18V17.18L12,21L19,17.18V13.18L12,17L5,13.18Z");
		d.setAttribute("fill", "currentColor");
		container.appendChild(d);
	}

	static makePlus(container) {
		let d = document.createElementNS("http://www.w3.org/2000/svg", "path");
		d.setAttribute("d", "M12,3A9,9 0 0,0 3,12A9,9 0 0,0 12,21A9,9 0 0,0 21,12C21,11.5 20.96,11 20.87,10.5C20.6,10 20,10 20,10H18V9C18,8 17,8 17,8H15V7C15,6 14,6 14,6H13V4C13,3 12,3 12,3M9.5,6A1.5,1.5 0 0,1 11,7.5A1.5,1.5 0 0,1 9.5,9A1.5,1.5 0 0,1 8,7.5A1.5,1.5 0 0,1 9.5,6M6.5,10A1.5,1.5 0 0,1 8,11.5A1.5,1.5 0 0,1 6.5,13A1.5,1.5 0 0,1 5,11.5A1.5,1.5 0 0,1 6.5,10M11.5,11A1.5,1.5 0 0,1 13,12.5A1.5,1.5 0 0,1 11.5,14A1.5,1.5 0 0,1 10,12.5A1.5,1.5 0 0,1 11.5,11M16.5,13A1.5,1.5 0 0,1 18,14.5A1.5,1.5 0 0,1 16.5,16H16.5A1.5,1.5 0 0,1 15,14.5H15A1.5,1.5 0 0,1 16.5,13M11,16A1.5,1.5 0 0,1 12.5,17.5A1.5,1.5 0 0,1 11,19A1.5,1.5 0 0,1 9.5,17.5A1.5,1.5 0 0,1 11,16Z");
		d.setAttribute("fill", "currentColor");
		container.appendChild(d);
	}

	static makeCup(container) {
		let d = document.createElementNS("http://www.w3.org/2000/svg", "path");
		d.setAttribute("d", "M18 2C17.1 2 16 3 16 4H8C8 3 6.9 2 6 2H2V11C2 12 3 13 4 13H6.2C6.6 15 7.9 16.7 11 17V19.08C8 19.54 8 22 8 22H16C16 22 16 19.54 13 19.08V17C16.1 16.7 17.4 15 17.8 13H20C21 13 22 12 22 11V2H18M6 11H4V4H6V11M20 11H18V4H20V11Z");
		d.setAttribute("fill", "currentColor");
		container.appendChild(d);
	}

	static makeUnlock(container) {
		let d = document.createElementNS("http://www.w3.org/2000/svg", "path");
		d.setAttribute("d", "M7,14A2,2 0 0,1 5,12A2,2 0 0,1 7,10A2,2 0 0,1 9,12A2,2 0 0,1 7,14M12.65,10C11.83,7.67 9.61,6 7,6A6,6 0 0,0 1,12A6,6 0 0,0 7,18C9.61,18 11.83,16.33 12.65,14H17V18H21V14H23V10H12.65Z");
		d.setAttribute("fill", "currentColor");
		container.appendChild(d);
	}

	static makeCharacter(container) {
		let d = document.createElementNS("http://www.w3.org/2000/svg", "path");
		d.setAttribute("d", "M15,14C12.33,14 7,15.33 7,18V20H23V18C23,15.33 17.67,14 15,14M6,10V7H4V10H1V12H4V15H6V12H9V10M15,12A4,4 0 0,0 19,8A4,4 0 0,0 15,4A4,4 0 0,0 11,8A4,4 0 0,0 15,12Z");
		d.setAttribute("fill", "currentColor");
		container.appendChild(d);
	}

	static makeTime(container) {
		let d = document.createElementNS("http://www.w3.org/2000/svg", "path");
		d.setAttribute("d", "M6,2V8H6V8L10,12L6,16V16H6V22H18V16H18V16L14,12L18,8V8H18V2H6Z");
		d.setAttribute("fill", "currentColor");
		container.appendChild(d);
	}

	static makeQuestion(container) {
		let d = document.createElementNS("http://www.w3.org/2000/svg", "path");
		d.setAttribute("d", "M10,19H13V22H10V19M12,2C17.35,2.22 19.68,7.62 16.5,11.67C15.67,12.67 14.33,13.33 13.67,14.17C13,15 13,16 13,17H10C10,15.33 10,13.92 10.67,12.92C11.33,11.92 12.67,11.33 13.5,10.67C15.92,8.43 15.32,5.26 12,5A3,3 0 0,0 9,8H6A6,6 0 0,1 12,2Z");
		d.setAttribute("fill", "currentColor");
		container.appendChild(d);
	}

	// Shuffles array in-place.
	static shuffle(array) {
		for (var i = array.length - 1; i > 0; i--) {
			var j = Math.floor(Math.random() * (i + 1));
			var temp = array[i];
			array[i] = array[j];
			array[j] = temp;
		}
	}
}
