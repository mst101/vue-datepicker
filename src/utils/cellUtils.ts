import type {
  DateUtils,
  DayMonthYear,
  DisabledConfig,
  CellUtils,
} from '@/types'

export default (utils: DateUtils): CellUtils => {
  function isDefined(
    obj: DisabledConfig | undefined,
    prop: keyof DisabledConfig,
  ): boolean {
    return obj != undefined && obj[prop] != undefined
  }

  function hasArray(
    obj: DisabledConfig | undefined,
    prop: keyof DisabledConfig,
  ) {
    return isDefined(obj, prop) && Array.isArray(obj![prop])
  }

  function hasDate(
    obj: DisabledConfig | undefined,
    prop: keyof DisabledConfig,
  ): boolean {
    return utils != undefined && isDefined(obj, prop) && utils.isValidDate(obj![prop] as Date)
  }

  function dayMonthYear(
    obj: DisabledConfig | undefined,
    prop: keyof DisabledConfig,
  ): DayMonthYear {
    if (!hasDate(obj, prop)) {
      return {
        day: undefined,
        month: undefined,
        year: undefined,
      }
    }

    const d = obj![prop] as Date

    return {
      day: utils.getDate(d),
      month: utils.getMonth(d),
      year: utils.getFullYear(d),
    }
  }

  return {
    ...utils,
    isDefined,
    hasArray,
    hasDate,
    dayMonthYear,
  }
}
