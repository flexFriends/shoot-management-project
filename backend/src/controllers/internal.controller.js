import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { triggerReminderJobs } from '../utils/taskReminderScheduler.js';

export const runReminders = async (req, res, next) => {
  try {
    const secret = req.headers['x-internal-secret'] || req.query.secret;
    if (!process.env.INTERNAL_SECRET) {
      return errorResponse(res, 500, 'Internal secret not configured on server');
    }
    if (secret !== process.env.INTERNAL_SECRET) {
      return errorResponse(res, 403, 'Forbidden');
    }

    await triggerReminderJobs();
    return successResponse(res, 200, null, 'Reminder jobs triggered');
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

export default {
  runReminders,
};
