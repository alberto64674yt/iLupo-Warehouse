// =================================================================================
//  DATA.JS - v7.0 - Añadidos efectos a los nodos de I+D y refs para nuevo modal
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
        programming: { level: 1, xp: 0 },
        design: { level: 1, xp: 0 },
        marketing: { level: 1, xp: 0 }
    },
    activeProject: null,
    activeCourse: null,
    activeResearch: null, // Para la investigación activa
    completedProjects: [],
    completedCourses: [],
    completedResearch: [], // Para guardar las IDs de las investigaciones completadas
    completedProjectsToday: [],
    shopUpgrades: [],
    maxProjectsPerDay: 1,
    hardwareTimeReduction: 0,
    rentCost: 150,
    lastRentDay: 1,
    appMonetization: 1,
    postMonetization: 1,
    currentTrend: {
        name: 'Ninguna',
        bonus: 0,
        category: ''
    }
};

let gameState = {};
let gameTickInterval = null;
let minigameInterval = null;
let selectedProjectType = null;
let selectedTechnologies = []; // Rastreador para el nuevo modal


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
    skillsPanel: document.getElementById('skills-panel'),
    completedProjectsList: document.getElementById('completed-projects-list'),
    shopHardware: document.getElementById('shop-hardware'),
    shopPersonal: document.getElementById('shop-personal'),
    coursesContainer: document.getElementById('courses-container'),
    activeCourseContainer: document.getElementById('active-course-container'),
    researchContainer: document.getElementById('research-container'),
    activeResearchContainer: document.getElementById('active-research-container'),
    newsContent: document.getElementById('news-content'),
    notificationContainer: document.getElementById('notification-container'),
    newProjectModal: document.getElementById('new-project-modal'),
    // Referencias al nuevo modal
    modalStep1: document.getElementById('modal-step-1'),
    modalStep2: document.getElementById('modal-step-2'),
    projectTypeSelection: document.getElementById('project-type-selection'),
    newProjectNameInput: document.getElementById('new-project-name-input'),
    techSelectionContainer: document.getElementById('tech-selection-container'),
    projectSummaryContainer: document.getElementById('project-summary-container'),
    modalNextButton: document.getElementById('modal-next-button'),
    modalBackButton: document.getElementById('modal-back-button'),
    confirmNewProjectBtn: document.getElementById('confirm-new-project-button'),
    // Fin referencias nuevo modal
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
//  3. DATOS DEL JUEGO
// -----------------------------------------------------------------------------

