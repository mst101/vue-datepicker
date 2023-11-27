<template>
  <header>
    <button
      ref="prev"
      class="prev"
      :class="{ btn: props.bootstrapStyling, rtl: props.isRtl }"
      data-test-previous-button
      :disabled="props.isPreviousDisabled"
      type="button"
      @click.stop="goToPreviousPage"
      @keydown.down.prevent="focusTabbableCell"
      @keydown.up.prevent="emit('focusInput')"
      @keydown.left.prevent="arrowLeftPrev"
      @keydown.right.prevent="arrowRightPrev"
    >
      <slot name="prevIntervalBtn">
        <span class="default">&lt;</span>
      </slot>
    </button>
    <button
      ref="up"
      class="vdp-datepicker__up"
      :class="{ btn: props.bootstrapStyling }"
      data-test-up-button
      :disabled="props.isUpDisabled"
      type="button"
      @click.stop="selectUpButton"
      @keydown.down.prevent="focusTabbableCell"
      @keydown.up.prevent="emit('focusInput')"
      @keydown.left.prevent="focusLeftButton"
      @keydown.right.prevent="focusRightButton"
    >
      <slot />
    </button>
    <button
      ref="next"
      class="next"
      :class="{ btn: props.bootstrapStyling, rtl: props.isRtl }"
      data-test-next-button
      :disabled="props.isNextDisabled"
      type="button"
      @click.stop="goToNextPage"
      @keydown.down.prevent="focusTabbableCell"
      @keydown.up.prevent="emit('focusInput')"
      @keydown.left.prevent="arrowLeftNext"
      @keydown.right.prevent="arrowRightNext"
    >
      <slot name="nextIntervalBtn">
        <span class="default">&gt;</span>
      </slot>
    </button>
  </header>
</template>

<script setup lang="ts">
import type { ElementToFocus } from '@/types';
import { ref, computed } from 'vue'

const props = defineProps({
  bootstrapStyling: {
    type: Boolean,
    default: false,
  },
  isNextDisabled: {
    type: Boolean,
    default: false,
  },
  isPreviousDisabled: {
    type: Boolean,
    default: false,
  },
  isRtl: {
    type: Boolean,
    default: false,
  },
  isUpDisabled: {
    type: Boolean,
    default: false,
  },
  nextViewUp: {
    type: String,
    default: null,
  },
})

const emit = defineEmits({
  focusInput: null,
  pageChange: (page) => {
    return typeof page === 'object'
  },
  setFocus: (refArray) => {
    return refArray.every((elementToFocus: ElementToFocus) => {
      return ['input', 'prev', 'up', 'next', 'tabbableCell'].includes(elementToFocus)
    })
  },
  setView: (view) => {
    return ['day', 'month', 'year'].includes(view)
  },
})

const prev = ref<HTMLButtonElement | null>(null)
const up = ref<HTMLButtonElement | null>(null)
const next = ref<HTMLButtonElement | null>(null)

// computed
const leftButton = computed(() => {
  return [props.isRtl ? 'next' : 'prev']
})
const rightButton = computed(() => {
  return [props.isRtl ? 'prev' : 'next']
})

// methods
/**
 * Changes the page, or sets focus to the adjacent button function
 */
function arrowLeftPrev() {
  if (props.isRtl) {
    emit('setFocus', ['up', 'next', 'tabbableCell'])
    return
  }
  goToPreviousPage()
}
/**
 * Changes the page, or sets focus to the adjacent button
 */
function arrowRightPrev() {
  if (props.isRtl) {
    goToPreviousPage()
    return
  }
  emit('setFocus', ['up', 'next', 'tabbableCell'])
}
/**
 * Changes the page, or sets focus to the adjacent button
 */
function arrowLeftNext() {
  if (props.isRtl) {
    goToNextPage()
    return
  }
  emit('setFocus', ['up', 'prev', 'tabbableCell'])
}
/**
 * Changes the page, or sets focus to the adjacent button
 */
function arrowRightNext() {
  if (props.isRtl) {
    emit('setFocus', ['up', 'prev', 'tabbableCell'])
    return
  }
  goToNextPage()
}
function focusTabbableCell() {
  emit('setFocus', ['tabbableCell'])
}
function focusLeftButton() {
  emit('setFocus', leftButton.value)
}
function focusRightButton() {
  emit('setFocus', rightButton.value)
}
function goToNextPage() {
  emit('pageChange', { incrementBy: 1, focusRefs: ['next'] })
}
function goToPreviousPage() {
  emit('pageChange', { incrementBy: -1, focusRefs: ['prev'] })
}
function selectUpButton() {
  if (!props.isUpDisabled) {
    emit('setView', props.nextViewUp)
  }
}

defineExpose({ prev, up, next })
</script>
