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
import { ref, computed, nextTick } from 'vue'
import makeDateUtils from '~/utils/DateUtils'
import useDisabledDates from '../composables/useDisabledDates'
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

const utils = makeDateUtils(props.useUtc)
const pickerCellsRef = ref(null)
const pickerHeaderRef = ref(null)
const {
  earliestPossibleDate,
  latestPossibleDate,
  isPreviousDisabled,
  isNextDisabled,
  isDisabledMonth,
} = useDisabledDates(props.disabledDates, {
  pageDate: props.pageDate,
  useUtc: props.useUtc,
  view: 'month',
})

// computed
/**
 * Returns the current page's full year as an integer.
 * @return {Number}
 */
const pageYear = computed(() => {
  return utils.getFullYear(props.pageDate)
})

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
/**
 * Used when an arrow key press would cause the focus to land on a disabled date
 * @param {Object} options
 */
function addMoreSteps(options) {
  if (options.stepsRemaining <= 0 && Math.abs(options.delta) > 1) {
    return Math.abs(options.delta)
  }
  return options.stepsRemaining
}

/**
 * Changes the page up or down
 * @param {Number} incrementBy
 * @param {[String]} focusRefs
 */
function changePage({ incrementBy, focusRefs }) {
  const pageDate = new Date(props.pageDate)
  const units =
    props.view === 'year' ? incrementBy * this.yearRange : incrementBy

  emit('setTransitionName', incrementBy)

  if (props.view === 'day') {
    utils.setMonth(pageDate, utils.getMonth(pageDate) + units)
  } else {
    utils.setFullYear(pageDate, utils.getFullYear(pageDate) + units)
  }

  emit('pageChange', { focusRefs, pageDate })
}

/**
 * Changes the page and focuses the cell that is being 'arrowed' to
 * @param {Object} options
 */
function changePageAndSetFocus(options) {
  const { delta } = options
  const isPageDisabled =
    (delta > 0 && isNextDisabled.value) || (delta < 0 && isPreviousDisabled.value)

  if (isPageDisabled) {
    return
  }

  emit('setSkipReviewFocus', true)

  changePage({
    incrementBy: Math.sign(delta),
    focusRefs: ['arrow-to-cell'],
  })

  nextTick(() => {
    setFocusOnNewPage(options)
    emit('setSkipReviewFocus', false)
  })
}

/**
 * Focuses the input field, if typeable
 */
function focusInput() {
  if (props.isTypeable) {
    emit('setFocus', ['input'])
  }
}

/**
 * Returns the element that should be focused when navigating via an arrow key
 * @param  {HTMLButtonElement} currentElement  The element currently being iterated on
 * @param  {Number}            delta           The number of cells that the focus should move
 * @param  {Number}            stepsRemaining  The number of steps remaining in the iteration
 * @return {HTMLButtonElement | void}
 */
// eslint-disable-next-line complexity,max-statements
function getElement({ currentElement, delta, stepsRemaining }) {
  const element = getElementSibling(currentElement, delta)
  const options = {
    currentElement: element,
    delta,
    stepsRemaining: stepsRemaining - 1,
  }

  if (!element) {
    return changePageAndSetFocus(options)
  }

  if (isBeyondPossibleDate(options)) {
    return firstOrLastPossibleDate(options)
  }

  if (isMutedOrDisabled(element)) {
    options.stepsRemaining = addMoreSteps(options)

    return getElement(options)
  }

  if (stepsRemaining > 1 && options.currentElement) {
    return getElement(options)
  }

  return element
}

/**
 * Returns the element directly next to the currentElement
 * @param  {HTMLButtonElement} currentElement The element currently being iterated on
 * @param  {Number}            delta          The number of cells that the focus should move
 * @return {HTMLButtonElement}
 */
function getElementSibling(currentElement, delta) {
  const isNext = delta > 0

  return isNext
    ? currentElement.nextElementSibling
    : currentElement.previousElementSibling
}

