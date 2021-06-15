<script>
export default {
  data() {
    return {
      focus: {
        delay: 0,
        refs: [],
      },
      navElements: [],
      navElementsFocusedIndex: 0,
      tabbableCell: null,
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
  },
  mounted() {
    this.setTabbableCell()
  },
  methods: {
    /**
     * Focuses the first non-disabled element found in the `focus.refs` array
     */
    applyFocus() {
      const focusRefs = [...this.focus.refs, this.fallbackElementToFocus]

      for (let i = 0; i < focusRefs.length; i += 1) {
        const element = this.getElementByRef(focusRefs[i])

        if (element && !element.getAttribute('disabled')) {
          element.focus()
          break
        }
      }
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
        return this.$refs.dateInput && this.$refs.dateInput.$refs[this.refName]
      }
      if (ref === 'calendarButton') {
        return this.$refs.dateInput.$refs.calendarButton
      }
      if (ref === 'openDate') {
        return this.$refs.picker.$refs.cells.$refs[ref][0]
      }
      if (this.showHeader) {
        if (ref === 'up') {
          return this.$refs.picker && this.$refs.picker.$refs.up.$el
        }
        return (
          this.$refs.picker &&
          this.$refs.picker.$refs.pickerHeader &&
          this.$refs.picker.$refs.pickerHeader.$refs[ref]
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
     * Keeps track of focusable elements
     */
    handleFocusChange() {
      this.setNavElements()
      this.setNavElementsFocusedIndex()
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
     * Sets the correct focus on next tick
     */
    reviewFocus() {
      this.setTabbableCell()

      this.$nextTick(() => {
        this.setNavElements()

        setTimeout(() => {
          this.applyFocus()
        }, this.focus.delay)
      })
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
        pickerCells.querySelector('button.selected:not(.muted):enabled') ||
        pickerCells.querySelector('button.open:not(.muted):enabled') ||
        pickerCells.querySelector('button.today:not(.muted):enabled') ||
        pickerCells.querySelector('button.cell:not(.muted):enabled')
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
