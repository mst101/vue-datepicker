<template>
  <button
    class="up"
    data-test-up-button
    :disabled="isDisabled"
    type="button"
    @click="$emit('select')"
  >
    <slot />
  </button>
</template>

<script>
export default {
  name: 'UpButton',
  props: {
    isDisabled: {
      type: Boolean,
      default: false,
    },
  },
}
</script>
