<template>
  <header>
    <button
      ref="prev"
      class="prev"
      :class="{ disabled: isPreviousDisabled, rtl: isRtl }"
      :disabled="isPreviousDisabled"
      data-test-previous-button
      type="button"
      @click="$emit('page-change', -1)"
    >
      <slot name="prevIntervalBtn">
        <span class="default">{{ isRtl ? '&gt;' : '&lt;' }}</span>
      </slot>
    </button>
    <slot />
    <button
      ref="next"
      class="next"
      :class="{ disabled: isNextDisabled, rtl: isRtl }"
      :disabled="isNextDisabled"
      data-test-next-button
      type="button"
      @click="$emit('page-change', 1)"
    >
      <slot name="nextIntervalBtn">
        <span class="default">{{ isRtl ? '&lt;' : '&gt;' }}</span>
      </slot>
    </button>
  </header>
</template>

<script>
export default {
  name: 'PickerHeader',
  props: {
    isNextDisabled: {
      type: Boolean,
      required: true,
    },
    isPreviousDisabled: {
      type: Boolean,
      required: true,
    },
    isRtl: {
      type: Boolean,
      required: true,
    },
  },
}
</script>
