// Contenido completo, basado en tu archivo, con la lógica de 'exit' corregida v5.3

(function() {
    const Terminal = {
        isOpen: false,
        isRootMode: false,
        basicModeHeight: '400px',
        dom: {},
        projectData: [],
        commandHistory: [],
        historyIndex: -1,
        lastAutocomplete: { input: '', matches: [] },
        
        restrictedFiles: ['terminal.js', 'terminal.css', 'style.css', 'sw.js', 'sitemap.xml', 'panel.html'],
        allowedPages: ['index.html', 'sobre-mi.html', 'tags.html', 'proyectos.json', 'info.json', 'robots.txt'],
        
        fileSystem: {
            type: 'dir',
            content: {
                'favicon': {
                    type: 'dir',
                    content: {
                        'favicon.ico': { type: 'file' },
                        'favicon.svg': { type: 'file' },
                        'apple-touch-icon.png': { type: 'file' }
                    }
                }
            }
        },
        currentPath: '/',

        init: function() {
            this.createUI();
            this.attachEventListeners();
            this.initResizer();
            this.initLightbox();
            
            fetch('proyectos.json')
                .then(r => r.json())
                .then(data => {
                    this.projectData = data.items || [];
                    this.print('Bienvenido a iLupo Warehouse Shell [Versión 5.3 - Lógica Corregida]');
                    this.print('Escribe "help" para ver los comandos. Usa TAB para autocompletar.');
                })
                .catch(() => this.print('Error al cargar proyectos.json.'));

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
                if (Terminal.isRootMode) return;
                let newHeight = startHeight - (e.clientY - startY);
                if (newHeight < 50) newHeight = 50;
                if (newHeight > window.innerHeight - 20) newHeight = window.innerHeight - 20;
                container.style.height = `${newHeight}px`;
                container.style.maxHeight = 'none';
            };
            const stopDrag = () => {
                if (!Terminal.isRootMode) {
                    Terminal.basicModeHeight = container.style.height;
                }
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

        initLightbox: function() {
            const lightbox = document.createElement('div');
            lightbox.className = 'terminal-lightbox';
            lightbox.id = 'terminal-lightbox';
            lightbox.style.display = 'none';
            lightbox.innerHTML = `<img id="terminal-lightbox-img" src="">`;
            lightbox.addEventListener('click', () => {
                lightbox.style.display = 'none';
            });
            document.body.appendChild(lightbox);
            this.dom.lightbox = lightbox;
            this.dom.lightboxImg = document.getElementById('terminal-lightbox-img');
        },

        showLightbox: function(src) {
            this.dom.lightboxImg.src = src;
            this.dom.lightbox.style.display = 'flex';
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
                } else if (e.key === 'Tab') {
                    e.preventDefault();
                    this.handleAutocomplete();
                }
            });
            this.dom.container.addEventListener('click', () => this.dom.input.focus());
        },

        handleAutocomplete: function() {
            const inputValue = this.dom.input.value;
            const parts = inputValue.split(' ');
            const currentWord = parts[parts.length - 1];
            const command = parts[0];
            let dictionary = [];
            if (parts.length === 1) {
                dictionary = Object.keys(this.commands);
            } else {
                switch(command) {
                    case 'open':
                    case 'read':
                    case 'cat':
                        dictionary = this.projectData.map(p => p.id);
                        break;
                    case 'cdf':
                    case 'lsf':
                    case 'view':
                        const node = this.getNodeFromPath(this.currentPath);
                        if (node && node.type === 'dir') {
                            dictionary = Object.keys(node.content);
                        }
                        break;
                    case 'exec':
                        dictionary = Object.keys(window.easterEggFunctions || {});
                        break;
                    case 'theme':
                        dictionary = ['verde', 'ambar', 'azul', 'blanco'];
                        break;
                }
            }
            const matches = dictionary.filter(item => item.startsWith(currentWord));
            if (matches.length === 0) return;
            if (matches.length === 1) {
                parts[parts.length - 1] = matches[0];
                this.dom.input.value = parts.join(' ') + ' ';
            } else {
                if (this.lastAutocomplete.input === inputValue && this.lastAutocomplete.matches.length > 1) {
                    this.print(`${this.dom.prompt.innerHTML}${inputValue}`);
                    this.print(matches.join('&nbsp;&nbsp;&nbsp;'));
                }
                let commonPrefix = matches[0];
                for (let i = 1; i < matches.length; i++) {
                    while (matches[i].slice(0, commonPrefix.length) !== commonPrefix) {
                        commonPrefix = commonPrefix.slice(0, -1);
                    }
                }
                if (commonPrefix.length > currentWord.length) {
                    parts[parts.length - 1] = commonPrefix;
                    this.dom.input.value = parts.join(' ');
                }
                this.lastAutocomplete = { input: this.dom.input.value, matches: matches };
            }
        },

        processCommand: function(inputValue) {
            this.lastAutocomplete = { input: '', matches: [] };
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
                Terminal.print('--- Comandos de Contenido ---');
                Terminal.print('**ls**: Muestra los IDs de todos los proyectos disponibles.');
                Terminal.print('**read [id] / cat [id]**: Muestra los detalles de un proyecto o archivo .json.');
                Terminal.print('**open [destino]**: Abre un proyecto (por ID) o una página (ej: "index.html").');
                Terminal.print('**about**: Muestra la información de la página "Sobre Mí".');
                Terminal.print('--- Comandos de Archivos Virtuales ---');
                Terminal.print('**lsf**: Lista los archivos del directorio virtual actual.');
                Terminal.print('**cdf [dir]**: Cambia de directorio virtual.');
                Terminal.print('**pwd**: Muestra el directorio virtual actual.');
                Terminal.print('**view [archivo]**: Muestra una imagen del dir. virtual (ej: "view favicon/favicon.svg").');
                Terminal.print('--- Comandos de Sistema ---');
                Terminal.print('**su**: Entra o sale del "Modo Root" (pantalla completa).');
                Terminal.print('**whoami**: Muestra el usuario actual.');
                Terminal.print('**hostname**: Muestra el nombre del host.');
                Terminal.print('**theme [color]**: Cambia el color del texto (verde, ambar, azul, blanco).');
                Terminal.print('**exec [easter_egg]**: Ejecuta un Easter egg (ej: "exec wolf_howl").');
                Terminal.print('**clear**: Limpia la pantalla.');
                Terminal.print('**exit**: Cierra el terminal.');
            },
            su: function() {
                Terminal.isRootMode = !Terminal.isRootMode;
                document.body.classList.toggle('terminal-mode-full', Terminal.isRootMode);
                if (Terminal.isRootMode) {
                    Terminal.basicModeHeight = Terminal.dom.container.style.height || '400px';
                    Terminal.dom.container.style.height = '100vh';
                    Terminal.dom.container.style.maxHeight = '100vh';
                    Terminal.dom.prompt.classList.add('root-mode');
                    Terminal.print('<span style="color: var(--danger-color);">Acceso root concedido.</span> El comando "open" ahora mostrará el contenido aquí.');
                } else {
                    Terminal.dom.container.style.height = Terminal.basicModeHeight;
                    Terminal.dom.prompt.classList.remove('root-mode');
                    Terminal.print('Saliendo de modo root.');
                }
                Terminal.updatePrompt();
            },
            open: function(args) {
                if (!args.length) return Terminal.print('Error: especifica un destino.');
                const target = args[0];
                if (Terminal.isRootMode) {
                    if (Terminal.projectData.find(p => p.id === target) || ['info.json', 'proyectos.json'].includes(target)) {
                         return Terminal.commands.read(args);
                    }
                }
                if (Terminal.restrictedFiles.includes(target)) { return Terminal.print(`<span style="color: var(--danger-color);">**ACCESO DENEGADO a ${target}**</span>`); }
                if (Terminal.allowedPages.includes(target)) { window.open(target, '_blank'); return; }
                const project = Terminal.projectData.find(p => p.id === target);
                if (project) { window.open(`proyecto.html?id=${target}`, '_blank'); return; }
                Terminal.print(`Error: no se encontró el destino "${target}".`);
            },
            exit: function() {
            if (Terminal.isRootMode) {
             // Si estamos en modo root, primero desactiva todo lo visual del modo root
            Terminal.isRootMode = false;
            document.body.classList.remove('terminal-mode-full');
            Terminal.dom.prompt.classList.remove('root-mode');
            Terminal.updatePrompt();
            Terminal.dom.container.style.height = Terminal.basicModeHeight;
            }
            // Después (o si nunca estuvimos en modo root), SIEMPRE cierra el terminal
            Terminal.toggle();
            },
            cdf: function(args) {
                const newPath = args[0] || '/';
                const targetPath = Terminal.resolvePath(newPath);
                const node = Terminal.getNodeFromPath(targetPath);
                if (node && node.type === 'dir') {
                    Terminal.currentPath = targetPath;
                } else {
                    Terminal.print(`Error: el directorio "${newPath}" no existe.`);
                }
                Terminal.updatePrompt();
            },
            ls: function() {
                if (Terminal.projectData.length === 0) return Terminal.print('No hay proyectos cargados o encontrados.');
                Terminal.print('--- Proyectos Disponibles (IDs) ---');
                Terminal.projectData.forEach(p => Terminal.print(p.id));
            },
            read: function(args) {
                if (!args.length) return Terminal.print('Error: especifica qué leer.');
                const target = args.join(' ');
                if (Terminal.restrictedFiles.includes(target)) { return Terminal.print(`Error: Permisos insuficientes para leer "${target}".`); }
                if (target === 'info.json' || target === 'proyectos.json') {
                    fetch(target).then(r => r.json()).then(data => {
                        Terminal.print(`--- Contenido de ${target} ---`);
                        const formattedJson = JSON.stringify(data, null, 2).replace(/\n/g, '<br>').replace(/ /g, '&nbsp;');
                        Terminal.print(formattedJson);
                    }).catch(() => Terminal.print(`Error al cargar ${target}.`));
                    return;
                }
                const project = Terminal.projectData.find(p => p.id === target);
                if (project) {
                    Terminal.print(`\n<span style="color: var(--primary-color);">--- ${project.titulo} ---</span>`);
                    Terminal.print(`**Resumen:** ${Terminal.stripMarkdown(project.resumen)}`);
                    Terminal.print(`**Contenido:**`);
                    Terminal.print(Terminal.stripMarkdown(project.contenido_completo).replace(/\n/g, '<br>'));
                    Terminal.print('--------------------');
                } else {
                    Terminal.print(`Error: no se encontró el contenido para leer "${target}".`);
                }
            },
            cat: function(args) { Terminal.commands.read(args); },
            whoami: function() { Terminal.print('guest'); },
            hostname: function() { Terminal.print('iLupo-Warehouse-Server'); },
            pwd: function() { Terminal.print(Terminal.currentPath); },
            theme: function(args) {
                const color = (args[0] || '').toLowerCase();
                const validColors = { 'verde': '#39ff14', 'ambar': '#ffb800', 'azul': '#00aaff', 'blanco': '#e5e7eb' };
                if (validColors[color]) {
                    Terminal.dom.output.style.color = validColors[color];
                    Terminal.dom.input.style.color = validColors[color];
                    Terminal.print(`Tema cambiado a ${color}.`);
                } else { Terminal.print('Error: color no válido. Opciones: verde, ambar, azul, blanco.'); }
            },
            lsf: function(args) {
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
            view: function(args) {
                if (!args.length) return Terminal.print('Error: especifica la ruta de una imagen.');
                const path = Terminal.resolvePath(args[0]);
                const node = Terminal.getNodeFromPath(path);
                if (node && node.type === 'file') {
                    Terminal.showLightbox('/' + path.split('/').filter(p=>p).join('/'));
                } else {
                    Terminal.print(`Error: el archivo de imagen "${args[0]}" no existe en el sistema simulado.`);
                }
            },
            about: function() { Terminal.commands.read(['info.json']); },
            exec: function(args) {
                if (!args.length) return Terminal.print('Error: especifica qué Easter egg ejecutar.');
                const eggName = args[0];
                if (window.easterEggFunctions && typeof window.easterEggFunctions[eggName] === 'function') {
                    Terminal.print(`Ejecutando ${eggName}...`);
                    window.easterEggFunctions[eggName]();
                } else {
                    Terminal.print(`Error: Easter egg "${eggName}" no encontrado.`);
                }
            },
            date: function() { Terminal.print(new Date().toLocaleString('es-ES')); },
            echo: function(args) { Terminal.print(args.join(' ')); },
            clear: function() { Terminal.dom.output.innerHTML = ''; }
        },

        updatePrompt: function() {
            const pathIndicator = this.currentPath === '/' ? '' : this.currentPath;
            if (this.isRootMode) {
                this.dom.prompt.innerHTML = `root@warehouse:~${pathIndicator}#&nbsp;`;
            } else {
                this.dom.prompt.innerHTML = `ilupo@warehouse:~${pathIndicator}$&nbsp;`;
            }
        },

        stripMarkdown: function(text) {
            let cleanText = text || '';
            cleanText = cleanText.replace(/\[IMAGEN-DESCARGA\]\(([^,]+),\s*([^)]+)\)/g, (match, img, dl) => `[IMAGEN DE DESCARGA] (Enlace: ${dl})`);
            cleanText = cleanText.replace(/!\[([^\]]*)\]\(([^\)]+)\)/g, (match, alt, src) => ` (${src})`);
            cleanText = cleanText.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, (match, linkText, url) => `${linkText} (${url})`);
            cleanText = cleanText.replace(/\[(nota|aviso|info|spoiler:[^\]]+|tabs|tab:[^\]]+)\]/g, '').replace(/\[\/(nota|aviso|info|spoiler|tabs|tab)\]/g, '');
            cleanText = cleanText.replace(/(\*\*|__)(.*?)\1/g, '$2');
            cleanText = cleanText.replace(/([*_~`])/g, '');
            cleanText = cleanText.replace(/^(#+\s*)/gm, '');
            cleanText = cleanText.replace(/^>\s*/gm, '');
            cleanText = cleanText.replace(/^-\s*/gm, '* ');
            cleanText = cleanText.replace(/^\d+\.\s*/gm, (match) => `${match.trim()} `);
            return cleanText.trim();
        },

        getNodeFromPath: function(path) {
            const parts = path.split('/').filter(p => p);
            let currentNode = this.fileSystem;
            for (const part of parts) {
                if (currentNode && currentNode.type === 'dir' && currentNode.content && currentNode.content[part]) {
                    currentNode = currentNode.content[part];
                } else { return null; }
            }
            return currentNode;
        },

        resolvePath: function(path) {
            if (path === '..') {
                const parts = this.currentPath.split('/').filter(p => p);
                parts.pop();
                return '/' + parts.join('/');
            }
            if (path.startsWith('/')) return path;
            const currentParts = this.currentPath.split('/').filter(p => p);
            path.split('/').forEach(part => {
                if (part !== '.' && part !== '') currentParts.push(part);
            });
            return '/' + currentParts.join('/');
        }
    };
    window.Terminal = Terminal;
})();
