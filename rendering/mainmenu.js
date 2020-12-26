class MainMenu extends HTMLElement {
	connectedCallback() {
		let shadow = this.attachShadow({mode: "open"});
		this.shadow = shadow;
		shadow.innerHTML = `
			<style>
				:host {
					display: grid;
					grid-template-rows: min-content min-content 1fr;
					grid-template-columns: min-content 1fr;
					color: #fff;
					height: 100%;
				}
			</style>
		`;
	}
}
customElements.define("main-menu", MainMenu);
