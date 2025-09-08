// =================================================================================
//  MAIN.JS - v11.0 - Sistema de gastos y botones de guardado corregidos
// =================================================================================

let desktopManager;

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

// -----------------------------------------------------------------------------
//  1. BUCLE DE JUEGO PRINCIPAL
// -----------------------------------------------------------------------------

function initializeApp() {
    attachBaseEventListeners();
    if (localStorage.getItem('iLupoDevTycoonSave')) {
        dom.continueBtn.disabled = false;
    } else {
        dom.continueBtn.disabled = true;
    }
}

function startGame(saveData = null) {
    gameState = saveData ? JSON.parse(atob(saveData)) : JSON.parse(JSON.stringify(initialGameState));
    // FIX: Asegurarse de que el registro de gastos exista al iniciar/cargar partida.
    if (!gameState.dailyExpenses) {
        gameState.dailyExpenses = [];
    }
    
    dom.mainMenu.classList.add('hidden');
    dom.gameContainer.classList.remove('hidden');
    
    desktopManager = new DesktopManager();

    if (gameState.activeProject) {
        startProjectTimer();
    }
    if (gameState.day === 1) {
        generateNewTrend();
    }
    
    refreshUI();
}

function gameTick() {
    const proj = gameState.activeProject;
    if (!proj || proj.stage !== 'development') return;

    proj.timeRemaining -= 0.1;
    proj.timeRemaining = parseFloat(proj.timeRemaining.toFixed(2));

    const bugChance = Math.max(0.001, 0.015 - (gameState.skills.programming.level * 0.002));
    if (Math.random() < bugChance) {
        proj.bugs++;
    }

    if (proj.timeRemaining <= 0) {
        proj.timeRemaining = 0;
        proj.stage = 'debugging';
        clearInterval(gameTickInterval);
        gameTickInterval = null;
        proj.quality = Math.floor(proj.qualityBonus + (gameState.skills.programming.level + (gameState.skills.design.level * 2)) + Math.random() * 20 - 10);
        showNotification('¡Desarrollo terminado! Listo para depurar.', 'success');
        refreshUI();
    }
    
    if (desktopManager.openWindows['codeStudio']) {
        const codeStudioWindow = desktopManager.openWindows['codeStudio'];
        renderCodeStudioApp(codeStudioWindow.querySelector('.window-body'));
    }
}

