/**
 * One-time script to generate a Google OAuth2 refresh token for Calendar access.
 * Run: GOOGLE_CLIENT_ID=... GOOGLE_CLIENT_SECRET=... node scripts/get-google-token.mjs
 *
 * After authorizing, copy the refresh token into .env.local and Netlify.
 */

import { google } from 'googleapis'
import * as readline from 'readline'

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const REDIRECT_URI = 'http://localhost'

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('Error: Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET env vars before running.')
  console.error('Example: GOOGLE_CLIENT_ID=xxx GOOGLE_CLIENT_SECRET=yyy node scripts/get-google-token.mjs')
  process.exit(1)
}

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI)

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: ['https://www.googleapis.com/auth/calendar'],
  prompt: 'consent',
})

console.log('\n─────────────────────────────────────────────────')
console.log('  Google Calendar OAuth2 Token Generator')
console.log('─────────────────────────────────────────────────\n')
console.log('Step 1: Open this URL in your browser and authorize:\n')
console.log(authUrl)
console.log('\nStep 2: After authorizing, your browser will redirect to localhost.')
console.log('        The page will NOT load — that\'s expected.')
console.log('        Copy the full URL from the address bar and paste it below.\n')

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

rl.question('Paste the redirect URL here: ', async (redirectUrl) => {
  rl.close()

  let code
  try {
    const parsed = new URL(redirectUrl.trim())
    code = parsed.searchParams.get('code')
  } catch {
    console.error('\n❌ Invalid URL. Please paste the full URL from your browser address bar.')
    process.exit(1)
  }

  if (!code) {
    console.error('\n❌ No authorization code found in the URL.')
    process.exit(1)
  }

  try {
    const { tokens } = await oauth2Client.getToken(code)

    if (!tokens.refresh_token) {
      console.error('\n❌ No refresh token returned. Try revoking access at https://myaccount.google.com/permissions and re-running.')
      process.exit(1)
    }

    console.log('\n✅ Success! Add these to your .env.local and Netlify:\n')
    console.log(`GOOGLE_CLIENT_ID=${CLIENT_ID}`)
    console.log(`GOOGLE_CLIENT_SECRET=${CLIENT_SECRET}`)
    console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`)
    console.log('\n─────────────────────────────────────────────────\n')
  } catch (err) {
    console.error('\n❌ Failed to exchange code for tokens:', err.message)
    process.exit(1)
  }
})
