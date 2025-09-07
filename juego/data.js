// =================================================================================
//  DATA.JS - v4.0 - Rebalance de Energía, Economía y Tienda.
// =================================================================================

// -----------------------------------------------------------------------------
//  1. ESTADO INICIAL Y VARIABLES GLOBALES
// -----------------------------------------------------------------------------

const initialGameState = {
    money: 500,
    followers: 0,
    energy: 100,
    maxEnergy: 100,
    day: 1,
    skills: {
        programming: 5,
        design: 5,
        marketing: 5
    },
    activeProject: null,
    completedProjects: [],
    completedProjectsToday: [],
    shopUpgrades: [],
    maxProjectsPerDay: 1,
    hardwareTimeReduction: 0,
    rentCost: 150, // Aumentado para que sea una amenaza inicial
    lastRentDay: 1,
    appMonetization: 1,
    postMonetization: 1,
    currentTrend: {
        name: 'Ninguna',
        bonus: 0,
        category: ''
    }
};

// Se declaran aquí para ser accesibles globalmente por los demás scripts
let gameState = {};
let gameTickInterval = null;
let minigameInterval = null;
let selectedProjectType = null;


// -----------------------------------------------------------------------------
//  2. REFERENCIAS AL DOM
// -----------------------------------------------------------------------------

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
    activeProjectSlot: document.getElementById('active-project-slot'),
    completedProjectsList: document.getElementById('completed-projects-list'),
    shopHardware: document.getElementById('shop-hardware'),
    shopPersonal: document.getElementById('shop-personal'),
    newsContent: document.getElementById('news-content'),
    notificationContainer: document.getElementById('notification-container'),
    newProjectModal: document.getElementById('new-project-modal'),
    confirmNewProjectBtn: document.getElementById('confirm-new-project-button'),
    newProjectNameInput: document.getElementById('new-project-name-input'),
    projectCreationOptions: document.getElementById('project-creation-options'),
    helpModal: document.getElementById('help-modal'),
    dailySummaryModal: document.getElementById('daily-summary-modal'),
    summaryTitle: document.getElementById('summary-title'),
    summaryContent: document.getElementById('summary-content'),
    gameOverModal: document.getElementById('game-over-modal'),
    gameOverReason: document.getElementById('game-over-reason'),
    restartGameButton: document.getElementById('restart-game-button'),
    debugMinigameOverlay: document.getElementById('debug-minigame-overlay'),
    debugBugsLeft: document.getElementById('debug-bugs-left'),
    debugTimer: document.getElementById('debug-timer'),
    debugPlayArea: document.getElementById('debug-play-area'),
    startDebugButton: document.getElementById('start-debug-button'),
    videoSeoMinigameOverlay: document.getElementById('video-seo-minigame-overlay'),
    seoScore: document.getElementById('seo-score'),
    seoTimer: document.getElementById('seo-timer'),
    seoTagsContainer: document.getElementById('seo-tags-container'),
    finishSeoButton: document.getElementById('finish-seo-button'),
    exportSaveBtn: document.getElementById('export-save-button'),
    importSaveBtn: document.getElementById('import-save-button'),
    importFileInput: document.getElementById('import-file-input'),
};

// -----------------------------------------------------------------------------
//  3. DATOS DEL JUEGO (PROYECTOS, TIENDA, TENDENCIAS, EVENTOS)
// -----------------------------------------------------------------------------

