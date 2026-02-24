import { google } from 'googleapis'

export async function createMeetingEvent(params: {
  title: string
  startTime: Date
  endTime: Date
  clientEmail: string
  notes?: string
}): Promise<string | null> {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/calendar'],
  })

  const calendar = google.calendar({ version: 'v3', auth })

  const requestId = `booking-${Date.now()}-${Math.random().toString(36).slice(2)}`

  const event = await calendar.events.insert({
    calendarId: process.env.GOOGLE_CALENDAR_ID!,
    conferenceDataVersion: 1,
    sendUpdates: 'all',
    requestBody: {
      summary: params.title,
      description: params.notes || undefined,
      start: { dateTime: params.startTime.toISOString() },
      end: { dateTime: params.endTime.toISOString() },
      attendees: [
        { email: process.env.JASON_EMAIL! },
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
