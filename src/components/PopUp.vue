<script lang="ts">
import { h, useSlots } from 'vue'
import { getPopupElementSize, getRelativePosition } from '../utils/dom'
import type { FixedPosition } from '@/types'

export default {
  name: 'PopUp',
  props: {
    appendToBody: {
      type: Boolean,
      default: true,
    },
    fixedPosition: {
      type: String,
      default: '',
    },
    inline: {
      type: Boolean,
      default: false,
    },
    rtl: {
      type: Boolean,
      default: false,
    },
    visible: {
      type: Boolean,
      default: false,
    },
  },
  watch: {
    visible: {
      immediate: true,
      handler(isVisible) {
        if (isVisible) {
          this.displayPopup()
        }
      },
    },
  },
  mounted() {
    if (this.inline) return

    if (this.appendToBody) {
      document.body.appendChild(this.$el)
    }
  },
  beforeUnmount() {
    if (this.inline) return

    if (this.appendToBody && this.$el.parentNode) {
      this.$el.parentNode.removeChild(this.$el)
    }
  },
  methods: {
    /**
     * Sets the `left` and `top` style attributes of the popup
     */
    displayPopup() {
      if (this.inline || !this.visible) return

      const popup = this.$el.children[0]
      const { width, height } = getPopupElementSize(popup)
      const { left, top } = getRelativePosition({
        el: popup,
        elRelative: this.$parent?.$el,
        targetWidth: width,
        targetHeight: height,
        appendToBody: this.appendToBody,
        fixedPosition: this.fixedPosition as FixedPosition,
        rtl: this.rtl,
      })

      popup.style.left = left
      popup.style.top = top
    },
  },
  render() {
    // const slots = useSlots()
    // if (slots === undefined || !slots.default || !slots!.default()[0].children!.default) {
    //   return null
    // }
    // const test = slots!.default()
    // const test2 = slots!.default()[0].children!.default()
    // console.log(test, test2)
    return h('div', useSlots().default!()[0].children!.default())
  },
}
</script>
