import { google } from 'googleapis'

const TIME_ZONE = 'America/Chicago'

export async function createMeetingEvent(params: {
  title: string
  startTime: Date
  endTime: Date
  clientEmail: string
  notes?: string
}): Promise<string | null> {
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  const calendarId = process.env.GOOGLE_CALENDAR_ID
  const jasonEmail = process.env.JASON_EMAIL

  if (!serviceAccountEmail || !privateKey || !calendarId || !jasonEmail) {
    throw new Error(
      `Missing Google env vars: ${[
        !serviceAccountEmail && 'GOOGLE_SERVICE_ACCOUNT_EMAIL',
        !privateKey && 'GOOGLE_PRIVATE_KEY',
        !calendarId && 'GOOGLE_CALENDAR_ID',
        !jasonEmail && 'JASON_EMAIL',
      ]
        .filter(Boolean)
        .join(', ')}`
    )
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: serviceAccountEmail,
      private_key: privateKey,
    },
    scopes: ['https://www.googleapis.com/auth/calendar'],
  })

  const calendar = google.calendar({ version: 'v3', auth })

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
