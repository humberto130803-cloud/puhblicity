import { getLocale } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/types";

/**
 * Errors from server routes reach the user verbatim, so they need the same
 * treatment as anything else on the page. Keyed rather than free text so a
 * message can't exist in one language only.
 */
const MESSAGES = {
  signInFirst: {
    en: "Sign in first",
    es: "Primero inicia sesión",
  },
  paused: {
    en: "PUHBLICITY is paused right now. Nothing new until it's back — funds already pledged are unaffected.",
    es: "PUHBLICITY está en pausa ahora mismo. Nada nuevo hasta que vuelva — el dinero ya apostado no se ve afectado.",
  },
  ageRequired: {
    en: "You must confirm you're 18 or older.",
    es: "Tienes que confirmar que tienes 18 años o más.",
  },
  nameLength: {
    en: "Name: 2 to 24 characters.",
    es: "Nombre: de 2 a 24 caracteres.",
  },
  badHandle: {
    en: "That Instagram handle doesn't look right.",
    es: "Esa cuenta de Instagram no se ve bien.",
  },
  pickFromMenu: {
    en: "Pick a dare from the menu. The menu is the product.",
    es: "Elige un reto del menú. El menú es el producto.",
  },
  badTarget: {
    en: "Bad target amount.",
    es: "El monto de la meta no sirve.",
  },
  targetRange: {
    en: "Target must be between 0.25 and 5 SOL.",
    es: "La meta tiene que estar entre 0.25 y 5 SOL.",
  },
  badWindow: {
    en: "Pick a funding window: 24h, 3 days, or 7 days.",
    es: "Elige una ventana: 24h, 3 días o 7 días.",
  },
  missingFee: {
    en: "Missing fee transaction.",
    es: "Falta la transacción del pago.",
  },
  tooManyLive: {
    en: (n: number) => `You have ${n} live dares. Settle one before opening another.`,
    es: (n: number) => `Tienes ${n} retos abiertos. Cierra uno antes de abrir otro.`,
  },
  atCapacity: {
    en: "The board is at capacity right now. Try again after some dares settle — the total we hold at once is capped on purpose.",
    es: "El tablero está a tope ahora mismo. Inténtalo cuando se cierren algunos retos — el total que guardamos a la vez tiene límite a propósito.",
  },
  feeWrongWallet: {
    en: "The fee was paid by a different wallet than the one signed in.",
    es: "El pago lo hizo una wallet distinta a la que inició sesión.",
  },
  feeReused: {
    en: "That fee transaction was already used for a dare.",
    es: "Esa transacción ya se usó para otro reto.",
  },
  saveFailed: {
    en: "Could not save the dare. Your fee signature is safe — try again with the same one.",
    es: "No pudimos guardar el reto. Tu comprobante de pago está a salvo — inténtalo otra vez con el mismo.",
  },
  txNotFound: {
    en: "Transaction not found on-chain yet — wait a few seconds and try again.",
    es: "La transacción todavía no aparece en la blockchain — espera unos segundos e inténtalo otra vez.",
  },
  txFailed: {
    en: "Transaction failed or doesn't touch the vault.",
    es: "La transacción falló o no toca la bóveda.",
  },
  notTheFee: {
    en: "That transaction isn't the posting fee.",
    es: "Esa transacción no es el pago de publicación.",
  },
  feeMismatch: {
    en: "Fee transaction doesn't match this form session.",
    es: "El pago no corresponde a esta sesión del formulario.",
  },
  noPayer: {
    en: "Could not identify the paying wallet.",
    es: "No pudimos identificar la wallet que pagó.",
  },
  noSuchDare: {
    en: "No such dare",
    es: "Ese reto no existe",
  },
  onlyDoer: {
    en: "Only the doer uploads proof",
    es: "Solo quien hace el reto sube la prueba",
  },
  videoOnly: {
    en: "Video only: mp4, mov, or webm.",
    es: "Solo video: mp4, mov o webm.",
  },
  tooBig: {
    en: "Proof is over 50 MB — trim or compress it.",
    es: "La prueba pasa de 50 MB — recórtala o comprímela.",
  },
  uploadNotFound: {
    en: "Upload not found — did it finish?",
    es: "No encontramos la subida — ¿terminó?",
  },
  uploadStartFailed: {
    en: "Could not start the upload — try again.",
    es: "No pudimos empezar la subida — inténtalo otra vez.",
  },
  proofLocked: {
    en: "Proof unlocks when the dare is paid out",
    es: "La prueba se desbloquea cuando el reto se paga",
  },
  proofGone: {
    en: "This proof has come down. Videos stay up for 48 hours after payout, then they're deleted.",
    es: "Esta prueba ya se bajó. Los videos quedan 48 horas después del pago y luego se borran.",
  },
  slowDown: {
    en: "Slow down",
    es: "Más despacio",
  },
  nonceExpired: {
    en: "That sign-in request expired. Tap connect and try again.",
    es: "Esa solicitud de inicio de sesión expiró. Toca conectar e inténtalo otra vez.",
  },
  badText: {
    en: "That wording isn't allowed here. Dares stay legal, safe, and aimed at nobody but you — reword it.",
    es: "Esa redacción no se permite aquí. Los retos son legales, seguros y solo sobre ti — cámbiala.",
  },
  noLinks: {
    en: "No links in a dare. The dare speaks for itself.",
    es: "Sin enlaces en un reto. El reto habla solo.",
  },
  noPhones: {
    en: "No phone numbers.",
    es: "Sin números de teléfono.",
  },
  ownHandleOnly: {
    en: "You can mention your own handle, nobody else's. No dare aims at another person.",
    es: "Puedes mencionar tu propia cuenta, la de nadie más. Ningún reto apunta a otra persona.",
  },
  tooLong: {
    en: (max: number) => `Keep it under ${max} characters.`,
    es: (max: number) => `Que no pase de ${max} caracteres.`,
  },
} as const;

type Key = keyof typeof MESSAGES;

/** Resolve one message for a known locale. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function msg(key: Key, locale: Locale): any {
  const entry = MESSAGES[key];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (entry as any)[locale] ?? (entry as any).en;
}

/** Message resolver bound to the current request's locale. */
export async function getErr() {
  const locale = await getLocale();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (key: Key): any => msg(key, locale);
}
