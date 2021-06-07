<template>
  <div>
    <button
      v-for="cell in cells"
      :key="cell.timestamp"
      :class="cellClasses(cell)"
      :disabled="cell.isDisabled"
      type="button"
      @click="$emit('select', cell)"
    >
      <slot :cell="cell" />
    </button>
  </div>
</template>

<script>
export default {
  name: 'PickerCells',
  props: {
    cells: {
      type: Array,
      required: true,
    },
    showEdgeDates: {
      type: Boolean,
      default: true,
    },
    view: {
      type: String,
      validator: (val) => ['day', 'month', 'year'].includes(val),
      required: true,
    },
  },
  methods: {
    /**
     * Set the classes for a specific cell
     * @return {Array}
     */
    cellClasses(cell) {
      return [
        'cell',
        this.view,
        {
          'disabled': cell.isDisabled,
          'highlight-start': cell.isHighlightStart,
          'highlight-end': cell.isHighlightEnd,
          'highlighted': cell.isHighlighted,
          'muted': cell.isPreviousMonth || cell.isNextMonth,
          'open': cell.isOpenDate,
          'sat': cell.isSaturday,
          'sun': cell.isSunday,
          'selected': cell.isSelected,
          'today': this.showEdgeDates
            ? cell.isToday
            : cell.isToday && !cell.isPreviousMonth && !cell.isNextMonth,
          'weekend': cell.isWeekend,
        },
      ]
    },
  },
}
</script>
