async function verifyEmail() {
  const email = document.getElementById("email").value.trim();
  const msg = document.getElementById("msg");
  msg.textContent = "Verifying email...";

  // ValidKit SMTP verification
  const apiKey = "vk_prod_866c21581ca3741f989ace2c"; // your valid key
  const response = await fetch(`https://api.validkit.io/v1/verify/email?email=${email}`, {
    headers: { Authorization: `Bearer ${apiKey}` }
  });
  const data = await response.json();
  console.log("ValidKit response:", data);

  if (data?.result?.valid && data?.result?.smtp) {
    msg.textContent = "✅ Email verified successfully!";

    // Redirect to OGAds
    setTimeout(() => {
      window.location.href = "https://www.ogads.com/your-offer-link";
    }, 1500);

  } else {
    msg.textContent = "❌ Invalid email! Please try again.";
  }
}
