<template>
  <header>
    <button
      ref="prev"
      :class="[{ disabled: isPreviousDisabled, rtl: isRtl }, 'prev']"
      :disabled="isPreviousDisabled"
      data-test-previous-button=""
      type="button"
      @click="$emit('page-change', previousPage)"
      @keydown.down.prevent="$emit('set-focus', ['tabbable-cell'])"
      @keydown.enter.prevent="$emit('page-change', previousPage)"
      @keydown.esc.prevent="$emit('clear-date')"
      @keydown.up.prevent="isTypeable ? $emit('set-focus', ['input']) : null"
      @keydown.left.prevent="arrowLeftPrev"
      @keydown.right.prevent="arrowRightPrev"
      @keyup.space.prevent="$emit('page-change', previousPage)"
    >
      <slot name="prevIntervalBtn">
        <span class="default">{{ isRtl ? '&gt;' : '&lt;' }}</span>
      </slot>
    </button>
    <slot />
    <button
      ref="next"
      :class="[{ disabled: isNextDisabled, rtl: isRtl }, 'next']"
      :disabled="isNextDisabled"
      data-test-next-button
      type="button"
      @click="$emit('page-change', nextPage)"
      @keydown.down.prevent="$emit('set-focus', ['tabbable-cell'])"
      @keydown.enter.prevent="$emit('page-change', nextPage)"
      @keydown.esc.prevent="$emit('clear-date')"
      @keydown.up.prevent="isTypeable ? $emit('set-focus', ['input']) : null"
      @keydown.left.prevent="arrowLeftNext"
      @keydown.right.prevent="arrowRightNext"
      @keyup.space.prevent="$emit('page-change', nextPage)"
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
    isTypeable: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      previousPage: { incrementBy: -1, elementsToFocus: ['prev'] },
      nextPage: { incrementBy: 1, elementsToFocus: ['next'] },
    }
  },
  methods: {
    /**
     * Changes the page, or sets focus to the adjacent button
     */
    arrowLeftPrev() {
      if (this.isRtl) {
        this.$emit('set-focus', ['up', 'next', 'tabbable-cell'])
        return
      }
      this.$emit('page-change', this.previousPage)
    },
    /**
     * Changes the page, or sets focus to the adjacent button
     */
    arrowRightPrev() {
      if (this.isRtl) {
        this.$emit('page-change', this.previousPage)
        return
      }
      this.$emit('set-focus', ['up', 'next', 'tabbable-cell'])
    },
    /**
     * Changes the page, or sets focus to the adjacent button
     */
    arrowLeftNext() {
      if (this.isRtl) {
        this.$emit('page-change', this.nextPage)
        return
      }
      this.$emit('set-focus', ['up', 'prev', 'tabbable-cell'])
    },
    /**
     * Changes the page, or sets focus to the adjacent button
     */
    arrowRightNext() {
      if (this.isRtl) {
        this.$emit('set-focus', ['up', 'prev', 'tabbable-cell'])
        return
      }
      this.$emit('page-change', this.nextPage)
    },
  },
}
</script>
