/* eslint-disable max-lines-per-function, max-statements */
import type { DateUtils, View } from '@/types'
import en from '../../src/locale/translations/en'
import convertToRef from '../utils/convertToRef'
import { type Ref } from 'vue'

interface ParsableOptions {
  dateStr: string
  formatStr: string
  translation: typeof en
  currentYear: number
  time: 'T00:00:00' | 'T00:00:00Z'
}

/**
 * Attempts to return a parsable date in the format 'yyyy-MM-dd'
 * @param {Object}
 * @return String
 */
export const getParsableDate = (parsableOptions: ParsableOptions) => {
  const { dateStr, formatStr, translation, currentYear, time } = parsableOptions

  const splitter = formatStr.match(/-|\/|\s|\./)
  const df = formatStr.split(splitter![0])
  const ds = dateStr.split(splitter![0])
  const ymd = [currentYear.toString(), '01', '01']

  for (let i = 0; i < df.length; i += 1) {
    if (/yyyy/i.test(df[i])) {
      ymd[0] = ds[i]
    } else if (/mmmm/i.test(df[i])) {
      ymd[1] = translation.getMonthByName(ds[i])
    } else if (/mmm/i.test(df[i])) {
      ymd[1] = translation.getMonthByAbbrName(ds[i])
    } else if (/mm/i.test(df[i])) {
      ymd[1] = ds[i]
    } else if (/m/i.test(df[i])) {
      ymd[1] = ds[i]
    } else if (/dd/i.test(df[i])) {
      ymd[2] = ds[i]
    } else if (/d/i.test(df[i])) {
      const tmp = ds[i].replace(/st|rd|nd|th/g, '')
      ymd[2] = parseInt(tmp) < 10 ? `0${tmp}` : `${tmp}`
    }
  }

  return `${ymd.join('-')}${time}`
}

/**
 * Parses a date using a function passed in via the `parser` prop
 * @param  {String}   dateStr The string to parse
 * @param  {Function} format  The function that should be used to format the date
 * @param  {Function} parser  The function that should be used to parse the date
 * @return {Date | String}
 */
function parseDateWithLibrary(
  dateStr: string,
  format: string | Function,
  parser: Function | null,
) {
  if (typeof parser !== 'function') {
    throw new Error('Parser needs to be a function')
  }

  if (typeof format !== 'function') {
    throw new Error('Format needs to be a function when using a custom parser')
  }

  return parser(dateStr)
}

