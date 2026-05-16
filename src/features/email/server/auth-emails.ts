type AuthEmailUser = {
  email: string
  name?: string | null
}

type AuthEmail = {
  html: string
  subject: string
  text: string
  to: string
}

type AuthEmailArgs = {
  url: string
  user: AuthEmailUser
}

const fromAddress = 'Compare 2027 <noreply@compare2027.fr>'

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function getDisplayName(user: AuthEmailUser) {
  return user.name?.trim() || user.email
}

function buildEmailHtml({
  buttonLabel,
  intro,
  title,
  url,
}: {
  buttonLabel: string
  intro: string
  title: string
  url: string
}) {
  const escapedUrl = escapeHtml(url)

  return `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
  </head>
  <body style="margin:0;background:#f6f4ef;color:#17150f;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f6f4ef;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#fffaf0;border:1px solid #e6dcc9;border-radius:18px;overflow:hidden;">
            <tr>
              <td style="padding:28px 28px 8px;">
                <p style="margin:0 0 14px;color:#7a4b12;font-size:12px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;">Compare 2027</p>
                <h1 style="margin:0;color:#17150f;font-size:28px;line-height:1.15;">${escapeHtml(title)}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:12px 28px 8px;">
                <p style="margin:0;color:#403a2e;font-size:16px;line-height:1.6;">${escapeHtml(intro)}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 28px;">
                <a href="${escapedUrl}" style="display:inline-block;background:#17150f;color:#fffaf0;text-decoration:none;border-radius:12px;padding:14px 20px;font-size:15px;font-weight:700;">${escapeHtml(buttonLabel)}</a>
              </td>
            </tr>
            <tr>
              <td style="padding:0 28px 28px;">
                <p style="margin:0 0 8px;color:#5f5648;font-size:13px;line-height:1.5;">Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :</p>
                <p style="margin:0;word-break:break-all;color:#7a4b12;font-size:13px;line-height:1.5;">${escapedUrl}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
}

async function sendAuthEmail({ html, subject, text, to }: AuthEmail) {
  const apiKey = process.env.RESEND_API_KEY

  if (!apiKey || apiKey.startsWith('fake-')) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('RESEND_API_KEY is required to send auth emails')
    }

    console.info('[auth-email]', { reason: 'delivery skipped', subject })
    return
  }

  const response = await fetch('https://api.resend.com/emails', {
    body: JSON.stringify({
      from: fromAddress,
      html,
      subject,
      text,
      to,
    }),
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    method: 'POST',
  })

  if (!response.ok) {
    throw new Error(`Failed to send auth email: ${response.status} ${await response.text()}`)
  }
}

export async function sendEmailVerificationEmail({ url, user }: AuthEmailArgs) {
  const displayName = getDisplayName(user)
  const subject = 'Vérifiez votre adresse e-mail Compare 2027'
  const text = `Bonjour ${displayName},\n\nVérifiez votre adresse e-mail pour activer votre compte Compare 2027 : ${url}\n\nSi vous n'avez pas demandé cette vérification, ignorez ce message.`

  await sendAuthEmail({
    html: buildEmailHtml({
      buttonLabel: 'Vérifier mon e-mail',
      intro: `Bonjour ${displayName}, vérifiez votre adresse e-mail pour activer votre compte Compare 2027.`,
      title: 'Vérifiez votre e-mail',
      url,
    }),
    subject,
    text,
    to: user.email,
  })
}

export async function sendPasswordResetEmail({ url, user }: AuthEmailArgs) {
  const displayName = getDisplayName(user)
  const subject = 'Réinitialisez votre mot de passe Compare 2027'
  const text = `Bonjour ${displayName},\n\nRéinitialisez votre mot de passe Compare 2027 avec ce lien : ${url}\n\nSi vous n'avez pas demandé cette réinitialisation, ignorez ce message.`

  await sendAuthEmail({
    html: buildEmailHtml({
      buttonLabel: 'Réinitialiser mon mot de passe',
      intro: `Bonjour ${displayName}, utilisez ce lien pour choisir un nouveau mot de passe Compare 2027.`,
      title: 'Réinitialisez votre mot de passe',
      url,
    }),
    subject,
    text,
    to: user.email,
  })
}
