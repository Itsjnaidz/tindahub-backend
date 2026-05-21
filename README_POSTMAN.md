TindaHub Backend — Postman Quick Start

1) Import collection
- File: tindahub-postman-collection.json (already in project root)
- In Postman: Import -> Choose Files -> select the JSON

2) Set environment variables
- baseUrl: https://tindahub-backend.onrender.com (or http://localhost:5000 for local)
- authToken: leave empty for now

3) Run auth flow
- Send `Generate OTP` with a phone number
- Check server logs (local) or Render logs for the OTP printed as `OTP for <phone>: <otp>`
- Send `Verify OTP` with the phone and OTP
- Copy the returned `token` and paste into `authToken` environment variable

4) Run protected requests
- All protected requests include `Authorization: Bearer {{authToken}}`

Notes
- Make sure `.env` contains `JWT_SECRET` (set for local development). This project already includes a `.env` entry for that.
- If running on Render, set the same variable (`JWT_SECRET`) in Render's dashboard environment variables and redeploy.
