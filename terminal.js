// Contenido completo y definitivo para terminal.js

(function() {
    const Terminal = {
        isOpen: false,
        dom: {},
        commandHistory: [],
        historyIndex: -1,
        
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

        init: function() {
            this.createUI();
            this.attachEventListeners();
            this.initResizer(); // Activamos la función para redimensionar
            this.print('Bienvenido a iLupo Warehouse Shell [Versión 2.1]');
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

            this.dom.container = container;
            this.dom.output = document.getElementById('terminal-output');
            this.dom.input = document.getElementById('terminal-input');
            this.dom.prompt = document.getElementById('terminal-prompt');
            this.dom.resizer = document.getElementById('terminal-resizer');
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
                this.dom.input.focus();
            }
        },
        
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
            help: () => {
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
            ls: (args) => {
                const path = args[0] ? this.resolvePath(args[0]) : this.currentPath;
                const node = this.getNodeFromPath(path);
                if (node && node.type === 'dir') {
                    Object.keys(node.content).forEach(key => {
                        this.print(node.content[key].type === 'dir' ? `&lt;DIR&gt; ${key}` : `      ${key}`);
                    });
                } else if (node && node.type === 'file') {
                    this.print(`Error: "${path}" es un archivo, no un directorio.`);
                } else {
                    this.print(`Error: la ruta "${path}" no existe.`);
                }
            },
            cd: (args) => {
                const newPath = args[0] || '/';
                if (newPath === '..') {
                    const parts = this.currentPath.split('/').filter(p => p);
                    parts.pop();
                    this.currentPath = '/' + parts.join('/');
                    if (this.currentPath === '//') this.currentPath = '/';
                } else {
                    const targetPath = this.resolvePath(newPath);
                    const node = this.getNodeFromPath(targetPath);
                    if (node && node.type === 'dir') {
                        this.currentPath = targetPath;
                    } else {
                        this.print(`Error: el directorio "${newPath}" no existe.`);
                    }
                }
                this.dom.prompt.innerHTML = `ilupo@warehouse:~${this.currentPath === '/' ? '' : this.currentPath}$&nbsp;`;
            },
            open: (args) => {
                if (!args.length) return this.print('Error: especifica el ID de un proyecto.');
                window.open(`proyecto.html?id=${args[0]}`, '_blank');
            },
            view: (args) => {
                if (!args.length) return this.print('Error: especifica la ruta de una imagen.');
                this.print(`Mostrando imagen: ${args[0]}... (Funcionalidad de lightbox pendiente)`);
            },
            about: () => {
                fetch('info.json').then(r => r.json()).then(data => this.print(data.contenido.replace(/\n/g, '<br>'))).catch(() => this.print('Error al cargar info.json.'));
            },
            exec: (args) => {
                if (!args.length) return this.print('Error: especifica qué Easter egg ejecutar (ej: wolf_howl, boykisser).');
                if (window.easterEggFunctions && typeof window.easterEggFunctions[args[0]] === 'function') {
                    window.easterEggFunctions[args[0]]();
                } else {
                    this.print('Error: Easter egg no encontrado o no es ejecutable.');
                }
            },
            date: () => { this.print(new Date().toLocaleString('es-ES')); },
            echo: (args) => { this.print(args.join(' ')); },
            clear: () => { this.dom.output.innerHTML = ''; },
            exit: () => { this.toggle(); }
        },

        getNodeFromPath: function(path) {
            let absolutePath = this.resolvePath(path);
            if (absolutePath === '/') return this.fileSystem;
            const parts = absolutePath.split('/').filter(p => p);
            let currentNode = this.fileSystem;
            for (const part of parts) {
                if (currentNode && currentNode.type === 'dir' && currentNode.content[part]) {
                    currentNode = currentNode.content[part];
                } else {
                    return null;
                }
            }
            return currentNode;
        },

        resolvePath: function(path) {
            if (path.startsWith('/')) return path;
            const newPath = this.currentPath === '/' ? [] : this.currentPath.split('/').filter(p => p);
            path.split('/').forEach(part => {
                if (part === '..') newPath.pop();
                else if (part !== '.' && part !== '') newPath.push(part);
            });
            return '/' + newPath.join('/');
        }
    };

    window.Terminal = Terminal;
})();
