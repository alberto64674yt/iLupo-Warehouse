// Contenido 100% completo, v3.0.1 - Mega Update: Ingresos Pasivos, Gastos, Balance y Guía (Versión corregida sin omisiones)

document.addEventListener('DOMContentLoaded', () => {

    // -----------------------------------------------------------------------------
    //  1. ESTADO DEL JUEGO Y VARIABLES PRINCIPALES
    // -----------------------------------------------------------------------------

    let gameState = {};
    let gameTickInterval = null;
    let minigameInterval = null;
    let selectedProjectType = null;

    const initialGameState = {
        money: 500, followers: 0, energy: 100, maxEnergy: 100, day: 1,
        skills: { programming: 5, design: 5, marketing: 5 },
        activeProject: null,
        completedProjects: [],
        completedProjectsToday: [],
        shopUpgrades: [],
        maxProjectsPerDay: 1,
        hardwareTimeReduction: 0,
        rentCost: 100,
        lastRentDay: 1,
        appMonetization: 1,
        postMonetization: 1,
        currentTrend: { name: 'Ninguna', bonus: 0, category: '' }
    };
    
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

    const gameData = {
        projectTypes: {
            'Utilidad': { icon: 'fa-wrench', baseCost: 50, baseTime: 120, baseIncome: 10 },
            'Juego Arcade': { icon: 'fa-gamepad', baseCost: 100, baseTime: 180, baseIncome: 20 },
            'Mod': { icon: 'fa-puzzle-piece', baseCost: 25, baseTime: 90, baseIncome: 5 }
        },
        shopItems: {
            hardware: [
                { id: 'hw1', name: 'SSD Básico', desc: 'Reduce el tiempo de desarrollo 15 segundos.', cost: 400, effect: { type: 'hardwareTimeReduction', value: 15 } },
                { id: 'hw2', name: 'RAM 16GB', desc: 'Reduce el tiempo de desarrollo 25 segundos más.', cost: 1200, effect: { type: 'hardwareTimeReduction', value: 25 } },
                { id: 'hw3', name: 'CPU de 8 núcleos', desc: 'Reduce el tiempo de desarrollo 30 segundos más.', cost: 3000, effect: { type: 'hardwareTimeReduction', value: 30 } },
            ],
            personal: [
                { id: 'ps1', name: 'Monetizar Apps', desc: 'Tus proyectos generan un 25% más de ingresos.', cost: 500, effect: { type: 'appMonetization', value: 1.25 } },
                { id: 'ps2', name: 'Monetizar Posts', desc: 'Tus vídeos/posts generan un 25% más de seguidores.', cost: 500, effect: { type: 'postMonetization', value: 1.25 } },
                { id: 'ps3', name: 'Curso de Productividad', desc: 'Permite gestionar 2 proyectos por día.', cost: 2500, effect: { type: 'maxProjectsPerDay', value: 1 } },
                { id: 'ps4', name: 'Silla Ergonómica', desc: '+25 Energía Máxima.', cost: 800, effect: { type: 'maxEnergy', value: 25 } },
            ]
        },
        trends: [
            { quality: 'Común', bonusRange: [5, 20], probability: 0.75, messages: ["Un ligero interés en {category} este mes."] },
            { quality: 'Poco Común', bonusRange: [21, 50], probability: 0.20, messages: ["¡Las {category} están de moda!"] },
            { quality: 'Rara', bonusRange: [51, 90], probability: 0.04899, messages: ["¡FIEBRE POR {category}! El mercado está en auge."] },
            { quality: 'Épica', bonusRange: [91, 150], probability: 0.001, messages: ["¡VIRAL! Un streamer famoso ha impulsado las {category}."] },
            { quality: 'Legendaria', bonusRange: [300, 300], probability: 0.00001, messages: ["¡REVOLUCIÓN! Un proyecto de {category} ha cambiado la industria."] }
        ]
    };

    // -----------------------------------------------------------------------------
    //  2. BUCLE DE JUEGO PRINCIPAL
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
        if (gameState.activeProject) startProjectTimer();
        if (gameState.day === 1) generateNewTrend();
        renderShop();
        updateUI();
    }

    function gameTick() {
        const proj = gameState.activeProject;
        if (!proj || proj.stage !== 'development') return;
        proj.timeRemaining -= 0.1;
        const bugChance = Math.max(0.001, 0.015 - gameState.skills.programming * 0.001);
        if (Math.random() < bugChance) proj.bugs++;
        if (proj.timeRemaining <= 0) {
            proj.timeRemaining = 0;
            proj.stage = 'debugging';
            clearInterval(gameTickInterval);
            gameTickInterval = null;
            proj.quality = Math.floor((gameState.skills.programming + gameState.skills.design) + Math.random() * 20 - 10);
            showNotification('¡Desarrollo terminado! Listo para depurar.', 'success');
        }
        updateActiveProjectUI();
    }
    
    function nextDay() {
        if (gameState.activeProject) {
            alert("No puedes pasar de día con un proyecto activo. ¡Termínalo!");
            return;
        }

        const { totalIncome, totalFollowers, incomeBreakdown } = calculatePassiveIncome();
        let expenses = 0;
        let expenseReason = '';

        if ((gameState.day - gameState.lastRentDay) >= 6) {
            expenses = gameState.rentCost;
            expenseReason = `Alquiler del Servidor (Día ${gameState.day})`;
            gameState.lastRentDay = gameState.day;
            gameState.rentCost = Math.floor(gameState.rentCost * 1.15);
        }

        const netIncome = totalIncome - expenses;

        if (gameState.money + netIncome < 0) {
            handleGameOver(`Te has quedado sin dinero para pagar el alquiler de ${expenses}€.`);
            return;
        }

        showDailySummary(incomeBreakdown, expenses, expenseReason, totalIncome, totalFollowers);
        
        const continueButton = dom.dailySummaryModal.querySelector('.close-modal-button');
        continueButton.onclick = () => {
            gameState.day++;
            gameState.money += netIncome;
            gameState.followers += totalFollowers;
            gameState.energy = gameState.maxEnergy;
            gameState.completedProjectsToday = [];
            generateNewTrend();
            updateUI();
            saveGame();
            dom.dailySummaryModal.classList.add('hidden');
        };
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
    //  3. LÓGICA DE PROYECTOS, INGRESOS Y GAME OVER
    // -----------------------------------------------------------------------------

    function confirmNewProject() {
        if (gameState.activeProject || gameState.completedProjectsToday.length >= gameState.maxProjectsPerDay) {
            alert(`Ya has completado tu cupo de ${gameState.maxProjectsPerDay} proyecto(s) por hoy.`);
            return;
        }
        const name = dom.newProjectNameInput.value.trim();
        if (!selectedProjectType || !name) {
            alert("Elige un tipo y nombre para el proyecto.");
            return;
        }
        const projectData = gameData.projectTypes[selectedProjectType];
        if (gameState.money < projectData.baseCost) {
            alert("No tienes suficiente dinero.");
            return;
        }
        gameState.money -= projectData.baseCost;

        const totalTime = Math.max(30, projectData.baseTime - gameState.hardwareTimeReduction);

        gameState.activeProject = {
            id: Date.now(), name: name, type: selectedProjectType,
            totalTime: totalTime, timeRemaining: totalTime,
            bugs: 0, quality: 0, stage: 'development'
        };

        dom.newProjectModal.classList.add('hidden');
        startProjectTimer();
        updateUI();
    }
    
    function startProjectTimer() {
        if (gameTickInterval) clearInterval(gameTickInterval);
        gameTickInterval = setInterval(gameTick, 100);
    }
    
    function publishProject() {
        const proj = gameState.activeProject;
        if (!proj || gameState.energy < 20) {
            showNotification('Se necesitan 20 de energía para publicar.', 'error');
            return;
        }
        gameState.energy -= 20;
        
        showNotification(`${proj.name} se ha añadido a tu portfolio.`, 'success');
        
        gameState.completedProjects.push(proj);
        gameState.completedProjectsToday.push(proj);
        gameState.activeProject = null;
        updateUI();
    }
    
    function calculatePassiveIncome() {
        let totalIncome = 0;
        let totalFollowers = 0;
        const incomeBreakdown = [];

        gameState.completedProjects.forEach(proj => {
            const projData = gameData.projectTypes[proj.type];
            let dailyMoney = projData.baseIncome + (proj.quality / 2);
            let dailyFollowers = Math.ceil(proj.quality / 10);
            
            dailyMoney *= gameState.appMonetization;
            dailyFollowers *= gameState.postMonetization;
            
            const followerBonus = 1 + (gameState.followers / 2000);
            const marketingBonus = 1 + (gameState.skills.marketing / 50);
            
            dailyMoney *= followerBonus * marketingBonus;
            dailyFollowers *= marketingBonus;
            
            if (gameState.currentTrend.category === proj.type) {
                const trendBonus = 1 + (gameState.currentTrend.bonus / 100);
                dailyMoney *= trendBonus;
                dailyFollowers *= trendBonus;
            }

            dailyMoney = Math.floor(dailyMoney);
            dailyFollowers = Math.floor(dailyFollowers);

            totalIncome += dailyMoney;
            totalFollowers += dailyFollowers;
            incomeBreakdown.push({ name: proj.name, income: dailyMoney, followers: dailyFollowers });
        });

        return { totalIncome, totalFollowers, incomeBreakdown };
    }

    function handleGameOver(reason) {
        dom.gameOverReason.textContent = reason;
        dom.gameOverModal.classList.remove('hidden');
    }

    function resetGame() {
        localStorage.removeItem('iLupoDevTycoonSave');
        window.location.reload();
    }

    // -----------------------------------------------------------------------------
    //  4. MINIJUEGOS
    // -----------------------------------------------------------------------------

    function startDebugMinigame() {
        if (gameState.energy < 30) {
            showNotification('Se necesitan 30 de energía para depurar.', 'error');
            return;
        }
        gameState.energy -= 30;
        updateUI();

        const proj = gameState.activeProject;
        let bugsToSpawn = proj.bugs;
        let timeLeft = 30;

        dom.debugBugsLeft.textContent = bugsToSpawn;
        dom.debugTimer.textContent = `${timeLeft}s`;
        dom.debugMinigameOverlay.classList.remove('hidden');
        dom.startDebugButton.classList.add('hidden');

        function spawnBug() {
            if (bugsToSpawn <= 0) return;
            const bug = document.createElement('div');
            bug.className = 'bug';
            bug.innerHTML = '<i class="fas fa-bug"></i>';
            bug.style.top = `${Math.random() * 85}%`;
            bug.style.left = `${Math.random() * 85}%`;
            bug.onclick = () => {
                bugsToSpawn--;
                proj.bugs--;
                dom.debugBugsLeft.textContent = bugsToSpawn;
                bug.remove();
                if (bugsToSpawn === 0) {
                    endMinigame(true);
                }
            };
            dom.debugPlayArea.appendChild(bug);
            setTimeout(() => { if (bug.parentElement) bug.remove(); }, 2000);
        }

        minigameInterval = setInterval(() => {
            timeLeft--;
            dom.debugTimer.textContent = `${timeLeft}s`;
            if (Math.random() > 0.4) spawnBug();
            if (timeLeft <= 0) {
                endMinigame(bugsToSpawn === 0);
            }
        }, 1000);

        function endMinigame(success) {
            clearInterval(minigameInterval);
            minigameInterval = null;
            dom.debugMinigameOverlay.classList.add('hidden');
            dom.debugPlayArea.innerHTML = '';
            dom.startDebugButton.classList.remove('hidden');
            if (success) {
                showNotification('¡Todos los bugs eliminados!', 'success');
                proj.stage = 'video';
            } else {
                showNotification(`Quedaron ${bugsToSpawn} bugs. ¡Calidad penalizada!`, 'error');
                proj.quality = Math.floor(proj.quality * 0.8);
                proj.stage = 'video';
            }
            updateUI();
        }
    }

    function startSeoMinigame() {
        if (gameState.energy < 30) {
            showNotification('Se necesitan 30 de energía para el vídeo.', 'error');
            return;
        }
        gameState.energy -= 30;
        updateUI();

        dom.videoSeoMinigameOverlay.classList.remove('hidden');
        dom.finishSeoButton.classList.add('hidden');
        let score = 0;
        let timeLeft = 15;
        const goodTagsCount = 5;

        const allTags = ["optimización", "código limpio", "gracioso", "tutorial", "épico", "gameplay", "crypto", "blockchain", "clickbait", "polémica", "drama", "bugs", "lento", "aburrido"];
        const goodTags = allTags.slice(0, 6);
        
        let tagsToDisplay = goodTags.slice(0, goodTagsCount);
        while(tagsToDisplay.length < 12) {
            const randomTag = allTags[Math.floor(Math.random() * allTags.length)];
            if (!tagsToDisplay.includes(randomTag)) {
                tagsToDisplay.push(randomTag);
            }
        }
        tagsToDisplay.sort(() => Math.random() - 0.5);

        dom.seoTagsContainer.innerHTML = tagsToDisplay.map(tag => `<button class="seo-tag">${tag}</button>`).join('');
        dom.seoScore.textContent = `${score} / ${goodTagsCount}`;
        dom.seoTimer.textContent = `${timeLeft}s`;

        dom.seoTagsContainer.onclick = (e) => {
            const button = e.target;
            if (button.classList.contains('seo-tag') && !button.disabled) {
                button.disabled = true;
                if(goodTags.includes(button.textContent)) {
                    score++;
                    button.classList.add('correct');
                } else {
                    button.classList.add('incorrect');
                }
                dom.seoScore.textContent = `${score} / ${goodTagsCount}`;
                if (score === goodTagsCount) {
                    endMinigame();
                }
            }
        };

        minigameInterval = setInterval(() => {
            timeLeft--;
            dom.seoTimer.textContent = `${timeLeft}s`;
            if (timeLeft <= 0) {
                endMinigame();
            }
        }, 1000);

        function endMinigame() {
            clearInterval(minigameInterval);
            minigameInterval = null;
            const qualityBonus = Math.floor(score * 5);
            gameState.activeProject.quality += qualityBonus;
            showNotification(`SEO completo. Bonus de calidad: +${qualityBonus}`, 'success');
            dom.finishSeoButton.classList.remove('hidden');
            dom.finishSeoButton.onclick = () => {
                gameState.activeProject.stage = 'post';
                dom.videoSeoMinigameOverlay.classList.add('hidden');
                updateUI();
            };
        }
    }

    // -----------------------------------------------------------------------------
    //  5. TIENDA Y MEJORAS
    // -----------------------------------------------------------------------------

    function renderShop() {
        ['hardware', 'personal'].forEach(category => {
            const container = dom[`shop${category.charAt(0).toUpperCase() + category.slice(1)}`];
            container.innerHTML = gameData.shopItems[category].map(item => {
                const isOwned = gameState.shopUpgrades.includes(item.id);
                if (item.effect.type === 'maxProjectsPerDay' && gameState.maxProjectsPerDay >= 2 && !isOwned) return '';

                return `
                    <div class="shop-item ${isOwned ? 'owned' : ''}">
                        <div class="item-name">${item.name}</div>
                        <div class="item-desc">${item.desc}</div>
                        <div class="item-buy">
                            <span class="item-cost">${item.cost} €</span>
                            <button class="buy-button" data-item-id="${item.id}" ${isOwned ? 'disabled' : ''}>
                                ${isOwned ? 'Comprado' : 'Comprar'}
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
        });
    }

    function buyUpgrade(itemId) {
        let item;
        for (const cat in gameData.shopItems) {
            const found = gameData.shopItems[cat].find(i => i.id === itemId);
            if (found) { item = found; break; }
        }

        if (!item || gameState.shopUpgrades.includes(itemId) || gameState.money < item.cost) {
            showNotification('No se puede comprar la mejora.', 'error');
            return;
        }

        gameState.money -= item.cost;
        gameState.shopUpgrades.push(item.id);

        switch(item.effect.type) {
            case 'hardwareTimeReduction': gameState.hardwareTimeReduction += item.effect.value; break;
            case 'appMonetization': gameState.appMonetization = item.effect.value; break;
            case 'postMonetization': gameState.postMonetization = item.effect.value; break;
            case 'maxProjectsPerDay': gameState.maxProjectsPerDay += item.effect.value; break;
            case 'maxEnergy':
                gameState.maxEnergy += item.effect.value;
                gameState.energy = gameState.maxEnergy;
                break;
        }
        
        showNotification(`¡${item.name} comprado!`, 'success');
        renderShop();
        updateUI();
    }

    // -----------------------------------------------------------------------------
    //  6. RENDERIZADO Y UI
    // -----------------------------------------------------------------------------
    
    function updateUI() {
        dom.money.innerHTML = `<i class="fas fa-coins"></i> ${Math.floor(gameState.money)} €`;
        dom.followers.innerHTML = `<i class="fas fa-users"></i> ${gameState.followers}`;
        dom.energy.innerHTML = `<i class="fas fa-bolt"></i> ${gameState.energy} / ${gameState.maxEnergy}`;
        dom.date.innerHTML = `Día ${gameState.day}`;
        dom.newsContent.innerHTML = `<p><strong>Tendencia:</strong> ${gameState.currentTrend.name} <span>(+${gameState.currentTrend.bonus}% bonus)</span></p>`;
        
        updateActiveProjectUI();
        renderCompletedProjects();
    }
    
    function updateActiveProjectUI() {
        const proj = gameState.activeProject;
        if (!proj) {
            dom.activeProjectSlot.innerHTML = `<div class="no-active-project"><button id="new-project-button-main"> + Iniciar Nuevo Proyecto</button></div>`;
            document.getElementById('new-project-button-main').onclick = openNewProjectModal;
            return;
        }

        let html = '';
        const progressPercent = proj.timeRemaining > 0 ? 100 - (proj.timeRemaining / proj.totalTime * 100) : 100;

        html += `
            <div class="active-project-card">
                <div class="project-card-header">
                    <span class="project-title"><i class="fas ${gameData.projectTypes[proj.type].icon}"></i> ${proj.name}</span>
                    <span class="project-stage ${proj.stage}">${proj.stage}</span>
                </div>
                <div class="project-card-body">`;

        switch(proj.stage) {
            case 'development':
                html += `
                    <div class="project-stat-row">
                        <span><i class="fas fa-clock"></i> Tiempo: ${Math.ceil(proj.timeRemaining)}s</span>
                        <span><i class="fas fa-bug"></i> Bugs: ${proj.bugs}</span>
                    </div>
                    <div class="progress-bar-container">
                        <div class="progress-bar" style="width: ${progressPercent}%;"></div>
                        <span>${Math.floor(progressPercent)}%</span>
                    </div>`;
                break;
            case 'debugging':
                 html += `<p>El desarrollo ha finalizado con <strong>${proj.bugs} bugs</strong>. ¡Hay que eliminarlos!</p>
                    <button class="action-button debug-button" id="init-debug-minigame"><i class="fas fa-spider"></i> Iniciar Depuración (30 Energía)</button>`;
                break;
            case 'video':
                html += `<p>¡Proyecto limpio! Ahora a grabar el vídeo y optimizar el SEO para maximizar el impacto.</p>
                    <button class="action-button video-button" id="init-seo-minigame"><i class="fas fa-video"></i> Producir Vídeo (30 Energía)</button>`;
                break;
            case 'post':
                html += `<p>El vídeo está listo. ¡Es hora de lanzar el proyecto al mundo!</p>
                    <button class="action-button publish-button" id="publish-project-button"><i class="fas fa-rocket"></i> Publicar (20 Energía)</button>`;
                break;
        }

        html += `</div></div>`;
        dom.activeProjectSlot.innerHTML = html;

        if (proj.stage === 'debugging') document.getElementById('init-debug-minigame').onclick = startDebugMinigame;
        if (proj.stage === 'video') document.getElementById('init-seo-minigame').onclick = startSeoMinigame;
        if (proj.stage === 'post') document.getElementById('publish-project-button').onclick = publishProject;
    }

    function renderCompletedProjects() {
        if (gameState.completedProjects.length === 0) {
            dom.completedProjectsList.innerHTML = '<p class="no-projects-message">Aún no has publicado ningún proyecto.</p>';
            return;
        }
        dom.completedProjectsList.innerHTML = gameState.completedProjects.map(p => {
            const income = calculatePassiveIncomeForProject(p);
            return `
            <div class="completed-project-card">
                <span><i class="fas ${gameData.projectTypes[p.type].icon}"></i> ${p.name}</span>
                <span class="stat">Calidad: ${p.quality}</span>
                <span class="stat success"><i class="fas fa-coins"></i> ${income.money}€/día</span>
            </div>
            `;
        }).join('');
    }

    function calculatePassiveIncomeForProject(proj) {
        const projData = gameData.projectTypes[proj.type];
        let dailyMoney = projData.baseIncome + (proj.quality / 2);
        dailyMoney *= gameState.appMonetization;
        const followerBonus = 1 + (gameState.followers / 2000);
        const marketingBonus = 1 + (gameState.skills.marketing / 50);
        dailyMoney *= followerBonus * marketingBonus;
        if (gameState.currentTrend.category === proj.type) {
            dailyMoney *= (1 + gameState.currentTrend.bonus / 100);
        }
        return { money: Math.floor(dailyMoney) };
    }
    
    function showDailySummary(incomeBreakdown, expenses, expenseReason, totalIncome, totalFollowers) {
        dom.summaryTitle.textContent = `Resumen del Día ${gameState.day}`;
        let contentHtml = '<h4><i class="fas fa-arrow-up"></i> Ingresos</h4><ul>';
        incomeBreakdown.forEach(item => {
            contentHtml += `<li>${item.name}: <strong>+${item.income}€</strong> y <strong>+${item.followers} seguidores</strong></li>`;
        });
        if (incomeBreakdown.length === 0) contentHtml += '<li>Sin ingresos hoy. ¡Publica proyectos!</li>';
        contentHtml += '</ul>';

        if (expenses > 0) {
            contentHtml += `<h4><i class="fas fa-arrow-down"></i> Gastos</h4><ul>`;
            contentHtml += `<li>${expenseReason}: <strong>-${expenses}€</strong></li>`;
            contentHtml += '</ul>';
        }

        contentHtml += `<div class="summary-total">
            <p>Total Hoy: <span class="success">+${totalIncome}€</span> y <span class="info">+${totalFollowers} seguidores</span></p>
            ${expenses > 0 ? `<p>Gastos: <span class="error">-${expenses}€</span></p>` : ''}
            <p>Resultado Neto: <span class="${(totalIncome-expenses) >= 0 ? 'success' : 'error'}">${(totalIncome-expenses)}€</span></p>
        </div>`;

        dom.summaryContent.innerHTML = contentHtml;
        dom.dailySummaryModal.classList.remove('hidden');
    }

    function showNotification(message, type = 'info') {
        const notif = document.createElement('div');
        notif.className = `notification ${type}`;
        notif.textContent = message;
        dom.notificationContainer.appendChild(notif);
        setTimeout(() => notif.remove(), 3000);
    }
    
    // -----------------------------------------------------------------------------
    //  7. EVENT LISTENERS, GUARDADO Y MODALES
    // -----------------------------------------------------------------------------
    
    function attachAllEventListeners() {
        dom.newGameBtn.addEventListener('click', () => { if (loadGame() && !confirm("¿Seguro que quieres empezar una nueva partida? Se borrará tu progreso actual.")) return; resetGame(); });
        dom.continueBtn.addEventListener('click', () => { const saveData = loadGame(); if (saveData) startGame(saveData); });
        dom.helpBtn.addEventListener('click', () => dom.helpModal.classList.remove('hidden'));
        dom.restartGameButton.addEventListener('click', resetGame);
        
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
        
        document.getElementById('shop-items-container').addEventListener('click', (e) => {
            if (e.target.closest('.buy-button')) {
                buyUpgrade(e.target.closest('.buy-button').dataset.itemId);
            }
        });
        
        dom.confirmNewProjectBtn.addEventListener('click', confirmNewProject);
        document.querySelectorAll('.close-modal-button').forEach(btn => {
            btn.addEventListener('click', () => btn.closest('.modal-overlay').classList.add('hidden'));
        });
        
        dom.startDebugButton.onclick = startDebugMinigame;
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
                JSON.parse(atob(content));
                localStorage.setItem('iLupoDevTycoonSave', content);
                alert("Partida importada. El juego se reiniciará.");
                window.location.reload();
            } catch (err) { alert("Error: Archivo de guardado no válido."); }
        };
        reader.readAsText(file);
    }

    initializeApp();
});
