import { sendEmail } from '../src/utils/notification.js';
import { prisma } from '../src/config/db.js';

const test = async () => {
  try {
    console.log('Sending test email to jasdeepsinghop@gmail.com...');
    await sendEmail(
      'jasdeepsinghop@gmail.com',
      'Test Email Notification System',
      '<h1>Test Notification</h1><p>This is a test of the notification system mailer.</p>'
    );
    console.log('✓ Test email sent successfully');
  } catch (error) {
    console.error('✗ Test email failed:', error);
  } finally {
    await prisma.$disconnect();
  }
};

test();
