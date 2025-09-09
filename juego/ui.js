// =================================================================================
//  UI.JS - v12.0 - Total en Almacén y código temático implementados
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
    if (!container.querySelector('.code-studio-layout')) {
        const template = document.getElementById('code-studio-template');
        container.innerHTML = template.innerHTML;
    }

    const proj = gameState.activeProject;
    const projectInfoContainer = container.querySelector('.ide-project-info');
    const actionsContainer = container.querySelector('.ide-actions');
    const codeContentEl = container.querySelector('.code-content');
    const lineNumbersEl = container.querySelector('.line-numbers');

    if (!proj || proj.stage === 'video' || proj.stage === 'post') {
        projectInfoContainer.innerHTML = '<p>Ningún proyecto activo en fase de desarrollo o depuración.</p>';
        actionsContainer.innerHTML = `<button id="new-project-button-main" class="action-button"> + Iniciar Nuevo Proyecto</button>`;
        container.querySelector('#new-project-button-main').onclick = openNewProjectModal;
        codeContentEl.textContent = '// Esperando para empezar a programar...';
        lineNumbersEl.textContent = '1';
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
            
            // FIX: Se selecciona el array de código basado en el tipo de proyecto.
            const projectType = proj.type || 'Utilidad'; // Fallback por si acaso
            const codeSnippets = gameData.codeSnippetsByType[projectType];
            
            const maxSnippets = codeSnippets.length;
            const snippetsToShow = Math.min(maxSnippets, Math.floor(progressPercent / (100 / maxSnippets)));
            let codeText = '';
            let lineText = '';
            let currentLine = 1;

            for(let i = 0; i < snippetsToShow; i++) {
                const snippet = codeSnippets[i];
                const snippetLines = snippet.split('\n');
                codeText += snippet + '\n\n';
                snippetLines.forEach(() => {
                    lineText += currentLine + '\n';
                    currentLine++;
                });
                lineText += currentLine + '\n';
                currentLine++;
            }
            codeContentEl.textContent = codeText;
            lineNumbersEl.textContent = lineText;
            break;
        case 'debugging':
             actionsContainer.innerHTML = `<button class="action-button debug-button" id="init-debug-minigame"><i class="fas fa-spider"></i> Depurar (${gameData.energyCosts.debug} Energía)</button>`;
             container.querySelector('#init-debug-minigame').onclick = startDebugMinigame;
            break;
    }
}


function renderMyTubeApp(container) {
    if (!container.querySelector('.mytube-layout')) {
        const template = document.getElementById('mytube-template');
        container.innerHTML = template.innerHTML;
    }

    const proj = gameState.activeProject;

    if (proj && proj.stage === 'video') {
        container.querySelector('.video-title-overlay').textContent = proj.name;
        container.querySelector('.upload-section').innerHTML = `
            <h4>¡Proyecto listo para promocionar!</h4>
            <button class="action-button video-button" id="init-seo-minigame"><i class="fas fa-video"></i> Producir Vídeo (${gameData.energyCosts.video} Energía)</button>
        `;
        container.querySelector('#init-seo-minigame').onclick = startSeoMinigame;
    } else {
        container.innerHTML = '<div class="app-placeholder"><p>Abre esta aplicación cuando un proyecto esté en la fase de "vídeo" para promocionarlo.</p></div>';
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
        container.innerHTML = '<div class="app-placeholder"><p>Abre esta aplicación cuando un proyecto esté listo para ser "publicado".</p></div>';
    }
}

function renderWarehouseApp(container) {
    // FIX: Se crea la estructura base del almacén, incluyendo el contenedor para el total.
    if (!container.querySelector('#completed-projects-list')) {
        container.innerHTML = `
            <div id="completed-projects-list"></div>
            <div id="warehouse-total-income"></div>
        `;
    }
    const listContainer = container.querySelector('#completed-projects-list');
    const totalContainer = container.querySelector('#warehouse-total-income');
    renderCompletedProjects(listContainer, totalContainer);
}

function renderStatsApp(container) {
    const template = document.getElementById('stats-template');
    container.innerHTML = template.innerHTML;
    renderSkillsUI(container.querySelector('#skills-panel'));
}

