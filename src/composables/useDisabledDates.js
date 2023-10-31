/* eslint-disable max-statements */
import { computed } from 'vue'
import makeDateUtils from '~/utils/DateUtils'
import DisabledDate from '../utils/DisabledDate'

export default function useDisabledDates(disabledDates, options = {}) {
  const { useUtc = false, pageDate, view = 'day', yearRange = 10 } = options
  const utils = makeDateUtils(useUtc)
  /**
   * A look-up object created from 'disabledDates' prop
   * @return {Object}
   */
  const disabledConfig = computed(() => {
    if (!disabledDates) {
      return {
        has: {
          from: false,
          to: false,
        },
      }
    }

    return new DisabledDate(utils, disabledDates).config
  })

  const earliestPossibleDate = computed(() => {
    if (!disabledDates) return null

    return new DisabledDate(utils, disabledDates).getEarliestPossibleDate(
      disabledDates.to,
    )
  })
  const latestPossibleDate = computed(() => {
    if (!disabledDates) return null

    return new DisabledDate(utils, disabledDates).getLatestPossibleDate(
      disabledDates.from,
    )
  })

  /**
   * Returns the current page's full year as an integer.
   * @return {Number}
   */
  const pageYear = computed(() => {
    return utils.getFullYear(pageDate)
  })

  /**
   * Is the next button disabled?
   * @return {Boolean}
   */
  const isNextDisabled = computed(() => {
    if (!disabledConfig.value.has.from) {
      return false
    }

    if (view === 'day') {
      const firstOfNextMonth = computed(() => {
        const d = new Date(pageDate)
        return new Date(utils.setMonth(d, utils.getMonth(d) + 1))
      })
      return latestPossibleDate.value < firstOfNextMonth.value
    }

    if (view === 'month') {
      return latestPossibleDate.value <= new Date(pageYear.value, 11, 31)
    }

    /**
     * The year at which the current yearRange starts
     * @return {Number}
     */
    const pageDecadeStart = computed(() => {
      return Math.floor(pageYear.value / yearRange) * yearRange
    })

    /**
     * The year at which the current yearRange ends
     * @return {Number}
     */
    const pageDecadeEnd = computed(() => {
      return pageDecadeStart.value + yearRange - 1
    })

    const firstDayOfNextDecade = new Date(pageDecadeEnd.value + 1, 0, 1)
    return latestPossibleDate.value < firstDayOfNextDecade
  })

  /**
   * Is the previous button disabled?
   * @return {Boolean}
   */
  const isPreviousDisabled = computed(() => {
    if (!disabledConfig.value.has.to) {
      return false
    }

    if (view === 'day') {
      const lastOfPreviousMonth = computed(() => {
        const d = new Date(pageDate)
        return new Date(utils.setDate(d, 0))
      })

      return earliestPossibleDate.value > lastOfPreviousMonth.value
    }

    if (view === 'month') {
      return earliestPossibleDate.value >= new Date(pageYear.value, 0, 1)
    }

    const pageDecadeStart = computed(() => {
      return Math.floor(pageYear.value / yearRange) * yearRange
    })

    return (
      earliestPossibleDate.value > new Date(pageDecadeStart.value - 1, 11, 31)
    )
  })

  /**
   * Whether a day is disabled
   * @param {Date} date to check if disabled
   * @return {Boolean}
   */
  function isDisabledDate(date) {
    if (!disabledDates) return false

    return new DisabledDate(utils, disabledDates).isDateDisabled(date)
  }

  /**
   * Whether a month is disabled
   * @param {Date} date
   * @return {Boolean}
   */
  function isDisabledMonth(date) {
    if (!disabledDates) return false

    return new DisabledDate(utils, disabledDates).isMonthDisabled(date)
  }

  /**
   * Whether a year is disabled
   * @param {Date} date
   * @return {Boolean}
   */
  function isDisabledYear(date) {
    if (!disabledDates) return false

    return new DisabledDate(utils, disabledDates).isYearDisabled(date)
  }

  return {
    disabledConfig,
    earliestPossibleDate,
    latestPossibleDate,
    isDisabledDate,
    isDisabledMonth,
    isDisabledYear,
    isPreviousDisabled,
    isNextDisabled,
  }
}
