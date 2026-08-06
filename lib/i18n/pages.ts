import type { Locale } from "./types";

/**
 * The long-form pages. Kept out of the main dictionary because they're
 * prose, not interface labels — a rowline table plus headed sections is
 * enough structure for all three, and keeping them as data means the two
 * languages can't drift apart in layout.
 */
export type Row = { k: string; v: string; strong?: boolean };
export type Block =
  | { kind: "p"; text: string }
  | { kind: "ul"; items: string[] }
  | { kind: "rows"; rows: Row[] };
export type Section = { title?: string; blocks: Block[] };
export type PageContent = {
  eyebrow: string;
  title: string;
  lede: string;
  sections: Section[];
  notice?: { title: string; body: string };
};

const p = (text: string): Block => ({ kind: "p", text });
const ul = (items: string[]): Block => ({ kind: "ul", items });

// ---------------------------------------------------------------- money ---

const moneyEn: PageContent = {
  eyebrow: "No small print",
  title: "How the money works",
  lede: "Everything on this page is the whole policy. There isn't a second version buried in the terms.",
  sections: [
    {
      blocks: [
        {
          kind: "rows",
          rows: [
            { k: "Posting a dare", v: "0.02 SOL", strong: true },
            { k: "Backing a dare", v: "Free — you only send your pledge", strong: true },
            { k: "Our cut if a dare pays out", v: "10% of the pot", strong: true },
            { k: "Our cut if it doesn't", v: "Nothing", strong: true },
            { k: "Refunds", v: "100%, fee absorbed by us", strong: true },
            { k: "Smallest pledge", v: "0.05 SOL" },
            { k: "Biggest a pot can get", v: "5.00 SOL" },
          ],
        },
      ],
    },
    {
      title: "Who holds the money",
      blocks: [
        p("We do. Pledges go to one wallet we control and sit there until the dare settles, then they go to the doer or back to you. That means you're trusting us, and we'd rather say so than dress it up. There's no smart contract here and we won't pretend otherwise. The 5 SOL ceiling exists to keep the amount you're trusting us with small."),
      ],
    },
    {
      title: "When you get refunded",
      blocks: [
        p("Automatically, in full, in every one of these cases:"),
        ul([
          "The dare misses its target by the deadline.",
          "The doer doesn't send proof within 48 hours.",
          "We reject the proof.",
          "We haven't reviewed the proof within 24 hours of it arriving. That one's on us, and you shouldn't have to wait for us to wake up.",
          "We remove the dare for breaking the rules.",
          "Your pledge lands after funding closed.",
        ]),
      ],
    },
    {
      title: "How we know they really did it",
      blocks: [
        p("Every proof video has to open with the dare's own code — eight characters that didn't exist before the dare was funded. Said out loud or held up, in the first few seconds. That makes a recycled or downloaded video almost impossible to pass off, and it means a human can check it in seconds. The dares themselves are chosen to be hard to fake too: strangers have to react, or it's one unbroken take, or it leaves something anyone can check afterwards."),
      ],
    },
    {
      title: "What backing is not",
      blocks: [
        p("It isn't an investment, a bet, or a purchase of anything that can be resold. Nothing you back can gain value. There's no chance involved — a dare pays out because someone did the thing, not because a number came up. What you get is the video, watchable for 48 hours after payout, and your name on the dare."),
      ],
    },
    {
      title: "A few things that will save you money",
      blocks: [
        ul([
          "Pledge from your own wallet. Sends from an exchange lose the tag and we can't match them to a dare.",
          "Doers: connect the wallet you want paid into. Not an exchange deposit address.",
          "Pledges are final while a dare is open. Made a genuine mistake? Message us — we'd rather fix it than argue.",
        ]),
      ],
    },
  ],
  notice: {
    title: "18+.",
    body: "Doers post their own dares and nobody else's. Nothing involving heights, vehicles, fire, weapons, alcohol, drugs, or anyone who hasn't agreed to appear. We remove dares that break this and refund every backer.",
  },
};

