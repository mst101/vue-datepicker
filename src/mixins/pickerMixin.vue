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
     * Changes the page up or down
     * @param {Number} incrementBy
     */
    changePage(incrementBy) {
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

      this.$emit('page-change', pageDate)
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
