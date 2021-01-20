class SettingsMenu extends HTMLElement {
	// shadow

	connectedCallback() {
		let shadow = this.attachShadow({mode: "open"});
		this.shadow = shadow;
		shadow.innerHTML = `
			<style>
				:host {
					display: flex;
					flex-direction: column;
					align-items: flex-end;
					border-radius: 0 0 0 1em;
					background: #000;
					padding: 0.1em;
				}
				svg {
					cursor: pointer;
					width: 2.5em;
					height; 2.5em;
				}
				svg path {
					fill: #bbb;
					transition: fill 0.2s;
				}
				svg:hover path {
					fill: #fff;
				}
				#expand {
					display: none;
				}
				#soundOn {
					visibility: hidden;
				}
				#fullScreenOff {
					visibility: hidden;
				}
			</style>
			<svg id="toggle" viewBox="0 0 24 24">
		    <path d="M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z" />
			</svg>
			<div id="expand">
				<svg id="roomEditor" viewBox="0 0 24 24">
					<path d="M9,3L3.36,4.9C3.16,4.97 3,5.15 3,5.38V20.5A0.5,0.5 0 0,0 3.5,21C3.55,21 3.6,21 3.66,20.97L9,18.9L13.16,20.36C13.06,19.92 13,19.46 13,19C13,18.77 13,18.54 13.04,18.3L9,16.9V5L15,7.1V14.56C16.07,13.6 17.47,13 19,13C19.7,13 20.37,13.13 21,13.36V3.5A0.5,0.5 0 0,0 20.5,3H20.34L15,5.1L9,3M18,15V18H15V20H18V23H20V20H23V18H20V15H18Z" />
				</svg>
				<svg id="fullscreen" viewBox="0 0 24 24">
					<path id="fullscreenOn" d="M5,5H10V7H7V10H5V5M14,5H19V10H17V7H14V5M17,14H19V19H14V17H17V14M10,17V19H5V14H7V17H10Z" />
					<path id="fullscreenOff" d="M14,14H19V16H16V19H14V14M5,14H10V19H8V16H5V14M8,5H10V10H5V8H8V5M19,8V10H14V5H16V8H19Z" />
				</svg>
				<svg id="sound" viewBox="0 0 24 24">
					<path id="soundOn" d="M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.84 14,18.7V20.77C18,19.86 21,16.28 21,12C21,7.72 18,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16C15.5,15.29 16.5,13.76 16.5,12M3,9V15H7L12,20V4L7,9H3Z" />
					<path id="soundOff" d="M12,4L9.91,6.09L12,8.18M4.27,3L3,4.27L7.73,9H3V15H7L12,20V13.27L16.25,17.53C15.58,18.04 14.83,18.46 14,18.7V20.77C15.38,20.45 16.63,19.82 17.68,18.96L19.73,21L21,19.73L12,10.73M19,12C19,12.94 18.8,13.82 18.46,14.64L19.97,16.15C20.62,14.91 21,13.5 21,12C21,7.72 18,4.14 14,3.23V5.29C16.89,6.15 19,8.83 19,12M16.5,12C16.5,10.23 15.5,8.71 14,7.97V10.18L16.45,12.63C16.5,12.43 16.5,12.21 16.5,12Z" />
				</svg>
				<svg id="erase" viewBox="0 0 24 24">
			    <path d="M8.2 5L6.2 3H17L21 7V17.8L12.2 9H15V5H8.2M22.11 21.46L20.84 22.73L19.1 21C19.07 21 19.03 21 19 21H5C3.9 21 3 20.11 3 19V5C3 4.97 3 4.93 3 4.9L1.11 3L2.39 1.73L22.11 21.46M7.11 9L5 6.89V9H7.11M14.89 16.78L11.22 13.11C9.95 13.46 9 14.61 9 16C9 17.66 10.34 19 12 19C13.39 19 14.54 18.05 14.89 16.78Z" />
				</svg>
			</div>
		`;
		shadow.getElementById("toggle").addEventListener("click", () => {
			shadow.getElementById("expand").style.display = shadow.getElementById("expand").style.display == "block" ? "none" : "block";
		});
		
		shadow.getElementById("erase").addEventListener("click", () => {
			if (window.confirm("Delete your game data and start over?")) {
				Persistence.deleteAll();
				window.location.reload();
			}
		});

		shadow.getElementById("sound").addEventListener("click", () => {
			soundEnabled = !soundEnabled; // Declared in ui.js.
			shadow.getElementById("soundOn").style.visibility = !soundEnabled ? "hidden" : "visible";
			shadow.getElementById("soundOff").style.visibility = soundEnabled ? "hidden" : "visible";
		});

		shadow.getElementById("roomEditor").addEventListener("click", () => {
			window.open("tools/roomeditor.html", "_blank");
		});

		shadow.getElementById("fullscreen").addEventListener("click", () => {
			if (document.fullscreenElement) {
				document.exitFullscreen();
				shadow.getElementById("fullscreenOn").style.visibility = "visible";
				shadow.getElementById("fullscreenOff").style.visibility = "hidden";
			} else {
				document.querySelector("body").requestFullscreen();
				shadow.getElementById("fullscreenOn").style.visibility = "hidden";
				shadow.getElementById("fullscreenOff").style.visibility = "visible";
			}
		});

		document.addEventListener("fullscreenchange", () => {
			shadow.getElementById("fullscreenOn").style.visibility = document.fullscreenElement ? "hidden" : "visible";
			shadow.getElementById("fullscreenOff").style.visibility = document.fullscreenElement ? "visible" : "hidden";
		});
	}
}
customElements.define("settings-menu", SettingsMenu);
