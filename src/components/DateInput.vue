<template>
  <div :class="{ 'input-group': bootstrapStyling }">
    <slot name="beforeDateInput" />
    <!-- Calendar Button -->
    <button
      v-if="calendarButton"
      ref="calendarButtonRef"
      class="vdp-datepicker__calendar-button"
      :class="{ 'btn input-group-prepend': bootstrapStyling }"
      data-test-calendar-button
      :disabled="disabled"
      type="button"
      @click="toggle('calendarButton')"
      @focus="handleButtonFocus"
    >
      <span :class="{ 'input-group-text': bootstrapStyling }">
        <slot name="calendarBtn">&hellip;</slot>
      </span>
    </button>
    <!-- Input -->
    <input
      :id="id"
      :ref="assignInputRef"
      autocomplete="off"
      :autofocus="autofocus"
      :class="computedInputClass"
      :clear-button="clearButton"
      data-test-input
      :disabled="disabled"
      :maxlength="maxlength"
      :name="name"
      :pattern="pattern"
      :placeholder="placeholder"
      :readonly="!typeable"
      :required="required"
      :tabindex="tabindex"
      :type="inline ? 'hidden' : null"
      :value="formattedValue"
      @blur="handleInputBlur"
      @click="handleInputClick"
      @focus="handleInputFocus"
      @keydown.delete="handleDelete"
      @keydown.down.prevent="handleKeydownDown"
      @keydown.enter.prevent="handleKeydownEnter"
      @keydown.esc.prevent="handleKeydownEscape"
      @keydown.space="handleKeydownSpace($event)"
      @keydown.tab="$emit('tab', $event)"
      @keyup="handleKeyup($event)"
      @keyup.space="handleKeyupSpace($event)"
    />
    <!-- Clear Button -->
    <button
      v-if="clearButton && selectedDate"
      class="vdp-datepicker__clear-button"
      :class="{ 'btn input-group-append': bootstrapStyling }"
      data-test-clear-button
      :disabled="disabled"
      type="button"
      @click="clearDate"
    >
      <span :class="{ 'input-group-text': bootstrapStyling }">
        <slot name="clearBtn">&times;</slot>
      </span>
    </button>
    <slot name="afterDateInput" />
  </div>
</template>

<script setup>
import makeDateUtils from '~/utils/DateUtils'
import { ref, computed, watch, nextTick } from 'vue'

const props = defineProps({
  autofocus: {
    type: Boolean,
    default: false,
  },
  bootstrapStyling: {
    type: Boolean,
    default: false,
  },
  clearButton: {
    type: Boolean,
    default: null,
  },
  calendarButton: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  format: {
    type: [String, Function],
    default: 'dd MMM yyyy',
  },
  id: {
    type: String,
    default: null,
  },
  inline: {
    type: Boolean,
    default: false,
  },
  inputClass: {
    type: [String, Object, Array],
    default: null,
  },
  maxlength: {
    type: [Number, String],
    default: null,
  },
  name: {
    type: String,
    default: null,
  },
  openDate: {
    type: [String, Date, Number],
    default: null,
  },
  parser: {
    type: Function,
    default: null,
  },
  pattern: {
    type: String,
    default: null,
  },
  placeholder: {
    type: String,
    default: null,
  },
  refName: {
    type: String,
    default: '',
  },
  required: {
    type: Boolean,
    default: false,
  },
  showCalendarOnButtonClick: {
    type: Boolean,
    default: false,
  },
  showCalendarOnFocus: {
    type: Boolean,
    default: false,
  },
  tabindex: {
    type: [Number, String],
    default: null,
  },
  typeable: {
    type: Boolean,
    default: false,
  },
  useUtc: {
    type: Boolean,
    default: false,
  },
  isOpen: {
    type: Boolean,
    default: false,
  },
  selectedDate: {
    type: Date,
    default: null,
  },
  slideDuration: {
    type: Number,
    default: 250,
  },
  translation: {
    type: Object,
    default() {
      return {}
    },
  },
})

const emit = defineEmits({
  blur: null,
  clearDate: null,
  close: null,
  focus: null,
  open: null,
  selectTypedDate: (date) => {
    return date === null || date instanceof Date
  },
  setFocus: (refArray) => {
    return refArray.every((refAttr) => {
      return [
        'calendarButton',
        'input',
        'prev',
        'up',
        'next',
        'tabbableCell',
      ].includes(refAttr)
    })
  },
  tab: null,
  typedDate: (date) => {
    return date === null || date instanceof Date
  },
})

// data
const inputRef = ref(null)
const isInputFocused = ref(false)
const shouldToggleOnFocus = ref(false)
const shouldToggleOnClick = ref(true)
const typedDate = ref('')
const utils = makeDateUtils(props.useUtc)

// expose functions to parent
defineExpose({ parseInput, inputRef })

// computed
const computedInputClass = computed(() => {
  if (props.bootstrapStyling) {
    if (typeof props.inputClass === 'string') {
      return [props.inputClass, 'form-control'].join(' ')
    }
    return { 'form-control': true, ...props.inputClass }
  }
  return props.inputClass
})

const formattedValue = computed(() => {
  if (props.typeable) {
    return typedDate.value
  }

  return formatDate(props.selectedDate)
})

// watch
watch(
  () => props.showCalendarOnFocus,
  (showCalendarOnFocus) => {
    if (showCalendarOnFocus) {
      shouldToggleOnFocus.value = !props.isOpen
    }
  },
  { immediate: true },
)

