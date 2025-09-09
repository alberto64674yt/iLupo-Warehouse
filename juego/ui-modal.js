// =================================================================================
//  UI-MODAL.JS - Contiene toda la lógica para el modal de creación de proyectos.
// =================================================================================

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