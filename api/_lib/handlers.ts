import nodemailer from 'nodemailer';
import Stripe from 'stripe';

export type EnvMap = Record<string, string | undefined>;

export interface HandlerResult {
  status: number;
  body: Record<string, unknown>;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Per-instance cache prevents immediate duplicate receipt emails within one warm Node process.
const emailedStripeSessions = new Set<string>();

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function sanitizeHeader(value: string): string {
  return value.replace(/[\r\n"]/g, '').trim();
}

function readEnv(env: EnvMap, key: string): string {
  return String(env[key] || process.env[key] || '').trim();
}

function resolveStripeClient(env: EnvMap): Stripe | null {
  const secretKey = readEnv(env, 'STRIPE_SECRET_KEY');
  if (!secretKey) return null;
  return new Stripe(secretKey);
}

function resolveSmtpCredentials(
  parsed: Record<string, any>,
  env: EnvMap
): { user: string; pass: string } | null {
  const effectiveUser = String(parsed.smtpUser || readEnv(env, 'SMTP_USER')).trim();
  const effectivePass = String(parsed.smtpPass || readEnv(env, 'SMTP_PASS'))
    .trim()
    .replace(/\s+/g, '');

  if (!effectiveUser || !effectivePass) {
    return null;
  }

  return { user: effectiveUser, pass: effectivePass };
}

function createGmailTransporter(creds: { user: string; pass: string }) {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: creds.user,
      pass: creds.pass
    }
  });
}

