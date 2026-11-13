
import { createClient } from '@supabase/supabase-js'
import { slugify } from '~/utils/slugify'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)

  const supabase = createClient(
    config.public.supabaseUrl,
    config.public.supabaseKey
  )

  const [
    { data: schools, error: schoolsError },
    { data: programmes, error: programmesError },
    { data: units, error: unitsError },
    { data: resources, error: resourcesError }
  ] = await Promise.all([
    supabase
      .from('schools')
      .select('name, created_at'),

    supabase
      .from('programmes')
      .select('code, created_at'),

    supabase
      .from('units')
      .select('code, created_at'),

    supabase
      .from('resources')
      .select('slug, created_at, updated_at')
      .eq('visibility', 'public')
      .not('slug', 'is', null)
      .neq('slug', '')
  ])

  if (schoolsError || programmesError || unitsError || resourcesError) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Unable to generate sitemap URLs'
    })
  }

  const urls = [
    ...(schools ?? []).map(school => ({
      loc: `/schools/${slugify(school.name)}`,
      lastmod: school.created_at
    })),

    ...(programmes ?? []).map(programme => ({
      loc: `/programmes/${encodeURIComponent(programme.code)}`,
      lastmod: programme.created_at
    })),

    ...(units ?? []).map(unit => ({
      loc: `/units/${encodeURIComponent(unit.code)}`,
      lastmod: unit.created_at
    })),

    ...(resources ?? []).map(resource => ({
      loc: `/resources/${encodeURIComponent(resource.slug)}`,
      lastmod: resource.updated_at || resource.created_at
    }))
  ]

  return urls
})
