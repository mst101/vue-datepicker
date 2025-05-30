/* eslint-disable no-underscore-dangle */

import makeCellUtils from './cellUtils'
import DisabledDate from './DisabledDate'

export default class HighlightedDate {
  constructor(utils, disabledDates, highlighted) {
    this._utils = utils
    this._disabledDates = disabledDates
    this._highlighted = highlighted
  }

  get config() {
    const highlightedDates = this._highlighted
    const utils = makeCellUtils(this._utils)
    const has = {
      customPredictor: utils.isDefined(highlightedDates, 'customPredictor'),
      daysOfMonth: utils.hasArray(highlightedDates, 'daysOfMonth'),
      daysOfWeek: utils.hasArray(highlightedDates, 'days'),
      from: utils.hasDate(highlightedDates, 'from'),
      ranges: utils.hasArray(highlightedDates, 'ranges'),
      specificDates: utils.hasArray(highlightedDates, 'dates'),
      to: utils.hasDate(highlightedDates, 'to'),
      includeDisabled:
        utils.isDefined(highlightedDates, 'includeDisabled') &&
        highlightedDates.includeDisabled,
    }

    return {
      to: utils.dayMonthYear(highlightedDates, 'to'),
      from: utils.dayMonthYear(highlightedDates, 'from'),
      has,
    }
  }

  isDateDisabled(date) {
    const utils = this._utils
    const disabledDates = this._disabledDates

    return new DisabledDate(utils, disabledDates).isDateDisabled(date)
  }

  isHighlightingNotPossible(date) {
    return !this.config.has.includeDisabled && this.isDateDisabled(date)
  }

  isDateHighlightedVia(date) {
    const highlightedDates = this._highlighted
    const { has } = this.config

    return {
      to: () => {
        return has.to && date <= highlightedDates.to
      },
      from: () => {
        return has.from && date >= highlightedDates.from
      },
      range: () => {
        if (!has.ranges) return false

        const { ranges } = highlightedDates
        const u = makeCellUtils(this._utils)

        return ranges.some((thisRange) => {
          const hasFrom = u.isDefined(thisRange, 'from')
          const hasTo = u.isDefined(thisRange, 'to')

          return (
            hasFrom && hasTo && date <= thisRange.to && date >= thisRange.from
          )
        })
      },
      customPredictor: () => {
        return has.customPredictor && highlightedDates.customPredictor(date)
      },
      specificDate: () => {
        if (!has.specificDates) return false

        return highlightedDates.dates.some((d) => {
          return this._utils.compareDates(date, d)
        })
      },
      daysOfWeek: () => {
        if (!has.daysOfWeek) return false

        return highlightedDates.days.indexOf(this._utils.getDay(date)) !== -1
      },
      daysOfMonth: () => {
        if (!has.daysOfMonth) return false

        return (
          highlightedDates.daysOfMonth.indexOf(this._utils.getDate(date)) !== -1
        )
      },
    }
  }

  // eslint-disable-next-line complexity,max-statements
  isDateHighlighted(date) {
    if (this.isHighlightingNotPossible(date)) return false

    const isHighlightedVia = this.isDateHighlightedVia(date)

    return (
      isHighlightedVia.to() ||
      isHighlightedVia.from() ||
      isHighlightedVia.range() ||
      isHighlightedVia.specificDate() ||
      isHighlightedVia.daysOfWeek() ||
      isHighlightedVia.daysOfMonth() ||
      isHighlightedVia.customPredictor()
    )
  }

  isHighlightStart(date) {
    if (!this.config.has.ranges || !this.isDateHighlighted(date)) {
      return false
    }

    for (let i = 0; i < this._highlighted.ranges.length; i += 1) {
      const range = this._highlighted.ranges[i]

      if (range.from.valueOf() === date.valueOf()) {
        return true
      }
    }

    return false
  }

  isHighlightEnd(date) {
    if (!this.config.has.ranges || !this.isDateHighlighted(date)) {
      return false
    }

    for (let i = 0; i < this._highlighted.ranges.length; i += 1) {
      const range = this._highlighted.ranges[i]

      if (range.to.valueOf() === date.valueOf()) {
        return true
      }
    }

    return false
  }
}