const moneyEs: PageContent = {
  eyebrow: "Sin letra chica",
  title: "Cómo funciona el dinero",
  lede: "Todo lo que está en esta página es la política completa. No hay una segunda versión escondida en los términos.",
  sections: [
    {
      blocks: [
        {
          kind: "rows",
          rows: [
            { k: "Publicar un reto", v: "0.02 SOL", strong: true },
            { k: "Apoyar un reto", v: "Gratis — solo mandas tu apoyo", strong: true },
            { k: "Nuestra parte si el reto se paga", v: "10% del bote", strong: true },
            { k: "Nuestra parte si no", v: "Nada", strong: true },
            { k: "Reembolsos", v: "100%, la comisión la ponemos nosotros", strong: true },
            { k: "Apoyo más chico", v: "0.05 SOL" },
            { k: "Lo máximo que puede crecer un bote", v: "5.00 SOL" },
          ],
        },
      ],
    },
    {
      title: "Quién guarda el dinero",
      blocks: [
        p("Nosotros. Los apoyos van a una wallet que controlamos y se quedan ahí hasta que el reto se cierra; después van a quien lo hizo o de regreso a ti. Eso significa que estás confiando en nosotros, y preferimos decirlo antes que adornarlo. Aquí no hay contrato inteligente y no vamos a fingir lo contrario. El tope de 5 SOL existe justo para que la cantidad que nos confías sea chica."),
      ],
    },
    {
      title: "Cuándo te reembolsamos",
      blocks: [
        p("Automáticamente, completo, en todos estos casos:"),
        ul([
          "El reto no llega a su meta antes de la fecha límite.",
          "Quien lo hace no manda la prueba en 48 horas.",
          "Rechazamos la prueba.",
          "No revisamos la prueba en 24 horas desde que llegó. Esa es culpa nuestra y no tienes por qué esperar a que despertemos.",
          "Eliminamos el reto por romper las reglas.",
          "Tu apoyo cae después de que el financiamiento cerró.",
        ]),
      ],
    },
    {
      title: "Cómo sabemos que de verdad lo hizo",
      blocks: [
        p("Cada video de prueba tiene que empezar con el código del reto — ocho caracteres que no existían antes de que se financiara. Dicho en voz alta o mostrado, en los primeros segundos. Eso hace casi imposible pasar por prueba un video reciclado o descargado, y significa que una persona lo puede verificar en segundos. Los retos también están elegidos para que sea difícil fingirlos: tiene que reaccionar un desconocido, o es una sola toma sin cortes, o deja algo que cualquiera puede comprobar después."),
      ],
    },
    {
      title: "Lo que apoyar NO es",
      blocks: [
        p("No es una inversión, ni una apuesta, ni la compra de algo que se pueda revender. Nada de lo que apoyas puede subir de valor. No hay azar de por medio — un reto se paga porque alguien hizo la cosa, no porque salió un número. Lo que recibes es el video, que se puede ver 48 horas después del pago, y tu nombre en el reto."),
      ],
    },
    {
      title: "Un par de cosas que te van a ahorrar dinero",
      blocks: [
        ul([
          "Apoya desde tu propia wallet. Los envíos desde un exchange pierden la etiqueta y no los podemos ligar a un reto.",
          "Si vas a hacer un reto: conecta la wallet donde quieres cobrar. No una dirección de depósito de un exchange.",
          "Los apoyos son definitivos mientras el reto está abierto. ¿Te equivocaste de verdad? Escríbenos — preferimos arreglarlo que discutir.",
        ]),
      ],
    },
  ],
  notice: {
    title: "+18.",
    body: "Cada quien publica su propio reto y el de nadie más. Nada con alturas, vehículos, fuego, armas, alcohol, drogas, ni con alguien que no haya aceptado salir. Eliminamos los retos que rompan esto y reembolsamos a todos los apoyos.",
  },
};

// ---------------------------------------------------------------- terms ---

