/* eslint-disable no-underscore-dangle */

import type { DateUtils, DisabledConfig, DateRange } from '@/types'
import makeCellUtils from './cellUtils'

export default class DisabledDate {
  private _utils: DateUtils
  private _disabledDates: DisabledConfig

  constructor(utils: DateUtils, disabledDates: DisabledConfig) {
    this._utils = utils
    this._disabledDates = disabledDates
  }

  get config() {
    const disabledDates = this._disabledDates
    const utils = makeCellUtils(this._utils)
    const has = {
      customPredictor: utils.isDefined(disabledDates, 'customPredictor'),
      daysOfMonth: utils.hasArray(disabledDates, 'daysOfMonth'),
      daysOfWeek: utils.hasArray(disabledDates, 'days'),
      from: utils.hasDate(disabledDates, 'from'),
      ranges: utils.hasArray(disabledDates, 'ranges'),
      specificDates: utils.hasArray(disabledDates, 'dates'),
      to: utils.hasDate(disabledDates, 'to'),
    }

    return {
      to: utils.dayMonthYear(disabledDates, 'to'),
      from: utils.dayMonthYear(disabledDates, 'from'),
      has,
    }
  }

  daysInMonth(date: Date) {
    const utils = this._utils
    const month = utils.getMonth(date)
    const year = utils.getFullYear(date)

    return utils.daysInMonth(year, month)
  }

  isDateDisabledVia(date: Date) {
    const disabledDates = this._disabledDates
    const { has } = this.config

    return {
      to: () => {
        return has.to && date <= disabledDates.to!
      },
      from: () => {
        return has.from && date >= disabledDates.from!
      },
      range: () => {
        if (!has.ranges) return false

        const { ranges } = disabledDates
        const u = makeCellUtils(this._utils)

        return ranges!.some((thisRange: DateRange) => {
          const hasFrom = u.isDefined(thisRange, 'from')
          const hasTo = u.isDefined(thisRange, 'to')

          return (
            hasFrom && hasTo && date <= thisRange.to && date >= thisRange.from
          )
        })
      },
      customPredictor: () => {
        return has.customPredictor && disabledDates.customPredictor!(date)
      },
      specificDate: () => {
        if (!date || !has.specificDates) return false

        return disabledDates.dates!.some((d) => {
          return this._utils.compareDates(date, d)
        })
      },
      daysOfWeek: () => {
        if (!has.daysOfWeek) return false

        return disabledDates.days!.indexOf(this._utils.getDay(date)) !== -1
      },
      daysOfMonth: () => {
        if (!has.daysOfMonth) return false

        return (
          disabledDates.daysOfMonth!.indexOf(this._utils.getDate(date)) !== -1
        )
      },
    }
  }

  isMonthDisabledVia(date: Date) {
    const { from, has, to } = this.config
    const month = this._utils.getMonth(date)
    const year = this._utils.getFullYear(date)

    return {
      to: () => {
        const isYearInPast = has.to && year < to.year!

        if (isYearInPast) {
          return true
        }

        return has.to && month < to.month! && year <= to.year!
      },
      from: () => {
        const isYearInFuture = has.from && year > from.year!

        if (isYearInFuture) {
          return true
        }

        return has.from && month > from.month! && year >= from.year!
      },
    }
  }

  isYearDisabledVia(date: Date) {
    const { from, has, to } = this.config
    const year = this._utils.getFullYear(date)

    return {
      to: () => {
        return has.to && year < to.year!
      },
      from: () => {
        return has.from && year > from.year!
      },
    }
  }

  /**
   * Checks if the given date should be disabled
   * @param {Date} date
   * @return {Boolean}
   */
  // eslint-disable-next-line complexity
  isDateDisabled(date: Date) {
    const isDisabledVia = this.isDateDisabledVia(date)

    return (
      isDisabledVia.to() ||
      isDisabledVia.from() ||
      isDisabledVia.range() ||
      isDisabledVia.specificDate() ||
      isDisabledVia.daysOfWeek() ||
      isDisabledVia.daysOfMonth() ||
      isDisabledVia.customPredictor()
    )
  }

  /**
   * Checks if the given month should be disabled
   * @param {Date} date
   * @return {Boolean}
   */
  isMonthDisabled(date: Date) {
    const isDisabledVia = this.isMonthDisabledVia(date)

    if (isDisabledVia.to() || isDisabledVia.from()) {
      return true
    }

    const datesInMonth = Array.from(
      new Array(this.daysInMonth(date)),
      (_, index) =>
        this._utils.getNewDateObject(
          new Date(
            this._utils.getFullYear(date),
            this._utils.getMonth(date),
            index + 1,
          ),
        ),
    )

    // If at least one day in this month is NOT disabled,
    // then this month SHOULD be selectable
    return datesInMonth.every((d) => !this.isDateDisabled(d))
  }

  /**
   * Checks if the given year should be disabled
   * @param {Date} date
   * @return {Boolean}
   */
  isYearDisabled(date: Date) {
    const isDisabledVia = this.isYearDisabledVia(date)

    if (isDisabledVia.to() || isDisabledVia.from()) {
      return true
    }

    const monthsInYear = Array.from(new Array(12), (_, index) =>
      this._utils.getNewDateObject(
        new Date(
          this._utils.getFullYear(date),
          this._utils.getMonth(date),
          index + 1,
        ),
      ),
    )

    // If at least one month of this year is NOT disabled,
    // then this year SHOULD be selectable
    return monthsInYear.every((d) => !this.isMonthDisabled(d))
  }

  getEarliestPossibleDate(date: Date): Date {
    // if (!date) {
    // return null
    // }
    const utils = this._utils

    if (this.isDateDisabled(date)) {
      const nextDate = new Date(
        utils.getFullYear(date),
        utils.getMonth(date),
        utils.getDate(date) + 1,
      )

      return this.getEarliestPossibleDate(nextDate)
    }

    return date
  }

  getLatestPossibleDate(date: Date): Date {
    // if (!date) {
    //   return null
    // }
    const utils = this._utils

    if (this.isDateDisabled(date)) {
      const nextDate = new Date(
        utils.getFullYear(date),
        utils.getMonth(date),
        utils.getDate(date) - 1,
      )

      return this.getLatestPossibleDate(nextDate)
    }

    return date
  }
}