const gameData = {
    skillData: {
        xpCurve: [0, 100, 250, 500, 1000, 1750, 2500, 5000]
    },
    courses: {
        programming: [
            { id: 'prog1', name: 'Programación I: Fundamentos', desc: 'Conceptos básicos de la programación.', cost: 200, duration: 1, xp: 50 },
            { id: 'prog2', name: 'Programación II: Algoritmia', desc: 'Optimiza tu código y resuelve problemas complejos.', cost: 600, duration: 2, xp: 120, requires: 'prog1' },
            { id: 'prog3', name: 'Programación III: Arquitectura', desc: 'Diseña software robusto y escalable.', cost: 1500, duration: 3, xp: 250, requires: 'prog2' },
        ],
        design: [
            { id: 'design1', name: 'Diseño I: Teoría del Color', desc: 'Aprende a combinar colores de forma efectiva.', cost: 200, duration: 1, xp: 50 },
            { id: 'design2', name: 'Diseño II: Experiencia de Usuario', desc: 'Crea interfaces intuitivas y atractivas.', cost: 600, duration: 2, xp: 120, requires: 'design1' },
            { id: 'design3', name: 'Diseño III: Animación', desc: 'Dota de vida a tus creaciones con movimiento.', cost: 1500, duration: 3, xp: 250, requires: 'design2' },
        ],
        marketing: [
            { id: 'mkt1', name: 'Marketing I: Redes Sociales', desc: 'Promociona tus proyectos en las principales plataformas.', cost: 350, duration: 1, xp: 50 },
            { id: 'mkt2', name: 'Marketing II: SEO y Contenido', desc: 'Atrae público de forma orgánica a tus webs.', cost: 800, duration: 2, xp: 120, requires: 'mkt1' },
            { id: 'mkt3', name: 'Marketing III: Campañas Virales', desc: 'Aprende las claves para que tu contenido explote.', cost: 2000, duration: 3, xp: 250, requires: 'mkt2' },
        ]
    },
    researchData: {
        programming: {
            name: 'Programación',
            icon: 'fa-code',
            nodes: [
                { id: 'res_prog1', name: 'Motor 2D Básico', desc: 'Desbloquea la capacidad de crear proyectos con gráficos 2D simples.', cost: 1000, duration: 3, requires: { skill: 'programming', level: 1 }, effect: { cost: 50, time: 20, quality: 10 } },
                { id: 'res_prog2', name: 'Guardado Local', desc: 'Permite que tus proyectos guarden el progreso del jugador.', cost: 2500, duration: 4, requires: { skill: 'programming', level: 3, research: 'res_prog1' }, effect: { cost: 100, time: 10, quality: 5 } },
            ]
        },
        design: {
            name: 'Diseño',
            icon: 'fa-palette',
            nodes: [
                { id: 'res_design1', name: 'Pixel Art', desc: 'Desbloquea un estilo visual retro para tus proyectos.', cost: 800, duration: 2, requires: { skill: 'design', level: 1 }, effect: { cost: 20, time: 0, quality: 15 } },
                { id: 'res_design2', name: 'Interfaz Personalizada', desc: 'Crea menús e interfaces más atractivos y únicos.', cost: 2000, duration: 4, requires: { skill: 'design', level: 2, research: 'res_design1' }, effect: { cost: 80, time: 30, quality: 20 } },
            ]
        },
        marketing: {
            name: 'Marketing',
            icon: 'fa-chart-line',
            nodes: [
                { id: 'res_mkt1', name: 'Página Web Simple', desc: 'Crea una web para promocionar tu proyecto y ganar más seguidores.', cost: 500, duration: 2, requires: { skill: 'marketing', level: 1 }, effect: { cost: 150, time: 0, quality: 0 } },
                { id: 'res_mkt2', name: 'Tráiler de Lanzamiento', desc: 'Genera expectación con un vídeo promocional antes del lanzamiento.', cost: 1500, duration: 3, requires: { skill: 'marketing', level: 2, research: 'res_mkt1' }, effect: { cost: 300, time: 0, quality: 5 } },
            ]
        }
    },
    projectTypes: {
        'Utilidad': {
            icon: 'fa-wrench',
            baseCost: 50,
            baseTime: 120,
            baseIncome: 4
        },
        'Juego Arcade': {
            icon: 'fa-gamepad',
            baseCost: 100,
            baseTime: 180,
            baseIncome: 8
        },
        'Mod': {
            icon: 'fa-puzzle-piece',
            baseCost: 25,
            baseTime: 90,
            baseIncome: 2
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
            cost: 800,
            effect: {
                type: 'appMonetization',
                value: 1.25
            }
        }, {
            id: 'ps2',
            name: 'Monetizar Posts',
            desc: 'Tus vídeos/posts generan un 25% más de seguidores.',
            cost: 800,
            effect: {
                type: 'postMonetization',
                value: 1.25
            }
        }, {
            id: 'ps3',
            name: 'Curso Productividad I',
            desc: 'Permite gestionar 2 proyectos/día y aumenta la Energía Máxima a 200.',
            cost: 4000,
            effect: {
                type: 'maxProjectsPerDay',
                value: 1,
                energy: 200
            }
        }, {
            id: 'ps5',
            name: 'Curso Productividad II',
            desc: 'Permite gestionar 3 proyectos/día y aumenta la Energía Máxima a 300.',
            cost: 8000,
            requires: 'ps3',
            effect: {
                type: 'maxProjectsPerDay',
                value: 1,
                energy: 300
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
    energyCosts: {
        debug: 50,
        video: 40,
        publish: 10,
    }
};
