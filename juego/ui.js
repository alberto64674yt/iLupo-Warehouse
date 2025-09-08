// =================================================================================
//  UI.JS - v9.1 - Corrección de bugs de renderizado y visuales
// =================================================================================

function refreshUI() {
    // Refrescar el HUD superior
    dom.money.innerHTML = `<i class="fas fa-coins"></i> ${Math.floor(gameState.money)} €`;
    dom.followers.innerHTML = `<i class="fas fa-users"></i> ${gameState.followers}`;
    dom.energy.innerHTML = `<i class="fas fa-bolt"></i> ${gameState.energy} / ${gameState.maxEnergy}`;
    dom.date.textContent = `Día ${gameState.day}`;

    // Refrescar contenido de ventanas abiertas
    for (const appId in desktopManager.openWindows) {
        const appData = gameData.apps.find(app => app.id === appId);
        const windowEl = desktopManager.openWindows[appId];
        if (appData && windowEl) {
            const contentRenderer = window[appData.renderer];
            if (typeof contentRenderer === 'function') {
                // Se envuelve en un try...catch para evitar que un error en una app rompa toda la UI
                try {
                    contentRenderer(windowEl.querySelector('.window-body'));
                } catch (e) {
                    console.error(`Error renderizando la app ${appId}:`, e);
                    windowEl.querySelector('.window-body').innerHTML = `<p class="error-message">Ocurrió un error al cargar el contenido de esta aplicación.</p>`;
                }
            }
        }
    }
}

// -----------------------------------------------------------------------------
//  RENDERIZADORES DE CONTENIDO DE APPS (CORREGIDOS)
// -----------------------------------------------------------------------------

function renderCodeStudioApp(container) {
    const template = document.getElementById('code-studio-template');
    container.innerHTML = template.innerHTML;

    const proj = gameState.activeProject;
    const projectInfoContainer = container.querySelector('.ide-project-info');
    const actionsContainer = container.querySelector('.ide-actions');
    const codeContent = container.querySelector('.code-content');
    const lineNumbers = container.querySelector('.line-numbers');

    if (!proj || proj.stage === 'video' || proj.stage === 'post') {
        projectInfoContainer.innerHTML = '<p>Ningún proyecto activo en fase de desarrollo o depuración.</p>';
        actionsContainer.innerHTML = `<button id="new-project-button-main" class="action-button"> + Iniciar Nuevo Proyecto</button>`;
        container.querySelector('#new-project-button-main').onclick = openNewProjectModal;
        codeContent.textContent = '// Esperando para empezar a programar...';
        lineNumbers.textContent = '1';
        return;
    }

    const progressPercent = proj.timeRemaining > 0 ? 100 - (proj.timeRemaining / proj.totalTime * 100) : 100;
    
    projectInfoContainer.innerHTML = `
        <span class="project-title">${proj.name}</span>
        <span class="project-stage ${proj.stage}">${proj.stage}</span>
        <div class="project-stat-row">
            <span><i class="fas fa-bug"></i> Bugs: ${proj.bugs}</span>
        </div>
        <div class="progress-bar-container">
            <div class="progress-bar" style="width: ${progressPercent}%;"></div>
            <span>${Math.floor(progressPercent)}%</span>
        </div>
    `;

    switch(proj.stage) {
        case 'development':
            actionsContainer.innerHTML = `<p>Desarrollando... El código aparecerá en el editor.</p>`;
            break;
        case 'debugging':
             actionsContainer.innerHTML = `<button class="action-button debug-button" id="init-debug-minigame"><i class="fas fa-spider"></i> Depurar (${gameData.energyCosts.debug} Energía)</button>`;
            break;
    }
    
    // Lógica de animación de código corregida
    const maxSnippets = gameData.codeSnippets.length;
    const snippetsToShow = Math.min(maxSnippets, Math.floor(progressPercent / (100 / maxSnippets)));
    let codeText = '';
    let lineText = '';
    let currentLine = 1;

    for(let i = 0; i < snippetsToShow; i++) {
        const snippet = gameData.codeSnippets[i];
        const snippetLines = snippet.split('\n');
        codeText += snippet + '\n\n';
        
        snippetLines.forEach(() => {
            lineText += currentLine + '\n';
            currentLine++;
        });
        lineText += currentLine + '\n'; // For the empty line between snippets
        currentLine++;
    }
    codeContent.textContent = codeText;
    lineNumbers.textContent = lineText;


    if (proj.stage === 'debugging') container.querySelector('#init-debug-minigame').onclick = startDebugMinigame;
}