function renderShopApp(container) {
    if (!container.querySelector('.shop-category')) {
        container.innerHTML = `
            <h3><i class="fas fa-desktop"></i> Hardware</h3>
            <div id="shop-hardware" class="shop-category"></div>
            <h3><i class="fas fa-coffee"></i> Personal y Software</h3>
            <div id="shop-personal" class="shop-category"></div>
        `;
        container.addEventListener('click', (e) => {
            if (e.target.classList.contains('buy-button')) {
                buyUpgrade(e.target.dataset.itemId);
            }
        });
    }
    renderShopUI(container); 
}

function renderCoursesApp(container) {
    if (!container.querySelector('#courses-container')) {
        container.innerHTML = `
            <div id="courses-container"></div>
            <div id="active-course-container"></div>
        `;
        container.addEventListener('click', (e) => {
            const button = e.target.closest('.start-course-button');
            if (button && !button.disabled) {
                startCourse(button.dataset.courseId, button.dataset.skillType);
            }
        });
    }
    renderCoursesUI(container);
}

function renderResearchApp(container) {
     if (!container.querySelector('#research-container')) {
        container.innerHTML = `
            <div id="active-research-container"></div>
            <div id="research-container" class="research-tree"></div>
        `;
        container.addEventListener('click', (e) => {
            const button = e.target.closest('.start-research-button');
            if (button && !button.disabled) {
                startResearch(button.dataset.researchId, button.dataset.skillType);
            }
        });
    }
    renderResearchUI(container);
}

function renderNewsApp(container) {
    const bonus = gameState.currentTrend.bonus;
    const bonusClass = bonus >= 0 ? 'text-bonus' : 'text-malus';
    const bonusSign = bonus >= 0 ? '+' : '';
    container.innerHTML = `<p><strong>Tendencia:</strong> ${gameState.currentTrend.name} <span class="${bonusClass}">(${bonusSign}${bonus}% bonus)</span></p>`;
}

// -----------------------------------------------------------------------------
//  FUNCIONES DE RENDERIZADO DE UI (MOVIDAS Y CREADAS)
// -----------------------------------------------------------------------------

