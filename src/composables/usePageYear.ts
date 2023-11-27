import { computed, type Ref } from 'vue'

export default function usePageYear(pageDate: Ref<Date>, getFullYear: (date: Date) => number) {
  /**
   * Returns the current page's full year as an integer.
   * @return {Number}
  */
  const pageYear = computed(() => {
    return getFullYear(pageDate.value)
  })

  return pageYear
}
