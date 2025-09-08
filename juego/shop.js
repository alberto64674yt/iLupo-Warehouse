// =================================================================================
//  SHOP.JS - v5.0 - Lógica de compra con registro de gastos
// =================================================================================

function buyUpgrade(itemId) {
    let item;
    for (const cat in gameData.shopItems) {
        const found = gameData.shopItems[cat].find(i => i.id === itemId);
        if (found) {
            item = found;
            break;
        }
    }

    if (!item || gameState.shopUpgrades.includes(itemId) || gameState.money < item.cost) {
        showNotification('No se puede comprar la mejora.', 'error');
        return;
    }

    gameState.money -= item.cost;
    // FIX: Se registra el coste de la mejora como un gasto del día.
    gameState.dailyExpenses.push({ reason: `Mejora: ${item.name}`, amount: item.cost });
    gameState.shopUpgrades.push(item.id);

    switch(item.effect.type) {
        case 'hardwareTimeReduction':
            gameState.hardwareTimeReduction += item.effect.value;
            break;
        case 'appMonetization':
            gameState.appMonetization = item.effect.value;
            break;
        case 'postMonetization':
            gameState.postMonetization = item.effect.value;
            break;
        case 'maxProjectsPerDay':
            gameState.maxProjectsPerDay += item.effect.value;
            if(item.effect.energy) {
                gameState.maxEnergy = item.effect.energy;
            }
            break;
        case 'maxEnergy':
            gameState.maxEnergy += item.effect.value;
            break;
    }

    if(item.effect.type === 'maxProjectsPerDay' || item.effect.type === 'maxEnergy') {
        gameState.energy = gameState.maxEnergy;
    }
    
    showNotification(`¡${item.name} comprado!`, 'success');
    refreshUI();
}
