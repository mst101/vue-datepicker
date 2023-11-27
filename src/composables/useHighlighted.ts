import type { DateUtils, DisabledConfig } from '@/types'
import HighlightedDate from '../utils/HighlightedDate'
import makeDateUtils from '../composables/useDateUtils'
import makeCellUtils from '../utils/cellUtils'
import { ref, unref, type Ref } from 'vue'

interface HighlightedOptions {
  utils: DateUtils
  disabledDates: Ref<DisabledConfig | undefined>
}

export default function useHighlighted(
  highlighted: DisabledConfig,
  options: HighlightedOptions = {
    utils: makeDateUtils(false),
    disabledDates: ref(undefined),
  },
) {
  const { disabledDates, utils } = options

  /**
   * Whether a day is highlighted (N.B. Disabled dates are not highlighted unless
   * `highlighted.includeDisabled` is true)
   * @param {Date} date to check if highlighted
   * @return {Boolean}
   */
  function isHighlightedDate(date: Date) {
    if (!highlighted) return false

    return new HighlightedDate(
      makeCellUtils(utils),
      unref(disabledDates),
      unref(highlighted),
    ).isDateHighlighted(date)
  }

  /**
   * Whether a date is the last in a range of highlighted dates
   * @param {Date} date
   * @return {Boolean}
   */
  function isHighlightEnd(date: Date) {
    if (!highlighted) return false

    return new HighlightedDate(
      makeCellUtils(utils),
      unref(disabledDates),
      unref(highlighted),
    ).isHighlightEnd(date)
  }

  /**
   * Whether a date is the first in a range of highlighted dates
   * @param {Date} date
   * @return {Boolean}
   */
  function isHighlightStart(date: Date) {
    if (!highlighted) return false

    return new HighlightedDate(
      makeCellUtils(utils),
      unref(disabledDates),
      unref(highlighted),
    ).isHighlightStart(date)
  }

  return {
    isHighlightedDate,
    isHighlightEnd,
    isHighlightStart,
  }
}
