import dotenv from "dotenv";
dotenv.config();

import { sendEmail } from "../services/emailService.js";

async function test() {
  console.log("Sending test email to adityaaditi9132@gmail.com...");
  try {
    const info = await sendEmail({
      to: "adityaaditi9132@gmail.com",
      subject: "SkillPath - SMTP Test Connection Success! 🎉",
      text: "Hi! This is a test email confirming that your Gmail SMTP credentials are configured correctly for the SkillPath learning platform. Great job!",
      html: "<p>Hi!</p><p>This is a test email confirming that your <strong>Gmail SMTP credentials</strong> are configured correctly for the <strong>SkillPath</strong> learning platform. Great job! 🎉</p>",
    });
    console.log("Email sent successfully! MessageId:", info.messageId);
    process.exit(0);
  } catch (err) {
    console.error("Failed to send email:", err);
    process.exit(1);
  }
}

test();
