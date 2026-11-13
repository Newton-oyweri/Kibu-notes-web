
<script setup lang="ts">
import { slugify } from '~/utils/slugify'

const route = useRoute()
const { $supabase } = useNuxtApp()

const { data: breadcrumbs } = await useAsyncData(
  () => `breadcrumbs-${route.path}`,
  async () => {
    const items: { label: string; to?: string }[] = [
      { label: 'Home', to: '/' }
    ]

    const segments = route.path.split('/').filter(Boolean)

    if (!segments.length) return []

    if (segments[0] === 'schools' && segments[1]) {
      // Resolve school by its slug instead
      const { data: schools, error: schoolsError } = await $supabase
        .from('schools')
        .select('id, name')

      if (schoolsError) throw schoolsError

      const currentSchool = schools?.find(
        school => slugify(school.name) === segments[1]
      )

      if (currentSchool) {
        items.push({ label: currentSchool.name })
      }

      return items
    }

    if (segments[0] === 'programmes' && segments[1]) {
      const { data: programme, error } = await $supabase
        .from('programmes')
        .select('title, school_id, schools(name)')
        .eq('code', segments[1])
        .single()

      if (error) throw error

      if (programme) {
        const school = programme.schools as unknown as { name: string } | null

        if (school) {
          items.push({
            label: school.name,
            to: `/schools/${slugify(school.name)}`
          })
        }

        items.push({ label: programme.title })
      }

      return items
    }

    // RESOURCE PAGE
    if (segments[0] === 'resources' && segments[1]) {
      const { data: resource, error: resourceError } = await $supabase
        .from('resources')
        .select('title, unit_id')
        .eq('slug', segments[1])
        .eq('visibility', 'public')
        .maybeSingle()

      if (resourceError) throw resourceError

      if (!resource) return items

      // Get the unit
      const { data: unit, error: unitError } = await $supabase
        .from('units')
        .select('id, title')
        .eq('id', resource.unit_id)
        .maybeSingle()

      if (unitError) throw unitError

      // Find programmes containing this unit
      const { data: programmeUnits, error: programmeUnitsError } =
        await $supabase
          .from('programme_units')
          .select('programme_id')
          .eq('unit_id', resource.unit_id)

      if (programmeUnitsError) throw programmeUnitsError

      const programmeIds = [
        ...new Set((programmeUnits ?? []).map(item => item.programme_id))
      ]

      if (programmeIds.length === 1) {
        const { data: programme, error } = await $supabase
          .from('programmes')
          .select('title, code, school_id')
          .eq('id', programmeIds[0])
          .maybeSingle()

        if (error) throw error

        if (programme) {
          const { data: school, error: schoolError } = await $supabase
            .from('schools')
            .select('name')
            .eq('id', programme.school_id)
            .maybeSingle()

          if (schoolError) throw schoolError

          if (school) {
            items.push({
              label: school.name,
              to: `/schools/${slugify(school.name)}`
            })
          }

          items.push({
            label: programme.title,
            to: `/programmes/${programme.code}`
          })
        }
      }

      if (unit) {
        items.push({ label: unit.title })
      }

      items.push({ label: resource.title })

      return items
    }

    return items
  }
)
</script>

<template>
  <UBreadcrumb
    v-if="breadcrumbs?.length"
    :items="breadcrumbs"
    separator="i-lucide-chevron-right"
    class="px-4 py-3"
  />
</template>
