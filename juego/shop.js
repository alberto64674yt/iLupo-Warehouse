// =================================================================================
//  SHOP.JS - v4.3 - Lógica de compra (UI movida a ui.js)
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
    refreshUI(); // FIX: Llamada a la función correcta de refresco de UI
}
