<template>
  <div>
    <div v-if="$slots.beforeCalendarHeaderDay">
      <slot name="beforeCalendarHeaderDay" />
    </div>

    <PickerHeader
      v-if="showHeader"
      ref="pickerHeader"
      :bootstrap-styling="bootstrapStyling"
      :is-next-disabled="isNextDisabled"
      :is-previous-disabled="isPreviousDisabled"
      :is-rtl="isRtl"
      :is-up-disabled="isUpDisabled"
      next-view-up="month"
      @focus-input="focusInput"
      @page-change="changePage($event)"
      @set-focus="$emit('setFocus', $event)"
      @set-view="$emit('setView', $event)"
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
            ref="pickerCells"
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

<script>
import makeDateUtils from '~/utils/DateUtils'
import DisabledDate from '~/utils/DisabledDate'
import HighlightedDate from '~/utils/HighlightedDate'
import PickerCells from './PickerCells.vue'
import PickerHeader from './PickerHeader.vue'

export default {
  name: 'PickerDay',
  components: { PickerCells, PickerHeader },
  props: {
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
  },
  emits: {
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
      return refArray.every((ref) => {
        return ['input', 'prev', 'up', 'next', 'tabbableCell'].includes(ref)
      })
    },
    setView: (view) => {
      return view === 'month'
    },
  },
  data() {
    return {
      utils: makeDateUtils(this.useUtc),
    }
  },
  computed: {
    /**
     * A look-up object created from 'disabledDates' prop
     * @return {Object}
     */
    disabledConfig() {
      if (!this.disabledDates) {
        return {
          has: {
            from: false,
            to: false,
          },
        }
      }

      return new DisabledDate(this.utils, this.disabledDates).config
    },
    earliestPossibleDate() {
      if (!this.disabledDates) return null

      return new DisabledDate(
        this.utils,
        this.disabledDates,
      ).getEarliestPossibleDate(this.disabledDates.to)
    },
    latestPossibleDate() {
      if (!this.disabledDates) return null

      return new DisabledDate(
        this.utils,
        this.disabledDates,
      ).getLatestPossibleDate(this.disabledDates.from)
    },
    /**
     * Returns the current page's full year as an integer.
     * @return {Number}
     */
    pageYear() {
      return this.utils.getFullYear(this.pageDate)
    },
    /**
     * Sets an array with all days to show this month
     * @return {Array}
     */
    cells() {
      const days = []
      const daysInCalendar =
        this.daysFromPrevMonth + this.daysInMonth + this.daysFromNextMonth
      const dObj = this.firstDayCellDate()

      for (let i = 0; i < daysInCalendar; i += 1) {
        days.push(this.makeDay(dObj))
        this.utils.setDate(dObj, this.utils.getDate(dObj) + 1)
      }

      return days
    },
    /**
     * Gets the name of the month the current page is on
     * @return {String}
     */
    currMonthName() {
      const monthName = this.showFullMonthName
        ? this.translation.months
        : this.translation.monthsAbbr

      return this.utils.getMonthNameAbbr(this.pageMonth, monthName)
    },
    /**
     * Gets the name of the year that current page is on
     * @return {String}
     */
    currYearName() {
      const { yearSuffix } = this.translation
      return `${this.pageYear}${yearSuffix}`
    },
    /**
     * Returns an array of day names
     * @return {String[]}
     */
    daysOfWeek() {
      return this.translation.getDaysStartingOn(this.firstDayOfWeekNumber)
    },
    /**
     * Returns the number of days in this month
     * @return {String[]}
     */
    daysInMonth() {
      return this.utils.getDaysInMonth(this.pageDate)
    },
    /**
     * Calculates how many days to show from the previous month
     * @return {number}
     */
    daysFromPrevMonth() {
      const firstOfMonthDayNumber = this.utils.getDay(this.pageDate)
      return (7 - this.firstDayOfWeekNumber + firstOfMonthDayNumber) % 7
    },
    /**
     * Calculates how many days to show from the next month
     * @return {number}
     */
    daysFromNextMonth() {
      const daysThisAndPrevMonth = this.daysFromPrevMonth + this.daysInMonth
      return Math.ceil(daysThisAndPrevMonth / 7) * 7 - daysThisAndPrevMonth
    },
    /**
     * Returns first-day-of-week as a number (Sunday is 0)
     * @return {Number}
     */
    firstDayOfWeekNumber() {
      return this.utils.getDayFromAbbr(this.firstDayOfWeek)
    },
    /**
     * The first day of the next page's month.
     * @return {Date}
     */
    firstOfNextMonth() {
      const d = new Date(this.pageDate)
      return new Date(this.utils.setMonth(d, this.utils.getMonth(d) + 1))
    },
    /**
     * Is the next month disabled?
     * @return {Boolean}
     */
    isNextDisabled() {
      if (!this.disabledConfig.has.from) {
        return false
      }

      return this.latestPossibleDate < this.firstOfNextMonth
    },
    /**
     * Is the previous month disabled?
     * @return {Boolean}
     */
    isPreviousDisabled() {
      if (!this.disabledConfig.has.to) {
        return false
      }

      return this.earliestPossibleDate > this.lastOfPreviousMonth
    },
    /**
     * The first day of the next page's month.
     * @return {Date}
     */
    lastOfPreviousMonth() {
      const d = new Date(this.pageDate)
      return new Date(this.utils.setDate(d, 0))
    },
    /**
     * Returns the current page's month as an integer.
     * @return {Number}
     */
    pageMonth() {
      return this.utils.getMonth(this.pageDate)
    },
    /**
     * Display the current page's month & year as the title.
     * @return {String}
     */
    pageTitleDay() {
      return this.translation.ymd
        ? `${this.currYearName} ${this.currMonthName}`
        : `${this.currMonthName} ${this.currYearName}`
    },
  },
  methods: {
    /**
     * Used when an arrow key press would cause the focus to land on a disabled date
     * @param {Object} options
     */
    addMoreSteps(options) {
      if (options.stepsRemaining <= 0 && Math.abs(options.delta) > 1) {
        return Math.abs(options.delta)
      }
      return options.stepsRemaining
    },
    /**
     * Changes the page up or down
     * @param {Number} incrementBy
     * @param {[String]} focusRefs
     */
    changePage({ incrementBy, focusRefs }) {
      const { pageDate, utils } = this
      const units =
        this.view === 'year' ? incrementBy * this.yearRange : incrementBy

      this.$emit('setTransitionName', incrementBy)

      if (this.view === 'day') {
        utils.setMonth(pageDate, utils.getMonth(pageDate) + units)
      } else {
        utils.setFullYear(pageDate, utils.getFullYear(pageDate) + units)
      }

      this.$emit('pageChange', { focusRefs, pageDate })
    },
    /**
     * Changes the page and focuses the cell that is being 'arrowed' to
     * @param {Object} options
     */
    changePageAndSetFocus(options) {
      const { delta } = options
      const isPageDisabled =
        (delta > 0 && this.isNextDisabled) ||
        (delta < 0 && this.isPreviousDisabled)

      if (isPageDisabled) {
        return
      }

      this.$emit('setSkipReviewFocus', true)

      this.changePage({
        incrementBy: Math.sign(delta),
        focusRefs: ['arrow-to-cell'],
      })

      this.$nextTick(() => {
        this.setFocusOnNewPage(options)
        this.$emit('setSkipReviewFocus', false)
      })
    },
    /**
     * Focuses the input field, if typeable
     */
    focusInput() {
      if (this.isTypeable) {
        this.$emit('setFocus', ['input'])
      }
    },
    /**
     * Returns the element that should be focused when navigating via an arrow key
     * @param  {HTMLButtonElement} currentElement  The element currently being iterated on
     * @param  {Number}            delta           The number of cells that the focus should move
     * @param  {Number}            stepsRemaining  The number of steps remaining in the iteration
     * @return {HTMLButtonElement | void}
     */
    // eslint-disable-next-line complexity,max-statements
    getElement({ currentElement, delta, stepsRemaining }) {
      const element = this.getElementSibling(currentElement, delta)
      const options = {
        currentElement: element,
        delta,
        stepsRemaining: stepsRemaining - 1,
      }

      if (!element) {
        return this.changePageAndSetFocus(options)
      }

      if (this.isBeyondPossibleDate(options)) {
        return this.firstOrLastPossibleDate(options)
      }

      if (this.isMutedOrDisabled(element)) {
        options.stepsRemaining = this.addMoreSteps(options)

        return this.getElement(options)
      }

      if (stepsRemaining > 1 && options.currentElement) {
        return this.getElement(options)
      }

      return element
    },
    /**
     * Returns the element directly next to the currentElement
     * @param  {HTMLButtonElement} currentElement The element currently being iterated on
     * @param  {Number}            delta          The number of cells that the focus should move
     * @return {HTMLButtonElement}
     */
    getElementSibling(currentElement, delta) {
      const isNext = delta > 0

      return isNext
        ? currentElement.nextElementSibling
        : currentElement.previousElementSibling
    },
    /**
     * Returns the first or last cell, depending on the direction of the search
     * @param  {Number} delta The number of cells that the focus should move
     * @return {HTMLButtonElement}
     */
    getFirstOrLastElement(delta) {
      const isNext = delta > 0
      const elements = this.$refs.pickerCells.$el.children

      return isNext ? elements[0] : elements[elements.length - 1]
    },
    /**
     * Returns the first or last non-disabled date, depending on the direction of the search
     * @param  {HTMLButtonElement} currentElement  The element currently being iterated on
     * @param  {Number}            delta           The number of cells that the focus should move
     */
    firstOrLastPossibleDate({ currentElement, delta }) {
      if (delta > 0) {
        return this.getElementSibling(currentElement, -1)
      }

      return this.getElementSibling(currentElement, 1)
    },
    /**
     * Moves the focused cell up/down/left/right
     * @param {Object}
     */
    handleArrow({ delta }) {
      const activeElement = document.activeElement.shadowRoot
        ? document.activeElement.shadowRoot.activeElement
        : document.activeElement
      const stepsRemaining = Math.abs(delta)
      const options = {
        currentElement: activeElement,
        delta,
        stepsRemaining,
      }

      this.setFocusToAvailableCell(options)
    },
    /**
     * Determines which transition to use (for edge dates) and emits a 'select' event
     * @param {Object} cell
     */
    select(cell) {
      if (cell.isPreviousMonth) {
        this.$emit('setTransitionName', -1)
      }

      if (cell.isNextMonth) {
        this.$emit('setTransitionName', 1)
      }

      this.$emit('select', cell)
    },
    /**
     * Returns true if the given element cannot be focused
     * @param  {HTMLButtonElement} currentElement  The element currently being iterated on
     * @param  {Number}            delta           The number of cells that the focus should move
     * @return {Boolean}
     */
    isBeyondPossibleDate({ currentElement, delta }) {
      if (delta > 0 && this.latestPossibleDate) {
        return this.isDatePossible(currentElement, delta)
      }

      if (delta < 0 && this.earliestPossibleDate) {
        return this.isDatePossible(currentElement, delta)
      }

      return false
    },
    /**
     * Returns true if the current element's date is NOT possible, given the `disabled-dates`
     * @param  {HTMLButtonElement} element The element in question
     * @param  {Number}            delta   Used to determine direction of travel
     * @return {Boolean}
     */
    isDatePossible(element, delta) {
      const cellId = element.getAttribute('data-id')
      const cellDate = new Date(this.cells[cellId].timestamp)

      if (delta > 0) {
        return (
          cellDate >
          this.utils.adjustDateToView(this.latestPossibleDate, this.view)
        )
      }

      return (
        cellDate <
        this.utils.adjustDateToView(this.earliestPossibleDate, this.view)
      )
    },
    /**
     * Returns true if the given element cannot be focused
     * @param  {HTMLButtonElement} element The element in question
     * @return {Boolean}
     */
    isMutedOrDisabled(element) {
      const isMuted = element.classList.value.split(' ').includes('muted')
      const isDisabled = element.disabled

      return isMuted || isDisabled
    },
    /**
     * Sets the focus on the correct cell following a page change
     * @param {Object} options
     */
    // eslint-disable-next-line max-statements
    setFocusOnNewPage({ delta, stepsRemaining }) {
      const currentElement = this.getFirstOrLastElement(delta)
      const options = {
        currentElement,
        delta,
        stepsRemaining,
      }
      const delay = this.slideDuration

      if (stepsRemaining <= 0) {
        if (this.isMutedOrDisabled(currentElement)) {
          options.stepsRemaining = Math.abs(options.delta)

          setTimeout(() => {
            this.setFocusToAvailableCell(options)
          }, delay)

          return
        }

        setTimeout(() => {
          currentElement.focus()
        }, delay)

        return
      }

      setTimeout(() => {
        this.setFocusToAvailableCell(options)
      }, delay)
    },
    /**
     * Sets the focus on the next focusable cell when an arrow key is pressed
     * @param {Object} options
     */
    setFocusToAvailableCell(options) {
      const element = this.getElement(options)

      if (element) {
        element.focus()
      }
    },
    /**
     * Set up a new date object to the first day of the current 'page'
     * @return {Date}
     */
    firstDayCellDate() {
      const pageDate = new Date(this.pageDate)

      return new Date(this.utils.setDate(pageDate, 1 - this.daysFromPrevMonth))
    },
    /**
     * Whether a day is disabled
     * @param {Date} date to check if disabled
     * @return {Boolean}
     */
    isDisabledDate(date) {
      if (!this.disabledDates) return false

      return new DisabledDate(this.utils, this.disabledDates).isDateDisabled(
        date,
      )
    },
    /**
     * Whether a day is highlighted (N.B. Disabled dates are not highlighted unless
     * `highlighted.includeDisabled` is true)
     * @param {Date} date to check if highlighted
     * @return {Boolean}
     */
    isHighlightedDate(date) {
      if (!this.highlighted) return false

      return new HighlightedDate(
        this.utils,
        this.disabledDates,
        this.highlighted,
      ).isDateHighlighted(date)
    },
    /**
     * Whether a date is the last in a range of highlighted dates
     * @param {Date} date
     * @return {Boolean}
     */
    isHighlightEnd(date) {
      if (!this.highlighted) return false

      return new HighlightedDate(
        this.utils,
        this.disabledDates,
        this.highlighted,
      ).isHighlightEnd(date)
    },
    /**
     * Whether a date is the first in a range of highlighted dates
     * @param {Date} date
     * @return {Boolean}
     */
    isHighlightStart(date) {
      if (!this.highlighted) return false

      return new HighlightedDate(
        this.utils,
        this.disabledDates,
        this.highlighted,
      ).isHighlightStart(date)
    },
    /**
     * Whether a day is selected
     * @param {Date} dObj to check if selected
     * @return {Boolean}
     */
    isSelectedDate(dObj) {
      if (!this.selectedDate) return false

      return this.utils.compareDates(this.selectedDate, dObj)
    },
    /**
     * Defines the objects within the days array
     * @param  {Date} dObj
     * @return {Object}
     */
    // eslint-disable-next-line complexity
    makeDay(dObj) {
      const { utils } = this
      const dayOfWeek = utils.getDay(dObj)
      const isNextMonth = dObj >= this.firstOfNextMonth
      const isPreviousMonth = dObj < this.pageDate
      const isSaturday = dayOfWeek === 6
      const isSunday = dayOfWeek === 0
      const showDate = this.showEdgeDates || !(isPreviousMonth || isNextMonth)

      return {
        date: showDate ? utils.getDate(dObj) : '',
        timestamp: dObj.valueOf(),
        isSelected: this.isSelectedDate(dObj),
        isDisabled: showDate ? this.isDisabledDate(dObj) : true,
        isHighlighted: this.isHighlightedDate(dObj),
        isHighlightStart: this.isHighlightStart(dObj),
        isHighlightEnd: this.isHighlightEnd(dObj),
        isOpenDate: utils.compareDates(dObj, this.openDate),
        isToday: utils.compareDates(dObj, utils.getNewDateObject()),
        isWeekend: isSaturday || isSunday,
        isSaturday,
        isSunday,
        isPreviousMonth,
        isNextMonth,
      }
    },
  },
}
</script>
