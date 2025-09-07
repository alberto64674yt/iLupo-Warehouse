// Contenido 100% completo, v1.4 - Implementación del Núcleo Jugable Completo

document.addEventListener('DOMContentLoaded', () => {

    // -----------------------------------------------------------------------------
    //  1. ESTADO DEL JUEGO Y VARIABLES PRINCIPALES
    // -----------------------------------------------------------------------------

    const initialGameState = {
        money: 500, followers: 0, energy: 10, maxEnergy: 10, day: 1,
        skills: { programming: 5, design: 5, marketing: 5 },
        activeProjects: [],
        completedProjects: [],
        shopUpgrades: {},
        currentTrend: { name: 'Ninguna', bonus: 0, category: '' }
    };
    let gameState = {};

    const dom = {
        mainMenu: document.getElementById('main-menu'),
        gameContainer: document.getElementById('game-container'),
        newGameBtn: document.getElementById('new-game-button'),
        continueBtn: document.getElementById('continue-button'),
        helpBtn: document.getElementById('help-button'),
        money: document.getElementById('money-display'),
        followers: document.getElementById('followers-display'),
        energy: document.getElementById('energy-display'),
        date: document.getElementById('date-text'),
        nextDayBtn: document.getElementById('next-day-button'),
        navButtons: document.querySelectorAll('.nav-button'),
        newProjectBtn: document.getElementById('new-project-button'),
        projectListContainer: document.getElementById('project-list-container'),
        helpModal: document.getElementById('help-modal'),
        newProjectModal: document.getElementById('new-project-modal'),
        confirmNewProjectBtn: document.getElementById('confirm-new-project-button'),
        newProjectNameInput: document.getElementById('new-project-name-input'),
        projectCreationOptions: document.getElementById('project-creation-options'),
        exportSaveBtn: document.getElementById('export-save-button'),
        importSaveBtn: document.getElementById('import-save-button'),
        importFileInput: document.getElementById('import-file-input'),
        newsContent: document.getElementById('news-content'),
        notificationContainer: document.getElementById('notification-container'),
        // Modales de minijuegos
        debugMinigameOverlay: document.getElementById('debug-minigame-overlay'),
    };

    const gameData = {
        projectTypes: {
            'Utilidad': { programming: 0.7, design: 0.1, marketing: 0.2, icon: 'fa-wrench', baseCost: 50, baseEffort: 100 },
            'Juego Arcade': { programming: 0.4, design: 0.5, marketing: 0.1, icon: 'fa-gamepad', baseCost: 100, baseEffort: 150 },
            'Mod': { programming: 0.8, design: 0.1, marketing: 0.1, icon: 'fa-puzzle-piece', baseCost: 25, baseEffort: 80 }
        },
        trends: [
            { quality: 'Común', bonusRange: [5, 20], probability: 0.75, messages: ["Un ligero interés en {category} este mes."] },
            { quality: 'Poco Común', bonusRange: [21, 50], probability: 0.20, messages: ["¡Las {category} están de moda!"] },
            { quality: 'Rara', bonusRange: [51, 90], probability: 0.04899, messages: ["¡FIEBRE POR {category}! El mercado está en auge."] },
            { quality: 'Épica', bonusRange: [91, 150], probability: 0.001, messages: ["¡VIRAL! Un streamer famoso ha impulsado las {category}."] },
            { quality: 'Legendaria', bonusRange: [300, 300], probability: 0.00001, messages: ["¡REVOLUCIÓN! Un proyecto de {category} ha cambiado la industria."] }
        ]
    };
    
    let selectedProjectType = null;

    // -----------------------------------------------------------------------------
    //  2. FUNCIONES PRINCIPALES DEL BUCLE DE JUEGO
    // -----------------------------------------------------------------------------

    function initializeApp() {
        attachAllEventListeners();
        if (localStorage.getItem('iLupoDevTycoonSave')) dom.continueBtn.disabled = false;
        else dom.continueBtn.disabled = true;
    }

    function startGame(saveData = null) {
        gameState = saveData ? JSON.parse(atob(saveData)) : JSON.parse(JSON.stringify(initialGameState));
        dom.mainMenu.classList.add('hidden');
        dom.gameContainer.classList.remove('hidden');
        if (gameState.day === 1) generateNewTrend();
        updateUI();
    }

    function updateUI() {
        dom.money.innerHTML = `<i class="fas fa-coins"></i> ${Math.floor(gameState.money)} €`;
        dom.followers.innerHTML = `<i class="fas fa-users"></i> ${gameState.followers}`;
        dom.energy.innerHTML = `<i class="fas fa-bolt"></i> ${gameState.energy} / ${gameState.maxEnergy}`;
        dom.date.innerHTML = `Día ${gameState.day}`;
        dom.newsContent.innerHTML = `<p><strong>Tendencia:</strong> ${gameState.currentTrend.name} <span>(+${gameState.currentTrend.bonus}% bonus)</span></p>`;
        renderActiveProjects();
    }
    
    function nextDay() {
        gameState.day++;
        gameState.energy = gameState.maxEnergy;
        generateNewTrend();
        updateUI();
        saveGame();
    }

    function generateNewTrend() {
        const rand = Math.random();
        let cumulativeProb = 0;
        for (const trendTier of gameData.trends) {
            cumulativeProb += trendTier.probability;
            if (rand <= cumulativeProb) {
                const bonus = Math.floor(Math.random() * (trendTier.bonusRange[1] - trendTier.bonusRange[0] + 1)) + trendTier.bonusRange[0];
                const categoryKeys = Object.keys(gameData.projectTypes);
                const categoryName = categoryKeys[Math.floor(Math.random() * categoryKeys.length)];
                gameState.currentTrend = { name: trendTier.messages[0].replace('{category}', categoryName), bonus: bonus, category: categoryName };
                return;
            }
        }
    }
    
    // -----------------------------------------------------------------------------
    //  3. LÓGICA DE PROYECTOS (NÚCLEO DEL JUEGO)
    // -----------------------------------------------------------------------------

    function confirmNewProject() {
        const name = dom.newProjectNameInput.value.trim();
        if (!selectedProjectType || !name) {
            alert("Debes elegir un tipo y un nombre para el proyecto.");
            return;
        }
        const projectData = gameData.projectTypes[selectedProjectType];
        if (gameState.money < projectData.baseCost) {
            alert("No tienes suficiente dinero.");
            return;
        }
        gameState.money -= projectData.baseCost;
        const newProject = {
            id: Date.now(), name: name, type: selectedProjectType,
            effortRequired: projectData.baseEffort, progress: 0,
            bugs: 0, quality: 0,
            stage: 'development' // Fases: development -> video -> post -> complete
        };
        gameState.activeProjects.push(newProject);
        dom.newProjectModal.classList.add('hidden');
        updateUI();
    }

    function handleProjectActions(e) {
        const button = e.target.closest('.action-button');
        if (!button) return;
        
        const projectId = parseInt(button.closest('.project-card').dataset.id);
        const action = button.dataset.action;

        switch(action) {
            case 'develop': developProject(projectId); break;
            case 'debug': debugProject(projectId); break;
            case 'make-video': changeProjectStage(projectId, 'video'); break;
            case 'make-post': changeProjectStage(projectId, 'post'); break;
            case 'publish': publishProject(projectId); break;
        }
    }

    function developProject(projectId) {
        if (gameState.energy < 5) {
            showNotification("¡Sin energía!", 'error');
            return;
        }
        const project = gameState.activeProjects.find(p => p.id === projectId);
        if (!project) return;
        
        gameState.energy -= 5;
        const progressMade = Math.floor(5 + gameState.skills.programming / 2);
        project.progress += progressMade;

        // Probabilidad de generar un bug (menor con más habilidad)
        const bugChance = Math.max(0.05, 0.4 - gameState.skills.programming * 0.02);
        if (Math.random() < bugChance) {
            project.bugs++;
            showNotification("+1 Bug", 'error');
        }

        if (project.progress >= project.effortRequired) {
            project.progress = project.effortRequired;
            // Calcular calidad final del desarrollo
            const baseQuality = (gameState.skills.programming + gameState.skills.design) / 2;
            project.quality = Math.floor(baseQuality + Math.random() * 20 - 10); // Rango de aleatoriedad
            showNotification("¡Desarrollo completado!", 'success');
        } else {
            showNotification(`+${progressMade} Progreso`, 'info');
        }
        updateUI();
    }
    
    function debugProject(projectId) {
        if (gameState.energy < 3) {
            showNotification("¡Sin energía!", 'error');
            return;
        }
        const project = gameState.activeProjects.find(p => p.id === projectId);
        if (!project || project.bugs <= 0) return;
        
        gameState.energy -= 3;
        const bugsFixed = Math.max(1, Math.floor(gameState.skills.programming / 5));
        project.bugs = Math.max(0, project.bugs - bugsFixed);
        showNotification(`-${bugsFixed} Bug${bugsFixed > 1 ? 's' : ''}`, 'success');
        updateUI();
    }
    
    function changeProjectStage(projectId, newStage) {
        const project = gameState.activeProjects.find(p => p.id === projectId);
        if (project) {
            project.stage = newStage;
            updateUI();
        }
    }

    function publishProject(projectId) {
        const projectIndex = gameState.activeProjects.findIndex(p => p.id === projectId);
        if (projectIndex === -1) return;

        const project = gameState.activeProjects[projectIndex];
        const [moneyGained, followersGained] = calculateRewards(project);

        gameState.money += moneyGained;
        gameState.followers += followersGained;

        showNotification(`+${Math.floor(moneyGained)}€ / +${followersGained} seguidores`, 'success');
        
        gameState.activeProjects.splice(projectIndex, 1);
        gameState.completedProjects.push(project);
        
        updateUI();
    }

    function calculateRewards(project) {
        const projectData = gameData.projectTypes[project.type];
        
        let moneyGained = project.effortRequired * (project.quality / 10);
        let followersGained = Math.floor(project.quality + (gameState.skills.marketing * 1.5));
        
        // Bonus por tendencia
        if (gameState.currentTrend.category === project.type) {
            const trendBonus = 1 + (gameState.currentTrend.bonus / 100);
            moneyGained *= trendBonus;
            followersGained *= trendBonus;
        }
        
        // Bonus por marketing
        moneyGained *= (1 + gameState.skills.marketing / 50);

        return [Math.floor(moneyGained), Math.floor(followersGained)];
    }

    // -----------------------------------------------------------------------------
    //  4. RENDERIZADO Y UI
    // -----------------------------------------------------------------------------

    function renderActiveProjects() {
        if (gameState.activeProjects.length === 0) {
            dom.projectListContainer.innerHTML = '<p class="no-projects-message">No hay proyectos en desarrollo. ¡Crea uno!</p>';
            return;
        }

        dom.projectListContainer.innerHTML = gameState.activeProjects.map(proj => {
            const progressPercent = (proj.progress / proj.effortRequired) * 100;
            const isComplete = progressPercent >= 100;
            let bodyHtml = '', actionsHtml = '';

            // Lógica de la Máquina de Estados para la UI
            if (isComplete) {
                if(proj.bugs > 0) {
                    bodyHtml = `<div class="project-stat"><i class="fas fa-bug"></i> Bugs: <span class="stat-value error">${proj.bugs}</span></div>`;
                    actionsHtml = `<button class="action-button debug-button" data-action="debug"><i class="fas fa-spider"></i> Depurar</button>`;
                } else {
                    switch(proj.stage) {
                        case 'development': // Desarrollo completo, sin bugs, listo para vídeo
                            changeProjectStage(proj.id, 'video'); // Auto-transición
                            // Recurse para re-renderizar con el nuevo estado
                            return renderActiveProjects();
                        case 'video':
                            bodyHtml = `<div class="project-stat"><i class="fas fa-star"></i> Calidad: <span class="stat-value info">${proj.quality}</span></div>`;
                            actionsHtml = `<button class="action-button video-button" data-action="make-post"><i class="fas fa-video"></i> Grabar Vídeo</button>`;
                            break;
                        case 'post':
                            bodyHtml = `<div class="project-stat"><i class="fas fa-thumbs-up"></i> Potencial: <span class="stat-value success">¡Listo!</span></div>`;
                            actionsHtml = `<button class="action-button publish-button" data-action="publish"><i class="fas fa-rocket"></i> Publicar</button>`;
                            break;
                    }
                }
            } else { // Todavía en desarrollo
                bodyHtml = `
                    <p>Progreso:</p>
                    <div class="progress-bar-container">
                        <div class="progress-bar" style="width: ${progressPercent}%;"></div>
                        <span>${Math.floor(progressPercent)}%</span>
                    </div>
                    ${proj.bugs > 0 ? `<div class="project-stat"><i class="fas fa-bug"></i> Bugs: <span class="stat-value error">${proj.bugs}</span></div>` : ''}`;
                actionsHtml = proj.bugs > 0
                    ? `<button class="action-button debug-button" data-action="debug"><i class="fas fa-spider"></i> Depurar</button>`
                    : `<button class="action-button develop-button" data-action="develop"><i class="fas fa-hammer"></i> Desarrollar</button>`;
            }

            return `
                <div class="project-card" data-id="${proj.id}">
                    <div class="project-card-header">
                        <span class="project-title"><i class="fas ${gameData.projectTypes[proj.type].icon}"></i> ${proj.name}</span>
                        <span class="project-stage ${isComplete ? proj.stage : 'dev'}">${isComplete ? proj.stage : 'development'}</span>
                    </div>
                    <div class="project-card-body">${bodyHtml}</div>
                    <div class="project-card-actions">${actionsHtml}</div>
                </div>`;
        }).join('');
    }

    function showNotification(message, type = 'info') {
        const notif = document.createElement('div');
        notif.className = `notification ${type}`;
        notif.textContent = message;
        dom.notificationContainer.appendChild(notif);
        setTimeout(() => notif.remove(), 3000);
    }

    // -----------------------------------------------------------------------------
    //  5. SISTEMA DE GUARDADO
    // -----------------------------------------------------------------------------
    
    function saveGame() {
        try {
            const encodedSave = btoa(JSON.stringify(gameState));
            localStorage.setItem('iLupoDevTycoonSave', encodedSave);
            dom.continueBtn.disabled = false;
        } catch (e) { console.error("Error al guardar:", e); }
    }
    function loadGame() { return localStorage.getItem('iLupoDevTycoonSave'); }
    function exportSave() {
        const saveData = loadGame();
        if (!saveData) return alert("No hay partida guardada.");
        const blob = new Blob([saveData], { type: 'text/plain' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `iLupoDevTycoon_save_dia_${gameState.day}.txt`;
        a.click();
        URL.revokeObjectURL(a.href);
    }
    function importSave() { dom.importFileInput.click(); }
    function handleFileImport(event) {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const content = e.target.result;
                JSON.parse(atob(content)); // Validar
                localStorage.setItem('iLupoDevTycoonSave', content);
                alert("Partida importada. El juego se reiniciará.");
                window.location.reload();
            } catch (err) { alert("Error: Archivo de guardado no válido."); }
        };
        reader.readAsText(file);
    }
    
    // -----------------------------------------------------------------------------
    //  6. MANEJO DE EVENTOS
    // -----------------------------------------------------------------------------
    
    function attachAllEventListeners() {
        dom.newGameBtn.addEventListener('click', () => {
            if (loadGame() && !confirm("¿Seguro? Se borrará tu progreso.")) return;
            localStorage.removeItem('iLupoDevTycoonSave');
            startGame();
        });
        dom.continueBtn.addEventListener('click', () => { if(loadGame()) startGame(loadGame()); });
        dom.helpBtn.addEventListener('click', () => dom.helpModal.classList.remove('hidden'));
        dom.exportSaveBtn.addEventListener('click', exportSave);
        dom.importSaveBtn.addEventListener('click', importSave);
        dom.importFileInput.addEventListener('change', handleFileImport);
        dom.nextDayBtn.addEventListener('click', nextDay);
        dom.navButtons.forEach(button => {
            button.addEventListener('click', () => {
                document.querySelectorAll('.view-panel').forEach(p => p.classList.remove('active'));
                document.getElementById(button.dataset.view).classList.add('active');
                dom.navButtons.forEach(b => b.classList.remove('active'));
                button.classList.add('active');
            });
        });
        dom.newProjectBtn.addEventListener('click', openNewProjectModal);
        dom.confirmNewProjectBtn.addEventListener('click', confirmNewProject);
        document.querySelectorAll('.close-modal-button').forEach(btn => btn.addEventListener('click', () => btn.closest('.modal-overlay').classList.add('hidden')));
        
        // Delegación de eventos para las acciones de los proyectos
        dom.projectListContainer.addEventListener('click', handleProjectActions);
    }
    
    function openNewProjectModal() {
        selectedProjectType = null;
        dom.newProjectNameInput.value = '';
        dom.projectCreationOptions.innerHTML = Object.keys(gameData.projectTypes).map(type => {
            const cost = gameData.projectTypes[type].baseCost;
            return `<button class="project-type-choice" data-type="${type}"><i class="fas ${gameData.projectTypes[type].icon}"></i> ${type} <span>(${cost} €)</span></button>`;
        }).join('');
        dom.newProjectModal.classList.remove('hidden');
        dom.projectCreationOptions.addEventListener('click', (e) => {
            const button = e.target.closest('.project-type-choice');
            if (button) {
                document.querySelectorAll('.project-type-choice').forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                selectedProjectType = button.dataset.type;
            }
        });
    }

    // -----------------------------------------------------------------------------
    //  7. INICIALIZACIÓN
    // -----------------------------------------------------------------------------
    initializeApp();
});
