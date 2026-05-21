import nodemailer from 'nodemailer';
import https from 'https';
import { prisma } from '../config/db.js';
import axios from "axios";

let transporter;

const maskEmail = (value) => {
  if (!value || typeof value !== 'string' || !value.includes('@')) return value || 'not-set';
  const [name, domain] = value.split('@');
  if (!name) return `***@${domain}`;
  const prefix = name.slice(0, 2);
  return `${prefix}***@${domain}`;
};

const getMailConfig = () => {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.GMAIL_USER || process.env.SMTP_USER;
  const pass = process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS;
  const from = process.env.EMAIL_FROM || (user ? `Studio Shoot Management <${user}>` : undefined);

  return { host, port, user, pass, from };
};

const getTransporter = () => {
  if (transporter) {
    return transporter;
  }

  const { host, port, user, pass } = getMailConfig();

  if (!user || !pass) {
    console.error('[Email] SMTP credentials missing. Expected GMAIL_USER/GMAIL_APP_PASSWORD or SMTP_USER/SMTP_PASS.');
    throw new Error('Email SMTP credentials are required (set GMAIL_USER/GMAIL_APP_PASSWORD or SMTP_USER/SMTP_PASS)');
  }

  const secure = Number(port) === 465;

  transporter = nodemailer.createTransport({
  host,
  port,
  secure: false,
  auth: {
    user,
    pass,
  },
});

  transporter.verify((error, success) => {
    if (error) {
      console.error('[Email] SMTP verification failed:', {
        message: error.message,
        code: error.code,
        response: error.response,
      });
    } else {
      console.log('[Email] SMTP server is ready');
    }
  });

  return transporter;
};

export const createNotification = async (recipientId, senderId, type, message, taskId) => {
  return prisma.notification.create({
    data: {
      recipientId,
      senderId: senderId || null,
      type,
      message,
      taskId: taskId || null,
    },
  });
};

/**
 * Send email via Resend's REST API over HTTPS to bypass SMTP blocking in environments like Render free tier.
 */
const sendEmailViaResend = (apiKey, from, to, subject, htmlBody) => {
  return new Promise((resolve, reject) => {
    // Resend's free tier sandbox requires 'onboarding@resend.dev' as sender unless custom domain is verified
    let resendFrom = from;
    if (!resendFrom || resendFrom.includes('gmail.com')) {
      resendFrom = process.env.EMAIL_FROM || 'Studio Shoot Management <onboarding@resend.dev>';
    }

    const data = JSON.stringify({
      from: resendFrom,
      to,
      subject,
      html: htmlBody,
    });

    const options = {
      hostname: 'api.resend.com',
      port: 443,
      path: '/emails',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            resolve({ id: 'resend-success' });
          }
        } else {
          reject(new Error(`Resend API returned status ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.write(data);
    req.end();
  });
};

// export const sendEmail = async (to, subject, htmlBody) => {
//   const resendApiKey = process.env.RESEND_API_KEY;

//   if (resendApiKey) {
//     console.info(`[Email] RESEND_API_KEY detected. Attempting send via Resend HTTPS API to ${maskEmail(to)} | subject="${subject}"`);
//     try {
//       const from = process.env.EMAIL_FROM || 'Studio Shoot Management <onboarding@resend.dev>';
//       const info = await sendEmailViaResend(resendApiKey, from, to, subject, htmlBody);
//       console.info(`[Email] Sent successfully via Resend API | messageId=${info.id || 'n/a'}`);
//       return info;
//     } catch (error) {
//       console.error(`[Email] Send failed via Resend API | message=${error.message}`);
//       throw error;
//     }
//   }

//   // Fallback to standard SMTP
//   const { host, port, user, from } = getMailConfig();
//   const mailer = getTransporter();

//   console.info(
//     `[Email] Attempting send via ${host}:${port} from ${maskEmail(from || user)} to ${maskEmail(to)} | subject="${subject}"`
//   );

//   try {
//     const info = await mailer.sendMail({
//       from,
//       to,
//       subject,
//       html: htmlBody,
//     });

//     console.info(
//       `[Email] Sent successfully | messageId=${info.messageId || 'n/a'} | accepted=${(info.accepted || []).length} | rejected=${(info.rejected || []).length}`
//     );

//     return info;
//   } catch (error) {
//     console.error(
//       `[Email] Send failed | code=${error.code || 'n/a'} | responseCode=${error.responseCode || 'n/a'} | message=${error.message}`
//     );
//     if (error.response) {
//       console.error(`[Email] Provider response: ${error.response}`);
//     }
//     throw error;
//   }
// };

// export const sendEmail = async (to, subject, htmlBody) => {
//   const { host, port, user, from } = getMailConfig();
//   const mailer = getTransporter();

//   console.info(
//     `[Email] Attempting send via ${host}:${port} from ${maskEmail(from || user)} to ${maskEmail(to)} | subject="${subject}"`,
//   );

//   try {
//     console.log("BEFORE SEND MAIL");

//     const info = await mailer.sendMail({
//       from,
//       to,
//       subject,
//       html: htmlBody,
//     });

//     console.log("AFTER SEND MAIL");

//     console.info(
//       `[Email] Sent successfully | messageId=${info.messageId || "n/a"} | accepted=${(info.accepted || []).length} | rejected=${(info.rejected || []).length}`,
//     );

//     return info;
//   } catch (error) {
//     console.error("========== EMAIL ERROR ==========");
//     console.error("CODE:", error.code);
//     console.error("RESPONSE CODE:", error.responseCode);
//     console.error("COMMAND:", error.command);
//     console.error("MESSAGE:", error.message);
//     console.error("RESPONSE:", error.response);
//     console.error("FULL ERROR:", error);
//     console.error("=================================");

//     throw error;
//   }
// };

export const sendEmail = async (to, subject, htmlBody) => {
  try {
    console.log("[Brevo API] Sending email...");

    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "We Promote",
          email: process.env.EMAIL_FROM,
        },
        to: [
          {
            email: to,
          },
        ],
        subject,
        htmlContent: htmlBody,
      },
      {
        headers: {
          accept: "application/json",
          "api-key": process.env.BREVO_API_KEY,
          "content-type": "application/json",
        },
      }
    );

    console.log("[Brevo API] Email sent:", response.data);

    return response.data;
  } catch (error) {
    console.error("[Brevo API] ERROR:");

    if (error.response) {
      console.error(error.response.data);
    } else {
      console.error(error.message);
    }

    throw error;
  }
};

export const createNotificationAndEmail = async (
  recipientId,
  senderId,
  type,
  message,
  taskId,
  emailSubject,
  emailHtml
) => {
  const notification = await createNotification(recipientId, senderId, type, message, taskId);
  const recipient = await prisma.user.findUnique({
    where: { id: recipientId },
    select: { email: true },
  });

  if (!recipient?.email) {
    throw new Error('Recipient email not found');
  }

  await sendEmail(recipient.email, emailSubject, emailHtml);

  return notification;
};

export default {
  createNotification,
  sendEmail,
  createNotificationAndEmail,
};