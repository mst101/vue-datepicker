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
import { ref, computed, nextTick } from 'vue'
import makeDateUtils from '~/utils/DateUtils'
import DisabledDate from '~/utils/DisabledDate'
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

const utils = makeDateUtils(props.useUtc)
const pickerCellsRef = ref(null)

// computed
/**
 * A look-up object created from 'disabledDates' prop
 * @return {Object}
 */
const disabledConfig = computed(() => {
  if (!props.disabledDates) {
    return {
      has: {
        from: false,
        to: false,
      },
    }
  }

  return new DisabledDate(utils, props.disabledDates).config
})

const earliestPossibleDate = computed(() => {
  if (!props.disabledDates) return null

  return new DisabledDate(utils, props.disabledDates).getEarliestPossibleDate(
    props.disabledDates.to,
  )
})

const latestPossibleDate = computed(() => {
  if (!props.disabledDates) return null

  return new DisabledDate(utils, props.disabledDates).getLatestPossibleDate(
    props.disabledDates.from,
  )
})

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
 * Is the next decade disabled?
 * @return {Boolean}
 */
const isNextDisabled = computed(() => {
  if (!disabledConfig.value.has.from) {
    return false
  }
  const firstDayOfNextDecade = new Date(pageDecadeEnd.value + 1, 0, 1)
  return latestPossibleDate.value < firstDayOfNextDecade
})

/**
 * Is the previous decade disabled?
 * @return {Boolean}
 */
const isPreviousDisabled = computed(() => {
  if (!disabledConfig.value.has.to) {
    return false
  }
  const lastDayOfPreviousDecade = new Date(pageDecadeStart.value - 1, 11, 31)
  return earliestPossibleDate.value > lastDayOfPreviousDecade
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
    props.view === 'year' ? incrementBy * props.yearRange : incrementBy

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
 * Set up a new date object to the first year of the current 'page'
 * @return {Date}
 */
function firstYearCellDate() {
  const pageDate = new Date(props.pageDate)
  const firstYear =
    Math.floor(utils.getFullYear(pageDate) / props.yearRange) * props.yearRange

  const date = new Date(utils.setFullYear(pageDate, firstYear))

  return utils.adjustDateToView(date, 'year')
}

/**
 * Whether a year is disabled
 * @param {Date} date
 * @return {Boolean}
 */
function isDisabledYear(date) {
  if (!props.disabledDates) return false

  return new DisabledDate(utils, props.disabledDates).isYearDisabled(date)
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
</script>
