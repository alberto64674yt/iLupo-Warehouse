# 📖 Manual de Usuario: iLupo Warehouse

Esta es la guía completa para gestionar este portfolio. El sistema está diseñado para ser 100% online, sin depender de archivos locales.

---

## ✅ Flujo de Trabajo (100% Online)

El proceso se divide en **Generar** el fichero de datos actualizado y **Subirlo** a GitHub.

### Fase 1: Generar el `proyectos.json`

1.  **Abrir el Panel de Control:**
    * Ve a la dirección de tu panel: **`https://ilupowarehouse.netlify.app/panel.html`**
    * El panel cargará automáticamente la última lista de proyectos.

2.  **Añadir, Editar o Borrar:**
    * Usa el formulario para crear un nuevo proyecto o pulsa "Editar" en un proyecto existente para modificarlo.
    * Utiliza la previsualización en vivo para ver los cambios.

3.  **Descargar el Fichero Actualizado:**
    * Cuando hayas terminado tu sesión de edición, pulsa el botón verde **"Generar y Descargar proyectos.json"**.
    * Se descargará un `proyectos.json` a tu ordenador con todos los cambios.

### Fase 2: Publicar los Cambios en GitHub

1.  **Ir a tu Repositorio de GitHub.**
2.  **Borrar el `proyectos.json` antiguo:**
    * Haz clic en el fichero `proyectos.json` de la lista.
    * Usa el menú de los tres puntos (`...`) y selecciona **"Delete file"**. Confirma el borrado.
3.  **Subir el `proyectos.json` nuevo:**
    * Vuelve a la página principal del repositorio.
    * Pulsa **"Add file" -> "Upload files"**.
    * Arrastra el `proyectos.json` que acabas de descargar a la ventana.
    * Confirma con **"Commit changes"**.

Netlify detectará el cambio y actualizará la web automáticamente en 1-2 minutos.

---

## ✨ Funciones de la Web

### Búsqueda y Vistas
* **Buscador:** Filtra los proyectos en tiempo real por su título.
* **Paginación:** Si hay más de 9 proyectos (o los que queden después de filtrar), aparecerán controles para navegar entre las páginas.
* **Selector de Vista:** Puedes cambiar entre la vista de rejilla (tarjetas) y la vista de lista (más compacta).
* **Páginas de Etiquetas:** En la página de detalle de un proyecto, puedes hacer clic en sus etiquetas para ver todos los demás proyectos con esa misma etiqueta.

### Nuevo Sistema de Filtros por Etiquetas

El sistema de filtros ahora es un árbol jerárquico que te da control total.

* **¿Cómo se añaden las etiquetas en el panel?**
    * Para crear jerarquías, usa el símbolo `>` en el campo de etiquetas. Por ejemplo: `Juegos > Minecraft > Mods`.
    * Para añadir varias etiquetas a un mismo proyecto, sepáralas por comas. Por ejemplo: `Juegos > Minecraft > Mods, Desarrollo Web > JavaScript`.
    * Esto asignaría al proyecto dos "caminos" de etiquetas distintos.

* **¿Cómo se usan los filtros en la web?**
    * **Explorar:** Haz clic en la **flecha** o en el **nombre** de una categoría para desplegar o contraer sus sub-categorías sin activar ningún filtro.
    * **Filtrar:** Marca la **casilla de verificación (checkbox)** de cualquier categoría o sub-categoría para activar ese filtro.
    * **Filtro Múltiple:** Puedes marcar **tantas casillas como quieras**, incluso de ramas diferentes, para crear filtros cruzados muy específicos. El sistema mostrará solo los proyectos que cumplan **todas** las condiciones marcadas.
    * **Ver lo que está activo:** El sistema es 100% visual. Siempre sabrás qué filtros tienes aplicados porque sus casillas estarán marcadas.
