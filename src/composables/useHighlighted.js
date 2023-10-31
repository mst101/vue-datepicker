import HighlightedDate from '../utils/HighlightedDate'

export default function useHighlighted(highlighted, options = {}) {
  const { utils, disabledDates } = options

  /**
   * Whether a day is highlighted (N.B. Disabled dates are not highlighted unless
   * `highlighted.includeDisabled` is true)
   * @param {Date} date to check if highlighted
   * @return {Boolean}
   */
  function isHighlightedDate(date) {
    if (!highlighted) return false

    return new HighlightedDate(
      utils,
      disabledDates,
      highlighted,
    ).isDateHighlighted(date)
  }

  /**
   * Whether a date is the last in a range of highlighted dates
   * @param {Date} date
   * @return {Boolean}
   */
  function isHighlightEnd(date) {
    if (!highlighted) return false

    return new HighlightedDate(
      utils,
      disabledDates,
      highlighted,
    ).isHighlightEnd(date)
  }

  /**
   * Whether a date is the first in a range of highlighted dates
   * @param {Date} date
   * @return {Boolean}
   */
  function isHighlightStart(date) {
    if (!highlighted) return false

    return new HighlightedDate(
      utils,
      disabledDates,
      highlighted,
    ).isHighlightStart(date)
  }

  return {
    isHighlightedDate,
    isHighlightEnd,
    isHighlightStart,
  }
}
