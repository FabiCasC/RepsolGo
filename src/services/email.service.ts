import emailjs from '@emailjs/react-native';

const EMAILJS_SERVICE_ID  = process.env.EXPO_PUBLIC_EMAILJS_SERVICE_ID  ?? 'service_7roj34u';
const EMAILJS_TEMPLATE_ID = process.env.EXPO_PUBLIC_EMAILJS_TEMPLATE_ID ?? 'template_stkof5e';
const EMAILJS_PUBLIC_KEY  = process.env.EXPO_PUBLIC_EMAILJS_PUBLIC_KEY  ?? 'y_JHgYE7byKqyUdVE';

/**
 * Envía el código de recuperación al correo del usuario.
 * Usa EmailJS (gratuito, 200 emails/mes, no requiere backend).
 *
 * Parámetros que el template de EmailJS debe tener:
 *   {{to_email}}   → correo destino
 *   {{to_name}}    → nombre mostrado (usamos el email como fallback)
 *   {{code}}       → el código de 6 dígitos
 */
export async function sendRecoveryEmail(toEmail: string, code: string): Promise<void> {
  // Si no hay credenciales configuradas, lanzamos error descriptivo
  if (
    EMAILJS_SERVICE_ID === 'TU_SERVICE_ID' ||
    EMAILJS_TEMPLATE_ID === 'TU_TEMPLATE_ID' ||
    EMAILJS_PUBLIC_KEY === 'TU_PUBLIC_KEY'
  ) {
    throw new Error('EMAIL_NOT_CONFIGURED');
  }

  await emailjs.send(
    EMAILJS_SERVICE_ID,
    EMAILJS_TEMPLATE_ID,
    {
      to_email: toEmail,
      to_name: toEmail.split('@')[0],
      code,
    },
    { publicKey: EMAILJS_PUBLIC_KEY },
  );
}
