<template>
  <div>
    <div v-if="$slots.beforeCalendarHeaderYear">
      <slot name="beforeCalendarHeaderYear" />
    </div>

    <PickerHeader
      v-if="showHeader"
      ref="pickerHeaderRef"
      :bootstrap-styling="bootstrapStyling"
      :is-next-disabled="isNextDisabled"
      :is-previous-disabled="isPreviousDisabled"
      :is-rtl="isRtl"
      :is-up-disabled="true"
      @focus-input="focusInput"
      @page-change="changePage($event)"
      @set-focus="emit('setFocus', $event)"
    >
      <template #prevIntervalBtn>
        <slot name="prevIntervalBtn" />
      </template>
      {{ pageTitleYear }}
      <template #nextIntervalBtn>
        <slot name="nextIntervalBtn" />
      </template>
    </PickerHeader>

    <div class="cells-wrapper">
      <Transition :name="transitionName">
        <PickerCells
          ref="pickerCellsRef"
          :key="pageTitleYear"
          v-slot="{ cell }"
          :bootstrap-styling="bootstrapStyling"
          :cells="cells"
          :is-rtl="isRtl"
          :tabbable-cell-id="tabbableCellId"
          view="year"
          @arrow="handleArrow($event)"
          @select="select($event)"
        >
          {{ cell.year }}
        </PickerCells>
      </Transition>
    </div>

    <div v-if="$slots.calendarFooterYear">
      <slot name="calendarFooterYear" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, toRefs } from 'vue'
import makeDateUtils from '~/utils/DateUtils'
import useDisabledDates from '../composables/useDisabledDates'
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
  yearRange: {
    type: Number,
    default: 10,
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
})

const { disabledDates, pageDate, slideDuration, useUtc, view, yearRange } =
  toRefs(props)

const utils = makeDateUtils(useUtc.value)
const pickerCellsRef = ref(null)
const pickerHeaderRef = ref(null)
const { isPreviousDisabled, isNextDisabled, isDisabledYear } = useDisabledDates(
  props.disabledDates,
  {
    pageDate,
    useUtc,
    view,
    yearRange,
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
 * Sets an array with all years to show this decade (or yearRange)
 * @return {Array}
 */
const cells = computed(() => {
  const years = []
  const dObj = firstYearCellDate()

  for (let i = 0; i < props.yearRange; i += 1) {
    years.push({
      year: utils.getFullYear(dObj),
      timestamp: dObj.valueOf(),
      isDisabled: isDisabledYear(dObj),
      isOpenDate: isOpenYear(dObj),
      isSelected: isSelectedYear(dObj),
      isToday: isTodayYear(dObj),
    })
    utils.setFullYear(dObj, utils.getFullYear(dObj) + 1)
  }

  // Fill any remaining cells with blanks to position trailing cells correctly when rtl
  const cellsInGrid = Math.ceil(props.yearRange / 3) * 3
  for (let i = years.length; i < cellsInGrid; i += 1) {
    years.push({
      id: i,
      isDisabled: true,
    })
  }

  return years
})

/**
 * The year at which the current yearRange starts
 * @return {Number}
 */
const pageDecadeStart = computed(() => {
  return Math.floor(pageYear.value / props.yearRange) * props.yearRange
})

/**
 * The year at which the current yearRange ends
 * @return {Number}
 */
const pageDecadeEnd = computed(() => {
  return pageDecadeStart.value + props.yearRange - 1
})

/**
 * Display the current page's decade (or year range) as the title.
 * @return {String}
 */
const pageTitleYear = computed(() => {
  const { yearSuffix } = props.translation
  return `${pageDecadeStart.value} - ${pageDecadeEnd.value}${yearSuffix}`
})

// methods
const { handleArrow, changePage } = useNavigation(cells, pickerCellsRef, {
  emit,
  disabledDates,
  pageDate,
  slideDuration,
  useUtc,
  view,
  yearRange,
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
 * Set up a new date object to the first year of the current 'page'
 * @return {Date}
 */
function firstYearCellDate() {
  const pageDateNew = new Date(props.pageDate)
  const firstYear =
    Math.floor(utils.getFullYear(pageDateNew) / props.yearRange) * props.yearRange

  const date = new Date(utils.setFullYear(pageDateNew, firstYear))

  return utils.adjustDateToView(date, 'year')
}

/**
 * Should the calendar open on this year?
 * @param {Date} date
 * @return {Boolean}
 */
function isOpenYear(date) {
  if (!props.openDate) return false

  const openDateYear = utils.getFullYear(props.openDate)
  const thisDateYear = utils.getFullYear(date)

  return openDateYear === thisDateYear
}

/**
 * Whether the selected date is in this year
 * @param {Date} date
 * @return {Boolean}
 */
function isSelectedYear(date) {
  if (!props.selectedDate) return false

  const year = utils.getFullYear(date)

  return props.selectedDate && year === utils.getFullYear(props.selectedDate)
}

/**
 * Whether the date has the same year as today's date
 * @param {Date} date
 * @return {Boolean}
 */
function isTodayYear(date) {
  const todayYear = utils.getFullYear(utils.getNewDateObject())

  return utils.getFullYear(date) === todayYear
}

defineExpose({ cells, pickerCellsRef, pickerHeaderRef })
</script>
