<template>
  <header>
    <button
      class="prev"
      :class="{ disabled: isPreviousDisabled, rtl: isRtl }"
      :disabled="isPreviousDisabled"
      type="button"
      @click="$emit(isRtl ? 'next' : 'previous')"
    >
      <slot name="prevIntervalBtn">
        <span class="default">{{ isRtl ? '&gt;' : '&lt;' }}</span>
      </slot>
    </button>
    <slot />
    <button
      class="next"
      :class="{ disabled: isNextDisabled, rtl: isRtl }"
      :disabled="isNextDisabled"
      type="button"
      @click="$emit(isRtl ? 'previous' : 'next')"
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
