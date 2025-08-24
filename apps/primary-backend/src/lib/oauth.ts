import { OAuth2Client } from "google-auth-library";
import dotenv from "dotenv";

dotenv.config();

const clientId = process.env.GOOGLE_CLIENT_ID!;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
const baseurl = process.env.BASE_URL || "http://localhost:5000";

export const oauth2Client = new OAuth2Client({
  client_id: clientId,
  client_secret: clientSecret,
  redirectUri: `${baseurl}/api/auth/google/callback`,
});

export function getGoogleAuthUrl() {
  const scopes = ["openid", "email", "profile"];

  console.log("Client id", clientId);
  console.log("Client secret", clientSecret);

  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: scopes,
  });

  return url;
}
