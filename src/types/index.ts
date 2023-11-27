import type Language from '@/locale/Language'
import type { Ref } from 'vue'

export type View = '' | 'day' | 'month' | 'year'
export type ViewName = '' | 'Day' | 'Month' | 'Year'

export type DayOfWeek = 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat'

export type TransitionName = 'slide-left' | 'slide-right'

export type CalendarSlot =
  | 'beforeCalendarHeader'
  | 'calendarFooter'
  | 'beforeCalendarHeaderDay'
  | 'calendarFooterDay'
  | 'beforeCalendarHeaderMonth'
  | 'calendarFooterMonth'
  | 'beforeCalendarHeaderYear'
  | 'calendarFooterYear'
  | 'nextIntervalBtn'
  | 'prevIntervalBtn'

export type FixedPosition =
  | ''
  | 'bottom'
  | 'bottom-left'
  | 'bottom-right'
  | 'top'
  | 'top-left'
  | 'top-right'

export type ElementToFocus =
  | 'tabbableCell'
  | 'input'
  | 'calendarButton'
  | 'openDate'
  | 'prev'
  | 'next'
  | 'up'
  | 'arrow-to-cell'

export interface ChangePage {
  incrementBy: number
  focusRefs: ElementToFocus[]
}

export interface PageChange {
  focusRefs: ElementToFocus[]
  pageDate: Date
}

export interface Cell {
  timestamp: number
  isDisabled: boolean
  isOpenDate?: boolean
  isSelected?: boolean
  isToday?: boolean
}

export interface CellDay extends Cell {
  date: number | string
  isHighlighted: boolean
  isHighlightStart: boolean
  isHighlightEnd: boolean
  isWeekend: boolean
  isSaturday: boolean
  isSunday: boolean
  isPreviousMonth: boolean
  isNextMonth: boolean
}
export interface CellMonth extends Cell {
  month: string
}
export interface CellYear extends Cell {
  year?: number
}

export interface DateRange {
  to: Date
  from: Date
}

export interface DisabledConfig {
  to?: Date
  from?: Date
  ranges?: DateRange[]
  customPredictor?: (date: Date) => boolean
  dates?: Date[]
  days?: number[]
  daysOfMonth?: number[]
  includeDisabled?: boolean
}

export interface DateUtils {
  useUtc: Ref<boolean>
  getFullYear: (date: Date) => number
  getMonth: (date: Date) => number
  getDaysInMonth: (date: Date) => 28 | 29 | 30 | 31
  getDate: (date: Date) => number
  getDay: (date: Date) => number
  getHours: (date: Date) => number
  getMinutes: (date: Date) => number
  setFullYear: (date: Date, value: number) => number
  setMonth: (date: Date, value: number) => number
  setDate: (date: Date, value: number) => number
  compareDates: (
    date1: Date | undefined | null,
    date2: Date | undefined | null,
  ) => boolean
  isValidDate: (date: Date) => boolean
  getDayNameAbbr: (date: Date, days: string[]) => string
  getDayFromAbbr: (abbr: string) => number
  getMonthName: (month: number | Date, months: string[]) => string
  getMonthNameAbbr: (month: number | Date, monthsAbbr: string[]) => string
  daysInMonth: (year: number, month: number) => 28 | 29 | 30 | 31
  getNthSuffix: (day: number) => 'st' | 'nd' | 'rd' | 'th'
  formatDate: (date: Date, formatStr: string, translation: Language) => string
  parseDate: (
    dateStr: string,
    format: string | Function,
    translation: Language,
    parser?: Function | null,
  ) => Date | string
  parseAsDate: (date: Date | string | number | undefined | null) => Date | null
  getTime: () => 'T00:00:00' | 'T00:00:00Z'
  resetDateTime: (date: Date) => Date
  getNewDateObject: (date?: Date | null) => Date
  getOpenDate: (
    openDate: Date | string | number,
    modelValue: Date | string | number,
    view: View,
  ) => Date
  adjustDateToView: (dateToConvert: Date | null, view: View | null) => Date
}

export interface DayMonthYear {
  day: number | undefined
  month: number | undefined
  year: number | undefined
}

export interface CellUtils extends DateUtils {
  isDefined: (
    obj: DisabledConfig | DateRange | undefined,
    prop: keyof DisabledConfig | keyof DateRange,
  ) => boolean
  hasArray: (
    obj: DisabledConfig | undefined,
    prop: keyof DisabledConfig,
  ) => boolean
  hasDate: (
    obj: DisabledConfig | undefined,
    prop: keyof DisabledConfig,
  ) => boolean
  dayMonthYear: (
    obj: DisabledConfig | undefined,
    prop: keyof DisabledConfig,
  ) => DayMonthYear
}
