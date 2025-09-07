// =================================================================================
//  MAIN.JS - v5.1 - Integración del sistema de Habilidades y Cursos (Completo)
// =================================================================================

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

// -----------------------------------------------------------------------------
//  1. BUCLE DE JUEGO PRINCIPAL
// -----------------------------------------------------------------------------

function initializeApp() {
    attachAllEventListeners();
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
    if (gameState.activeProject) {
        startProjectTimer();
    }
    if (gameState.day === 1) {
        generateNewTrend();
    }
    renderShop();
    updateUI();
}

function gameTick() {
    const proj = gameState.activeProject;
    if (!proj || proj.stage !== 'development') return;

    proj.timeRemaining -= 0.1;

    // La probabilidad de bugs ahora depende del NIVEL de programación
    const bugChance = Math.max(0.001, 0.015 - (gameState.skills.programming.level * 0.002));
    if (Math.random() < bugChance) {
        proj.bugs++;
    }

    if (proj.timeRemaining <= 0) {
        proj.timeRemaining = 0;
        proj.stage = 'debugging';
        clearInterval(gameTickInterval);
        gameTickInterval = null;
        // La calidad base ahora depende del NIVEL de diseño
        proj.quality = Math.floor((gameState.skills.programming.level + (gameState.skills.design.level * 2)) + Math.random() * 20 - 10);
        showNotification('¡Desarrollo terminado! Listo para depurar.', 'success');
    }
    updateActiveProjectUI();
}

