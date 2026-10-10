SAKAYKO LIVE — SETUP GUIDE
=========================
This is a shared, real-time school-demo website. A passenger booking appears on connected driver devices, and driver actions update the passenger view live.

IMPORTANT LIMITATIONS
- Demo only; do not use for real rides or payments.
- The demo uses in-memory storage. Bookings clear if the server restarts/redeploys.
- No real GPS, maps, identity verification, push notifications, or fare calculation.
- Starting fare defaults to ₱15, but the estimate can be edited. Verify actual local fares before using any fare information outside the classroom.
- Anyone with the public link can join using a display name. Do not enter private information.

DEPLOY FREE USING RENDER (recommended)
1. Create a GitHub account if you do not already have one.
2. Create a new repository named sakayko-live.
3. Upload the contents of this folder (package.json, server.js, public/index.html, README.txt) to the repository. Make sure index.html is inside the public folder.
4. In Render, choose New + → Web Service and connect your GitHub repository.
5. Settings:
   - Runtime: Node
   - Build Command: npm install
   - Start Command: npm start
   - Instance type: Free (if available for your account/region)
6. Click Create Web Service and wait for deployment. Render will provide a public URL like https://your-service-name.onrender.com.
7. Send that URL to classmates. Everyone should open the same URL. One person chooses Passenger and books; another chooses Driver and accepts. Keep the tabs open during the demo.

TEST FLOW
1. Open the website in two separate browsers/devices.
2. Device A: join as Passenger; create a ride request.
3. Device B: join as Driver; accept the pending request.
4. Device A should see the booking status update to Accepted and the driver's display name.
5. Driver can mark the ride completed or cancel the accepted demo ride; passenger sees the update.

Note: Free hosting may sleep when unused, so the first visit after inactivity can take a little time. Deploying publicly requires the user to create/connect their own hosting account; this package does not itself create a live hosted URL.
