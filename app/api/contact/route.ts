import { Resend } from 'resend'
import { NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  try {
    const { name, email, message } = await req.json()

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    const now = new Date().toLocaleString('en-US', {
      timeZone: 'Asia/Dhaka',
      dateStyle: 'medium',
      timeStyle: 'short',
    })

    await resend.emails.send({
      from: 'Portfolio Contact <onboarding@resend.dev>',
      to: process.env.CONTACT_EMAIL!,
      replyTo: email,
      subject: `[Portfolio] New message from ${name}`,
      html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background:#0f0f14;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f14;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:580px;background:#16161f;border-radius:12px;overflow:hidden;border:1px solid rgba(255,255,255,0.07);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1a1f3c,#0f1229);padding:32px 36px;border-bottom:1px solid rgba(79,142,247,0.2);">
            <table width="100%">
              <tr>
                <td>
                  <p style="margin:0 0 4px;font-size:11px;color:#4f8ef7;letter-spacing:0.15em;text-transform:uppercase;">mahmud.dev</p>
                  <h1 style="margin:0;font-size:22px;color:#e2e2f0;font-weight:700;">New Message Received</h1>
                </td>
                <td align="right">
                  <div style="background:rgba(79,142,247,0.12);border:1px solid rgba(79,142,247,0.25);border-radius:20px;padding:6px 14px;display:inline-block;">
                    <span style="font-size:11px;color:#4f8ef7;font-weight:600;">PORTFOLIO</span>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px 36px;">

            <!-- Sender info -->
            <table width="100%" style="background:#0f0f14;border-radius:8px;border:1px solid rgba(255,255,255,0.06);margin-bottom:24px;">
              <tr>
                <td style="padding:20px 24px;border-bottom:1px solid rgba(255,255,255,0.05);">
                  <p style="margin:0 0 4px;font-size:10px;color:rgba(226,226,240,0.3);letter-spacing:0.1em;text-transform:uppercase;">From</p>
                  <p style="margin:0;font-size:16px;color:#e2e2f0;font-weight:600;">${name}</p>
                </td>
              </tr>
              <tr>
                <td style="padding:16px 24px;border-bottom:1px solid rgba(255,255,255,0.05);">
                  <p style="margin:0 0 4px;font-size:10px;color:rgba(226,226,240,0.3);letter-spacing:0.1em;text-transform:uppercase;">Email</p>
                  <a href="mailto:${email}" style="font-size:14px;color:#4f8ef7;text-decoration:none;">${email}</a>
                </td>
              </tr>
              <tr>
                <td style="padding:16px 24px;">
                  <p style="margin:0 0 4px;font-size:10px;color:rgba(226,226,240,0.3);letter-spacing:0.1em;text-transform:uppercase;">Received</p>
                  <p style="margin:0;font-size:13px;color:rgba(226,226,240,0.5);">${now} (Dhaka)</p>
                </td>
              </tr>
            </table>

            <!-- Message -->
            <p style="margin:0 0 12px;font-size:10px;color:rgba(226,226,240,0.3);letter-spacing:0.1em;text-transform:uppercase;">Message</p>
            <div style="background:#0f0f14;border:1px solid rgba(255,255,255,0.06);border-left:3px solid #4f8ef7;border-radius:8px;padding:20px 24px;margin-bottom:28px;">
              <p style="margin:0;font-size:15px;color:#c8c8e0;line-height:1.7;">${message.replace(/\n/g, '<br/>')}</p>
            </div>

            <!-- Reply button -->
            <table width="100%">
              <tr>
                <td align="center">
                  <a href="mailto:${email}?subject=Re: Your message to Mahmud" style="display:inline-block;background:#4f8ef7;color:#fff;font-size:14px;font-weight:600;text-decoration:none;padding:12px 32px;border-radius:8px;letter-spacing:0.03em;">
                    Reply to ${name}
                  </a>
                </td>
              </tr>
            </table>

          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:20px 36px;border-top:1px solid rgba(255,255,255,0.05);text-align:center;">
            <p style="margin:0;font-size:11px;color:rgba(226,226,240,0.2);">This email was sent via the contact form on <a href="https://mahmud-dev.vercel.app" style="color:rgba(79,142,247,0.6);text-decoration:none;">mahmud.dev</a></p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