async function sendDonationReceiptEmail(
  params: {
    donorName: string;
    donorEmail: string;
    amountUsd: number;
    frequency: 'one-time' | 'monthly';
    cause: string;
    receiptNumber: string;
    dedicationNote?: string;
    isPaidStripe: boolean;
  },
  creds: { user: string; pass: string },
  env: EnvMap
) {
  const safeName = escapeHtml(params.donorName);
  const safeCause = escapeHtml(params.cause);
  const safeReceipt = escapeHtml(params.receiptNumber);
  const safeNote = escapeHtml(params.dedicationNote || '');
  const ownerInbox = readEnv(env, 'CONTACT_EMAIL') || creds.user;
  const formattedAmount = `$${params.amountUsd.toFixed(2)}${params.frequency === 'monthly' ? ' / month' : ''}`;
  const label = params.isPaidStripe ? 'Stripe Payment Receipt' : 'Donation Pledge Confirmation';
  const footerNote = params.isPaidStripe
    ? 'Processed securely via GiveBack™ Stripe Checkout.'
    : 'Recorded via GiveBack™ pledge checkout.';

  const transporter = createGmailTransporter(creds);
  await transporter.sendMail({
    from: `"GiveBack™ Donations" <${creds.user}>`,
    to: params.donorEmail,
    bcc: ownerInbox !== params.donorEmail ? ownerInbox : undefined,
    subject: `GiveBack™ ${label} (${safeReceipt}) — ${formattedAmount}`,
    text: [
      `Thank you, ${params.donorName}, for your ${params.frequency} contribution of ${formattedAmount} to GiveBack™!`,
      `Receipt ID: ${params.receiptNumber}`,
      `Allocated Fund: ${params.cause}`,
      params.dedicationNote ? `Dedication / Note: ${params.dedicationNote}` : '',
      '',
      footerNote
    ]
      .filter(Boolean)
      .join('\n'),
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 28px 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 20px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #1d4ed8; font-size: 24px; margin: 0; font-weight: 800;">Give<span style="color: #059669;">Back</span>™</h1>
          <p style="color: #64748b; font-size: 12px; margin: 4px 0 0 0;">${label}</p>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 18px; font-size: 13px; color: #334155;">
          <p style="margin: 0 0 10px 0;">Thank you, <strong>${safeName}</strong>, for supporting community mutual aid.</p>
          <p style="margin: 0 0 6px 0;"><strong>Receipt ID:</strong> <span style="font-family: monospace;">${safeReceipt}</span></p>
          <p style="margin: 0 0 6px 0;"><strong>Amount:</strong> ${escapeHtml(formattedAmount)}</p>
          <p style="margin: 0 0 6px 0;"><strong>Designated Fund:</strong> ${safeCause}</p>
          ${safeNote ? `<p style="margin: 8px 0 0 0;"><strong>Dedication:</strong> <em>"${safeNote}"</em></p>` : ''}
        </div>
        <p style="color: #94a3b8; font-size: 11px; margin: 16px 0 0 0; text-align: center;">
          ${footerNote}
        </p>
      </div>
    `
  });
}

export async function handleSendCode(
  parsed: Record<string, any>,
  env: EnvMap = process.env
): Promise<HandlerResult> {
  try {
    const email = String(parsed.email || '').trim();
    const code = String(parsed.code || '').trim();

    if (!EMAIL_PATTERN.test(email)) {
      return { status: 400, body: { success: false, error: 'Please provide a valid recipient email address.' } };
    }

    if (!code || code.length < 4 || code.length > 12) {
      return { status: 400, body: { success: false, error: 'Invalid verification code.' } };
    }

    const creds = resolveSmtpCredentials(parsed, env);
    if (!creds) {
      return {
        status: 400,
        body: {
          success: false,
          needsConfig: true,
          error:
            'SMTP credentials not configured yet. Please configure your sender email & app password to send real emails to inboxes.'
        }
      };
    }

    const safeCode = escapeHtml(code);
    const transporter = createGmailTransporter(creds);

    await transporter.sendMail({
      from: `"GiveBack™" <${creds.user}>`,
      to: email,
      subject: `Your GiveBack Verification Code: ${sanitizeHeader(code)}`,
      text: `Your GiveBack™ verification code is: ${code}\n\nThis code is valid for 15 minutes. If you did not request a password reset, you can safely ignore this email.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 540px; margin: 0 auto; padding: 32px 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 20px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #1d4ed8; font-size: 26px; margin: 0; font-weight: 800; letter-spacing: -0.5px;">Give<span style="color: #059669;">Back</span>™</h1>
            <p style="color: #64748b; font-size: 13px; margin: 4px 0 0 0;">Connecting Goodwill & Community Need</p>
          </div>

          <div style="padding: 24px; background: #f8fafc; border: 1px solid #edf2f7; border-radius: 16px; text-align: center;">
            <p style="color: #334155; font-size: 14px; margin: 0 0 16px 0; font-weight: 500;">
              We received a request to reset your password for your <strong>GiveBack</strong> account. Enter the verification code below on the website to continue:
            </p>

            <div style="font-family: monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #059669; padding: 18px 24px; background: #ffffff; border: 2px dashed #059669; border-radius: 12px; display: inline-block; margin: 8px 0 16px 0;">
              ${safeCode}
            </div>

            <p style="color: #64748b; font-size: 12px; margin: 0;">
              This code is valid for <strong>15 minutes</strong>. If you did not request a password reset, you can safely ignore this email.
            </p>
          </div>

          <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #f1f5f9; text-align: center;">
            <p style="color: #94a3b8; font-size: 11px; margin: 0;">
              © 2026 GiveBack Global Foundation Inc. • San Francisco, CA
            </p>
          </div>
        </div>
      `
    });

    return {
      status: 200,
      body: { success: true, message: `Real verification email sent to ${email}` }
    };
  } catch (err: any) {
    console.error('Email sending error (/api/send-code):', err);
    return {
      status: 500,
      body: { success: false, error: err?.message || 'Failed to dispatch verification email' }
    };
  }
}

export async function handleContact(
  parsed: Record<string, any>,
  env: EnvMap = process.env
): Promise<HandlerResult> {
  try {
    const name = String(parsed.name || '').trim();
    const email = String(parsed.email || '').trim();
    const subject = String(parsed.subject || 'General Support').trim();
    const message = String(parsed.message || '').trim();

    if (!name) {
      return { status: 400, body: { success: false, error: 'Please enter your full name.' } };
    }
    if (!EMAIL_PATTERN.test(email)) {
      return { status: 400, body: { success: false, error: 'Please enter a valid email address.' } };
    }
    if (!message) {
      return { status: 400, body: { success: false, error: 'Please enter a message before submitting.' } };
    }

    const creds = resolveSmtpCredentials(parsed, env);
    if (!creds) {
      return {
        status: 400,
        body: {
          success: false,
          needsConfig: true,
          error:
            'SMTP credentials not configured yet. Please configure your Gmail & app password so contact messages can be sent to your inbox.'
        }
      };
    }

    const recipientEmail = readEnv(env, 'CONTACT_EMAIL') || creds.user;
    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeSubject = escapeHtml(subject);
    const safeMessageHtml = escapeHtml(message).replace(/\r?\n/g, '<br />');

    const transporter = createGmailTransporter(creds);

    await transporter.sendMail({
      from: `"GiveBack™ Contact" <${creds.user}>`,
      to: recipientEmail,
      replyTo: `"${sanitizeHeader(name)}" <${sanitizeHeader(email)}>`,
      subject: `[GiveBack Contact] ${sanitizeHeader(subject)} — ${sanitizeHeader(name)}`,
      text: [
        'New message from GiveBack™ Contact Form',
        '',
        `From: ${name} <${email}>`,
        `Topic: ${subject}`,
        '',
        'Message:',
        message
      ].join('\n'),
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 28px 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 20px;">
          <div style="border-bottom: 1px solid #f1f5f9; padding-bottom: 16px; margin-bottom: 20px;">
            <h1 style="color: #1d4ed8; font-size: 22px; margin: 0; font-weight: 800;">Give<span style="color: #059669;">Back</span>™ Contact Message</h1>
            <p style="color: #64748b; font-size: 12px; margin: 4px 0 0 0;">New inquiry submitted from your GiveBack Contact page</p>
          </div>

          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 16px; margin-bottom: 18px; font-size: 13px; color: #334155;">
            <p style="margin: 0 0 8px 0;"><strong>Name:</strong> ${safeName}</p>
            <p style="margin: 0 0 8px 0;"><strong>Email:</strong> <a href="mailto:${safeEmail}" style="color: #2563eb;">${safeEmail}</a></p>
            <p style="margin: 0;"><strong>Topic:</strong> ${safeSubject}</p>
          </div>

          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 16px; font-size: 14px; line-height: 1.6; color: #0f172a;">
            <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin-bottom: 8px;">Message</div>
            <div>${safeMessageHtml}</div>
          </div>

          <p style="color: #94a3b8; font-size: 11px; margin: 18px 0 0 0; text-align: center;">
            Tip: Reply directly to this email to respond to ${safeName} (${safeEmail}).
          </p>
        </div>
      `
    });

    return { status: 200, body: { success: true, message: 'Your inquiry has been sent to our inbox.' } };
  } catch (err: any) {
    console.error('Contact email error (/api/contact):', err);
    return { status: 500, body: { success: false, error: err?.message || 'Failed to send contact message' } };
  }
}

