async function sendOtp() {

    const email =
        document.getElementById("email").value;

    const res = await fetch("/send-otp", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
    });

    const data = await res.json();

    alert(data.message);
}

async function verifyOtp() {

    const email =
        document.getElementById("email").value;

    const otp =
        document.getElementById("otp").value;

    const res = await fetch("/verify-otp", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email,
            otp
        })
    });

    const data = await res.json();

    alert(data.message);
}