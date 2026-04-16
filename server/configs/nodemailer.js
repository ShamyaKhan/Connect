const nodemailer = require("nodemailer");
const {
  SMTP_USER,
  SMTP_PASSWORD,
  SENDER_EMAIL,
} = require("../utils/constants");

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASSWORD,
  },
});

const sendEmail = async ({ to, subject, body }) => {
  const response = await transporter.sendMail({
    from: SENDER_EMAIL,
    to,
    subject,
    html: body,
  });
  return response;
};

module.exports = sendEmail;
