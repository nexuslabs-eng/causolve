interface InvitationEmailContent {
  subject: string;
  text: string;
  html: string;
}

const formatEnumLabel = (value: string): string =>
  value
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");

export const invitationTemplate = (
  inviterName: string,
  organizationName: string,
  role: string,
  jobRole: string,
  inviteUrl: string,
): InvitationEmailContent => {
  const roleLabel = formatEnumLabel(role);
  const jobRoleLabel = formatEnumLabel(jobRole);
  const subject = `${inviterName} invited you to join ${organizationName} on Causolve`;

  const text = `Hi,\n\n${inviterName} has invited you to join ${organizationName} on Causolve as ${roleLabel} (${jobRoleLabel}).\n\nAccept the invite here: ${inviteUrl}\n\nThis link expires in 7 days. If you weren't expecting this, you can safely ignore this email.`;

  const html = `
    <div style="font-family: Arial, Helvetica, sans-serif; max-width: 480px; margin: 0 auto; border: 1px solid #e5e5ec; border-radius: 14px; overflow: hidden;">
      <div style="padding: 28px 32px; background-color: #0b0d13;">
        <span style="font-size: 20px; font-weight: 800; letter-spacing: -0.3px; color: #ffffff;">Causolve</span>
      </div>
      <div style="padding: 32px; background-color: #ffffff;">
        <h1 style="margin: 0 0 12px; font-size: 20px; font-weight: 800; color: #1b1e27;">You've been invited to join ${organizationName}</h1>
        <p style="margin: 0 0 20px; font-size: 15px; color: #1b1e27;">${inviterName} has invited you to collaborate with the ${organizationName} team on Causolve.</p>
        <div style="margin: 0 0 24px; padding: 16px 20px; background-color: #f4f4f8; border-radius: 10px;">
          <p style="margin: 0 0 2px; font-size: 11px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: #6b7280;">Workspace</p>
          <p style="margin: 0 0 14px; font-size: 15px; font-weight: 700; color: #1b1e27;">${organizationName}</p>
          <p style="margin: 0 0 2px; font-size: 11px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: #6b7280;">Role</p>
          <p style="margin: 0 0 14px; font-size: 15px; font-weight: 700; color: #1b1e27;">${roleLabel}</p>
          <p style="margin: 0 0 2px; font-size: 11px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: #6b7280;">Job Role</p>
          <p style="margin: 0; font-size: 15px; font-weight: 700; color: #1b1e27;">${jobRoleLabel}</p>
        </div>
        <div style="text-align: center; margin: 0 0 24px;">
          <a href="${inviteUrl}" style="display: inline-block; padding: 12px 28px; font-size: 14px; font-weight: 700; color: #ffffff; background-color: #6355e0; border-radius: 8px; text-decoration: none;">
            Accept invitation
          </a>
        </div>
        <p style="margin: 0 0 6px; font-size: 13px; color: #6b7280;">Or copy and paste this link into your browser:</p>
        <p style="margin: 0 0 20px; font-size: 13px; word-break: break-all;"><a href="${inviteUrl}" style="color: #6355e0;">${inviteUrl}</a></p>
        <p style="margin: 0; font-size: 13px; color: #6b7280;">This link expires in 7 days. If you weren't expecting this, you can safely ignore this email.</p>
      </div>
      <div style="padding: 18px 32px; background-color: #fafafa; border-top: 1px solid #e5e5ec;">
        <p style="margin: 0; font-size: 12px; color: #9ca3af;">Causolve — evidence-aware incident investigation.</p>
      </div>
    </div>
  `.trim();

  return { subject, text, html };
};
