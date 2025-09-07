// =================================================================================
//  EVENTS.JS - Lógica para el sistema de eventos diarios aleatorios.
// =================================================================================

function handleDailyEvent(totals) {
    const eventChance = 0.25; // 25% de probabilidad de que ocurra un evento cada día
    let eventMessage = null;

    if (Math.random() < eventChance) {
        const eventType = Math.random() < 0.5 ? 'positive' : 'negative';
        const eventPool = gameData.dailyEvents[eventType];
        const randomEvent = eventPool[Math.floor(Math.random() * eventPool.length)];

        // Aplicamos el efecto del evento a los totales del día
        totals = randomEvent.effect(totals);
        eventMessage = randomEvent.message;
    }

    // Devolvemos los totales (modificados o no) y el mensaje del evento (si lo hubo)
    return {
        totals,
        eventMessage
    };
}
