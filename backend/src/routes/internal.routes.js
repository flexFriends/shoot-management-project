import express from 'express';
import * as internalController from '../controllers/internal.controller.js';

const router = express.Router();

// Protected endpoint to trigger reminder/escalation jobs. Requires INTERNAL_SECRET.
router.post('/run-reminders', internalController.runReminders);

export default router;
