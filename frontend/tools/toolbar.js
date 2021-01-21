class Toolbar extends HTMLElement {
	connectedCallback() {
		let shadow = this.attachShadow({mode: "open"});
		shadow.innerHTML = `
			<style>
				:host {
					background-color: #012;
					display: flex;
					justify-content: space-around;
				}
				a {
					color: #aaf;
					text-decoration: none;
				}
				a:hover {
					color: #fff;
					text-decoration: underline;
				}
			</style>
		`;
		let pages = [
			{"title": "Game", "href": "../index.html"},
			{"title": "Editor", "href": "roomeditor.html"},
			{"title": "Database", "href": "database.html"},
			{"title": "Statistics", "href": "balancedata.html"},
			{"title": "Viewer", "href": "roomviewer.html"},
		];
		for (let p of pages) {
			if (window.location.pathname.endsWith(p.href)) {
				let a = document.createElement("span");
				a.appendChild(document.createTextNode(p.title));
				shadow.appendChild(a);
			} else {
				let a = document.createElement("a");
				a.appendChild(document.createTextNode(p.title));
				a.setAttribute("href", p.href);
				shadow.appendChild(a);
			}
		}
	}
}
customElements.define("tools-toolbar", Toolbar);
