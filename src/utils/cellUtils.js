const cellUtils = {
  isDefined(obj, prop) {
    return obj && typeof obj[prop] !== 'undefined'
  },

  hasArray(obj, prop) {
    return obj && Array.isArray(obj[prop])
  },

  hasDate(obj, prop) {
    return this.isDefined(obj, prop) && this.isValidDate(obj[prop])
  },

  dayMonthYear(obj, prop) {
    const hasDate = this.hasDate(obj, prop)

    if (!hasDate) {
      return {
        day: undefined,
        month: undefined,
        year: undefined,
      }
    }

    const d = obj[prop]

    return {
      day: this.getDate(d),
      month: this.getMonth(d),
      year: this.getFullYear(d),
    }
  },
}

export default (utils) => ({
  ...cellUtils,
  ...utils,
})
