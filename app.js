'use strict';

(() => {
  const images = JSON.parse(
    document.getElementById('image-data').textContent
  );

  const topics = JSON.parse(
    document.getElementById('topic-data').textContent
  );

  const $ = id => document.getElementById(id);

  const store = {
    get(k) {
      try {
        return localStorage.getItem(k);
      } catch {
        return null;
      }
    },

    set(k, v) {
      try {
        localStorage.setItem(k, v);
      } catch {
        // La página funciona aunque el navegador bloquee el almacenamiento.
      }
    }
  };

  let lang = store.get('ec-lang') === 'en' ? 'en' : 'es';

  let theme =
    store.get('ec-theme') ||
    (
      window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
    );

  let consent = store.get('ec-measurement') === 'yes';

  let dialogKind = null;

  const escape = s =>
    String(s).replace(
      /[&<>"']/g,
      c => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[c])
    );

  const words = {
    es: {
      skip: 'Ir al contenido',

      urgentBar:
        'Si hay peligro inmediato, llamá al 9-1-1.',

      call911: 'Llamar 9-1-1 ↗',

      country: 'Un espacio para Costa Rica',

      navTopics: 'Entender',

      navResources: 'Encontrar apoyo',

      navVideos: 'Ver y escuchar',

      exit: 'Salir rápido ↗',

      heroEyebrow:
        'A veces, empezar es lo más difícil.',

      heroTitle:
        'Podés hablar.<br>Podés pedir ayuda.',

      heroLead:
        'No tenés que tener todas las respuestas. Encontrá información clara y opciones de apoyo en Costa Rica, a tu ritmo.',

      seek:
        'Busco ayuda <span>↗</span>',

      support:
        'Quiero ayudar a alguien',

      heroNote:
        'Gratis, sin cuenta y para todas las personas.',

      photoNote:
        'Un primer paso.<br>Una conversación.',

      intro:
        'Sea para vos o para alguien cercano, acá hay un lugar para empezar.',

      aboutLink:
        'Conocé el proyecto ↗',

      topicsEyebrow:
        'Pongámosle palabras',

      topicsTitle:
        '¿Sobre qué querés conversar?',

      topicsLead:
        'Elegí un tema. Encontrarás orientación sencilla y un siguiente paso.',

      resourcesEyebrow:
        'Apoyo cerca de vos',

      resourcesTitle:
        'Un contacto puede abrir una puerta.',

      resourcesLead:
        'Servicios de Costa Rica. Cada uno tiene su propio alcance y horario.',

      emergencyTitle:
        '¿Hay peligro inmediato?',

      emergencyText:
        'Ante una emergencia médica, violencia en curso o riesgo inmediato de hacerte daño, llamá al 9-1-1.',

      searchLabel:
        'Buscar un recurso',

      filterLabel:
        'Necesito apoyo sobre',

      resourcesNote:
        'Fuentes públicas consultadas el 5 de octubre de 2026. Los horarios pueden cambiar; confirmalos con la institución. Los servicios nacionales están disponibles desde distintas provincias.',

      listenEyebrow:
        'Estar presente también ayuda',

      listenTitle:
        'No necesitás las palabras perfectas.',

      listenLead:
        'Escuchar con respeto es un buen comienzo. Podés decir: «Gracias por contármelo. ¿Cómo puedo acompañarte?»',

      listen1Title:
        'Escuchá sin juzgar.',

      listen1:
        'Dejá espacio para que la persona hable, sin exigir detalles.',

      listen2Title:
        'Preguntá qué necesita.',

      listen2:
        'Ofrecé opciones y respetá sus decisiones. Ante peligro inmediato, buscá ayuda urgente.',

      listen3Title:
        'Ayudá a dar el siguiente paso.',

      listen3:
        'Podés acompañarla a llamar a un servicio o buscar atención profesional.',

      listenCTA:
        'Encontrar un servicio de apoyo ↗',

      videosEyebrow:
        'Otra forma de acercarte',

      videosTitle:
        'Ver, escuchar, entender.',

      videosLead:
        'Tres recursos en español de UNICEF y el IAFA de Costa Rica.',

      videosNote:
        'Los reproductores se cargan solo al elegir un video. Al hacerlo, te conectás con YouTube y sus prácticas de privacidad. Las imágenes de portada son ilustrativas.',

      faqEyebrow:
        'Sin pena de preguntar',

      faqTitle:
        'Preguntas que quizás tenés.',

      aboutEyebrow:
        'Sobre En Confianza',

      aboutTitle:
        'Información cercana.<br>Un paso a la vez.',

      aboutText:
        'En Confianza es una iniciativa personal e independiente para facilitar el acceso a información y recursos de apoyo en Costa Rica. Está dirigida a todas las personas, incluyendo hombres, mujeres, personas LGBTQ+, jóvenes y familias.',

      aboutLimit:
        'Ofrecemos orientación informativa. No brindamos terapia, diagnóstico ni atención de emergencias. Las instituciones enlazadas atienden directamente y no son patrocinadoras de este proyecto.',

      imageDisclosure:
        'Las nueve fotografías fueron generadas con IA y son ilustrativas; no representan testimonios ni profesionales del proyecto.',

      aboutCTA:
        'Ver fuentes y servicios ↗',

      footerText:
        'Un primer paso, a tu ritmo. Costa Rica · 2026',

      privacy:
        'Privacidad',

      preferences:
        'Preferencias',

      accessibility:
        'Accesibilidad',

      exitNote:
        'Salir rápido abre otra página. No borra el historial ni oculta la actividad del dispositivo.',

      guide:
        'Explorar el tema ↗',

      steps:
        'Un siguiente paso',

      find:
        'Encontrar apoyo',

      sources:
        'Fuentes de esta guía',

      all:
        'Todos los temas',

      searchPlaceholder:
        'Nombre o tema',

      call:
        'Llamar',

      website:
        'Sitio oficial ↗',

      source:
        'Fuente y horario ↗',

      copy:
        'Copiar número',

      copied:
        'Número copiado',

      copyFail:
        'No se pudo copiar. Podés seleccionar el número.',

      results:
        n => `${n} recursos disponibles`,

      empty:
        'No encontramos coincidencias. Probá otro término o elegí todos los temas.',

      play:
        'Cargar video',

      youtube:
        'Ver en YouTube ↗',

      videoPause:
        'Cerrar reproductor',

      themeLabel:
        'Cambiar entre modo claro y oscuro',

      close:
        'Cerrar',

      checked:
        'Consultado el 05/10/2026',

      privacyTitle:
        'Tu privacidad',

      privacyBody:
        '<p>No solicitamos relatos personales, cuentas ni datos médicos. Las búsquedas y los temas que consultás se procesan en tu navegador y no los enviamos a Analytics.</p>' +
        '<p>Guardamos en este dispositivo tus preferencias de idioma, apariencia y medición. El alojamiento de GitHub Pages puede registrar información técnica, incluida la dirección IP. Los sitios externos aplican sus propias políticas.</p>' +
        '<p>Si activás la medición, Google Analytics recibirá una visita general a la página, sin el tema consultado, texto de búsqueda ni fragmentos de URL. Google puede procesar información técnica y usar cookies. No se activa sin tu elección y podés retirarla en Preferencias.</p>' +
        '<p>Los videos se conectan a YouTube únicamente cuando elegís cargarlos. Usamos el reproductor de privacidad mejorada; eso no equivale a ausencia de recopilación.</p>' +
        '<p>No ofrecemos una garantía de anonimato frente al alojamiento, servicios externos o dispositivos supervisados.</p>',

      preferencesTitle:
        'Vos elegís',

      preferencesBody:
        '<p>Las preferencias de idioma y apariencia se guardan localmente. La medición es opcional y no registra búsquedas, temas ni reproducciones.</p>',

      measurementUnavailable:
        'La medición todavía no está configurada. Podés usar toda la página sin enviar estadísticas.',

      measurementOn:
        'Medición opcional activada.',

      measurementOff:
        'Medición opcional desactivada.',

      accept:
        'Aceptar medición',

      reject:
        'Mantener desactivada',

      withdraw:
        'Desactivar y recargar',

      accessTitle:
        'Una página cómoda de usar',

      accessBody:
        '<p>Podés navegar con teclado, ampliar el texto con el zoom del navegador y elegir modo claro u oscuro. Respetamos la preferencia de reducir movimiento.</p>' +
        '<p>Los videos son recursos de terceros; los subtítulos disponibles dependen del reproductor original. Las guías escritas y los contactos permiten acceder al contenido sin reproducirlos.</p>' +
        '<p>El botón Salir rápido abre Google y cierra los reproductores. No borra el historial ni protege frente a monitoreo del dispositivo.</p>' +
        '<p>Este sitio aún no cuenta con una auditoría externa de accesibilidad.</p>'
    },

    en: {
      skip:
        'Skip to content',

      urgentBar:
        'For immediate danger in Costa Rica, call 9-1-1.',

      call911:
        'Call 9-1-1 ↗',

      country:
        'A space for Costa Rica',

      navTopics:
        'Understand',

      navResources:
        'Find support',

      navVideos:
        'Watch and listen',

      exit:
        'Quick exit ↗',

      heroEyebrow:
        'Sometimes, starting is the hardest part.',

      heroTitle:
        'You can talk.<br>You can ask for help.',

      heroLead:
        'You do not need all the answers. Find clear information and support options in Costa Rica, at your own pace.',

      seek:
        'I need support <span>↗</span>',

      support:
        'I want to help someone',

      heroNote:
        'Free, no account, and open to everyone.',

      photoNote:
        'A first step.<br>A conversation.',

      intro:
        'For yourself or someone close to you, here is a place to start.',

      aboutLink:
        'About the project ↗',

      topicsEyebrow:
        'Let’s find the words',

      topicsTitle:
        'What would you like to talk about?',

      topicsLead:
        'Choose a topic for straightforward guidance and a next step.',

      resourcesEyebrow:
        'Support within reach',

      resourcesTitle:
        'One contact can open a door.',

      resourcesLead:
        'Costa Rican services. Each has its own scope and opening hours.',

      emergencyTitle:
        'Is there immediate danger?',

      emergencyText:
        'For a medical emergency, ongoing violence or immediate risk of harming yourself, call 9-1-1 in Costa Rica.',

      searchLabel:
        'Search for a resource',

      filterLabel:
        'I need support with',

      resourcesNote:
        'Public sources checked on October 5, 2026. Hours may change; confirm with the provider. National services can be reached from different provinces. English-language service is not guaranteed.',

      listenEyebrow:
        'Being there matters',

      listenTitle:
        'You do not need perfect words.',

      listenLead:
        'Listening respectfully is a good start. You can say: “Thank you for telling me. How can I support you?”',

      listen1Title:
        'Listen without judgement.',

      listen1:
        'Give them room to talk, without demanding details.',

      listen2Title:
        'Ask what they need.',

      listen2:
        'Offer options and respect their decisions. For immediate danger, seek urgent help.',

      listen3Title:
        'Help with the next step.',

      listen3:
        'You can support them in contacting a service or seeking professional care.',

      listenCTA:
        'Find a support service ↗',

      videosEyebrow:
        'Another way to connect',

      videosTitle:
        'Watch, listen, understand.',

      videosLead:
        'Three Spanish-language resources from UNICEF and Costa Rica’s IAFA.',

      videosNote:
        'Players only load when you choose a video. This connects you to YouTube and its privacy practices. Cover images are illustrative.',

      faqEyebrow:
        'It is okay to ask',

      faqTitle:
        'Questions you may have.',

      aboutEyebrow:
        'About En Confianza',

      aboutTitle:
        'Clear information.<br>One step at a time.',

      aboutText:
        'En Confianza is an independent personal initiative helping people find information and support resources in Costa Rica. It welcomes everyone, including men, women, LGBTQ+ people, young people and families.',

      aboutLimit:
        'We provide general information. We do not offer therapy, diagnosis or emergency response. Linked institutions provide their services directly and do not sponsor this project.',

      imageDisclosure:
        'All nine photographs were generated with AI and are illustrative. They do not depict project professionals or testimonials.',

      aboutCTA:
        'View sources and services ↗',

      footerText:
        'A first step, at your pace. Costa Rica · 2026',

      privacy:
        'Privacy',

      preferences:
        'Preferences',

      accessibility:
        'Accessibility',

      exitNote:
        'Quick exit opens another page. It does not erase browsing history or hide device activity.',

      guide:
        'Explore this topic ↗',

      steps:
        'A next step',

      find:
        'Find support',

      sources:
        'Sources for this guide',

      all:
        'All topics',

      searchPlaceholder:
        'Name or topic',

      call:
        'Call',

      website:
        'Official website ↗',

      source:
        'Source and hours ↗',

      copy:
        'Copy number',

      copied:
        'Number copied',

      copyFail:
        'Could not copy. You can select the number.',

      results:
        n => `${n} resources available`,

      empty:
        'No matches found. Try another term or select all topics.',

      play:
        'Load video',

      youtube:
        'Watch on YouTube ↗',

      videoPause:
        'Close player',

      themeLabel:
        'Switch between light and dark mode',

      close:
        'Close',

      checked:
        'Checked October 5, 2026',

      privacyTitle:
        'Your privacy',

      privacyBody:
        '<p>We do not ask for personal stories, accounts or medical information. Searches and selected topics stay in your browser and are not sent to Analytics.</p>' +
        '<p>Your language, theme and measurement preferences are stored on this device. GitHub Pages hosting may log technical information, including IP addresses. External websites apply their own privacy policies.</p>' +
        '<p>If you enable measurement, Google Analytics receives one general page visit without the topic, search text or URL fragment. Google may process technical information and use cookies. It is only enabled after your choice and can be withdrawn in Preferences.</p>' +
        '<p>Videos connect to YouTube only when you choose to load them. We use its privacy-enhanced player; this does not mean no data collection.</p>' +
        '<p>We cannot guarantee anonymity from hosting providers, external services or a monitored device.</p>',

      preferencesTitle:
        'Your choice',

      preferencesBody:
        '<p>Language and theme preferences are stored locally. Measurement is optional and does not track searches, topics or video plays.</p>',

      measurementUnavailable:
        'Measurement is not configured yet. You can use the full website without sending analytics.',

      measurementOn:
        'Optional measurement is enabled.',

      measurementOff:
        'Optional measurement is disabled.',

      accept:
        'Allow measurement',

      reject:
        'Keep disabled',

      withdraw:
        'Disable and reload',

      accessTitle:
        'Designed for comfortable use',

      accessBody:
        '<p>You can use the keyboard, increase text size with browser zoom and choose a light or dark theme. We respect reduced-motion preferences.</p>' +
        '<p>Videos are third-party resources; available captions depend on the original player. Written guides and contacts provide access without playing a video.</p>' +
        '<p>Quick exit opens Google and closes video players. It does not erase history or protect against device monitoring.</p>' +
        '<p>This site has not yet received an independent accessibility audit.</p>'
    }
  };

  const t = k => words[lang][k];

  const resources = [
    {
      id: 'cppcr',

      tags: [
        'mental',
        'anxiety',
        'crisis',
        'relationships',
        'sexual',
        'bullying'
      ],

      phone: '8002737869',

      display: '800-273-7869',

      site:
        'https://aquiestoy.cr/',

      source:
        'https://www.mep.go.cr/programas-proyectos/aqui-estoy',

      es: {
        name:
          'Aquí Estoy · Colegio de Psicología',

        tag:
          'Orientación emocional · población general',

        desc:
          'Apoyo para malestar emocional, ansiedad, depresión y situaciones de crisis. Servicio gratuito del Colegio de Profesionales en Psicología.',

        hours:
          'Lun–vie 14:00–22:00 · sáb 09:00–16:00. Hora de Costa Rica.'
      },

      en: {
        name:
          'Aquí Estoy · Psychology Association',

        tag:
          'Emotional support · general public',

        desc:
          'Free support for emotional distress, anxiety, depression and crisis situations, provided by Costa Rica’s Psychology Association.',

        hours:
          'Mon–Fri 14:00–22:00 · Sat 09:00–16:00. Costa Rica time.'
      }
    },

    {
      id: 'pani',

      tags: [
        'mental',
        'anxiety',
        'sexual',
        'relationships',
        'crisis',
        'bullying'
      ],

      phone: '1147',

      display: '1147',

      site:
        'https://pani.go.cr/',

      source:
        'https://pani.go.cr/linea-gratuita-1147-del-pani-al-servicio-de-los-ninos-ninas-y-adolescentes/',

      es: {
        name:
          'PANI · Línea 1147',

        tag:
          'Niñas, niños y adolescentes',

        desc:
          'Escucha y orientación profesional para personas menores de edad, sus derechos y situaciones que les afectan. Cobertura nacional.',

        hours:
          'Lun–vie 07:00–22:00, incluidos feriados, según la fuente publicada. Confirmá disponibilidad.'
      },

      en: {
        name:
          'PANI · 1147 support line',

        tag:
          'Children and adolescents',

        desc:
          'Professional listening and guidance for minors, their rights and situations affecting them. National coverage.',

        hours:
          'Mon–Fri 07:00–22:00, including holidays, according to the published source. Confirm availability.'
      }
    },

    {
      id: 'mep',

      tags: [
        'mental',
        'anxiety',
        'crisis',
        'bullying'
      ],

      phone: '24591598',

      display: '2459-1598',

      site:
        'https://www.mep.go.cr/programas-proyectos/aqui-estoy',

      source:
        'https://www.mep.go.cr/programas-proyectos/aqui-estoy',

      es: {
        name:
          'MEP · Aquí Estoy',

        tag:
          'Estudiantes matriculados y sus familias',

        desc:
          'Atención psicológica telefónica gratuita para estudiantes del sistema educativo costarricense y sus familias. Otra línea: 2459-1599.',

        hours:
          'Lun–vie 07:00–15:00. Hora de Costa Rica.'
      },

      en: {
        name:
          'MEP · Aquí Estoy',

        tag:
          'Enrolled students and their families',

        desc:
          'Free psychological telephone support for students enrolled in Costa Rica’s education system and their families. Alternative number: 2459-1599.',

        hours:
          'Mon–Fri 07:00–15:00. Costa Rica time.'
      }
    },

    {
      id: 'iafa',

      tags: [
        'substances'
      ],

      phone: '8004232800',

      display: '800-4232-800',

      site:
        'https://iafa.go.cr/obtener-ayuda/linea-de-orientacion/',

      source:
        'https://iafa.go.cr/obtener-ayuda/linea-de-orientacion/',

      es: {
        name:
          'IAFA · Línea de orientación',

        tag:
          'Consumo de sustancias · población general',

        desc:
          'Información, apoyo y referencia sobre consumo de sustancias, también para familias. No atiende intoxicaciones: ante una emergencia, llamá 9-1-1.',

        hours:
          'Lun–vie 07:00–15:00. Hora de Costa Rica.'
      },

      en: {
        name:
          'IAFA · Guidance line',

        tag:
          'Substance use · general public',

        desc:
          'Information, support and referrals concerning substance use, including for families. It does not handle poisoning: for an emergency, call 9-1-1.',

        hours:
          'Mon–Fri 07:00–15:00. Costa Rica time.'
      }
    },

    {
      id: 'inamu',

      tags: [
        'sexual',
        'relationships'
      ],

      site:
        'https://www.inamu.go.cr/contacto',

      source:
        'https://www.inamu.go.cr/-/noticias-servicio-9-1-1-inamu-funciona-horario-24-7',

      es: {
        name:
          'INAMU · Atención a mujeres',

        tag:
          'Violencia contra las mujeres',

        desc:
          'Consultá los servicios y oficinas de atención del Instituto Nacional de las Mujeres. Para emergencias de violencia, el servicio vinculado al 9-1-1 funciona 24/7.',

        hours:
          'La atención de oficinas depende del servicio. Revisá el contacto oficial.'
      },

      en: {
        name:
          'INAMU · Support for women',

        tag:
          'Violence against women',

        desc:
          'Explore services and offices of Costa Rica’s National Women’s Institute. Its violence emergency service connected through 9-1-1 operates 24/7.',

        hours:
          'Office hours depend on the service. Check the official contact page.'
      }
    }
  ];

  const videos = [
    {
      id: 'RtCYlrKD8kI',

      image: 'mental',

      org: 'UNICEF',

      duration: '3:21',

      es: {
        title:
          '¿Qué pasa por tu mente?',

        desc:
          'Una conversación sobre salud mental entre jóvenes y sus familias.'
      },

      en: {
        title:
          'What is on your mind?',

        desc:
          'A conversation about mental health between young people and their families. Spanish-language video.'
      }
    },

    {
      id: 'ZNNEJzNZKuc',

      image: 'bullying',

      org: 'IAFA · Costa Rica',

      duration: '3:40',

      es: {
        title:
          'Habilidades para la Vida',

        desc:
          'Comunicación, empatía y acompañamiento para madres, padres y cuidadores.'
      },

      en: {
        title:
          'Life skills',

        desc:
          'Communication, empathy and support for parents and caregivers. Spanish-language video.'
      }
    },

    {
      id: 'b5ew6P8SuGo',

      image: 'substances',

      org: 'IAFA · Costa Rica',

      duration: '1:31',

      es: {
        title:
          'Todo lo que necesitás está en vos',

        desc:
          'Una campaña para acercarte a las actividades y servicios del IAFA.'
      },

      en: {
        title:
          'Everything you need is within you',

        desc:
          'A campaign introducing IAFA’s activities and services. Spanish-language video.'
      }
    }
  ];

  const faqs = {
    es: [
      [
        '¿Tengo que saber exactamente qué me pasa?',
        'No. Podés empezar explicando cómo te sentís o qué te preocupa. Los servicios profesionales pueden orientarte.'
      ],

      [
        '¿La página brinda terapia o responde emergencias?',
        'No. En Confianza reúne información y servicios externos. Si hay peligro inmediato en Costa Rica, llamá al 9-1-1.'
      ],

      [
        '¿Los servicios son para todas las personas?',
        'El proyecto sí. Cada servicio tiene requisitos propios: algunos atienden a población general, otros a menores, estudiantes o mujeres. Leé el alcance de cada tarjeta.'
      ],

      [
        '¿Y si soy hombre o una persona LGBTQ+?',
        'También podés buscar apoyo. Aquí Estoy atiende a población general; las personas menores pueden consultar al PANI. No necesitás encajar en un estereotipo para pedir ayuda.'
      ],

      [
        '¿Qué hago si una línea no responde?',
        'Probá otro servicio adecuado o consultá tu centro de salud. Si hay peligro inmediato, no esperés a que abra una línea de orientación: llamá al 9-1-1.'
      ],

      [
        '¿Salir rápido borra mi historial?',
        'No. Abre otra página y cierra los videos aquí. Si alguien supervisa tu dispositivo, buscá un dispositivo seguro para consultar recursos.'
      ]
    ],

    en: [
      [
        'Do I need to know exactly what is wrong?',
        'No. You can start by explaining how you feel or what concerns you. Professional services can help you find a way forward.'
      ],

      [
        'Does this website provide therapy or emergency response?',
        'No. En Confianza offers information and links to outside services. For immediate danger in Costa Rica, call 9-1-1.'
      ],

      [
        'Are all services open to everyone?',
        'The project is. Each service has its own criteria: some help the general public, others children, students or women. Read the audience on each card.'
      ],

      [
        'What if I am a man or an LGBTQ+ person?',
        'You can seek support too. Aquí Estoy serves the general public, and minors can contact PANI. You do not need to fit a stereotype to ask for help.'
      ],

      [
        'What if a support line does not answer?',
        'Try another appropriate service or your healthcare centre. For immediate danger, do not wait for a guidance line to open: call 9-1-1.'
      ],

      [
        'Does quick exit erase my browsing history?',
        'No. It opens another page and closes videos here. If someone monitors your device, consider a safe device to look up support.'
      ]
    ]
  };

  const alt = {
    es: {
      hero:
        'Dos personas conversan en un corredor luminoso',

      mental:
        'Una persona hace una pausa junto a una ventana',

      anxiety:
        'Dos personas caminan juntas en un parque',

      sexual:
        'Dos personas conversan con respeto en una mesa',

      relationships:
        'Dos personas conversan en un patio',

      crisis:
        'Dos personas de distintas generaciones se escuchan',

      substances:
        'Tres personas forman un pequeño círculo de conversación',

      bullying:
        'Jóvenes y una persona adulta conversan en un patio escolar',

      listen:
        'Dos personas conversan en una cocina'
    },

    en: {
      hero:
        'Two people talking in a bright porch',

      mental:
        'A person taking a quiet pause beside a window',

      anxiety:
        'Two people walking together in a park',

      sexual:
        'Two people talking respectfully at a table',

      relationships:
        'Two people talking in a patio',

      crisis:
        'Two people of different generations listening',

      substances:
        'Three people in a small conversation circle',

      bullying:
        'Young people and an adult talking in a school courtyard',

      listen:
        'Two people talking in a kitchen'
    }
  };

  function renderTopics() {
    $('topic-grid').innerHTML = topics
      .map(topic => `
        <button
          class="topic-card"
          data-topic="${topic.id}"
        >
          <img
            src="${images[topic.id]}"
            alt=""
            loading="lazy"
            width="768"
            height="1024"
          >

          <div class="card-copy">
            <h3>${escape(topic[lang].title)}</h3>

            <p>${escape(topic[lang].intro)}</p>

            <span class="card-arrow">
              ${t('guide')}
            </span>
          </div>
        </button>
      `)
      .join('');
  }

  function normalized(s) {
    return s
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  function renderResources() {
    const query = normalized($('search').value);

    const filter = $('resource-filter').value;

    const list = resources.filter(r => {
      const matchesFilter =
        filter === 'all' ||
        r.tags.includes(filter);

      const topicNames = r.tags
        .map(tag =>
          topics.find(x => x.id === tag)[lang].title
        )
        .join(' ');

      const searchableText = normalized(
        `${r.es.name} ` +
        `${r.en.name} ` +
        `${r[lang].desc} ` +
        `${r[lang].tag} ` +
        `${r.display || ''} ` +
        `${topicNames}`
      );

      return matchesFilter && searchableText.includes(query);
    });

    $('result-count').textContent =
      t('results')(list.length);

    $('resource-grid').innerHTML =
      list
        .map(r => `
          <article class="resource-card">
            <span class="tag">
              ${escape(r[lang].tag)}
            </span>

            <h3>${escape(r[lang].name)}</h3>

            <p>${escape(r[lang].desc)}</p>

            ${
              r.phone
                ? `
                  <a
                    class="contact-number"
                    href="tel:${r.phone}"
                  >
                    ${r.display}
                  </a>
                `
                : ''
            }

            <p class="hours">
              ${escape(r[lang].hours)}
            </p>

            <div class="resource-actions">
              ${
                r.phone
                  ? `
                    <a href="tel:${r.phone}">
                      ${t('call')} ↗
                    </a>

                    <button data-copy="${r.display}">
                      ${t('copy')}
                    </button>
                  `
                  : ''
              }

              <a
                href="${r.site}"
                target="_blank"
                rel="noopener noreferrer"
              >
                ${t('website')}
              </a>
            </div>

            <p
              class="quiet"
              style="margin:18px 0 0"
            >
              <a
                href="${r.source}"
                target="_blank"
                rel="noopener noreferrer"
              >
                ${t('source')}
              </a>

              · ${t('checked')}
            </p>
          </article>
        `)
        .join('') ||
      `
        <p class="empty">
          ${t('empty')}
        </p>
      `;
  }

  function renderVideos() {
    $('video-grid').innerHTML = videos
      .map(v => `
        <article class="video-card">
          <div
            class="video-slot"
            id="slot-${v.id}"
          >
            <button
              class="video-cover"
              data-video="${v.id}"
              aria-label="${t('play')}: ${escape(v[lang].title)}"
            >
              <img
                src="${images[v.image]}"
                alt=""
                loading="lazy"
              >

              <span>
                ▷ ${t('play')}
              </span>
            </button>
          </div>

          <div class="video-copy">
            <p class="eyebrow">
              ${v.org} · ${v.duration}
            </p>

            <h3>${escape(v[lang].title)}</h3>

            <p>${escape(v[lang].desc)}</p>

            <a
              href="https://www.youtube.com/watch?v=${v.id}"
              target="_blank"
              rel="noopener noreferrer"
            >
              ${t('youtube')}
            </a>
          </div>
        </article>
      `)
      .join('');
  }

  function render() {
    document
      .querySelector('.brand')
      .setAttribute(
        'aria-label',
        lang === 'es'
          ? 'En Confianza, inicio'
          : 'En Confianza, home'
      );

    document
      .querySelector('nav')
      .setAttribute(
        'aria-label',
        lang === 'es'
          ? 'Principal'
          : 'Main navigation'
      );

    document.documentElement.lang = lang;

    document.documentElement.dataset.theme = theme;

    document.title =
      lang === 'es'
        ? 'En Confianza · Apoyo en Costa Rica'
        : 'En Confianza · Support in Costa Rica';

    document
      .querySelectorAll('[data-i18n]')
      .forEach(el => {
        el.innerHTML = t(el.dataset.i18n);
      });

    document
      .querySelectorAll('[data-image]')
      .forEach(el => {
        el.src = images[el.dataset.image];

        el.alt = alt[lang][el.dataset.image];
      });

    $('lang').textContent =
      lang === 'es' ? 'EN' : 'ES';

    $('lang').setAttribute(
      'aria-label',
      lang === 'es'
        ? 'Switch to English'
        : 'Cambiar a español'
    );

    $('theme').setAttribute(
      'aria-label',
      t('themeLabel')
    );

    $('close-dialog').setAttribute(
      'aria-label',
      t('close')
    );

    $('search').placeholder =
      t('searchPlaceholder');

    const previous =
      $('resource-filter').value;

    $('resource-filter').innerHTML =
      `
        <option value="all">
          ${t('all')}
        </option>
      ` +
      topics
        .map(x => `
          <option value="${x.id}">
            ${escape(x[lang].title)}
          </option>
        `)
        .join('');

    $('resource-filter').value =
      previous || 'all';

    $('faq').innerHTML = faqs[lang]
      .map(([q, a]) => `
        <details>
          <summary>${escape(q)}</summary>

          <p>${escape(a)}</p>
        </details>
      `)
      .join('');

    renderTopics();

    renderResources();

    renderVideos();

    if ($('dialog').open && dialogKind) {
      renderDialog(dialogKind);
    }
  }

  function openDialog(kind) {
    dialogKind = kind;

    renderDialog(kind);

    $('dialog').showModal();
  }

  function renderDialog(kind) {
    const topic =
      topics.find(x => x.id === kind);

    if (topic) {
      const data = topic[lang];

      $('dialog').setAttribute(
        'aria-label',
        data.title
      );

      const sourceLinks =
        (topic.sources || [topic.source])
          .map((url, i) => `
            <a
              href="${url}"
              target="_blank"
              rel="noopener noreferrer"
            >
              ${escape(new URL(url).hostname)}${i ? ' · ' + (i + 1) : ''} ↗
            </a>
          `)
          .join(' · ');

      $('dialog-body').innerHTML = `
        <img
          class="dialog-photo"
          src="${images[kind]}"
          alt="${escape(alt[lang][kind])}"
        >

        <p class="eyebrow">
          ${t('topicsEyebrow')}
        </p>

        <h2>${escape(data.title)}</h2>

        <p>${escape(data.intro)}</p>

        <h3>${t('steps')}</h3>

        <ol>
          ${
            data.steps
              .map(s => `<li>${escape(s)}</li>`)
              .join('')
          }
        </ol>

        <p>${escape(data.help)}</p>

        <p class="quiet">
          ${t('sources')}: ${sourceLinks}
        </p>

        <div class="dialog-actions">
          <button
            class="button primary"
            data-find="${kind}"
          >
            ${t('find')} ↗
          </button>

          ${
            kind === 'crisis'
              ? `
                <a
                  class="button emergency"
                  href="tel:911"
                >
                  ${t('call911')}
                </a>
              `
              : ''
          }
        </div>
      `;

      return;
    }

    if (kind === 'privacy') {
      $('dialog').setAttribute(
        'aria-label',
        t('privacyTitle')
      );

      $('dialog-body').innerHTML = `
        <h2>${t('privacyTitle')}</h2>

        ${t('privacyBody')}

        <p>
          <a
            href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub ↗
          </a>

          ·

          <a
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google / YouTube ↗
          </a>
        </p>
      `;

      return;
    }

    if (kind === 'accessibility') {
      $('dialog').setAttribute(
        'aria-label',
        t('accessTitle')
      );

      $('dialog-body').innerHTML = `
        <h2>${t('accessTitle')}</h2>

        ${t('accessBody')}
      `;

      return;
    }

    $('dialog').setAttribute(
      'aria-label',
      t('preferencesTitle')
    );

    const configured = validGA();

    $('dialog-body').innerHTML = `
      <h2>${t('preferencesTitle')}</h2>

      ${t('preferencesBody')}

      <p>
        ${
          configured
            ? t(
                consent
                  ? 'measurementOn'
                  : 'measurementOff'
              )
            : t('measurementUnavailable')
        }
      </p>

      <div class="dialog-actions">
        ${
          configured && !consent
            ? `
              <button
                class="button primary"
                data-consent="yes"
              >
                ${t('accept')}
              </button>
            `
            : ''
        }

        <button
          class="button secondary"
          data-consent="no"
        >
          ${t(
            consent
              ? 'withdraw'
              : 'reject'
          )}
        </button>
      </div>
    `;
  }

  function validGA() {
    return /^G-[A-Z0-9]{5,20}$/.test(
      window.EN_CONFIANZA_CONFIG?.ga4Id || ''
    );
  }

  function enableAnalytics() {
    if (
      !consent ||
      !validGA() ||
      window.ecAnalyticsLoaded ||
      navigator.globalPrivacyControl ||
      navigator.doNotTrack === '1'
    ) {
      return;
    }

    window.ecAnalyticsLoaded = true;

    window.dataLayer =
      window.dataLayer || [];

    window.gtag = function () {
      window.dataLayer.push(arguments);
    };

    window.gtag('js', new Date());

    window.gtag(
      'config',
      window.EN_CONFIANZA_CONFIG.ga4Id,
      {
        send_page_view: false,

        allow_google_signals: false,

        allow_ad_personalization_signals: false,

        page_title: 'En Confianza',

        page_location:
          location.protocol === 'https:'
            ? location.origin + location.pathname
            : 'https://example.invalid/en-confianza/',

        page_referrer: ''
      }
    );

    /*
      La ubicación y el título fijos evitan revelar
      un tema seleccionado, una búsqueda, un fragmento
      de URL o una ruta local.
    */

    window.gtag(
      'event',
      'page_view',
      {
        page_title: 'En Confianza',

        page_location:
          location.protocol === 'https:'
            ? location.origin + location.pathname
            : 'https://example.invalid/en-confianza/',

        page_referrer: ''
      }
    );

    const s =
      document.createElement('script');

    s.async = true;

    s.src =
      'https://www.googletagmanager.com/gtag/js?id=' +
      window.EN_CONFIANZA_CONFIG.ga4Id;

    document.head.appendChild(s);
  }

  function disableAnalytics() {
    consent = false;

    store.set('ec-measurement', 'no');

    if (validGA()) {
      window[
        'ga-disable-' +
        window.EN_CONFIANZA_CONFIG.ga4Id
      ] = true;
    }

    document.cookie
      .split(';')
      .forEach(item => {
        const name = item
          .trim()
          .split('=')[0];

        if (!name.startsWith('_ga')) {
          return;
        }

        const paths = [
          '/',

          location.pathname.slice(
            0,
            location.pathname.lastIndexOf('/') + 1
          )
        ];

        const host =
          location.hostname.split('.');

        const domains = [
          '',
          location.hostname
        ];

        for (
          let i = 1;
          i < host.length - 1;
          i++
        ) {
          domains.push(
            '.' + host.slice(i).join('.')
          );
        }

        for (const path of paths) {
          for (const domain of domains) {
            document.cookie =
              name +
              '=; Max-Age=0; path=' +
              path +
              (
                domain
                  ? '; domain=' + domain
                  : ''
              ) +
              '; SameSite=Lax';
          }
        }
      });
  }

  $('lang').addEventListener(
    'click',
    () => {
      lang =
        lang === 'es' ? 'en' : 'es';

      store.set('ec-lang', lang);

      render();
    }
  );

  $('theme').addEventListener(
    'click',
    () => {
      theme =
        theme === 'light'
          ? 'dark'
          : 'light';

      store.set('ec-theme', theme);

      document.documentElement.dataset.theme =
        theme;
    }
  );

  $('exit').addEventListener(
    'click',
    () => {
      document
        .querySelectorAll('iframe')
        .forEach(x => x.remove());

      location.replace(
        'https://www.google.com/'
      );
    }
  );

  $('search').addEventListener(
    'input',
    renderResources
  );

  $('resource-filter').addEventListener(
    'change',
    renderResources
  );

  $('close-dialog').addEventListener(
    'click',
    () => {
      $('dialog').close();
    }
  );

  $('dialog').addEventListener(
    'close',
    () => {
      dialogKind = null;
    }
  );

  [
    'privacy',
    'preferences',
    'accessibility'
  ].forEach(id => {
    $(id).addEventListener(
      'click',
      () => {
        openDialog(id);
      }
    );
  });

  /*
    Los textos introducidos por el usuario se escapan.
    Estas interacciones no envían datos personales.
  */

  document.addEventListener(
    'click',
    async event => {
      const el = event.target.closest(
        '[data-topic],' +
        '[data-find],' +
        '[data-copy],' +
        '[data-video],' +
        '[data-stop],' +
        '[data-consent]'
      );

      if (!el) {
        return;
      }

      if (el.dataset.topic) {
        openDialog(
          el.dataset.topic
        );
      }

      if (el.dataset.find) {
        $('dialog').close();

        $('resource-filter').value =
          el.dataset.find;

        $('search').value = '';

        renderResources();

        $('resources').scrollIntoView({
          behavior:
            window.matchMedia(
              '(prefers-reduced-motion: reduce)'
            ).matches
              ? 'instant'
              : 'smooth'
        });

        $('resource-filter').focus({
          preventScroll: true
        });
      }

      if (el.dataset.copy) {
        try {
          await navigator.clipboard.writeText(
            el.dataset.copy
          );

          el.textContent =
            t('copied');
        } catch {
          el.textContent =
            t('copyFail');
        }

        el.setAttribute(
          'aria-live',
          'polite'
        );
      }

      if (el.dataset.video) {
        const v = videos.find(
          x => x.id === el.dataset.video
        );

        if (!v) {
          return;
        }

        const iframe =
          document.createElement('iframe');

        iframe.src =
          `https://www.youtube-nocookie.com/embed/${v.id}?rel=0`;

        iframe.title =
          v[lang].title;

        iframe.allow =
          'encrypted-media; picture-in-picture; fullscreen';

        iframe.allowFullscreen = true;

        iframe.referrerPolicy =
          'strict-origin-when-cross-origin';

        const slot =
          $('slot-' + v.id);

        slot.replaceChildren(
          iframe
        );

        const stop =
          document.createElement('button');

        stop.className =
          'button secondary';

        stop.dataset.stop =
          v.id;

        stop.textContent =
          t('videoPause');

        slot.appendChild(
          stop
        );
      }

      if (el.dataset.stop) {
        const v = videos.find(
          x => x.id === el.dataset.stop
        );

        const slot =
          $('slot-' + v.id);

        slot.innerHTML = `
          <button
            class="video-cover"
            data-video="${v.id}"
          >
            <img
              src="${images[v.image]}"
              alt=""
            >

            <span>
              ▷ ${t('play')}
            </span>
          </button>
        `;

        slot
          .querySelector('button')
          .focus();
      }

      if (
        el.dataset.consent === 'yes'
      ) {
        consent = true;

        store.set(
          'ec-measurement',
          'yes'
        );

        enableAnalytics();

        renderDialog(
          'preferences'
        );
      }

      if (
        el.dataset.consent === 'no'
      ) {
        const wasLoaded =
          window.ecAnalyticsLoaded;

        disableAnalytics();

        if (wasLoaded) {
          location.reload();
        } else {
          renderDialog(
            'preferences'
          );
        }
      }
    }
  );

  render();

  enableAnalytics();
})();
