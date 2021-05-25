<template>
  <div
    :id="datepickerId"
    ref="vdp-datepicker"
    class="vdp-datepicker"
    :class="[wrapperClass, { rtl: isRtl }]"
    @focusin="handleFocusChange($event)"
    @keydown.tab="tabThroughNavigation($event)"
  >
    <DateInput
      :id="id"
      ref="DateInput"
      :autofocus="autofocus"
      :bootstrap-styling="bootstrapStyling"
      :calendar-button="calendarButton"
      :calendar-button-icon="calendarButtonIcon"
      :calendar-button-icon-content="calendarButtonIconContent"
      :clear-button="clearButton"
      :clear-button-icon="clearButtonIcon"
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
      :reset-typed-date="resetTypedDate"
      :reset-toggle-on-click="resetToggleOnClick"
      :selected-date="selectedDate"
      :show-calendar-on-button-click="showCalendarOnButtonClick"
      :show-calendar-on-focus="showCalendarOnFocus"
      :tabindex="tabindex"
      :translation="translation"
      :typeable="typeable"
      :use-utc="useUtc"
      @blur="handleInputBlur"
      @clear-date="clearDate"
      @close="close"
      @focus="handleInputFocus"
      @open="open"
      @set-focus="focusFirstElementIn($event)"
      @typed-date="handleTypedDate"
    >
      <slot slot="beforeDateInput" name="beforeDateInput" />
      <slot slot="afterDateInput" name="afterDateInput" />
      <slot slot="clearBtn" name="clearBtn" />
      <slot slot="calendarBtn" name="calendarBtn" />
    </DateInput>

    <Popup
      ref="popup"
      :append-to-body="appendToBody"
      :fixed-position="fixedPosition"
      :inline="inline"
      :rtl="isRtl"
      :visible="isOpen"
    >
      <Transition name="fade">
        <div
          v-show="isOpen"
          ref="datepicker"
          class="vdp-datepicker__calendar"
          :class="pickerClasses"
          data-test-calendar
          :style="calendarStyle"
          @mousedown.prevent
        >
          <Transition name="fade">
            <slot name="beforeCalendarHeader" />
            <Component
              :is="picker"
              ref="picker"
              :key="view"
              :day-cell-content="dayCellContent"
              :disabled-dates="disabledDates"
              :first-day-of-week="firstDayOfWeek"
              :highlighted="highlighted"
              :is-rtl="isRtl"
              :is-typeable="typeable"
              :is-up-disabled="isUpDisabled"
              :minimum-view="minimumView"
              :open-date="computedOpenDate"
              :page-date="pageDate"
              :selected-date="selectedDate"
              :show-edge-dates="showEdgeDates"
              :show-full-month-name="fullMonthName"
              :show-header="showHeader"
              :slide-duration="slideDuration"
              :style="`transition-duration: ${fadeDuration}ms`"
              :tabbable-cell-id="tabbableCellId"
              :transition-name="transitionName"
              :translation="translation"
              :use-utc="useUtc"
              :view="view || computedInitialView"
              :year-range="yearPickerRange"
              @change-picker-height="pickerHeight = $event"
              @clear-date="clearDate"
              @page-change="handlePageChange"
              @select="handleSelect"
              @set-focus="focusFirstElementIn($event)"
              @set-transition-name="setTransitionName($event)"
              @set-view="setView"
            >
              <template v-for="slotKey of calendarSlots">
                <slot :slot="slotKey" :name="slotKey" />
              </template>
              <template #dayCellContent="{ cell }">
                <slot v-if="cell" name="dayCellContent" :cell="cell" />
              </template>
            </Component>
            <slot name="calendarFooter" />
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
import navMixin from '~/mixins/navMixin.vue'
import PickerDay from '~/components/PickerDay.vue'
import PickerMonth from '~/components/PickerMonth.vue'
import PickerYear from '~/components/PickerYear.vue'
import Popup from '~/components/Popup.vue'

