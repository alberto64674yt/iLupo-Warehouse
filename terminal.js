// Contenido completo para terminal.js

(function() {
    // Objeto principal que contendrá toda la lógica y el estado del terminal
    const Terminal = {
        isOpen: false,
        dom: {},
        commandHistory: [],
        historyIndex: -1,
        
        // Simulación de un sistema de archivos basado en tu proyecto
        fileSystem: {
            'proyectos.json': { type: 'file', content: 'Lista de todos los proyectos.' },
            'info.json': { type: 'file', content: 'Información sobre el autor.' },
            'index.html': { type: 'file', content: 'Página principal.' },
            'favicon': {
                type: 'dir',
                content: {
                    'favicon.ico': { type: 'file' },
                    'favicon.svg': { type: 'file' },
                    'apple-touch-icon.png': { type: 'file' },
                    'logo.svg': { type: 'file' }
                }
            }
        },
        currentPath: '/',

        // --- MÉTODOS DE INICIALIZACIÓN Y UI ---

        init: function() {
            this.createUI();
            this.attachEventListeners();
            this.print('Bienvenido a iLupo Warehouse Shell [Versión 2.0]');
            this.print('Escribe "help" para ver la lista de comandos disponibles.');
            this.toggle(); // Mostrar al inicializar
        },

        createUI: function() {
            const container = document.createElement('div');
            container.id = 'terminal-container';
            container.innerHTML = `
                <div id="terminal-output"></div>
                <div id="terminal-input-line">
                    <span id="terminal-prompt">ilupo@warehouse:~$&nbsp;</span>
                    <input type="text" id="terminal-input" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">
                </div>
            `;
            document.body.appendChild(container);

            this.dom.container = container;
            this.dom.output = document.getElementById('terminal-output');
            this.dom.input = document.getElementById('terminal-input');
            this.dom.prompt = document.getElementById('terminal-prompt');
        },

        toggle: function() {
            this.isOpen = !this.isOpen;
            this.dom.container.classList.toggle('visible', this.isOpen);
            if (this.isOpen) {
                this.dom.input.focus();
            }
        },
        
        // --- MANEJO DE COMANDOS ---

        attachEventListeners: function() {
            this.dom.input.addEventListener('keydown', e => {
                if (e.key === 'Enter') {
                    this.processCommand(e.target.value);
                    e.target.value = '';
                } else if (e.key === 'ArrowUp') {
                    this.navigateHistory('up');
                } else if (e.key === 'ArrowDown') {
                    this.navigateHistory('down');
                }
            });
            this.dom.container.addEventListener('click', () => this.dom.input.focus());
        },

        processCommand: function(inputValue) {
            if (!inputValue.trim()) return;

            this.print(`${this.dom.prompt.innerHTML}${inputValue}`);
            this.commandHistory.unshift(inputValue);
            this.historyIndex = -1;

            const [command, ...args] = inputValue.trim().split(/\s+/);
            
            if (this.commands[command]) {
                this.commands[command](args);
            } else {
                this.print(`Error: comando no encontrado "${command}".`);
            }
            this.dom.container.scrollTop = this.dom.container.scrollHeight;
        },

        print: function(message) {
            const line = document.createElement('div');
            line.innerHTML = message.replace(/ /g, '&nbsp;');
            this.dom.output.appendChild(line);
        },

        navigateHistory: function(direction) {
            if (direction === 'up' && this.historyIndex < this.commandHistory.length - 1) {
                this.historyIndex++;
            } else if (direction === 'down' && this.historyIndex > 0) {
                this.historyIndex--;
            } else if (direction === 'down' && this.historyIndex <= 0) {
                this.historyIndex = -1;
                this.dom.input.value = '';
                return;
            }
            this.dom.input.value = this.commandHistory[this.historyIndex] || '';
        },
        
        // Objeto que contiene todos los comandos disponibles
        commands: {
            help: () => {
                Terminal.print('--- Comandos Disponibles ---');
                Terminal.print('**help**: Muestra esta lista de ayuda.');
                Terminal.print('**ls**: Lista el contenido del directorio actual.');
                Terminal.print('**cd [dir]**: Cambia de directorio (ej: "cd favicon", "cd ..").');
                Terminal.print('**open [id]**: Abre la página de un proyecto (ej: "open ilupo-crosshair-editor").');
                Terminal.print('**view [file]**: Muestra una imagen (ej: "view favicon/logo.svg").');
                Terminal.print('**about**: Muestra la información de la página "Sobre Mí".');
                Terminal.print('**exec [easter_egg]**: Ejecuta un Easter egg (ej: "exec wolf_howl").');
                Terminal.print('**date**: Muestra la fecha y hora actual.');
                Terminal.print('**echo [...text]**: Repite el texto introducido.');
                Terminal.print('**clear**: Limpia la pantalla del terminal.');
                Terminal.print('**exit**: Cierra el terminal.');
            },
            ls: () => {
                const node = Terminal.getNodeFromPath(Terminal.currentPath);
                if (node && node.type === 'dir') {
                    Object.keys(node.content).forEach(key => {
                        Terminal.print(node.content[key].type === 'dir' ? `&lt;DIR&gt; ${key}` : `      ${key}`);
                    });
                } else {
                    Terminal.print('Error: no se puede listar el contenido de un archivo.');
                }
            },
            cd: (args) => {
                // Lógica de cambio de directorio (simplificada)
                // Esto se puede expandir para manejar rutas complejas
                Terminal.print('Funcionalidad "cd" todavía en construcción.');
            },
            open: (args) => {
                if (!args.length) return Terminal.print('Error: especifica el ID de un proyecto.');
                window.location.href = `proyecto.html?id=${args[0]}`;
            },
            view: (args) => {
                if (!args.length) return Terminal.print('Error: especifica la ruta de una imagen.');
                // Lógica para mostrar la imagen en un lightbox
                Terminal.print(`Mostrando imagen: ${args[0]}... (Funcionalidad de lightbox pendiente)`);
            },
            about: () => {
                fetch('info.json')
                    .then(r => r.json())
                    .then(data => Terminal.print(data.contenido.replace(/\n/g, '<br>')))
                    .catch(() => Terminal.print('Error al cargar info.json.'));
            },
            exec: (args) => {
                if (!args.length) return Terminal.print('Error: especifica qué Easter egg ejecutar (ej: wolf_howl, boykisser).');
                if (window.easterEggFunctions && typeof window.easterEggFunctions[args[0]] === 'function') {
                    window.easterEggFunctions[args[0]]();
                } else {
                    Terminal.print('Error: Easter egg no encontrado o no es ejecutable.');
                }
            },
            date: () => {
                Terminal.print(new Date().toLocaleString('es-ES'));
            },
            echo: (args) => {
                Terminal.print(args.join(' '));
            },
            clear: () => {
                Terminal.dom.output.innerHTML = '';
            },
            exit: () => {
                Terminal.toggle();
            }
        },

        getNodeFromPath: function(path) {
            if (path === '/') return this.fileSystem;
            const parts = path.split('/').filter(p => p);
            let currentNode = this.fileSystem;
            for (const part of parts) {
                if (currentNode.type === 'dir' && currentNode.content[part]) {
                    currentNode = currentNode.content[part];
                } else {
                    return null;
                }
            }
            return currentNode;
        }
    };

    // Exponemos el objeto Terminal al scope global para poder llamarlo desde index.html
    window.Terminal = Terminal;

})();