function renderMyTubeApp(container) {
    const template = document.getElementById('mytube-template');
    container.innerHTML = template.innerHTML;
    const proj = gameState.activeProject;

    if (proj && proj.stage === 'video') {
        container.querySelector('.video-title-overlay').textContent = proj.name;
        container.querySelector('.upload-section').innerHTML = `
            <p>¡Proyecto listo para promocionar!</p>
            <button class="action-button video-button" id="init-seo-minigame"><i class="fas fa-video"></i> Producir Vídeo (${gameData.energyCosts.video} Energía)</button>
        `;
        container.querySelector('#init-seo-minigame').onclick = startSeoMinigame;
    } else {
        container.innerHTML = '<p>Abre esta aplicación cuando un proyecto esté en la fase de "vídeo" para promocionarlo.</p>';
    }
}

function renderBrowserApp(container) {
    const template = document.getElementById('browser-template');
    container.innerHTML = template.innerHTML;
    const proj = gameState.activeProject;

    if (proj && proj.stage === 'post') {
        container.querySelector('.publish-area p').textContent = `El proyecto "${proj.name}" está listo para ser publicado en tu Almacén.`;
        container.querySelector('.publish-button').onclick = publishProject;
    } else {
        container.innerHTML = '<p>Abre esta aplicación cuando un proyecto esté listo para ser "publicado".</p>';
    }
}

function renderWarehouseApp(container) {
    const template = document.getElementById('warehouse-template');
    container.innerHTML = template.innerHTML;
    renderCompletedProjects(container.querySelector('#completed-projects-list'));
}

function renderStatsApp(container) {
    const template = document.getElementById('stats-template');
    container.innerHTML = template.innerHTML;
    renderSkillsUI(container.querySelector('#skills-panel'));
}

// ---- APPS CORREGIDAS ----
function renderShopApp(container) {
    // FIX: Se evita llamar a una función externa (renderShop()) que causaba el error.
    // Se añade contenido temporal. La funcionalidad completa requiere el archivo shop.js.
    container.innerHTML = `
        <h3><i class="fas fa-desktop"></i> Hardware</h3>
        <div id="shop-hardware" class="shop-category"><p>El contenido de la tienda se mostrará aquí.</p></div>
        <h3><i class="fas fa-coffee"></i> Personal y Software</h3>
        <div id="shop-personal" class="shop-category"></div>
    `;
}

function renderCoursesApp(container) {
    // FIX: Se evita llamar a una función externa (renderCoursesUI()) que causaba el error.
    // Se añade contenido temporal. La funcionalidad completa requiere el archivo courses.js.
    container.innerHTML = `
        <div id="courses-container"><p>El contenido de los cursos se mostrará aquí.</p></div>
        <div id="active-course-container"></div>
    `;
}

function renderResearchApp(container) {
    // FIX: Se evita llamar a una función externa (renderResearchUI()) que causaba el error.
    // Se añade contenido temporal. La funcionalidad completa requiere el archivo research.js.
    container.innerHTML = `
        <div id="active-research-container"></div>
        <div id="research-container"><p>El árbol de investigación se mostrará aquí.</p></div>
    `;
}

function renderNewsApp(container) {
    // FIX: Se añade clase para colorear el texto del bonus.
    const bonus = gameState.currentTrend.bonus;
    const bonusClass = bonus >= 0 ? 'text-bonus' : 'text-malus';
    const bonusSign = bonus >= 0 ? '+' : '';
    container.innerHTML = `<p><strong>Tendencia:</strong> ${gameState.currentTrend.name} <span class="${bonusClass}">(${bonusSign}${bonus}% bonus)</span></p>`;
}
// -----------------------


function renderSkillsUI(container) {
    let html = '<h3><i class="fas fa-star"></i> Habilidades</h3>';
    for (const skillName in gameState.skills) {
        const skill = gameState.skills[skillName];
        const xpNeeded = gameData.skillData.xpCurve[skill.level] || 'MAX';
        const progressPercent = xpNeeded === 'MAX' ? 100 : (skill.xp / xpNeeded) * 100;
        html += `<div class="skill-item"><div class="skill-header"><span class="skill-name">${skillName}</span><span class="skill-level">Nivel ${skill.level}</span></div><div class="xp-bar-container"><div class="xp-bar" style="width: ${progressPercent}%;"></div></div><div class="skill-xp">${skill.xp} / ${xpNeeded} XP</div></div>`;
    }
    container.innerHTML = html;
}

