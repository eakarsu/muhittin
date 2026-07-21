const nodemailer = require('nodemailer');

// Email is opt-in. Missing SMTP configuration never triggers an external test-account request.
let transporter = null;

async function getTransporter() {
  if (transporter) return transporter;

  if (process.env.SMTP_HOST) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  } else return null;
  return transporter;
}

const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@multiverse-consulting.com';
const FIRM_NAME = 'Multiverse Consulting Group';

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

async function sendEmail(to, subject, html) {
  try {
    const t = await getTransporter();
    if (!t) return { skipped: true, reason: 'SMTP is not configured' };
    if (typeof to !== 'string' || to.length > 255 || /[\r\n]/.test(to)) throw new TypeError('Invalid email recipient');
    if (typeof subject !== 'string' || subject.length > 200 || /[\r\n]/.test(subject)) throw new TypeError('Invalid email subject');
    const info = await t.sendMail({
      from: `"${FIRM_NAME}" <${FROM_EMAIL}>`,
      to,
      subject,
      html,
      disableFileAccess: true,
      disableUrlAccess: true,
    });
    console.log(`Email sent: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error('Email error:', err.message);
    return null;
  }
}

// Template emails
async function sendConsultationConfirmation(to, name, serviceInterest, preferredDate) {
  const subject = `Consultation Request Received - ${FIRM_NAME}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #0f172a; padding: 32px; text-align: center;">
        <h1 style="color: #14b8a6; margin: 0; font-size: 24px;">${FIRM_NAME}</h1>
      </div>
      <div style="padding: 32px; background: #ffffff;">
        <h2 style="color: #0f172a;">Thank You, ${name}</h2>
        <p style="color: #475569; line-height: 1.6;">We've received your consultation request${serviceInterest ? ` regarding <strong>${serviceInterest}</strong>` : ''}.</p>
        ${preferredDate ? `<p style="color: #475569;">Preferred date: <strong>${preferredDate}</strong></p>` : ''}
        <p style="color: #475569; line-height: 1.6;">A member of our team will be in touch within 24 hours to confirm your meeting.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
        <p style="color: #94a3b8; font-size: 13px;">Boutique Strategy & Execution Advisory</p>
      </div>
    </div>
  `;
  return sendEmail(to, subject, html);
}

async function sendCandidateWelcome(to, name) {
  const subject = `Welcome to Our Talent Network - ${FIRM_NAME}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #0f172a; padding: 32px; text-align: center;">
        <h1 style="color: #14b8a6; margin: 0; font-size: 24px;">${FIRM_NAME}</h1>
      </div>
      <div style="padding: 32px; background: #ffffff;">
        <h2 style="color: #0f172a;">Welcome, ${name}</h2>
        <p style="color: #475569; line-height: 1.6;">Thank you for joining our executive talent network. Your profile has been added to our database and will be considered for relevant opportunities.</p>
        <p style="color: #475569; line-height: 1.6;">Our talent team will review your profile and may reach out for additional information or to discuss current opportunities that match your expertise.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
        <p style="color: #94a3b8; font-size: 13px;">Boutique Strategy & Execution Advisory</p>
      </div>
    </div>
  `;
  return sendEmail(to, subject, html);
}

async function sendPartnerInquiryConfirmation(to, contactName, companyName) {
  const subject = `Partnership Inquiry Received - ${FIRM_NAME}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #0f172a; padding: 32px; text-align: center;">
        <h1 style="color: #14b8a6; margin: 0; font-size: 24px;">${FIRM_NAME}</h1>
      </div>
      <div style="padding: 32px; background: #ffffff;">
        <h2 style="color: #0f172a;">Thank You, ${contactName}</h2>
        <p style="color: #475569; line-height: 1.6;">We've received your partnership inquiry from <strong>${companyName}</strong>.</p>
        <p style="color: #475569; line-height: 1.6;">Our partnerships team will review your submission and get back to you within 48 hours to discuss potential collaboration.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
        <p style="color: #94a3b8; font-size: 13px;">Boutique Strategy & Execution Advisory</p>
      </div>
    </div>
  `;
  return sendEmail(to, subject, html);
}

async function sendOpportunityConfirmation(to, contactName) {
  const subject = `Opportunity Submission Received - ${FIRM_NAME}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #0f172a; padding: 32px; text-align: center;">
        <h1 style="color: #14b8a6; margin: 0; font-size: 24px;">${FIRM_NAME}</h1>
      </div>
      <div style="padding: 32px; background: #ffffff;">
        <h2 style="color: #0f172a;">Thank You, ${escapeHtml(contactName)}</h2>
        <p style="color: #475569; line-height: 1.6;">We've received your opportunity submission and our team will review it promptly.</p>
        <p style="color: #475569; line-height: 1.6;">If the opportunity aligns with our expertise, we'll reach out within 48 hours to discuss next steps.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
        <p style="color: #94a3b8; font-size: 13px;">Boutique Strategy & Execution Advisory</p>
      </div>
    </div>
  `;
  return sendEmail(to, subject, html);
}

async function sendPaymentReceipt(to, name, amount, service) {
  const subject = `Payment Confirmation - ${FIRM_NAME}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #0f172a; padding: 32px; text-align: center;">
        <h1 style="color: #14b8a6; margin: 0; font-size: 24px;">${FIRM_NAME}</h1>
      </div>
      <div style="padding: 32px; background: #ffffff;">
        <h2 style="color: #0f172a;">Payment Received</h2>
        <p style="color: #475569; line-height: 1.6;">Dear ${name},</p>
        <p style="color: #475569; line-height: 1.6;">We've received your payment of <strong>$${parseFloat(amount).toLocaleString()}</strong> for <strong>${service}</strong>.</p>
        <p style="color: #475569; line-height: 1.6;">Our team will begin the onboarding process and reach out to schedule your kickoff meeting.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
        <p style="color: #94a3b8; font-size: 13px;">Boutique Strategy & Execution Advisory</p>
      </div>
    </div>
  `;
  return sendEmail(to, subject, html);
}

async function sendMeetingPreparation(to, name, title, date, time) {
  const subject = `Meeting Preparation: ${title} - ${FIRM_NAME}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #0f172a; padding: 32px; text-align: center;">
        <h1 style="color: #14b8a6; margin: 0; font-size: 24px;">${FIRM_NAME}</h1>
      </div>
      <div style="padding: 32px; background: #ffffff;">
        <h2 style="color: #0f172a;">Upcoming Meeting</h2>
        <p style="color: #475569; line-height: 1.6;">Dear ${name},</p>
        <p style="color: #475569; line-height: 1.6;">This is a reminder for your upcoming meeting:</p>
        <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p style="margin: 4px 0; color: #0f172a;"><strong>${title}</strong></p>
          <p style="margin: 4px 0; color: #475569;">Date: ${date}</p>
          <p style="margin: 4px 0; color: #475569;">Time: ${time}</p>
        </div>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
        <p style="color: #94a3b8; font-size: 13px;">Boutique Strategy & Execution Advisory</p>
      </div>
    </div>
  `;
  return sendEmail(to, subject, html);
}

module.exports = {
  escapeHtml,
  sendEmail,
  sendConsultationConfirmation,
  sendCandidateWelcome,
  sendPartnerInquiryConfirmation,
  sendOpportunityConfirmation,
  sendPaymentReceipt,
  sendMeetingPreparation
};
