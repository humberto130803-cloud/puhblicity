import type { Dict } from "./en";

/**
 * Español latinoamericano, "tú", nunca "vosotros".
 *
 * Vocabulario fijo — se repite igual en todo el sitio:
 *   dare → reto · doer → quien lo hace · back → apoyar · backers → apoyos
 *   pot → el bote · target → la meta · ceiling → el tope
 *   paid out → pagado · refunded → reembolsado
 *
 * "Quien lo hace" y nunca "el retado": nadie te reta aquí, tú te retas
 * solo. Esa distinción es el producto entero.
 */
export const es: Dict = {
  meta: {
    title: "PUHBLICITY — pon tu precio. Hazlo.",
    description:
      "Tú dices qué vas a hacer. El internet decide cuánto vale. Llegas a tu meta y cobras — no llegas y cada apoyo recupera su SOL completo.",
    createTitle: "Publica un reto — PUHBLICITY",
    moneyTitle: "Cómo funciona el dinero — PUHBLICITY",
    termsTitle: "Términos — PUHBLICITY",
    privacyTitle: "Privacidad — PUHBLICITY",
    offlineTitle: "Sin conexión — PUHBLICITY",
  },

  nav: {
    board: "El tablero",
    money: "Cómo funciona el dinero",
    mine: "Mis retos",
    admin: "Admin",
    connect: "Conectar wallet",
    signingIn: "Entrando…",
    langLabel: "Idioma",
  },

  footer: {
    blurb:
      "Guardamos el bote hasta que el reto se cierra. Somos algo pequeño, no un banco. El tope de 5 SOL está ahí por una razón. +18.",
    terms: "Términos",
    privacy: "Privacidad",
  },

  home: {
    live: (open: number, sol: string) =>
      `${open} ${open === 1 ? "reto abierto" : "retos abiertos"} · ${sol} SOL en juego ahora mismo`,
    h1a: "Pon tu",
    h1b: "precio.",
    h1c: "Hazlo.",
    sub: "Tú dices qué vas a hacer. El internet decide cuánto vale. Llegas a tu meta y cobras — no llegas y cada apoyo recupera su SOL completo.",
    post: "Publica tu reto",
    seeOpen: "Ver lo que está abierto",
    rule1t: "Tú empiezas",
    rule1b: "Nadie puede retarte.",
    rule2t: "Tope de 5 SOL",
    rule2b: "El número se detiene.",
    rule3t: "Reembolso total",
    rule3b: "Sin meta, no se cobra.",
    paidSoFar: "Pagado hasta ahora",
    daresDone: (n: number) => `${n} ${n === 1 ? "reto cumplido" : "retos cumplidos"}`,
    openNow: (n: number) => `${n} abierto${n === 1 ? "" : "s"} ahora`,
    scroll: "Baja al tablero",
    paused:
      "No se abre nada nuevo hasta que volvamos. El dinero ya apostado está seguro — los reembolsos y los pagos siguen corriendo.",
    pausedTitle: "En pausa.",
    stepsEyebrow: "De principio a fin",
    steps: [
      { t: "Publicas", b: "Eliges un reto del menú, pones tu meta y una fecha límite. 0.02 SOL para publicar." },
      { t: "La gente apoya", b: "El bote sube en público. Cualquiera mira, cualquiera suma." },
      { t: "Se llega a la meta", b: "El financiamiento cierra al instante. Tienes 48 horas." },
      { t: "Mandas la prueba", b: "Un video. Lo revisamos, casi siempre en unas horas." },
      { t: "Cobras", b: "El bote menos nuestro 10% llega a tu wallet. Fallas un paso y todos los apoyos se reembolsan completos." },
    ],
  },

  board: {
    eyebrow: "El tablero",
    heading: "Abiertos ahora",
    filters: { all: "Todos", closing: "Cierran pronto", nearly: "Casi financiados", fresh: "Recién publicados" },
    emptyTitle: "No hay nada abierto ahora.",
    elseTitle: "No hay nada más abierto ahora.",
    emptySub: "Alguien tiene que ser el primero. Publicar cuesta 0.02 SOL.",
    funded: "Financiados — esperando la prueba",
    wall: "El muro — cumplidos y pagados",
  },

  card: {
    backThis: "Apoyar",
    seeIt: "Verlo",
    backers: (n: number) => `${n} apoyo${n === 1 ? "" : "s"}`,
    ofTarget: (pct: number, target: string) => `${pct}% de la meta de ${target}`,
    proofUp: "▶ La prueba está arriba — míralo",
    proofDue: "prueba en",
    foot: {
      IN_REVIEW: "en revisión",
      PAID: "pagado",
      REFUNDING: "reembolsando",
      REFUNDED: "reembolsado",
      KILLED: "eliminado",
    },
  },

  status: {
    OPEN: "Abierto",
    CLOSED: "Financiado — falta prueba",
    IN_REVIEW: "En revisión",
    PAID: "Pagado",
    REFUNDING: "Reembolsando",
    REFUNDED: "Reembolsado completo",
    KILLED: "Eliminado",
  },

  dare: {
    postedBy: "Publicado por",
    doneBy: "Cumplido por",
    verified: "✓ verificado",
    unconfirmed: "(sin confirmar)",
    flaggedTitle: "Esperando una revisión rápida",
    flaggedBody:
      "antes de salir al tablero. Ahora mismo solo tú lo ves — normalmente son minutos.",
    proofMeans: "Qué cuenta como prueba",
    proofRejected:
      "Si la prueba no corresponde al reto, se rechaza y cada apoyo se reembolsa.",
    codeRule: (name: string, id: string) =>
      `${name} también tiene que abrir el video diciendo o mostrando el código ${id} — así nadie puede pasar por prueba un video que no grabó para esto.`,
    noteFrom: (name: string) => `Nota de ${name}`,
    comesDownIn: "Esto se baja en",
    comesDownTail: "— los videos se borran 48 horas después del pago.",
    videoGoneTitle: "El video ya se bajó.",
    videoGoneBody:
      "Estuvo arriba 48 horas después del pago y se borró — ese es el trato con todos los que se graban para esto. El pago de abajo sigue en la blockchain y se puede verificar.",
    whatHappened: "Qué pasó",
    refundsSent: "Reembolsos enviados",
    backersTitle: "Apoyos",
    backersMade: "Los apoyos que lo hicieron posible",
    noBackers: "Todavía nadie. Al primero en el muro se le recuerda.",
    inThePot: "En el bote",
    toGo: (amount: string) => `faltan ${amount} SOL`,
    targetHit: "Meta alcanzada — financiamiento cerrado",
    ceiling: "tope 5.00",
    target: (a: string) => `meta ${a}`,
    closesIn: "Cierra en",
    ifHits: "Si llega a la meta",
    ifHitsVal: (name: string) => `${name} tiene 48h para probarlo`,
    ifNot: "Si no llega",
    ifNotVal: "Todos reembolsados completos",
    backCta: "Apoyar este reto",
    connectToBack: "Conecta para apoyar",
    pausedTitle: "En pausa.",
    pausedBody: "No se aceptan apoyos ahora. El dinero que ya entró está seguro.",
    minNote:
      "Mínimo 0.05 SOL. Los apoyos son definitivos mientras el reto está abierto. Apoya desde tu propia wallet — los envíos desde un exchange pierden la etiqueta y no los podemos identificar.",
    headsUp: "Ojo.",
    inFlight:
      "Si esto cierra mientras tu transacción va en camino, te devolvemos el SOL de una — casi siempre en menos de un minuto.",
    prevRejected: "Prueba anterior rechazada:",
    statusLbl: "Estado",
    waitingProof: "Esperando la prueba",
    proofInReview: "Prueba en revisión",
    proofDueIn: "Prueba vence en",
    potLbl: "Bote",
    doerGets: (name: string) => `${name} recibe`,
    afterCut: (a: string) => `${a} después de nuestro 10%`,
    sendProof: "Manda tu prueba",
    replaceProof: "Cambia tu prueba",
    receipt: "Recibo de liquidación",
    paidStamp: "Pagado",
    platformCut: "Comisión (10%)",
    paidTo: (name: string) => `Pagado a ${name}`,
    settled: "Liquidado",
    transaction: "Transacción",
    yourTurn: "Te toca.",
    yourTurnBody: (name: string, target: string) =>
      `${name} puso una meta de ${target} y la alcanzó. Publicar cuesta 0.02 SOL.`,
    finalTote: "Marcador final",
    refundedFull: (a: string) => `${a} SOL — 100%`,
    refundedLbl: "Reembolsado",
    deducted: "Descontado",
    nothing: "Nada",
    closed: "Cerrado",
    missingTitle: "¿No te llegó el tuyo?",
    missingBody:
      "Los reembolsos llegan en pocos minutos. Si después de una hora no llegó, mándanos la transacción y la perseguimos a mano.",
    reportMissing: "Reportar un reembolso que no llegó",
    tryAgain: "Inténtalo otra vez",
    tryAgainBody:
      "Meta más baja, ventana más larga, y publícalo cuando tu gente esté despierta. Casi todos los retos que fallan estaban por encima de lo que su público iba a poner.",
    postAgain: "Publicarlo otra vez",
    theProof: "La prueba",
  },

  reasons: {
    killed:
      "Este reto rompió las reglas y fue eliminado. Cada apoyo regresa a la wallet de donde salió — el monto completo, sin descontar nada.",
    rejected: (why: string) =>
      `La prueba no pasó la revisión: "${why}". Cada apoyo regresa a la wallet de donde salió — el monto completo, sin descontar nada.`,
    noProof:
      "Se llegó a la meta, pero la prueba nunca llegó dentro de las 48 horas. Cada apoyo regresa a la wallet de donde salió — el monto completo, sin descontar nada.",
    missedTarget: (pot: string, target: string) =>
      `La fecha límite pasó con ${pot} SOL en el bote contra una meta de ${target}. Cada apoyo regresó a la wallet de donde salió — el monto completo, sin descontar nada.`,
    tail: (name: string) =>
      `${name} no se queda con nada y los 0.02 de publicación no se devuelven.`,
    refundingNow: "Los reembolsos están saliendo ahora — normalmente llegan en minutos.",
  },

  backModal: {
    eyebrow: "Apoyando",
    howMuch: "Cuánto",
    finishIt: (a: string) => `${a} — ciérralo`,
    saySomething: "Di algo (opcional)",
    notePlaceholder: "hazlo sin agua",
    yourPledge: "Tu apoyo",
    networkFee: "Comisión de red",
    potAfter: "El bote después de esto",
    closes: " — cierra",
    crosses: (name: string, amount: string) =>
      `Este apoyo pasa la meta del reto, así que el financiamiento cierra en cuanto caiga. ${name} tiene 48 horas para mandar la prueba. Si no llega, o la rechazamos, recuperas los ${amount} completos.`,
    submit: (a: string) => `Apoyar con ${a} SOL`,
    waiting: "Esperando tu wallet…",
    approve: "Tu wallet te va a pedir que apruebes. Los apoyos son definitivos mientras el reto está abierto.",
    badAmount: "Ese monto no se entiende. Números simples, como 0.1.",
    belowMin: "El apoyo mínimo es 0.05 SOL.",
    broke: "Algo falló. No salió nada de tu wallet a menos que ella diga lo contrario.",
  },

  create: {
    eyebrow: "Publica un reto",
    heading: "¿Qué vas a hacer?",
    lede: "Elige del menú. No puedes inventar uno — el menú es como mantenemos esto divertido en vez de peligroso.",
    theDare: "El reto",
    count: (n: number) =>
      `${n} en total. Están hechos para que sea difícil fingirlos — un desconocido tiene que reaccionar, o es una sola toma sin cortes, o deja algo que cualquiera puede comprobar después.`,
    groups: {
      Nerve: "Agallas",
      Looks: "Apariencia",
      Taste: "Sabor",
      Body: "Cuerpo",
      Online: "En línea",
    },
    groupBlurbs: {
      Nerve: "Tiene que haber desconocidos. Ahí está toda la dificultad.",
      Looks: "Cambias algo y te aguantas con eso un rato.",
      Taste: "Una porción. Desagradable, nunca peligroso.",
      Body: "Corto, medible y visiblemente duro.",
      Online: "La captura es la prueba.",
    },
    banned:
      "Nada con alturas, vehículos, fuego, alcohol, drogas, ni con alguien que no haya aceptado salir. Esa es toda la política de moderación, metida dentro del menú.",
    specifics: "Tus detalles",
    specificsHint:
      "La parte que lo hace tuyo. Que sea sobre ti — sin enlaces, sin números de teléfono, sin el nombre de nadie más.",
    specificsPlaceholder:
      "Sin leche en la mesa. Mi compañera de cuarto lo graba y no me va a ayudar.",
    target: "Tu meta",
    targetHint:
      "Lo mínimo por lo que lo harías. Si no se llega para la fecha límite, todos reciben reembolso.",
    targetRule:
      "Entre 0.25 y 5.00 SOL. El tope es 5 y no se mueve. Las metas bajas se llenan — así es como llegas al tablero.",
    window: "Ventana de financiamiento",
    windows: { h24: "24 horas", d3: "3 días", d7: "7 días" },
    nameHandle: "Tu nombre y tu cuenta",
    namePlaceholder: "Tu nombre en el tablero",
    igPlaceholder: "@instagram (opcional)",
    walletHint:
      "Los pagos van a la wallet con la que estás conectado. Usa una wallet que controles — no una dirección de exchange.",
    verifyTitle: "¿Quieres la palomita de verificado?",
    verifyBody:
      "Después de publicar, pon el código de tu reto en tu bio de Instagram unos minutos. Lo revisamos a mano y marcamos la cuenta como realmente tuya — eso es lo que le dice a la gente que está apoyando a una persona y no a un desconocido usando el nombre de otro.",
    before: "Antes de publicar",
    checks: [
      "Tengo 18 o más, y este reto es mío — nadie me está obligando.",
      "Si llego a mi meta, tengo 48 horas para subir un video. Si no lo hago, los apoyos se reembolsan y yo no me quedo con nada.",
      "Nadie más sale en mi video sin haber aceptado.",
      "Entiendo que PUHBLICITY guarda el bote hasta que el reto se cierra, y se queda con 10% solo si me pagan.",
    ],
    fee: "Costo de publicar",
    refundable: "¿Se devuelve?",
    refundableVal: "No — es lo que mantiene el spam fuera del tablero",
    submit: "Paga 0.02 SOL y publica",
    connect: "Conecta para publicar",
    firstDare:
      "El primer reto de una wallet nueva lo revisamos rápido antes de que salga al tablero. Normalmente son minutos.",
    pausedTitle: "En pausa.",
    pausedBody: "No hay retos nuevos ahora. El dinero ya apostado no se ve afectado.",
    errPick: "Elige un reto del menú.",
    errName: "Tu nombre va en el tablero — de 2 a 24 caracteres.",
    errTarget: "La meta tiene que estar entre 0.25 y 5.00 SOL. El tope es el tope.",
    errChecks: "Marca las cuatro casillas — son el trato completo.",
    payingFee: "Pagando los 0.02 SOL de publicación…",
    reusingFee: "Reutilizando el pago que ya hiciste…",
    opening: "Abriendo el reto…",
    working: "Trabajando…",
    genericErr: "Algo falló — tu pago, si se hizo, queda guardado para reintentar.",
  },

  prove: {
    heading: "Manda tu prueba",
    headingReplace: "Cambia tu prueba",
    lede: (a: string) => `Un video. Lo vemos, y luego ${a} SOL van a tu wallet.`,
    codeEyebrow: "Empieza el video con esto",
    codeBody:
      "Dilo en voz alta, o muéstralo escrito, en los primeros segundos — antes de hacer el reto.",
    codeHint:
      "Sin código no hay pago. Así sabemos que el video se grabó para este reto y no se sacó de otro lado, y es la única razón por la que podemos creerte el resto.",
    pot: "Bote",
    cut: "Nuestra parte (10%)",
    youGet: "Recibes",
    deadline: "Fecha límite",
    needToSee: "Lo que necesitamos ver",
    needTail:
      "Sin cortes, sin edición. Si no corresponde al reto lo rechazamos y reembolsamos a tus apoyos — te llega una línea diciéndote por qué.",
    theVideo: "El video",
    drop: "Suelta tu video aquí",
    dropHint: "MP4, MOV o WebM · hasta 50 MB · hasta 90 segundos",
    chooseFile: "Elegir un archivo",
    chooseOther: "Elegir otro archivo",
    looksGood: (mb: string) => `${mb} MB — se ve bien`,
    noteLabel: "Algo que debamos saber (opcional)",
    notePlaceholder: "El cronómetro se ve en el 0:12.",
    whoSees: "Quién ve esto.",
    whoSeesBody:
      "Solo nosotros, hasta que se apruebe. Cuando te paguen, tus apoyos pueden verlo 48 horas en la página del reto — para eso pagaron. Después borramos el archivo.",
    submit: "Mandar prueba",
    replaceHint:
      "Puedes cambiarlo cuando quieras antes de que lo revisemos. Si no lo revisamos en 24 horas, los apoyos se reembolsan automáticamente.",
    errPick: "Primero elige el video.",
    errType: "Solo video: MP4, MOV o WebM.",
    errSize: "Pasa de 50 MB — recórtalo o comprímelo.",
    errLong: (max: number, actual: number) =>
      `Máximo ${max} segundos — el tuyo tiene ${actual}s. Una toma, corte apretado.`,
    checking: "Revisando el video…",
    slot: "Consiguiendo espacio para subirlo…",
    uploading: "Subiendo…",
    finishing: "Terminando…",
    failed: "Falló la subida — inténtalo otra vez.",
  },

  mine: {
    heading: "Mis retos",
    connectTitle: "Tu lado del tablero",
    connectBody: "Conecta para ver tus retos, tus apoyos y lo que te deben.",
    connect: "Conectar wallet",
    paidToMe: "Me han pagado",
    inOpenPots: "En botes abiertos",
    iBacked: "He apoyado",
    refundedToMe: "Me reembolsaron",
    queueTitle: "Uno de los tuyos está en la fila.",
    queueBody:
      "Una revisión rápida antes de que salga al tablero público — normalmente son minutos.",
    timeLeft: "Tiempo para probarlo",
    willReceive: (pot: string, net: string) =>
      `Bote ${pot} SOL · recibirás ${net} después de nuestro 10%`,
    everythingElse: "Todo lo demás",
    yourDares: "Tus retos",
    emptyTitle: "Todavía nada.",
    emptyBody: "Alguien tiene que ser el primero. Publicar cuesta 0.02 SOL.",
    postYours: "Publica tu reto",
    iveBacked: "Retos que he apoyado",
    thDare: "Reto",
    thPot: "Bote",
    thStatus: "Estado",
    thSettled: "Liquidado",
    thMyPledge: "Mi apoyo",
    receipt: "Recibo",
    view: "Ver",
    watch: "Seguir",
    tx: "Tx",
    refundedInFull: "Reembolsado completo",
    loading: "Cargando…",
  },

  wallet: {
    handoffEyebrow: "Un paso",
    handoffTitle: "Abre esto en tu wallet",
    handoffBody: (browser: string) =>
      `${browser} no puede hablar con una wallet directamente — es una limitación del teléfono, no nuestra. Phantom trae su propio navegador y ahí todo funciona normal.`,
    safariIphone: "Safari en iPhone",
    yourBrowser: "Tu navegador",
    openInPhantom: "Abrir en Phantom",
    landHere:
      "Vas a caer en esta misma página dentro de Phantom, con la wallet lista. ¿No la tienes? Instala Phantom, regresa y toca esto otra vez.",
    otherWallet: "¿Usas otra wallet?",
    otherWalletBody: "Abre su navegador interno y pega",
    authErrTitle: "No pudimos conectarte",
  },

  install: {
    title: "Ponlo en tu pantalla de inicio",
    android: "Pantalla completa, sin barra del navegador. Un toque.",
    ios: "Toca Compartir y luego “Agregar a inicio”.",
    button: "Instalar",
  },

  offline: {
    eyebrow: "Sin conexión",
    title: "Estás sin conexión.",
    body: "Los botes se mueven en tiempo real, así que no te vamos a mostrar un número que no podemos verificar. Nada de lo que apoyaste se ve afectado — reconéctate y todo va a estar aquí.",
    retry: "Reintentar",
  },
};
