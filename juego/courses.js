// =================================================================================
//  COURSES.JS - Lógica para el sistema de Cursos de Habilidades.
// =================================================================================

function startCourse(courseId, skillType) {
    if (gameState.activeCourse) {
        showNotification("Ya estás realizando un curso.", "error");
        return;
    }

    const courseData = gameData.courses[skillType].find(c => c.id === courseId);

    if (!courseData) {
        console.error(`Curso no encontrado: ${courseId}`);
        return;
    }

    if (gameState.money < courseData.cost) {
        showNotification("No tienes suficiente dinero para este curso.", "error");
        return;
    }
    
    if (gameState.completedCourses.includes(courseId)) {
        showNotification("Ya has completado este curso.", "info");
        return;
    }

    gameState.money -= courseData.cost;
    gameState.activeCourse = {
        id: courseId,
        skill: skillType,
        daysRemaining: courseData.duration,
        name: courseData.name
    };

    showNotification(`¡Has empezado el curso "${courseData.name}"!`, "success");
    updateUI();
}