async function verifyEmail() {
  const email = document.getElementById("email").value.trim();
  const msg = document.getElementById("msg");
  msg.textContent = "Verifying email...";

  // 1️⃣ ValidKit SMTP verification
  const apiKey = "vk_prod_xxxxxxxxxxxxxxx"; // 👈 अपना ValidKit API key डालो
  const response = await fetch(`https://api.validkit.com/v1/verify/email?email=${email}`, {
    headers: { Authorization: `Bearer ${apiKey}` }
  });
  const data = await response.json();

  if (data?.result?.valid) {
    msg.textContent = "✅ Email verified successfully!";

    // 2️⃣ Save email to GitHub repo (Optional)
    fetch("https://api.github.com/repos/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME/contents/emails.json", {
      method: "PUT",
      headers: {
        "Authorization": "token YOUR_GITHUB_PERSONAL_ACCESS_TOKEN",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: "Add email",
        content: btoa(JSON.stringify({ email, date: new Date().toISOString() }))
      })
    });

    // 3️⃣ Redirect to OGAds link
    setTimeout(() => {
      window.location.href = "https://www.ogads.com/your-offer-link"; // 👈 अपना OGAds link डालो
    }, 1500);

  } else {
    msg.textContent = "❌ Invalid email! Please try again.";
  }
}
