interface PasswordChangedEmailContent {
  subject: string;
  text: string;
  html: string;
}

export const passwordChangedTemplate = (
  fullName: string,
  forgotPasswordUrl: string,
): PasswordChangedEmailContent => {
  const subject = 'Your Causolve password was changed';

  const text = `Hi ${fullName},\n\nYour Causolve password was just changed. If this was you, no action is needed.\n\nIf you didn't make this change, secure your account immediately: ${forgotPasswordUrl}`;

  const html = `
    <div style="font-family: Arial, Helvetica, sans-serif; max-width: 480px; margin: 0 auto; border: 1px solid #e5e5ec; border-radius: 14px; overflow: hidden;">
      <div style="padding: 28px 32px; background-color: #0b0d13;">
        <span style="font-size: 20px; font-weight: 800; letter-spacing: -0.3px; color: #ffffff;">Causolve</span>
      </div>
      <div style="padding: 32px; background-color: #ffffff;">
        <h1 style="margin: 0 0 12px; font-size: 20px; font-weight: 800; color: #1b1e27;">Your password was changed</h1>
        <p style="margin: 0 0 20px; font-size: 15px; color: #1b1e27;">Hi ${fullName}, this confirms your Causolve password was just changed. If this was you, no action is needed.</p>
        <div style="margin: 0 0 24px; padding: 16px 20px; background-color: #fdf0ee; border: 1px solid #f6d9d3; border-radius: 10px;">
          <p style="margin: 0 0 10px; font-size: 14px; font-weight: 700; color: #9a3b2e;">Wasn't you?</p>
          <p style="margin: 0 0 14px; font-size: 13.5px; color: #7a3a30;">Secure your account immediately by resetting your password below.</p>
          <a href="${forgotPasswordUrl}" style="display: inline-block; padding: 10px 20px; font-size: 13.5px; font-weight: 700; color: #ffffff; background-color: #c4473a; border-radius: 8px; text-decoration: none;">
            Reset your password
          </a>
        </div>
        <p style="margin: 0 0 6px; font-size: 13px; color: #6b7280;">Or copy and paste this link into your browser:</p>
        <p style="margin: 0; font-size: 13px; word-break: break-all;"><a href="${forgotPasswordUrl}" style="color: #6355e0;">${forgotPasswordUrl}</a></p>
      </div>
      <div style="padding: 18px 32px; background-color: #fafafa; border-top: 1px solid #e5e5ec;">
        <p style="margin: 0; font-size: 12px; color: #9ca3af;">Causolve — evidence-aware incident investigation.</p>
      </div>
    </div>
  `.trim();

  return { subject, text, html };
};
