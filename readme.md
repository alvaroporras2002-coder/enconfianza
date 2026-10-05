# En Confianza — publicación paso a paso

Web independiente de orientación para Costa Rica. Español e inglés, nueve fotos ilustrativas con IA, siete guías por tema, cinco servicios, tres videos educativos, modo claro/oscuro y salida rápida.

## 1. Los archivos

Descargá estos cinco archivos y guardalos en una misma carpeta llamada `en-confianza`:

| Archivo | Función | Ubicación en GitHub |
| --- | --- | --- |
| index.html | Página, nueve fotos optimizadas y guías bilingües | Raíz |
| styles.css | Diseño adaptable | Raíz |
| app.js | Idiomas, guías, búsqueda, videos y preferencias | Raíz |
| config.js | Identificador opcional de Analytics | Raíz |
| favicon.svg | Ícono de la pestaña | Raíz |

Este README es la guía; podés subirlo también a la raíz. No necesitás ZIP, carpetas de imágenes, MP4, instalación ni compilación. No subás los archivos intermedios de preparación.

En Windows, activá Ver → Mostrar → Extensiones de nombre de archivo. Los nombres deben terminar exactamente como en la tabla: `index.html`, no `index.html.txt`. Conservá UTF-8 si editás los textos. Para probar localmente, abrí index.html: los archivos CSS y JS deben estar al lado. Los reproductores de YouTube se comprueban en el sitio publicado porque necesitan identificar el origen web; siempre hay un enlace para verlos directamente en YouTube.

## 2. Crear el repositorio

1. Entrá a https://github.com/new con tu cuenta.
2. Nombre recomendado: `en-confianza`.
3. Elegí **Public** para usar GitHub Pages con el plan gratuito.
4. Marcá **Add a README file** para iniciar el repositorio.
5. Pulsá **Create repository**.

No coloqués documentos privados, contraseñas ni claves en el repositorio. El código y las fotos serán públicos.

## 3. Subir archivos, sin ZIP

1. Abrí el repositorio → **Add file → Upload files**.
2. Arrastrá juntos index.html, styles.css, app.js, config.js y favicon.svg.
3. Verificá que queden directamente en la raíz, sin una carpeta adicional.
4. Escribí una descripción como `Crear En Confianza` y elegí **Commit changes**.
5. Si agregás este README.md, reemplaza el README inicial mediante su editor o la carga de archivos.

También podés usar **Add file → Create new file**, escribir el nombre exacto y pegar el código completo. Para index.html es más cómodo cargar el archivo descargado: contiene las fotos.

## 4. Activar GitHub Pages

1. Repositorio → **Settings → Pages**.
2. **Source → Deploy from a branch**.
3. Elegí **main** y **/(root)**.
4. Pulsá **Save**.
5. Esperá a que termine la publicación y abrí la dirección indicada por GitHub.

Si tu cuenta es `alvaroporras2002-coder` y el repositorio se llama `en-confianza`, la dirección esperada será `https://alvaroporras2002-coder.github.io/en-confianza/`. Esta dirección todavía no acredita una publicación: comprobá el enlace real mostrado en Settings → Pages. No hace falta comprar un dominio para comenzar.

Documentación oficial: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## 5. Medir visitas

La web funciona sin Analytics. Para activarlo:

1. En Google Analytics, creá una propiedad GA4 y un flujo Web para la dirección publicada.
2. Copiá el identificador que empieza con `G-`.
3. **Desactivá la medición mejorada completa en ese flujo.** No queremos medir enlaces a servicios de ayuda, búsquedas, temas, videos ni formularios. Revisá también que no haya medición automática de cambios de historial activada en la configuración de la etiqueta.
4. Editá config.js y sustituí el valor vacío. Ejemplo de formato, no un ID real:

```js
window.EN_CONFIANZA_CONFIG = Object.freeze({ga4Id: 'G-TUIDREAL'});
```

5. Guardá el cambio en GitHub.
6. En la web, abrí **Preferencias → Aceptar medición** y revisá el informe de tiempo real en Analytics.

Se envía una visita general con ubicación y título normalizados; no enviamos el tema seleccionado, la búsqueda ni el fragmento de URL. Google puede recopilar información técnica y cookies. No se carga antes de la aceptación; se respeta Do Not Track y Global Privacy Control. La medición representa las visitas de quienes acepten y permitan la conexión; no es un conteo exhaustivo. Para retirarla, Preferencias → Desactivar y recargar.

No agregués otra etiqueta de Google o un plugin de seguimiento por encima de este código: podría duplicar eventos o cambiar el comportamiento de privacidad. La implementación no garantiza cumplimiento legal universal y debe revisarse si cambiás los servicios o la recopilación de datos.

Fuentes oficiales:
- https://developers.google.com/analytics/devguides/collection/ga4/views
- https://support.google.com/analytics/answer/9216061

## 6. Fotos y videos

