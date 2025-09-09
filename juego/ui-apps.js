// =================================================================================
//  UI-APPS.JS - Contiene los renderizadores para el contenido de cada ventana de app.
// =================================================================================

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
            
            const projectType = proj.type || 'Utilidad';
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