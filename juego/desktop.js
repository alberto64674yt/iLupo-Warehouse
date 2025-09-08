// =================================================================================
//  DESKTOP.JS - v1.0 - Lógica del "Sistema Operativo"
// =================================================================================

class DesktopManager {
    constructor() {
        this.openWindows = {}; // Rastrear ventanas abiertas por appId
        this.activeWindow = null;
        this.highestZIndex = 50;
        this.init();
    }

    init() {
        this.renderDesktopIcons();
        this.startClock();
        this.attachEventListeners();
    }

    startClock() {
        const update = () => {
            const now = new Date();
            dom.clock.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        };
        update();
        setInterval(update, 1000);
    }

    renderDesktopIcons() {
        gameData.apps.forEach(app => {
            const icon = document.createElement('div');
            icon.className = 'desktop-icon';
            icon.dataset.appId = app.id;
            icon.innerHTML = `<i class="fas ${app.icon}"></i><span>${app.title}</span>`;
            icon.addEventListener('dblclick', () => this.openApp(app.id));
            dom.desktopIcons.appendChild(icon);
        });
    }

    openApp(appId) {
        if (this.openWindows[appId]) {
            this.focusApp(this.openWindows[appId]);
            return;
        }

        const appData = gameData.apps.find(app => app.id === appId);
        if (!appData) return;

        const windowEl = document.createElement('div');
        windowEl.className = 'app-window';
        windowEl.dataset.appId = appId;
        
        windowEl.style.left = `${Math.random() * 200 + 50}px`;
        windowEl.style.top = `${Math.random() * 100 + 50}px`;

        windowEl.innerHTML = `
            <div class="window-header">
                <span class="window-title"><i class="fas ${appData.icon}"></i> ${appData.title}</span>
                <div class="window-controls">
                    <button class="window-close"><i class="fas fa-times"></i></button>
                </div>
            </div>
            <div class="window-body"></div>
        `;

        dom.desktop.appendChild(windowEl);
        this.openWindows[appId] = windowEl;
        this.focusApp(windowEl);

        // Renderizar el contenido específico de la app
        const contentRenderer = window[appData.renderer];
        if (typeof contentRenderer === 'function') {
            contentRenderer(windowEl.querySelector('.window-body'));
        } else {
            windowEl.querySelector('.window-body').innerHTML = `<p>Error: La función ${appData.renderer} no existe.</p>`;
        }

        // Añadir listeners para la ventana
        this.makeDraggable(windowEl);
        windowEl.querySelector('.window-close').addEventListener('click', () => this.closeApp(appId));
        windowEl.addEventListener('mousedown', () => this.focusApp(windowEl));
    }

    closeApp(appId) {
        const windowEl = this.openWindows[appId];
        if (windowEl) {
            windowEl.remove();
            delete this.openWindows[appId];
        }
    }

    focusApp(windowEl) {
        if (this.activeWindow === windowEl) return;

        this.highestZIndex++;
        windowEl.style.zIndex = this.highestZIndex;
        
        if (this.activeWindow) {
            this.activeWindow.classList.remove('active');
        }
        
        windowEl.classList.add('active');
        this.activeWindow = windowEl;
    }

    makeDraggable(windowEl) {
        const header = windowEl.querySelector('.window-header');
        let offsetX, offsetY;

        const onMouseMove = (e) => {
            windowEl.style.left = `${e.clientX - offsetX}px`;
            windowEl.style.top = `${e.clientY - offsetY}px`;
        };

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        header.addEventListener('mousedown', (e) => {
            // No arrastrar si se hace clic en los botones
            if (e.target.closest('.window-controls')) return;
            
            offsetX = e.clientX - windowEl.offsetLeft;
            offsetY = e.clientY - windowEl.offsetTop;

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });
    }

    attachEventListeners() {
        dom.startButton.addEventListener('click', () => {
            dom.startMenu.classList.toggle('hidden');
            dom.startButton.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
            if (!dom.startMenu.classList.contains('hidden') && !e.target.closest('#start-menu') && !e.target.closest('#start-button')) {
                dom.startMenu.classList.add('hidden');
                dom.startButton.classList.remove('active');
            }
        });

        dom.shutdownButton.addEventListener('click', () => {
            if (confirm("¿Seguro que quieres irte a dormir?")) {
                nextDay(); // Llama a la función global de main.js
            }
        });
    }
}