# Notification System - Manual Testing Guide

## 🧪 Test 1: API Endpoints (with valid token)

### A. Get Notifications
```bash
curl -X GET http://localhost:9001/api/notifications \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"

Expected Response:
{
  "success": true,
  "data": [
    {
      "id": "...",
      "recipientId": "...",
      "senderId": null,
      "type": "TASK_REMINDER_MANAGER",
      "message": "You have not assigned tasks to: Emp1 for tomorrow (18 May 2026)",
      "taskId": null,
      "isRead": false,
      "createdAt": "2026-05-18T13:00:00Z",
      "sender": null,
      "recipient": { "id": "...", "name": "Manager 1", "email": "..." },
      "task": null
    }
  ],
  "message": "Notifications fetched successfully"
}
```

### B. Mark Notification as Read
```bash
curl -X PATCH http://localhost:9001/api/notifications/{id}/read \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

Expected Response:
{
  "success": true,
  "data": {
    "id": "...",
    "isRead": true,
    ...
  },
  "message": "Notification marked as read"
}
```

### C. Mark All Notifications as Read
```bash
curl -X PATCH http://localhost:9001/api/notifications/read-all \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

Expected Response:
{
  "success": true,
  "data": {
    "count": 5
  },
  "message": "All notifications marked as read"
}
```

### D. Delete Notification
```bash
curl -X DELETE http://localhost:9001/api/notifications/{id} \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

Expected Response:
{
  "success": true,
  "data": { "id": "...", ... },
  "message": "Notification deleted successfully"
}
```

### E. Test Auth Protection (without token)
```bash
curl -X GET http://localhost:9001/api/notifications

Expected Response:
{
  "success": false,
  "message": "Authorization token required",
  "statusCode": 401
}
```

---

## 🧪 Test 2: Scheduler (Manual Testing)

### Prerequisites:
1. Have a Manager with at least 2 Employees in a Workspace
2. Don't assign tasks to those employees for tomorrow's date
3. Check server logs for `[Task Reminder]` messages

### A. Check Scheduler Initialization
```bash
# Start backend with: npm run dev
# Expected output in console:
# ✓ Database connection established
# [Task Reminder] Scheduler initialized
```

### B. Verify Cron Jobs Setup
The scheduler initializes 6 jobs:
- 1:00 PM (13:00): Manager reminder #1
- 2:00 PM (14:00): Manager reminder #2
- 2:30 PM (14:30): Manager reminder #3
- 3:00 PM (15:00): HR escalation
- 4:00 PM (16:00): Admin escalation
- 8:00 PM (20:00): Urgent admin escalation

### C. Monitor Scheduler Logs
When a job runs, you'll see:
```
[Task Reminder] Running manager reminder job (1:00 PM) for 2 managers
[Task Reminder] Manager manager1@studio.com: found 2 missing assignments
[Task Reminder] Notified manager manager1@studio.com about 2 missing assignments
[Task Reminder] Sent TASK_REMINDER_MANAGER to manager1@studio.com
```

---

## 🧪 Test 3: Email Sending (Gmail Configuration)

### Setup Gmail App Password:
1. Go to: myaccount.google.com
2. Navigate to: Security → 2-Step Verification
3. Scroll to: App passwords
4. Select: Mail + Windows Computer
5. Google generates a 16-char password
6. Copy and paste into `.env`:
   ```
   GMAIL_USER=your-email@gmail.com
   GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
   ```

### Test Email Sending:
Create a test file `test-email.js`:
```javascript
import { sendEmail } from './src/utils/notification.js';

const testEmail = async () => {
  try {
    await sendEmail(
      'test@example.com',
      'Test Subject',
      '<h1>Test Email</h1><p>If you see this, email is working!</p>'
    );
    console.log('✓ Email sent successfully');
  } catch (error) {
    console.error('✗ Email failed:', error.message);
  }
};

testEmail();
```

Run with:
```bash
node test-email.js
```

---

## 🧪 Test 4: Database Notifications

### Check Notifications in Database:
```bash
# Open Prisma Studio
npx prisma studio

# Navigate to: Notification table
# Verify columns:
# - id, recipientId, senderId, type, message
# - taskId, isRead, createdAt, title
```

### Query Notifications via SQL (optional):
```sql
-- PostgreSQL: Check all notifications
SELECT 
  n.id,
  n.type,
  u.email as recipient_email,
  n.message,
  n."isRead",
  n."createdAt"
FROM "Notification" n
LEFT JOIN "User" u ON n."recipientId" = u.id
ORDER BY n."createdAt" DESC
LIMIT 10;
```

---

## 🧪 Test 5: Unassigned Employee Detection