function nextDay() {
    if (gameState.activeProject) {
        alert("No puedes pasar de día con un proyecto activo. ¡Termínalo!");
        return;
    }

    // Comprobar si se ha completado un curso
    if (gameState.activeCourse) {
        gameState.activeCourse.daysRemaining--;
        if (gameState.activeCourse.daysRemaining <= 0) {
            const courseData = gameData.courses[gameState.activeCourse.skill].find(c => c.id === gameState.activeCourse.id);
            showNotification(`¡Curso "${courseData.name}" completado!`, 'success');
            addXp(gameState.activeCourse.skill, courseData.xp);
            gameState.completedCourses.push(gameState.activeCourse.id);
            gameState.activeCourse = null;
        }
    }

    let { totalIncome, totalFollowers, incomeBreakdown } = calculatePassiveIncome();
    let expenses = 0;
    let expenseReason = '';
    const eventResult = handleDailyEvent({ totalIncome, totalFollowers, incomeBreakdown });
    totalIncome = eventResult.totals.totalIncome;
    totalFollowers = eventResult.totals.totalFollowers;

    if ((gameState.day - gameState.lastRentDay) >= 6) {
        expenses = gameState.rentCost;
        expenseReason = `Alquiler del Servidor (Día ${gameState.day})`;
        gameState.lastRentDay = gameState.day;
        gameState.rentCost = Math.floor(150 + (gameState.completedProjects.length * 20) + (gameState.followers / 10));
    }

    const netIncome = totalIncome - expenses;

    if (gameState.money + netIncome < 0) {
        handleGameOver(`Te has quedado sin dinero para pagar el alquiler de ${expenses}€.`);
        return;
    }

    showDailySummary(incomeBreakdown, expenses, expenseReason, totalIncome, totalFollowers, eventResult.eventMessage);
    
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
//  2. LÓGICA DE HABILIDADES, PROYECTOS, INGRESOS Y GAME OVER
// -----------------------------------------------------------------------------

function addXp(skill, amount) {
    gameState.skills[skill].xp += amount;
    showNotification(`+${amount} XP de ${skill}!`, 'info');
    checkForLevelUp(skill);
    updateUI();
}

function checkForLevelUp(skill) {
    const currentSkill = gameState.skills[skill];
    const xpNeeded = gameData.skillData.xpCurve[currentSkill.level];

    if (xpNeeded && currentSkill.xp >= xpNeeded) {
        currentSkill.level++;
        currentSkill.xp -= xpNeeded;
        showNotification(`¡${skill.toUpperCase()} ha subido al Nivel ${currentSkill.level}!`, 'success');
        checkForLevelUp(skill);
    }
}

function confirmNewProject() {
    if (gameState.activeProject) {
        alert("Ya tienes un proyecto en desarrollo.");
        return;
    }
    
    // Con el sistema de cursos concurrente, esta comprobación ya no es necesaria
    // if (gameState.activeCourse) {
    //     alert("No puedes iniciar un proyecto mientras estudias.");
    //     return;
    // }

    if (gameState.completedProjectsToday.length >= gameState.maxProjectsPerDay) {
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
        id: Date.now(),
        name: name,
        type: selectedProjectType,
        totalTime: totalTime,
        timeRemaining: totalTime,
        bugs: 0,
        quality: 0,
        stage: 'development',
        seoPenalty: 1
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
    if (!proj || gameState.energy < gameData.energyCosts.publish) {
        showNotification(`Se necesitan ${gameData.energyCosts.publish} de energía para publicar.`, 'error');
        return;
    }
    gameState.energy -= gameData.energyCosts.publish;
    
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
        let dailyFollowers = Math.ceil(proj.quality / 20);
        
        dailyMoney *= gameState.appMonetization;
        dailyFollowers *= gameState.postMonetization;
        if (proj.seoPenalty) {
            dailyFollowers *= proj.seoPenalty;
        }
        
        const followerBonus = 1 + (gameState.followers / 5000);
        const marketingBonus = 1 + (gameState.skills.marketing.level / 10);
        
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
        incomeBreakdown.push({
            name: proj.name,
            income: dailyMoney,
            followers: dailyFollowers
        });
    });

    return {
        totalIncome,
        totalFollowers,
        incomeBreakdown
    };
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
//  3. EVENT LISTENERS Y GUARDADO/CARGADO
// -----------------------------------------------------------------------------

function attachAllEventListeners() {
    // Menú Principal
    dom.newGameBtn.addEventListener('click', () => {
        if (loadGame() && !confirm("¿Seguro que quieres empezar una nueva partida? Se borrará tu progreso actual.")) {
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
    dom.restartGameButton.addEventListener('click', resetGame);
    
    // Guardado/Cargado
    dom.exportSaveBtn.addEventListener('click', exportSave);
    dom.importSaveBtn.addEventListener('click', importSave);
    dom.importFileInput.addEventListener('change', handleFileImport);
    
    // Juego Principal
    dom.nextDayBtn.addEventListener('click', nextDay);
    dom.navButtons.forEach(button => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.view-panel').forEach(p => p.classList.remove('active'));
            document.getElementById(button.dataset.view).classList.add('active');
            dom.navButtons.forEach(b => b.classList.remove('active'));
            button.classList.add('active');
        });
    });
    
    // Tienda
    document.getElementById('shop-items-container').addEventListener('click', (e) => {
        if (e.target.closest('.buy-button')) {
            buyUpgrade(e.target.closest('.buy-button').dataset.itemId);
        }
    });

    // Cursos
    dom.coursesContainer.addEventListener('click', (e) => {
        if (e.target.closest('.start-course-button')) {
            const button = e.target.closest('.start-course-button');
            startCourse(button.dataset.courseId, button.dataset.skillType);
        }
    });
    
    // Modales
    dom.confirmNewProjectBtn.addEventListener('click', confirmNewProject);
    document.body.addEventListener('click', (e) => {
        const closeButton = e.target.closest('.close-modal-button');
        if (closeButton) {
            const modal = closeButton.closest('.modal-overlay');
            if (modal) {
                if (modal.id === 'daily-summary-modal') return;
                modal.classList.add('hidden');
            }
        }
    });
    
    // Minijuegos (botones de inicio)
    dom.startDebugButton.onclick = startDebugMinigame;
}

function saveGame() {
    try {
        const encodedSave = btoa(JSON.stringify(gameState));
        localStorage.setItem('iLupoDevTycoonSave', encodedSave);
        dom.continueBtn.disabled = false;
    } catch (e) {
        console.error("Error al guardar:", e);
    }
}

function loadGame() {
    return localStorage.getItem('iLupoDevTycoonSave');
}

function exportSave() {
    const saveData = loadGame();
    if (!saveData) {
        alert("No hay partida guardada.");
        return;
    }
    const blob = new Blob([saveData], {
        type: 'text/plain'
    });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `iLupoDevTycoon_save_dia_${gameState.day}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
}

function importSave() {
    dom.importFileInput.click();
}

function handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const content = e.target.result;
            JSON.parse(atob(content));
            localStorage.setItem('iLupoDevTycoonSave', content);
            alert("Partida importada. El juego se reiniciará.");
            window.location.reload();
        } catch (err) {
            alert("Error: Archivo de guardado no válido.");
        }
    };
    reader.readAsText(file);
}
