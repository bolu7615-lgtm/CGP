const brevo = require('@getbrevo/brevo');
const prisma = require('../config/database');

// ── Brevo API Setup ─────────────────────────────────────────────
const defaultClient = brevo.ApiClient.instance;
const apiKeyAuth = defaultClient.authentications['api-key'];
apiKeyAuth.apiKey = process.env.BREVO_API_KEY;

const apiInstance = new brevo.TransactionalEmailsApi();

// Extract clean email from env (handles cases like "CGP <fxsol76@gmail.com>")
function extractEmail(input) {
  if (!input) return 'noreply@capitalgrowthprogram.com';
  // Match email inside < > or standalone
  const match = input.match(/<([^>]+)>/);
  return match ? match[1].trim() : input.trim();
}

const senderEmail = extractEmail(process.env.BREVO_SENDER_EMAIL);
const senderName = process.env.BREVO_SENDER_NAME || 'Capital Growth Program';

/**
 * Send a transactional email using Brevo
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} htmlContent - HTML email body
 * @param {string} textContent - Plain text fallback
 */
async function sendEmail(to, subject, htmlContent, textContent = '') {
  try {
    // Validate inputs
    if (!to || !to.includes('@')) {
      console.error(`❌ Invalid recipient email: ${to}`);
      return { success: false, error: 'Invalid recipient email' };
    }
    if (!subject) {
      console.error(`❌ Email subject is required`);
      return { success: false, error: 'Email subject is required' };
    }
    if (!htmlContent && !textContent) {
      console.error(`❌ Email content is required`);
      return { success: false, error: 'Email content is required' };
    }

    // Validate sender email
    if (!senderEmail || !senderEmail.includes('@')) {
      console.error(`❌ Invalid sender email: '${senderEmail}'. Check BREVO_SENDER_EMAIL in .env`);
      return { success: false, error: 'Invalid sender email configuration' };
    }

    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = htmlContent || '<p>' + (textContent || '') + '</p>';
    sendSmtpEmail.textContent = textContent || stripHtml(htmlContent || '');
    sendSmtpEmail.sender = { name: senderName, email: senderEmail };
    sendSmtpEmail.to = [{ email: to }];

    // Log what we're sending (for debugging)
    console.log(`📧 Sending email to: ${to}`);
    console.log(`   Subject: ${subject}`);
    console.log(`   Sender: ${senderName} <${senderEmail}>`);
    console.log(`   (Make sure '${senderEmail}' is verified in your Brevo dashboard)`);

    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(`✅ Email sent to ${to}: ${subject}`);
    return { success: true, messageId: response.messageId };
  } catch (error) {
    console.error(`❌ Email failed to ${to}:`);
    console.error('   Error:', error.message);
    if (error.response) {
      console.error('   Response body:', JSON.stringify(error.response.body, null, 2));
      console.error('   Response text:', error.response.text);
    }
    return { success: false, error: error.message, details: error.response?.body };
  }
}

/**
 * Send email using a template from database
 * @param {string} to - Recipient email
 * @param {string} templateName - Name of email template
 * @param {Object} variables - Variables to replace in template
 */
