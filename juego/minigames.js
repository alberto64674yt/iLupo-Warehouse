// =================================================================================
//  MINIGAMES.JS - Lógica para los minijuegos de depuración y SEO.
// =================================================================================

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
        setTimeout(() => { if (bug.parentElement) bug.remove(); }, 2000); // El bug desaparece si no se pulsa
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
            proj.quality = Math.floor(proj.quality * 0.8); // Penalización del 20%
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
    tagsToDisplay.sort(() => Math.random() - 0.5); // Shuffle

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
        const qualityBonus = Math.floor(score * 5); // +5 de calidad por cada etiqueta correcta
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
