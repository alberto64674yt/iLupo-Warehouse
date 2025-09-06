// Contenido completo, corregido y definitivo v2.3 para terminal.js

(function() {
    const Terminal = {
        isOpen: false,
        dom: {},
        commandHistory: [],
        historyIndex: -1,
        
        // CORRECCIÓN: Se reestructura para tener un nodo raíz con tipo 'dir'
        fileSystem: {
            type: 'dir',
            content: {
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
            }
        },
        currentPath: '/',

        init: function() {
            this.createUI();
            this.attachEventListeners();
            this.initResizer();
            this.print('Bienvenido a iLupo Warehouse Shell [Versión 2.3 - Estable]');
            this.print('Escribe "help" para ver la lista de comandos disponibles.');
            this.toggle();
        },

        createUI: function() {
            const container = document.createElement('div');
            container.id = 'terminal-container';
            container.innerHTML = `
                <div id="terminal-resizer"></div>
                <div id="terminal-output"></div>
                <div id="terminal-input-line">
                    <span id="terminal-prompt">ilupo@warehouse:~$&nbsp;</span>
                    <input type="text" id="terminal-input" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">
                </div>
            `;
            document.body.appendChild(container);
            this.dom = {
                container: container,
                output: document.getElementById('terminal-output'),
                input: document.getElementById('terminal-input'),
                prompt: document.getElementById('terminal-prompt'),
                resizer: document.getElementById('terminal-resizer')
            };
        },
        
        initResizer: function() {
            const resizer = this.dom.resizer;
            const container = this.dom.container;
            let startY, startHeight;
            const doDrag = (e) => {
                let newHeight = startHeight - (e.clientY - startY);
                if (newHeight < 50) newHeight = 50;
                if (newHeight > window.innerHeight - 20) newHeight = window.innerHeight - 20;
                container.style.height = `${newHeight}px`;
                container.style.maxHeight = 'none';
            };
            const stopDrag = () => {
                window.removeEventListener('mousemove', doDrag);
                window.removeEventListener('mouseup', stopDrag);
            };
            resizer.addEventListener('mousedown', (e) => {
                e.preventDefault();
                startY = e.clientY;
                startHeight = container.offsetHeight;
                window.addEventListener('mousemove', doDrag);
                window.addEventListener('mouseup', stopDrag);
            });
        },

        toggle: function() {
            this.isOpen = !this.isOpen;
            this.dom.container.classList.toggle('visible', this.isOpen);
            if (this.isOpen) {
                this.dom.input.focus({ preventScroll: true });
            }
        },
        
        attachEventListeners: function() {
            this.dom.input.addEventListener('keydown', e => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.processCommand(e.target.value);
                    e.target.value = '';
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    this.navigateHistory('up');
                } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    this.navigateHistory('down');
                }
            });
            this.dom.container.addEventListener('click', () => this.dom.input.focus());
        },

        processCommand: function(inputValue) {
            if (!inputValue.trim()) {
                this.print(`${this.dom.prompt.innerHTML}`);
                return;
            }
            this.print(`${this.dom.prompt.innerHTML}${inputValue.replace(/</g, "&lt;").replace(/>/g, "&gt;")}`);
            this.commandHistory.unshift(inputValue);
            this.historyIndex = -1;
            const [command, ...args] = inputValue.trim().split(/\s+/);
            if (this.commands[command]) {
                this.commands[command](args);
            } else {
                this.print(`Error: comando no encontrado "${command}".`);
            }
            this.dom.output.scrollTop = this.dom.output.scrollHeight;
        },

        print: function(message) {
            const line = document.createElement('div');
            line.innerHTML = message.replace(/ /g, '&nbsp;');
            this.dom.output.appendChild(line);
        },

        navigateHistory: function(direction) {
            if (direction === 'up' && this.historyIndex < this.commandHistory.length - 1) { this.historyIndex++; }
            else if (direction === 'down' && this.historyIndex > 0) { this.historyIndex--; }
            else if (direction === 'down' && this.historyIndex <= 0) {
                this.historyIndex = -1;
                this.dom.input.value = '';
                return;
            }
            this.dom.input.value = this.commandHistory[this.historyIndex] || '';
        },
        
        commands: {
            help: function() {
                Terminal.print('--- Comandos Disponibles ---');
                Terminal.print('**help**: Muestra esta lista de ayuda.');
                Terminal.print('**ls [ruta]**: Lista el contenido del directorio actual o de una [ruta].');
                Terminal.print('**cd [ruta]**: Cambia de directorio (ej: "cd favicon", "cd ..", "cd /").');
                Terminal.print('**open [id]**: Abre la página de un proyecto en una **nueva pestaña**.');
                Terminal.print('**view [file]**: Muestra una imagen (ej: "view favicon/logo.svg").');
                Terminal.print('**about**: Muestra la información de la página "Sobre Mí".');
                Terminal.print('**exec [easter_egg]**: Ejecuta un Easter egg (ej: "exec wolf_howl").');
                Terminal.print('**date**: Muestra la fecha y hora actual.');
                Terminal.print('**echo [...text]**: Repite el texto introducido.');
                Terminal.print('**clear**: Limpia la pantalla del terminal.');
                Terminal.print('**exit**: Cierra el terminal.');
            },
            ls: function(args) {
                const path = args[0] ? Terminal.resolvePath(args[0]) : Terminal.currentPath;
                const node = Terminal.getNodeFromPath(path);
                if (node && node.type === 'dir') {
                    Object.keys(node.content).forEach(key => {
                        Terminal.print(node.content[key].type === 'dir' ? `&lt;DIR&gt; ${key}` : `      ${key}`);
                    });
                } else if (node && node.type === 'file') {
                    Terminal.print(`Error: "${path}" es un archivo, no un directorio.`);
                } else {
                    Terminal.print(`Error: la ruta "${path}" no existe.`);
                }
            },
            cd: function(args) {
                const newPath = args[0] || '/';
                const targetPath = Terminal.resolvePath(newPath);
                const node = Terminal.getNodeFromPath(targetPath);
                if (node && node.type === 'dir') {
                    Terminal.currentPath = targetPath;
                } else {
                    Terminal.print(`Error: el directorio "${newPath}" no existe.`);
                }
                Terminal.dom.prompt.innerHTML = `ilupo@warehouse:~${Terminal.currentPath === '/' ? '' : Terminal.currentPath}$&nbsp;`;
            },
            open: function(args) {
                if (!args.length) return Terminal.print('Error: especifica el ID de un proyecto.');
                window.open(`proyecto.html?id=${args[0]}`, '_blank');
            },
            view: function(args) {
                if (!args.length) return Terminal.print('Error: especifica la ruta de una imagen.');
                Terminal.print(`Mostrando imagen: ${args[0]}... (Funcionalidad de lightbox pendiente)`);
            },
            about: function() {
                fetch('info.json').then(r => r.json()).then(data => Terminal.print(data.contenido.replace(/\n/g, '<br>'))).catch(() => Terminal.print('Error al cargar info.json.'));
            },
            exec: function(args) {
                if (!args.length) return Terminal.print('Error: especifica qué Easter egg ejecutar (ej: wolf_howl, boykisser).');
                if (window.easterEggFunctions && typeof window.easterEggFunctions[args[0]] === 'function') {
                    window.easterEggFunctions[args[0]]();
                } else {
                    Terminal.print('Error: Easter egg no encontrado o no es ejecutable.');
                }
            },
            date: function() { Terminal.print(new Date().toLocaleString('es-ES')); },
            echo: function(args) { Terminal.print(args.join(' ')); },
            clear: function() { Terminal.dom.output.innerHTML = ''; },
            exit: function() { Terminal.toggle(); }
        },

        getNodeFromPath: function(path) {
            const parts = path.split('/').filter(p => p);
            let currentNode = this.fileSystem;
            for (const part of parts) {
                if (currentNode && currentNode.type === 'dir' && currentNode.content && currentNode.content[part]) {
                    currentNode = currentNode.content[part];
                } else {
                    return null;
                }
            }
            return currentNode;
        },

        resolvePath: function(path) {
            if (path.startsWith('/')) return path;
            const currentParts = this.currentPath.split('/').filter(p => p);
            path.split('/').forEach(part => {
                if (part === '..') {
                    currentParts.pop();
                } else if (part !== '.' && part !== '') {
                    currentParts.push(part);
                }
            });
            return '/' + currentParts.join('/');
        }
    };
    window.Terminal = Terminal;
})();
