<script>
import { getPopupElementSize, getRelativePosition } from '~/utils/dom'

export default {
  name: 'Popup',
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
    height: {
      type: Number,
      default: 0,
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
  data() {
    return {
      popupRect: {
        width: 0,
        height: 0,
      },
    }
  },
  watch: {
    visible: {
      immediate: true,
      handler(val) {
        if (val) {
          this.displayPopup()
        }
      },
    },
  },
  mounted() {
    if (this.inline) {
      return
    }
    if (this.appendToBody) {
      document.body.appendChild(this.$el)
    }
  },
  beforeDestroy() {
    if (this.inline) {
      return
    }
    if (this.appendToBody && this.$el.parentNode) {
      this.$el.parentNode.removeChild(this.$el)
    }
  },
  methods: {
    setTopStyle() {
      if (this.appendToBody) {
        const relativeRect = this.$parent.$el.getBoundingClientRect()
        this.$el.style.top = `${relativeRect.bottom + window.scrollY}px`
      }
    },
    displayPopup() {
      if (this.inline || !this.visible) return
      this.setTopStyle()
      const popup = this.$el
      const relativeElement = this.$parent.$el
      this.popupRect = getPopupElementSize(popup)
      const { width } = this.popupRect
      const { left, top } = getRelativePosition({
        el: popup,
        elRelative: relativeElement,
        targetWidth: width,
        targetHeight: this.height,
        appendToBody: this.appendToBody,
        fixedPosition: this.fixedPosition,
        rtl: this.rtl,
      })

      this.$el.style.left = left
      this.$el.style.top = top
    },
  },
  render() {
    return this.$slots.default
  },
}
</script>