function nextDay() {
    if (gameState.activeProject) {
        showNotification("No puedes pasar de día con un proyecto activo. ¡Termínalo!", "error");
        return;
    }

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
    
    if (gameState.activeResearch) {
        gameState.activeResearch.daysRemaining--;
        if (gameState.activeResearch.daysRemaining <= 0) {
            completeResearch(gameState.activeResearch.id);
        }
    }

    let { totalIncome, totalFollowers } = calculatePassiveIncome();
    
    // FIX: Se suman los gastos del día (cursos, etc.) al total de gastos.
    let totalExpenses = gameState.dailyExpenses.reduce((sum, expense) => sum + expense.amount, 0);

    if ((gameState.day - gameState.lastRentDay) >= 7) {
        totalExpenses += gameState.rentCost;
        gameState.lastRentDay = gameState.day;
        gameState.rentCost = Math.floor(150 + (gameState.completedProjects.length * 20) + (gameState.followers / 10));
    }

    const netIncome = totalIncome - totalExpenses;
    if (gameState.money + netIncome < 0) {
        handleGameOver(`Te has quedado sin dinero para pagar los gastos de ${totalExpenses}€.`);
        return;
    }

    dom.summaryTitle.textContent = `Resumen del Día ${gameState.day}`;
    dom.summaryContent.innerHTML = `<p>Ingresos Pasivos: +${totalIncome}€</p><p>Nuevos Seguidores: +${totalFollowers}</p><p>Gastos Totales: -${totalExpenses}€</p>`;
    dom.dailySummaryModal.classList.remove('hidden');
    
    const continueButton = dom.dailySummaryModal.querySelector('.close-modal-button');
    continueButton.onclick = () => {
        gameState.day++;
        gameState.money += netIncome;
        gameState.followers += totalFollowers;
        gameState.energy = gameState.maxEnergy;
        gameState.completedProjectsToday = [];
        // FIX: Se limpia el registro de gastos para el nuevo día.
        gameState.dailyExpenses = [];
        generateNewTrend();
        refreshUI();
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
    refreshUI();
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
        showNotification("Ya tienes un proyecto en desarrollo.", "error");
        return;
    }
    if (gameState.completedProjectsToday.length >= gameState.maxProjectsPerDay) {
        showNotification(`Ya has completado tu cupo de ${gameState.maxProjectsPerDay} proyecto(s) por hoy.`, "error");
        return;
    }
    const name = dom.newProjectNameInput.value.trim();
    if (!selectedProjectType || !name) {
        showNotification("Debes seleccionar un tipo de proyecto y darle un nombre.", "error");
        return;
    }
    const baseData = gameData.projectTypes[selectedProjectType];
    let totalCost = baseData.baseCost;
    let totalTime = baseData.baseTime;
    let qualityBonus = 0;
    selectedTechnologies.forEach(techId => {
        const { node } = findResearchNode(techId);
        if (node) {
            totalCost += node.effect.cost;
            totalTime += node.effect.time;
            qualityBonus += node.effect.quality;
        }
    });
    if (gameState.money < totalCost) {
        showNotification("No tienes suficiente dinero para este proyecto.", "error");
        return;
    }
    gameState.money -= totalCost;
    // FIX: Se registra el coste del proyecto como un gasto del día.
    gameState.dailyExpenses.push({ reason: `Proyecto: ${name}`, amount: totalCost });
    
    const finalTime = Math.max(30, totalTime - gameState.hardwareTimeReduction);
    gameState.activeProject = {
        id: Date.now(),
        name: name,
        type: selectedProjectType,
        technologies: [...selectedTechnologies],
        totalTime: finalTime,
        timeRemaining: finalTime,
        bugs: 0,
        quality: 0,
        qualityBonus: qualityBonus,
        stage: 'development',
        seoPenalty: 1
    };
    dom.newProjectModal.classList.add('hidden');
    startProjectTimer();
    refreshUI();
}

function startProjectTimer() {
    if (gameTickInterval) clearInterval(gameTickInterval);
    gameTickInterval = setInterval(gameTick, 100);
}

function publishProject() {
    const proj = gameState.activeProject;
    if (!proj || proj.stage !== 'post') {
        showNotification("No hay ningún proyecto listo para publicar.", "info");
        return;
    }
    if (gameState.energy < gameData.energyCosts.publish) {
        showNotification(`Se necesitan ${gameData.energyCosts.publish} de energía para publicar.`, 'error');
        return;
    }
    
    gameState.energy -= gameData.energyCosts.publish;
    showNotification(`${proj.name} se ha añadido a tu portfolio.`, 'success');
    gameState.completedProjects.push(proj);
    gameState.completedProjectsToday.push(proj);
    gameState.activeProject = null;
    refreshUI();
}

