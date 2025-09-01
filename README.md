# 📖 Manual de Usuario: iLupo Warehouse

Esta es una guía completa sobre cómo gestionar y actualizar el contenido de este portfolio.

## Lógica del Sistema

Este proyecto utiliza un **"Generador Offline"**. La lógica es simple:

1.  **Editas en tu PC:** Usas el fichero `panel.html` en tu ordenador para añadir o modificar proyectos de forma visual.
2.  **Guardas en tu PC:** El panel genera un fichero `proyectos.json` actualizado, que tú guardas en tu carpeta local.
3.  **Publicas en Internet:** Subes la carpeta completa y actualizada a un hosting como Netlify.

La **única fuente de la verdad** son siempre los ficheros que tienes en tu ordenador.

---

## ✍️ Cómo Añadir o Editar un Proyecto

Este es el flujo de trabajo que seguirás cada vez que quieras actualizar la web.

### Paso 1: Abrir el Panel de Control

En tu ordenador, abre el fichero **`panel.html`** en tu navegador (preferiblemente con "Open with Live Server" desde VS Code para que todo funcione bien). Verás el editor a la izquierda y la previsualización en vivo a la derecha.

### Paso 2: Rellenar los Campos

Introduce la información de tu nuevo proyecto en el formulario:

* **Título del proyecto:** El nombre principal de tu herramienta o creación.
* **ID para la URL:** Un nombre corto, **único**, en minúsculas y sin espacios (usa guiones). Ej: `mi-calculadora-genial`, `proyecto-alpha-2`. Esto creará la URL de la página de detalle.
* **Resumen para la tarjeta:** El texto corto que aparecerá en la página de inicio.
* **Contenido completo de la página:** Aquí es donde te explayas. Este campo soporta formato **Markdown** (ver chuleta abajo).
* **URL de la imagen principal:** El enlace directo a la imagen que se usará en la tarjeta y en la cabecera de la página de detalle.
* **URL del botón (opcional):** El enlace principal para un botón de "Visitar Enlace" en la página de detalle.

### Paso 3: Usar el Editor de "Contenido Completo" (La Chuleta)

Aquí puedes añadir texto con formato, imágenes, vídeos y más.

#### Texto con Formato
* **Negrita:** `**texto en negrita**`
* **Cursiva:** `*texto en cursiva*`
* **Listas:** Empieza cada línea con un guion (`- `).
* **Enlaces:** `[El texto que se ve](https://la-web-a-la-que-apunta.com)`

#### Imágenes Normales
Sube tu imagen a un servicio como [Imgur](https://imgur.com/upload) o [Postimages](https://postimages.org/), copia el "Enlace Directo" y pégalo con este formato:

#### Vídeos de YouTube
Copia la URL normal del vídeo desde tu navegador y pégala en su propia línea. El código la convertirá en un vídeo incrustado automáticamente.
https://www.youtube.com/watch?v=dQw4w9WgXcQ


#### Imagen con Link de Descarga
Este es el formato especial para crear una imagen en la que se puede hacer clic para descargar un archivo. Necesita dos enlaces separados por una coma.

1.  **URL de la Imagen:** El enlace a la imagen que quieres que se vea (ej: un botón de descarga que has diseñado y subido a Imgur).
2.  **URL de la Descarga:** El enlace directo al fichero que se va a descargar (ej: un `.zip` en Google Drive o Mega).

**Formato a pegar:**
[IMAGEN-DESCARGA](URL_DE_LA_IMAGEN, URL_DE_LA_DESCARGA)

**Ejemplo práctico:**
[IMAGEN-DESCARGA](https://www.google.com/search?q=https://i.imgur.com/mi-boton.png, https://www.google.com/search?q=https://ejemplo.com/programa.zip)


### Paso 4: Guardar y Publicar

1.  Una vez rellenados los campos, pulsa **"Añadir Proyecto a la Lista"**. Verás que aparece en la previsualización. Puedes añadir varios seguidos.
2.  Cuando hayas añadido todos los proyectos de la sesión, pulsa el botón verde **"Generar y Descargar Fichero"**.
3.  Guarda el fichero **`proyectos.json`** que se descarga, **reemplazando al antiguo** en tu carpeta local.
4.  Sube la **carpeta entera y actualizada** (`iLupo Warehouse`) a Netlify para publicar los cambios.
