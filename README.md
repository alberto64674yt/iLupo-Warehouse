# 📖 Manual de Usuario: iLupo Warehouse

Esta es la guía completa para gestionar este portfolio. El sistema está diseñado para ser 100% online, sin depender de archivos locales.

---

## ✅ Flujo de Trabajo (100% Online)

El proceso se divide en **Generar** el fichero de datos actualizado y **Subirlo** a GitHub.

### Fase 1: Generar el `proyectos.json`

1.  **Abrir el Panel de Control:**
    * Ve a la dirección de tu panel: **`https://[TU_DIRECCIÓN_WEB].netlify.app/panel.html`**
    * El panel cargará automáticamente la última lista de proyectos.

2.  **Añadir, Editar o Borrar:**
    * Usa el formulario para crear un nuevo proyecto o pulsa "Editar" en un proyecto existente para modificarlo.
    * Utiliza la previsualización en vivo para ver los cambios.

3.  **Descargar el Fichero Actualizado:**
    * Cuando hayas terminado tu sesión de edición, pulsa el botón verde **"Generar y Descargar Fichero"**.
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

## ✨ Funciones Avanzadas de la Web

* **Buscador:** Filtra los proyectos en tiempo real por su título.
* **Filtro por Etiquetas:** Haz clic en una o varias etiquetas para ver solo los proyectos que las contengan. La barra de etiquetas tiene scroll lateral si hay muchas.
* **Paginación:** Si hay más de 9 proyectos, aparecerán controles para navegar entre las páginas.
* **Selector de Vista:** Puedes cambiar entre la vista de rejilla (tarjetas) y la vista de lista (más compacta).
* **Páginas de Etiquetas:** En la página de detalle de un proyecto, puedes hacer clic en sus etiquetas para ver todos los demás proyectos con esa misma etiqueta.