function calculatePassiveIncome() {
    let totalIncome = 0;
    let totalFollowers = 0;

    gameState.completedProjects.forEach(proj => {
        const projData = gameData.projectTypes[proj.type];
        let dailyMoney = projData.baseIncome + (proj.quality / 2);
        let dailyFollowers = Math.ceil(proj.quality / 20);

        dailyMoney *= gameState.appMonetization;
        dailyFollowers *= gameState.postMonetization;

        if (proj.seoPenalty) { dailyFollowers *= proj.seoPenalty; }

        const followerBonus = 1 + (gameState.followers / 5000);
        const marketingBonus = 1 + (gameState.skills.marketing.level / 10);
        
        dailyMoney *= followerBonus * marketingBonus;
        dailyFollowers *= marketingBonus;
        
        if (gameState.currentTrend.category === proj.type) {
            const trendBonus = 1 + (gameState.currentTrend.bonus / 100);
            dailyMoney *= trendBonus;
            dailyFollowers *= trendBonus;
        }

        totalIncome += Math.floor(dailyMoney);
        totalFollowers += Math.floor(dailyFollowers);
    });
    
    return { totalIncome, totalFollowers };
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

function attachBaseEventListeners() {
    document.getElementById('new-game-button').addEventListener('click', () => {
        if (loadGame() && !confirm("¿Seguro? Se borrará tu progreso.")) return;
        localStorage.removeItem('iLupoDevTycoonSave');
        startGame();
    });
    document.getElementById('continue-button').addEventListener('click', () => {
        const saveData = loadGame();
        if (saveData) startGame(saveData);
    });
    document.getElementById('help-button').addEventListener('click', () => dom.helpModal.classList.remove('hidden'));
    
    // FIX: Se conectan los botones de Importar y Exportar a sus funciones.
    document.getElementById('export-save-button').addEventListener('click', exportSave);
    document.getElementById('import-save-button').addEventListener('click', importSave);

    document.getElementById('main-menu-button').addEventListener('click', () => {
        if (confirm("¿Seguro que quieres volver al menú principal? Perderás el progreso que no hayas guardado desde que empezó el día.")) {
            window.location.reload();
        }
    });

    dom.restartGameButton.addEventListener('click', resetGame);
    dom.confirmNewProjectBtn.addEventListener('click', confirmNewProject);
    dom.modalNextButton.addEventListener('click', renderModalStep2);
    dom.modalBackButton.addEventListener('click', () => {
        dom.modalStep1.classList.remove('hidden');
        dom.modalStep2.classList.add('hidden');
        dom.modalNextButton.classList.remove('hidden');
        dom.modalBackButton.classList.add('hidden');
        dom.confirmNewProjectBtn.classList.add('hidden');
    });
    dom.projectTypeSelection.addEventListener('click', (e) => {
        const button = e.target.closest('.project-type-choice');
        if (button) {
            document.querySelectorAll('.project-type-choice').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            selectedProjectType = button.dataset.type;
        }
    });
    dom.techSelectionContainer.addEventListener('click', (e) => {
        const button = e.target.closest('.tech-choice');
        if(button) {
            const techId = button.dataset.techId;
            if (selectedTechnologies.includes(techId)) {
                selectedTechnologies = selectedTechnologies.filter(id => id !== techId);
                button.classList.remove('active');
            } else {
                selectedTechnologies.push(techId);
                button.classList.add('active');
            }
            updateProjectSummary();
        }
    });
    document.body.addEventListener('click', (e) => {
        const closeButton = e.target.closest('.close-modal-button');
        if (closeButton) {
             const modal = closeButton.closest('.modal-overlay');
             if(modal) {
                 modal.classList.add('hidden');
             }
        }
    });
}

function saveGame() {
    try {
        const encodedSave = btoa(JSON.stringify(gameState));
        localStorage.setItem('iLupoDevTycoonSave', encodedSave);
    } catch (e) { console.error("Error al guardar:", e); }
}

function loadGame() {
    return localStorage.getItem('iLupoDevTycoonSave');
}

function exportSave() {
    const saveData = loadGame();
    if (!saveData) { alert("No hay partida guardada."); return; }
    const blob = new Blob([saveData], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `iLupoDevTycoon_save_dia_${gameState.day}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
}

function importSave() {
    const importFileInput = document.getElementById('import-file-input');
    importFileInput.click();
    importFileInput.onchange = handleFileImport;
}

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
        } catch (err) {
            alert("Error: Archivo de guardado no válido.");
        }
    };
    reader.readAsText(file);
}
