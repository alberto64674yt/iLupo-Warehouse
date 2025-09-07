// =================================================================================
//  SHOP.JS - v4.2 - Lógica de renderizado para soportar árbol de mejoras.
// =================================================================================

function renderShop() {
    ['hardware', 'personal'].forEach(category => {
        const container = dom[`shop${category.charAt(0).toUpperCase() + category.slice(1)}`];
        container.innerHTML = gameData.shopItems[category].map(item => {
            const isOwned = gameState.shopUpgrades.includes(item.id);

            if (item.requires && !gameState.shopUpgrades.includes(item.requires)) {
                return '';
            }
            
            const hasTieredUpgrade = gameData.shopItems[category].some(otherItem => otherItem.requires === item.id);
            if (isOwned && hasTieredUpgrade) {
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
    renderShop();
    updateUI();
}
