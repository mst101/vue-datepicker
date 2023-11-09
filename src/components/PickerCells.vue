<template>
  <div
    class="picker-cells"
    data-test-picker-cells
  >
    <button
      v-for="(cell, id) in cells"
      :key="cell.timestamp"
      :ref="(el) => assignOpenDateRef(el, cell)"
      :class="cellClasses(cell)"
      :data-id="id"
      :data-test-tabbable-cell="isTabbableCell(cell, id)"
      :data-test-open-date="cell.isOpenDate || null"
      :data-test-today-cell="cell.isToday || null"
      :disabled="cell.isDisabled"
      type="button"
      @click.stop="emit('select', cell)"
      @keydown.up.prevent="handleArrow(id, -columns)"
      @keydown.down.prevent="handleArrow(id, columns)"
      @keydown.left.prevent="handleArrow(id, isRtl ? 1 : -1)"
      @keydown.right.prevent="handleArrow(id, isRtl ? -1 : 1)"
    >
      <slot :cell="cell" />
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  bootstrapStyling: {
    type: Boolean,
    default: false,
  },
  cells: {
    type: Array,
    required: true,
  },
  isRtl: {
    type: Boolean,
    default: false,
  },
  showEdgeDates: {
    type: Boolean,
    default: true,
  },
  tabbableCellId: {
    type: Number,
    default: null,
  },
  view: {
    type: String,
    validator: (val) => ['day', 'month', 'year'].includes(val),
    required: true,
  },
})

const emit = defineEmits({
  arrow(config) {
    return typeof config === 'object'
  },
  select(cell) {
    return typeof cell === 'object'
  },
})

const openDateRef = ref(null)

// computed
/**
 * The number of columns in the picker
 * @return {Number}
 */
const columns = computed(() => {
  return props.view === 'day' ? 7 : 3
})

// methods
function assignOpenDateRef(el, cell) {
  if (!el) return

  if (cell.isOpenDate) {
    openDateRef.value = el
  }
}

/**
 * Set the classes for a specific cell
 * @return {Array}
 */
// eslint-disable-next-line complexity
function cellClasses(cell) {
  return [
    'cell',
    props.view,
    {
      'btn': props.bootstrapStyling,
      'disabled': cell.isDisabled,
      'highlight-start': cell.isHighlightStart,
      'highlight-end': cell.isHighlightEnd,
      'highlighted': cell.isHighlighted,
      'muted': cell.isPreviousMonth || cell.isNextMonth,
      'open': cell.isOpenDate,
      'sat': cell.isSaturday,
      'sun': cell.isSunday,
      'selected': props.showEdgeDates
        ? cell.isSelected
        : cell.isSelected && !cell.isPreviousMonth && !cell.isNextMonth,
      'today': props.showEdgeDates
        ? cell.isToday
        : cell.isToday && !cell.isPreviousMonth && !cell.isNextMonth,
      'weekend': cell.isWeekend,
    },
  ]
}

/**
 * Emits an `arrow` event
 */
function handleArrow(cellId, delta) {
  emit('arrow', { cellId, delta })
}

function isTabbableCell(cell, id) {
  if (!props.tabbableCellId) {
    return cell.isOpenDate || null
  }

  return id === props.tabbableCellId || null
}

defineExpose({ cellClasses, openDateRef })
</script>