export async function handleDonation(
  parsed: Record<string, any>,
  env: EnvMap = process.env
): Promise<HandlerResult> {
  try {
    const donorName = String(parsed.donorName || 'Supporter').trim();
    const donorEmail = String(parsed.donorEmail || '').trim();
    const amountUsd = Number(parsed.amountUsd || 0);
    const frequency = parsed.frequency === 'monthly' ? 'monthly' : 'one-time';
    const cause = String(parsed.cause || 'GiveBack General Mutual Aid Fund').trim();
    const receiptNumber = String(parsed.receiptNumber || '').trim();
    const dedicationNote = String(parsed.dedicationNote || '').trim();

    if (!EMAIL_PATTERN.test(donorEmail)) {
      return { status: 400, body: { success: false, error: 'Please provide a valid donor email address.' } };
    }
    if (!Number.isFinite(amountUsd) || amountUsd <= 0) {
      return { status: 400, body: { success: false, error: 'Invalid donation amount.' } };
    }

    const creds = resolveSmtpCredentials(parsed, env);
    if (!creds) {
      return {
        status: 400,
        body: {
          success: false,
          needsConfig: true,
          error: 'SMTP credentials not configured to email donation receipts.'
        }
      };
    }

    const receiptId = receiptNumber || `GB-DON-${Date.now()}`;
    await sendDonationReceiptEmail(
      {
        donorName,
        donorEmail,
        amountUsd,
        frequency,
        cause,
        receiptNumber: receiptId,
        dedicationNote,
        isPaidStripe: false
      },
      creds,
      env
    );

    return { status: 200, body: { success: true, message: `Receipt emailed to ${donorEmail}` } };
  } catch (err: any) {
    console.error('Donation email error (/api/donation):', err);
    return { status: 500, body: { success: false, error: err?.message || 'Failed to send donation receipt email' } };
  }
}