function renderShopUI(container) {
    ['hardware', 'personal'].forEach(category => {
        const catContainer = container.querySelector(`#shop-${category}`);
        catContainer.innerHTML = gameData.shopItems[category].map(item => {
            const isOwned = gameState.shopUpgrades.includes(item.id);
            if (item.requires && !gameState.shopUpgrades.includes(item.requires)) return '';
            const hasTieredUpgrade = gameData.shopItems[category].some(other => other.requires === item.id);
            if (isOwned && hasTieredUpgrade) return '';

            return `
                <div class="shop-item ${isOwned ? 'owned' : ''}">
                    <h4 class="item-name">${item.name}</h4>
                    <p class="item-desc">${item.desc}</p>
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

function renderCoursesUI(container) {
    const coursesContainer = container.querySelector('#courses-container');
    const activeCourseContainer = container.querySelector('#active-course-container');
    let html = '';

    for (const skillType in gameData.courses) {
        html += `<h3>${skillType.charAt(0).toUpperCase() + skillType.slice(1)}</h3>`;
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'courses-category';
        
        let courseHtml = '';
        gameData.courses[skillType].forEach(course => {
            const isCompleted = gameState.completedCourses.includes(course.id);
            const hasRequirement = course.requires ? gameState.completedCourses.includes(course.requires) : true;
            const canAfford = gameState.money >= course.cost;
            const isDisabled = isCompleted || !hasRequirement || !canAfford || gameState.activeCourse;
            
            let buttonText = 'Empezar';
            if (isCompleted) {
                buttonText = 'Completado';
            } else if (gameState.activeCourse) {
                buttonText = 'Estudiando';
            }

            courseHtml += `
                <div class="course-card ${isDisabled && !isCompleted ? 'disabled' : ''}">
                    <h4>${course.name}</h4>
                    <p>${course.desc}</p>
                    <div class="course-info">
                        <span><i class="fas fa-coins"></i> ${course.cost} €</span>
                        <span><i class="fas fa-clock"></i> ${course.duration} día(s)</span>
                        <span><i class="fas fa-star"></i> ${course.xp} XP</span>
                    </div>
                    <button class="start-course-button" data-course-id="${course.id}" data-skill-type="${skillType}" ${isDisabled ? 'disabled' : ''}>
                        ${buttonText}
                    </button>
                </div>`;
        });
        categoryDiv.innerHTML = courseHtml;
        html += categoryDiv.outerHTML;
    }
    coursesContainer.innerHTML = html;

    if (gameState.activeCourse) {
        activeCourseContainer.innerHTML = `
            <div class="active-course-display">
                <h4>Curso en Progreso</h4>
                <p><strong>${gameState.activeCourse.name}</strong></p>
                <p>Días restantes: ${gameState.activeCourse.daysRemaining}</p>
            </div>`;
    } else {
        activeCourseContainer.innerHTML = '';
    }
}

function renderResearchUI(container) {
    const researchContainer = container.querySelector('#research-container');
    const activeResearchContainer = container.querySelector('#active-research-container');
    let html = '';

    for (const skillType in gameData.researchData) {
        const tree = gameData.researchData[skillType];
        html += `<div class="research-tree-header"><i class="fas ${tree.icon}"></i> ${tree.name}</div>`;
        const nodesDiv = document.createElement('div');
        nodesDiv.className = 'research-nodes';

        let nodesHtml = '';
        tree.nodes.forEach(node => {
            const isCompleted = gameState.completedResearch.includes(node.id);
            const reqSkill = node.requires.skill;
            const reqLevel = node.requires.level;
            const reqResearch = node.requires.research;
            const hasSkillReq = gameState.skills[reqSkill].level >= reqLevel;
            const hasResearchReq = reqResearch ? gameState.completedResearch.includes(reqResearch) : true;
            const canAfford = gameState.money >= node.cost;
            const isDisabled = isCompleted || !hasSkillReq || !hasResearchReq || !canAfford || gameState.activeResearch;

            let buttonText = 'Investigar';
            if (isCompleted) {
                buttonText = 'Completado';
            } else if (gameState.activeResearch) {
                buttonText = 'Investigando';
            }

            nodesHtml += `
                <div class="research-node ${isCompleted ? 'completed' : ''} ${!hasResearchReq ? 'locked' : ''}">
                    <h5>${node.name}</h5>
                    <p>${node.desc}</p>
                    <p class="research-req">Req: Nivel ${reqLevel} de ${reqSkill}${reqResearch ? ' y ' + findResearchNode(reqResearch).node.name : ''}</p>
                    <div class="research-footer">
                        <span><i class="fas fa-coins"></i> ${node.cost}€ | <i class="fas fa-clock"></i> ${node.duration} día(s)</span>
                        <button class="start-research-button" data-research-id="${node.id}" data-skill-type="${skillType}" ${isDisabled ? 'disabled' : ''}>
                            ${buttonText}
                        </button>
                    </div>
                </div>`;
        });
        nodesDiv.innerHTML = nodesHtml;
        html += nodesDiv.outerHTML;
    }
    researchContainer.innerHTML = html;

    if (gameState.activeResearch) {
        activeResearchContainer.innerHTML = `
            <div class="active-research-display">
                <h4>Investigación en Progreso</h4>
                <p><strong>${gameState.activeResearch.name}</strong></p>
                <p>Días restantes: ${gameState.activeResearch.daysRemaining}</p>
            </div>`;
    } else {
        activeResearchContainer.innerHTML = '';
    }
}

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

function renderCompletedProjects(listContainer, totalContainer) {
    if (gameState.completedProjects.length === 0) {
        listContainer.innerHTML = '<p class="no-projects-message">Aún no has publicado ningún proyecto.</p>';
        totalContainer.innerHTML = '';
        return;
    }

    let totalIncome = 0;

    listContainer.innerHTML = gameState.completedProjects.map(p => {
        const income = calculatePassiveIncomeForProjectUI(p);
        totalIncome += income.money;
        return `
            <div class="completed-project-card">
                <span class="project-name"><i class="fas ${gameData.projectTypes[p.type].icon}"></i> ${p.name}</span>
                <div class="project-stats">
                    <span class="stat">Calidad: ${p.quality}</span>
                    <span class="stat success"><i class="fas fa-coins"></i> ${income.money}€/día</span>
                </div>
            </div>`;
    }).join('');

    totalContainer.innerHTML = `
        <span>Total por día:</span>
        <span class="total-value">+${totalIncome}€</span>
    `;
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
