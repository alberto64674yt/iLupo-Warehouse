// =================================================================================
//  UI.JS - v5.1 - Añade funciones para renderizar Habilidades y Cursos (Completo)
// =================================================================================

function updateUI() {
    dom.money.innerHTML = `<i class="fas fa-coins"></i> ${Math.floor(gameState.money)} €`;
    dom.followers.innerHTML = `<i class="fas fa-users"></i> ${gameState.followers}`;
    dom.energy.innerHTML = `<i class="fas fa-bolt"></i> ${gameState.energy} / ${gameState.maxEnergy}`;
    dom.date.innerHTML = `Día ${gameState.day}`;
    dom.newsContent.innerHTML = `<p><strong>Tendencia:</strong> ${gameState.currentTrend.name} <span>(+${gameState.currentTrend.bonus}% bonus)</span></p>`;
    
    updateActiveProjectUI();
    renderCompletedProjects();
    renderSkillsUI();
    renderCoursesUI();
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
                <button class="action-button debug-button" id="init-debug-minigame"><i class="fas fa-spider"></i> Iniciar Depuración (${gameData.energyCosts.debug} Energía)</button>`;
            break;
        case 'video':
            html += `<p>¡Proyecto limpio! Ahora a grabar el vídeo y optimizar el SEO para maximizar el impacto.</p>
                <button class="action-button video-button" id="init-seo-minigame"><i class="fas fa-video"></i> Producir Vídeo (${gameData.energyCosts.video} Energía)</button>`;
            break;
        case 'post':
            html += `<p>El vídeo está listo. ¡Es hora de lanzar el proyecto al mundo!</p>
                <button class="action-button publish-button" id="publish-project-button"><i class="fas fa-rocket"></i> Publicar (${gameData.energyCosts.publish} Energía)</button>`;
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
        const income = calculatePassiveIncomeForProjectUI(p);
        return `
        <div class="completed-project-card">
            <span><i class="fas ${gameData.projectTypes[p.type].icon}"></i> ${p.name}</span>
            <span class="stat">Calidad: ${p.quality}</span>
            <span class="stat success"><i class="fas fa-coins"></i> ${income.money}€/día</span>
        </div>
        `;
    }).join('');
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

function showDailySummary(incomeBreakdown, expenses, expenseReason, totalIncome, totalFollowers, eventMessage) {
    dom.summaryTitle.textContent = `Resumen del Día ${gameState.day}`;
    let contentHtml = '';

    if(eventMessage) {
        contentHtml += `<div class="summary-event">${eventMessage}</div>`;
    }

    contentHtml += '<h4><i class="fas fa-arrow-up"></i> Ingresos</h4><ul>';
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

function renderSkillsUI() {
    let html = '<h3><i class="fas fa-star"></i> Habilidades</h3>';
    for (const skillName in gameState.skills) {
        const skill = gameState.skills[skillName];
        const xpNeeded = gameData.skillData.xpCurve[skill.level] || 'MAX';
        const progressPercent = xpNeeded === 'MAX' ? 100 : (skill.xp / xpNeeded) * 100;

        html += `
            <div class="skill-item">
                <div class="skill-header">
                    <span class="skill-name">${skillName}</span>
                    <span class="skill-level">Nivel ${skill.level}</span>
                </div>
                <div class="xp-bar-container">
                    <div class="xp-bar" style="width: ${progressPercent}%;"></div>
                </div>
                <div class="skill-xp">${skill.xp} / ${xpNeeded} XP</div>
            </div>
        `;
    }
    dom.skillsPanel.innerHTML = html;
}

function renderCoursesUI() {
    let html = '<h4>Cursos Disponibles</h4>';
    let availableCourses = 0;
    
    for (const skillType in gameData.courses) {
        gameData.courses[skillType].forEach(course => {
            const isCompleted = gameState.completedCourses.includes(course.id);
            if (isCompleted) return;

            const hasRequirement = course.requires ? gameState.completedCourses.includes(course.requires) : true;
            if (!hasRequirement) return;

            availableCourses++;
            html += `
                <div class="course-card">
                    <h4>${course.name}</h4>
                    <p>${course.desc}</p>
                    <div class="course-info">
                        <span><i class="fas fa-coins"></i> ${course.cost} €</span>
                        <span><i class="fas fa-clock"></i> ${course.duration} día(s)</span>
                        <span><i class="fas fa-star"></i> +${course.xp} XP</span>
                    </div>
                    <button class="start-course-button" data-course-id="${course.id}" data-skill-type="${skillType}" ${gameState.activeCourse ? 'disabled' : ''}>
                        ${gameState.activeCourse ? 'Estudiando...' : 'Iniciar Curso'}
                    </button>
                </div>
            `;
        });
    }

    if (availableCourses === 0) {
        html += '<p>No hay nuevos cursos disponibles por ahora.</p>';
    }
    
    dom.coursesContainer.innerHTML = html;
    
    if (gameState.activeCourse) {
        dom.activeCourseContainer.innerHTML = `
            <div class="active-course-display">
                <h4>Actualmente estudiando:</h4>
                <p><strong>${gameState.activeCourse.name}</strong></p>
                <p>Tiempo restante: ${gameState.activeCourse.daysRemaining} día(s)</p>
            </div>
        `;
    } else {
        dom.activeCourseContainer.innerHTML = '';
    }
}
