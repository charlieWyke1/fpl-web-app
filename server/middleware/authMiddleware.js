// this will check every token to ensure it is valid so we only give data to confirmed users
// it looks for an authorisation header, if missing we reject the request
// if there is a authorisation header we give it to firebase to check and if valid we let the request continue

import { admin } from "../config/firebaseAdmin.js";

// here we look for the value of our token which has been sent over from the front end
// it is in the header and has "Bearer" before the actual token value
// depending on whether or not the token is valid we either reject the request or let it continue
export async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    // console.log("Auth Header:", req.headers);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    const idToken = authHeader.split(" ")[1];

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("Error verifying token:", error);
    return res.status(401).json({ error: "Unauthorized" });
  }
}
