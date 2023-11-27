/* eslint-disable no-underscore-dangle */

import type { CellUtils, DisabledConfig, View } from '@/types'
import makeCellUtils from './cellUtils'
import useDisabledDates from '../composables/useDisabledDates'
import { ref } from 'vue'

export default class HighlightedDate {
  private _utils: CellUtils
  private _disabledDates: DisabledConfig | undefined
  private _highlighted: DisabledConfig | undefined

  constructor(
    utils: CellUtils,
    disabledDates: DisabledConfig | undefined,
    highlighted: DisabledConfig | undefined,
  ) {
    this._utils = makeCellUtils(utils)
    this._disabledDates = disabledDates
    this._highlighted = highlighted
  }

  get config() {
    const highlightedDates = this._highlighted
    const utils = this._utils

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
        highlightedDates!.includeDisabled,
    }

    return {
      to: utils.dayMonthYear(highlightedDates, 'to'),
      from: utils.dayMonthYear(highlightedDates, 'from'),
      has,
    }
  }

  isHighlightingNotPossible(date: Date) {
    const { isDisabledDate } = useDisabledDates(this._disabledDates, {
      useUtc: this._utils.useUtc,
      view: ref('day' as View),
    })

    return !this.config.has.includeDisabled && isDisabledDate(date)
  }

  isDateHighlightedVia(date: Date) {
    const highlightedDates = this._highlighted
    const { has } = this.config

    return {
      to: () => {
        return has.to && date <= highlightedDates!.to!
      },
      from: () => {
        return has.from && date >= highlightedDates!.from!
      },
      range: () => {
        if (!has.ranges) return false

        const ranges = highlightedDates!.ranges!
        const utils = this._utils

        return ranges.some((thisRange) => {
          const hasFrom = utils.isDefined(thisRange, 'from')
          const hasTo = utils.isDefined(thisRange, 'to')

          return (
            hasFrom && hasTo && date <= thisRange.to && date >= thisRange.from
          )
        })
      },
      customPredictor: () => {
        return has.customPredictor && highlightedDates!.customPredictor!(date)
      },
      specificDate: () => {
        if (!has.specificDates) return false

        return highlightedDates!.dates!.some((d) => {
          return this._utils.compareDates(date, d)
        })
      },
      daysOfWeek: () => {
        if (!has.daysOfWeek) return false

        return highlightedDates!.days!.indexOf(this._utils.getDay(date)) !== -1
      },
      daysOfMonth: () => {
        if (!has.daysOfMonth) return false

        return (
          highlightedDates!.daysOfMonth!.indexOf(this._utils.getDate(date)) !==
          -1
        )
      },
    }
  }

  // eslint-disable-next-line complexity
  isDateHighlighted(date: Date) {
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

  isHighlightStart(date: Date) {
    if (!this.config.has.ranges || !this.isDateHighlighted(date)) {
      return false
    }

    for (let i = 0; i < this._highlighted!.ranges!.length; i += 1) {
      const range = this._highlighted!.ranges![i]

      if (range.from.valueOf() === date.valueOf()) {
        return true
      }
    }

    return false
  }

  isHighlightEnd(date: Date) {
    if (!this.config.has.ranges || !this.isDateHighlighted(date)) {
      return false
    }

    for (let i = 0; i < this._highlighted!.ranges!.length; i += 1) {
      const range = this._highlighted!.ranges![i]

      if (range.to.valueOf() === date.valueOf()) {
        return true
      }
    }

    return false
  }
}