export async function handleCreateCheckoutSession(
  parsed: Record<string, any>,
  origin: string,
  env: EnvMap = process.env
): Promise<HandlerResult> {
  try {
    const stripe = resolveStripeClient(env);
    if (!stripe) {
      return {
        status: 500,
        body: {
          success: false,
          error:
            'STRIPE_SECRET_KEY is not configured on the server. Add it in .env locally or Vercel Project Settings -> Environment Variables.'
        }
      };
    }

    const amountUsd = Number(parsed.amountUsd || 0);
    const frequency = parsed.frequency === 'monthly' ? 'monthly' : 'one-time';
    const isMonthly = frequency === 'monthly';
    const cause = String(parsed.cause || 'GiveBack General Mutual Aid Fund').trim();
    const donorName = String(parsed.donorName || 'Anonymous Supporter').trim();
    const donorEmail = String(parsed.donorEmail || '').trim();
    const dedicationNote = String(parsed.dedicationNote || '').trim();
    const isAnonymous = Boolean(parsed.isAnonymous);
    const emailReceipt = Boolean(parsed.emailReceipt);
    const userId = String(parsed.userId || '').trim();

    if (!Number.isFinite(amountUsd) || amountUsd < 1 || amountUsd > 100000) {
      return { status: 400, body: { success: false, error: 'Donation amount must be between $1 and $100,000.' } };
    }
    if (!EMAIL_PATTERN.test(donorEmail)) {
      return { status: 400, body: { success: false, error: 'Please provide a valid email address.' } };
    }

    const unitAmountCents = Math.round(amountUsd * 100);
    const normalizedOrigin = origin.replace(/\/+$/, '');

    const session = await stripe.checkout.sessions.create({
      mode: isMonthly ? 'subscription' : 'payment',
      customer_email: donorEmail,
      metadata: {
        donorName: donorName.slice(0, 120),
        donorEmail: donorEmail.slice(0, 150),
        cause: cause.slice(0, 150),
        frequency,
        dedicationNote: dedicationNote.slice(0, 450),
        isAnonymous: String(isAnonymous),
        emailReceipt: String(emailReceipt),
        userId: userId.slice(0, 100)
      },
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `GiveBack™ Donation — ${cause}`,
              description: isMonthly
                ? 'Monthly recurring community support'
                : 'One-time community support contribution'
            },
            unit_amount: unitAmountCents,
            ...(isMonthly ? { recurring: { interval: 'month' } } : {})
          },
          quantity: 1
        }
      ],
      success_url: `${normalizedOrigin}/?session_id={CHECKOUT_SESSION_ID}#/donate`,
      cancel_url: `${normalizedOrigin}/?stripe_canceled=1#/donate`
    });

    if (!session.url) {
      return { status: 500, body: { success: false, error: 'Stripe did not return a checkout URL.' } };
    }

    return {
      status: 200,
      body: { success: true, url: session.url, sessionId: session.id }
    };
  } catch (err: any) {
    console.error('Stripe checkout session error:', err);
    return {
      status: 500,
      body: { success: false, error: err?.message || 'Failed to create Stripe Checkout session.' }
    };
  }
}

