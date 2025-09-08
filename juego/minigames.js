// =================================================================================
//  MINIGAMES.JS - v5.3 - Solución final de lógica de energía
// =================================================================================

function startDebugMinigame() {
    // FIX: Comprueba si el minijuego ya está activo para evitar múltiples clics y drenaje de energía.
    if (minigameInterval) {
        showNotification("La depuración ya está en curso.", "info");
        return;
    }

    if (gameState.energy < gameData.energyCosts.debug) {
        showNotification(`Se necesitan ${gameData.energyCosts.debug} de energía para depurar.`, 'error');
        return;
    }
    
    gameState.energy -= gameData.energyCosts.debug;
    refreshUI();

    const proj = gameState.activeProject;
    let bugsToSpawn = proj.bugs;
    const bugsOriginales = proj.bugs;
    let timeLeft = 30 + (gameState.skills.programming.level * 2);

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
        setTimeout(() => {
            if (bug.parentElement) bug.remove();
        }, 2000);
    }

    minigameInterval = setInterval(() => {
        timeLeft--;
        dom.debugTimer.textContent = `${timeLeft}s`;
        if (Math.random() > 0.4 && bugsToSpawn > 0) spawnBug();
        if (timeLeft <= 0) {
            endMinigame(bugsToSpawn === 0);
        }
    }, 1000);

    function endMinigame(success) {
        clearInterval(minigameInterval);
        minigameInterval = null; // Libera el bloqueo para poder jugar de nuevo
        dom.debugMinigameOverlay.classList.add('hidden');
        dom.debugPlayArea.innerHTML = '';
        dom.startDebugButton.classList.remove('hidden');
        if (success) {
            showNotification('¡Todos los bugs eliminados!', 'success');
            proj.stage = 'video';
            const xpGained = (bugsOriginales * 2) + 5;
            addXp('programming', xpGained);
        } else {
            showNotification(`Quedaron ${bugsToSpawn} bugs. ¡Calidad penalizada!`, 'error');
            proj.quality = Math.floor(proj.quality * 0.8);
            proj.stage = 'video';
            const xpGained = Math.floor((bugsOriginales - bugsToSpawn) * 2);
            if (xpGained > 0) addXp('programming', xpGained);
        }
        refreshUI();
    }
}

function startSeoMinigame() {
    if (minigameInterval) {
        showNotification("El minijuego de SEO ya está en curso.", "info");
        return;
    }

    if (gameState.energy < gameData.energyCosts.video) {
        showNotification(`Se necesitan ${gameData.energyCosts.video} de energía para el vídeo.`, 'error');
        return;
    }
    
    gameState.energy -= gameData.energyCosts.video;
    refreshUI();

    dom.videoSeoMinigameOverlay.classList.remove('hidden');
    dom.finishSeoButton.classList.add('hidden');
    let score = 0;
    let timeLeft = 15;
    const goodTagsCount = 5;

    const allTags = ["optimización", "código limpio", "gracioso", "tutorial", "épico", "gameplay", "crypto", "blockchain", "clickbait", "polémica", "drama", "bugs", "lento", "aburrido"];
    const goodTags = allTags.slice(0, 6);
    
    let tagsToDisplay = goodTags.slice(0, goodTagsCount);
    while (tagsToDisplay.length < 12) {
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
            if (goodTags.includes(button.textContent)) {
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

        const xpGained = (score * 3) + (score === goodTagsCount ? 5 : 0);
        if (xpGained > 0) addXp('design', xpGained);

        if (score < 3) {
            gameState.activeProject.seoPenalty = 0.5;
            showNotification(`SEO terrible. ¡Bonus de calidad: +${qualityBonus}, pero penalización de seguidores!`, 'error');
        } else {
            showNotification(`SEO completo. Bonus de calidad: +${qualityBonus}`, 'success');
        }

        dom.finishSeoButton.classList.remove('hidden');
        dom.finishSeoButton.onclick = () => {
            gameState.activeProject.stage = 'post';
            dom.videoSeoMinigameOverlay.classList.add('hidden');
            refreshUI();
        };
    }
}
