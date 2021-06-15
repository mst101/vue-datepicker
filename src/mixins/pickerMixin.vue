<script>
import PickerHeader from '~/components/PickerHeader.vue'
import makeDateUtils from '~/utils/DateUtils'
import DisabledDate from '~/utils/DisabledDate'

export default {
  components: { PickerHeader },
  inheritAttrs: false,
  props: {
    disabledDates: {
      type: Object,
      default() {
        return {}
      },
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
      validator: (val) =>
        /* istanbul ignore next */
        val === null ||
        val instanceof Date ||
        typeof val === 'string' ||
        typeof val === 'number',
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
      default: 300,
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
  },
  data() {
    return {
      sections: [],
      utils: makeDateUtils(this.useUtc),
    }
  },
  computed: {
    cellsHeight() {
      const columns = this.view === 'day' ? 7 : 3
      const rows = Math.ceil(this.cells.length / columns)

      return rows * 40
    },
    /**
     * A look-up object created from 'disabledDates' prop
     * @return {Object}
     */
    disabledConfig() {
      return new DisabledDate(this.utils, this.disabledDates).config
    },
    hasSection() {
      const view = this.ucFirst(this.view)

      return {
        headerSlot: this.hasSlot(`beforeCalendarHeader${view}`),
        header: this.showHeader,
        footerSlot: this.hasSlot(`calendarFooter${view}`),
      }
    },
    /**
     * Returns the current page's full year as an integer.
     * @return {Number}
     */
    pageYear() {
      return this.utils.getFullYear(this.pageDate)
    },
    pickerHeight() {
      return Object.values(this.sectionHeights).reduce(
        (total, current) => total + current,
        0,
      )
    },
    sectionHeights() {
      const { sections } = this

      if (!sections.length) return { total: 0 }

      return {
        headerSlot: this.heightOfSlot('header'),
        header: this.heightOfHeader(),
        daysOfWeek: this.view === 'day' ? 40 : 0,
        cells: this.cellsHeight,
        footerSlot: this.heightOfSlot('footer'),
      }
    },
  },
  watch: {
    pickerHeight: {
      immediate: true,
      handler() {
        this.$emit('change-picker-height', this.pickerHeight)
      },
    },
  },
  mounted() {
    this.setPickerSections()
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

      this.setPickerSections()
      this.$emit('set-transition-name', incrementBy)

      if (this.view === 'day') {
        utils.setMonth(pageDate, utils.getMonth(pageDate) + units)
      } else {
        utils.setFullYear(pageDate, utils.getFullYear(pageDate) + units)
      }

      this.$emit('page-change', { focusRefs, pageDate })
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

      this.changePage({
        incrementBy: Math.sign(delta),
        focusRefs: ['tabbable-cell'],
      })

      this.$nextTick(() => {
        this.setFocusOnNewPage(options)
      })
    },
    /**
     * Returns the element that should be focused when navigating via an arrow key
     * @param  {HTMLElement} currentElement  The element currently being iterated on
     * @param  {Number}      delta           The number of cells that the focus should move
     * @param  {Number}      stepsRemaining  The number of steps remaining in the iteration
     * @return {HTMLElement}
     */
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
     * @param  {HTMLElement} currentElement  The element currently being iterated on
     * @param  {Number}      delta           The number of cells that the focus should move
     * @return {HTMLElement}
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
     * @return {HTMLElement}
     */
    getFirstOrLastElement(delta) {
      const isNext = delta > 0
      const elements = this.$refs.cells.$el.children

      return isNext ? elements[0] : elements[elements.length - 1]
    },
    /**
     * Moves the focused cell up/down/left/right
     * @param {Object}
     */
    handleArrow({ delta }) {
      const stepsRemaining = Math.abs(delta)
      const options = {
        currentElement: document.activeElement,
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
        this.$emit('set-transition-name', -1)
      }

      if (cell.isNextMonth) {
        this.$emit('set-transition-name', 1)
      }

      this.$emit('select', cell)
    },
    /**
     * Returns true if the picker has been passed the relevant slot
     * @param  {String} slotName The name of the slot
     * @return {Boolean}
     */
    hasSlot(slotName) {
      return Object.prototype.hasOwnProperty.call(this.$slots, slotName)
    },
    /**
     * Calculates the height of the picker's `header` section
     * @return {Number}
     */
    heightOfHeader() {
      let headerHeight = 0

      if (this.hasSection.header) {
        if (this.hasSection.headerSlot) {
          headerHeight = this.sections[1].clientHeight
        } else {
          headerHeight = this.sections[0].clientHeight
        }
      }

      return headerHeight
    },
    /**
     * Calculates the height of the given slot
     * @param {String} slotName The name of the slot
     * @return {Number}
     */
    heightOfSlot(slotName) {
      const sectionIndex = slotName === 'header' ? 0 : this.sections.length - 1
      const section = this.sections[sectionIndex]

      return this.hasSection[`${slotName}Slot`] ? section.clientHeight : 0
    },
    /**
     * Returns true if the given element cannot be focused
     * @param {HTMLElement} element The element in question
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
    setFocusOnNewPage({ delta, stepsRemaining }) {
      const currentElement = this.getFirstOrLastElement(delta)
      const options = {
        currentElement,
        delta,
        stepsRemaining,
      }

      if (stepsRemaining <= 0) {
        if (this.isMutedOrDisabled(currentElement)) {
          options.stepsRemaining = Math.abs(options.delta)

          setTimeout(() => {
            this.setFocusToAvailableCell(options)
          }, this.slideDuration)

          return
        }

        setTimeout(() => {
          currentElement.focus()
        }, this.slideDuration)

        return
      }

      setTimeout(() => {
        this.setFocusToAvailableCell(options)
      }, this.slideDuration)
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
     * Populates an array of sections that comprise the picker: e.g. headerSlot, header, footerSlot
     */
    setPickerSections() {
      if (!this.$el.children) return

      this.$nextTick(() => {
        this.sections = [...this.$el.children]
      })
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
