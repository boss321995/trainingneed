import { defineEventHandler, createError, getQuery } from 'h3'
import { FetchError } from 'ofetch'

export default defineEventHandler(async (event) => {
  const identifier = event.context.params?.identifier

  if (!identifier || typeof identifier !== 'string' || identifier.trim().length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Missing course identifier' })
  }

  const query = getQuery(event)
  const lookup = typeof query.lookup === 'string' ? query.lookup : undefined

  const config = useRuntimeConfig()
  const backendBase = (config.backendBase as string | undefined) || (config.public?.backendBase as string | undefined) || 'http://localhost:4001'
  const sanitizedBase = backendBase.replace(/\/$/, '')

  const searchParams = new URLSearchParams()
  if (lookup === 'id') {
    searchParams.set('lookup', 'id')
  }

  const endpoint = `${sanitizedBase}/api/courses/tn-courses/${encodeURIComponent(identifier)}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`

  try {
    return await $fetch(endpoint, { method: 'GET' })
  } catch (error) {
    if (error instanceof FetchError && error.response) {
      if (error.response.status === 404) {
        throw createError({ statusCode: 404, statusMessage: 'Course outline not found' })
      }

      throw createError({
        statusCode: error.response.status,
        statusMessage: error.response.statusText || 'Failed to load course outline'
      })
    }

    console.error('Proxy error fetching course outline:', error)
    throw createError({ statusCode: 500, statusMessage: 'Failed to retrieve course outline' })
  }
})
