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
        <h1 style="margin: 0 0 12px; font-size: 20px; font-weight: 800; color: #1b1e27;">You're verified, ${fullName.split(" ")[0]} 🎉</h1>
        <p style="margin: 0 0 20px; font-size: 15px; color: #1b1e27;">Your email is confirmed and your Causolve account is ready. Let's get your workspace set up.</p>
        <div style="text-align: center; margin: 0 0 24px;">
          <a href="${continueUrl}" style="display: inline-block; padding: 12px 28px; font-size: 14px; font-weight: 700; color: #ffffff; background-color: #6355e0; border-radius: 8px; text-decoration: none;">
            Continue setup
          </a>
        </div>
        <p style="margin: 0 0 6px; font-size: 13px; color: #6b7280;">Or copy and paste this link into your browser:</p>
        <p style="margin: 0; font-size: 13px; word-break: break-all;"><a href="${continueUrl}" style="color: #6355e0;">${continueUrl}</a></p>
      </div>
      <div style="padding: 18px 32px; background-color: #fafafa; border-top: 1px solid #e5e5ec;">
        <p style="margin: 0; font-size: 12px; color: #9ca3af;">Causolve — evidence-aware incident investigation.</p>
      </div>
    </div>
  `.trim();

  return { subject, text, html };
};
