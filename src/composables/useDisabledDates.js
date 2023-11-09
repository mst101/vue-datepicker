/* eslint-disable max-statements */
import { computed } from 'vue'
import useDateUtils from './useDateUtils'
import DisabledDate from '../utils/DisabledDate'
import convertToRef from '../utils/convertToRef'

// eslint-disable-next-line max-lines-per-function
export default function useDisabledDates(disabledDatesOrig, options = {}) {
  const disabledDates = convertToRef(disabledDatesOrig)
  const { useUtc = false } = options
  const utils = useDateUtils(useUtc)
  let { pageDate, view = 'day', yearRange = 10 } = options
  pageDate = convertToRef(pageDate)
  view = convertToRef(view)
  yearRange = convertToRef(yearRange)

  /**
   * A look-up object created from 'disabledDates' prop
   * @return {Object}
   */
  const disabledConfig = computed(() => {
    if (!disabledDates.value) {
      return {
        has: {
          from: false,
          to: false,
        },
      }
    }

    return new DisabledDate(utils, disabledDates.value).config
  })
  const earliestPossibleDate = computed(() => {
    if (!disabledDates.value) return null

    return new DisabledDate(utils, disabledDates.value).getEarliestPossibleDate(
      disabledDates.value.to,
    )
  })
  const latestPossibleDate = computed(() => {
    if (!disabledDates.value) return null

    return new DisabledDate(utils, disabledDates.value).getLatestPossibleDate(
      disabledDates.value.from,
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
    if (!disabledDates.value) return false

    return new DisabledDate(utils, disabledDates.value).isDateDisabled(date)
  }

  /**
   * Whether a month is disabled
   * @param {Date} date
   * @return {Boolean}
   */
  function isDisabledMonth(date) {
    if (!disabledDates.value) return false

    return new DisabledDate(utils, disabledDates.value).isMonthDisabled(date)
  }

  /**
   * Whether a year is disabled
   * @param {Date} date
   * @return {Boolean}
   */
  function isDisabledYear(date) {
    if (!disabledDates.value) return false

    return new DisabledDate(utils, disabledDates.value).isYearDisabled(date)
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