const termsEn: PageContent = {
  eyebrow: "Effective August 5, 2026",
  title: "The deal",
  lede: "This is what you agree to by using PUHBLICITY, and what we agree to in return. It's short because there isn't a longer version.",
  sections: [
    {
      title: "What PUHBLICITY is",
      blocks: [
        p("A board where you can offer to do something from a fixed menu, and other people can put SOL behind that offer. We run the board, hold the pot while a dare is live, and settle it when it ends. That's the whole service."),
      ],
    },
    {
      title: "Who can use it",
      blocks: [
        ul([
          "You're 18 or older.",
          "You're using a wallet you control.",
          "You're not somewhere that makes any of this illegal for you. That call is yours, not ours.",
        ]),
      ],
    },
    {
      title: "The rule the whole place is built on",
      blocks: [
        p("You dare yourself. Nobody else. There is no way to point a dare at another person here, and trying to smuggle one in through the text box gets the dare removed and every backer refunded."),
      ],
    },
    {
      title: "What you promise us",
      blocks: [
        ul([
          "You can do your dare safely, and you won't escalate it past what the menu describes to make it more impressive.",
          "Anyone else who appears in your video agreed to be in it.",
          "Your proof is really yours, filmed for this dare, and it opens with your dare code.",
          "You won't post a dare as somebody you aren't.",
          "Nothing sexual, nothing cruel, nothing that hurts you or anyone watching.",
        ]),
      ],
    },
    {
      title: "What we promise you",
      blocks: [
        ul([
          "If a dare doesn't pay out, every backer gets 100% back. We cover the network fees.",
          "We take 10% only when a doer actually gets paid, and nothing otherwise.",
          "If we don't review a proof within 24 hours, backers are refunded automatically. Our slowness costs us, not you.",
          "We tell you plainly that we hold the pot, because we do.",
          "Proof videos come down 48 hours after payout, and we delete the file.",
          "If we reject a proof, you get a reason, not silence.",
        ]),
      ],
    },
    {
      title: "The money",
      blocks: [
        ul([
          "Posting a dare costs 0.02 SOL and that isn't refundable — it's what keeps the board clean.",
          "Pledges are final while a dare is open. Genuine mistake? Tell us and we'll sort it out.",
          "A pot can't go past 5 SOL. That ceiling is not negotiable and it exists to limit what you're trusting us with.",
          "Backing a dare is not an investment, a bet, or a purchase of anything resellable. You cannot win money here. You get a video and your name on the dare.",
        ]),
      ],
    },
    {
      title: "What gets a dare removed",
      blocks: [
        p("Anything aimed at another person, anything outside the menu, anything dangerous, and anything that would make a reasonable person watching it uncomfortable for the wrong reasons. We can remove a dare at any time, and when we do, every backer is refunded in full."),
      ],
    },
    {
      title: "Risk, honestly",
      blocks: [
        p("You do your dare at your own risk. We hold your pot, which means you're trusting us, and no wording on this page changes that — the 5 SOL ceiling and the automatic refunds are what actually limit it. If something goes wrong, the most we'd ever owe you is what you paid us in fees."),
      ],
    },
    {
      title: "Changes and endings",
      blocks: [
        p("We can pause the board at any time. Pausing never stops a refund or a payout that's already owed. If these terms change, the change applies to dares posted after it, never to money already in a pot."),
      ],
    },
    {
      title: "Talking to us",
      blocks: [p("@puhblicity on Instagram. A real person reads it.")],
    },
  ],
};