Las nueve fotos están optimizadas en WebP y guardadas dentro de index.html. No representan pacientes, testimonios ni profesionales. Se usaron para portada, siete temas y acompañamiento.

Videos incluidos con carga voluntaria del reproductor original:
- UNICEF, «¿Qué pasa por tu mente?»: https://www.youtube.com/watch?v=RtCYlrKD8kI — 3:21.
- IAFA, «Habilidades para la Vida»: https://www.youtube.com/watch?v=ZNNEJzNZKuc — 3:40.
- IAFA, «Todo lo que necesitás está en vos»: https://www.youtube.com/watch?v=b5ew6P8SuGo — 1:31.

Las copias MP4 se revisaron mediante metadatos y fotogramas, sin escuchar todo el audio. No se republican las copias descargadas. La disponibilidad y el permiso de inserción dependen de YouTube y del canal original. Si falla un reproductor, el enlace directo sigue visible.

El cuarto MP4, OPS/OMS `tJQcIsmzM6M`, es el cortometraje dramático «ULALA, Retrato de una vida». Se excluyó porque muestra un método de suicidio e incluye cifras históricas sin fecha clara. La recomendación inicial de ese video fue inadecuada para una web de ayuda destinada a todas las edades.

La tipografía inicial usa Trebuchet MS y fuentes de sistema como alternativas; no descarga fuentes ni imágenes desde terceros. Podemos sustituirla luego por Nunito alojada en el propio repositorio si se obtiene el archivo y su licencia.

## 7. Fuentes de Costa Rica

Consultadas el 5 de octubre de 2026. Confirmá cambios con las instituciones; consultar una fuente no garantiza que una línea esté atendiendo ahora.

| Servicio | Contacto | Alcance / horario publicado | Fuente |
| --- | --- | --- | --- |
| Emergencias | 9-1-1 | Emergencias; no se confunde con orientación ordinaria | https://www.mep.go.cr/programas-proyectos/aqui-estoy |
| Aquí Estoy, Colegio de Psicología | 800-273-7869 | Población general. Lun–vie 14:00–22:00; sáb 09:00–16:00 | https://www.mep.go.cr/programas-proyectos/aqui-estoy |
| PANI | 1147 | Personas menores de edad. Lun–vie 07:00–22:00, incluidos feriados, según su publicación de 2023 | https://pani.go.cr/linea-gratuita-1147-del-pani-al-servicio-de-los-ninos-ninas-y-adolescentes/ |
| MEP Aquí Estoy | 2459-1598; alternativa 2459-1599 | Estudiantes matriculados y sus familias. Lun–vie 07:00–15:00 | https://www.mep.go.cr/programas-proyectos/aqui-estoy |
| IAFA | 800-4232-800 | Consumo de sustancias. Lun–vie 07:00–15:00; no intoxicaciones | https://iafa.go.cr/obtener-ayuda/linea-de-orientacion/ |
| INAMU | Sitio oficial | Servicios para mujeres. Emergencias vinculadas al 9-1-1, 24/7; otros horarios dependen del servicio | https://www.inamu.go.cr/contacto |

Fuentes de guías: OMS, UNICEF e IAFA, enlazadas dentro de cada tema. El texto es orientación general; no ha sido revisado por un equipo clínico contratado. No se solicitan historias personales ni datos médicos, y no hay un formulario de atención.

## 8. Comprobación al publicar

- Abrí la web desde celular y computadora; comprobá que no haya desplazamiento horizontal.
- Cambiá entre español e inglés y entre claro y oscuro.
- Abrí cada guía y su fuente.
- Probá búsquedas con y sin tildes; filtrá por tema.
- Comprobá los números en pantalla. Probar un enlace telefónico no implica llamar a emergencias sin necesidad.
- Cargá los tres videos, cerralos y comprobá sus enlaces directos.
- Usá Tab, Enter y Escape para navegar y cerrar las guías; probá zoom al 200%.
- Verificá que Analytics no conecte antes de aceptarlo y que deje de cargar al retirar la elección.
- Probá Salir rápido: abre Google. No borra historial ni protege frente a dispositivos supervisados.

Se revisaron sintaxis, estructura, rutas y flujos con un entorno DOM simulado; no se ejecutó un navegador real porque no había un navegador disponible. La revisión visual y la reproducción en el sitio publicado siguen pendientes.

## 9. Dominio y mantenimiento

Cuando compres un dominio, configuraremos Custom domain en GitHub Pages y los registros DNS según su documentación oficial. En ese momento añadiremos las URL canónicas y el sitemap para ese dominio; no incluimos direcciones ficticias ahora.

Revisá regularmente teléfonos, horarios, enlaces y videos. Al confirmar cambios, actualizá la fecha visible y los datos en app.js. Para modificar guías o fotos, editá el JSON integrado en index.html, manteniendo su estructura. No habilités donaciones, anuncios ni recepción de casos sin revisar el alcance del proyecto.
