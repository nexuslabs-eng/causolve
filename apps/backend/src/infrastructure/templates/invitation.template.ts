interface InvitationEmailContent {
  subject: string;
  text: string;
  html: string;
}

export const invitationTemplate = (
  inviterName: string,
  organizationName: string,
  inviteUrl: string,
): InvitationEmailContent => {
  const subject = `${inviterName} invited you to join ${organizationName} on Causolve`;

  const text = `Hi,\n\n${inviterName} has invited you to join ${organizationName} on Causolve. Accept the invite here: ${inviteUrl}\n\nThis link expires in 7 days. If you weren't expecting this, you can safely ignore this email.`;

  const html = `
    <div style="font-family: Arial, Helvetica, sans-serif; max-width: 480px; margin: 0 auto; border: 1px solid #e5e5ec; border-radius: 14px; overflow: hidden;">
      <div style="padding: 28px 32px; background-color: #0b0d13;">
        <span style="font-size: 20px; font-weight: 800; letter-spacing: -0.3px; color: #ffffff;">Resolve<span style="color: #8a7dff;">OS</span></span>
      </div>
      <div style="padding: 32px; background-color: #ffffff;">
        <p style="margin: 0 0 4px; font-size: 15px; color: #1b1e27;">Hi,</p>
        <p style="margin: 0 0 20px; font-size: 15px; color: #1b1e27;"><strong>${inviterName}</strong> has invited you to join <strong>${organizationName}</strong> on Causolve.</p>
        <div style="text-align: center; margin: 0 0 24px;">
          <a href="${inviteUrl}" style="display: inline-block; padding: 12px 28px; font-size: 14px; font-weight: 700; color: #ffffff; background-color: #6355e0; border-radius: 8px; text-decoration: none;">
            Accept invite
          </a>
        </div>
        <p style="margin: 0 0 20px; font-size: 14.5px; color: #1b1e27;">This link expires in 7 days. If you weren't expecting this, you can safely ignore this email.</p>
        <p style="margin: 0; font-size: 13px; color: #6b7280;">If the button doesn't work, copy and paste this link: ${inviteUrl}</p>
      </div>
    </div>
  `.trim();

  return { subject, text, html };
};
