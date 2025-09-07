// Contenido 100% completo, con correcciones de botones y menú v1.2 para juego.js

document.addEventListener('DOMContentLoaded', () => {

    // -----------------------------------------------------------------------------
    //  1. ESTADO DEL JUEGO Y VARIABLES PRINCIPALES
    // -----------------------------------------------------------------------------

    const initialGameState = {
        money: 500, followers: 0, energy: 10, maxEnergy: 10, day: 1,
        skills: { programming: 5, design: 5, marketing: 5 },
        activeProjects: [],
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
        importFileInput: document.getElementById('import-file-input')
    };

    const gameData = {
        projectTypes: {
            'Utilidad': { programming: 0.7, design: 0.1, marketing: 0.2, icon: 'fa-wrench' },
            'Juego Arcade': { programming: 0.4, design: 0.5, marketing: 0.1, icon: 'fa-gamepad' },
            'Mod': { programming: 0.8, design: 0.1, marketing: 0.1, icon: 'fa-puzzle-piece' }
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
        attachAllEventListeners(); // Llamada única para todos los listeners
        if (localStorage.getItem('iLupoDevTycoonSave')) {
            dom.continueBtn.disabled = false;
        } else {
            dom.continueBtn.disabled = true;
        }
    }

    function startGame(saveData = null) {
        gameState = saveData ? JSON.parse(atob(saveData)) : JSON.parse(JSON.stringify(initialGameState));
        dom.mainMenu.classList.add('hidden');
        dom.gameContainer.classList.remove('hidden');
        generateNewTrend();
        updateUI();
    }

    function updateUI() {
        dom.money.innerHTML = `<i class="fas fa-coins"></i> ${Math.floor(gameState.money)} €`;
        dom.followers.innerHTML = `<i class="fas fa-users"></i> ${gameState.followers}`;
        dom.energy.innerHTML = `<i class="fas fa-bolt"></i> ${gameState.energy} / ${gameState.maxEnergy}`;
        dom.date.innerHTML = `Día ${gameState.day}`;
        dom.newsPanel.innerHTML = `<p><strong>Tendencia del día:</strong> ${gameState.currentTrend.name} (+${gameState.currentTrend.bonus}%)</p>`;
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
                const categoryName = Object.keys(gameData.projectTypes)[Math.floor(Math.random() * Object.keys(gameData.projectTypes).length)];
                gameState.currentTrend = { name: trendTier.messages[0].replace('{category}', categoryName), bonus: bonus, category: categoryName };
                return;
            }
        }
    }

    // -----------------------------------------------------------------------------
    //  3. SISTEMA DE GUARDADO
    // -----------------------------------------------------------------------------

    function saveGame() {
        try {
            const encodedSave = btoa(JSON.stringify(gameState));
            localStorage.setItem('iLupoDevTycoonSave', encodedSave);
            console.log("Partida guardada.");
        } catch (e) {
            console.error("Error al guardar la partida:", e);
        }
    }

    function loadGame() { return localStorage.getItem('iLupoDevTycoonSave'); }

    function exportSave() {
        const saveData = loadGame();
        if (saveData) {
            const blob = new Blob([saveData], { type: 'text/plain' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `iLupoDevTycoon_save_dia_${gameState.day}.txt`;
            a.click();
            URL.revokeObjectURL(a.href);
        } else {
            alert("No hay partida guardada para exportar.");
        }
    }

    function importSave() { dom.importFileInput.click(); }
    
    function handleFileImport(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const content = e.target.result;
                    JSON.parse(atob(content));
                    localStorage.setItem('iLupoDevTycoonSave', content);
                    alert("Partida importada con éxito. El juego se reiniciará.");
                    window.location.reload();
                } catch (err) {
                    alert("Error: El archivo de guardado no es válido o está corrupto.");
                }
            };
            reader.readAsText(file);
        }
    }

    // -----------------------------------------------------------------------------
    //  4. MANEJO DE EVENTOS Y LÓGICA DE LA UI
    // -----------------------------------------------------------------------------
    
    function attachAllEventListeners() {
        // --- LISTENERS DEL MENÚ PRINCIPAL ---
        dom.newGameBtn.addEventListener('click', () => {
            if (loadGame() && !confirm("¿Seguro? Se borrará tu progreso actual.")) {
                return;
            }
            localStorage.removeItem('iLupoDevTycoonSave');
            startGame();
        });
        dom.continueBtn.addEventListener('click', () => {
            const saveData = loadGame();
            if (saveData) startGame(saveData);
        });
        dom.helpBtn.addEventListener('click', () => dom.helpModal.classList.remove('hidden'));
        dom.exportSaveBtn.addEventListener('click', exportSave);
        dom.importSaveBtn.addEventListener('click', importSave);
        dom.importFileInput.addEventListener('change', handleFileImport);
        
        // --- LISTENERS DEL JUEGO ---
        dom.nextDayBtn.addEventListener('click', nextDay);
        dom.navButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetViewId = button.dataset.view;
                document.querySelectorAll('.view-panel').forEach(panel => panel.classList.toggle('active', panel.id === targetViewId));
                dom.navButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.view === targetViewId));
            });
        });
        dom.newProjectBtn.addEventListener('click', openNewProjectModal);
        
        // --- LISTENERS DE MODALES ---
        dom.confirmNewProjectBtn.addEventListener('click', confirmNewProject);
        document.querySelectorAll('.close-modal-button').forEach(btn => {
            btn.addEventListener('click', () => {
                btn.closest('.modal-overlay').classList.add('hidden');
            });
        });
    }
    
    function openNewProjectModal() {
        selectedProjectType = null;
        dom.newProjectNameInput.value = '';
        let optionsHtml = '<h4>Elige un tipo de proyecto:</h4>';
        Object.keys(gameData.projectTypes).forEach(type => {
            optionsHtml += `<button class="project-type-choice" data-type="${type}"><i class="fas ${gameData.projectTypes[type].icon}"></i> ${type}</button>`;
        });
        dom.projectCreationOptions.innerHTML = optionsHtml;
        dom.newProjectModal.classList.remove('hidden');
        document.querySelectorAll('.project-type-choice').forEach(button => {
            button.addEventListener('click', () => {
                document.querySelectorAll('.project-type-choice').forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                selectedProjectType = button.dataset.type;
            });
        });
    }

    function confirmNewProject() {
        const name = dom.newProjectNameInput.value.trim();
        if (!selectedProjectType) {
            alert("Debes elegir un tipo de proyecto.");
            return;
        }
        if (!name) {
            alert("Debes darle un nombre a tu proyecto.");
            return;
        }
        console.log(`Creando proyecto: "${name}" del tipo "${selectedProjectType}"`);
        dom.newProjectModal.classList.add('hidden');
    }

    // -----------------------------------------------------------------------------
    //  5. INICIALIZACIÓN
    // -----------------------------------------------------------------------------

    initializeApp();

});
