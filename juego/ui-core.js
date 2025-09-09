// =================================================================================
//  UI-CORE.JS - Contiene el bucle de refresco principal y renderizadores de UI generales.
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
