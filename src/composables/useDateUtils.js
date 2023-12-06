/* eslint-disable max-lines-per-function, max-statements */
import en from '~/locale/translations/en'
import convertToRef from '../utils/convertToRef'

/**
 * Attempts to return a parsable date in the format 'yyyy-MM-dd'
 * @param {String} dateStr
 * @param {String} formatStr
 * @param {Object} translation
 * @param {Number} currentYear
 * @param {String} time
 * @return String
 */
// eslint-disable-next-line complexity
export const getParsableDate = ({
  dateStr,
  formatStr,
  translation,
  currentYear,
  time,
}) => {
  const splitter = formatStr.match(/-|\/|\s|\./)
  const df = formatStr.split(splitter[0])
  const ds = dateStr.split(splitter[0])
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
      ymd[2] = tmp < 10 ? `0${tmp}` : `${tmp}`
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
function parseDateWithLibrary(dateStr, format, parser) {
  if (typeof parser !== 'function') {
    throw new Error('Parser needs to be a function')
  }

  if (typeof format !== 'function') {
    throw new Error('Format needs to be a function when using a custom parser')
  }

  return parser(dateStr)
}

export default (useUtcOrig) => {
  const useUtc = convertToRef(useUtcOrig)

  /**
   * Returns the full year, using UTC or not
   * @param {Date} date
   */
  function getFullYear(date) {
    return useUtc.value ? date.getUTCFullYear() : date.getFullYear()
  }

  /**
   * Returns the month, using UTC or not
   * @param {Date} date
   */
  function getMonth(date) {
    return useUtc.value ? date.getUTCMonth() : date.getMonth()
  }

  /**
   * Returns the number of days in the month, using UTC or not
   * @param {Date} date
   */
  function getDaysInMonth(date) {
    return this.daysInMonth(this.getFullYear(date), this.getMonth(date))
  }

  /**
   * Returns the date, using UTC or not
   * @param {Date} date
   */
  function getDate(date) {
    return useUtc.value ? date.getUTCDate() : date.getDate()
  }

  /**
   * Returns the day, using UTC or not
   * @param {Date} date
   */
  function getDay(date) {
    return useUtc.value ? date.getUTCDay() : date.getDay()
  }

  /**
   * Returns the hours, using UTC or not
   * @param {Date} date
   */
  function getHours(date) {
    return useUtc.value ? date.getUTCHours() : date.getHours()
  }

  /**
   * Returns the minutes, using UTC or not
   * @param {Date} date
   */
  function getMinutes(date) {
    return useUtc.value ? date.getUTCMinutes() : date.getMinutes()
  }

  /**
   * Sets the full year, using UTC or not
   * @param {Date} date
   * @param {String, Number} value
   */
  function setFullYear(date, value) {
    return useUtc.value ? date.setUTCFullYear(value) : date.setFullYear(value)
  }

  /**
   * Sets the month, using UTC or not
   * @param {Date} date
   * @param {String, Number} value
   */
  function setMonth(date, value) {
    return useUtc.value ? date.setUTCMonth(value) : date.setMonth(value)
  }

  /**
   * Sets the date, using UTC or not
   * @param {Date} date
   * @param {String, Number} value
   */
  function setDate(date, value) {
    return useUtc.value ? date.setUTCDate(value) : date.setDate(value)
  }

  /**
   * Check if date1 is equivalent to date2, without comparing the time
   * @see https://stackoverflow.com/a/6202196/4455925
   * @param {Date|null} date1
   * @param {Date|null} date2
   */
  // eslint-disable-next-line complexity
  function compareDates(date1, date2) {
    if (date1 === null && date2 === null) {
      return true
    }

    if (
      (date1 !== null && date2 === null) ||
      (date2 !== null && date1 === null)
    ) {
      return false
    }

    const d1 = new Date(date1.valueOf())
    const d2 = new Date(date2.valueOf())

    this.resetDateTime(d1)
    this.resetDateTime(d2)
    return d1.valueOf() === d2.valueOf()
  }

  /**
   * Validates a date object
   * @param {Date} date - an object instantiated with the new Date constructor
   * @return {Boolean}
   */
  function isValidDate(date) {
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
  function getDayNameAbbr(date, days) {
    if (typeof date !== 'object') {
      throw TypeError('Invalid Type')
    }
    return days[this.getDay(date)]
  }

  /**
   * Return day number from abbreviated week day name
   * @param {String} abbr
   * @return {Number}
   */
  function getDayFromAbbr(abbr) {
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
  function getMonthName(month, months) {
    if (!months) {
      throw Error('missing 2nd parameter Months array')
    }
    if (typeof month === 'object') {
      return months[this.getMonth(month)]
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
  function getMonthNameAbbr(month, monthsAbbr) {
    if (!monthsAbbr) {
      throw Error('missing 2nd parameter Months array')
    }
    if (typeof month === 'object') {
      return monthsAbbr[this.getMonth(month)]
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
  function daysInMonth(year, month) {
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
  function getNthSuffix(day) {
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
  function formatDate(date, formatStr, translation = en) {
    const year = this.getFullYear(date)
    const month = this.getMonth(date) + 1
    const day = this.getDate(date)

    const matches = {
      d: day,
      dd: `0${day}`.slice(-2),
      E: this.getDayNameAbbr(date, translation.days),
      o: this.getNthSuffix(this.getDate(date)),
      M: month,
      MM: `0${month}`.slice(-2),
      MMM: this.getMonthNameAbbr(this.getMonth(date), translation.monthsAbbr),
      MMMM: this.getMonthName(this.getMonth(date), translation.months),
      yy: String(year).slice(2),
      yyyy: year,
    }

    const REGEX_FORMAT = /y{4}|y{2}|M{1,4}|d{1,2}|o|E/g

    return formatStr.replace(REGEX_FORMAT, (match) => matches[match])
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
  function parseDate(dateStr, format, translation = en, parser = null) {
    if (!(dateStr && format)) {
      return dateStr
    }

    if (parser) {
      return parseDateWithLibrary(dateStr, format, parser)
    }

    const parsableDate = getParsableDate({
      dateStr,
      formatStr: format,
      translation,
      currentYear: this.getFullYear(new Date()),
      time: this.getTime(),
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
  function parseAsDate(date) {
    if (typeof date === 'string' || typeof date === 'number') {
      const parsed = new Date(date)
      return this.isValidDate(parsed) ? parsed : null
    }
    return this.isValidDate(date) ? date : null
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
  function resetDateTime(date) {
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
  function getNewDateObject(date) {
    return date
      ? this.resetDateTime(new Date(date))
      : this.resetDateTime(new Date())
  }

  /**
   * Returns the `open date` at a given view
   * @param {Date|null} openDate   the date on which the datepicker should open
   * @param {View} view   Either `day`, `month`, or `year`
   * @return {Date|null}
   */
  function getOpenDate(openDate, selectedDate, view) {
    const parsedOpenDate = this.parseAsDate(openDate)
    const openDateOrToday = this.getNewDateObject(parsedOpenDate)
    const newOpenDate = selectedDate || openDateOrToday

    return this.adjustDateToView(newOpenDate, view)
  }

  /**
   * Converts a date according to a given view
   * e.g. '2025-05-15' becomes '2025-05-01' at `month view and
   * '2025-01-01' at `year` view
   * @param  {Date}   dateToConvert  The date to convert
   * @param  {String} view           The view for which to adjust the date
   * @return {Date}
   */
  function adjustDateToView(dateToConvert, view) {
    const date = this.getNewDateObject(dateToConvert)

    if (view === 'year') {
      const resetDay = new Date(this.setDate(date, 1))
      const resetMonth = this.setMonth(resetDay, 0)
      return new Date(resetMonth)
    }

    if (view === 'month') {
      return new Date(this.setDate(date, 1))
    }

    return date
  }

  return {
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
