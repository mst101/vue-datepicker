<script>
export default {
  data() {
    return {
      allElements: [],
      focusDelay: 0,
      isDirty: false,
      isRevertingToOpenDate: false,
      navElements: [],
      navElementsFocusedIndex: 0,
      resetTabbableCell: false,
      refsToFocus: [],
      tabbableCell: null,
      transitionName: '',
    }
  },
  computed: {
    tabbableCellId() {
      return (
        this.tabbableCell && Number(this.tabbableCell.getAttribute('data-id'))
      )
    },
    fallbackElementToFocus() {
      return this.typeable ? 'input' : 'tabbable-cell'
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
  },
  mounted() {
    this.setTabbableCell()
  },
  methods: {
    /**
     * Focuses the first non-disabled element found in the `refsToFocus` array
     */
    applyFocus() {
      let elementToFocus
      const refsToFocus = [...this.refsToFocus]
      refsToFocus.push(this.fallbackElementToFocus)

      for (let i = 0; i < refsToFocus.length; i += 1) {
        const element = this.getElementByRef(refsToFocus[i])

        if (element && !element.getAttribute('disabled')) {
          elementToFocus = element
          break
        }
      }

      if (elementToFocus) {
        elementToFocus.focus()
      }
    },
    /**
     * Returns the currently focused cell element, if there is one...
     */
    getActiveCell() {
      const isActiveElementACell = this.hasClass(document.activeElement, 'cell')
      const isOnSameView = this.hasClass(document.activeElement, this.view)

      if (isActiveElementACell && isOnSameView && !this.resetTabbableCell) {
        return document.activeElement
      }

      return null
    },
    /**
     * Finds an element by its `ref` attribute
     * @param {string} ref  The `ref` name of the wanted element
     * @returns {Element}   A Vue element
     */
    // eslint-disable-next-line complexity,max-statements
    getElementByRef(ref) {
      if (ref === 'tabbable-cell') {
        this.updateTabbableCell()
        return this.tabbableCell
      }
      if (ref === 'input') {
        return this.$refs.DateInput && this.$refs.DateInput.$refs[this.refName]
      }
      if (ref === 'calendar-button') {
        return this.$refs.DateInput.$refs['calendar-button']
      }
      if (ref === 'open-date') {
        return this.$refs.picker.$refs.cells.$refs['open-date'][0]
      }
      if (this.showHeader) {
        if (ref === 'up') {
          return this.$refs.picker && this.$refs.picker.$refs.up.$el
        }
        return (
          this.$refs.picker &&
          this.$refs.picker.$refs.PickerHeader &&
          this.$refs.picker.$refs.PickerHeader.$refs[ref]
        )
      }
      return null
    },
    /**
     * Returns an array of all HTML elements which should be focus-trapped in the specified slot
     * @returns {Array}   An array of HTML elements
     */
    getElementsFromSlot(slotPrefix) {
      const slotName = `${slotPrefix}${this.ucFirst(this.view)}`

      if (!this.hasSlot(slotName)) {
        return []
      }

      const isBeforeHeader = slotPrefix === 'beforeCalendarHeader'
      const picker = this.getPicker()
      const index = isBeforeHeader ? 0 : picker.children.length - 1
      const fragment = picker.children[index]

      return this.getFocusableElements(fragment)
    },
    /**
     * Returns an array of all HTML elements which should be focus-trapped in the header
     * @returns {Array}   An array of HTML elements
     */
    getElementsFromHeader() {
      const view = this.ucFirst(this.view)
      const beforeCalendarSlotName = `beforeCalendarHeader${view}`
      const picker = this.getPicker()
      const index = this.hasSlot(beforeCalendarSlotName) ? 1 : 0
      const fragment = picker.children[index]

      return this.showHeader ? this.getFocusableElements(fragment) : []
    },
    /**
     * Returns the input element (when typeable)
     * @returns {Element}
     */
    getInputField() {
      if (!this.typeable || this.inline) {
        return null
      }

      return this.$refs.DateInput.$refs[this.refName]
    },
    /**
     * Returns an array of focusable elements in a given HTML fragment
     * @param   {Element} fragment The HTML fragment to search
     * @returns {Array}
     */
    getFocusableElements(fragment) {
      const navNodeList = fragment.querySelectorAll(
        'button:enabled, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )

      return [...Array.prototype.slice.call(navNodeList)]
    },
    /**
     * Returns whichever picker is currently sliding into view
     * @returns {HTMLElement}
     */
    getPicker() {
      return (
        this.$refs.datepicker.children[1] || this.$refs.datepicker.children[0]
      )
    },
    /**
     * Sets `datepickerId` (as a global) and keeps track of focusable elements
     */
    handleFocusChange() {
      document.datepickerId = this.datepickerId

      this.setAllElements()
      this.setNavElements()
      this.setNavElementsFocusedIndex()

      if (this.inline && !this.isDirty) {
        this.setTabbableCell()
        this.isDirty = true
      }
    },
    /**
     * Returns true if the user has arrowed to a new page
     */
    hasArrowedToNewPage() {
      const { refsToFocus } = this

      return (
        refsToFocus &&
        refsToFocus.length === 1 &&
        refsToFocus[0] === 'tabbable-cell'
      )
    },
    /**
     * Returns true if the calendar has been passed the given slot
     * @param  {String} slotName The name of the slot
     * @return {Boolean}
     */
    hasSlot(slotName) {
      return Object.prototype.hasOwnProperty.call(this.$slots, slotName)
    },
    /**
     * Resets the focus to the open date
     */
    resetFocusToOpenDate() {
      this.refsToFocus = ['open-date']
      this.setTransitionAndFocusDelay(
        this.focusedDateTimestamp,
        this.computedOpenDate,
      )

      if (!this.isMinimumView) {
        this.isRevertingToOpenDate = true
        this.view = this.minimumView
      }

      this.setTabbableCell()
      this.reviewFocus()
      this.selectedDate = null
      this.setPageDate()
    },
    /**
     * Sets the correct focus on next tick
     */
    reviewFocus() {
      if (this.hasArrowedToNewPage()) {
        return
      }

      this.tabbableCell = null
      this.resetTabbableCell = true

      this.$nextTick(() => {
        this.setNavElements()

        setTimeout(() => {
          this.applyFocus()
        }, this.focusDelay)

        this.resetTabbableCell = false
      })
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
        this.focusDelay = isInTheFuture ? this.slideDuration : 0
      } else {
        this.focusDelay = 0
      }

      this.setTransitionName(endDate - startDate)
    },
    /**
     * Records all focusable elements (so that we know whether any element in the datepicker is focused)
     */
    setAllElements() {
      const vdpDatepicker = this.$refs['vdp-datepicker']

      this.allElements = this.getFocusableElements(vdpDatepicker)
    },
    /**
     * Sets the array of `refs` that might be focused following a view change (in order of preference)
     * @param {Array} refs The view being changed to
     */
    setFocus(refs) {
      this.refsToFocus = refs
      this.applyFocus()
    },
    /**
     * Determines which elements in datepicker should be focus-trapped
     */
    setNavElements() {
      if (!this.view) return

      this.updateTabbableCell()

      this.navElements = [
        this.getInputField(),
        this.getElementsFromSlot('beforeCalendarHeader'),
        this.getElementsFromHeader(),
        this.tabbableCell,
        this.getElementsFromSlot('calendarFooter'),
      ]
        .filter((item) => !!item)
        .flat()
    },
    /**
     * Keeps track of the currently focused index in the navElements array
     */
    setNavElementsFocusedIndex() {
      for (let i = 0; i < this.navElements.length; i += 1) {
        if (document.activeElement === this.navElements[i]) {
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
      if (!this.$refs.picker || !this.$refs.picker.$refs.cells) {
        return
      }

      const pickerCells = this.$refs.picker.$refs.cells.$el

      this.tabbableCell =
        this.getActiveCell() ||
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
     * Tab backwards through the focus-trapped elements
     */
    /* istanbul ignore next */
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
    /* istanbul ignore next */
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
    /* istanbul ignore next */
    tabThroughNavigation(event) {
      // Allow normal tabbing when closed
      if (!this.isOpen) {
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
     * Update which cell in the picker should be focus-trapped
     */
    updateTabbableCell() {
      const isActiveElementACell = this.hasClass(document.activeElement, 'cell')
      const needToUpdate = !this.tabbableCell || isActiveElementACell

      if (needToUpdate) {
        this.setTabbableCell()
      }
    },
  },
}
</script>