/**
 * Returns the first or last cell, depending on the direction of the search
 * @param  {Number} delta The number of cells that the focus should move
 * @return {HTMLButtonElement}
 */
function getFirstOrLastElement(delta) {
  const isNext = delta > 0
  const elements = pickerCellsRef.value.$el.children

  return isNext ? elements[0] : elements[elements.length - 1]
}

/**
 * Returns the first or last non-disabled date, depending on the direction of the search
 * @param  {HTMLButtonElement} currentElement  The element currently being iterated on
 * @param  {Number}            delta           The number of cells that the focus should move
 */
function firstOrLastPossibleDate({ currentElement, delta }) {
  if (delta > 0) {
    return getElementSibling(currentElement, -1)
  }

  return getElementSibling(currentElement, 1)
}

/**
 * Moves the focused cell up/down/left/right
 * @param {Object}
 */
function handleArrow({ delta }) {
  const activeElement = document.activeElement.shadowRoot
    ? document.activeElement.shadowRoot.activeElement
    : document.activeElement
  const stepsRemaining = Math.abs(delta)
  const options = {
    currentElement: activeElement,
    delta,
    stepsRemaining,
  }

  setFocusToAvailableCell(options)
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
 * Returns true if the given element cannot be focused
 * @param  {HTMLButtonElement} currentElement  The element currently being iterated on
 * @param  {Number}            delta           The number of cells that the focus should move
 * @return {Boolean}
 */
function isBeyondPossibleDate({ currentElement, delta }) {
  if (delta > 0 && latestPossibleDate.value) {
    return isDatePossible(currentElement, delta)
  }

  if (delta < 0 && earliestPossibleDate.value) {
    return isDatePossible(currentElement, delta)
  }

  return false
}

/**
 * Returns true if the current element's date is NOT possible, given the `disabled-dates`
 * @param  {HTMLButtonElement} element The element in question
 * @param  {Number}            delta   Used to determine direction of travel
 * @return {Boolean}
 */
function isDatePossible(element, delta) {
  const cellId = element.getAttribute('data-id')
  const cellDate = new Date(cells.value[cellId].timestamp)

  if (delta > 0) {
    return (
      cellDate > utils.adjustDateToView(latestPossibleDate.value, props.view)
    )
  }

  return (
    cellDate < utils.adjustDateToView(earliestPossibleDate.value, props.view)
  )
}

/**
 * Returns true if the given element cannot be focused
 * @param  {HTMLButtonElement} element The element in question
 * @return {Boolean}
 */
function isMutedOrDisabled(element) {
  const isMuted = element.classList.value.split(' ').includes('muted')
  const isDisabled = element.disabled

  return isMuted || isDisabled
}

/**
 * Sets the focus on the correct cell following a page change
 * @param {Object} options
 */
// eslint-disable-next-line max-statements
function setFocusOnNewPage({ delta, stepsRemaining }) {
  const currentElement = getFirstOrLastElement(delta)
  const options = {
    currentElement,
    delta,
    stepsRemaining,
  }
  const delay = props.slideDuration

  if (stepsRemaining <= 0) {
    if (isMutedOrDisabled(currentElement)) {
      options.stepsRemaining = Math.abs(options.delta)

      setTimeout(() => {
        setFocusToAvailableCell(options)
      }, delay)

      return
    }

    setTimeout(() => {
      currentElement.focus()
    }, delay)

    return
  }

  setTimeout(() => {
    setFocusToAvailableCell(options)
  }, delay)
}

/**
 * Sets the focus on the next focusable cell when an arrow key is pressed
 * @param {Object} options
 */
function setFocusToAvailableCell(options) {
  const element = getElement(options)

  if (element) {
    element.focus()
  }
}

/**
 * Set up a new date object to the first month of the current 'page'
 * @return {Date}
 */
function firstMonthCellDate() {
  const pageDate = new Date(props.pageDate)

  return new Date(utils.setMonth(pageDate, 0))
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
