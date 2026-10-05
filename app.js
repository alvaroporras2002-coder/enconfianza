/*
 * En Confianza · aplicación estática.
 * Sin cuentas, formularios de consulta ni backend.
 */

(() => {
  'use strict';

  const $ = selector => document.querySelector(selector);
  const clone = value => JSON.parse(JSON.stringify(value));

  const esc = value => String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character]);

  const safeURL = value => {
    try {
      const url = new URL(value);
      return url.protocol === 'https:' && !url.username && !url.password
        ? url.href
        : '';
    } catch {
      return '';
    }
  };

  const read = key => {
    try {
      return JSON.parse(localStorage.getItem(key));
    } catch {
      return null;
    }
  };

  const write = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  };

  const remove = key => {
    try {
      localStorage.removeItem(key);
    } catch {}
  };

  if (!window.EC_CONTENT?.topics || !window.EC_MEDIA) return;

  const original = clone(window.EC_CONTENT);
  const originalMedia = { ...window.EC_MEDIA };

  let data = clone(original);
  let media = { ...originalMedia };

  const topicIds = original.topics.map(topic => topic.id);
  const imageIds = Object.keys(originalMedia);
  const cfg = window.EC_CONFIG || {};
  const preferences = read('ec.preferences.v2') || {};

  let lang = preferences.lang === 'en' ? 'en' : 'es';
  let theme = preferences.theme === 'dark' ? 'dark' : 'light';
  let scale = [1, 1.1, 1.2].includes(preferences.scale)
    ? preferences.scale
    : 1;
  let motion = preferences.motion === 'reduce' ? 'reduce' : 'auto';

  const storedBookmarks = read('ec.bookmarks.v2');

  let bookmarks = Array.isArray(storedBookmarks)
    ? [...new Set(storedBookmarks.filter(value =>
        typeof value === 'string' &&
        /^(topic|resource):[a-z]{2,24}$/.test(value)
      ))]
    : [];

  let pendingForm = null;
  let consent = read('ec.analytics.v2') === true;
  let analyticsLoaded = false;
  let timer = null;
  let toastTimer = null;
  let previousFocus = null;
  let editorTab = 'resources';
  let editLang = 'es';
  let editorId = '';
  let dirty = false;

  const dir = {
    query: '',
    topic: 'all',
    audience: 'all'
  };

  /*
   * Textos de la interfaz.
   * Las guías y los contactos están en content.js.
   */

  const words = {
    es: {
      home: 'Inicio',
      accessibility: 'Accesibilidad',
      reloadAnalytics: 'Recargar sin medición',
      analyticsRevocation: 'Al retirar el permiso desactivamos la medición y borramos las cookies accesibles. El código de Google ya cargado permanece en memoria hasta recargar; podés finalizarlo con Recargar sin medición.',
      reloadWarning: 'Recargar puede descartar contenido del editor que no guardaste o exportaste. ¿Recargar ahora?',
      accessibilityTitle: 'Un espacio más fácil de usar',
      accessibilityText: 'Podés recorrer el sitio con Tab y Enter, cerrar los diálogos con Escape y saltar al contenido con el primer enlace. Preferencias permite cambiar el color, aumentar el texto y reducir el movimiento. También respetamos la preferencia de movimiento del dispositivo. Las guías se pueden imprimir. Estos controles ayudan a usar el sitio; no equivalen a una auditoría externa de accesibilidad.',
      pending: 'Tenés campos sin aplicar. Aplicá los cambios o descartalos antes de cambiar de elemento, exportar o guardar.',
      discard: 'Descartar campos sin aplicar',
      helpCTA: 'Quiero ayudar a alguien',
      findCTA: 'Busco ayuda',
      allGuides: 'Ver las siete guías',
      coverage: 'Alcance',
      national: 'Cobertura nacional',
      regional: 'Alcance regional: consultá la ubicación',
      unspecified: 'Confirmá el alcance con el servicio',
      topics: 'Explorar temas',
      resources: 'Encontrar ayuda',
      help: 'Acompañar',
      well: 'Bienestar',
      videos: 'Videos',
      about: 'El proyecto',
      saved: 'Guardados',
      search: 'Buscar',
      close: 'Cerrar',
      read: 'Leer la guía',
      all: 'Todos',
      viewAll: 'Ver todos los recursos',
      source: 'Fuente',
      sources: 'Fuentes y alcance',
      call: 'Llamar',
      site: 'Información oficial',
      save: 'Guardar',
      unsave: 'Quitar de guardados',
      empty: 'No encontramos resultados',
      try: 'Probá otra palabra o quitá los filtros.',
      checked: 'Fuentes consultadas',
      independent: 'Iniciativa independiente',
      back: 'Volver a temas',
      share: 'Compartir',
      print: 'Imprimir guía',
      signs: 'Qué podés notar',
      steps: 'Un siguiente paso',
      avoid: 'Qué conviene evitar',
      companion: 'Si acompañás a alguien',
      onPage: 'En esta guía',
      privacy: 'Privacidad',
      settings: 'Preferencias',
      editor: 'Editar este sitio',
      hero: 'A veces, el primer paso<br>es <em>poder hablar.</em>',
      heroIntro: 'Un espacio cercano para entender lo que te pasa, acompañar a alguien y encontrar apoyo en Costa Rica. Sin tener que tener todas las respuestas.',
      heroNote: 'No tenés que resolverlo todo hoy.',
      heroCaption: 'Podés empezar por una pregunta.',
      intro: 'Para vos, para alguien cercano, para cualquier momento en que haga falta apoyo.',
      topicIntro: 'Elegí lo que se acerca a lo que estás viviendo. Podés leer a tu ritmo y volver cuando lo necesités.',
      resourceIntro: 'Contactos públicos de Costa Rica, con horarios, público de atención y fuentes para que el siguiente paso sea más claro.',
      whatNeed: '¿Qué necesitás hoy?',
      whatNeedIntro: 'No hace falta saber exactamente por dónde empezar.',
      self: 'Quiero entender lo que siento',
      selfText: 'Guías sencillas para poner en palabras el malestar y conocer opciones de apoyo.',
      find: 'Necesito hablar con alguien',
      findText: 'Revisá los servicios y elegí una opción que atienda a tu público y situación.',
      someone: 'Quiero acompañar a alguien',
      someoneText: 'Escuchar, ofrecer ayuda concreta y reconocer tus propios límites.',
      urgent: 'Si hay peligro inmediato',
      faq: 'Preguntas que también cuentan',
      faqIntro: 'Buscar apoyo puede traer muchas dudas. Aquí podés empezar con algunas respuestas.',
      projectTitle: 'Un espacio cercano. Un propósito sencillo.',
      projectText: 'En Confianza es una iniciativa personal e independiente para facilitar el acceso a información y recursos de ayuda en Costa Rica.',
      projectCTA: 'Conocé el proyecto',
      videoIntro: 'Recursos educativos en español. Elegí cuándo reproducirlos.',
      play: 'Reproducir',
      externalVideo: 'Al reproducir, conectás con YouTube. También podés abrir el video en su sitio.',
      openVideo: 'Abrir en YouTube',
      stopVideo: 'Cerrar reproductor',
      languageVideo: 'En español',
      query: 'Palabra o nombre del servicio',
      filterTopic: 'Tema',
      filterAudience: 'Público',
      general: 'Población general',
      children: 'Niñez y adolescencia',
      students: 'Estudiantes y familias',
      women: 'Mujeres',
      clear: 'Limpiar filtros',
      count: 'servicios encontrados',
      country: 'Recursos de Costa Rica',
      hours: 'Horario',
      cost: 'Costo publicado',
      localEdit: 'Edición local: confirmá los datos con la institución.',
      savedIntro: 'Una lista en este dispositivo, para volver a las guías y contactos que elegiste.',
      noSaved: 'Todavía no guardaste nada',
      savedDevice: 'Esta lista puede verla quien use este navegador. No guardamos notas personales.',
      clearSaved: 'Borrar guardados',
      appear: 'Ajustá el espacio a vos',
      theme: 'Color del sitio',
      light: 'Claro',
      dark: 'Oscuro',
      size: 'Tamaño del texto',
      normal: 'Normal',
      larger: 'Más grande',
      largest: 'Grande',
      animation: 'Movimiento',
      system: 'Según tu dispositivo',
      reduce: 'Reducido',
      optionalAnalytics: 'Medición opcional',
      analyticsText: 'Si se configura, permite contar visitas solo con tu consentimiento. No enviamos búsquedas, temas consultados, guardados ni cambios del editor.',
      analyticsNone: 'La medición no está configurada. No se está cargando Google Analytics.',
      allow: 'Permitir medición',
      noAllow: 'No permitir',
      done: 'Listo',
      saveChoiceTitle: '¿Guardar en este dispositivo?',
      saveChoice: 'La lista queda en este navegador y puede verla otra persona que lo use. No se envía al sitio. Podés borrarla desde Guardados.',
      cancel: 'Cancelar',
      confirm: 'Sí, guardar',
      savedToast: 'Guardado en este dispositivo.',
      removedToast: 'Se quitó de la lista.',
      storageFail: 'Este navegador no pudo guardar los cambios. Podés exportar los archivos desde el editor.',
      copied: 'Enlace copiado.',
      copyFail: 'Copiá el enlace desde la barra de tu navegador.',
      pause: 'Una pausa de 30 segundos',
      pauseText: 'Si te resulta cómodo, mirá a tu alrededor y notá dónde estás. No necesitás controlar la respiración ni terminar el tiempo.',
      pauseStart: 'Comenzar pausa',
      pauseStop: 'Detener pausa',
      pauseEnd: 'Podés volver a tu ritmo.',
      editorIntro: 'Cambiá contenido, contactos y fotos; revisá el resultado y exportá los archivos para publicarlos en GitHub.',
      editorNotice: 'Este editor trabaja en tu navegador. No requiere contraseña y no modifica el sitio publicado. Nunca ingresés datos privados o credenciales.',
      editGuides: 'Guías',
      editContacts: 'Contactos',
      editPhotos: 'Fotos',
      backup: 'Importar y exportar',
      choose: 'Elegí un elemento',
      name: 'Nombre',
      title: 'Título',
      short: 'Resumen',
      description: 'Descripción',
      audience: 'Público de atención',
      phone: 'Número para llamar (solo dígitos)',
      display: 'Número visible',
      website: 'Sitio web HTTPS',
      tags: 'Temas relacionados (IDs separados por coma)',
      sourcesHelp: 'Una fuente por línea: nombre | https://…',
      apply: 'Aplicar a la vista previa',
      preview: 'Ver página',
      saveDevice: 'Guardar cambios en este dispositivo',
      exportContent: 'Descargar content.js',
      exportMedia: 'Descargar media.js',
      exportBackup: 'Descargar respaldo JSON',
      restore: 'Restaurar contenido original',
      restoreText: 'Se borrarán las modificaciones locales y se recuperará el contenido original. ¿Continuar?',
      valid: 'Cambios aplicados. Revisá el resultado y exportá para publicar.',
      invalid: 'No se pudo aplicar: ',
      edited: 'Contenido modificado en este navegador',
      base: 'Contenido original cargado',
      editLang: 'Idioma del contenido',
      photoNote: 'Subí JPG, PNG o WebP, hasta 2 MB por foto. Las fotos elegidas aquí quedan incluidas al exportar media.js. Las fotos que mantienen una ruta local necesitan su archivo PNG original junto a index.html al publicar.',
      choosePhoto: 'Seleccionar foto',
      import: 'Importar respaldo JSON',
      importText: 'Importá únicamente un respaldo de este editor. Se validará antes de cargarlo; no se ejecuta código. Si contiene rutas locales de fotos, guardá también los nueve archivos PNG originales; el respaldo conserva esas rutas, pero no copia las imágenes.',
      importOK: 'Respaldo cargado en la vista previa.',
      download: 'Archivo preparado para descargar.',
      error404: 'Esta página no existe',
      goHome: 'Volver al inicio',
      editorial: 'Cómo cuidamos la información',
      editorialText: 'Usamos fuentes públicas de las instituciones y mostramos las fechas de consulta. Los horarios pueden cambiar; confirmalos antes de depender de un servicio.',
      photosDisclosure: 'Las nueve fotos son imágenes ilustrativas generadas con IA y aportadas para el proyecto. No representan a personas atendidas ni a profesionales del sitio.',
      author: 'Iniciativa independiente · Costa Rica',
      helpTitle: 'Estar presente también es ayudar',
      say: 'Palabras que pueden ayudar',
      notSay: 'Frases que pueden hacer daño',
      limits: 'También cuidá tus límites',
      localOnly: 'Solo en tu navegador',
      queryEmpty: 'Escribí una palabra, un tema o el nombre de un servicio.',
      result: 'resultado',
      results: 'resultados',
      privacyTitle: 'Tu privacidad, con claridad',
      privacyText: 'Las guías y búsquedas funcionan en este navegador. No hay cuentas, chat, formularios de denuncia ni envío de consultas. Guardados, preferencias y modificaciones del editor usan almacenamiento local. Los enlaces externos, YouTube y el proveedor que aloja la web pueden registrar información conforme a sus propias políticas. No podemos garantizar anonimato ni confidencialidad en dispositivos compartidos.',
      history: 'La salida rápida cambia de página, pero no borra el historial, los archivos descargados ni la actividad del dispositivo. Si te supervisan, buscá ayuda desde un dispositivo seguro.',
      analyticsPrivacy: 'Google Analytics solo se carga si existe una configuración válida y vos aceptás. Respeta la señal de no rastreo y GPC. Al retirar el permiso se detiene la medición y se eliminan las cookies de Analytics accesibles desde esta página.',
      clearLocal: 'Borrar guardados y preferencias',
      clearLocalQuestion: '¿Borrar guardados, preferencias y permiso de medición de este navegador? Los cambios del editor se conservan.',
      quickExit: 'Salir rápido ↗',
      exitNote: 'Salir rápido no borra el historial ni oculta la actividad del dispositivo.',
      safety: 'Si hay peligro inmediato, llamá al 9-1-1.',
      callNow: 'Llamar ahora ↗',
      skip: 'Ir al contenido',
      footer: 'Un primer paso, a tu ritmo.',
      thanks: 'Cada persona merece ser escuchada.',
      sourcesNote: 'Información general. Las fuentes enlazadas pueden estar en otro idioma.'
    },

    en: {
      home: 'Home',
      accessibility: 'Accessibility',
      reloadAnalytics: 'Reload without measurement',
      analyticsRevocation: 'Withdrawing permission disables measurement and clears accessible cookies. Google code already loaded remains in memory until a reload; choose Reload without measurement to end that document.',
      reloadWarning: 'Reloading may discard editor changes that you have not saved or exported. Reload now?',
      accessibilityTitle: 'A space that is easier to use',
      accessibilityText: 'Use Tab and Enter to navigate, Escape to close dialogs, and the first link to skip to the main content. Preferences lets you change colours, enlarge text and reduce motion. We also respect your device’s motion preference. Guides can be printed. These features support access; they are not a claim of an external accessibility audit.',
      pending: 'There are unapplied fields. Apply or discard them before switching items, exporting or saving.',
      discard: 'Discard unapplied fields',
      helpCTA: 'I want to help someone',
      findCTA: 'I am looking for support',
      allGuides: 'See all seven guides',
      coverage: 'Coverage',
      national: 'National coverage',
      regional: 'Regional service: check the location',
      unspecified: 'Confirm coverage with the service',
      topics: 'Explore topics',
      resources: 'Find support',
      help: 'Support someone',
      well: 'Wellbeing',
      videos: 'Videos',
      about: 'The project',
      saved: 'Saved',
      search: 'Search',
      close: 'Close',
      read: 'Read the guide',
      all: 'All',
      viewAll: 'See all services',
      source: 'Source',
      sources: 'Sources and scope',
      call: 'Call',
      site: 'Official information',
      save: 'Save',
      unsave: 'Remove from saved',
      empty: 'No results found',
      try: 'Try another word or clear the filters.',
      checked: 'Sources checked',
      independent: 'Independent initiative',
      back: 'Back to topics',
      share: 'Share',
      print: 'Print guide',
      signs: 'What you may notice',
      steps: 'A next step',
      avoid: 'What to avoid',
      companion: 'If you support someone',
      onPage: 'In this guide',
      privacy: 'Privacy',
      settings: 'Preferences',
      editor: 'Edit this website',
      hero: 'Sometimes, the first step<br>is <em>being able to talk.</em>',
      heroIntro: 'A welcoming space to understand what you are experiencing, support someone and find help in Costa Rica. You do not need to have all the answers.',
      heroNote: 'You do not have to solve everything today.',
      heroCaption: 'You can start with a question.',
      intro: 'For you, for someone close to you, for any time support is needed.',
      topicIntro: 'Choose what feels close to your experience. Read at your own pace and return whenever you need.',
      resourceIntro: 'Public support services in Costa Rica, with opening hours, eligibility and sources to make your next step clearer.',
      whatNeed: 'What do you need today?',
      whatNeedIntro: 'You do not need to know exactly where to start.',
      self: 'I want to understand how I feel',
      selfText: 'Simple guides to put distress into words and explore support options.',
      find: 'I need to talk to someone',
      findText: 'Check the services and choose one that supports your situation and eligibility.',
      someone: 'I want to support someone',
      someoneText: 'Listen, offer practical help and recognise your own limits.',
      urgent: 'For immediate danger',
      faq: 'Questions that matter too',
      faqIntro: 'Seeking support can bring up many questions. Start with some answers here.',
      projectTitle: 'A welcoming space. A simple purpose.',
      projectText: 'En Confianza is an independent personal initiative to make information and support resources easier to find in Costa Rica.',
      projectCTA: 'About the project',
      videoIntro: 'Educational resources in Spanish. Choose when to play them.',
      play: 'Play',
      externalVideo: 'Playing connects to YouTube. You can also open the video on its website.',
      openVideo: 'Open on YouTube',
      stopVideo: 'Close player',
      languageVideo: 'In Spanish',
      query: 'Word or service name',
      filterTopic: 'Topic',
      filterAudience: 'Audience',
      general: 'General public',
      children: 'Children and adolescents',
      students: 'Students and families',
      women: 'Women',
      clear: 'Clear filters',
      count: 'services found',
      country: 'Support resources in Costa Rica',
      hours: 'Hours',
      cost: 'Published cost',
      localEdit: 'Local edit: confirm details with the institution.',
      savedIntro: 'A list on this device to return to the guides and contacts you choose.',
      noSaved: 'Nothing saved yet',
      savedDevice: 'Anyone using this browser may see this list. We do not save personal notes.',
      clearSaved: 'Clear saved items',
      appear: 'Make this space comfortable',
      theme: 'Website colour',
      light: 'Light',
      dark: 'Dark',
      size: 'Text size',
      normal: 'Normal',
      larger: 'Larger',
      largest: 'Large',
      animation: 'Motion',
      system: 'Follow device preference',
      reduce: 'Reduced',
      optionalAnalytics: 'Optional measurement',
      analyticsText: 'If configured, it counts visits only with your consent. We do not send searches, topics viewed, saved items or editor changes.',
      analyticsNone: 'Measurement is not configured. Google Analytics is not loading.',
      allow: 'Allow measurement',
      noAllow: 'Do not allow',
      done: 'Done',
      saveChoiceTitle: 'Save on this device?',
      saveChoice: 'The list stays in this browser and may be visible to anyone who uses it. It is not sent to this website. You can clear it from Saved.',
      cancel: 'Cancel',
      confirm: 'Yes, save',
      savedToast: 'Saved on this device.',
      removedToast: 'Removed from the list.',
      storageFail: 'This browser could not save changes. You can export files from the editor.',
      copied: 'Link copied.',
      copyFail: 'Copy the link from your browser’s address bar.',
      pause: 'A 30-second pause',
      pauseText: 'If comfortable, look around and notice where you are. You do not need to control your breathing or finish the timer.',
      pauseStart: 'Start pause',
      pauseStop: 'Stop pause',
      pauseEnd: 'Return at your own pace.',
      editorIntro: 'Change content, contacts and photos; review the result and export files to publish on GitHub.',
      editorNotice: 'This editor runs in your browser. It has no password and does not change the published website. Never enter private information or credentials.',
      editGuides: 'Guides',
      editContacts: 'Contacts',
      editPhotos: 'Photos',
      backup: 'Import and export',
      choose: 'Choose an item',
      name: 'Name',
      title: 'Title',
      short: 'Summary',
      description: 'Description',
      audience: 'Audience',
      phone: 'Calling number (digits only)',
      display: 'Displayed number',
      website: 'HTTPS website',
      tags: 'Related topics (comma-separated IDs)',
      sourcesHelp: 'One source per line: name | https://…',
      apply: 'Apply to preview',
      preview: 'View page',
      saveDevice: 'Save changes on this device',
      exportContent: 'Download content.js',
      exportMedia: 'Download media.js',
      exportBackup: 'Download JSON backup',
      restore: 'Restore original content',
      restoreText: 'Local changes will be removed and the original content restored. Continue?',
      valid: 'Changes applied. Review the result and export to publish.',
      invalid: 'Could not apply: ',
      edited: 'Content modified in this browser',
      base: 'Original content loaded',
      editLang: 'Content language',
      photoNote: 'Upload JPG, PNG or WebP, up to 2 MB per photo. Photos selected here are included when exporting media.js. Photos that retain a local path need their original PNG file next to index.html when publishing.',
      choosePhoto: 'Choose photo',
      import: 'Import JSON backup',
      importText: 'Only import a backup from this editor. It is validated before loading; no code is executed. If it contains local photo paths, also keep the nine original PNG files; the backup retains those paths but does not copy the images.',
      importOK: 'Backup loaded in preview.',
      download: 'File ready to download.',
      error404: 'This page does not exist',
      goHome: 'Return home',
      editorial: 'How we maintain information',
      editorialText: 'We use public institutional sources and display the dates checked. Hours can change; confirm before relying on a service.',
      photosDisclosure: 'The nine photos are AI-generated illustrations supplied for this project. They do not portray clients or professionals of the website.',
      author: 'Independent initiative · Costa Rica',
      helpTitle: 'Being present can help',
      say: 'Words that can help',
      notSay: 'Phrases that may hurt',
      limits: 'Respect your own limits too',
      localOnly: 'Only in your browser',
      queryEmpty: 'Enter a word, topic or service name.',
      result: 'result',
      results: 'results',
      privacyTitle: 'Your privacy, clearly explained',
      privacyText: 'Guides and searches run in this browser. There are no accounts, chats, reporting forms or consultation submissions. Saved items, preferences and editor changes use local storage. External links, YouTube and the hosting provider may record information under their own policies. We cannot guarantee anonymity or confidentiality on shared devices.',
      history: 'Quick exit changes the page, but does not erase browser history, downloaded files or device activity. If your device is monitored, seek support using a safe device.',
      analyticsPrivacy: 'Google Analytics loads only with a valid configuration and your permission. It respects Do Not Track and GPC signals. Withdrawing permission stops measurement and removes Analytics cookies accessible to this page.',
      clearLocal: 'Clear saved items and preferences',
      clearLocalQuestion: 'Clear saved items, preferences and measurement permission in this browser? Editor changes will remain.',
      quickExit: 'Quick exit ↗',
      exitNote: 'Quick exit does not erase history or hide device activity.',
      safety: 'For immediate danger, call 9-1-1.',
      callNow: 'Call now ↗',
      skip: 'Skip to content',
      footer: 'A first step, at your own pace.',
      thanks: 'Everyone deserves to be heard.',
      sourcesNote: 'General information. Linked sources may be in another language.'
    }
  };

  const copyKeys = [
    'heroTitle',
    'heroIntro',
    'projectTitle',
    'projectText',
    'author',
    'footer'
  ];

  const t = key =>
    copyKeys.includes(key) && typeof data.meta[lang][key] === 'string'
      ? data.meta[lang][key]
      : words[lang][key] || key;

  const tr = value => value[lang];

  const date = value => {
    const [year, month, day] = String(value).split('-');
    return lang === 'es'
      ? `${day}/${month}/${year}`
      : `${year}-${month}-${day}`;
  };

  const link = (url, label, classes = '') =>
    `<a class="${classes}" href="${esc(safeURL(url))}" target="_blank" rel="noopener noreferrer">${esc(label)} ↗</a>`;

  const image = (id, alt = '', classes = '', eager = false) =>
    `<img src="${esc(media[id] || media.hero)}" alt="${esc(alt)}" class="${classes}" loading="${eager ? 'eager' : 'lazy'}" decoding="async">`;

  const list = items =>
    `<ul>${items.map(item => `<li>${esc(item)}</li>`).join('')}</ul>`;

  const sourceList = sources =>
    `<ul class="source-list">${sources.map(source =>
      `<li>${link(source.url, source.label)}</li>`
    ).join('')}</ul>`;

  const button = (route, label, kind = 'primary') =>
    `<a class="button ${kind}" href="#${route}">${esc(label)} <span aria-hidden="true">↗</span></a>`;

  /*
   * Avisos y diálogos.
   */

  function toast(message) {
    $('#toast').textContent = message;

    if ($('#dialog').open) {
      let status = $('#dialog-status');

      if (!status) {
        status = document.createElement('p');
        status.id = 'dialog-status';
        status.className = 'small';
        status.setAttribute('role', 'status');
        status.setAttribute('aria-live', 'polite');
        $('#dialog-content').appendChild(status);
      }

      status.textContent = message;
    }

    $('#toast').hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      $('#toast').hidden = true;
    }, 4500);
  }

  function openDialog(html, focus = '#dialog-close') {
    if (!$('#dialog').open) previousFocus = document.activeElement;

    $('#dialog-content').innerHTML = html;

    const heading = $('#dialog-content h2');

    if (heading) {
      heading.id = 'dialog-heading';
      $('#dialog').setAttribute('aria-labelledby', 'dialog-heading');
    } else {
      $('#dialog').setAttribute('aria-label', t('settings'));
    }

    if (!$('#dialog').open) $('#dialog').showModal();

    setTimeout(() => $(focus)?.focus(), 0);
  }

  function restoreDialogFocus() {
    if (previousFocus?.isConnected) {
      previousFocus.focus();
    } else {
      $('#main').focus({ preventScroll: true });
    }
  }

  function closeDialog() {
    $('#dialog').close();
    restoreDialogFocus();
  }

  /*
   * Preferencias y componentes reutilizables.
   */

  function savePreferences() {
    if (!write('ec.preferences.v2', { lang, theme, scale, motion })) {
      toast(t('storageFail'));
    }
  }

  function applyAppearance() {
    document.documentElement.lang = lang;
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.motion = motion;
    document.documentElement.style.setProperty('--scale', scale);
  }

  function saveButton(kind, id) {
    const active = bookmarks.includes(`${kind}:${id}`);

    const entry = (kind === 'topic' ? data.topics : data.resources)
      .find(item => item.id === id);

    const name = entry ? tr(entry).title || tr(entry).name : '';

    return `<button class="save-btn" data-save="${kind}:${id}" aria-pressed="${active}" aria-label="${esc(t(active ? 'unsave' : 'save') + ' · ' + name)}"><span aria-hidden="true">${active ? '♥' : '♡'}</span></button>`;
  }

  function topicCard(topic) {
    const q = tr(topic);

    return `<article class="topic-card">${saveButton('topic', topic.id)}<a href="#tema/${topic.id}">${image(topic.image)}<div class="copy"><h3>${esc(q.title)}</h3><p>${esc(q.short)}</p><span class="text-link">${esc(t('read'))} ↗</span></div></a></article>`;
  }

  function resourceCard(resource) {
    const q = tr(resource);

    return `<article class="resource-card" id="resource-${resource.id}"><div class="resource-head"><span class="pill">${esc(q.audience)}</span>${saveButton('resource', resource.id)}</div><h3>${esc(q.name)}</h3><p>${esc(q.description)}</p><p class="small">${esc(t(resource.coverage || 'unspecified'))}</p><a class="number" href="tel:${esc(resource.phone)}">${esc(resource.display)}</a>${resource.alternatePhone ? `<a class="small" href="tel:${esc(resource.alternatePhone)}">${esc(resource.alternateDisplay)}</a>` : ''}<p class="hours"><strong>${esc(t('hours'))}:</strong> ${esc(q.hours)}<br><strong>${esc(t('cost'))}:</strong> ${esc(q.cost)}</p><div class="buttons"><a class="button primary small-button" href="tel:${esc(resource.phone)}">${esc(t('call'))} ↗</a>${link(resource.website, t('site'), 'text-link')}</div><p class="source">${esc(resource.edited ? t('localEdit') : `${t('checked')}: ${date(resource.checked || data.meta.checked)}`)} · ${resource.sources.map(source => link(source.url, source.label)).join(' · ')}</p></article>`;
  }

  function emergency() {
    return `<div class="emergency-box"><div><h3>${esc(t('urgent'))}</h3><p>${esc(tr(data.meta).emergency)}</p></div><a class="button danger" href="tel:911">9-1-1 ↗</a></div>`;
  }

  function videoCard(video) {
    const q = tr(video);

    return `<article class="video-card"><div class="video-slot" id="video-${video.id}"><button class="video-cover" data-video="${video.id}" aria-label="${esc(t('play') + ' · ' + q.title)}">${image(video.image)}<span><span aria-hidden="true">▶</span> ${esc(t('play'))} · ${esc(video.duration)}</span></button></div><div class="video-copy"><p class="eyebrow">${esc(video.org)} · ${esc(t('languageVideo'))}</p><h3>${esc(q.title)}</h3><p>${esc(q.description)}</p><p class="tiny">${esc(t('externalVideo'))}</p>${link(`https://www.youtube.com/watch?v=${video.id}`, t('openVideo'), 'text-link')}<p class="tiny">${link(video.source, t('source'))}</p></div></article>`;
  }

  function pageHead(title, intro, crumb = '') {
    return `<div class="shell page-head"><p class="crumbs"><a href="#inicio">${esc(t('home'))}</a>${crumb ? ` / ${esc(crumb)}` : ''}</p><h1>${esc(title)}</h1><p class="lead">${esc(intro)}</p></div>`;
  }

  function faqBlock(all = false) {
    return `<div class="faq-layout"><div><p class="eyebrow">${esc(t('thanks'))}</p><h2>${esc(t('faq'))}</h2><p class="lead">${esc(t('faqIntro'))}</p></div><div>${data.faq.slice(0, all ? 99 : 3).map(faq => `<details id="faq-${esc(faq.id)}" tabindex="-1"><summary>${esc(tr(faq).question)}</summary><p>${esc(tr(faq).answer)}</p></details>`).join('')}</div></div>`;
  }

  /*
   * Vistas públicas.
   */

  function home() {
    const help = tr(data.helpSomeone);

    return `<section class="shell hero"><div><p class="eyebrow">En Confianza · Costa Rica</p><h1>${data.meta[lang].heroTitle ? esc(data.meta[lang].heroTitle) : t('hero')}</h1><p class="lead">${esc(t('heroIntro'))}</p><div class="buttons">${button('recursos', t('findCTA'))}${button('acompanar', t('helpCTA'), 'outline')}</div><p><a class="text-link" href="#temas">${esc(t('topics'))} ↗</a></p><p class="small">${esc(t('independent'))} · Español / English</p></div><div class="hero-photo"><div class="hero-side">${image('anxiety', '', '', true)}<div class="roundel" aria-hidden="true">✳</div>${image('mental', '', '', true)}</div>${image('hero', '', 'hero-main', true)}<div class="hero-note">${esc(t('heroNote'))}<span>${esc(t('heroCaption'))}</span></div></div></section><div class="shell"><div class="intro-strip"><span class="symbol" aria-hidden="true">↗</span><p>${esc(t('intro'))}</p></div></div><section class="shell section"><div class="section-top"><div><p class="eyebrow">${esc(t('topics'))}</p><h2>${esc(t('whatNeed'))}</h2></div><p>${esc(t('topicIntro'))}</p></div><div class="topic-grid">${data.topics.slice(0, 3).map(topicCard).join('')}</div><div class="buttons section-action">${button('temas', t('allGuides'), 'outline')}</div></section><section class="soft-section"><div class="shell section"><div class="section-top"><div><h2>${esc(t('whatNeedIntro'))}</h2></div></div><div class="bento">${[['self', 'selfText', 'temas', '✳'], ['find', 'findText', 'recursos', '↗'], ['someone', 'someoneText', 'acompanar', '♡']].map(([title, text, route, symbol]) => `<article><div class="symbol" aria-hidden="true">${symbol}</div><h3>${esc(t(title))}</h3><p>${esc(t(text))}</p>${button(route, t(route === 'temas' ? 'topics' : route === 'recursos' ? 'resources' : 'help'), 'outline')}</article>`).join('')}</div></div></section><section class="shell section"><div class="section-top"><div><p class="eyebrow">Costa Rica</p><h2>${esc(t('resources'))}</h2><p class="lead">${esc(t('resourceIntro'))}</p></div>${button('recursos', t('viewAll'), 'outline')}</div>${emergency()}<div class="resource-grid">${data.resources.slice(0, 2).map(resourceCard).join('')}</div></section><section class="soft-section"><div class="shell section listen-layout">${image('listen')}<div><p class="eyebrow">${esc(t('help'))}</p><h2>${esc(t('helpTitle'))}</h2><p class="lead">${esc(help.intro)}</p><ol class="numbered">${help.steps.slice(0, 3).map(step => `<li><strong>${esc(step.title)}</strong><p>${esc(step.text)}</p></li>`).join('')}</ol>${button('acompanar', t('help'))}</div></div></section><section class="shell section"><div class="section-top"><div><p class="eyebrow">${esc(t('videos'))}</p><h2>${esc(t('videoIntro'))}</h2></div></div><div class="video-grid">${data.videos.map(videoCard).join('')}</div></section><section class="shell section">${faqBlock()}</section><section class="about-band"><div class="shell section about-layout"><div><p class="eyebrow">En Confianza</p><h2>${esc(t('projectTitle'))}</h2></div><div><p class="lead">${esc(t('projectText'))}</p><p>${esc(tr(data.meta).scope)}</p>${button('proyecto', t('projectCTA'), 'outline')}</div></div></section>`;
  }

  function topicsPage() {
    return pageHead(t('topics'), t('topicIntro')) +
      `<section class="shell section" style="padding-top:0"><div class="topic-grid">${data.topics.map(topicCard).join('')}</div><div class="notice small">${esc(tr(data.meta).editorial)}</div></section>`;
  }

  function guideQuestions(id) {
    const ids = {
      mental: ['not-sure', 'therapy'],
      anxiety: ['not-sure', 'no-answer'],
      sexual: ['stories', 'children'],
      relationships: ['exit', 'stories'],
      crisis: ['therapy', 'no-answer'],
      substances: ['free', 'no-answer'],
      bullying: ['children', 'province']
    }[id] || [];

    return data.faq.filter(question => ids.includes(question.id));
  }

  function topicPage(id) {
    const topic = data.topics.find(item => item.id === id);
    if (!topic) return missing();

    const q = tr(topic);
    const blocks = [
      ['signs', 'signs'],
      ['steps', 'steps'],
      ['avoid', 'avoid'],
      ['companion', 'companion']
    ];

    const related = data.resources.filter(resource =>
      resource.tags.includes(id)
    );

    return `<section class="shell page-head"><p class="crumbs"><a href="#temas">${esc(t('back'))}</a> / ${esc(q.title)}</p><div class="topic-hero"><div><p class="eyebrow">${esc(t('topics'))}</p><h1>${esc(q.title)}</h1><p class="lead">${esc(q.intro)}</p><div class="page-tools"><button class="button soft small-button" data-save="topic:${id}">${esc(t(bookmarks.includes('topic:' + id) ? 'unsave' : 'save'))} ♡</button><button class="button outline small-button" data-share>${esc(t('share'))} ↗</button><button class="button outline small-button" data-print>${esc(t('print'))}</button></div></div>${image(topic.image)}</div><p class="notice small">${esc(q.audience)}</p></section><div class="shell article-layout"><aside class="article-nav"><strong>${esc(t('onPage'))}</strong>${blocks.map(([key]) => `<a href="#tema/${id}" data-jump="guide-${key}">${esc(t(key))}</a>`).join('')}<a href="#tema/${id}" data-jump="guide-resources">${esc(t('resources'))}</a>${guideQuestions(id).length ? `<a href="#tema/${id}" data-jump="guide-faq">${esc(t('faq'))}</a>` : ''}<a href="#tema/${id}" data-jump="guide-sources">${esc(t('sources'))}</a></aside><div>${blocks.map(([key, field]) => `<section class="article-section" id="guide-${key}" tabindex="-1"><h2>${esc(t(key))}</h2>${list(q[field])}</section>`).join('')}<section class="article-section" id="guide-resources" tabindex="-1"><h2>${esc(t('resources'))}</h2>${emergency()}<div class="resource-grid">${related.map(resourceCard).join('')}</div></section>${guideQuestions(id).length ? `<section class="article-section" id="guide-faq" tabindex="-1"><h2>${esc(t('faq'))}</h2>${guideQuestions(id).map(faq => `<details><summary>${esc(tr(faq).question)}</summary><p>${esc(tr(faq).answer)}</p></details>`).join('')}</section>` : ''}<section class="article-section" id="guide-sources" tabindex="-1"><h2>${esc(t('sources'))}</h2><p class="small">${esc(topic.edited ? t('localEdit') : `${t('checked')}: ${date(data.meta.checked)}`)}</p><p class="small">${esc(tr(data.meta).editorial)} ${esc(t('sourcesNote'))}</p>${sourceList(topic.sources)}<p class="print-only">${esc(location.href)}</p></section></div></div>`;
  }

  const normalized = value => String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

  function filteredResources() {
    return data.resources.filter(resource =>
      (dir.topic === 'all' || resource.tags.includes(dir.topic)) &&
      (
        dir.audience === 'all' ||
        (
          resource.audienceGroup || {
            cppcr: 'general',
            iafa: 'general',
            pani: 'children',
            mep: 'students',
            inamu: 'women'
          }[resource.id] || 'general'
        ) === dir.audience
      ) &&
      normalized(
        Object.values(tr(resource)).join(' ') + ' ' + resource.display
      ).includes(normalized(dir.query))
    );
  }

  function directoryResults() {
    const rows = filteredResources();

    return `<p class="small" role="status">${rows.length} ${esc(t('count'))}</p><div class="resource-grid">${rows.length ? rows.map(resourceCard).join('') : `<div class="empty-state"><h3>${esc(t('empty'))}</h3><p>${esc(t('try'))}</p></div>`}</div>`;
  }

  function directory() {
    return pageHead(t('resources'), t('resourceIntro')) +
      `<section class="shell section" style="padding-top:0">${emergency()}<p class="small">${esc(tr(data.meta).hours)} ${esc(t('country'))}.</p><div class="filter-panel"><label class="field"><span>${esc(t('query'))}</span><input id="directory-query" type="search" value="${esc(dir.query)}" autocomplete="off"></label><label class="field"><span>${esc(t('filterTopic'))}</span><select id="directory-topic"><option value="all">${esc(t('all'))}</option>${data.topics.map(topic => `<option value="${topic.id}" ${dir.topic === topic.id ? 'selected' : ''}>${esc(tr(topic).title)}</option>`).join('')}</select></label><label class="field"><span>${esc(t('filterAudience'))}</span><select id="directory-audience">${['all', 'general', 'children', 'students', 'women'].map(key => `<option value="${key}" ${dir.audience === key ? 'selected' : ''}>${esc(t(key))}</option>`).join('')}</select></label><button class="button outline small-button" data-clear-filters>${esc(t('clear'))}</button></div><div id="directory-results">${directoryResults()}</div><p class="notice small">${esc(tr(data.meta).inclusion)}</p></section>`;
  }

  function helpPage() {
    const q = tr(data.helpSomeone);

    return pageHead(q.title, q.intro) +
      `<section class="shell section listen-layout" style="padding-top:0">${image('listen')}<div><ol class="numbered">${q.steps.map(step => `<li><strong>${esc(step.title)}</strong><p>${esc(step.text)}</p></li>`).join('')}</ol><div class="content-box"><h3>${esc(t('limits'))}</h3><p>${esc(q.boundaries)}</p></div></div></section><section class="shell section"><div class="resource-grid"><div class="wellbeing-card"><h2>${esc(t('say'))}</h2>${list(q.say)}</div><div class="wellbeing-card"><h2>${esc(t('notSay'))}</h2>${list(q.avoid)}</div></div>${emergency()}<p>${esc(q.urgent)}</p>${sourceList(data.helpSomeone.sources)}<div class="buttons">${button('recursos', t('resources'))}${button('bienestar', t('well'), 'outline')}</div></section>`;
  }

  function wellbeingPage() {
    const q = tr(data.wellbeing);

    return pageHead(q.title, q.intro) +
      `<section class="shell section" style="padding-top:0"><div class="wellbeing-grid">${q.cards.map((card, index) => `<article class="wellbeing-card"><p class="eyebrow">0${index + 1}</p><h3>${esc(card.title)}</h3><p>${esc(card.text)}</p></article>`).join('')}</div><div class="pause-panel"><div class="pause-ring" id="pause-ring"><span id="pause-count">30 s</span></div><div><h2>${esc(t('pause'))}</h2><p>${esc(t('pauseText'))}</p><button class="button primary" id="pause-toggle">${esc(t('pauseStart'))}</button></div></div><p class="notice small">${esc(q.note)}</p>${sourceList(data.wellbeing.sources)}${button('recursos', t('resources'), 'outline')}</section>`;
  }

  function videosPage() {
    return pageHead(t('videos'), t('videoIntro')) +
      `<section class="shell section" style="padding-top:0"><div class="video-grid">${data.videos.map(videoCard).join('')}</div><p class="notice small">${esc(t('externalVideo'))}</p></section>`;
  }

  function projectPage() {
    return pageHead(t('projectTitle'), t('projectText')) +
      `<section class="shell section" style="padding-top:0"><div class="about-layout"><div><h2>${esc(t('editorial'))}</h2><p>${esc(t('editorialText'))}</p><p class="small">${esc(t('checked'))}: ${esc(date(data.meta.checked))}</p><p>${esc(tr(data.meta).editorial)}</p></div><div class="content-box"><h3>${esc(t('independent'))}</h3><p>${esc(tr(data.meta).scope)}</p><p>${esc(tr(data.meta).inclusion)}</p><p class="small">${esc(t('author'))}</p></div></div><p class="notice small">${esc(t('photosDisclosure'))}</p>${emergency()}</section><section class="shell section">${faqBlock(true)}</section>`;
  }

  function savedPage() {
    const topics = data.topics.filter(topic =>
      bookmarks.includes('topic:' + topic.id)
    );

    const resources = data.resources.filter(resource =>
      bookmarks.includes('resource:' + resource.id)
    );

    return pageHead(t('saved'), t('savedIntro')) +
      `<section class="shell section" style="padding-top:0"><p class="notice small">${esc(t('savedDevice'))}</p>${topics.length ? `<h2>${esc(t('topics'))}</h2><div class="topic-grid">${topics.map(topicCard).join('')}</div>` : ''}${resources.length ? `<h2 style="margin-top:40px">${esc(t('resources'))}</h2><div class="resource-grid">${resources.map(resourceCard).join('')}</div>` : ''}${!topics.length && !resources.length ? `<div class="empty-state"><h3>${esc(t('noSaved'))}</h3>${button('temas', t('topics'), 'outline')}</div>` : ''}${bookmarks.length ? `<div class="buttons section-action"><button class="button outline" data-clear-saved>${esc(t('clearSaved'))}</button></div>` : ''}</section>`;
  }

  function missing() {
    return pageHead(t('error404'), '') +
      `<section class="shell section">${button('inicio', t('goHome'))}</section>`;
  }

  /*
   * Navegación y actualización de vistas.
   */

  function currentRoute() {
    return location.hash.slice(1) || 'inicio';
  }

  function shell() {
    const route = currentRoute().split('/')[0];

    const nav = [
      ['temas', 'topics'],
      ['recursos', 'resources'],
      ['acompanar', 'help'],
      ['bienestar', 'well']
    ];

    const navLink = ([destination, key]) =>
      `<a href="#${destination}" ${route === destination || destination === 'temas' && route === 'tema' ? 'aria-current="page"' : ''}>${esc(t(key))}</a>`;

    $('#main-nav').innerHTML = nav.map(navLink).join('');

    $('#mobile-menu').innerHTML = [
      ['inicio', 'home'],
      ...nav,
      ['videos', 'videos'],
      ['guardados', 'saved'],
      ['proyecto', 'about']
    ].map(navLink).join('');

    $('#footer-links').innerHTML = [
      ['temas', 'topics'],
      ['recursos', 'resources'],
      ['videos', 'videos'],
      ['guardados', 'saved'],
      ['proyecto', 'about']
    ].map(navLink).join('');

    $('#mobile-dock').innerHTML = [
      ['inicio', 'home'],
      ['temas', 'topics'],
      ['recursos', 'resources'],
      ['guardados', 'saved']
    ].map(navLink).join('');

    [
      ['safety-text', 'safety'],
      ['safety-call', 'callNow'],
      ['quick-exit', 'quickExit'],
      ['skip-link', 'skip'],
      ['footer-tagline', 'footer'],
      ['privacy-open', 'privacy'],
      ['accessibility-open', 'accessibility'],
      ['settings-open', 'settings'],
      ['editor-link', 'editor'],
      ['exit-disclaimer', 'exitNote']
    ].forEach(([id, key]) => {
      $('#' + id).textContent = t(key);
    });

    $('#footer-note').textContent =
      `${t('author') ? t('author') + ' · ' : ''}${new Date().getFullYear()}`;

    $('#language').textContent = lang === 'es' ? 'EN' : 'ES';

    $('#language').setAttribute(
      'aria-label',
      lang === 'es' ? 'Switch to English' : 'Cambiar a español'
    );

    $('.brand').setAttribute('aria-label', 'En Confianza, ' + t('home'));

    $('#menu-toggle').setAttribute(
      'aria-label',
      lang === 'es' ? 'Abrir menú' : 'Open menu'
    );

    $('#search-open').setAttribute('aria-label', t('search'));
    $('#appearance').setAttribute('aria-label', t('settings'));
    $('#dialog-close').setAttribute('aria-label', t('close'));

    $('#main-nav').setAttribute(
      'aria-label',
      lang === 'es' ? 'Principal' : 'Main navigation'
    );

    $('#mobile-menu').setAttribute('aria-label', t('topics'));

    $('#mobile-dock').setAttribute(
      'aria-label',
      lang === 'es' ? 'Accesos rápidos' : 'Quick links'
    );
  }

  function render(focus = false, focusSelector = '') {
    const active = document.activeElement;
    const oldSelector = focusSelector || focusFor(active);

    stopPause();
    applyAppearance();
    shell();

    const route = currentRoute();

    const routes = {
      inicio: home,
      temas: topicsPage,
      recursos: directory,
      acompanar: helpPage,
      bienestar: wellbeingPage,
      videos: videosPage,
      proyecto: projectPage,
      guardados: savedPage,
      editor: editorPage
    };

    $('#app').innerHTML = route.startsWith('tema/')
      ? topicPage(route.slice(5))
      : (Object.hasOwn(routes, route) ? routes[route] : missing)();

    const pageTitles = {
      inicio: t('footer'),
      temas: t('topics'),
      recursos: t('resources'),
      acompanar: t('help'),
      bienestar: t('well'),
      videos: t('videos'),
      proyecto: t('about'),
      guardados: t('saved'),
      editor: t('editor')
    };

    const selectedTopic = route.startsWith('tema/')
      ? data.topics.find(topic => topic.id === route.slice(5))
      : null;

    const title = selectedTopic
      ? tr(selectedTopic).title
      : Object.hasOwn(pageTitles, route)
        ? pageTitles[route]
        : t('error404');

    document.title = `En Confianza · ${title}`;

    const heading = $('#app h1');

    if (heading) {
      heading.id = 'view-title';
      heading.setAttribute('tabindex', '-1');
    }

    if (currentRoute() === 'editor') {
      const panelHeading = $('#editor-panel h2');

      if (panelHeading) {
        panelHeading.id = 'editor-panel-title';
        panelHeading.setAttribute('tabindex', '-1');
      }
    }

    restorePendingForm();

    if (!focus && oldSelector) {
      ($(oldSelector) || heading)?.focus({ preventScroll: true });
    }

    if (focus) {
      $('#main').focus({ preventScroll: true });

      window.scrollTo({
        top: 0,
        behavior: 'instant'
      });
    }
  }

  function focusFor(active) {
    if (!active) return '';

    if (active.id) return '#' + active.id;

    if (active.dataset?.save) {
      return '[data-save="' + active.dataset.save + '"]';
    }

    if (active.dataset?.editorTab) {
      return '[data-editor-tab="' + active.dataset.editorTab + '"]';
    }

    if (active.name) {
      return '#editor-form [name="' + active.name + '"]';
    }

    if (active.hasAttribute?.('data-clear-filters')) {
      return '[data-clear-filters]';
    }

    return '';
  }

  function reducedMotion() {
    return motion === 'reduce' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /*
   * Búsqueda.
   */

  function searchDialog() {
    openDialog(
      `<h2>${esc(t('search'))}</h2><label class="field"><span>${esc(t('queryEmpty'))}</span><input id="global-query" type="search" autocomplete="off"></label><p id="search-count" class="small" role="status" aria-live="polite"></p><div id="search-results" class="search-results"></div>`,
      '#global-query'
    );
  }

  function searchResults(query) {
    const q = normalized(query.trim());

    if (!q) {
      $('#search-results').innerHTML = '';
      $('#search-count').textContent = '';
      return;
    }

    const matches = [];

    data.topics.forEach(topic => {
      if (normalized(Object.values(tr(topic)).flat().join(' ')).includes(q)) {
        matches.push({
          title: tr(topic).title,
          text: tr(topic).short,
          route: 'tema/' + topic.id,
          type: t('topics')
        });
      }
    });

    data.resources.forEach(resource => {
      if (
        normalized(
          Object.values(tr(resource)).join(' ') + ' ' + resource.display
        ).includes(q)
      ) {
        matches.push({
          title: tr(resource).name,
          text: tr(resource).audience,
          route: 'recursos',
          jump: 'resource-' + resource.id,
          type: t('resources')
        });
      }
    });

    data.faq.forEach(faq => {
      if (normalized(tr(faq).question + ' ' + tr(faq).answer).includes(q)) {
        matches.push({
          title: tr(faq).question,
          text: tr(faq).answer,
          route: 'proyecto',
          jump: 'faq-' + faq.id,
          type: t('faq')
        });
      }
    });

    [
      ['acompanar', data.helpSomeone, 'help'],
      ['bienestar', data.wellbeing, 'well']
    ].forEach(([route, entry, key]) => {
      if (normalized(JSON.stringify(tr(entry))).includes(q)) {
        matches.push({
          title: tr(entry).title,
          text: tr(entry).intro,
          route,
          type: t(key)
        });
      }
    });

    $('#search-count').textContent =
      matches.length + ' ' +
      t(matches.length === 1 ? 'result' : 'results');

    $('#search-results').innerHTML = matches.length
      ? matches.slice(0, 18).map(match =>
          `<a href="#${match.route}" data-search-result ${match.jump ? `data-result-jump="${match.jump}"` : ''}><span class="eyebrow">${esc(match.type)}</span><strong>${esc(match.title)}</strong><span class="small">${esc(match.text)}</span></a>`
        ).join('')
      : `<p>${esc(t('empty'))}. ${esc(t('try'))}</p>`;
  }

  /*
   * Preferencias, privacidad y accesibilidad.
   */

  function settingsDialog() {
    const options = (items, value) => items.map(([option, key]) =>
      `<option value="${option}" ${String(value) === String(option) ? 'selected' : ''}>${esc(t(key))}</option>`
    ).join('');

    openDialog(
      `<h2>${esc(t('appear'))}</h2><label class="setting-row"><span>${esc(t('theme'))}</span><select data-setting="theme">${options([['light', 'light'], ['dark', 'dark']], theme)}</select></label><label class="setting-row"><span>${esc(t('size'))}</span><select data-setting="scale">${options([[1, 'normal'], [1.1, 'larger'], [1.2, 'largest']], scale)}</select></label><label class="setting-row"><span>${esc(t('animation'))}</span><select data-setting="motion">${options([['auto', 'system'], ['reduce', 'reduce']], motion)}</select></label><div class="notice"><h3>${esc(t('optionalAnalytics'))}</h3><p class="small">${esc(validAnalytics() ? t('analyticsText') : t('analyticsNone'))}</p>${validAnalytics() ? `<label class="field"><span>${esc(t('optionalAnalytics'))}</span><select id="analytics-choice"><option value="no" ${!consent ? 'selected' : ''}>${esc(t('noAllow'))}</option><option value="yes" ${consent ? 'selected' : ''}>${esc(t('allow'))}</option></select></label><p class="tiny">${esc(t('analyticsRevocation'))}</p><button type="button" class="button outline small-button" id="analytics-reload" ${!consent && analyticsLoaded ? '' : 'hidden'}>${esc(t('reloadAnalytics'))}</button>` : ''}</div><button class="button primary" data-close>${esc(t('done'))}</button>`
    );
  }

  function accessibilityDialog() {
    openDialog(
      `<h2>${esc(t('accessibilityTitle'))}</h2><p>${esc(t('accessibilityText'))}</p><div class="buttons"><button class="button outline" id="accessibility-settings">${esc(t('settings'))}</button><button class="button primary" data-close>${esc(t('done'))}</button></div>`
    );
  }

  function privacyDialog() {
    openDialog(
      `<h2>${esc(t('privacyTitle'))}</h2><p>${esc(t('privacyText'))}</p><p>${esc(t('history'))}</p><p class="small">${esc(t('analyticsPrivacy'))}</p><div class="buttons"><button class="button outline" data-clear-local>${esc(t('clearLocal'))}</button><button class="button primary" data-close>${esc(t('done'))}</button></div>`
    );
  }

  function ask(text, action, label = t('confirm')) {
    openDialog(
      `<h2>${esc(text)}</h2><div class="buttons"><button class="button primary" id="confirm-action">${esc(label)}</button><button class="button outline" data-close>${esc(t('cancel'))}</button></div>`
    );

    $('#confirm-action').addEventListener('click', () => {
      closeDialog();
      action();
    }, { once: true });
  }

  /*
   * Guardados.
   */

  function toggleSave(key) {
    const apply = () => {
      if (bookmarks.includes(key)) {
        bookmarks = bookmarks.filter(item => item !== key);
        toast(t('removedToast'));
      } else {
        bookmarks.push(key);
        toast(t('savedToast'));
      }

      if (!write('ec.bookmarks.v2', bookmarks)) {
        toast(t('storageFail'));
      }

      const y = window.scrollY;
      render();
      window.scrollTo(0, y);
    };

    if (!bookmarks.length && !read('ec.bookmarks.notice.v2')) {
      openDialog(
        `<h2>${esc(t('saveChoiceTitle'))}</h2><p>${esc(t('saveChoice'))}</p><div class="buttons"><button class="button primary" id="accept-save">${esc(t('confirm'))}</button><button class="button outline" data-close>${esc(t('cancel'))}</button></div>`
      );

      $('#accept-save').addEventListener('click', () => {
        write('ec.bookmarks.notice.v2', true);
        closeDialog();
        apply();
      }, { once: true });
    } else {
      apply();
    }
  }

  /*
   * Videos y pausa.
   */

  function loadVideo(id) {
    const video = data.videos.find(item => item.id === id);
    if (!video) return;

    $('#video-' + id).innerHTML =
      `<iframe src="https://www.youtube-nocookie.com/embed/${esc(id)}?rel=0" title="${esc(tr(video).title)}" referrerpolicy="strict-origin-when-cross-origin" allow="encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe><button class="button outline small-button" data-video-close="${id}">${esc(t('stopVideo'))}</button>`;
  }

  function stopPause() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  function pauseToggle() {
    if (timer) {
      stopPause();
      $('#pause-ring').classList.remove('active');
      $('#pause-count').textContent = '30 s';
      $('#pause-toggle').textContent = t('pauseStart');
      return;
    }

    let seconds = 30;

    $('#pause-ring').classList.add('active');
    $('#pause-toggle').textContent = t('pauseStop');

    timer = setInterval(() => {
      seconds--;
      $('#pause-count').textContent = seconds + ' s';

      if (seconds === 0) {
        stopPause();
        $('#pause-ring').classList.remove('active');
        $('#pause-count').textContent = t('pauseEnd');
        $('#pause-toggle').textContent = t('pauseStart');
      }
    }, 1000);
  }

  /*
   * Google Analytics opcional.
   * No enviar rutas, temas, búsquedas ni cambios del editor.
   */

  const publicPageURL = () => {
    const url = new URL(
      safeURL(cfg.siteUrl) || location.origin + location.pathname
    );

    url.hash = '';
    url.search = '';
    return url.href;
  };

  const validAnalytics = () =>
    /^G-[A-Z0-9]{6,20}$/.test(cfg.ga4Id || '') &&
    location.protocol === 'https:';

  const noTrack = () =>
    navigator.globalPrivacyControl === true ||
    navigator.doNotTrack === '1' ||
    window.doNotTrack === '1';

  function analytics() {
    if (!consent || !validAnalytics() || noTrack() || analyticsLoaded) {
      return;
    }

    analyticsLoaded = true;
    window.dataLayer = window.dataLayer || [];

    window.gtag = function () {
      window.dataLayer.push(arguments);
    };

    const script = document.createElement('script');
    script.async = true;
    script.setAttribute('data-ec-analytics', '');
    script.src =
      'https://www.googletagmanager.com/gtag/js?id=' + cfg.ga4Id;

    document.head.appendChild(script);

    window.gtag('js', new Date());

    window.gtag('config', cfg.ga4Id, {
      send_page_view: false,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      page_title: 'En Confianza',
      page_location: publicPageURL(),
      page_referrer: ''
    });

    window.gtag('event', 'page_view', {
      page_title: 'En Confianza',
      page_location: publicPageURL(),
      page_referrer: ''
    });
  }

  function setConsent(value) {
    consent = value;

    if ($('#analytics-reload')) {
      $('#analytics-reload').hidden = value || !analyticsLoaded;
    }

    if (!value) remove('ec.analytics.v2');

    if (!write('ec.analytics.v2', value)) {
      toast(t('storageFail'));
    }

    if (value) {
      window['ga-disable-' + cfg.ga4Id] = false;

      window.gtag?.('consent', 'update', {
        analytics_storage: 'granted',
        ad_storage: 'denied'
      });

      analytics();
    } else {
      window['ga-disable-' + cfg.ga4Id] = true;

      document.querySelectorAll('script[data-ec-analytics]')
        .forEach(script => script.remove());

      window.gtag?.('consent', 'update', {
        analytics_storage: 'denied',
        ad_storage: 'denied'
      });

      const names = document.cookie.split(';')
        .map(cookie => cookie.split('=')[0].trim())
        .filter(name => /^_ga(?:_|$)|^_gid$|^_gat/.test(name));

      for (const name of names) {
        const paths = [
          '/',
          location.pathname.replace(/[^/]*$/, '')
        ];

        const hosts = [
          location.hostname,
          '.' + location.hostname
        ];

        for (const path of paths) {
          document.cookie = name + '=; Max-Age=0; path=' + path;

          for (const host of hosts) {
            document.cookie =
              name + '=; Max-Age=0; path=' + path + '; domain=' + host;
          }
        }
      }
    }
  }

  /*
   * Validación de contenido importado.
   * Solo se importan datos JSON.
   */

  function validDate(value) {
    if (
      typeof value !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}$/.test(value)
    ) {
      return false;
    }

    const parsed = new Date(value + 'T00:00:00Z');

    return !Number.isNaN(parsed.getTime()) &&
      parsed.toISOString().slice(0, 10) === value;
  }

  function validateContent(next) {
    const text = (value, max = 8000) => {
      if (typeof value !== 'string' || value.length > max) {
        throw Error('Texto inválido / Invalid text');
      }
    };

    const array = (value, max = 30) => {
      if (!Array.isArray(value) || value.length > max) {
        throw Error('Lista inválida / Invalid list');
      }
    };

    const sources = values => {
      array(values);

      if (!values.length) {
        throw Error('Agregá una fuente HTTPS / Add an HTTPS source');
      }

      values.forEach(source => {
        text(source.label, 500);

        if (!source.label.trim()) {
          throw Error('Fuente sin nombre / Missing source label');
        }

        if (!safeURL(source.url)) {
          throw Error('Fuente HTTPS inválida / Invalid HTTPS source');
        }
      });
    };

    const dual = (object, fields) => ['es', 'en'].forEach(language => {
      if (!object[language]) {
        throw Error('Falta un idioma / Missing language');
      }

      fields.forEach(field => text(object[language][field]));
    });

    if (!next || typeof next !== 'object') {
      throw Error('Formato inválido / Invalid format');
    }

    if (!validDate(next.meta?.checked)) {
      throw Error('Fecha inválida / Invalid date');
    }

    dual(next.meta, [
      'editorial',
      'scope',
      'emergency',
      'hours',
      'inclusion'
    ]);

    ['es', 'en'].forEach(language => copyKeys.forEach(key => {
      if (next.meta[language][key] !== undefined) {
        text(next.meta[language][key]);
      }
    }));

    array(next.topics, 7);

    if (
      next.topics.length !== 7 ||
      new Set(next.topics.map(topic => topic.id)).size !== 7
    ) {
      throw Error('Se requieren siete guías / Seven guides required');
    }

    next.topics.forEach(topic => {
      if (
        !topicIds.includes(topic.id) ||
        !imageIds.includes(topic.image)
      ) {
        throw Error('ID inválido / Invalid ID');
      }

      sources(topic.sources);
      dual(topic, ['title', 'short', 'intro', 'audience']);

      ['es', 'en'].forEach(language => {
        ['signs', 'steps', 'avoid', 'companion'].forEach(field => {
          array(topic[language][field]);
          topic[language][field].forEach(value => text(value));
        });
      });
    });

    array(next.resources, 20);

    if (
      new Set(next.resources.map(resource => resource.id)).size !==
      next.resources.length
    ) {
      throw Error('IDs repetidos / Duplicate IDs');
    }

    next.resources.forEach(resource => {
      if (
        typeof resource.id !== 'string' ||
        !/^[a-z]{2,24}$/.test(resource.id) ||
        typeof resource.phone !== 'string' ||
        !/^\d{3,15}$/.test(resource.phone) ||
        !safeURL(resource.website)
      ) {
        throw Error('Contacto inválido / Invalid contact');
      }

      text(resource.display, 80);

      if (
        resource.alternatePhone &&
        (
          typeof resource.alternatePhone !== 'string' ||
          !/^\d{3,15}$/.test(resource.alternatePhone)
        )
      ) {
        throw Error('Teléfono inválido / Invalid phone');
      }

      if (resource.alternateDisplay) {
        text(resource.alternateDisplay, 80);
      }

      if (
        Boolean(resource.alternatePhone) !==
        Boolean(resource.alternateDisplay)
      ) {
        throw Error('Completá ambos campos del teléfono alternativo / Complete both alternative phone fields');
      }

      if (
        resource.audienceGroup &&
        !['general', 'children', 'students', 'women']
          .includes(resource.audienceGroup)
      ) {
        throw Error('Público inválido / Invalid audience');
      }

      array(resource.tags, 7);

      if (resource.tags.some(id => !topicIds.includes(id))) {
        throw Error('Tema inválido / Invalid topic');
      }

      sources(resource.sources);

      dual(resource, [
        'name',
        'audience',
        'description',
        'hours',
        'cost'
      ]);

      if (
        resource.coverage !== undefined &&
        !['national', 'regional', 'unspecified']
          .includes(resource.coverage)
      ) {
        throw Error('Alcance inválido / Invalid coverage');
      }

      if (resource.checked && !validDate(resource.checked)) {
        throw Error('Fecha inválida / Invalid date');
      }
    });

    array(next.videos, 12);

    if (
      new Set(next.videos.map(video => video.id)).size !==
      next.videos.length
    ) {
      throw Error('IDs de video repetidos / Duplicate video IDs');
    }

    next.videos.forEach(video => {
      if (
        typeof video.id !== 'string' ||
        !/^[\w-]{11}$/.test(video.id) ||
        video.language !== 'es' ||
        !imageIds.includes(video.image) ||
        !safeURL(video.source)
      ) {
        throw Error('Video inválido / Invalid video');
      }

      dual(video, ['title', 'description']);
      text(video.org, 500);
      text(video.duration, 30);

      if (!/^\d{1,3}:[0-5]\d$/.test(video.duration)) {
        throw Error('Duración inválida / Invalid duration');
      }
    });

    dual(next.helpSomeone, [
      'title',
      'intro',
      'boundaries',
      'urgent'
    ]);

    sources(next.helpSomeone.sources);

    ['es', 'en'].forEach(language => {
      array(next.helpSomeone[language].steps);

      next.helpSomeone[language].steps.forEach(step => {
        text(step.title);
        text(step.text);
      });

      ['say', 'avoid'].forEach(field => {
        array(next.helpSomeone[language][field]);

        next.helpSomeone[language][field]
          .forEach(value => text(value));
      });
    });

    dual(next.wellbeing, ['title', 'intro', 'note']);
    sources(next.wellbeing.sources);

    ['es', 'en'].forEach(language => {
      array(next.wellbeing[language].cards);

      next.wellbeing[language].cards.forEach(card => {
        text(card.id, 80);
        text(card.title);
        text(card.text);
      });
    });

    array(next.faq, 50);

    if (
      new Set(next.faq.map(faq => faq.id)).size !== next.faq.length ||
      next.faq.some(faq =>
        typeof faq.id !== 'string' ||
        !/^([a-z][a-z0-9-]{1,80})$/.test(faq.id)
      )
    ) {
      throw Error('ID de pregunta inválido o repetido / Invalid or duplicate question ID');
    }

    next.faq.forEach(faq => dual(faq, ['question', 'answer']));

    return clone(next);
  }

  function validateMedia(next) {
    if (!next || Object.keys(next).length !== imageIds.length) {
      throw Error('Fotos incompletas / Missing photos');
    }

    for (const id of imageIds) {
      const localPhoto = [
        'hero',
        'mental',
        'anxiety',
        'sexual',
        'relationships',
        'crisis',
        'substances',
        'bullying',
        'listen'
      ].includes(id) && next[id] === './' + id + '.png';

      if (
        typeof next[id] !== 'string' ||
        next[id].length > 3000000 ||
        (
          !localPhoto &&
          !/^data:image\/(webp|png|jpeg);base64,[A-Za-z0-9+/=]+$/
            .test(next[id])
        )
      ) {
        throw Error('Foto inválida / Invalid photo');
      }
    }

    return { ...next };
  }

  /*
   * Editor local.
   */

  function photoLabel(id) {
    if (id === 'hero') {
      return lang === 'es' ? 'Portada' : 'Cover';
    }

    if (id === 'listen') return t('help');

    const topic = data.topics.find(item => item.image === id);
    return topic ? tr(topic).title : id;
  }

  function capturePendingForm() {
    const form = $('#editor-form');
    if (!form) return;

    pendingForm = {
      tab: editorTab,
      id: editorId,
      language: editLang,
      fields: Object.fromEntries(new FormData(form))
    };

    $('#editor-status').textContent = t('pending');
    $('#editor-discard').hidden = false;
  }

  function restorePendingForm() {
    if (
      currentRoute() !== 'editor' ||
      !pendingForm ||
      pendingForm.tab !== editorTab ||
      pendingForm.id !== editorId ||
      pendingForm.language !== editLang
    ) {
      return;
    }

    const form = $('#editor-form');
    if (!form) return;

    for (const [key, value] of Object.entries(pendingForm.fields)) {
      const field = form.querySelector('[name="' + key + '"]');
      if (field) field.value = value;
    }

    $('#editor-status').textContent = t('pending');
    $('#editor-discard').hidden = false;
  }

  function editorField(
    key,
    label,
    value,
    area = false,
    full = false
  ) {
    return `<label class="field ${full ? 'full' : ''}"><span>${esc(label)}</span>${area ? `<textarea name="${key}">${esc(value)}</textarea>` : `<input name="${key}" value="${esc(value)}">`}</label>`;
  }

  function editorForm() {
    const L = (es, en) => lang === 'es' ? es : en;

    const languageControl =
      `<label class="field"><span>${esc(t('editLang'))}</span><select id="editor-language"><option value="es" ${editLang === 'es' ? 'selected' : ''}>Español</option><option value="en" ${editLang === 'en' ? 'selected' : ''}>English</option></select></label>`;

    if (editorTab === 'site') {
      const q = data.meta[editLang];
      const fallback = words[editLang];

      return `<h2>${esc(L('Inicio y proyecto', 'Home and project'))}</h2>${languageControl}<form id="editor-form"><div class="form-grid">${[
        ['heroTitle', L('Título de inicio', 'Home title')],
        ['heroIntro', L('Introducción de inicio', 'Home introduction')],
        ['projectTitle', L('Título del proyecto', 'Project title')],
        ['projectText', L('Descripción del proyecto', 'Project description')],
        ['author', L('Autoría', 'Credit')],
        ['footer', L('Frase de pie de página', 'Footer tagline')]
      ].map(([key, label]) => editorField(
        key,
        label,
        q[key] || fallback[key] || (
          editLang === 'es'
            ? 'A veces, el primer paso es poder hablar.'
            : 'Sometimes, the first step is being able to talk.'
        ),
        true,
        true
      )).join('')}</div><div class="buttons"><button class="button primary" type="submit">${esc(t('apply'))}</button>${button('inicio', t('preview'), 'outline')}</div></form>`;
    }

    if (editorTab === 'advanced') {
      return `<h2>${esc(L('Todo el contenido · JSON', 'All content · JSON'))}</h2><p class="small">${esc(L('Para cambios en acompañamiento, bienestar, fuentes o nuevas instituciones. Conservá el esquema y ambos idiomas; se valida antes de aplicar. Para volver atrás, restaurá o importá un respaldo.', 'Edit support guidance, wellbeing, sources or new institutions. Preserve the schema and both languages; changes are validated before applying. Restore or import a backup to undo changes.'))}</p><form id="editor-form"><label class="field"><span>${esc(L('Contenido público completo', 'Complete public content'))}</span><textarea class="editor-json" name="json" spellcheck="false">${esc(JSON.stringify(data, null, 2))}</textarea></label><div class="buttons"><button type="submit" class="button primary">${esc(t('apply'))}</button>${exportButton('backup', t('exportBackup'))}</div></form>`;
    }

    if (editorTab === 'faq' || editorTab === 'videos') {
      const collection = editorTab === 'faq'
        ? data.faq
        : data.videos;

      const item = collection.find(value => value.id === editorId) ||
        collection[0];

      if (!item) return '';

      editorId = item.id;
      const q = item[editLang];

      return `<h2>${esc(t(editorTab === 'faq' ? 'faq' : 'videos'))}</h2><div class="form-grid"><label class="field"><span>${esc(t('choose'))}</span><select id="editor-item">${collection.map(value => `<option value="${esc(value.id)}" ${value.id === editorId ? 'selected' : ''}>${esc(value[editLang].question || value[editLang].title)}</option>`).join('')}</select></label>${languageControl}</div><form id="editor-form"><div class="form-grid">${editorTab === 'faq' ? editorField('question', L('Pregunta', 'Question'), q.question, true, true) + editorField('answer', L('Respuesta', 'Answer'), q.answer, true, true) : editorField('title', t('title'), q.title) + editorField('description', t('description'), q.description, true, true) + editorField('videoId', L('ID del video en YouTube (11 caracteres)', 'YouTube video ID (11 characters)'), item.id) + editorField('org', L('Institución que publica', 'Publishing institution'), item.org) + editorField('duration', L('Duración', 'Duration'), item.duration) + editorField('source', t('source') + ' HTTPS', item.source, false, true)}</div><div class="buttons"><button class="button primary" type="submit">${esc(t('apply'))}</button>${button(editorTab === 'faq' ? 'proyecto' : 'videos', t('preview'), 'outline')}</div></form>`;
    }

    if (editorTab === 'photos') {
      const id = imageIds.includes(editorId) ? editorId : 'hero';
      editorId = id;

      return `<h2>${esc(t('editPhotos'))}</h2><p class="small">${esc(t('photoNote'))}</p><label class="field"><span>${esc(t('choose'))}</span><select id="editor-item">${imageIds.map(key => `<option value="${key}" ${id === key ? 'selected' : ''}>${esc(photoLabel(key))}</option>`).join('')}</select></label><div class="editor-photo">${image(id)}</div><label class="field"><span>${esc(t('choosePhoto'))}</span><input type="file" id="editor-photo" accept="image/jpeg,image/png,image/webp"></label><div class="buttons">${exportButton('media', t('exportMedia'))}</div>`;
    }

    if (editorTab === 'backup') {
      return `<h2>${esc(t('backup'))}</h2><p>${esc(t('importText'))}</p><label class="field"><span>${esc(t('import'))}</span><input type="file" id="editor-import" accept="application/json,.json"></label><div class="buttons">${exportButton('content', t('exportContent'))}${exportButton('media', t('exportMedia'))}${exportButton('backup', t('exportBackup'))}</div><p class="small">${esc(t('editorNotice'))}</p>`;
    }

    const collection = editorTab === 'topics'
      ? data.topics
      : data.resources;

    const item = collection.find(value => value.id === editorId) ||
      collection[0];

    if (!item) return '';

    editorId = item.id;
    const q = item[editLang];

    const sourceText = item.sources
      .map(source => source.label + ' | ' + source.url)
      .join('\n');

    const common =
      `<label class="field"><span>${esc(t('choose'))}</span><select id="editor-item">${collection.map(value => `<option value="${value.id}" ${value.id === editorId ? 'selected' : ''}>${esc(value[editLang].title || value[editLang].name)}</option>`).join('')}</select></label><label class="field editor-language"><span>${esc(t('editLang'))}</span><select id="editor-language"><option value="es" ${editLang === 'es' ? 'selected' : ''}>Español</option><option value="en" ${editLang === 'en' ? 'selected' : ''}>English</option></select></label>`;

    const fields = editorTab === 'topics'
      ? editorField('title', t('title'), q.title) +
        editorField('short', t('short'), q.short) +
        editorField('intro', t('description'), q.intro, true, true) +
        editorField('audience', t('audience'), q.audience, true, true) +
        ['signs', 'steps', 'avoid', 'companion'].map(key =>
          editorField(
            key,
            t(key) + ' · ' + (
              lang === 'es'
                ? 'un punto por línea'
                : 'one item per line'
            ),
            q[key].join('\n'),
            true,
            true
          )
        ).join('')
      : editorField('name', t('name'), q.name) +
        editorField('audience', t('audience'), q.audience) +
        editorField('description', t('description'), q.description, true, true) +
        editorField('hours', t('hours'), q.hours) +
        editorField('cost', t('cost'), q.cost) +
        editorField('phone', t('phone'), item.phone) +
        editorField('display', t('display'), item.display) +
        editorField(
          'alternatePhone',
          lang === 'es'
            ? 'Otro número (opcional, solo dígitos)'
            : 'Alternative number (optional, digits only)',
          item.alternatePhone || ''
        ) +
        editorField(
          'alternateDisplay',
          lang === 'es'
            ? 'Otro número visible (opcional)'
            : 'Alternative display number (optional)',
          item.alternateDisplay || ''
        ) +
        editorField('website', t('website'), item.website, false, true) +
        `<label class="field"><span>${esc(t('coverage'))}</span><select name="coverage">${['national', 'regional', 'unspecified'].map(key => `<option value="${key}" ${(item.coverage || 'unspecified') === key ? 'selected' : ''}>${esc(t(key))}</option>`).join('')}</select></label>` +
        `<label class="field"><span>${esc(t('filterAudience'))}</span><select name="audienceGroup">${['general', 'children', 'students', 'women'].map(key => `<option value="${key}" ${(item.audienceGroup || {
          cppcr: 'general',
          iafa: 'general',
          pani: 'children',
          mep: 'students',
          inamu: 'women'
        }[item.id] || 'general') === key ? 'selected' : ''}>${esc(t(key))}</option>`).join('')}</select></label>` +
        editorField('tags', t('tags'), item.tags.join(','), false, true);

    return `<h2>${esc(t(editorTab === 'topics' ? 'editGuides' : 'editContacts'))}</h2><div class="form-grid">${common}</div><form id="editor-form"><div class="form-grid">${fields}${editorField('sources', t('sourcesHelp'), sourceText, true, true)}</div><div class="buttons"><button class="button primary" type="submit">${esc(t('apply'))}</button>${button(editorTab === 'topics' ? 'tema/' + item.id : 'recursos', t('preview'), 'outline')}</div></form>`;
  }

  function exportButton(kind, label) {
    return `<button type="button" class="button outline small-button" data-export="${kind}">${esc(label)}</button>`;
  }

  function editorPage() {
    return pageHead(t('editor'), t('editorIntro')) +
      `<section class="shell section" style="padding-top:0"><p class="notice small">${esc(t('editorNotice'))}</p><div class="editor-layout"><aside class="editor-menu">${[
        ['site', lang === 'es' ? 'Inicio y proyecto' : 'Home and project'],
        ['resources', 'editContacts'],
        ['topics', 'editGuides'],
        ['faq', 'faq'],
        ['videos', 'videos'],
        ['photos', 'editPhotos'],
        ['advanced', lang === 'es' ? 'Todo el contenido' : 'All content'],
        ['backup', 'backup']
      ].map(([key, label]) => `<button data-editor-tab="${key}" class="${editorTab === key ? 'active' : ''}">${esc(t(label))}</button>`).join('')}<p class="small" id="editor-status" role="status" aria-live="polite">${esc(t(pendingForm ? 'pending' : dirty ? 'edited' : 'base'))}</p><button type="button" class="button outline small-button" id="editor-discard" ${pendingForm ? '' : 'hidden'}>${esc(t('discard'))}</button><button class="button soft small-button" data-editor-save>${esc(t('saveDevice'))}</button>${exportButton('content', t('exportContent'))}${exportButton('backup', t('exportBackup'))}<button class="button outline small-button" data-editor-restore>${esc(t('restore'))}</button></aside><div class="editor-panel" id="editor-panel" tabindex="-1">${editorForm()}</div></div></section>`;
  }

  function applyEditor(form) {
    try {
      const values = new FormData(form);
      const next = clone(data);

      if (['site', 'faq', 'videos', 'advanced'].includes(editorTab)) {
        let checked = next;
        let nextEditorId = editorId;

        if (editorTab === 'site') {
          copyKeys.forEach(key => {
            next.meta[editLang][key] =
              String(values.get(key) || '').trim();
          });
        }

        if (editorTab === 'faq') {
          const item = next.faq.find(value => value.id === editorId);

          ['question', 'answer'].forEach(key => {
            item[editLang][key] = String(values.get(key) || '').trim();
          });
        }

        if (editorTab === 'videos') {
          const item = next.videos.find(value => value.id === editorId);

          ['title', 'description'].forEach(key => {
            item[editLang][key] = String(values.get(key) || '').trim();
          });

          item.id = String(values.get('videoId') || '').trim();

          ['org', 'duration', 'source'].forEach(key => {
            item[key] = String(values.get(key) || '').trim();
          });

          nextEditorId = item.id;
        }

        if (editorTab === 'advanced') {
          checked = JSON.parse(String(values.get('json')));

          checked.resources.forEach(resource => {
            resource.edited = true;
          });

          checked.topics.forEach(topic => {
            topic.edited = true;
          });
        }

        data = validateContent(checked);
        editorId = nextEditorId;
        dirty = true;
        pendingForm = null;

        render(false, '#editor-panel-title');
        toast(t('valid'));
        return;
      }

      const collection = editorTab === 'topics'
        ? next.topics
        : next.resources;

      const item = collection.find(value => value.id === editorId);
      const q = item[editLang];

      const fields = editorTab === 'topics'
        ? ['title', 'short', 'intro', 'audience']
        : ['name', 'audience', 'description', 'hours', 'cost'];

      fields.forEach(key => {
        q[key] = String(values.get(key) || '').trim();
      });

      if (editorTab === 'topics') {
        ['signs', 'steps', 'avoid', 'companion'].forEach(key => {
          q[key] = String(values.get(key) || '')
            .split('\n')
            .map(value => value.trim())
            .filter(Boolean);
        });
      } else {
        ['phone', 'display', 'website'].forEach(key => {
          item[key] = String(values.get(key) || '').trim();
        });

        item.alternatePhone =
          String(values.get('alternatePhone') || '').trim();

        item.alternateDisplay =
          String(values.get('alternateDisplay') || '').trim();

        item.coverage =
          String(values.get('coverage') || 'unspecified');

        item.audienceGroup =
          String(values.get('audienceGroup') || 'general');

        item.tags = String(values.get('tags') || '')
          .split(',')
          .map(value => value.trim())
          .filter(Boolean);
      }

      item.sources = String(values.get('sources') || '')
        .split('\n')
        .filter(value => value.trim())
        .map(line => {
          const pos = line.indexOf('|');

          if (pos < 1) throw Error(t('sourcesHelp'));

          return {
            label: line.slice(0, pos).trim(),
            url: line.slice(pos + 1).trim()
          };
        });

      item.edited = true;
      data = validateContent(next);
      dirty = true;
      pendingForm = null;

      render(false, '#editor-panel-title');
      toast(t('valid'));
    } catch (error) {
      toast(t('invalid') + error.message);
    }
  }

  /*
   * Exportación e importación.
   */

  function download(
    filename,
    content,
    type = 'text/plain;charset=utf-8'
  ) {
    const url = URL.createObjectURL(new Blob([content], { type }));
    const anchor = document.createElement('a');

    anchor.href = url;
    anchor.download = filename;

    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast(t('download'));
  }

  function exportData(kind) {
    if (kind === 'content') {
      download(
        'content.js',
        `/* En Confianza · contenido público exportado. Confirmá los contactos editados. */\n'use strict';\nwindow.EC_CONTENT = ${JSON.stringify(data, null, 2)};\n`,
        'text/javascript;charset=utf-8'
      );
    }

    if (kind === 'media') {
      download(
        'media.js',
        `/* En Confianza · fotos del proyecto. */\nwindow.EC_MEDIA = ${JSON.stringify(media)};\n`,
        'text/javascript;charset=utf-8'
      );
    }

    if (kind === 'backup') {
      download(
        'en-confianza-respaldo.json',
        JSON.stringify({
          version: 2,
          content: data,
          media
        }, null, 2),
        'application/json'
      );
    }
  }

  async function importData(file) {
    try {
      if (!file || file.size > 28000000) {
        throw Error('Máximo 28 MB / 28 MB maximum');
      }

      const next = JSON.parse(await file.text());

      if (next.version !== 2) {
        throw Error('Versión de respaldo inválida / Invalid backup version');
      }

      const checked = validateContent(next.content);
      const checkedMedia = validateMedia(next.media);

      data = checked;
      media = checkedMedia;
      dirty = true;
      pendingForm = null;

      render(false, '#editor-panel-title');
      toast(t('importOK'));
    } catch (error) {
      toast(t('invalid') + error.message);
    }
  }

  function importPhoto(file) {
    if (!file) return;

    if (
      !['image/png', 'image/jpeg', 'image/webp'].includes(file.type) ||
      file.size > 2 * 1024 * 1024
    ) {
      toast(t('photoNote'));
      return;
    }

    const id = editorId;
    const reader = new FileReader();

    reader.onload = () => {
      try {
        const next = {
          ...media,
          [id]: reader.result
        };

        media = validateMedia(next);
        dirty = true;
        pendingForm = null;

        render(false, '#editor-panel-title');
        toast(t('valid'));
      } catch (error) {
        toast(t('invalid') + error.message);
      }
    };

    reader.onerror = () => {
      toast(t('invalid') + t('choosePhoto'));
    };

    reader.readAsDataURL(file);
  }

  /*
   * Recuperar borrador guardado en este navegador.
   */

  const saved = read('ec.editor.v2');

  if (saved) {
    try {
      data = validateContent(saved.content);
      media = validateMedia(saved.media);
      dirty = true;
    } catch {
      remove('ec.editor.v2');
    }
  }

  /*
   * Eventos.
   */

  document.addEventListener('click', async event => {
    const target = event.target.closest('button,a');
    if (!target) return;

    const leavingDraft =
      currentRoute() === 'editor' &&
      pendingForm &&
      (
        target.dataset.export ||
        target.dataset.editorTab ||
        target.hasAttribute('data-editor-save') ||
        target.id === 'language' ||
        (
          target.tagName === 'A' &&
          target.getAttribute('href')?.startsWith('#') &&
          target.getAttribute('href') !== '#main'
        )
      );

    if (leavingDraft) {
      event.preventDefault();
      toast(t('pending'));
      return;
    }

    if (target.hasAttribute('data-close')) {
      closeDialog();
      return;
    }

    if (target.dataset.save) {
      toggleSave(target.dataset.save);
      return;
    }

    if (target.dataset.video) {
      loadVideo(target.dataset.video);
      return;
    }

    if (target.dataset.videoClose) {
      const video = data.videos.find(item =>
        item.id === target.dataset.videoClose
      );

      $('#video-' + video.id).innerHTML =
        `<button class="video-cover" data-video="${video.id}" aria-label="${esc(t('play') + ' · ' + tr(video).title)}">${image(video.image)}<span>▶ ${esc(t('play'))} · ${esc(video.duration)}</span></button>`;

      return;
    }

    if (target.dataset.jump) {
      event.preventDefault();

      $('#' + target.dataset.jump)?.scrollIntoView({
        behavior: reducedMotion() ? 'instant' : 'smooth'
      });

      $('#' + target.dataset.jump)?.focus({
        preventScroll: true
      });

      return;
    }

    if (target.hasAttribute('data-search-result')) {
      closeDialog();

      const route = target.getAttribute('href').slice(1);
      const jump = target.dataset.resultJump;

      if (jump?.startsWith('resource-')) {
        dir.query = '';
        dir.topic = 'all';
        dir.audience = 'all';
      }

      if (currentRoute() === route) render();

      setTimeout(() => {
        if (jump) {
          const result = $('#' + jump);

          if (result?.tagName === 'DETAILS') result.open = true;

          result?.setAttribute('tabindex', '-1');
          result?.scrollIntoView({ behavior: 'instant' });
          result?.focus({ preventScroll: true });
        }
      }, 80);
    }

    if (target.hasAttribute('data-clear-filters')) {
      dir.query = '';
      dir.topic = 'all';
      dir.audience = 'all';
      render();
      return;
    }

    if (target.hasAttribute('data-clear-saved')) {
      ask(t('clearSaved') + '?', () => {
        bookmarks = [];
        remove('ec.bookmarks.v2');
        remove('ec.bookmarks.notice.v2');
        render(false, '#view-title');
      });

      return;
    }

    if (target.hasAttribute('data-clear-local')) {
      ask(t('clearLocalQuestion'), () => {
        bookmarks = [];
        lang = 'es';
        theme = 'light';
        scale = 1;
        motion = 'auto';

        [
          'ec.preferences.v2',
          'ec.bookmarks.v2',
          'ec.bookmarks.notice.v2',
          'ec.analytics.v2'
        ].forEach(remove);

        setConsent(false);
        render();
      });

      return;
    }

    if (target.hasAttribute('data-share')) {
      try {
        if (navigator.share) {
          await navigator.share({
            title: document.title,
            url: location.href
          });
        } else {
          await navigator.clipboard.writeText(location.href);
          toast(t('copied'));
        }
      } catch (error) {
        if (error.name !== 'AbortError') toast(t('copyFail'));
      }

      return;
    }

    if (target.hasAttribute('data-print')) {
      window.print();
      return;
    }

    if (target.dataset.editorTab) {
      editorTab = target.dataset.editorTab;
      editorId = '';
      render();
      return;
    }

    if (target.dataset.export) {
      exportData(target.dataset.export);
      return;
    }

    if (target.hasAttribute('data-editor-save')) {
      if (write('ec.editor.v2', { content: data, media })) {
        toast(t('savedToast'));
      } else {
        toast(t('storageFail'));
      }

      return;
    }

    if (target.hasAttribute('data-editor-restore')) {
      ask(t('restoreText'), () => {
        data = clone(original);
        media = { ...originalMedia };
        dirty = false;
        pendingForm = null;
        remove('ec.editor.v2');
        editorId = '';

        render(false, '#editor-panel-title');
      });

      return;
    }

    switch (target.id) {
      case 'analytics-reload':
        if (pendingForm || dirty) {
          ask(
            t('reloadWarning'),
            () => location.reload(),
            t('reloadAnalytics')
          );
        } else {
          location.reload();
        }
        break;

      case 'search-open':
        searchDialog();
        break;

      case 'appearance':
      case 'settings-open':
        settingsDialog();
        break;

      case 'privacy-open':
        privacyDialog();
        break;

      case 'accessibility-open':
        accessibilityDialog();
        break;

      case 'accessibility-settings':
        settingsDialog();
        break;

      case 'editor-discard':
        pendingForm = null;
        render(false, '#editor-panel-title');
        break;

      case 'dialog-close':
        closeDialog();
        break;

      case 'language':
        lang = lang === 'es' ? 'en' : 'es';
        savePreferences();
        render();
        break;

      case 'menu-toggle':
        $('#mobile-menu').hidden = !$('#mobile-menu').hidden;

        target.setAttribute(
          'aria-expanded',
          String(!$('#mobile-menu').hidden)
        );

        target.setAttribute(
          'aria-label',
          lang === 'es'
            ? $('#mobile-menu').hidden ? 'Abrir menú' : 'Cerrar menú'
            : $('#mobile-menu').hidden ? 'Open menu' : 'Close menu'
        );
        break;

      case 'pause-toggle':
        pauseToggle();
        break;

      case 'quick-exit':
        stopPause();

        document.querySelectorAll('iframe').forEach(frame => {
          frame.remove();
        });

        if ($('#dialog').open) closeDialog();

        location.replace(
          safeURL(cfg.quickExitUrl) || 'https://www.google.com/'
        );
        break;

      case 'skip-link':
        event.preventDefault();
        $('#main').focus();
        break;
    }
  });

  document.addEventListener('input', event => {
    if (event.target.closest('#editor-form')) {
      capturePendingForm();
    }

    if (event.target.id === 'global-query') {
      searchResults(event.target.value);
    }

    if (event.target.id === 'directory-query') {
      dir.query = event.target.value;
      $('#directory-results').innerHTML = directoryResults();
    }
  });

  document.addEventListener('change', event => {
    const element = event.target;

    if (element.closest('#editor-form')) {
      capturePendingForm();
    }

    if (
      pendingForm &&
      (
        element.id === 'editor-item' ||
        element.id === 'editor-language'
      )
    ) {
      element.value = element.id === 'editor-item'
        ? editorId
        : editLang;

      toast(t('pending'));
      return;
    }

    if (
      element.id === 'directory-topic' ||
      element.id === 'directory-audience'
    ) {
      dir[
        element.id === 'directory-topic' ? 'topic' : 'audience'
      ] = element.value;

      $('#directory-results').innerHTML = directoryResults();
    }

    if (element.dataset.setting) {
      const key = element.dataset.setting;

      if (key === 'theme') theme = element.value;
      if (key === 'scale') scale = Number(element.value);
      if (key === 'motion') motion = element.value;

      applyAppearance();
      savePreferences();
    }

    if (element.id === 'analytics-choice') {
      setConsent(element.value === 'yes');
    }

    if (element.id === 'editor-item') {
      editorId = element.value;
      render();
    }

    if (element.id === 'editor-language') {
      editLang = element.value;
      render();
    }

    if (element.id === 'editor-import') {
      importData(element.files[0]);
    }

    if (element.id === 'editor-photo') {
      importPhoto(element.files[0]);
    }
  });

  document.addEventListener('submit', event => {
    if (event.target.id === 'editor-form') {
      event.preventDefault();
      applyEditor(event.target);
    }
  });

  $('#dialog').addEventListener('cancel', () => {
    restoreDialogFocus();
  });

  $('#dialog').addEventListener('click', event => {
    if (event.target === $('#dialog')) {
      const rect = $('#dialog').getBoundingClientRect();

      if (
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom
      ) {
        closeDialog();
      }
    }
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !$('#mobile-menu').hidden) {
      $('#mobile-menu').hidden = true;
      $('#menu-toggle').setAttribute('aria-expanded', 'false');
    }
  });

  window.addEventListener('hashchange', () => {
    if (currentRoute() === 'main') return;

    $('#mobile-menu').hidden = true;
    $('#menu-toggle').setAttribute('aria-expanded', 'false');
    render(true);
  });

  /*
   * Inicio y altura de la cabecera fija.
   */

  render();
  analytics();

  const sticky = $('#sticky-header');

  const updateSticky = () => {
    const height = sticky.getBoundingClientRect().height;

    document.documentElement.style.setProperty(
      '--sticky-offset',
      Math.ceil(height) + 'px'
    );
  };

  updateSticky();

  if (typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(updateSticky).observe(sticky);
  }

  window.addEventListener('resize', updateSticky);
})();
