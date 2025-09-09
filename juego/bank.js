// =================================================================================
//  BANK.JS - v1.0 - Lógica para solicitar préstamos
// =================================================================================

function takeLoan(loanId) {
    if (gameState.activeLoan) {
        showNotification("Ya tienes un préstamo activo. Debes liquidarlo antes de solicitar otro.", "error");
        return;
    }

    const loanData = gameData.loans.find(l => l.id === loanId);
    if (!loanData) {
        console.error(`No se encontraron datos para el préstamo con id: ${loanId}`);
        return;
    }

    // 1. Recibir el dinero
    gameState.money += loanData.amount;

    // 2. Registrar el ingreso en el resumen diario (como un gasto negativo para que aparezca en verde)
    gameState.dailyExpenses.push({ reason: `Préstamo Recibido (${loanData.name})`, amount: -loanData.amount });

    // 3. Establecer el estado del préstamo activo
    gameState.activeLoan = {
        id: loanData.id,
        repaymentAmount: loanData.repayment,
        repaymentDay: gameState.day + loanData.duration
    };

    // 4. Notificar al jugador y refrescar la UI
    showNotification(`Has recibido un préstamo de ${loanData.amount}€.`, 'success');
    refreshUI();
}