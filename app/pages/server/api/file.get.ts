const ALLOWED_HOST = 'pub-937848871caa438bb7b53c74c18ed261.r2.dev'

export default defineEventHandler((event) => {
  const { url } = getQuery(event)
  let target: URL

  try {
    target = new URL(String(url))
  } catch {
    throw createError({ statusCode: 400, statusMessage: 'Bad url' })
  }

  if (target.hostname !== ALLOWED_HOST) {
    throw createError({ statusCode: 403, statusMessage: 'Host not allowed' })
  }

  return sendProxy(event, target.toString())
})
