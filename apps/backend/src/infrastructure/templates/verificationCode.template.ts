interface VerificationCodeEmailContent {
  subject: string;
  text: string;
  html: string;
}

export const verificationCodeTemplate = (
  fullName: string,
  code: string,
): VerificationCodeEmailContent => {
  const subject = 'Your Causolve verification code';

  const text = `Hi ${fullName},\n\nYour Causolve verification code is: ${code}\n\nEnter this code to confirm your email address and continue setting up your account. This code expires in 15 minutes.\n\nIf you didn't create a Causolve account, you can safely ignore this email.`;

  const html = `
    <div style="font-family: Arial, Helvetica, sans-serif; max-width: 480px; margin: 0 auto; border: 1px solid #e5e5ec; border-radius: 14px; overflow: hidden;">
      <div style="padding: 28px 32px; background-color: #0b0d13;">
        <span style="font-size: 20px; font-weight: 800; letter-spacing: -0.3px; color: #ffffff;">Causolve</span>
      </div>
      <div style="padding: 32px; background-color: #ffffff;">
        <p style="margin: 0 0 4px; font-size: 15px; color: #1b1e27;">Hi ${fullName},</p>
        <p style="margin: 0 0 20px; font-size: 15px; color: #1b1e27;">Your verification code is:</p>
        <div style="margin: 0 0 20px; padding: 16px 0; text-align: center; background-color: #f0f0f6; border-radius: 11px;">
          <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #1b1e27;">${code}</span>
        </div>
        <p style="margin: 0 0 20px; font-size: 14.5px; color: #1b1e27;">Enter this code to confirm your email address and continue setting up your account. This code expires in 15 minutes.</p>
        <p style="margin: 0; font-size: 13px; color: #6b7280;">If you didn't create a Causolve account, you can safely ignore this email.</p>
      </div>
    </div>
  `.trim();

  return { subject, text, html };
};
