import nodemailer from 'nodemailer';
import { prisma } from '../config/db.js';

let transporter;

const getTransporter = () => {
  if (transporter) {
    return transporter;
  }

  const gmailUser = process.env.GMAIL_USER;
  const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

  if (!gmailUser || !gmailAppPassword) {
    throw new Error('GMAIL_USER and GMAIL_APP_PASSWORD are required to send emails');
  }

  // Create a Gmail App Password in your Google Account under Security > 2-Step Verification > App passwords.
  transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: gmailUser,
      pass: gmailAppPassword,
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
  const gmailUser = process.env.GMAIL_USER;
  const mailer = getTransporter();

  return mailer.sendMail({
    from: `Studio Shoot Management <${gmailUser}>`,
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