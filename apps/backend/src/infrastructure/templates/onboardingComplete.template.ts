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
        <h1 style="margin: 0 0 12px; font-size: 20px; font-weight: 800; color: #1b1e27;">You're all set, ${fullName.split(" ")[0]}</h1>
        <p style="margin: 0 0 20px; font-size: 15px; color: #1b1e27;">Your profile is complete and your workspace is ready to go. From here you can invite your team, connect your services, and start investigating incidents.</p>
        <div style="text-align: center; margin: 0 0 24px;">
          <a href="${dashboardUrl}" style="display: inline-block; padding: 12px 28px; font-size: 14px; font-weight: 700; color: #ffffff; background-color: #6355e0; border-radius: 8px; text-decoration: none;">
            Go to dashboard
          </a>
        </div>
        <p style="margin: 0 0 6px; font-size: 13px; color: #6b7280;">Or copy and paste this link into your browser:</p>
        <p style="margin: 0; font-size: 13px; word-break: break-all;"><a href="${dashboardUrl}" style="color: #6355e0;">${dashboardUrl}</a></p>
      </div>
      <div style="padding: 18px 32px; background-color: #fafafa; border-top: 1px solid #e5e5ec;">
        <p style="margin: 0; font-size: 12px; color: #9ca3af;">Causolve — evidence-aware incident investigation.</p>
      </div>
    </div>
  `.trim();

  return { subject, text, html };
};
