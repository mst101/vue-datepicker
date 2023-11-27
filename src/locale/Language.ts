export default class Language {
  private _language: string = ''

  private _months: string[] = []

  private _monthsAbbr: string[] = []

  private _days: string[] = []

  public rtl: boolean

  public ymd: boolean

  public yearSuffix: string

  constructor(
    language: string,
    months: string[],
    monthsAbbr: string[],
    days: string[],
    rtl: boolean = false,
    ymd: boolean = false,
    yearSuffix: string = '',
  ) {
    this.language = language
    this.months = months
    this.monthsAbbr = monthsAbbr
    this.days = days
    this.rtl = rtl
    this.ymd = ymd
    this.yearSuffix = yearSuffix
  }

  set language(language: string) {
    if (typeof language !== 'string') {
      throw new TypeError('Language must be a string')
    }
    this._language = language
  }

  get months(): string[] {
    return this._months
  }

  set months(months: string[]) {
    if (months.length !== 12) {
      throw new RangeError(
        `There must be 12 months for ${this._language} language`,
      )
    }
    this._months = months
  }

  get monthsAbbr() {
    return this._monthsAbbr
  }

  set monthsAbbr(monthsAbbr: string[]) {
    if (monthsAbbr.length !== 12) {
      throw new RangeError(
        `There must be 12 abbreviated months for ${this._language} language`,
      )
    }
    this._monthsAbbr = monthsAbbr
  }

  get days() {
    return this._days
  }

  set days(days: string[]) {
    if (days.length !== 7) {
      throw new RangeError(
        `There must be 7 days for ${this._language} language`,
      )
    }
    this._days = days
  }

  getDaysStartingOn(firstDayOfWeek: number) {
    const firstDays = this._days.slice(firstDayOfWeek)
    const lastDays = this._days.slice(0, firstDayOfWeek)

    return firstDays.concat(lastDays)
  }

  getMonthByAbbrName(name: string) {
    const monthValue = this._monthsAbbr.findIndex((month) => month === name) + 1
    return monthValue < 10 ? `0${monthValue}` : `${monthValue}`
  }

  getMonthByName(name: string) {
    const monthValue = this._months.findIndex((month) => month === name) + 1
    return monthValue < 10 ? `0${monthValue}` : `${monthValue}`
  }
}
