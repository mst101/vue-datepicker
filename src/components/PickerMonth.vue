<template>
  <div>
    <div v-if="$slots.beforeCalendarHeaderMonth">
      <slot name="beforeCalendarHeaderMonth" />
    </div>

    <PickerHeader
      v-if="showHeader"
      ref="pickerHeader"
      :bootstrap-styling="bootstrapStyling"
      :is-next-disabled="isNextDisabled"
      :is-previous-disabled="isPreviousDisabled"
      :is-rtl="isRtl"
      :is-up-disabled="isUpDisabled"
      next-view-up="year"
      @focus-input="focusInput"
      @page-change="changePage($event)"
      @set-focus="$emit('setFocus', $event)"
      @set-view="$emit('setView', $event)"
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
          ref="cells"
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

<script>
import pickerMixin from '~/mixins/pickerMixin.vue'
import DisabledDate from '~/utils/DisabledDate'
import PickerCells from './PickerCells.vue'

export default {
  name: 'PickerMonth',
  components: { PickerCells },
  mixins: [pickerMixin],
  emits: {
    setFocus: (refArray) => {
      return refArray.every((ref) => {
        return ['input', 'prev', 'up', 'next', 'tabbableCell'].includes(ref)
      })
    },
    setView: (view) => {
      return view === 'year'
    },
  },
  computed: {
    /**
     * Sets an array with all months to show this year
     * @return {Array}
     */
    cells() {
      const { utils } = this
      const months = []
      const dObj = this.firstMonthCellDate()

      for (let i = 0; i < 12; i += 1) {
        months.push({
          month: utils.getMonthName(i, this.translation.months),
          timestamp: dObj.valueOf(),
          isDisabled: this.isDisabledMonth(dObj),
          isOpenDate: this.isOpenMonth(dObj),
          isSelected: this.isSelectedMonth(dObj),
          isToday: this.isTodayMonth(dObj),
        })
        utils.setMonth(dObj, utils.getMonth(dObj) + 1)
      }

      return months
    },
    /**
     * Is the next year disabled?
     * @return {Boolean}
     */
    isNextDisabled() {
      if (!this.disabledConfig.has.from) {
        return false
      }
      return this.latestPossibleDate <= new Date(this.pageYear, 11, 31)
    },
    /**
     * Is the previous year disabled?
     * @return {Boolean}
     */
    isPreviousDisabled() {
      if (!this.disabledConfig.has.to) {
        return false
      }
      return this.earliestPossibleDate >= new Date(this.pageYear, 0, 1)
    },
    /**
     * Display the current page's year as the title.
     * @return {String}
     */
    pageTitleMonth() {
      const { yearSuffix } = this.translation
      return `${this.pageYear}${yearSuffix}`
    },
  },
  methods: {
    /**
     * Set up a new date object to the first month of the current 'page'
     * @return {Date}
     */
    firstMonthCellDate() {
      const pageDate = new Date(this.pageDate)

      return new Date(this.utils.setMonth(pageDate, 0))
    },
    /**
     * Whether a month is disabled
     * @param {Date} date
     * @return {Boolean}
     */
    isDisabledMonth(date) {
      if (!this.disabledDates) return false

      return new DisabledDate(this.utils, this.disabledDates).isMonthDisabled(
        date,
      )
    },
    /**
     * Should the calendar open on this month?
     * @param {Date} date
     * @return {Boolean}
     */
    isOpenMonth(date) {
      if (!this.openDate) return false

      const openDateMonth = this.utils.getMonth(this.openDate)
      const openDateYear = this.utils.getFullYear(this.openDate)
      const thisDateMonth = this.utils.getMonth(date)
      const thisDateYear = this.utils.getFullYear(date)

      return openDateMonth === thisDateMonth && openDateYear === thisDateYear
    },
    /**
     * Whether the selected date is in this month
     * @param {Date} date
     * @return {Boolean}
     */
    isSelectedMonth(date) {
      if (!this.selectedDate) return false

      const month = this.utils.getMonth(date)
      const year = this.utils.getFullYear(date)

      return (
        this.selectedDate &&
        year === this.utils.getFullYear(this.selectedDate) &&
        month === this.utils.getMonth(this.selectedDate)
      )
    },
    /**
     * Whether the date has the same month and year as today's date
     * @param {Date} date
     * @return {Boolean}
     */
    isTodayMonth(date) {
      const { utils } = this
      const todayMonth = new Date(utils.setDate(utils.getNewDateObject(), 1))

      return utils.compareDates(date, todayMonth)
    },
  },
}
</script>