watch(
  () => props.isOpen,
  (isOpen, wasOpen) => {
    nextTick(() => {
      if (isOpen && props.showCalendarOnFocus) {
        if (wasOpen && !isInputFocused.value) {
          shouldToggleOnFocus.value = true
          return
        }
        shouldToggleOnFocus.value = false
      }
    })
  },
)

watch(
  () => props.selectedDate,
  (selectedDate) => {
    if (props.typeable) {
      typedDate.value = formatDate(selectedDate)
    }
  },
  { immediate: true },
)

// methods
function assignInputRef(el) {
  inputRef.value = el
}

/**
 * Emits a `clear-date` event
 */
function clearDate() {
  inputRef.value.value = ''
  emit('clearDate')
}

/**
 * Formats a date
 * @param {Date} date The date to be formatted
 * @returns {String}
 */
function formatDate(date) {
  if (!date) {
    return ''
  }

  return typeof props.format === 'function'
    ? props.format(new Date(date))
    : utils.formatDate(new Date(date), props.format, props.translation)
}

/**
 * Formats a typed date, or clears it if invalid
 */
function formatTypedDate() {
  const parsedDate = parseInput()

  if (utils.isValidDate(parsedDate)) {
    typedDate.value = formatDate(parsedDate)
  } else {
    if (inputRef.value) {
      inputRef.value.value = ''
    }
    typedDate.value = ''
  }
}

/**
 * Validates typedDate
 */
function handleInputBlur() {
  if (props.showCalendarOnFocus && !props.isOpen) {
    shouldToggleOnFocus.value = true
  }

  if (props.typeable) {
    formatTypedDate()
  }
  isInputFocused.value = false
}

/**
 * Resets `shouldToggleOnFocus` to true
 */
function handleButtonFocus() {
  if (props.showCalendarOnFocus) {
    shouldToggleOnFocus.value = true
  }
}

/**
 * Clears the calendar when the `delete` or `backspace` key is pressed
 */
function handleDelete() {
  if (!props.typeable && props.selectedDate) {
    clearDate()
  }
}

/**
 * Toggles the calendar (unless `show-calendar-on-button-click` is true)
 */
function handleInputClick() {
  if (props.showCalendarOnButtonClick) return

  if (shouldToggleOnClick.value) {
    toggle()
  }
}

/**
 * Opens the calendar when `show-calendar-on-focus` is true (unless `show-calendar-on-button-click` is true)
 */
// eslint-disable-next-line complexity
function handleInputFocus() {
  if (props.showCalendarOnButtonClick) return

  isInputFocused.value = true

  if (!props.isOpen && shouldToggleOnFocus.value) {
    shouldToggleOnClick.value = false
  }

  if (shouldToggleOnFocus.value && !props.isOpen) {
    emit('open')

    setTimeout(() => {
      shouldToggleOnClick.value = true
    }, props.slideDuration)
  }
}

/**
 * Opens the calendar, or sets the focus to the next focusable element down
 */
function handleKeydownDown() {
  if (!props.isOpen) {
    emit('open')
  }

  if (!props.typeable) {
    return
  }

  emit('setFocus', ['prev', 'up', 'next', 'tabbableCell'])
}

/**
 * Selects a typed date and closes the calendar
 */
function handleKeydownEnter(event) {
  if (!props.typeable) {
    return
  }

  if (!event.target.value) {
    emit('selectTypedDate', null)
    return
  }

  const parsedDate = parseInput()

  if (utils.isValidDate(parsedDate)) {
    emit('selectTypedDate', parsedDate)
  }
}

/**
 * Closes the calendar
 */
function handleKeydownEscape() {
  if (props.isOpen) {
    emit('close')
  }
}

/**
 * Prevents scrolling when not typeable
 */
function handleKeydownSpace(event) {
  if (!props.typeable) {
    event.preventDefault()
  }
}

/**
 * Parses a typed date and emits `typed-date` event, if valid
 * @param  {object}  event Used to exclude certain keystrokes
 */
function handleKeyup(event) {
  if (
    !props.typeable ||
    [
      'Control',
      'Escape',
      'Shift',
      'Tab',
      'ArrowUp',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
    ].includes(event.key)
  ) {
    return
  }

  typedDate.value = inputRef.value.value

  if (!typedDate.value) {
    emit('typedDate', null)
    return
  }

  const parsedDate = parseInput()

  if (utils.isValidDate(parsedDate)) {
    emit('typedDate', parsedDate)
  }
}

/**
 * Toggles the calendar unless a typed date has been entered or `show-calendar-on-button-click` is true
 */
function handleKeyupSpace(event) {
  if (props.typeable) {
    if (inputRef.value?.value === '') {
      toggle()
    }
    return
  }

  event.preventDefault()
  if (!props.showCalendarOnButtonClick) {
    toggle()
  }
}

/**
 * Parses the value of the input field
 */
function parseInput() {
  return new Date(
    utils.parseDate(
      inputRef.value.value.trim(),
      props.format,
      props.translation,
      props.parser,
    ),
  )
}

/**
 * Opens or closes the calendar
 */
function toggle(calendarButton) {
  if (props.isOpen) {
    emit('setFocus', [calendarButton || 'input'])
  }

  emit(props.isOpen ? 'close' : 'open')
}
</script>