export default {
  name: 'Datepicker',
  components: {
    DateInput,
    PickerDay,
    PickerMonth,
    PickerYear,
    Popup,
  },
  mixins: [inputProps, navMixin],
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
      default() {
        return {}
      },
    },
    fadeDuration: {
      type: Number,
      default: 300,
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
      default: false,
    },
    highlighted: {
      type: Object,
      default() {
        return {}
      },
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
    showEdgeDates: {
      type: Boolean,
      default: true,
    },
    showHeader: {
      type: Boolean,
      default: true,
    },
    slideDuration: {
      type: Number,
      default: 300,
    },
    value: {
      type: [String, Date, Number],
      default: '',
      validator: (val) =>
        val === null ||
        val instanceof Date ||
        typeof val === 'string' ||
        typeof val === 'number',
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
  data() {
    const utils = makeDateUtils(this.useUtc)
    const startDate = utils.getNewDateObject(this.openDate || null)
    const pageTimestamp = utils.setDate(startDate, 1)

    return {
      calendarHeight: 0,
      calendarSlots,
      /*
       * Vue cannot observe changes to a Date Object so date must be stored as a timestamp
       * This represents the first day of the current viewing month
       * {Number}
       */
      pageTimestamp,
      pickerHeight: 0,
      resetToggleOnClick: utils.getNewDateObject(),
      resetTypedDate: utils.getNewDateObject(),
      /*
       * Selected Date
       * {Date}
       */
      selectedDate: null,
      transitionName: '',
      utils,
      view: '',
    }
  },
  computed: {
    allowedViews() {
      const views = ['day', 'month', 'year']

      return views.filter((view) => this.allowedToShowView(view))
    },
    calendarStyle() {
      if (this.isInline) {
        const style = {
          height: `${this.pickerHeight}px`,
        }

        if (this.isDirty) {
          style['transition-duration'] = `${this.fadeDuration}ms`
        }

        return style
      }

      return {
        'transition-duration': `${this.fadeDuration}ms`,
      }
    },
    computedInitialView() {
      return this.initialView || this.minimumView
    },
    computedOpenDate() {
      // If `openDate` is not set, open on today's date
      const openDate = this.openDate
        ? new Date(this.openDate)
        : this.utils.getNewDateObject()

      // If the `minimum-view` is `month` or `year`, convert `openDate` accordingly
      return this.minimumView === 'day'
        ? openDate
        : new Date(this.utils.setDate(openDate, 1))
    },
    datepickerId() {
      /* eslint-disable */
      return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
        (
          c ^
          (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
        ).toString(16),
      )
      /* eslint-enable */
    },
    isInline() {
      return !!this.inline
    },
    isOpen() {
      return this.view !== ''
    },
    isRtl() {
      return this.translation.rtl
    },
    isUpDisabled() {
      if (!this.nextView.up) {
        return false
      }
      return !this.allowedToShowView(this.nextView.up)
    },
    nextView() {
      const isCurrentView = (view) => view === this.view
      const viewIndex = this.allowedViews.findIndex(isCurrentView)
      const nextViewDown = (index) => {
        return index <= 0 ? undefined : this.allowedViews[index - 1]
      }
      const nextViewUp = (index) => {
        if (index < 0) {
          return undefined
        }

        if (index === this.allowedViews.length - 1) {
          return 'decade'
        }

        return this.allowedViews[index + 1]
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
        this.isInline && 'inline',
        this.isRtl && this.appendToBody && 'rtl',
      ]
    },
    translation() {
      return this.language
    },
  },
  watch: {
    initialView() {
      this.setInitialView()
    },
    openDate() {
      this.setPageDate()
    },
    value(value) {
      const parsedValue = this.parseValue(value)
      this.setValue(parsedValue)
    },
    view(newView, oldView) {
      this.$nextTick(() => {
        this.handleViewChange(newView, oldView)
      })
    },
  },
  mounted() {
    this.init()
    document.addEventListener('click', this.handleClick)
  },
  beforeDestroy() {
    document.removeEventListener('click', this.handleClick)
  },
  methods: {
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
      const isMinimumView = this.view === this.minimumView
      const isResetFocus =
        this.isOpen &&
        this.hasClass(document.activeElement, 'cell') &&
        (!isMinimumView || !this.hasClass(document.activeElement, 'open'))

      if (isResetFocus) {
        this.resetFocusToOpenDate(isMinimumView)
        return
      }

      this.selectedDate = null
      this.close()
      this.$emit('selected', null)
      this.$emit('input', null)
      this.$emit('cleared')
    },
    /**
     * Close the calendar views
     */
    close(elementToFocus) {
      if (this.isInline) {
        return
      }

      this.$nextTick(() => {
        this.view = ''

        if (elementToFocus === 'blur' || this.showCalendarOnFocus) {
          this.resetToggleOnClick = this.utils.getNewDateObject()
          document.body.focus()
        } else {
          // Use a macrotask (zero delayed timeout) to ensure the input field is focused after selecting a date
          setTimeout(() => {
            this.focusFirstElementIn([elementToFocus, 'input'])
          }, 0)
        }
      })

      this.resetDefaultPageDate()
      this.$emit('closed')
    },
    /**
     * Closes the calendar when no element within it has focus
     */
    handleClick() {
      if (document.datepickerId !== this.datepickerId) {
        return
      }

      const isFocused = this.allElements.includes(document.activeElement)

      if (!isFocused && this.isOpen) {
        this.close('blur')
      }
    },
    /**
     * Emits a 'blur' event
     */
    handleInputBlur() {
      this.$emit('blur')
    },
    /**
     * Emits a 'focus' event
     */
    handleInputFocus() {
      this.$emit('focus')
    },
    /**
     * Set the new pageDate, focus the relevant element and emit a `changed-<view>` event
     */
    handlePageChange({ elementsToFocus, pageDate }) {
      this.setPageDate(pageDate)
      this.reviewFocus({ elementsToFocus })
      this.$emit(`changed-${this.nextView.up}`, pageDate)
    },
    /**
     * Set the date, or go to the next view down
     */
    handleSelect(cell) {
      if (this.allowedToShowView(this.nextView.down)) {
        this.showNextViewDown(cell)
        return
      }
      const delay = cell.isNextMonth ? this.slideDuration : 0

      this.resetTypedDate = this.utils.getNewDateObject()
      this.selectDate(cell.timestamp)
      this.close()

      if (this.showCalendarOnFocus && !this.inline) {
        this.resetToggleOnClick = this.utils.getNewDateObject()
      } else {
        this.reviewFocus({ delay })
      }
    },
    /**
     * Set the date from a 'typed-date' event
     * @param {Date} date
     */
    handleTypedDate(date) {
      this.selectDate(date ? date.valueOf() : null)
      this.reviewFocus()
    },
    /**
     * Focus the relevant element when the view changes
     * @param {String} newView
     * @param {String} oldView
     */
    handleViewChange(newView, oldView) {
      if (newView === '' || (oldView === '' && this.isInline)) {
        return
      }
      const elementsToFocus = this.getElementsToFocus(newView, oldView)

      this.setNavElements()

      // Use a macrotask (zero delayed timeout)
      setTimeout(() => {
        this.reviewFocus({ elementsToFocus, delay: 0 })
      }, 0)
    },
    /**
     * Returns true if element has the given className
     */
    hasClass(element, className) {
      return element && element.className.split(' ').includes(className)
    },
    /**
     * Initiate the component
     */
    init() {
      if (this.value) {
        let parsedValue = this.parseValue(this.value)
        const isDateDisabled = parsedValue && this.isDateDisabled(parsedValue)

        if (isDateDisabled) {
          parsedValue = null
          this.$emit('input', parsedValue)
        }
        this.setValue(parsedValue)
      }

      if (this.isInline) {
        this.setInitialView()
      }
    },
    /**
     * Returns true if a date is disabled
     * @param {Date} date
     */
    isDateDisabled(date) {
      return new DisabledDate(this.utils, this.disabledDates).isDateDisabled(
        date,
      )
    },
    /**
     * Returns true if the view increases e.g. from `day` to `month`
     * @param {String} newView
     * @param {String} oldView
     * @return {Boolean}
     */
    isViewChangeUp(newView, oldView) {
      const isNewView = (view) => view === newView
      const isOldView = (view) => view === oldView
      const newViewIndex = this.allowedViews.findIndex(isNewView)
      const oldViewIndex = this.allowedViews.findIndex(isOldView)

      return newViewIndex - oldViewIndex > 0
    },
    /**
     * Opens the calendar with the relevant view: 'day', 'month', or 'year'
     */
    open() {
      if (this.disabled || this.isInline) {
        return
      }

      this.setInitialView()
      this.focusFirstElementIn([])

      this.$emit('opened')
    },
    /**
     * Parse a datepicker value from string/number to date
     * @param   {Date|String|Number|null} date
     * @returns {Date}
     */
    parseValue(date) {
      let dateTemp = date
      if (typeof dateTemp === 'string' || typeof dateTemp === 'number') {
        const parsed = new Date(dateTemp)
        dateTemp = Number.isNaN(parsed.valueOf()) ? null : parsed
      }
      return dateTemp
    },
    /**
     * Called in the event that the user navigates to date pages and
     * closes the picker without selecting a date.
     */
    resetDefaultPageDate() {
      if (this.selectedDate === null) {
        this.setPageDate()
        return
      }
      this.setPageDate(this.selectedDate)
    },
    /**
     * Select the date
     * @param {Number} timestamp
     */
    selectDate(timestamp) {
      if (!timestamp) {
        this.selectedDate = null
        return
      }

      const date = new Date(timestamp)
      this.selectedDate = date
      this.setPageDate(date)
      this.$emit('selected', date)
      this.$emit('input', date)
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
     */
    setPageDate(date) {
      let dateTemp = date
      if (!dateTemp) {
        if (this.openDate) {
          dateTemp = new Date(this.openDate)
        } else {
          dateTemp = new Date()
        }
        dateTemp = this.utils.resetDateTime(dateTemp)
      }
      this.pageTimestamp = this.utils.setDate(new Date(dateTemp), 1)
    },
    /**
     * Sets the direction of the slide transition
     */
    setTransitionName(plusOrMinus) {
      if (this.isRtl) {
        this.transitionName = plusOrMinus > 0 ? 'slide-left' : 'slide-right'
      } else {
        this.transitionName = plusOrMinus > 0 ? 'slide-right' : 'slide-left'
      }
    },
    /**
     * Set the datepicker value
     * @param {Date|String|Number|null} date
     */
    setValue(date) {
      if (!date) {
        this.setPageDate()
        this.selectedDate = null
        return
      }
      this.selectedDate = date
      this.setPageDate(date)
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
     * Set the view to the next view down e.g. from `month` to `day`
     * @param {Object} cell The currently focused cell
     */
    showNextViewDown(cell) {
      this.setPageDate(new Date(cell.timestamp))
      this.$emit(`changed-${this.view}`, cell)
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
