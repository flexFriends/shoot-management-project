import nodemailer from 'nodemailer';
import { prisma } from '../config/db.js';

let transporter;

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
    throw new Error('Email SMTP credentials are required (set GMAIL_USER/GMAIL_APP_PASSWORD or SMTP_USER/SMTP_PASS)');
  }

  const secure = Number(port) === 465;

  transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
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
  const { user, from } = getMailConfig();
  const mailer = getTransporter();

  return mailer.sendMail({
    from,
    to,
    subject,
    html: htmlBody,
  });
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