const termsEs: PageContent = {
  eyebrow: "Vigente desde el 5 de agosto de 2026",
  title: "El trato",
  lede: "Esto es a lo que te comprometes al usar PUHBLICITY, y a lo que nos comprometemos nosotros a cambio. Es corto porque no existe una versión más larga.",
  sections: [
    {
      title: "Qué es PUHBLICITY",
      blocks: [
        p("Un tablero donde puedes ofrecerte a hacer algo de un menú fijo, y otras personas pueden poner SOL detrás de esa oferta. Nosotros operamos el tablero, guardamos el bote mientras el reto está vivo y lo liquidamos cuando termina. Ese es todo el servicio."),
      ],
    },
    {
      title: "Quién puede usarlo",
      blocks: [
        ul([
          "Tienes 18 años o más.",
          "Usas una wallet que controlas.",
          "No estás en un lugar donde esto sea ilegal para ti. Esa decisión es tuya, no nuestra.",
        ]),
      ],
    },
    {
      title: "La regla sobre la que está construido todo esto",
      blocks: [
        p("Te retas a ti mismo. A nadie más. Aquí no existe forma de apuntarle un reto a otra persona, y tratar de colarlo por la caja de texto hace que el reto se elimine y que todos los apoyos se reembolsen."),
      ],
    },
    {
      title: "Lo que nos prometes",
      blocks: [
        ul([
          "Puedes hacer tu reto de forma segura, y no lo vas a subir de nivel más allá de lo que dice el menú para que se vea más impresionante.",
          "Cualquier otra persona que salga en tu video aceptó salir.",
          "Tu prueba es realmente tuya, grabada para este reto, y empieza con tu código.",
          "No vas a publicar un reto haciéndote pasar por alguien que no eres.",
          "Nada sexual, nada cruel, nada que te lastime a ti ni a quien lo vea.",
        ]),
      ],
    },
    {
      title: "Lo que te prometemos",
      blocks: [
        ul([
          "Si un reto no se paga, cada apoyo recupera el 100%. Las comisiones de red las cubrimos nosotros.",
          "Nos quedamos con el 10% solo cuando alguien realmente cobra, y con nada en cualquier otro caso.",
          "Si no revisamos una prueba en 24 horas, los apoyos se reembolsan automáticamente. Nuestra lentitud nos cuesta a nosotros, no a ti.",
          "Te decimos claramente que nosotros guardamos el bote, porque así es.",
          "Los videos de prueba se bajan 48 horas después del pago, y borramos el archivo.",
          "Si rechazamos una prueba, recibes una razón, no silencio.",
        ]),
      ],
    },
    {
      title: "El dinero",
      blocks: [
        ul([
          "Publicar un reto cuesta 0.02 SOL y eso no se devuelve — es lo que mantiene limpio el tablero.",
          "Los apoyos son definitivos mientras el reto está abierto. ¿Fue un error de verdad? Dinos y lo resolvemos.",
          "Un bote no puede pasar de 5 SOL. Ese tope no se negocia y existe para limitar lo que nos estás confiando.",
          "Apoyar un reto no es una inversión, ni una apuesta, ni la compra de algo revendible. Aquí no puedes ganar dinero. Recibes un video y tu nombre en el reto.",
        ]),
      ],
    },
    {
      title: "Qué hace que eliminemos un reto",
      blocks: [
        p("Cualquier cosa dirigida a otra persona, cualquier cosa fuera del menú, cualquier cosa peligrosa, y cualquier cosa que le incomodara a una persona razonable por las razones equivocadas. Podemos eliminar un reto en cualquier momento, y cuando lo hacemos, todos los apoyos se reembolsan completos."),
      ],
    },
    {
      title: "El riesgo, honestamente",
      blocks: [
        p("Haces tu reto bajo tu propio riesgo. Nosotros guardamos tu bote, lo que significa que estás confiando en nosotros, y ninguna redacción de esta página cambia eso — el tope de 5 SOL y los reembolsos automáticos son lo que de verdad lo limita. Si algo sale mal, lo máximo que te podríamos deber es lo que nos pagaste en comisiones."),
      ],
    },
    {
      title: "Cambios y finales",
      blocks: [
        p("Podemos pausar el tablero cuando sea. Pausar nunca detiene un reembolso ni un pago que ya se debe. Si estos términos cambian, el cambio aplica a los retos publicados después, nunca al dinero que ya está en un bote."),
      ],
    },
    {
      title: "Hablar con nosotros",
      blocks: [p("@puhblicity en Instagram. Lo lee una persona de verdad.")],
    },
  ],
};

// -------------------------------------------------------------- privacy ---

