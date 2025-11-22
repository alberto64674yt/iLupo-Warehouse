# iLupo Warehouse 📦

> **Personal Development Hub & Project Portfolio. | Centro de desarrollo y Portfolio personal.**

[![Status: Live](https://img.shields.io/badge/Status-Online-success)](https://ilupowarehouse.netlify.app)
[![System: JSON-Driven](https://img.shields.io/badge/System-JSON_CMS-blue)]()

---

### 🌍 Language / Idioma
[🇬🇧 **English**](#-english) | [🇪🇸 **Español**](#-español)

---

<a name="english"></a>
## 🇬🇧 English

**iLupo Warehouse** is the central hub where I publish and manage all my development projects. The system is designed to be **100% online** with a custom workflow, removing the need for complex local setups or databases.

### 📖 User Manual: Workflow

The process is divided into **Generating** the updated data file and **Uploading** it to GitHub.

#### Phase 1: Generate the `proyectos.json`
1.  **Open the Control Panel:**
    Go to: [https://ilupowarehouse.netlify.app/panel.html](https://ilupowarehouse.netlify.app/panel.html)
    *(The panel automatically loads the current project list).*
2.  **Add, Edit, or Delete:**
    Use the form to create new projects or click "Edit" on existing ones. The live preview shows changes instantly.
3.  **Download Updated File:**
    When finished, click the green button **"Generate and Download proyectos.json"**.
    A new file will be saved to your computer with all changes applied.

#### Phase 2: Publish to GitHub
1.  **Go to your Repository.**
2.  **Update the File:**
    * *Option A (Replace):* Click "Add file" > "Upload files", drag the new `proyectos.json` and commit.
    * *Option B (Manual):* Delete the old file first, then upload the new one.
3.  **Commit Changes:**
    Confirm the action. Netlify will detect the change and update the live website automatically in 1-2 minutes.

### ✨ Web Features

* **Search:** Real-time project filtering by title.
* **Pagination:** Automatically appears if there are more than 9 projects (or remaining results after filtering).
* **View Modes:** Toggle between **Grid View** (Cards) and **List View** (Compact).
* **Tag Navigation:** Clicking a tag on a project detail page shows all other projects with that tag.

### 🧬 Advanced Tag System

The filtering system uses a hierarchical tree structure for total control.

* **Creating Hierarchies (In Panel):**
    Use the `>` symbol in the tags field.
    * *Example:* `Games > Minecraft > Mods`
* **Multiple Paths:**
    Separate different tag paths with commas.
    * *Example:* `Games > Minecraft > Mods, Web Dev > JavaScript`
* **How to Filter (In Web):**
    * **Explore:** Click the arrow or name to expand/collapse categories without filtering.
    * **Filter:** Check the **checkbox** to activate a filter.
    * **Multi-Select:** You can check multiple boxes from different branches. The system will show only projects that match **ALL** selected conditions.

---

<a name="español"></a>
## 🇪🇸 Español

**iLupo Warehouse** es el centro de operaciones donde publico y gestiono todos mis desarrollos. El sistema está diseñado para ser **100% online**, con un flujo de trabajo propio que elimina la necesidad de archivos locales complejos o bases de datos.

### 📖 Manual de Usuario: Flujo de Trabajo

El proceso se divide en **Generar** el fichero de datos actualizado y **Subirlo** a GitHub.

#### Fase 1: Generar el `proyectos.json`
1.  **Abrir el Panel de Control:**
    Ve a la dirección: [https://ilupowarehouse.netlify.app/panel.html](https://ilupowarehouse.netlify.app/panel.html)
    *(El panel cargará automáticamente la última lista de proyectos).*
2.  **Añadir, Editar o Borrar:**
    Usa el formulario para crear un nuevo proyecto o pulsa "Editar" en uno existente. Usa la previsualización en vivo para ver los cambios.
3.  **Descargar el Fichero Actualizado:**
    Cuando termines tu sesión, pulsa el botón verde **"Generar y Descargar proyectos.json"**.
    Se descargará un archivo a tu ordenador con todos los cambios.

#### Fase 2: Publicar en GitHub
1.  **Ir a tu Repositorio de GitHub.**
2.  **Actualizar el Fichero:**
    * *Opción A (Reemplazar):* Pulsa "Add file" > "Upload files", arrastra el nuevo `proyectos.json` y confirma.
    * *Opción B (Manual):* Borra el `proyectos.json` antiguo primero y luego sube el nuevo.
3.  **Confirmar Cambios (Commit):**
    Netlify detectará el cambio y actualizará la web automáticamente en 1-2 minutos.

### ✨ Funciones de la Web

* **Buscador:** Filtra los proyectos en tiempo real por su título.
* **Paginación:** Si hay más de 9 proyectos (o los resultados restantes), aparecerán controles para navegar entre páginas.
* **Selector de Vista:** Cambia entre **Vista Rejilla** (Tarjetas) y **Vista Lista** (más compacta).
* **Páginas de Etiquetas:** Al hacer clic en una etiqueta dentro de un proyecto, verás todos los demás proyectos que comparten esa etiqueta.

### 🧬 Nuevo Sistema de Filtros por Etiquetas

El sistema de filtros es ahora un árbol jerárquico que te da control total.

* **Crear Jerarquías (En el Panel):**
    Usa el símbolo `>` en el campo de etiquetas.
    * *Ejemplo:* `Juegos > Minecraft > Mods`
* **Etiquetas Múltiples:**
    Separa las distintas rutas con comas.
    * *Ejemplo:* `Juegos > Minecraft > Mods, Desarrollo Web > JavaScript`
    *(Esto asigna al proyecto dos "caminos" distintos).*
* **Cómo Filtrar (En la Web):**
    * **Explorar:** Haz clic en la flecha o nombre para desplegar/contraer sin filtrar.
    * **Filtrar:** Marca la **casilla de verificación (checkbox)** para activar ese filtro.
    * **Filtro Múltiple:** Puedes marcar tantas casillas como quieras de ramas diferentes. El sistema mostrará solo los proyectos que cumplan **TODAS** las condiciones marcadas.
    * **Visual:** Siempre sabrás qué filtros están activos porque sus casillas estarán marcadas.

---

<p align="center">
  Developed by alberto64674yt | Powered by JSON & Vanilla JS
</p>
