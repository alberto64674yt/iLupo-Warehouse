// =================================================================================
//  SHOP.JS - v4.0 - Lógica de compra ajustada al nuevo balance.
// =================================================================================

function renderShop() {
    ['hardware', 'personal'].forEach(category => {
        const container = dom[`shop${category.charAt(0).toUpperCase() + category.slice(1)}`];
        container.innerHTML = gameData.shopItems[category].map(item => {
            const isOwned = gameState.shopUpgrades.includes(item.id);
            // Lógica para no mostrar mejoras de proyectos/día si ya se tiene
            if (item.effect.type === 'maxProjectsPerDay' && gameState.maxProjectsPerDay >= 2 && !isOwned) {
                return '';
            }

            return `
                <div class="shop-item ${isOwned ? 'owned' : ''}">
                    <div class="item-name">${item.name}</div>
                    <div class="item-desc">${item.desc}</div>
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

    // Aplicar efecto
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
            // Aumenta la energía máxima al comprar esta mejora
            if(item.effect.energy) {
                gameState.maxEnergy = item.effect.energy;
            }
            break;
        case 'maxEnergy':
            gameState.maxEnergy += item.effect.value;
            break;
    }

    // Rellena siempre la energía al comprar una mejora que la afecte
    if(item.effect.type === 'maxProjectsPerDay' || item.effect.type === 'maxEnergy') {
        gameState.energy = gameState.maxEnergy;
    }
    
    showNotification(`¡${item.name} comprado!`, 'success');
    renderShop();
    updateUI();
}