const privacyEn: PageContent = {
  eyebrow: "Effective August 5, 2026",
  title: "Privacy",
  lede: "No email, no phone, no tracking pixels, no ad tech. Your wallet is your identity here, and that's all we ask for.",
  sections: [
    {
      title: "What we collect",
      blocks: [
        ul([
          "Wallet addresses.",
          "The dares you post and the pledges you make — these are also public on Solana itself, which we don't control.",
          "The display name, optional Instagram handle, and notes you choose to post.",
          "Proof videos you upload.",
        ]),
      ],
    },
    {
      title: "How wallet addresses appear",
      blocks: [
        p("Public pages show truncated addresses only. Full addresses live in our database and on-chain, where they were always public."),
      ],
    },
    {
      title: "Proof videos",
      blocks: [
        ul([
          "Stored in a private bucket; served only through short-lived signed links.",
          "Before payout, only you and the reviewer can watch.",
          "After payout, the video is watchable on the dare page for 48 hours — backers paid to see it, and you were told this at upload.",
          "Then it's deleted. Not hidden, not unlisted — the file is removed automatically once those 48 hours are up.",
          "Want it gone sooner? Ask, and we'll delete it early.",
        ]),
      ],
    },
    {
      title: "What we never do",
      blocks: [
        ul([
          "Sell or share your data with anyone.",
          "Make a proof video public before its dare is paid.",
          "Keep copies of a deleted video.",
        ]),
      ],
    },
    {
      title: "The permanent parts",
      blocks: [
        p("SOL transfers are public and permanent on Solana — pledges, refunds and payouts are all visible on-chain forever. That's the nature of the rails, not a choice of ours. Contact: @puhblicity on Instagram."),
      ],
    },
  ],
};

const privacyEs: PageContent = {
  eyebrow: "Vigente desde el 5 de agosto de 2026",
  title: "Privacidad",
  lede: "Sin correo, sin teléfono, sin píxeles de rastreo, sin publicidad. Tu wallet es tu identidad aquí, y es lo único que te pedimos.",
  sections: [
    {
      title: "Qué recolectamos",
      blocks: [
        ul([
          "Direcciones de wallet.",
          "Los retos que publicas y los apoyos que das — eso también es público en Solana, que no controlamos.",
          "El nombre que muestras, tu cuenta de Instagram opcional y las notas que decidas publicar.",
          "Los videos de prueba que subes.",
        ]),
      ],
    },
    {
      title: "Cómo se ven las direcciones",
      blocks: [
        p("Las páginas públicas solo muestran direcciones recortadas. Las completas viven en nuestra base de datos y en la blockchain, donde siempre fueron públicas."),
      ],
    },
    {
      title: "Videos de prueba",
      blocks: [
        ul([
          "Se guardan en un espacio privado; se sirven solo por enlaces firmados de corta duración.",
          "Antes del pago, solo tú y quien revisa pueden verlo.",
          "Después del pago, el video se puede ver en la página del reto por 48 horas — los apoyos pagaron para verlo, y te lo dijimos al subirlo.",
          "Después se borra. No se esconde, no se deslista — el archivo se elimina automáticamente cuando pasan esas 48 horas.",
          "¿Lo quieres fuera antes? Pídelo y lo borramos.",
        ]),
      ],
    },
    {
      title: "Lo que nunca hacemos",
      blocks: [
        ul([
          "Vender o compartir tus datos con nadie.",
          "Hacer público un video antes de que su reto se pague.",
          "Guardar copias de un video borrado.",
        ]),
      ],
    },
    {
      title: "Las partes permanentes",
      blocks: [
        p("Las transferencias de SOL son públicas y permanentes en Solana — los apoyos, los reembolsos y los pagos quedan visibles para siempre. Esa es la naturaleza de la red, no una decisión nuestra. Contacto: @puhblicity en Instagram."),
      ],
    },
  ],
};

export const PAGES = {
  money: { en: moneyEn, es: moneyEs },
  terms: { en: termsEn, es: termsEs },
  privacy: { en: privacyEn, es: privacyEs },
} as const;

export const pageContent = (
  page: keyof typeof PAGES,
  locale: Locale
): PageContent => PAGES[page][locale] ?? PAGES[page].en;
