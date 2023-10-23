<template>
  <div
    :id="datepickerId"
    ref="datepicker"
    class="vdp-datepicker"
    :class="[wrapperClass, { rtl: isRtl }]"
    @focusin="handleFocusIn($event)"
    @focusout="handleFocusOut($event)"
    @keydown.esc="resetOrClose"
  >
    <DateInput
      :id="id"
      ref="dateInput"
      :autofocus="autofocus"
      :bootstrap-styling="bootstrapStyling"
      :calendar-button="calendarButton"
      :clear-button="clearButton"
      :disabled="disabled"
      :format="format"
      :inline="inline"
      :input-class="inputClass"
      :is-open="isOpen"
      :maxlength="maxlength"
      :name="name"
      :parser="parser"
      :pattern="pattern"
      :placeholder="placeholder"
      :ref-name="refName"
      :required="required"
      :selected-date="selectedDate"
      :show-calendar-on-button-click="showCalendarOnButtonClick"
      :show-calendar-on-focus="showCalendarOnFocus"
      :slide-duration="slideDuration"
      :tabindex="tabindex"
      :translation="translation"
      :typeable="typeable"
      :use-utc="useUtc"
      @clear-date="clearDate"
      @close="close"
      @open="open"
      @select-typed-date="selectTypedDate"
      @set-focus="setFocus($event)"
      @tab="tabThroughNavigation"
      @typed-date="handleTypedDate"
    >
      <template #beforeDateInput>
        <slot name="beforeDateInput" />
      </template>

      <template #afterDateInput>
        <slot name="afterDateInput" />
      </template>

      <template #clearBtn>
        <slot name="clearBtn" />
      </template>

      <template #calendarBtn>
        <slot name="calendarBtn" />
      </template>
    </DateInput>

    <Popup
      ref="popup"
      :append-to-body="appendToBody"
      :fixed-position="fixedPosition"
      :inline="inline"
      :rtl="isRtl"
      :visible="isOpen"
      @keydown.delete="clearDate"
    >
      <Transition name="toggle">
        <div
          v-show="isOpen"
          class="vdp-datepicker__calendar"
          :class="pickerClasses"
          data-test-calendar
          @mousedown.prevent
          @focusin.stop="handleFocusIn($event)"
          @focusout.stop="handleFocusOut($event)"
          @keydown.esc.stop="resetOrClose"
          @keydown.tab.stop="tabThroughNavigation($event)"
        >
          <Transition name="view">
            <div
              ref="view"
              :key="view"
            >
              <div v-if="$slots.beforeCalendarHeader">
                <slot name="beforeCalendarHeader" />
              </div>
              <Component
                :is="picker"
                ref="picker"
                :bootstrap-styling="bootstrapStyling"
                class="picker-view"
                :day-cell-content="dayCellContent"
                :disabled-dates="disabledDates"
                :first-day-of-week="firstDayOfWeek"
                :highlighted="highlighted"
                :is-rtl="isRtl"
                :is-typeable="typeable"
                :is-up-disabled="isUpDisabled"
                :is-minimum-view="isMinimumView"
                :open-date="computedOpenDate"
                :page-date="pageDate"
                :selected-date="selectedDate"
                :show-edge-dates="showEdgeDates"
                :show-full-month-name="fullMonthName"
                :show-header="showHeader"
                :slide-duration="slideDuration"
                :tabbable-cell-id="tabbableCellId"
                :transition-name="transitionName"
                :translation="translation"
                :use-utc="useUtc"
                :view="view || computedInitialView"
                :year-range="yearPickerRange"
                @page-change="handlePageChange"
                @select="handleSelect"
                @set-focus="setFocus($event)"
                @set-skip-review-focus="skipReviewFocus = $event"
                @set-transition-name="setTransitionName($event)"
                @set-view="setView"
              >
                <template
                  v-for="slotKey of usedCalendarSlots"
                  #[slotKey]
                >
                  <slot :name="slotKey" />
                </template>
                <template #dayCellContent="{ cell }">
                  <slot
                    v-if="cell"
                    name="dayCellContent"
                    :cell="cell"
                  />
                </template>
              </Component>
              <div v-if="$slots.calendarFooter">
                <slot name="calendarFooter" />
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Popup>
  </div>
</template>

<script>
import en from '~/locale/translations/en'
import calendarSlots from '~/utils/calendarSlots'
import DateInput from '~/components/DateInput.vue'
import DisabledDate from '~/utils/DisabledDate'
import inputProps from '~/mixins/inputProps.vue'
import makeDateUtils from '~/utils/DateUtils'
import PickerDay from '~/components/PickerDay.vue'
import PickerMonth from '~/components/PickerMonth.vue'
import PickerYear from '~/components/PickerYear.vue'
import Popup from '~/components/Popup.vue'