### Create Test Scenario:
1. **Create Manager:** manager1@studio.com
2. **Create Employees:** emp1@studio.com, emp2@studio.com
3. **Create Workspace:** Add manager as creator, both employees as members
4. **Create Tasks:**
   - Task 1: assigned to emp1, dueDate = tomorrow ✓
   - Task 2: NOT assigned (null assignee) or assigned to someone else ✓
5. **Expected Result:**
   - emp2 should appear in unassigned list

### Query Unassigned Employees (debug):
Add this to `taskReminderScheduler.js` temporarily:
```javascript
// In runManagerReminderJob() after getting missingEmployees:
console.log(`[DEBUG] Missing employees for ${manager.email}:`, 
  missingEmployees.map(e => `${e.name} (${e.email})`).join(', ')
);
```

---

## 🧪 Test 6: Message Variations

### Verify Different Reminder Texts:
Monitor logs to confirm reminder messages change:

**1:00 PM:**
```
"You have not assigned tasks to: Emp1, Emp2 for tomorrow (18 May 2026)"
```

**2:00 PM:**
```
"Reminder: Still missing task assignments for: Emp1, Emp2"
```

**2:30 PM:**
```
"Final warning: You still have not assigned tasks to: Emp1, Emp2 for tomorrow (18 May 2026)"
```

---

## 🧪 Test 7: Escalation Chain

### Expected Escalation Flow:

1. **1:00 PM - 2:30 PM:** Manager gets 3 reminders
2. **3:00 PM:** If still unassigned → all HR users notified
   - Type: `TASK_REMINDER_HR`
3. **4:00 PM:** If still unassigned → all ADMIN users notified
   - Type: `TASK_REMINDER_ADMIN`
4. **8:00 PM:** Final urgent escalation → all ADMIN users
   - Type: `TASK_REMINDER_ADMIN`
   - Message prefix: "URGENT:"

### Verify in Console:
```
[Task Reminder] Sent TASK_REMINDER_MANAGER to manager1@studio.com
[Task Reminder] Sent TASK_REMINDER_HR to hr1@studio.com
[Task Reminder] Sent TASK_REMINDER_ADMIN to admin@studio.com
[Task Reminder] Sent TASK_REMINDER_ADMIN to admin@studio.com (URGENT flag)
```

---

## 🧪 Test 8: Error Handling

### Test Manager Error Handling:
1. Create invalid workspace (missing members)
2. Run scheduler manually
3. Verify: Single manager error doesn't stop other managers
4. Check logs:
   ```
   [Task Reminder] Manager reminder failed for invalid-manager@studio.com: [error message]
   [Task Reminder] Notified manager valid-manager@studio.com about 2 missing assignments
   ```

---

## 🧪 Test 9: Dynamic Date Calculation

### Verify Tomorrow's Date (not hardcoded):
Add debug logging:
```javascript
const { label: reminderDateLabel } = getTomorrowRange();
console.log(`[Task Reminder] Checking for assignments on: ${reminderDateLabel}`);
```

Run on different dates to confirm date changes dynamically.

---

## 🧪 Test 10: Performance & Load

### Monitor:
- Query time for `getUnassignedEmployees()`
- Email sending time for multiple recipients
- Database connection pool status

### Check Logs:
```bash
# Backend console should show all 6 jobs running without overlap
# No hanging connections
# No memory leaks over 24 hours
```

---

## ✅ Success Criteria

- [ ] Backend starts with "Scheduler initialized"
- [ ] GET /api/notifications returns notification array
- [ ] Notifications are protected by auth middleware
- [ ] Unassigned employees correctly identified
- [ ] Email sends successfully (if Gmail credentials set)
- [ ] 6 cron jobs execute at correct times
- [ ] Error in one manager doesn't stop others
- [ ] Messages vary by time (1PM, 2PM, 2:30PM)
- [ ] Escalation chain works (Manager → HR → Admin)
- [ ] Tomorrow's date calculated dynamically

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Scheduler not initializing | Check `server.js` has `initTaskReminderScheduler()` call |
| API returns 401 | JWT token expired or invalid - get new token from login |
| Email not sending | Check GMAIL_USER and GMAIL_APP_PASSWORD in .env |
| Database error on migration | Run `npx prisma migrate reset` (development only) |
| Cron jobs not running | Check server timezone matches expected times |
| Employees not found | Verify workspace has members with role = EMPLOYEE |
| Duplicate notifications | Check scheduler isn't initialized twice (guard in place) |

---

## 📞 Support

For issues:
1. Check console logs for `[Task Reminder]` messages
2. Verify database connection: `SELECT 1` in Prisma Studio
3. Test email separately using `test-email.js`
4. Check cron timing: `date` command to verify server time