function renderCompletedProjects(container) {
    if (gameState.completedProjects.length === 0) {
        container.innerHTML = '<p class="no-projects-message">Aún no has publicado ningún proyecto.</p>';
        return;
    }
    container.innerHTML = gameState.completedProjects.map(p => {
        const income = calculatePassiveIncomeForProjectUI(p);
        return `<div class="completed-project-card"><span><i class="fas ${gameData.projectTypes[p.type].icon}"></i> ${p.name}</span><span class="stat">Calidad: ${p.quality}</span><span class="stat success"><i class="fas fa-coins"></i> ${income.money}€/día</span></div>`;
    }).join('');
}

function showNotification(message, type = 'info') {
    const notif = document.createElement('div');
    notif.className = `notification ${type}`;
    notif.textContent = message;
    dom.notificationContainer.appendChild(notif);
    setTimeout(() => notif.remove(), 3000);
}

function openNewProjectModal() {
    selectedProjectType = null;
    selectedTechnologies = [];
    dom.newProjectNameInput.value = '';
    dom.modalStep1.classList.remove('hidden');
    dom.modalStep2.classList.add('hidden');
    dom.modalNextButton.classList.remove('hidden');
    dom.modalBackButton.classList.add('hidden');
    dom.confirmNewProjectBtn.classList.add('hidden');
    dom.projectTypeSelection.innerHTML = Object.keys(gameData.projectTypes).map(type => `<button class="project-type-choice" data-type="${type}"><i class="fas ${gameData.projectTypes[type].icon}"></i> ${type} <span>(${gameData.projectTypes[type].baseCost} €)</span></button>`).join('');
    dom.newProjectModal.classList.remove('hidden');
}

function renderModalStep2() {
    if (!selectedProjectType || !dom.newProjectNameInput.value.trim()) {
        showNotification("Debes seleccionar un tipo de proyecto y darle un nombre.", "error");
        return;
    }
    dom.modalStep1.classList.add('hidden');
    dom.modalStep2.classList.remove('hidden');
    dom.modalNextButton.classList.add('hidden');
    dom.modalBackButton.classList.remove('hidden');
    dom.confirmNewProjectBtn.classList.remove('hidden');
    const availableTechs = gameState.completedResearch;
    if (availableTechs.length > 0) {
        dom.techSelectionContainer.innerHTML = '<h4>Tecnologías Desbloqueadas</h4>';
        availableTechs.forEach(techId => {
            const { node } = findResearchNode(techId);
            if(node) dom.techSelectionContainer.innerHTML += `<button class="tech-choice" data-tech-id="${node.id}">${node.name} (+${node.effect.cost}€, +${node.effect.quality} Q)</button>`;
        });
    } else {
        dom.techSelectionContainer.innerHTML = '<h4>Tecnologías Desbloqueadas</h4><p>Aún no has investigado ninguna tecnología.</p>';
    }
    updateProjectSummary();
}

function updateProjectSummary() {
    if (!selectedProjectType) return;
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
    const canAfford = gameState.money >= totalCost;
    dom.confirmNewProjectBtn.disabled = !canAfford;
    dom.projectSummaryContainer.innerHTML = `<h4>Resumen del Proyecto</h4><div class="summary-line"><span>Coste Total:</span><span class="value ${canAfford ? '' : 'negative'}">${totalCost} €</span></div><div class="summary-line"><span>Tiempo Base:</span><span class="value">${totalTime}s</span></div><div class="summary-line"><span>Bonus Calidad:</span><span class="value positive">+${qualityBonus} Q</span></div>${!canAfford ? '<p class="negative">No tienes suficiente dinero.</p>' : ''}`;
}

function calculatePassiveIncomeForProjectUI(proj) {
    const projData = gameData.projectTypes[proj.type];
    let dailyMoney = projData.baseIncome + (proj.quality / 2);
    dailyMoney *= gameState.appMonetization;
    const followerBonus = 1 + (gameState.followers / 5000);
    const marketingBonus = 1 + (gameState.skills.marketing.level / 10);
    dailyMoney *= followerBonus * marketingBonus;
    if (gameState.currentTrend.category === proj.type) {
        dailyMoney *= (1 + gameState.currentTrend.bonus / 100);
    }
    return { money: Math.floor(dailyMoney) };
}
