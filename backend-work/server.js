require("dotenv").config();

const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const otpStore = {};

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
});

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "user.html"));
});

app.post("/send-otp", async (req, res) => {
    const { email } = req.body;

    const otp = Math.floor(100000 + Math.random() * 900000);

    otpStore[email] = otp;

    try {
        await transporter.sendMail({
            from: process.env.EMAIL,
            to: email,
            subject: "OTP Verification",
            text: `Your OTP is ${otp}`
        });

        res.json({ success: true, message: "OTP Sent" });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
});

app.post("/verify-otp", (req, res) => {
    const { email, otp } = req.body;

    if (otpStore[email] == otp) {
        delete otpStore[email];
        res.json({ success: true, message: "Verified" });
    } else {
        res.json({ success: false, message: "Wrong OTP" });
    }
});

app.listen(3000, () => {
    console.log("Server Running On Port 3000");
});

console.log("EMAIL:", process.env.EMAIL);
console.log("PASSWORD LOADED:", !!process.env.PASSWORD);