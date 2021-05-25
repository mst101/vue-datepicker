<template>
  <div class="picker-view">
    <slot name="beforeCalendarHeaderMonth" />
    <PickerHeader
      v-if="showHeader"
      ref="PickerHeader"
      :is-next-disabled="isNextDisabled"
      :is-previous-disabled="isPreviousDisabled"
      :is-rtl="isRtl"
      :is-typeable="isTypeable"
      :is-up-disabled="isUpDisabled"
      @clear-date="$emit('clear-date')"
      @page-change="changePage($event)"
      @set-focus="$emit('set-focus', $event)"
    >
      <slot slot="prevIntervalBtn" name="prevIntervalBtn" />
      <UpButton
        ref="up"
        class="month__year_btn"
        :is-disabled="isUpDisabled"
        :is-rtl="isRtl"
        :is-typeable="isTypeable"
        :title="pageTitle"
        @clear-date="$emit('clear-date')"
        @select="$emit('set-view', 'year')"
        @set-focus="$emit('set-focus', $event)"
      />
      <slot slot="nextIntervalBtn" name="nextIntervalBtn" />
    </PickerHeader>

    <div
      class="cells-wrapper"
      :style="`transition-duration: ${slideDuration}ms; height: ${cellsHeight}px`"
    >
      <Transition :name="transitionName">
        <PickerCells
          ref="cells"
          :key="pageTitle"
          :is-rtl="isRtl"
          :cells="cells"
          :style="`transition-duration: ${slideDuration}ms`"
          :tabbable-cell-id="tabbableCellId"
          view="month"
          @arrow="handleArrow($event)"
          @clear-date="$emit('clear-date')"
          @select="handleSelect($event)"
        />
      </Transition>
    </div>

    <slot name="calendarFooterMonth" />
  </div>
</template>

<script>
import pickerMixin from '~/mixins/pickerMixin.vue'
import DisabledDate from '~/utils/DisabledDate'
import PickerCells from './PickerCells.vue'
import UpButton from './UpButton.vue'

export default {
  name: 'PickerMonth',
  components: { PickerCells, UpButton },
  mixins: [pickerMixin],
  computed: {
    /**
     * Sets an array with all months to show this year
     * @return {Array}
     */
    cells() {
      const d = this.pageDate
      const months = []
      // set up a new date object to the beginning of the current 'page'
      const dObj = this.useUtc
        ? new Date(Date.UTC(d.getUTCFullYear(), 0, d.getUTCDate()))
        : new Date(
            d.getFullYear(),
            0,
            d.getDate(),
            d.getHours(),
            d.getMinutes(),
          )

      const todayMonth = new Date(
        this.utils.setDate(this.utils.getNewDateObject(), 1),
      )

      for (let i = 0; i < 12; i += 1) {
        months.push({
          month: this.utils.getMonthName(i, this.translation.months),
          timestamp: dObj.valueOf(),
          isDisabled: this.isDisabledMonth(dObj),
          isOpenDate:
            this.isMinimumView &&
            this.openDate &&
            this.utils.compareDates(dObj, this.openDate),
          isSelected: this.isSelectedMonth(dObj),
          isToday: this.utils.compareDates(dObj, todayMonth),
        })
        this.utils.setMonth(dObj, this.utils.getMonth(dObj) + 1)
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
      return this.disabledConfig.from.year <= this.pageYear
    },
    /**
     * Is the previous year disabled?
     * @return {Boolean}
     */
    isPreviousDisabled() {
      if (!this.disabledConfig.has.to) {
        return false
      }
      return this.disabledConfig.to.year >= this.pageYear
    },
    /**
     * Display the current page's year as the title.
     * @return {String}
     */
    pageTitle() {
      const { yearSuffix } = this.translation
      return `${this.pageYear}${yearSuffix}`
    },
  },
  methods: {
    /**
     * Whether a month is disabled
     * @param {Date} date
     * @return {Boolean}
     */
    isDisabledMonth(date) {
      return new DisabledDate(this.utils, this.disabledDates).isMonthDisabled(
        date,
      )
    },
    /**
     * Whether the selected date is in this month
     * @param {Date} date
     * @return {Boolean}
     */
    isSelectedMonth(date) {
      const month = this.utils.getMonth(date)
      const year = this.utils.getFullYear(date)

      return (
        this.selectedDate &&
        year === this.utils.getFullYear(this.selectedDate) &&
        month === this.utils.getMonth(this.selectedDate)
      )
    },
  },
}
</script>
