<template>
  <div>
    <div v-if="$slots.beforeCalendarHeaderMonth">
      <slot name="beforeCalendarHeaderMonth" />
    </div>

    <PickerHeader
      v-if="showHeader"
      ref="pickerHeaderRef"
      :bootstrap-styling="bootstrapStyling"
      :is-next-disabled="isNextDisabled"
      :is-previous-disabled="isPreviousDisabled"
      :is-rtl="isRtl"
      :is-up-disabled="isUpDisabled"
      next-view-up="year"
      @focus-input="focusInput"
      @page-change="changePage($event)"
      @set-focus="emit('setFocus', $event)"
      @set-view="emit('setView', $event)"
    >
      <template #prevIntervalBtn>
        <slot name="prevIntervalBtn" />
      </template>
      {{ pageTitleMonth }}
      <template #nextIntervalBtn>
        <slot name="nextIntervalBtn" />
      </template>
    </PickerHeader>

    <div class="cells-wrapper">
      <Transition :name="transitionName">
        <PickerCells
          ref="pickerCellsRef"
          :key="pageTitleMonth"
          v-slot="{ cell }"
          :bootstrap-styling="bootstrapStyling"
          :cells="cells"
          :is-rtl="isRtl"
          :tabbable-cell-id="tabbableCellId"
          view="month"
          @arrow="handleArrow($event)"
          @select="select($event)"
        >
          {{ cell.month }}
        </PickerCells>
      </Transition>
    </div>

    <div v-if="$slots.calendarFooterMonth">
      <slot name="calendarFooterMonth" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, toRefs } from 'vue'
import useDateUtils from '../composables/useDateUtils'
import useDisabledDates from '../composables/useDisabledDates'
import useNavigation from '../composables/useNavigation'
import usePageYear from '../composables/usePageYear'
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
    return view === 'year'
  },
})

const { disabledDates, pageDate, slideDuration, isTypeable, useUtc, view } = toRefs(props)

const utils = useDateUtils(useUtc)
const pickerCellsRef = ref(null)
const pickerHeaderRef = ref(null)
const { isPreviousDisabled, isNextDisabled, isDisabledMonth } =
  useDisabledDates(disabledDates, {
    pageDate,
    useUtc,
    view,
  })

// computed
/**
 * Returns the current page's full year as an integer.
 * @return {Number}
 */
const pageYear = usePageYear(pageDate, utils.getFullYear)

/**
 * Sets an array with all months to show this year
 * @return {Array}
 */
const cells = computed(() => {
  const months = []
  const dObj = firstMonthCellDate()

  for (let i = 0; i < 12; i += 1) {
    months.push({
      month: utils.getMonthName(i, props.translation.months),
      timestamp: dObj.valueOf(),
      isDisabled: isDisabledMonth(dObj),
      isOpenDate: isOpenMonth(dObj),
      isSelected: isSelectedMonth(dObj),
      isToday: isTodayMonth(dObj),
    })
    utils.setMonth(dObj, utils.getMonth(dObj) + 1)
  }

  return months
})

/**
 * Display the current page's year as the title.
 * @return {String}
 */
const pageTitleMonth = computed(() => {
  const { yearSuffix } = props.translation
  return `${pageYear.value}${yearSuffix}`
})

// methods
const { changePage, focusInput, handleArrow, select } = useNavigation(
  cells,
  pickerCellsRef,
  {
    emit,
    disabledDates,
    pageDate,
    slideDuration,
    isTypeable,
    useUtc,
    view,
  },
)

/**
 * Set up a new date object to the first month of the current 'page'
 * @return {Date}
 */
function firstMonthCellDate() {
  const pageDateNew = new Date(props.pageDate)

  return new Date(utils.setMonth(pageDateNew, 0))
}

/**
 * Should the calendar open on this month?
 * @param {Date} date
 * @return {Boolean}
 */
function isOpenMonth(date) {
  if (!props.openDate) return false

  const openDateMonth = utils.getMonth(props.openDate)
  const openDateYear = utils.getFullYear(props.openDate)
  const thisDateMonth = utils.getMonth(date)
  const thisDateYear = utils.getFullYear(date)

  return openDateMonth === thisDateMonth && openDateYear === thisDateYear
}

/**
 * Whether the selected date is in this month
 * @param {Date} date
 * @return {Boolean}
 */
function isSelectedMonth(date) {
  if (!props.selectedDate) return false

  const month = utils.getMonth(date)
  const year = utils.getFullYear(date)

  return (
    props.selectedDate &&
    year === utils.getFullYear(props.selectedDate) &&
    month === utils.getMonth(props.selectedDate)
  )
}

/**
 * Whether the date has the same month and year as today's date
 * @param {Date} date
 * @return {Boolean}
 */
function isTodayMonth(date) {
  const todayMonth = new Date(utils.setDate(utils.getNewDateObject(), 1))

  return utils.compareDates(date, todayMonth)
}

defineExpose({ cells, pickerCellsRef, pickerHeaderRef })
</script>
