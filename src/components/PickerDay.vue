<template>
  <div>
    <div v-if="$slots.beforeCalendarHeaderDay">
      <slot name="beforeCalendarHeaderDay" />
    </div>

    <PickerHeader
      v-if="showHeader"
      ref="pickerHeaderRef"
      :bootstrap-styling="bootstrapStyling"
      :is-next-disabled="isNextDisabled"
      :is-previous-disabled="isPreviousDisabled"
      :is-rtl="isRtl"
      :is-up-disabled="isUpDisabled"
      next-view-up="month"
      @focus-input="focusInput"
      @page-change="changePage($event)"
      @set-focus="emit('setFocus', $event)"
      @set-view="emit('setView', $event)"
    >
      <template #prevIntervalBtn>
        <slot name="prevIntervalBtn" />
      </template>
      {{ pageTitleDay }}
      <template #nextIntervalBtn>
        <slot name="nextIntervalBtn" />
      </template>
    </PickerHeader>

    <div>
      <div class="day-header">
        <span
          v-for="day in daysOfWeek"
          :key="day"
        >
          {{ day }}
        </span>
      </div>

      <div class="cells-wrapper">
        <Transition :name="transitionName">
          <PickerCells
            ref="pickerCellsRef"
            :key="pageTitleDay"
            v-slot="{ cell }"
            :bootstrap-styling="bootstrapStyling"
            :cells="cells"
            :is-rtl="isRtl"
            :show-edge-dates="showEdgeDates"
            :tabbable-cell-id="tabbableCellId"
            view="day"
            @arrow="handleArrow($event)"
            @select="select($event)"
          >
            <slot
              name="dayCellContent"
              :cell="cell"
            >
              {{ dayCellContent(cell) }}
            </slot>
          </PickerCells>
        </Transition>
      </div>
    </div>

    <div v-if="$slots.calendarFooterDay">
      <slot name="calendarFooterDay" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, toRefs } from 'vue'
import makeDateUtils from '~/utils/DateUtils'
import useDisabledDates from '../composables/useDisabledDates'
import useHighlighted from '../composables/useHighlighted'
import useNavigation from '../composables/useNavigation'
import PickerCells from './PickerCells.vue'
import PickerHeader from './PickerHeader.vue'