export default (useUtcOrig: Ref<boolean> | boolean): DateUtils => {
  const useUtc: Ref<boolean> = convertToRef(useUtcOrig)

  /**
   * Returns the full year, using UTC or not
   * @param {Date} date
   */
  function getFullYear(date: Date) {
    return useUtc.value ? date.getUTCFullYear() : date.getFullYear()
  }

  /**
   * Returns the month, using UTC or not
   * @param {Date} date
   */
  function getMonth(date: Date) {
    return useUtc.value ? date.getUTCMonth() : date.getMonth()
  }

  /**
   * Returns the number of days in the month, using UTC or not
   * @param {Date} date
   */
  function getDaysInMonth(date: Date) {
    return daysInMonth(getFullYear(date), getMonth(date))
  }

  /**
   * Returns the date, using UTC or not
   * @param {Date} date
   */
  function getDate(date: Date) {
    return useUtc.value ? date.getUTCDate() : date.getDate()
  }

  /**
   * Returns the day, using UTC or not
   * @param {Date} date
   */
  function getDay(date: Date) {
    return useUtc.value ? date.getUTCDay() : date.getDay()
  }

  /**
   * Returns the hours, using UTC or not
   * @param {Date} date
   */
  function getHours(date: Date) {
    return useUtc.value ? date.getUTCHours() : date.getHours()
  }

  /**
   * Returns the minutes, using UTC or not
   * @param {Date} date
   */
  function getMinutes(date: Date) {
    return useUtc.value ? date.getUTCMinutes() : date.getMinutes()
  }

  /**
   * Sets the full year, using UTC or not
   * @param {Date} date
   * @param {Number} value
   */
  function setFullYear(date: Date, value: number) {
    return useUtc.value ? date.setUTCFullYear(value) : date.setFullYear(value)
  }

  /**
   * Sets the month, using UTC or not
   * @param {Date} date
   * @param {Number} value
   */
  function setMonth(date: Date, value: number) {
    return useUtc.value ? date.setUTCMonth(value) : date.setMonth(value)
  }

  /**
   * Sets the date, using UTC or not
   * @param {Date} date
   * @param {Number} value
   */
  function setDate(date: Date, value: number) {
    return useUtc.value ? date.setUTCDate(value) : date.setDate(value)
  }

  /**
   * Check if date1 is equivalent to date2, without comparing the time
   * @see https://stackoverflow.com/a/6202196/4455925
   * @param {Date|null} date1
   * @param {Date|null} date2
   */
  // eslint-disable-next-line complexity
  function compareDates(
    date1: Date | undefined | null,
    date2: Date | undefined | null,
  ) {
    if (date1 === undefined) date1 = null
    if (date2 === undefined) date2 = null

    if (!date1 && !date2) {
      return true
    }

    if ((date1 && !date2) || (date2 && !date1)) {
      return false
    }

    const d1 = new Date(date1!.valueOf())
    const d2 = new Date(date2!.valueOf())

    resetDateTime(d1)
    resetDateTime(d2)
    return d1.valueOf() === d2.valueOf()
  }

  /**
   * Validates a date object
   * @param {Date} date - an object instantiated with the new Date constructor
   * @return {Boolean}
   */
  function isValidDate(date: Date) {
    if (Object.prototype.toString.call(date) !== '[object Date]') {
      return false
    }
    return !Number.isNaN(date.valueOf())
  }

  /**
   * Return abbreviated week day name
   * @param {Date} date
   * @param {Array} days
   * @return {String}
   */
  function getDayNameAbbr(date: Date, days: string[]) {
    if (typeof date !== 'object') {
      throw TypeError('Invalid Type')
    }
    return days[getDay(date)]
  }

  /**
   * Return day number from abbreviated week day name
   * @param {String} abbr
   * @return {Number}
   */
  function getDayFromAbbr(abbr: string) {
    for (let i = 0; i < en.days.length; i += 1) {
      if (abbr.toLowerCase() === en.days[i].toLowerCase()) {
        return i
      }
    }
    throw TypeError('Invalid week day')
  }

  /**
   * Return name of the month
   * @param {Number|Date} month
   * @param {Array} months
   * @return {String}
   */
  function getMonthName(month: number | Date, months: string[]) {
    if (!months) {
      throw Error('missing 2nd parameter Months array')
    }
    if (typeof month === 'object') {
      return months[getMonth(month)]
    }
    if (typeof month === 'number') {
      return months[month]
    }
    throw TypeError('Invalid type')
  }

  /**
   * Return an abbreviated version of the month
   * @param {Number|Date} month
   * @param {Array} monthsAbbr
   * @return {String}
   */
  function getMonthNameAbbr(month: number | Date, monthsAbbr: string[]) {
    if (!monthsAbbr) {
      throw Error('missing 2nd parameter Months array')
    }
    if (typeof month === 'object') {
      return monthsAbbr[getMonth(month)]
    }
    if (typeof month === 'number') {
      return monthsAbbr[month]
    }
    throw TypeError('Invalid type')
  }

  /**
   * Alternative get total number of days in month
   * @param {Number} year
   * @param {Number} month
   * @return {Number}
   */
  // eslint-disable-next-line complexity
  function daysInMonth(year: number, month: number) {
    if (/8|3|5|10/.test(month.toString())) {
      return 30
    }
    if (month === 1) {
      return (!(year % 4) && year % 100) || !(year % 400) ? 29 : 28
    }
    return 31
  }

  /**
   * Get nth suffix for date
   * @param {Number} day
   * @return {String}
   */
  // eslint-disable-next-line complexity
  function getNthSuffix(day: number) {
    switch (day) {
      case 1:
      case 21:
      case 31:
        return 'st'
      case 2:
      case 22:
        return 'nd'
      case 3:
      case 23:
        return 'rd'
      default:
        return 'th'
    }
  }

  /**
   * Formats date object
   * @param {Date} date
   * @param {String} formatStr
   * @param {Object} translation
   * @return {String}
   */
  function formatDate(date: Date, formatStr: string, translation = en) {
    const year = getFullYear(date)
    const month = getMonth(date) + 1
    const day = getDate(date)

    interface Matches {
      d: number
      dd: string
      E: string
      o: string
      M: number
      MM: string
      MMM: string
      MMMM: string
      yy: string
      yyyy: number
    }

    const matches: Matches = {
      d: day,
      dd: `0${day}`.slice(-2),
      E: getDayNameAbbr(date, translation.days),
      o: getNthSuffix(getDate(date)),
      M: month,
      MM: `0${month}`.slice(-2),
      MMM: getMonthNameAbbr(getMonth(date), translation.monthsAbbr),
      MMMM: getMonthName(getMonth(date), translation.months),
      yy: String(year).slice(2),
      yyyy: year,
    }

    const REGEX_FORMAT = /y{4}|y{2}|M{1,4}|d{1,2}|o|E/g

    return formatStr.replace(
      REGEX_FORMAT,
      (match) => matches[match as keyof Matches] as string,
    )
  }

  /**
   * Parses a date from a string, or returns the original string
   * @param {String}          dateStr
   * @param {String|Function} format
   * @param {Object}          translation
   * @param {Function}        parser
   * @return {Date | String}
   */
  // eslint-disable-next-line max-params
  function parseDate(
    dateStr: string,
    format: string | Function,
    translation: typeof en = en,
    parser: Function | null = null,
  ): Date | string {
    if (!(dateStr && format)) {
      return dateStr
    }

    if (parser || typeof format === 'function') {
      return parseDateWithLibrary(dateStr, format, parser)
    }

    const parsableDate = getParsableDate({
      dateStr,
      formatStr: format,
      translation,
      currentYear: getFullYear(new Date()),
      time: getTime(),
    })
    const parsedDate = Date.parse(parsableDate)

    if (Number.isNaN(parsedDate)) {
      return dateStr
    }

    return new Date(parsedDate)
  }

  /**
   * Parses a string/number to a date, or returns null
   * @param   {Date|String|Number|undefined} date
   * @returns {Date|null}
   */
  function parseAsDate(
    date: Date | string | number | undefined | null,
  ): Date | null {
    if (date == undefined) {
      return null
    }
    if (typeof date === 'string' || typeof date === 'number') {
      const parsed = new Date(date)
      return isValidDate(parsed) ? parsed : null
    }
    return isValidDate(date) ? date : null
  }

  function getTime() {
    const time = 'T00:00:00'
    return useUtc.value ? `${time}Z` : time
  }

  /**
   * Remove hours/minutes/seconds/milliseconds from a date object
   * @param {Date} date
   * @return {Date}
   */
  function resetDateTime(date: Date) {
    return new Date(
      useUtc.value ? date.setUTCHours(0, 0, 0, 0) : date.setHours(0, 0, 0, 0),
    )
  }

  /**
   * Return a new date object with hours/minutes/seconds/milliseconds removed.
   * Defaults to today's date, if no parameter is provided
   * @param {Date=} date
   * @return {Date}
   */
  function getNewDateObject(date?: Date | null) {
    return date ? resetDateTime(new Date(date)) : resetDateTime(new Date())
  }

  /**
   * Returns the `open date` at a given view
   * @param {Date|String|Number} openDate      the date on which the datepicker should open
   * @param {Date|null}          modelValue    the datepicker's selected date
   * @param {View}               view          either `day`, `month`, or `year`
   * @return {Date|null}
   */
  function getOpenDate(
    openDate: Date | string | number,
    modelValue: Date | string | number,
    view: View,
  ) {
    const parsedOpenDate = parseAsDate(openDate)
    const openDateOrToday = getNewDateObject(parsedOpenDate)
    const newOpenDate = parseAsDate(modelValue) || openDateOrToday

    return adjustDateToView(newOpenDate, view)
  }

  /**
   * Converts a date according to a given view
   * e.g. '2025-05-15' becomes '2025-05-01' at `month view and
   * '2025-01-01' at `year` view
   * @param  {Date}   dateToConvert  The date to convert
   * @param  {String} view           The view for which to adjust the date
   * @return {Date}
   */
  function adjustDateToView(
    dateToConvert: Date | null,
    view: View | null,
  ): Date {
    const date = getNewDateObject(dateToConvert)

    if (view === 'year') {
      const resetDay = new Date(setDate(date, 1))
      const resetMonth = setMonth(resetDay, 0)
      return new Date(resetMonth)
    }

    if (view === 'month') {
      return new Date(setDate(date, 1))
    }

    return date
  }

  return {
    useUtc,
    getFullYear,
    getMonth,
    getDaysInMonth,
    getDate,
    getDay,
    getHours,
    getMinutes,
    setFullYear,
    setMonth,
    setDate,
    compareDates,
    isValidDate,
    getDayNameAbbr,
    getDayFromAbbr,
    getMonthName,
    getMonthNameAbbr,
    daysInMonth,
    getNthSuffix,
    formatDate,
    parseDate,
    parseAsDate,
    getTime,
    resetDateTime,
    getNewDateObject,
    getOpenDate,
    adjustDateToView,
  }
}
