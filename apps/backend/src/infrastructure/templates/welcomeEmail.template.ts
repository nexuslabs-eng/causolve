interface WelcomeEmailContent {
  subject: string;
  text: string;
  html: string;
}

export const welcomeEmailTemplate = (fullName: string, continueUrl: string): WelcomeEmailContent => {
  const subject = 'Welcome to Causolve';

  const text = `Hi ${fullName},\n\nYour email is verified - welcome to Causolve.\n\nContinue setting up your workspace here: ${continueUrl}`;

  const html = `
    <div style="font-family: Arial, Helvetica, sans-serif; max-width: 480px; margin: 0 auto; border: 1px solid #e5e5ec; border-radius: 14px; overflow: hidden;">
      <div style="padding: 28px 32px; background-color: #0b0d13;">
        <span style="font-size: 20px; font-weight: 800; letter-spacing: -0.3px; color: #ffffff;">Causolve</span>
      </div>
      <div style="padding: 32px; background-color: #ffffff;">
        <p style="margin: 0 0 4px; font-size: 15px; color: #1b1e27;">Hi ${fullName},</p>
        <p style="margin: 0 0 20px; font-size: 15px; color: #1b1e27;">Your email is verified - welcome to Causolve.</p>
        <div style="text-align: center; margin: 0 0 24px;">
          <a href="${continueUrl}" style="display: inline-block; padding: 12px 28px; font-size: 14px; font-weight: 700; color: #ffffff; background-color: #6355e0; border-radius: 8px; text-decoration: none;">
            Continue setup
          </a>
        </div>
        <p style="margin: 0; font-size: 13px; color: #6b7280;">If the button doesn't work, copy and paste this link: ${continueUrl}</p>
      </div>
    </div>
  `.trim();

  return { subject, text, html };
};
