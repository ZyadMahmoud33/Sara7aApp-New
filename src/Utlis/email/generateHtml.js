
export const template = (code, firstName, subject) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Confirm Email</title>
</head>

<body style="margin:0; padding:0; background:#0f172a; font-family:Arial;">

  <!-- Background wrapper -->
  <div style="padding:40px 15px;">

    <!-- Card -->
    <div style="
      max-width:600px;
      margin:auto;
      background:#111827;
      border-radius:16px;
      overflow:hidden;
      box-shadow:0 10px 40px rgba(0,0,0,0.4);
    ">

      <!-- Header -->
      <div style="
        background:linear-gradient(135deg,#6366f1,#22c55e);
        padding:30px;
        text-align:center;
        color:white;
      ">
        <h2 style="margin:0; font-size:24px;">${subject}</h2>
        <h1 style="margin:0; font-size:24px;"> Welcome ${firstName}</h1>
        <p style="margin:8px 0 0; opacity:0.9;">Almost there! Just confirm your email</p>
      </div>

      <!-- Content -->
      <div style="padding:30px; text-align:center; color:#e5e7eb;">

        <p style="font-size:15px; line-height:1.6;">
          Thanks for joining our platform 🚀<br>
          Click the button below to verify your email and activate your account.
        </p>

        <!-- Button -->
        <a href="{{CONFIRM_LINK}}" style="
          display:inline-block;
          margin-top:25px;
          padding:14px 28px;
          background:linear-gradient(135deg,#22c55e,#16a34a);
          color:white;
          text-decoration:none;
          border-radius:10px;
          font-weight:bold;
          box-shadow:0 6px 20px rgba(34,197,94,0.3);
        ">
          ${code} Confirm Email
        </a>

        <p style="margin-top:30px; font-size:12px; color:#9ca3af;">
          This link will expire in 1 hour for security reasons.
        </p>

      </div>

    </div>

    <!-- Footer -->
    <p style="text-align:center; color:#64748b; font-size:12px; margin-top:20px;">
      If you didn’t request this, you can safely ignore it.
    </p>

  </div>

</body>
</html>`

export const templatey = (code, firstName) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Resend Verification Code</title>
</head>

<body style="margin:0; padding:0; background:#0f172a; font-family:Arial;">

  <!-- Background wrapper -->
  <div style="padding:40px 15px;">

    <!-- Card -->
    <div style="
      max-width:600px;
      margin:auto;
      background:#111827;
      border-radius:16px;
      overflow:hidden;
      box-shadow:0 10px 40px rgba(0,0,0,0.4);
    ">

      <!-- Header -->
      <div style="
        background:linear-gradient(135deg,#6366f1,#22c55e);
        padding:30px;
        text-align:center;
        color:white;
      ">
        <h1 style="margin:0; font-size:24px;">Hey ${firstName} 👋</h1>
        <p style="margin:8px 0 0; opacity:0.9;">
          You requested a new verification code
        </p>
      </div>

      <!-- Content -->
      <div style="padding:30px; text-align:center; color:#e5e7eb;">

        <p style="font-size:15px; line-height:1.6;">
          We received a request to resend your OTP 🔐<br>
          Use the code below to complete your verification.
        </p>

        <!-- OTP Box -->
        <div style="
          margin-top:25px;
          padding:15px;
          font-size:28px;
          font-weight:bold;
          letter-spacing:6px;
          background:#020617;
          color:#22c55e;
          border-radius:10px;
          display:inline-block;
        ">
          ${code}
        </div>

        <p style="margin-top:25px; font-size:12px; color:#9ca3af;">
          This code will expire in 3 minutes ⏳
        </p>

      </div>

    </div>

    <!-- Footer -->
    <p style="text-align:center; color:#64748b; font-size:12px; margin-top:20px;">
      If you didn’t request this code, you can safely ignore this email.
    </p>

  </div>

</body>
</html>`;