export async function handleGetCheckoutSession(
  sessionId: string,
  env: EnvMap = process.env
): Promise<HandlerResult> {
  try {
    const stripe = resolveStripeClient(env);
    if (!stripe) {
      return {
        status: 500,
        body: {
          success: false,
          error:
            'STRIPE_SECRET_KEY is not configured on the server. Add it in .env locally or Vercel Project Settings -> Environment Variables.'
        }
      };
    }

    const cleanSessionId = sessionId.trim();
    if (!cleanSessionId || !cleanSessionId.startsWith('cs_')) {
      return { status: 400, body: { success: false, error: 'Invalid Stripe session_id.' } };
    }

    const session = await stripe.checkout.sessions.retrieve(cleanSessionId);
    const isPaid = session.payment_status === 'paid';
    const meta = session.metadata || {};
    const amountUsd = Math.round(((session.amount_total ?? 0) / 100) * 100) / 100;
    const frequency: 'one-time' | 'monthly' =
      meta.frequency === 'monthly' || session.mode === 'subscription' ? 'monthly' : 'one-time';
    const cause = meta.cause || 'GiveBack General Mutual Aid Fund';
    const donorName = meta.donorName || 'Supporter';
    const donorEmail = session.customer_details?.email || meta.donorEmail || '';
    const dedicationNote = meta.dedicationNote || '';
    const isAnonymous = meta.isAnonymous === 'true';
    const receiptNumber = `GB-STR-${session.id.slice(-8).toUpperCase()}`;

    let emailedReceipt = emailedStripeSessions.has(session.id);
    if (isPaid && meta.emailReceipt === 'true' && EMAIL_PATTERN.test(donorEmail) && !emailedReceipt) {
      const creds = resolveSmtpCredentials({}, env);
      if (creds) {
        try {
          await sendDonationReceiptEmail(
            {
              donorName,
              donorEmail,
              amountUsd,
              frequency,
              cause,
              receiptNumber,
              dedicationNote,
              isPaidStripe: true
            },
            creds,
            env
          );
          emailedStripeSessions.add(session.id);
          emailedReceipt = true;
        } catch (mailErr) {
          console.warn('Stripe receipt email failed:', mailErr);
        }
      }
    }

    return {
      status: 200,
      body: {
        success: true,
        paid: isPaid,
        paymentStatus: session.payment_status,
        sessionId: session.id,
        receiptNumber,
        amountUsd,
        frequency,
        cause,
        donorName,
        donorEmail,
        isAnonymous,
        dedicationNote,
        userId: meta.userId || undefined,
        emailedReceipt
      }
    };
  } catch (err: any) {
    console.error('Stripe session verify error:', err);
    return {
      status: 500,
      body: { success: false, error: err?.message || 'Failed to verify Stripe Checkout session.' }
    };
  }
}

export async function handleStripeWebhook(
  rawBody: string | Buffer,
  sig: string,
  env: EnvMap = process.env
): Promise<HandlerResult> {
  try {
    const stripe = resolveStripeClient(env);
    const webhookSecret = readEnv(env, 'STRIPE_WEBHOOK_SECRET');
    if (!stripe || !webhookSecret) {
      return { status: 400, body: { success: false, error: 'Stripe webhook secret is not configured.' } };
    }

    const event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const meta = session.metadata || {};
      const donorEmail = session.customer_details?.email || meta.donorEmail || '';
      const receiptNumber = `GB-STR-${session.id.slice(-8).toUpperCase()}`;

      if (
        session.payment_status === 'paid' &&
        meta.emailReceipt === 'true' &&
        EMAIL_PATTERN.test(donorEmail) &&
        !emailedStripeSessions.has(session.id)
      ) {
        const creds = resolveSmtpCredentials({}, env);
        if (creds) {
          await sendDonationReceiptEmail(
            {
              donorName: meta.donorName || 'Supporter',
              donorEmail,
              amountUsd: Math.round(((session.amount_total ?? 0) / 100) * 100) / 100,
              frequency: session.mode === 'subscription' ? 'monthly' : 'one-time',
              cause: meta.cause || 'GiveBack General Mutual Aid Fund',
              receiptNumber,
              dedicationNote: meta.dedicationNote || '',
              isPaidStripe: true
            },
            creds,
            env
          );
          emailedStripeSessions.add(session.id);
        }
      }
    }

    return { status: 200, body: { received: true } };
  } catch (err: any) {
    console.error('Stripe webhook error:', err);
    return {
      status: 400,
      body: { success: false, error: err?.message || 'Webhook signature verification failed.' }
    };
  }
}
