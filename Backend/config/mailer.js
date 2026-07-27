const nodemailer = require("nodemailer");

// Gmail SMTP. SMTP_PASS must be a Google "App Password" (16 characters), not
// the account password — Google rejects plain passwords for SMTP.
//
// If the mail credentials are missing the transport is left null and callers
// fall back gracefully (see sendOtpEmail below), so a misconfigured .env
// degrades to a clear error instead of crashing the server on boot.
let transporter = null;

const user = (process.env.SMTP_USER || "").trim();
// Google displays app passwords in four groups of four ("abcd efgh ijkl mnop").
// Pasting that verbatim is the norm, so strip the spaces rather than making
// the admin remember to remove them. Surrounding quotes are stripped too, in
// case the value was quoted in .env.
const pass = (process.env.SMTP_PASS || "")
    .trim()
    .replace(/^["']|["']$/g, "")
    .replace(/\s+/g, "");

if (user && pass) {
    transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user, pass },
    });

    // Check the credentials at boot rather than waiting for the first reset
    // attempt to fail — a revoked app password is otherwise invisible until
    // the moment it is actually needed.
    transporter
        .verify()
        .then(() => console.log(`[mailer] Ready — reset emails will be sent from ${user}`))
        .catch((err) => {
            if (err.code === "EAUTH") {
                console.warn(
                    "[mailer] Gmail rejected SMTP_USER/SMTP_PASS. Generate a new App Password\n" +
                    "         at https://myaccount.google.com/apppasswords and update .env."
                );
            } else {
                console.warn(`[mailer] Could not reach Gmail (${err.code || err.message}).`);
            }
        });
} else {
    const missing = [!user && "SMTP_USER", !pass && "SMTP_PASS"]
        .filter(Boolean)
        .join(" and ");
    console.warn(
        `[mailer] ${missing} missing from .env — password reset emails are disabled.\n` +
        "         Note: .env is only read at startup, so restart the server after editing it."
    );
}

const isMailConfigured = () => !!transporter;

/**
 * Sends the one-time code used to reset the admin password.
 * @param {string} to      recipient address
 * @param {string} code    the 6-digit code, in plain text
 * @param {number} minutes how long the code stays valid, for the copy
 */
const sendOtpEmail = async (to, code, minutes) => {
    if (!transporter) {
        throw new Error("Email is not configured on the server");
    }

    const html = `
    <div style="font-family:Segoe UI,Arial,sans-serif;background:#021c1e;padding:32px;color:#eaf7f8">
      <div style="max-width:480px;margin:0 auto;background:#032c2f;border:1px solid rgba(126,249,255,.2);border-radius:16px;padding:32px">
        <h2 style="margin:0 0 8px;color:#0ad0dc">Password reset</h2>
        <p style="margin:0 0 24px;color:#a9c9cc;font-size:14px">
          Use this code to reset your portfolio admin password.
        </p>
        <div style="font-size:34px;font-weight:700;letter-spacing:10px;text-align:center;
                    padding:18px;border-radius:12px;background:rgba(10,208,220,.12);
                    border:1px solid rgba(126,249,255,.28);color:#7ef9ff">
          ${code}
        </div>
        <p style="margin:24px 0 0;color:#7ba1a6;font-size:13px">
          The code expires in ${minutes} minutes. If you didn't request this,
          you can safely ignore this email — your password stays unchanged.
        </p>
      </div>
    </div>`;

    await transporter.sendMail({
        from: `"Portfolio Admin" <${user}>`,
        to,
        subject: `${code} is your password reset code`,
        text: `Your password reset code is ${code}. It expires in ${minutes} minutes.`,
        html,
    });
};

module.exports = { sendOtpEmail, isMailConfigured };
