const baseStyles = `
  body { margin: 0; padding: 0; background: #f6f7fb; font-family: Arial, Helvetica, sans-serif; color: #1f2937; }
  .wrapper { width: 100%; background: #f6f7fb; padding: 24px 0; }
  .card { max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 12px 40px rgba(15, 23, 42, 0.08); }
  .header { background: linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%); color: #ffffff; padding: 28px 32px; }
  .brand { font-size: 13px; letter-spacing: 0.18em; text-transform: uppercase; opacity: 0.8; margin-bottom: 10px; }
  .title { margin: 0; font-size: 26px; line-height: 1.2; }
  .content { padding: 32px; }
  .lead { font-size: 16px; line-height: 1.6; margin: 0 0 20px; }
  .section { margin-top: 24px; }
  .section-title { margin: 0 0 12px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.08em; color: #475569; }
  .list { margin: 0; padding-left: 20px; }
  .list li { margin: 6px 0; }
  .meta { margin-top: 4px; color: #64748b; font-size: 12px; }
  .badge { display: inline-block; background: #dbeafe; color: #1d4ed8; padding: 6px 10px; border-radius: 999px; font-size: 12px; font-weight: 700; }
  .footer { padding: 20px 32px 32px; color: #64748b; font-size: 13px; line-height: 1.5; }
  .highlight { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; }
`;

const renderEmployeeList = (employees) => {
  if (!employees.length) {
    return '<p class="lead">No employees are missing tasks for tomorrow.</p>';
  }

  return `
    <div class="highlight">
      <ul class="list">
        ${employees.map((employee) => {
          const workspaceLabel = Array.isArray(employee.workspaceTitles) && employee.workspaceTitles.length > 0
            ? `<div class="meta">Missing in: ${employee.workspaceTitles.join(', ')}</div>`
            : '';

          return `<li><strong>${employee.name}</strong> (${employee.email})${workspaceLabel}</li>`;
        }).join('')}
      </ul>
    </div>
  `;
};

export const buildManagerReminderEmail = ({ managerName, missingEmployees, tomorrowLabel, reminderLabel }) => {
  return `
    <html>
      <head>
        <style>${baseStyles}</style>
      </head>
      <body>
        <div class="wrapper">
          <div class="card">
            <div class="header">
              <div class="brand">Studio Shoot Management</div>
              <h1 class="title">Task Assignment Reminder</h1>
            </div>
            <div class="content">
              <p class="lead">Hi <strong>${managerName}</strong>, you still need to assign tomorrow's tasks.</p>
              <div class="section">
                <span class="badge">${tomorrowLabel}</span>
              </div>
              <div class="section">
                <p class="section-title">Missing assignments</p>
                ${renderEmployeeList(missingEmployees)}
              </div>
              <div class="section">
                <p class="lead">${reminderLabel}</p>
              </div>
            </div>
            <div class="footer">
              Please assign tasks for tomorrow before the end of the day. This is an automated reminder from Studio Shoot Management.
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
};

export const buildEscalationEmail = ({
  managerName,
  missingEmployees,
  tomorrowLabel,
  escalationLabel,
  escalationTimeLabel,
}) => {
  return `
    <html>
      <head>
        <style>${baseStyles}</style>
      </head>
      <body>
        <div class="wrapper">
          <div class="card">
            <div class="header">
              <div class="brand">Studio Shoot Management</div>
              <h1 class="title">ESCALATION: Unassigned Tasks</h1>
            </div>
            <div class="content">
              <p class="lead">Manager: <strong>${managerName}</strong></p>
              <div class="section">
                <span class="badge">${tomorrowLabel}</span>
              </div>
              <div class="section">
                <p class="section-title">Missing employees</p>
                ${renderEmployeeList(missingEmployees)}
              </div>
              <div class="section">
                <p class="lead"><strong>Escalation level:</strong> ${escalationLabel}</p>
                <p class="lead"><strong>Timestamp:</strong> ${escalationTimeLabel}</p>
              </div>
            </div>
            <div class="footer">
              This alert was sent because the manager still has not assigned tomorrow's tasks for all employees.
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
};

export const buildTaskAssignmentEmail = ({
  employeeName,
  taskTitle,
  workspaceTitle,
  shootDateLabel,
  dueDateLabel,
  managerName,
}) => {
  return `
    <html>
      <head>
        <style>${baseStyles}</style>
      </head>
      <body>
        <div class="wrapper">
          <div class="card">
            <div class="header">
              <div class="brand">Studio Shoot Management</div>
              <h1 class="title">New Task Assigned</h1>
            </div>
            <div class="content">
              <p class="lead">Hi <strong>${employeeName}</strong>, a new task has been assigned to you for an upcoming shoot.</p>
              <div class="section">
                <p class="section-title">Task details</p>
                <div class="highlight">
                  <p class="lead"><strong>Task:</strong> ${taskTitle}</p>
                  <p class="meta"><strong>Shoot:</strong> ${workspaceTitle}</p>
                  ${shootDateLabel ? `<p class="meta"><strong>Shoot date:</strong> ${shootDateLabel}</p>` : ''}
                  ${dueDateLabel ? `<p class="meta"><strong>Task due date:</strong> ${dueDateLabel}</p>` : ''}
                  ${managerName ? `<p class="meta"><strong>Assigned by:</strong> ${managerName}</p>` : ''}
                </div>
              </div>
              <div class="section">
                <p class="lead">Please check your task board and update the submission once the work is ready.</p>
              </div>
            </div>
            <div class="footer">
              This is an automated assignment email from Studio Shoot Management.
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
};

export const buildWorkspaceAssignmentEmail = ({
  employeeName,
  workspaceTitle,
  shootDateLabel,
  setupTypeLabel,
}) => {
  return `
    <html>
      <head>
        <style>${baseStyles}</style>
      </head>
      <body>
        <div class="wrapper">
          <div class="card">
            <div class="header">
              <div class="brand">Studio Shoot Management</div>
              <h1 class="title">You have been added to a shoot</h1>
            </div>
            <div class="content">
              <p class="lead">Hi <strong>${employeeName}</strong>, you have been added to a new shoot workspace.</p>
              <div class="section">
                <p class="section-title">Shoot details</p>
                <div class="highlight">
                  <p class="lead"><strong>Shoot:</strong> ${workspaceTitle}</p>
                  ${shootDateLabel ? `<p class="meta"><strong>Shoot date:</strong> ${shootDateLabel}</p>` : ''}
                  ${setupTypeLabel ? `<p class="meta"><strong>Setup type:</strong> ${setupTypeLabel}</p>` : ''}
                </div>
              </div>
              <div class="section">
                <p class="lead">Please check your dashboard for the full shoot details and assigned tasks.</p>
              </div>
            </div>
            <div class="footer">
              This is an automated shoot assignment email from Studio Shoot Management.
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
};

export default {
  buildManagerReminderEmail,
  buildEscalationEmail,
  buildTaskAssignmentEmail,
  buildWorkspaceAssignmentEmail,
};