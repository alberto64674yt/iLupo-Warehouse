// =================================================================================
//  RESEARCH.JS - v1.0 - Lógica para el sistema de I+D
// =================================================================================

function findResearchNode(researchId) {
    for (const skillType in gameData.researchData) {
        const node = gameData.researchData[skillType].nodes.find(n => n.id === researchId);
        if (node) {
            return { node, skillType };
        }
    }
    return null;
}

function startResearch(researchId, skillType) {
    if (gameState.activeResearch) {
        showNotification("Ya hay una investigación en curso.", "error");
        return;
    }
    if (gameState.activeCourse) {
        showNotification("No puedes investigar y estudiar al mismo tiempo.", "error");
        return;
    }

    const { node } = findResearchNode(researchId);
    if (!node) return;

    // Verificar requisitos
    const reqSkill = node.requires.skill;
    const reqLevel = node.requires.level;
    const reqResearch = node.requires.research;

    const hasSkillReq = gameState.skills[reqSkill].level >= reqLevel;
    const hasResearchReq = reqResearch ? gameState.completedResearch.includes(reqResearch) : true;
    
    if (!hasSkillReq || !hasResearchReq) {
        showNotification("No cumples los requisitos para esta investigación.", "error");
        return;
    }
    if (gameState.money < node.cost) {
        showNotification("No tienes suficiente dinero para esta investigación.", "error");
        return;
    }

    // Iniciar investigación
    gameState.money -= node.cost;
    gameState.activeResearch = {
        id: node.id,
        name: node.name,
        daysRemaining: node.duration
    };

    showNotification(`Investigación "${node.name}" iniciada.`, "info");
    updateUI();
}

function completeResearch(researchId) {
    const { node } = findResearchNode(researchId);
    if (!node) return;

    gameState.completedResearch.push(researchId);
    gameState.activeResearch = null;
    showNotification(`¡Investigación "${node.name}" completada!`, "success");
    // Aquí se podrían aplicar bonus permanentes si los hubiera
    updateUI();
}