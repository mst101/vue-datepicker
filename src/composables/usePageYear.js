import { computed } from 'vue'

export default function usePageYear(pageDate, getFullYear) {
  /**
   * Returns the current page's full year as an integer.
   * @return {Number}
  */
  const pageYear = computed(() => {
    return getFullYear(pageDate.value)
  })

  return pageYear
}