const gameData = {
    projectTypes: {
        'Utilidad': {
            icon: 'fa-wrench',
            baseCost: 50,
            baseTime: 120,
            baseIncome: 4 // Nerfeado de 10
        },
        'Juego Arcade': {
            icon: 'fa-gamepad',
            baseCost: 100,
            baseTime: 180,
            baseIncome: 8 // Nerfeado de 20
        },
        'Mod': {
            icon: 'fa-puzzle-piece',
            baseCost: 25,
            baseTime: 90,
            baseIncome: 2 // Nerfeado de 5
        }
    },
    shopItems: {
        hardware: [{
            id: 'hw1',
            name: 'SSD Básico',
            desc: 'Reduce el tiempo de desarrollo 15 segundos.',
            cost: 400,
            effect: {
                type: 'hardwareTimeReduction',
                value: 15
            }
        }, {
            id: 'hw2',
            name: 'RAM 16GB',
            desc: 'Reduce el tiempo de desarrollo 25 segundos más.',
            cost: 1200,
            effect: {
                type: 'hardwareTimeReduction',
                value: 25
            }
        }, {
            id: 'hw3',
            name: 'CPU de 8 núcleos',
            desc: 'Reduce el tiempo de desarrollo 30 segundos más. (Máx. 90s de reducción)',
            cost: 3000,
            effect: {
                type: 'hardwareTimeReduction',
                value: 30
            }
        }, ],
        personal: [{
            id: 'ps1',
            name: 'Monetizar Apps',
            desc: 'Tus proyectos generan un 25% más de ingresos.',
            cost: 800, // Aumentado
            effect: {
                type: 'appMonetization',
                value: 1.25
            }
        }, {
            id: 'ps2',
            name: 'Monetizar Posts',
            desc: 'Tus vídeos/posts generan un 25% más de seguidores.',
            cost: 800, // Aumentado
            effect: {
                type: 'postMonetization',
                value: 1.25
            }
        }, {
            id: 'ps3',
            name: 'Curso Productividad I',
            desc: 'Permite gestionar 2 proyectos/día y aumenta la Energía Máxima a 200.',
            cost: 4000, // Aumentado significativamente
            effect: {
                type: 'maxProjectsPerDay',
                value: 1,
                energy: 200
            }
        }, {
            id: 'ps4',
            name: 'Silla Ergonómica',
            desc: '+25 Energía Máxima. Útil si quieres reintentar minijuegos.',
            cost: 1000, // Aumentado
            effect: {
                type: 'maxEnergy',
                value: 25
            }
        }, ]
    },
    trends: [{
        quality: 'Común',
        bonusRange: [5, 20],
        probability: 0.75,
        messages: ["Un ligero interés en {category} este mes."]
    }, {
        quality: 'Poco Común',
        bonusRange: [21, 50],
        probability: 0.20,
        messages: ["¡Las {category} están de moda!"]
    }, {
        quality: 'Rara',
        bonusRange: [51, 90],
        probability: 0.04899,
        messages: ["¡FIEBRE POR {category}! El mercado está en auge."]
    }, {
        quality: 'Épica',
        bonusRange: [91, 150],
        probability: 0.001,
        messages: ["¡VIRAL! Un streamer famoso ha impulsado las {category}."]
    }, {
        quality: 'Legendaria',
        bonusRange: [300, 300],
        probability: 0.00001,
        messages: ["¡REVOLUCIÓN! Un proyecto de {category} ha cambiado la industria."]
    }],
    dailyEvents: {
        positive: [{
            message: "¡Tu último proyecto se ha hecho viral! ¡Recibes un bonus de ingresos y seguidores hoy!",
            effect: (totals) => {
                totals.totalIncome = Math.floor(totals.totalIncome * 1.5);
                totals.totalFollowers = Math.floor(totals.totalFollowers * 1.5);
                return totals;
            }
        }, {
            message: "Un donante anónimo ha apoyado tu trabajo. ¡Has recibido 500€!",
            effect: (totals) => {
                totals.totalIncome += 500;
                return totals;
            }
        }],
        negative: [{
            message: "Una polémica en redes sociales te salpica. ¡Has perdido un 10% de tus seguidores!",
            effect: (totals) => {
                const followersLost = Math.max(1, Math.floor(gameState.followers * 0.1));
                gameState.followers -= followersLost;
                totals.totalFollowers -= followersLost;
                return totals;
            }
        }, {
            message: "¡Ataque de Ransomware! Los hackers te exigen un pago o perderás datos (calidad de proyectos).",
            effect: (totals) => {
                const ransom = Math.min(250, Math.floor(gameState.money * 0.5));
                if (confirm(`Pagar ${ransom}€ a los hackers? Si no lo haces, la calidad de todos tus proyectos se reducirá.`)) {
                    gameState.money -= ransom;
                    totals.totalIncome -= ransom;
                } else {
                    gameState.completedProjects.forEach(p => p.quality = Math.floor(p.quality * 0.9));
                }
                return totals;
            }
        }]
    },
    // Nuevas constantes de balance
    energyCosts: {
        debug: 50,
        video: 40,
        publish: 10,
    }
};
