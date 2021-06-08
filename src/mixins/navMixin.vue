<script>
export default {
  data() {
    return {
      focus: {
        delay: 0,
        refs: [],
      },
    }
  },
  computed: {
    fallbackElementToFocus() {
      return this.typeable ? 'input' : 'tabbable-cell'
    },
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
     * Sets the correct focus on next tick
     */
    reviewFocus() {
      this.$nextTick(() => {
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
  },
}
</script>