async function sendTemplateEmail(to, templateName, variables = {}) {
  try {
    const template = await prisma.emailTemplate.findUnique({
      where: { name: templateName },
    });

    if (!template) {
      console.error(`❌ Email template not found in DB: ${templateName}`);
      console.error(`   Make sure you have a template named '${templateName}' in your emailTemplate table.`);
      return { success: false, error: `Template '${templateName}' not found in database` };
    }

    if (!template.isActive) {
      console.error(`❌ Email template inactive: ${templateName}`);
      return { success: false, error: 'Template inactive' };
    }

    let subject = template.subject || '';
    let body = template.body || '';

    if (!body.trim()) {
      console.error(`❌ Email template body is empty: ${templateName}`);
      return { success: false, error: 'Template body is empty' };
    }

    // Replace variables in subject and body
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      subject = subject.replace(regex, value || '');
      body = body.replace(regex, value || '');
    }

    return await sendEmail(to, subject, body);
  } catch (error) {
    console.error(`❌ Template email failed:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Send welcome email with verification code
 */
async function sendWelcomeEmail(email, firstName, code) {
  return await sendTemplateEmail(email, 'WELCOME', {
    firstName,
    code,
  });
}

/**
 * Send login OTP email
 */
async function sendLoginOtpEmail(email, firstName, code) {
  return await sendTemplateEmail(email, 'LOGIN_OTP', {
    firstName,
    code,
  });
}

/**
 * Send deposit notification
 */
async function sendDepositEmail(email, firstName, amount, cryptoCurrency, status) {
  return await sendTemplateEmail(email, 'DEPOSIT_RECEIVED', {
    firstName,
    amount: parseFloat(amount).toFixed(2),
    cryptoCurrency,
    status,
  });
}

/**
 * Send withdrawal processed notification
 */
async function sendWithdrawalEmail(email, firstName, amount, cryptoCurrency, txHash, walletAddress) {
  return await sendTemplateEmail(email, 'WITHDRAWAL_PROCESSED', {
    firstName,
    amount: parseFloat(amount).toFixed(2),
    cryptoCurrency,
    txHash: txHash || 'N/A',
    walletAddress: walletAddress || 'N/A',
  });
}

/**
 * Send KYC approved notification
 */
async function sendKycApprovedEmail(email, firstName) {
  return await sendTemplateEmail(email, 'KYC_APPROVED', { firstName });
}

/**
 * Send KYC rejected notification
 */
async function sendKycRejectedEmail(email, firstName, reason) {
  return await sendTemplateEmail(email, 'KYC_REJECTED', {
    firstName,
    reason,
  });
}

/**
 * Send daily profit notification
 */
async function sendDailyProfitEmail(email, firstName, amount, planName, investmentAmount) {
  return await sendTemplateEmail(email, 'DAILY_PROFIT', {
    firstName,
    amount: parseFloat(amount).toFixed(2),
    planName,
    investmentAmount: parseFloat(investmentAmount).toFixed(2),
  });
}

/**
 * Send investment started notification
 */
async function sendInvestmentStartedEmail(email, firstName, amount, planName, dailyRoi, durationDays, expectedReturn) {
  return await sendTemplateEmail(email, 'INVESTMENT_STARTED', {
    firstName,
    amount: parseFloat(amount).toFixed(2),
    planName,
    dailyRoi,
    durationDays,
    expectedReturn: parseFloat(expectedReturn).toFixed(2),
  });
}

/**
 * Send referral bonus notification
 */
async function sendReferralBonusEmail(email, firstName, amount, level, referredUserName) {
  return await sendTemplateEmail(email, 'REFERRAL_BONUS', {
    firstName,
    amount: parseFloat(amount).toFixed(2),
    level,
    referredUserName,
  });
}

/**
 * Send password changed notification
 */
async function sendPasswordChangedEmail(email, firstName) {
  const date = new Date().toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  return await sendTemplateEmail(email, 'PASSWORD_CHANGED', {
    firstName,
    date,
  });
}

/**
 * Send security alert for suspicious activity
 */
async function sendSecurityAlertEmail(email, firstName, activity, ipAddress, device) {
  const html = `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: #0B0E14; padding: 30px; text-align: center;">
    <h1 style="color: #F5A623;">Capital Growth Program</h1>
  </div>
  <div style="padding: 30px;">
    <h2 style="color: #ef4444;">🚨 Security Alert</h2>
    <p>Hi ${firstName},</p>
    <p>We detected suspicious activity on your account:</p>
    <div style="background: #fef2f2; border: 1px solid #ef4444; padding: 15px; border-radius: 8px; margin: 15px 0;">
      <p><strong>Activity:</strong> ${activity}</p>
      <p><strong>IP Address:</strong> ${ipAddress}</p>
      <p><strong>Device:</strong> ${device}</p>
      <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
    </div>
    <p>If this wasn't you, please change your password immediately and contact support.</p>
  </div>
</body>
</html>`;

  return await sendEmail(email, '🚨 Security Alert - Capital Growth Program', html);
}

// Helper: Strip HTML tags for plain text
function stripHtml(html) {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

/**
 * Send notification that all plans are locked except Elite
 * Triggered when user's total deposits reach $4,000+
 */
async function sendPlansLockedEmail(email, firstName, totalDeposited) {
  const html = `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0B0E14; color: #fff;">
  <div style="background: #0B0E14; padding: 30px; text-align: center; border-bottom: 2px solid #F5A623;">
    <h1 style="color: #F5A623; margin: 0;">Capital Growth Program</h1>
  </div>
  <div style="padding: 30px;">
    <h2 style="color: #F5A623; margin-top: 0;">🎯 Elite Plan Unlocked!</h2>
    <p>Hi ${firstName},</p>
    <p>Congratulations! Your total deposits have reached <strong style="color: #F5A623;">$${parseFloat(totalDeposited).toLocaleString()}</strong>.</p>

    <div style="background: #111827; border: 1px solid #1f2937; padding: 20px; border-radius: 12px; margin: 20px 0;">
      <h3 style="color: #F5A623; margin-top: 0;">All Other Plans Are Now Locked</h3>
      <p style="margin-bottom: 0;">All other investment plans have been completely booked. The only available plan is now the <strong style="color: #F5A623;">Elite Plan ($40,000)</strong>.</p>
    </div>

    <div style="background: #111827; border: 1px solid #1f2937; padding: 20px; border-radius: 12px; margin: 20px 0;">
      <h3 style="color: #F5A623; margin-top: 0;">Elite Plan Benefits</h3>
      <ul style="padding-left: 20px; line-height: 1.8;">
        <li>2.5% Daily ROI</li>
        <li>$1,000 Daily Profit</li>
        <li>60-Day Duration</li>
        <li>Full Principal Return</li>
        <li>Total Return: $100,000</li>
      </ul>
    </div>

    <p>You have <strong>9 months</strong> to fully fund the Elite Plan. Continue depositing to reach your $40,000 target!</p>

    <div style="text-align: center; margin-top: 30px;">
      <a href="${process.env.CLIENT_URL || 'https://capitalgrowthprogram.com'}/investments" 
         style="background: #F5A623; color: #0B0E14; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
        View Elite Plan
      </a>
    </div>
  </div>
  <div style="padding: 20px; text-align: center; border-top: 1px solid #1f2937; color: #6b7280; font-size: 12px;">
    <p>Capital Growth Program &copy; 2026</p>
  </div>
</body>
</html>`;

  return await sendEmail(
    email,
    '🎯 Elite Plan Unlocked - Capital Growth Program',
    html,
    `Hi ${firstName}, Congratulations! Your total deposits have reached $${parseFloat(totalDeposited).toLocaleString()}. All other investment plans have been completely booked. The only available plan is now the Elite Plan ($40,000). You have 9 months to fully fund the Elite Plan. Continue depositing to reach your $40,000 target!`
  );
}

module.exports = {
  sendEmail,
  sendTemplateEmail,
  sendWelcomeEmail,
  sendLoginOtpEmail,
  sendDepositEmail,
  sendWithdrawalEmail,
  sendKycApprovedEmail,
  sendKycRejectedEmail,
  sendDailyProfitEmail,
  sendInvestmentStartedEmail,
  sendReferralBonusEmail,
  sendPasswordChangedEmail,
  sendSecurityAlertEmail,
  sendPlansLockedEmail,
};