interface OnboardingCompleteEmailContent {
  subject: string;
  text: string;
  html: string;
}

export const onboardingCompleteTemplate = (
  fullName: string,
  dashboardUrl: string,
): OnboardingCompleteEmailContent => {
  const subject = "You're all set up on Causolve";

  const text = `Hi ${fullName},\n\nYour profile is complete and your Causolve workspace is ready to go.\n\nYou can view and manage your profile anytime from your dashboard: ${dashboardUrl}`;

  const html = `
    <div style="font-family: Arial, Helvetica, sans-serif; max-width: 480px; margin: 0 auto; border: 1px solid #e5e5ec; border-radius: 14px; overflow: hidden;">
      <div style="padding: 28px 32px; background-color: #0b0d13;">
        <span style="font-size: 20px; font-weight: 800; letter-spacing: -0.3px; color: #ffffff;">Causolve</span>
      </div>
      <div style="padding: 32px; background-color: #ffffff;">
        <p style="margin: 0 0 4px; font-size: 15px; color: #1b1e27;">Hi ${fullName},</p>
        <p style="margin: 0 0 20px; font-size: 15px; color: #1b1e27;">Your profile is complete and your Causolve workspace is ready to go.</p>
        <p style="margin: 0 0 20px; font-size: 14.5px; color: #1b1e27;">You can view and manage your profile anytime from your dashboard.</p>
        <div style="text-align: center; margin: 0 0 24px;">
          <a href="${dashboardUrl}" style="display: inline-block; padding: 12px 28px; font-size: 14px; font-weight: 700; color: #ffffff; background-color: #6355e0; border-radius: 8px; text-decoration: none;">
            Go to dashboard
          </a>
        </div>
        <p style="margin: 0; font-size: 13px; color: #6b7280;">If the button doesn't work, copy and paste this link: ${dashboardUrl}</p>
      </div>
    </div>
  `.trim();

  return { subject, text, html };
};