const props = defineProps({
  bootstrapStyling: {
    type: Boolean,
    default: false,
  },
  disabledDates: {
    type: Object,
    default: null,
  },
  isRtl: {
    type: Boolean,
    default: false,
  },
  isTypeable: {
    type: Boolean,
    default: false,
  },
  isUpDisabled: {
    type: Boolean,
    default: false,
  },
  isMinimumView: {
    type: Boolean,
    default: true,
  },
  openDate: {
    type: [String, Date, Number],
    default: null,
  },
  pageDate: {
    type: Date,
    default: null,
  },
  selectedDate: {
    type: Date,
    default: null,
  },
  showHeader: {
    type: Boolean,
    default: true,
  },
  slideDuration: {
    type: Number,
    default: 250,
  },
  tabbableCellId: {
    type: Number,
    default: null,
  },
  transitionName: {
    type: String,
    default: '',
  },
  translation: {
    type: Object,
    default() {
      return {}
    },
  },
  useUtc: {
    type: Boolean,
    default: false,
  },
  view: {
    type: String,
    default: 'day',
  },
  dayCellContent: {
    type: Function,
    default: (day) => day.date,
  },
  firstDayOfWeek: {
    type: String,
    default: 'sun',
  },
  highlighted: {
    type: Object,
    default() {
      return {}
    },
  },
  showFullMonthName: {
    type: Boolean,
    default: false,
  },
  showEdgeDates: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits({
  pageChange: (config) => {
    return typeof config === 'object'
  },
  select: (cell) => {
    return typeof cell === 'object'
  },
  setSkipReviewFocus: (value) => {
    return typeof value === 'boolean'
  },
  setTransitionName: (incrementBy) => {
    return incrementBy === -1 || incrementBy === 1
  },
  setFocus: (refArray) => {
    return refArray.every((refAttr) => {
      return ['input', 'prev', 'up', 'next', 'tabbableCell'].includes(refAttr)
    })
  },
  setView: (view) => {
    return view === 'month'
  },
})

const {
  disabledDates,
  highlighted,
  pageDate,
  slideDuration,
  useUtc,
  view,
} = toRefs(props)

const utils = makeDateUtils(useUtc.value)
const pickerCellsRef = ref(null)
const pickerHeaderRef = ref(null)
const { isPreviousDisabled, isNextDisabled, isDisabledDate } = useDisabledDates(
  disabledDates,
  {
    pageDate,
    useUtc,
    view,
  },
)
const { isHighlightedDate, isHighlightEnd, isHighlightStart } = useHighlighted(
  highlighted,
  {
    disabledDates,
    utils,
  },
)

// computed
/**
 * Returns the current page's full year as an integer.
 * @return {Number}
 */
const pageYear = computed(() => {
  return utils.getFullYear(props.pageDate)
})
/**
 * Returns the current page's month as an integer.
 * @return {Number}
 */
const pageMonth = computed(() => {
  return utils.getMonth(props.pageDate)
})
/**
 * Gets the name of the month the current page is on
 * @return {String}
 */
const currMonthName = computed(() => {
  const monthName = props.showFullMonthName
    ? props.translation.months
    : props.translation.monthsAbbr

  return utils.getMonthNameAbbr(pageMonth.value, monthName)
})
/**
 * Gets the name of the year that current page is on
 * @return {String}
 */
const currYearName = computed(() => {
  const { yearSuffix } = props.translation
  return `${pageYear.value}${yearSuffix}`
})
/**
 * Returns first-day-of-week as a number (Sunday is 0)
 * @return {Number}
 */
const firstDayOfWeekNumber = computed(() => {
  return utils.getDayFromAbbr(props.firstDayOfWeek)
})
/**
 * Returns an array of day names
 * @return {String[]}
 */
const daysOfWeek = computed(() => {
  return props.translation.getDaysStartingOn(firstDayOfWeekNumber.value)
})
/**
 * Returns the number of days in this month
 * @return {String[]}
 */
const daysInMonth = computed(() => {
  return utils.getDaysInMonth(props.pageDate)
})
/**
 * Calculates how many days to show from the previous month
 * @return {number}
 */
const daysFromPrevMonth = computed(() => {
  const firstOfMonthDayNumber = utils.getDay(props.pageDate)
  return (7 - firstDayOfWeekNumber.value + firstOfMonthDayNumber) % 7
})
/**
 * Calculates how many days to show from the next month
 * @return {number}
 */
const daysFromNextMonth = computed(() => {
  const daysThisAndPrevMonth = daysFromPrevMonth.value + daysInMonth.value
  return Math.ceil(daysThisAndPrevMonth / 7) * 7 - daysThisAndPrevMonth
})
/**
 * Sets an array with all days to show this month
 * @return {Array}
 */
const cells = computed(() => {
  const days = []
  const daysInCalendar =
    daysFromPrevMonth.value + daysInMonth.value + daysFromNextMonth.value
  const dObj = firstDayCellDate()

  for (let i = 0; i < daysInCalendar; i += 1) {
    days.push(makeDay(dObj))
    utils.setDate(dObj, utils.getDate(dObj) + 1)
  }

  return days
})
/**
 * The first day of the next page's month.
 * @return {Date}
 */
const firstOfNextMonth = computed(() => {
  const d = new Date(props.pageDate)
  return new Date(utils.setMonth(d, utils.getMonth(d) + 1))
})
/**
 * Display the current page's month & year as the title.
 * @return {String}
 */
const pageTitleDay = computed(() => {
  return props.translation.ymd
    ? `${currYearName.value} ${currMonthName.value}`
    : `${currMonthName.value} ${currYearName.value}`
})

// methods
const { handleArrow, changePage } = useNavigation(cells, pickerCellsRef, {
  emit,
  disabledDates,
  pageDate,
  slideDuration,
  useUtc,
  view,
})

/**
 * Focuses the input field, if typeable
 */
function focusInput() {
  if (props.isTypeable) {
    emit('setFocus', ['input'])
  }
}

/**
 * Determines which transition to use (for edge dates) and emits a 'select' event
 * @param {Object} cell
 */
function select(cell) {
  if (cell.isPreviousMonth) {
    emit('setTransitionName', -1)
  }

  if (cell.isNextMonth) {
    emit('setTransitionName', 1)
  }

  emit('select', cell)
}

/**
 * Set up a new date object to the first day of the current 'page'
 * @return {Date}
 */
function firstDayCellDate() {
  const pageDateNew = new Date(props.pageDate)

  return new Date(utils.setDate(pageDateNew, 1 - daysFromPrevMonth.value))
}

/**
 * Whether a day is selected
 * @param {Date} dObj to check if selected
 * @return {Boolean}
 */
function isSelectedDate(dObj) {
  if (!props.selectedDate) return false

  return utils.compareDates(props.selectedDate, dObj)
}

/**
 * Defines the objects within the days array
 * @param  {Date} dObj
 * @return {Object}
 */
// eslint-disable-next-line complexity
function makeDay(dObj) {
  const dayOfWeek = utils.getDay(dObj)
  const isNextMonth = dObj >= firstOfNextMonth.value
  const isPreviousMonth = dObj < props.pageDate
  const isSaturday = dayOfWeek === 6
  const isSunday = dayOfWeek === 0
  const showDate = props.showEdgeDates || !(isPreviousMonth || isNextMonth)

  return {
    date: showDate ? utils.getDate(dObj) : '',
    timestamp: dObj.valueOf(),
    isSelected: isSelectedDate(dObj),
    isDisabled: showDate ? isDisabledDate(dObj) : true,
    isHighlighted: isHighlightedDate(dObj),
    isHighlightStart: isHighlightStart(dObj),
    isHighlightEnd: isHighlightEnd(dObj),
    isOpenDate: utils.compareDates(dObj, props.openDate),
    isToday: utils.compareDates(dObj, utils.getNewDateObject()),
    isWeekend: isSaturday || isSunday,
    isSaturday,
    isSunday,
    isPreviousMonth,
    isNextMonth,
  }
}

defineExpose({ cells, pickerCellsRef, pickerHeaderRef })
</script>
