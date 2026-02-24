import { google } from 'googleapis'

const TIME_ZONE = 'America/Chicago'

export async function createMeetingEvent(params: {
  title: string
  startTime: Date
  endTime: Date
  clientEmail: string
  notes?: string
}): Promise<string | null> {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN
  const calendarId = process.env.GOOGLE_CALENDAR_ID
  const jasonEmail = process.env.JASON_EMAIL

  if (!clientId || !clientSecret || !refreshToken || !calendarId || !jasonEmail) {
    throw new Error(
      `Missing Google env vars: ${[
        !clientId && 'GOOGLE_CLIENT_ID',
        !clientSecret && 'GOOGLE_CLIENT_SECRET',
        !refreshToken && 'GOOGLE_REFRESH_TOKEN',
        !calendarId && 'GOOGLE_CALENDAR_ID',
        !jasonEmail && 'JASON_EMAIL',
      ]
        .filter(Boolean)
        .join(', ')}`
    )
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret)
  oauth2Client.setCredentials({ refresh_token: refreshToken })

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

  const requestId = `booking-${Date.now()}-${Math.random().toString(36).slice(2)}`

  const event = await calendar.events.insert({
    calendarId,
    conferenceDataVersion: 1,
    sendUpdates: 'all',
    requestBody: {
      summary: params.title,
      description: params.notes || undefined,
      start: { dateTime: params.startTime.toISOString(), timeZone: TIME_ZONE },
      end: { dateTime: params.endTime.toISOString(), timeZone: TIME_ZONE },
      attendees: [
        { email: jasonEmail },
        { email: params.clientEmail },
      ],
      conferenceData: {
        createRequest: {
          requestId,
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
    },
  })

  const meetUrl =
    event.data.conferenceData?.entryPoints?.find((ep) => ep.entryPointType === 'video')?.uri ??
    null

  return meetUrl
}
