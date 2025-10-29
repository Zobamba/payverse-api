import nodemailer from "nodemailer";
import hbs from "handlebars";
import fs from "fs";
import path from "path";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MY_EMAIL,
    pass: process.env.MY_PASSWORD,
  },
});

function renderTemplate(templateName: string, data: any) {
  const baseDir = path.join(process.cwd(), "src/email-templates");
  const templatePath = path.join(baseDir, `${templateName}.hbs`);
  const layoutPath = path.join(baseDir, "layouts/main.hbs");
  const partialsDir = path.join(baseDir, "partials");

  // Register partials
  fs.readdirSync(partialsDir).forEach((file) => {
    const partialName = path.basename(file, ".hbs");
    const partialTemplate = fs.readFileSync(
      path.join(partialsDir, file),
      "utf8"
    );
    hbs.registerPartial(partialName, partialTemplate);
  });

  // Compile main template
  const templateSource = fs.readFileSync(templatePath, "utf8");
  const template = hbs.compile(templateSource);
  const body = template(data);

  // Compile layout
  const layoutSource = fs.readFileSync(layoutPath, "utf8");
  const layout = hbs.compile(layoutSource);

  return layout({
    title: data.title || "PayVerse Email",
    body,
    year: new Date().getFullYear(),
  });
}

export async function sendEmail({
  to,
  subject,
  template,
  data,
}: {
  to: string;
  subject: string;
  template: string;
  data: any;
}) {
  const html = renderTemplate(template, data);
  await transporter.sendMail({
    from: '"PayVerse" <' + process.env.MY_EMAIL + ">",
    to,
    subject,
    html,
  });
}

// Example usage for verification email
export async function sendVerificationEmail(
  to: string,
  name: string,
  verificationUrl: string
) {
  await sendEmail({
    to,
    subject: "Verify your PayVerse email",
    template: "verification",
    data: { name, verificationUrl },
  });
}

// Example usage for password reset email
export async function sendResetPasswordEmail(
  to: string,
  name: string,
  resetUrl: string
) {
  await sendEmail({
    to,
    subject: "Reset your PayVerse password",
    template: "reset-password",
    data: { name, resetUrl },
  });
}

// Example usage for welcome email
export async function sendWelcomeEmail(to: string, name: string) {
  await sendEmail({
    to,
    subject: "Welcome to PayVerse!",
    template: "welcome",
    data: { name },
  });
}

// Example usage for enable MFA email
export async function sendSetupTOTPEmail(to: string, name: string) {
  await sendEmail({
    to,
    subject: "Setup TOTP Multi-Factor Authentication (MFA)",
    template: "setup-totp",
    data: { name },
  });
}

// Example usage for TOTP setup success email
export async function sendTotpSetupSuccessEmail(to: string, name: string) {
  await sendEmail({
    to,
    subject: "TOTP Setup Successful",
    template: "totp-setup-success",
    data: { name },
  });
}

// Example usage for verification code email
export async function sendVerificationCode(
  to: string,
  name: string,
  code: string
) {
  await sendEmail({
    to,
    subject: "Your PayVerse Verification Code",
    template: "verification-code",
    data: { name, code },
  });
}
