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
        <h1 style="margin: 0 0 12px; font-size: 20px; font-weight: 800; color: #1b1e27;">Confirm your email</h1>
        <p style="margin: 0 0 20px; font-size: 15px; color: #1b1e27;">Hi ${fullName}, enter this code to confirm your email address and continue setting up your account.</p>
        <div style="margin: 0 0 20px; padding: 18px 0; text-align: center; background-color: #f4f4f8; border-radius: 10px;">
          <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #1b1e27; font-family: 'Courier New', monospace;">${code}</span>
        </div>
        <p style="margin: 0 0 20px; font-size: 13px; color: #6b7280; text-align: center;">This code expires in 15 minutes.</p>
        <p style="margin: 0; font-size: 13px; color: #6b7280;">If you didn't create a Causolve account, you can safely ignore this email.</p>
      </div>
      <div style="padding: 18px 32px; background-color: #fafafa; border-top: 1px solid #e5e5ec;">
        <p style="margin: 0; font-size: 12px; color: #9ca3af;">Causolve — evidence-aware incident investigation.</p>
      </div>
    </div>
  `.trim();

  return { subject, text, html };
};