export default {
  name: 'DatePicker',
  components: {
    DateInput,
    PickerDay,
    PickerMonth,
    PickerYear,
    Popup,
  },
  mixins: [inputProps],
  props: {
    appendToBody: {
      type: Boolean,
      default: false,
    },
    calendarClass: {
      type: [String, Object, Array],
      default: '',
    },
    dayCellContent: {
      type: Function,
      default: (day) => day.date,
    },
    disabledDates: {
      type: Object,
      default: null,
    },
    firstDayOfWeek: {
      type: String,
      default: 'sun',
    },
    fixedPosition: {
      type: String,
      default: '',
      validator: (val) => {
        const possibleValues = [
          '',
          'bottom',
          'bottom-left',
          'bottom-right',
          'top',
          'top-left',
          'top-right',
        ]
        return possibleValues.includes(val)
      },
    },
    fullMonthName: {
      type: Boolean,
      default: null,
    },
    highlighted: {
      type: Object,
      default: null,
    },
    initialView: {
      type: String,
      default: '',
    },
    language: {
      type: Object,
      default: () => en,
    },
    maximumView: {
      type: String,
      default: 'year',
    },
    minimumView: {
      type: String,
      default: 'day',
    },
    modelValue: {
      type: [String, Date, Number],
      default: null,
    },
    showEdgeDates: {
      type: Boolean,
      default: true,
    },
    showHeader: {
      type: Boolean,
      default: true,
    },
    wrapperClass: {
      type: [String, Object, Array],
      default: '',
    },
    yearPickerRange: {
      type: Number,
      default: 10,
    },
  },
  emits: {
    'blur': null,
    'changed': null,
    'cleared': null,
    'closed': null,
    'focus': null,
    'opened': null,
    'changedMonth': (date) => {
      return typeof date === 'object'
    },
    'changedYear': (date) => {
      return typeof date === 'object'
    },
    'changedDecade': (date) => {
      return typeof date === 'object'
    },
    'selected': (date) => {
      return date instanceof Date || date === null
    },
    'update:modelValue': (date) => {
      return date instanceof Date || date === null
    },
  },
  data() {
    const utils = makeDateUtils(this.useUtc)
    const initialView = this.initialView || this.minimumView
    const openDate = utils.getOpenDate(
      this.openDate,
      this.selectedDate,
      initialView,
    )

    const pageTimestamp = utils.setDate(openDate, 1)

    return {
      focus: {
        delay: 0,
        refs: [],
      },
      inlineTabbableCell: null,
      isActive: false,
      isRevertingToOpenDate: false,
      navElements: [],
      navElementsFocusedIndex: 0,
      resetTabbableCell: false,
      skipReviewFocus: false,
      tabbableCell: null,
      transitionName: '',
      calendarHeight: 0,
      isClickOutside: false,
      globalDatepickerId: '',
      /*
       * The latest valid `typedDate` (used for typeable datepicker)
       * {Date}
       */
      latestValidTypedDate: null,
      /*
       * Vue cannot observe changes to a Date Object so date must be stored as a timestamp
       * This represents the first day of the current viewing month
       * {Number}
       */
      pageTimestamp,
      /*
       * Selected Date
       * {Date}
       */
      selectedDate: null,
      slideDuration: 250,
      utils,
      view: '',
    }
  },
  computed: {
    fallbackElementsToFocus() {
      const elements = ['tabbableCell', 'prev', 'next']

      if (this.typeable) {
        elements.unshift('input')
      }

      return elements
    },
    focusedDateTimestamp() {
      const pageDate = new Date(this.pageTimestamp)

      if (this.hasClass(this.tabbableCell, 'day')) {
        return this.utils.setDate(pageDate, this.tabbableCell.innerHTML.trim())
      }

      if (this.hasClass(this.tabbableCell, 'month')) {
        return this.utils.setMonth(pageDate, this.tabbableCellId)
      }

      const fullYear = this.utils.getFullYear(pageDate) - 1
      return this.utils.setFullYear(pageDate, fullYear + this.tabbableCellId)
    },
    tabbableCellId() {
      return (
        this.tabbableCell && Number(this.tabbableCell.getAttribute('data-id'))
      )
    },
    computedInitialView() {
      return this.initialView || this.minimumView
    },
    computedOpenDate() {
      return this.utils.getOpenDate(
        this.openDate,
        this.selectedDate,
        this.minimumView,
      )
    },
    datepickerId() {
      return `vdp-${Math.random().toString(36).slice(-10)}`
    },
    isInline() {
      return !!this.inline
    },
    isOpen() {
      return this.view !== ''
    },
    isMinimumView() {
      return this.view === this.minimumView
    },
    isRtl() {
      return this.translation.rtl
    },
    isUpDisabled() {
      return !this.allowedToShowView(this.nextView.up)
    },
    nextView() {
      const views = ['day', 'month', 'year']
      const isCurrentView = (view) => view === this.view
      const viewIndex = views.findIndex(isCurrentView)
      const nextViewDown = (index) => {
        return index <= 0 ? undefined : views[index - 1]
      }
      const nextViewUp = (index) => {
        if (index < 0) {
          return undefined
        }

        if (index === views.length - 1) {
          return 'decade'
        }

        return views[index + 1]
      }

      return {
        up: nextViewUp(viewIndex),
        down: nextViewDown(viewIndex),
      }
    },
    pageDate() {
      return new Date(this.pageTimestamp)
    },
    picker() {
      const view = this.view || this.computedInitialView
      return `Picker${this.ucFirst(view)}`
    },
    pickerClasses() {
      return [
        this.calendarClass,
        this.isInline && 'vdp-datepicker__calendar--inline',
        this.isRtl && this.appendToBody && 'rtl',
      ]
    },
    translation() {
      return this.language
    },
    usedCalendarSlots() {
      return calendarSlots.filter((slot) => this.hasSlot(slot))
    },
  },
  watch: {
    disabledDates: {
      // eslint-disable-next-line complexity
      handler() {
        const selectedDate =
          this.selectedDate || this.utils.parseAsDate(this.modelValue)

        if (!selectedDate) {
          return
        }

        if (this.isDateDisabled(selectedDate) && selectedDate) {
          this.selectDate(null)
          return
        }

        if (this.dateHasChanged(selectedDate)) {
          this.selectDate(selectedDate)
        }
      },
      deep: true,
    },
    initialView() {
      if (this.isOpen) {
        this.setInitialView()
      }
    },
    inline(isInline) {
      if (!isInline) {
        this.close()
      }
      this.setInitialView()
    },
    isActive(hasJustBecomeActive, isNoLongerActive) {
      if (hasJustBecomeActive) {
        this.datepickerIsActive()
      }

      if (isNoLongerActive) {
        this.datepickerIsInactive()
      }
    },
    latestValidTypedDate(date) {
      this.setPageDate(date)
    },
    modelValue: {
      handler(newValue, oldValue) {
        let parsedValue = this.utils.parseAsDate(newValue)
        const oldParsedValue = this.utils.parseAsDate(oldValue)

        if (!this.utils.compareDates(parsedValue, oldParsedValue)) {
          const isDateDisabled = parsedValue && this.isDateDisabled(parsedValue)

          if (isDateDisabled) {
            parsedValue = null
          }
          this.setValue(parsedValue)
        }
      },
      immediate: true,
    },
    openDate() {
      this.setPageDate()
    },
    view(newView, oldView) {
      if (oldView === '') {
        this.setPageDate(this.utils.adjustDateToView(this.computedOpenDate))
      }
      this.handleViewChange(newView, oldView)
    },
  },
  mounted() {
    this.init()
    document.addEventListener('click', this.handleClickOutside)
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside)
  },
  methods: {
    /**
     * Converts a date to first in month for `month` view or first in year for `year` view
     * @param   {Date} date The date to convert
     * @returns {Date}
     */
    getCellDate(date) {
      switch (this.view) {
        case 'month':
          return new Date(this.utils.setDate(date, 1))
        case 'year':
          return new Date(
            this.utils.setMonth(new Date(this.utils.setDate(date, 1)), 0),
          )
        default:
          return date
      }
    },
    /**
     * Returns true, unless tabbing should be focus-trapped
     * @return {Boolean}
     */
    allowNormalTabbing(event) {
      if (!this.isOpen) {
        return true
      }

      return this.isTabbingAwayFromInlineDatepicker(event)
    },
    /**
     * Focuses the first non-disabled element found in the `focus.refs` array and sets `navElementsFocusedIndex`
     */
    applyFocus() {
      const focusRefs = [...this.focus.refs, ...this.fallbackElementsToFocus]

      for (let i = 0; i < focusRefs.length; i += 1) {
        const element = this.getElementByRef(focusRefs[i])

        if (element && element.getAttribute('disabled') === null) {
          element.focus()
          this.setNavElementsFocusedIndex()
          break
        }
      }
    },
    /**
     * Ensures the most recently focused tabbable cell is focused when tabbing backwards to an inline calendar
     * If no element has previously been focused, the tabbable cell is reset and focused
     */
    focusInlineTabbableCell() {
      if (this.inlineTabbableCell) {
        this.inlineTabbableCell.focus()

        return
      }

      this.resetTabbableCell = true
      this.setTabbableCell()
      this.tabbableCell.focus()
      this.resetTabbableCell = false
    },
    /**
     * Returns the currently focused cell element, if there is one...
     */
    getActiveCell() {
      const activeElement = this.getActiveElement()
      const isActiveElementACell = this.hasClass(activeElement, 'cell')
      const isOnSameView = this.hasClass(activeElement, this.view)

      if (isActiveElementACell && isOnSameView && !this.resetTabbableCell) {
        return activeElement
      }

      return null
    },
    /**
     * Returns the currently focused element, using shadowRoot for web-components...
     */
    getActiveElement() {
      return document.activeElement.shadowRoot
        ? document.activeElement.shadowRoot.activeElement
        : document.activeElement
    },
    /**
     * Returns the `cellId` for a given a date
     * @param {Date} date The date for which we need the cellId
     * @returns {Number|null}
     */
    getCellId(date) {
      if (!date || !this.$refs.picker.$refs.pickerCells) {
        return null
      }

      const cellDate = this.getCellDate(date)
      const { cells } = this.$refs.picker.$refs.pickerCells

      for (let i = 0; i < cells.length; i += 1) {
        if (cells[i].timestamp === cellDate.valueOf()) {
          return i
        }
      }

      return null
    },
    /**
     * Finds an element by its `ref` attribute
     * @param {string} ref        The `ref` name of the wanted element
     * @returns {HTMLElement|Vue} A Vue element
     */
    // eslint-disable-next-line complexity,max-statements
    getElementByRef(ref) {
      if (ref === 'tabbableCell') {
        return this.tabbableCell
      }
      if (ref === 'input') {
        return this.$refs.dateInput && this.$refs.dateInput.$refs[this.refName]
      }
      if (ref === 'calendarButton') {
        return this.$refs.dateInput && this.$refs.dateInput.$refs.calendarButton
      }
      if (ref === 'openDate') {
        return this.$refs.picker.$refs.pickerCells.$refs.openDate[0]
      }
      if (this.showHeader) {
        return (
          this.$refs.picker &&
          this.$refs.picker.$refs.pickerHeader &&
          this.$refs.picker.$refs.pickerHeader.$refs[ref]
        )
      }
      return null
    },
    /**
     * Returns an array of all HTML elements which should be focus-trapped in the calendarFooter slot
     * @returns {Array}   An array of HTML elements
     */
    getElementsFromCalendarFooter() {
      const footerSlotIndex = this.hasSlot('beforeCalendarHeader') ? 2 : 1

      return this.getFocusableElements(
        this.$refs.view.children[footerSlotIndex],
      )
    },
    /**
     * Returns an array of all HTML elements which should be focus-trapped in the specified slot
     * @returns {Array}   An array of HTML elements
     */
    getElementsFromSlot(slotName) {
      if (!this.hasSlot(slotName)) {
        return []
      }

      if (slotName === 'beforeCalendarHeader') {
        return this.getFocusableElements(this.$refs.view.children[0])
      }

      if (slotName === 'calendarFooter') {
        return this.getElementsFromCalendarFooter()
      }

      const isBeforeHeader = slotName.indexOf('beforeCalendarHeader') > -1
      const picker = this.$refs.picker.$el
      const index = isBeforeHeader ? 0 : picker.children.length - 1

      return this.getFocusableElements(picker.children[index])
    },
    /**
     * Returns an array of all HTMLButtonElements which should be focus-trapped in the header
     * @returns {Array}   An array of HTMLButtonElements
     */
    getElementsFromHeader() {
      if (!this.$refs.picker.$refs.pickerHeader) {
        return []
      }
      const header = this.$refs.picker.$refs.pickerHeader.$el
      const navNodeList = header.querySelectorAll('button:enabled')

      return [...Array.prototype.slice.call(navNodeList)]
    },
    /**
     * Returns an array of focusable elements in a given HTML fragment
     * @param   {Element} fragment The HTML fragment to search
     * @returns {Array}
     */
    getFocusableElements(fragment) {
      if (!fragment) {
        return []
      }

      const navNodeList = fragment.querySelectorAll(
        'button:enabled:not([tabindex="-1"]), [href]:not([tabindex="-1"]), input:not([tabindex="-1"]):not([type=hidden]), select:enabled:not([tabindex="-1"]), textarea:enabled:not([tabindex="-1"]), [tabindex]:not([tabindex="-1"])',
      )

      return [...Array.prototype.slice.call(navNodeList)]
    },
    /**
     * Returns the first focusable element of an inline datepicker
     * @returns {HTMLElement}
     */
    getFirstInlineFocusableElement() {
      const popupElements = this.getFocusableElements(this.$refs.popup.$el)

      return popupElements[0]
    },
    /**
     * Returns the last focusable element of an inline datepicker
     * @returns {HTMLElement}
     */
    getLastInlineFocusableElement() {
      const popupElements = this.getFocusableElements(this.$refs.popup.$el)

      return popupElements[popupElements.length - 1]
    },
    /**
     * Returns the input element (when typeable)
     * @returns {Element}
     */
    getInputField() {
      if (!this.typeable || this.inline) {
        return null
      }

      return this.$refs.dateInput.$refs[this.refName]
    },
    /**
     * Used for a typeable datepicker: returns the cell element that corresponds to latestValidTypedDate...
     */
    getTypedCell() {
      if (!this.typeable) {
        return null
      }

      const cellId = this.getCellId(this.latestValidTypedDate)

      return cellId
        ? this.$refs.picker.$refs.pickerCells.$el.children[cellId]
        : null
    },
    /**
     * Sets `datepickerId` (as a global) and keeps track of focusable elements
     */
    handleFocusIn() {
      document.datepickerId = this.datepickerId
      this.globalDatepickerId = this.datepickerId

      this.isActive = true
      this.setInlineTabbableCell()
      this.setNavElements()
    },
    /**
     * Sets the datepicker's `isActive` state to false and resets `globalDatepickerId`
     */
    handleFocusOut() {
      this.isActive = false
      this.globalDatepickerId = ''
    },
    /**
     * Returns true if the calendar has been passed the given slot
     * @param  {String} slotName The name of the slot
     * @return {Boolean}
     */
    hasSlot(slotName) {
      return !!this.$slots[slotName]
    },
    /**
     * Returns true if the user is tabbing away from an inline datepicker
     * @return {Boolean}
     */
    isTabbingAwayFromInlineDatepicker(event) {
      if (!this.inline) {
        return false
      }

      if (this.isTabbingAwayFromFirstNavElement(event)) {
        this.tabAwayFromFirstElement()

        return true
      }

      if (this.isTabbingAwayFromLastNavElement(event)) {
        this.tabAwayFromLastElement()

        return true
      }

      return false
    },
    /**
     * Used for inline calendars; returns true if the user tabs backwards from the first focusable element
     * @param  {object}  event Used to determine whether we are tabbing forwards or backwards
     * @return {Boolean}
     */
    isTabbingAwayFromFirstNavElement(event) {
      if (!event.shiftKey) {
        return false
      }

      const activeElement = this.getActiveElement()
      const firstNavElement = this.navElements[0]

      return activeElement === firstNavElement
    },
    /**
     * Used for inline calendars; returns true if the user tabs forwards from the last focusable element
     * @param  {object}  event Used to determine whether we are tabbing forwards or backwards
     * @return {Boolean}
     */
    isTabbingAwayFromLastNavElement(event) {
      if (event.shiftKey) {
        return false
      }

      const activeElement = this.getActiveElement()
      const lastNavElement = this.navElements[this.navElements.length - 1]

      return activeElement === lastNavElement
    },
    /**
     * Resets the focus to the open date
     */
    resetFocusToOpenDate(focusedDateTimestamp) {
      this.focus.refs = ['openDate']
      this.setTransitionAndFocusDelay(
        focusedDateTimestamp,
        this.computedOpenDate,
      )

      if (!this.isMinimumView) {
        this.isRevertingToOpenDate = true
        this.view = this.minimumView
      }

      this.setPageDate(this.computedOpenDate)
      this.reviewFocus()
    },
    /**
     * Sets the correct focus on next tick
     */
    reviewFocus() {
      if (this.skipReviewFocus) {
        return
      }

      this.tabbableCell = null
      this.resetTabbableCell = true

      this.$nextTick(() => {
        this.setNavElements()

        setTimeout(() => {
          this.applyFocus()
        }, this.focus.delay)

        this.resetTabbableCell = false
      })
    },
    /**
     * Stores the current tabbableCell of an inline datepicker
     * N.B. This is used when tabbing back (shift + tab) to an inline calendar from further down the page
     */
    setInlineTabbableCell() {
      if (!this.inline) {
        return
      }

      this.inlineTabbableCell = this.tabbableCell
    },
    /**
     * Sets the direction of the slide transition and whether or not to delay application of the focus
     * @param {Date|Number} startDate     The date from which to measure
     * @param {Date|Number} endDate       Is this before or after the startDate? And is it on the same page?
     */
    setTransitionAndFocusDelay(startDate, endDate) {
      const startPageDate = this.utils.setDate(new Date(startDate), 1)
      const endPageDate = this.utils.setDate(new Date(endDate), 1)
      const isInTheFuture = startPageDate < endPageDate

      if (this.isMinimumView) {
        this.focus.delay = isInTheFuture ? this.slideDuration : 0
      } else {
        this.focus.delay = 0
      }

      this.setTransitionName(endDate - startDate)
    },
    /**
     * Set the focus
     * @param {Array} refs An array of `refs` to focus (in order of preference)
     */
    setFocus(refs) {
      this.focus.refs = refs
      this.applyFocus()
    },
    /**
     * Determines which elements in datepicker should be focus-trapped
     */
    setNavElements() {
      if (!this.view) return

      this.updateTabbableCell()

      const view = this.ucFirst(this.view)

      this.navElements = [
        this.getInputField(),
        this.getElementsFromSlot('beforeCalendarHeader'),
        this.getElementsFromSlot(`beforeCalendarHeader${view}`),
        this.getElementsFromHeader(),
        this.tabbableCell,
        this.getElementsFromSlot(`calendarFooter${view}`),
        this.getElementsFromSlot('calendarFooter'),
      ]
        .filter((item) => !!item)
        .reduce((acc, val) => acc.concat(val), [])
    },
    /**
     * Keeps track of the currently focused index in the navElements array
     */
    setNavElementsFocusedIndex() {
      const activeElement = this.getActiveElement()

      for (let i = 0; i < this.navElements.length; i += 1) {
        if (activeElement === this.navElements[i]) {
          this.navElementsFocusedIndex = i
          return
        }
      }

      this.navElementsFocusedIndex = 0
    },
    /**
     * Sets the focus-trapped cell in the picker
     */
    // eslint-disable-next-line complexity
    setTabbableCell() {
      if (!this.$refs.picker || !this.$refs.picker.$refs.pickerCells) {
        return
      }

      const pickerCells = this.$refs.picker.$refs.pickerCells.$el

      this.tabbableCell =
        this.getActiveCell() ||
        this.getTypedCell() ||
        pickerCells.querySelector('button.selected:not(.muted):enabled') ||
        pickerCells.querySelector('button.open:not(.muted):enabled') ||
        pickerCells.querySelector('button.today:not(.muted):enabled') ||
        pickerCells.querySelector('button.cell:not(.muted):enabled')
    },
    /**
     * Sets the direction of the slide transition
     * @param {Number} plusOrMinus Positive for the future; negative for the past
     */
    setTransitionName(plusOrMinus) {
      const isInTheFuture = plusOrMinus > 0

      if (this.isRtl) {
        this.transitionName = isInTheFuture ? 'slide-left' : 'slide-right'
      } else {
        this.transitionName = isInTheFuture ? 'slide-right' : 'slide-left'
      }
    },
    /**
     * Focuses the first focusable element of an inline datepicker, so that the previous element on the page will be tabbed to
     */
    tabAwayFromFirstElement() {
      const firstElement = this.getFirstInlineFocusableElement()

      // Keep a record of `tabbableCell` in case `showHeader=false` and this is the first date
      // in the month (with no edge dates from the previous month) to which we may want to
      // tab back down to later.
      this.setInlineTabbableCell()

      firstElement.focus()

      // Reset the tabbableCell as we don't want it to be the `firstElement` if the latter is
      // an edge date from the previous month
      this.tabbableCell = this.inlineTabbableCell
    },
    /**
     * Focuses the last focusable element of an inline datepicker, so that the next element on the page will be tabbed to
     */
    tabAwayFromLastElement() {
      const lastElement = this.getLastInlineFocusableElement()

      // Keep a record of `tabbableCell` in case this is the last date in the month
      // (with no edge dates from the next month) to which we may want to shift+tab
      // back up to later.
      this.setInlineTabbableCell()

      lastElement.focus()

      // Reset the tabbableCell as we don't want it to be the `lastElement` if the latter is
      // an edge date from the next month
      this.tabbableCell = this.inlineTabbableCell
    },
    /**
     * Tab backwards through the focus-trapped elements
     */
    tabBackwards() {
      this.navElementsFocusedIndex -= 1

      if (this.navElementsFocusedIndex < 0) {
        this.navElementsFocusedIndex = this.navElements.length - 1
      }

      this.navElements[this.navElementsFocusedIndex].focus()
    },
    /**
     * Tab forwards through the focus-trapped elements
     */
    tabForwards() {
      this.navElementsFocusedIndex += 1

      if (this.navElementsFocusedIndex >= this.navElements.length) {
        this.navElementsFocusedIndex = 0
      }

      this.navElements[this.navElementsFocusedIndex].focus()
    },
    /**
     * Tab through the focus-trapped elements
     * @param event
     */
    tabThroughNavigation(event) {
      if (this.allowNormalTabbing(event)) {
        return
      }

      event.preventDefault()

      if (event.shiftKey) {
        this.tabBackwards()
      } else {
        this.tabForwards()
      }
    },
    /**
     * Special cases for when tabbing to an inline datepicker
     */
    tabToCorrectInlineCell() {
      const lastElement = this.getLastInlineFocusableElement()
      const isACell = this.hasClass(lastElement, 'cell')
      const activeElement = this.getActiveElement()
      const isLastElementFocused = activeElement === lastElement

      // If there are no focusable elements in the footer slots and the inline datepicker has been tabbed to (backwards)
      if (isACell && isLastElementFocused) {
        this.focusInlineTabbableCell()
        return
      }

      // If `show-header` is false and the inline datepicker has been tabbed to (forwards)
      this.$nextTick(() => {
        const isFirstCell = activeElement.getAttribute('data-id') === '0'

        if (isFirstCell) {
          this.focusInlineTabbableCell()
        }
      })
    },
    /**
     * Update which cell in the picker should be focus-trapped
     */
    updateTabbableCell() {
      const activeElement = this.getActiveElement()
      const isActiveElementACell = this.hasClass(activeElement, 'cell')
      const needToUpdate = !this.tabbableCell || isActiveElementACell

      if (needToUpdate) {
        this.setTabbableCell()
      }
    },
    /**
     * Are we allowed to show a specific picker view?
     * @param {String} view
     * @return {Boolean}
     */
    allowedToShowView(view) {
      const views = ['day', 'month', 'year']
      const minimumViewIndex = views.indexOf(this.minimumView)
      const maximumViewIndex = views.indexOf(this.maximumView)
      const viewIndex = views.indexOf(view)

      return viewIndex >= minimumViewIndex && viewIndex <= maximumViewIndex
    },
    /**
     * Clear the selected date
     */
    clearDate() {
      if (!this.selectedDate) {
        return
      }

      const { focusedDateTimestamp } = this

      this.selectDate(null)

      if (this.isInline) {
        this.resetFocusToOpenDate(focusedDateTimestamp)
      } else {
        this.focus.refs = ['input']
        this.close()
      }

      this.$emit('cleared')
    },
    /**
     * Close the calendar
     */
    close() {
      if (this.isInline) {
        return
      }

      this.view = ''

      if (this.showCalendarOnFocus) {
        this.$refs.dateInput.shouldToggleOnClick = true
        this.$refs.dateInput.shouldToggleOnFocus = true
      }

      if (this.isClickOutside) {
        this.isClickOutside = false
      } else {
        this.reviewFocus()
      }

      this.$emit('closed')
    },
    /**
     * Returns true if the given date differs from the `selectedDate`
     * @param   {Date} date The date to check
     * @returns {Boolean}
     */
    dateHasChanged(date) {
      return !this.utils.compareDates(date, this.selectedDate)
    },
    /**
     * Emits `focus` when the datepicker receives focus (and for an `inline`
     * datepicker, ensures the correct cell is tabbed to)
     */
    datepickerIsActive() {
      this.$emit('focus')

      if (this.inline) {
        this.setNavElementsFocusedIndex()
        this.tabToCorrectInlineCell()
      }
    },
    /**
     * Emits `blur` when the datepicker loses focus (and selects a typed date)
     */
    datepickerIsInactive() {
      this.$emit('blur')

      if (this.typeable) {
        this.skipReviewFocus = true
        this.selectTypedDateOnLosingFocus()

        this.$nextTick(() => {
          this.skipReviewFocus = false
        })
      }
    },
    /**
     * Closes the calendar when no element within it has focus
     */
    handleClickOutside() {
      if (!this.isOpen) {
        return
      }

      const closeByClickOutside = () => {
        this.isClickOutside = true
        this.close()
      }

      if (!this.globalDatepickerId) {
        closeByClickOutside()
        return
      }

      if (document.datepickerId.toString() === this.datepickerId) {
        this.$nextTick(() => {
          if (!this.isActive) {
            closeByClickOutside()
          }
        })
      }
    },
    /**
     * Set the new pageDate, focus the relevant element and emit a `changed-<view>` event
     */
    handlePageChange({ focusRefs, pageDate }) {
      this.setPageDate(pageDate)
      this.focus.refs = focusRefs
      this.focus.delay = this.slideDuration
      this.reviewFocus()
      this.$emit(`changed${this.ucFirst(this.nextView.up)}`, pageDate)
    },
    /**
     * Set the date, or go to the next view down
     */
    // eslint-disable-next-line max-statements,complexity
    handleSelect(cell) {
      if (this.allowedToShowView(this.nextView.down)) {
        this.showNextViewDown(cell)
        return
      }

      this.$refs.dateInput.typedDate = ''
      const date = new Date(cell.timestamp)

      if (this.isInline && !this.dateHasChanged(date)) {
        this.selectedDate = null
        this.$emit('cleared')
        return
      }

      this.selectDate(date)
      this.focus.delay = cell.isNextMonth ? this.slideDuration : 0
      this.focus.refs = this.isInline ? ['tabbableCell'] : ['input']
      this.close()

      if (this.showCalendarOnFocus && !this.inline) {
        this.$refs.dateInput.shouldToggleOnClick = true
        this.$refs.dateInput.shouldToggleOnFocus = false
      } else {
        this.reviewFocus()
      }
    },
    /**
     * Updates the page (if necessary) after a 'typedDate' event and sets `tabbableCell` & `latestValidTypedDate`
     * @param {Date=} date
     */
    handleTypedDate(date) {
      const originalTypedDate = new Date(this.latestValidTypedDate)
      const originalPageDate = new Date(this.pageDate)

      this.latestValidTypedDate = date || this.computedOpenDate
      this.setTransitionAndFocusDelay(
        originalTypedDate,
        this.latestValidTypedDate,
      )
      this.setPageDate(date)

      if (this.isPageChange(originalPageDate)) {
        this.handlePageChange({
          focusRefs: [],
          pageDate: this.pageDate,
        })
        return
      }

      this.setTabbableCell()
    },
    /**
     * Focus the relevant element when the view changes
     * @param {String} newView
     * @param {String} oldView
     */
    handleViewChange(newView, oldView) {
      const isClosing = newView === ''
      const isOpeningInline = oldView === '' && this.isInline

      if (isClosing || isOpeningInline) {
        return
      }

      if (!this.isRevertingToOpenDate) {
        this.setViewChangeFocusRefs(newView, oldView)
        this.reviewFocus()
      }

      this.isRevertingToOpenDate = false
    },
    /**
     * Returns true if element has the given className
     * @param   {HTMLElement} element
     * @param   {String}      className
     * @returns {Boolean}
     */
    hasClass(element, className) {
      return element && element.className.split(' ').includes(className)
    },
    /**
     * Used for typeable datepicker: returns true if a typed date causes the page to change
     * @param   {Date}    originalPageDate
     * @returns {Boolean}
     */
    isPageChange(originalPageDate) {
      if (!this.isOpen) {
        return false
      }

      return originalPageDate.valueOf() !== this.pageDate.valueOf()
    },
    /**
     * Initiate the component
     */
    init() {
      if (this.typeable) {
        this.latestValidTypedDate = this.selectedDate || this.computedOpenDate
      }

      if (this.isInline) {
        this.setInitialView()
      }

      this.setSlideDuration()
    },
    /**
     * Returns true if a date is disabled
     * @param {Date} date
     * @returns {Boolean}
     */
    isDateDisabled(date) {
      if (!this.disabledDates) return false

      return new DisabledDate(this.utils, this.disabledDates).isDateDisabled(
        date,
      )
    },
    /**
     * Returns true if we should reset the focus to computedOpenDate
     * @returns {Boolean}
     */
    isResetFocus() {
      if (!this.isOpen) {
        return false
      }

      const activeElement = this.getActiveElement()
      const isOpenCellFocused =
        this.hasClass(activeElement, 'cell') &&
        !this.hasClass(activeElement, 'open')

      return this.isInline || !this.isMinimumView || isOpenCellFocused
    },
    /**
     * Opens the calendar with the relevant view: 'day', 'month', or 'year'
     */
    open() {
      if (this.disabled || this.isInline) {
        return
      }

      this.setInitialView()
      this.reviewFocus()

      this.$emit('opened')
    },
    /**
     * Focus the open date, or close the calendar if already focused
     */
    resetOrClose() {
      if (this.isResetFocus()) {
        this.resetFocusToOpenDate(this.focusedDateTimestamp)
        return
      }

      if (this.isOpen) {
        this.focus.refs = ['input']
        this.close()
      }
    },
    /**
     * Select the date
     * @param {Date|null} date
     */
    selectDate(date) {
      if (this.dateHasChanged(date)) {
        this.$emit('changed', date)
      }

      this.setValue(date)
      this.$emit('selected', date)
      this.$emit('update:modelValue', date)
    },
    /**
     * Select the date from a 'selectTypedDate' event
     * @param {Date=} date
     */
    selectTypedDate(date) {
      this.selectDate(date)
      this.reviewFocus()

      if (this.isOpen) {
        this.close()
      }
    },
    /**
     * Selects the typed date when the datepicker loses focus, provided it's valid and differs from the current selected date
     */
    selectTypedDateOnLosingFocus() {
      const parsedDate = this.$refs.dateInput.parseInput()
      const date = this.utils.isValidDate(parsedDate) ? parsedDate : null

      if (this.dateHasChanged(date)) {
        this.selectDate(date)
      }
    },
    /**
     * Sets the initial picker page view: day, month or year
     */
    setInitialView() {
      const initialView = this.computedInitialView

      if (!this.allowedToShowView(initialView)) {
        throw new Error(
          `initialView '${this.initialView}' cannot be rendered based on minimum '${this.minimumView}' and maximum '${this.maximumView}'`,
        )
      }

      this.setView(initialView)
    },
    /**
     * Sets the date that the calendar should open on
     * @param {Date=} date The date to set for the page
     */
    setPageDate(date) {
      const validDate = this.utils.parseAsDate(date) || this.computedOpenDate
      let dateTemp = this.utils.getNewDateObject(validDate)
      dateTemp = new Date(this.utils.setDate(dateTemp, 1))

      const pageTimestamp = this.utils
        .adjustDateToView(dateTemp, this.view)
        .valueOf()

      this.pageTimestamp = pageTimestamp
    },
    /**
     * Sets the slide duration in milliseconds by looking up the stylesheet
     */
    setSlideDuration() {
      if (!this.$refs.picker || !this.$refs.picker.$refs.pickerCells) {
        return
      }
      const cells = this.$refs.picker.$refs.pickerCells.$el
      const durationInSecs = window.getComputedStyle(cells).transitionDuration

      this.slideDuration = parseFloat(durationInSecs) * 1000
    },
    /**
     * Set the datepicker modelValue (and, if typeable, update `latestValidTypedDate`)
     * @param {Date|String|Number|null} date
     */
    setValue(date) {
      this.selectedDate = date || null
      this.setPageDate(date)

      if (this.typeable) {
        this.latestValidTypedDate = date || this.computedOpenDate
      }
    },
    /**
     * Set the picker view
     * @param {String} view
     */
    setView(view) {
      if (this.allowedToShowView(view)) {
        this.view = view
      }
    },
    /**
     * Sets the array of `refs` that might be focused following a view change
     * @param {String} newView The view being changed to
     * @param {String} oldView The previous view
     */
    setViewChangeFocusRefs(newView, oldView) {
      if (oldView === '') {
        this.focus.refs = []
        return
      }

      const views = ['day', 'month', 'year']
      const isNewView = (view) => view === newView
      const isOldView = (view) => view === oldView
      const newViewIndex = views.findIndex(isNewView)
      const oldViewIndex = views.findIndex(isOldView)
      const isViewChangeUp = newViewIndex - oldViewIndex > 0

      this.focus.refs = isViewChangeUp
        ? ['up', 'tabbableCell']
        : ['tabbableCell', 'up']
    },
    /**
     * Set the view to the next view down e.g. from `month` to `day`
     * @param {Object} cell The currently focused cell
     */
    showNextViewDown(cell) {
      this.setPageDate(new Date(cell.timestamp))
      this.$emit(`changed${this.ucFirst(this.view)}`, cell)
      this.setView(this.nextView.down)
    },
    /**
     * Capitalizes the first letter
     * @param {String} str The string to capitalize
     * @returns {String}
     */
    ucFirst(str) {
      return str[0].toUpperCase() + str.substring(1)
    },
  },
}
</script>

<style lang="scss">
@import '../styles/style.scss';
</style>
