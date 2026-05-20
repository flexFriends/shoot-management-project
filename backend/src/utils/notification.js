import nodemailer from 'nodemailer';
import { prisma } from '../config/db.js';

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

  // transporter = nodemailer.createTransport({
  //   host,
  //   port,
  //   secure,
  //   auth: {
  //     user,
  //     pass,
  //   },
  // });

  transporter = nodemailer.createTransport({
  host,
  port,
  secure,
  auth: {
    user,
    pass,
  },
  tls: {
    rejectUnauthorized: false,
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

export const sendEmail = async (to, subject, htmlBody) => {
  const { host, port, user, from } = getMailConfig();
  const mailer = getTransporter();

  console.info(
    `[Email] Attempting send via ${host}:${port} from ${maskEmail(from || user)} to ${maskEmail(to)} | subject="${subject}"`
  );

  try {
    const info = await mailer.sendMail({
      from,
      to,
      subject,
      html: htmlBody,
    });

    console.info(
      `[Email] Sent successfully | messageId=${info.messageId || 'n/a'} | accepted=${(info.accepted || []).length} | rejected=${(info.rejected || []).length}`
    );

    return info;
  } catch (error) {
    console.error(
      `[Email] Send failed | code=${error.code || 'n/a'} | responseCode=${error.responseCode || 'n/a'} | message=${error.message}`
    );
    if (error.response) {
      console.error(`[Email] Provider response: ${error.response}`);
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