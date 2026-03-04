const nodemailer = require('nodemailer');
const path = require('path');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const BASE_URL = process.env.BASE_URL;

const _esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const getSubject = (type, data) => {
  switch (type) {
    case 'purchaseRequest': return `New Huntsman Form Submission - ${data.request.employeeName} (${data.request.shopName})`;
    case 'reminder': return `REMINDER: Action Required - Huntsman Form Submission - ${data.request.employeeName}`;
    case 'responseNotification':
      const prefix = data.action === 'confirm' ? ' CONFIRMED' : (data.action === 'reject' ? ' REJECTED' : ' UPDATE');
      return `${prefix}: Submission - ${data.request.employeeName} (${data.request.shopName})`;
    case 'registrationReceivedUser': return `Registration Received - Huntsman Optics`;
    case 'purchaseRequestConfirmation': return `Receipt Submission Received - Huntsman Optics`;
    case 'newSubmissionNotification': return `ALERT: New Receipt Submission - ${data.request.employeeName}`;
    case 'newRegistrationAdmin': return `ALERT: New User Registration Pending Approval`;
    case 'roleUpdated': return `Access Policy Updated - Huntsman Optics`;
    default: return 'Huntsman Form Notification';
  }
};

const getHtmlBody = (type, data) => {
  const request = data.request;
  const token = data.token;
  const user = data.user;

  const bodyBg = '#f1f5f9';
  const containerBg = '#ffffff';
  const primaryRed = '#dc2626';
  const textDark = '#1e293b';
  const textLight = '#64748b';

  const commonStyles = `
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
    line-height: 1.6; 
    color: ${textDark}; 
    background-color: ${bodyBg};
    padding: 40px 20px;
    margin: 0;
  `;

  const header = `
    <div style="background-color: ${containerBg}; border-top: 6px solid ${primaryRed}; border-radius: 16px 16px 0 0; padding: 40px 40px 20px; text-align: center; border-bottom: 1px solid #f1f5f9;">
      <div style="margin-bottom: 20px;">
        <img src="cid:logo" alt="Huntsman Optics" style="height: 60px; width: auto;" />
      </div>
      <h2 style="margin: 0; color: ${textDark}; font-size: 24px; font-weight: 800; letter-spacing: -0.025em;">Huntsman Form</h2>
      <p style="margin: 8px 0 0; color: ${textLight}; font-size: 14px; font-weight: 600; text-transform: uppercase; tracking: 0.1em;">Promotion Support</p>
    </div>
  `;

  const footer = `
    <div style="text-align: center; margin-top: 30px;">
      <p style="margin: 0; font-size: 11px; color: #94a3b8; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em;">
        © 2026 Huntsman Form • Australia
      </p>
    </div>
  `;

  const submissionDetails = (request) => `
    <div style="padding: 30px 40px; background-color: ${containerBg};">
      <h3 style="margin-top: 0; color: ${textDark}; font-size: 18px; font-weight: 700; margin-bottom: 20px;">
        Submission Details
      </h3>
      <table style="width: 100%; border-collapse: separate; border-spacing: 0;">
        <tr><td style="padding: 12px 0; border-bottom: 1px solid #f8fafc; color: ${textLight}; font-size: 14px; font-weight: 500;">Shop Name</td><td style="padding: 12px 0; border-bottom: 1px solid #f8fafc; font-weight: 700; text-align: right; color: ${textDark};">${_esc(request.shopName)}</td></tr>
        <tr><td style="padding: 12px 0; border-bottom: 1px solid #f8fafc; color: ${textLight}; font-size: 14px; font-weight: 500;">Name</td><td style="padding: 12px 0; border-bottom: 1px solid #f8fafc; font-weight: 700; text-align: right; color: ${textDark};">${_esc(request.employeeName)}</td></tr>
        <tr><td style="padding: 12px 0; border-bottom: 1px solid #f8fafc; color: ${textLight}; font-size: 14px; font-weight: 500;">Phone</td><td style="padding: 12px 0; border-bottom: 1px solid #f8fafc; font-weight: 700; text-align: right; color: ${textDark};">${_esc(request.phoneNumber)}</td></tr>
        <tr><td style="padding: 12px 0; border-bottom: 1px solid #f8fafc; color: ${textLight}; font-size: 14px; font-weight: 500;">Email</td><td style="padding: 12px 0; border-bottom: 1px solid #f8fafc; font-weight: 700; text-align: right; color: ${textDark};">${_esc(request.publicEmail)}</td></tr>
        <tr><td style="padding: 12px 0; border-bottom: 1px solid #f8fafc; color: ${textLight}; font-size: 14px; font-weight: 500;">Serial</td><td style="padding: 12px 0; border-bottom: 1px solid #f8fafc; font-weight: 700; text-align: right; color: ${primaryRed};">${_esc(request.serialNumber)}</td></tr>
        <tr><td style="padding: 12px 0; border-bottom: 1px solid #f8fafc; color: ${textLight}; font-size: 14px; font-weight: 500;">Raffle</td><td style="padding: 12px 0; border-bottom: 1px solid #f8fafc; font-weight: 700; text-align: right; color: ${textDark};">${_esc(request.marketingInterest)}</td></tr>
        ${request.experience ? `<tr><td style="padding: 12px 0; border-bottom: 1px solid #f8fafc; color: ${textLight}; font-size: 14px; font-weight: 500;">Experience</td><td style="padding: 12px 0; border-bottom: 1px solid #f8fafc; font-weight: 700; text-align: right; color: ${textDark};">${_esc(request.experience)}</td></tr>` : ''}
      </table>
      ${request.receiptUrl ? `<div style="margin-top: 20px; text-align: center;"><a href="${request.receiptUrl}" style="color: ${primaryRed}; font-weight: 700; text-decoration: none;">View Receipt</a></div>` : ''}
      ${request.boxPhotoUrl ? `<div style="margin-top: 10px; text-align: center;"><a href="${request.boxPhotoUrl}" style="color: ${primaryRed}; font-weight: 700; text-decoration: none;">View Box Photo</a></div>` : ''}
    </div>
  `;

  if (type === 'purchaseRequest' || type === 'reminder') {
    return `
      <html>
        <body style="${commonStyles}">
          <div style="max-width: 600px; margin: 0 auto;">
            ${header}
            ${type === 'reminder' ? '<div style="background-color: #fff1f2; color: #be123c; padding: 15px 40px; text-align: center; font-weight: 800;">⚠️ Reminder: Action Required</div>' : ''}
            ${submissionDetails(request)}
            <div style="padding: 40px; text-align: center; background-color: ${containerBg}; border-radius: 0 0 16px 16px; border-top: 1px solid #f1f5f9;">
              <p style="color: ${textLight}; font-size: 13px;">This is a copy of your submission for your records.</p>
            </div>
            ${footer}
          </div>
        </body>
      </html>
    `;
  }

  if (type === 'newSubmissionNotification') {
    return `
      <html>
        <body style="${commonStyles}">
          <div style="max-width: 600px; margin: 0 auto;">
            ${header}
            <div style="padding: 40px; text-align: center; background-color: ${containerBg};">
              <h2 style="color: ${textDark}; margin: 0;">New Receipt Submission</h2>
              <p style="color: ${textLight};">A new submission has been received for review.</p>
            </div>
            ${submissionDetails(request)}
            <div style="padding: 40px; text-align: center; background-color: ${containerBg}; border-radius: 0 0 16px 16px; border-top: 1px solid #f1f5f9;">
              <a href="${BASE_URL}/dashboard/responses" style="background: ${textDark}; color: white; padding: 14px 28px; text-decoration: none; border-radius: 12px; font-weight: 800; display: inline-block;">Manage Submissions</a>
            </div>
            ${footer}
          </div>
        </body>
      </html>
    `;
  }

  if (type === 'responseNotification') {
    const statusColor = request.status === 'Confirmed' ? '#16a34a' : (request.status === 'Rejected' ? '#dc2626' : '#ca8a04');
    return `
      <html>
        <body style="${commonStyles}">
          <div style="max-width: 600px; margin: 0 auto;">
            ${header}
            <div style="padding: 40px; text-align: center; background-color: ${containerBg};">
              <div style="margin-bottom: 20px; display: inline-block; padding: 10px 20px; border-radius: 99px; background-color: ${statusColor}10;">
                <span style="color: ${statusColor}; font-weight: 800;">Status: ${request.status}</span>
              </div>
              <h2 style="color: ${textDark}; margin: 0;">Response Received</h2>
              <p style="color: ${textLight};">Staff member <strong>${_esc(request.employeeName)}</strong> has responded.</p>
            </div>
            ${submissionDetails(request)}
            <div style="padding: 40px; text-align: center; background-color: ${containerBg}; border-radius: 0 0 16px 16px; border-top: 1px solid #f1f5f9;">
              <a href="${BASE_URL}/dashboard" style="background: ${textDark}; color: white; padding: 14px 28px; text-decoration: none; border-radius: 12px; font-weight: 800; display: inline-block;">Open Dashboard</a>
            </div>
            ${footer}
          </div>
        </body>
      </html>
    `;
  }

  if (type === 'registrationReceivedUser') {
    return `
      <html>
        <body style="${commonStyles}">
          <div style="max-width: 600px; margin: 0 auto;">
            ${header}
            <div style="padding: 40px; text-align: center; background-color: ${containerBg}; border-radius: 0 0 16px 16px;">
              <h2 style="color: ${textDark}; margin: 0;">Registration Received</h2>
              <p style="color: ${textLight}; margin-top: 15px;">Hello <strong>${_esc(user.name || user.email)}</strong>,</p>
              <p style="color: ${textLight}; line-height: 1.8;">Your account has been created and is pending approval.</p>
            </div>
            ${footer}
          </div>
        </body>
      </html>
    `;
  }

  if (type === 'newRegistrationAdmin') {
    return `
      <html>
        <body style="${commonStyles}">
          <div style="max-width: 600px; margin: 0 auto;">
            ${header}
            <div style="padding: 40px; text-align: center; background-color: ${containerBg};">
              <h2 style="color: ${textDark}; margin: 0;">Action Required: Approve User</h2>
              <p style="color: ${textLight};">A new user has registered and is waiting for approval.</p>
            </div>
            <div style="padding: 30px 40px; background-color: #f8fafc; border-top: 1px solid #f1f5f9;">
              <table style="width: 100%;">
                <tr><td style="color: ${textLight}; font-weight: 700;">Name</td><td style="text-align: right; color: ${textDark};">${_esc(user.name)}</td></tr>
                <tr><td style="color: ${textLight}; font-weight: 700;">Email</td><td style="text-align: right; color: ${textDark};">${_esc(user.email)}</td></tr>
              </table>
            </div>
            <div style="padding: 40px; text-align: center; background-color: ${containerBg}; border-radius: 0 0 16px 16px;">
              <a href="${BASE_URL}/dashboard/staff" style="background: ${primaryRed}; color: white; padding: 14px 28px; text-decoration: none; border-radius: 12px; font-weight: 800; display: inline-block;">Manage Access</a>
            </div>
            ${footer}
          </div>
        </body>
      </html>
    `;
  }

  if (type === 'roleUpdated') {
    const roleCapitalized = data.role.charAt(0).toUpperCase() + data.role.slice(1);
    const isPromotionFromPending = data.oldRole === 'pending';
    return `
      <html>
        <body style="${commonStyles}">
          <div style="max-width: 600px; margin: 0 auto;">
            ${header}
            <div style="padding: 40px; text-align: center; background-color: ${containerBg};">
              <h2 style="color: ${textDark}; margin: 0;">${isPromotionFromPending ? 'Welcome to the Portal' : 'Role Updated'}</h2>
              <p style="color: ${textLight}; margin-top: 15px;">Hello <strong>${_esc(data.userName || 'Team Member')}</strong>,</p>
              <p style="color: ${textLight};">${isPromotionFromPending ? 'Your registration has been approved.' : 'Your role has been updated.'} Your new role is <strong>${roleCapitalized}</strong>.</p>
            </div>
            <div style="padding: 40px; text-align: center; background-color: ${containerBg}; border-radius: 0 0 16px 16px; border-top: 1px solid #f1f5f9;">
              <a href="${BASE_URL}/dashboard" style="background: ${primaryRed}; color: white; padding: 14px 28px; text-decoration: none; border-radius: 12px; font-weight: 800; display: inline-block;">Go to Dashboard</a>
            </div>
            ${footer}
          </div>
        </body>
      </html>
    `;
  }

  if (type === 'purchaseRequestConfirmation') {
    return `
      <html>
        <body style="${commonStyles}">
          <div style="max-width: 600px; margin: 0 auto;">
            ${header}
            <div style="padding: 40px; text-align: center; background-color: ${containerBg};">
              <h2 style="color: ${textDark}; margin: 0;">Submission Received</h2>
              <p style="color: ${textLight}; margin-top: 15px;">Hello <strong>${_esc(request.employeeName)}</strong>,</p>
              <p style="color: ${textLight};">Thank you for your submission. Our team is reviewing it.</p>
            </div>
            ${submissionDetails(request)}
            <div style="padding: 40px; text-align: center; border-radius: 0 0 16px 16px; border-top: 1px solid #f1f5f9; background-color: ${containerBg};">
              <p style="color: ${textLight}; font-size: 13px;">Automated confirmation. No action required.</p>
            </div>
            ${footer}
          </div>
        </body>
      </html>
    `;
  }

  return '';
};

const sendEmail = async (to, type, data) => {
  if (!process.env.EMAIL_USER) {
    console.log(`[DEV] Mock sending email to ${to} for type ${type}`);
    return true;
  }

  const mailOptions = {
    from: `Huntsman Optics Portal <${process.env.EMAIL_USER}>`,
    to: to,
    subject: getSubject(type, data),
    html: getHtmlBody(type, data),
    attachments: [
      {
        filename: 'logo.png',
        path: path.join(__dirname, '../../frontend/public/assets/logo.png'),
        cid: 'logo'
      }
    ]
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to} [${type}]`);
    return true;
  } catch (error) {
    console.error('Email send failed:', error.message);
    throw error;
  }
};

module.exports = { sendEmail };
