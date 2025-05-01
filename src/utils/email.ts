import nodemailer from "nodemailer";
import Mailgen from "mailgen";
import User from "../models/user";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MY_EMAIL,
    pass: process.env.MY_PASSWORD,
  },
});

const MailGenerator = new Mailgen({
  theme: "default",
  product: {
    name: "PayVerse Team",
    link: "https://mailgen.js/",
  },
});

export const sendVerificationEmail = async (user: User, token: string) => {
  const url = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  const email = {
    body: {
      name: user.firstName,
      intro:
        "We are delighted to have you on board. With PayVerse, you get effortless comprehensive financial solution such as, Bank transfers, Invoice management, Virtual cards, Multi-currency virtual accounts, cross-currency paymenyts, and real-time analytics - all in one platform!.",
      action: {
        instructions: "Use the link below to verify your email address",
        button: {
          color: "#1da1f2", // Optional action button color
          text: "Verify",
          link: `${url}`,
        },
      },
      outro:
        "Need help, or have questions? Just reply to this email, we'd love to help.",
    },
  };

  const emailBody = MailGenerator.generate(email);

  const mailOptions = {
    from: '"PayVerse" <custom@example.com>',
    to: user.email,
    subject: "[PayVerse] Verify your email",
    html: emailBody,
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        return reject({ message: "Error sending email" });
      }
      console.log(`Email sent: ${info.response}`);
      return resolve({ message: "Email sent successfully" });
    });
  });
};

export const sendResetPasswordEmail = async (user: User, token: string) => {
  const url = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  const email = {
    body: {
      name: user.firstName,
      intro: "We’ve received your request to reset your password.",
      action: {
        instructions: "Please click the link below to complete the reset.",
        button: {
          color: "#1da1f2", // Optional action button color
          text: "Reset Password",
          link: `${url}`,
        },
      },
      outro:
        "Need help, or have questions? Just reply to this email, we'd love to help.",
    },
  };

  const emailBody = MailGenerator.generate(email);

  const mailOptions = {
    from: '"PayVerse" <custom@example.com>',
    to: user.email,
    subject: "[PayVerse] Reset password",
    html: emailBody,
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        return reject({ message: "Error sending email" });
      }
      console.log(`Email sent: ${info.response}`);
      return resolve({ message: "Email sent successfully" });
    });
  });
};

export const sendVerificationCode = async (user: User, code: string) => {
  const email = {
    body: {
      name: user.firstName,
      intro: "Your verification code for login",
      action: {
        instructions: "Please use the code below to complete your login:",
        button: {
          color: "#1da1f2",
          text: code,
          link: "#",
        },
      },
      outro: "If you did not request this code, please ignore this email.",
    },
  };

  const emailBody = MailGenerator.generate(email);

  const mailOptions = {
    from: '"PayVerse" <custom@example.com>',
    to: user.email,
    subject: "[PayVerse] Verification code",
    html: emailBody,
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        return reject({ message: "Error sending email" });
      }
      console.log(`Email sent: ${info.response}`);
      return resolve({ message: "Email sent successfully" });
    });
  });
};
