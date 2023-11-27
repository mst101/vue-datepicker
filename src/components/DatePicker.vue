<template>
  <div
    :id="datepickerId"
    ref="datepicker"
    class="vdp-datepicker"
    :class="[wrapperClass, { rtl: isRtl }]"
    @focusin="handleFocusIn()"
    @focusout="handleFocusOut()"
    @keydown.esc="resetOrClose"
  >
    <DateInput
      :id="id"
      ref="dateInputRef"
      :autofocus="autofocus"
      :bootstrap-styling="bootstrapStyling"
      :calendar-button="calendarButton"
      :clear-button="clearButton"
      :disabled="disabled"
      :format="format"
      :inline="inline"
      :input-class="inputClass"
      :is-open="isOpen"
      :maxlength="maxlength"
      :name="name"
      :parser="parser"
      :pattern="pattern"
      :placeholder="placeholder"
      :ref-name="refName"
      :required="required"
      :selected-date="selectedDate"
      :show-calendar-on-button-click="showCalendarOnButtonClick"
      :show-calendar-on-focus="showCalendarOnFocus"
      :slide-duration="slideDuration"
      :tabindex="tabindex"
      :translation="translation"
      :typeable="typeable"
      :use-utc="useUtc"
      @clear-date="clearDate"
      @close="close"
      @open="open"
      @select-typed-date="selectTypedDate"
      @set-focus="setFocus($event)"
      @tab="tabThroughNavigation"
      @typed-date="handleTypedDate"
    >
      <template #beforeDateInput>
        <slot name="beforeDateInput" />
      </template>

      <template #afterDateInput>
        <slot name="afterDateInput" />
      </template>

      <template #clearBtn>
        <slot name="clearBtn" />
      </template>

      <template #calendarBtn>
        <slot name="calendarBtn" />
      </template>
    </DateInput>

    <PopUp
      ref="popupRef"
      :append-to-body="appendToBody"
      :fixed-position="fixedPosition"
      :inline="inline"
      :rtl="isRtl"
      :visible="isOpen"
      @keydown.delete="clearDate"
    >
      <Transition name="toggle">
        <div
          v-show="isOpen"
          class="vdp-datepicker__calendar"
          :class="pickerClasses"
          data-test-calendar
          @mousedown.prevent
          @focusin.stop="handleFocusIn()"
          @focusout.stop="handleFocusOut()"
          @keydown.esc.stop="resetOrClose"
          @keydown.tab.stop="tabThroughNavigation($event)"
        >
          <Transition name="view">
            <div
              v-show="true"
              ref="viewRef"
              :key="view"
            >
              <div v-if="$slots.beforeCalendarHeader">
                <slot name="beforeCalendarHeader" />
              </div>
              <Component
                :is="pickerComponents[pickerName]"
                ref="pickerRef"
                :bootstrap-styling="bootstrapStyling"
                class="picker-view"
                :day-cell-content="dayCellContent"
                :disabled-dates="disabledDates"
                :first-day-of-week="firstDayOfWeek"
                :highlighted="highlighted"
                :is-rtl="isRtl"
                :is-typeable="typeable"
                :is-up-disabled="isUpDisabled"
                :is-minimum-view="isMinimumView"
                :computed-open-date="computedOpenDate"
                :page-date="pageDate"
                :selected-date="selectedDate"
                :show-edge-dates="showEdgeDates"
                :show-full-month-name="fullMonthName"
                :show-header="showHeader"
                :slide-duration="slideDuration"
                :tabbable-cell-id="tabbableCellId"
                :transition-name="transitionName"
                :translation="translation"
                :use-utc="useUtc"
                :view="view || computedInitialView"
                :year-range="yearPickerRange"
                @page-change="handlePageChange"
                @select="handleSelect"
                @set-focus="setFocus($event)"
                @set-skip-review-focus="skipReviewFocus = $event"
                @set-transition-name="setTransitionName($event)"
                @set-view="setView"
              >
                <template
                  v-for="slotKey of usedCalendarSlots"
                  #[slotKey]
                >
                  <slot :name="slotKey" />
                </template>
                <template #dayCellContent="{ cell }">
                  <slot
                    v-if="cell"
                    name="dayCellContent"
                    :cell="cell"
                  />
                </template>
              </Component>
              <div v-if="$slots.calendarFooter">
                <slot name="calendarFooter" />
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </PopUp>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  reactive,
  computed,
  watch,
  onMounted,
  onBeforeUnmount,
  nextTick,
  toRefs,
  useSlots,
  type ComputedRef,
  type Component,
  type Ref,
} from 'vue'
import { en } from '../locale'
import calendarSlots from '../utils/calendarSlots'
import DateInput from '../components/DateInput.vue'
import DisabledDate from '../utils/DisabledDate'
import PopUp from '../components/PopUp.vue'
import PickerDay from '../components/PickerDay.vue'
import PickerMonth from '../components/PickerMonth.vue'
import PickerYear from '../components/PickerYear.vue'
import useDateUtils from '../composables/useDateUtils'
import type {
  CalendarSlot,
  Cell,
  CellDay,
  DisabledConfig,
  ElementToFocus,
  FixedPosition,
  PageChange,
  View,
} from '../types'

const pickerComponents = {
  PickerDay,
  PickerMonth,
  PickerYear,
}
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
  appendToBody: {
    type: Boolean,
    default: false,
  },
  calendarClass: {
    type: [String, Object, Array],
    default: '',
  },
  dayCellContent: {
    type: Function,
    default: (day: CellDay) => day.date,
  },
  disabledDates: {
    type: Object,
    default: null,
  },
  firstDayOfWeek: {
    type: String,
    default: 'sun',
  },
  fixedPosition: {
    type: String,
    default: '',
    validator: (val: FixedPosition) => {
      const possibleValues = [
        '',
        'bottom',
        'bottom-left',
        'bottom-right',
        'top',
        'top-left',
        'top-right',
      ]
      return possibleValues.includes(val)
    },
  },
  fullMonthName: {
    type: Boolean,
    default: null,
  },
  highlighted: {
    type: Object,
    default: null,
  },
  initialView: {
    type: String,
    default: '',
  },
  language: {
    type: Object,
    default: () => en,
  },
  maximumView: {
    type: String,
    default: 'year',
  },
  minimumView: {
    type: String,
    default: 'day',
  },
  modelValue: {
    type: [String, Date, Number],
    default: null,
  },
  showEdgeDates: {
    type: Boolean,
    default: true,
  },
  showHeader: {
    type: Boolean,
    default: true,
  },
  wrapperClass: {
    type: [String, Object, Array],
    default: '',
  },
  yearPickerRange: {
    type: Number,
    default: 10,
  },
})

const emit = defineEmits({
  'blur': null,
  'changed': null,
  'cleared': null,
  'closed': null,
  'focus': null,
  'opened': null,
  'changedMonth': (date: Date) => {
    return typeof date === 'object'
  },
  'changedYear': (date: Date) => {
    return typeof date === 'object'
  },
  'changedDecade': (date: Date) => {
    return typeof date === 'object'
  },
  'selected': (date) => {
    return date instanceof Date || date === null
  },
  'update:modelValue': (date) => {
    return date instanceof Date || date === null
  },
})

const { useUtc } = toRefs(props)

// data
const utils = useDateUtils(useUtc)
const initialOpenDate = utils.getOpenDate(
  props.openDate,
  props.modelValue,
  (props.initialView as View) || (props.minimumView as View),
)

const focus = reactive({
  delay: 0,
  refs: [] as ElementToFocus[],
})
const inlineTabbableCell = ref<HTMLButtonElement | null>(null)
const isActive = ref(false)
const isRevertingToOpenDate = ref(false)
const navElements = ref<HTMLElement[]>([])
const navElementsFocusedIndex = ref(0)
const resetTabbableCell = ref(false)
const skipReviewFocus = ref(false)
const tabbableCell = ref<HTMLButtonElement | null>(null)
const transitionName = ref<'slide-left' | 'slide-right'>('slide-left')
const isClickOutside = ref(false)
const globalDatepickerId = ref('')
/*
 * The latest valid `typedDate` (used for typeable datepicker)
 * {Date}
 */
const latestValidTypedDate = ref<Date | null>(null)
/*
 * Vue cannot observe changes to a Date Object so date must be stored as a timestamp
 * This represents the first day of the current viewing month
 * {Number}
 */
const pageTimestamp = ref(utils.setDate(initialOpenDate, 1))
const selectedDate = ref<Date | null>(null)
const slideDuration = ref(250)
const view = ref<View>('')
const pickerRef = ref<typeof pickerComponents | null>(null)
const viewRef = ref<HTMLDivElement | null>(null)
const dateInputRef = ref<Component | null>(null)
const popupRef = ref<HTMLDivElement | null>(null)
const slots = useSlots()

// computed
const fallbackElementsToFocus = computed(() => {
  const elements: ElementToFocus[] = ['tabbableCell', 'prev', 'next']

  if (props.typeable) {
    elements.unshift('input')
  }

  return elements
})
const tabbableCellId = computed(() => {
  return (
    tabbableCell.value &&
    Number((tabbableCell.value as HTMLButtonElement).getAttribute('data-id'))
  )
})
const focusedDateTimestamp = computed(() => {
  const pageDate = new Date(pageTimestamp.value)
  if (hasClass(tabbableCell.value as HTMLElement, 'day')) {
    return utils.setDate(pageDate, Number(tabbableCell.value?.innerHTML.trim()))
  }

  if (hasClass(tabbableCell.value as HTMLElement, 'month')) {
    return utils.setMonth(pageDate, Number(tabbableCellId.value))
  }

  const fullYear = utils.getFullYear(pageDate) - 1
  return utils.setFullYear(pageDate, fullYear + Number(tabbableCellId.value))
})
const computedInitialView = computed(() => {
  return (props.initialView as View) || (props.minimumView as View)
})
const computedOpenDate = computed(() => {
  return utils.getOpenDate(
    props.openDate,
    props.modelValue,
    props.minimumView as View,
  )
})
const datepickerId = computed(() => {
  return `vdp-${Math.random().toString(36).slice(-10)}`
})
const isInline = computed(() => {
  return !!props.inline
})
const isOpen = computed(() => {
  return view.value !== ''
})
const isMinimumView = computed(() => {
  return view.value === props.minimumView
})
interface NextView {
  up: View | 'decade' | undefined
  down: View | undefined
}
const nextView: ComputedRef<NextView> = computed(() => {
  const views: View[] = ['day', 'month', 'year']
  const isCurrentView = (thisView: View) => thisView === view.value
  const viewIndex = views.findIndex(isCurrentView)
  const nextViewDown = (index: number) => {
    return index <= 0 ? undefined : views[index - 1]
  }
  const nextViewUp = (index: number) => {
    if (index < 0) {
      return undefined
    }

    if (index === views.length - 1) {
      return 'decade'
    }

    return views[index + 1]
  }

  return {
    up: nextViewUp(viewIndex),
    down: nextViewDown(viewIndex),
  }
})
const isUpDisabled = computed(() => {
  return !allowedToShowView(nextView.value.up)
})
const pageDate = computed(() => {
  return new Date(pageTimestamp.value)
})
type PickerNames = 'PickerDay' | 'PickerMonth' | 'PickerYear'
const pickerName = computed(() => {
  const viewName = (view.value as View) || (computedInitialView.value as View)
  return `Picker${ucFirst(viewName)}` as PickerNames
})
const translation = computed(() => {
  return props.language
})
const isRtl: ComputedRef<boolean> = computed(() => {
  return translation.value.rtl
})
const pickerClasses = computed(() => {
  return [
    props.calendarClass,
    isInline.value && 'vdp-datepicker__calendar--inline',
    isRtl.value && props.appendToBody && 'rtl',
  ]
})
const usedCalendarSlots = computed(() => {
  return calendarSlots.filter((slot) => hasSlot(slot))
})

// expose some methods so that tests can spy on them
const ctx = {
  setInitialView,
  setValue,
  setPageDate,
}

// watch
watch(
  () => props.disabledDates,
  () => {
    const selectedDateNew =
      selectedDate.value || utils.parseAsDate(props.modelValue)

    if (!selectedDateNew) {
      return
    }

    if (isDateDisabled(selectedDateNew)) {
      selectDate(null)
      return
    }

    if (dateHasChanged(selectedDateNew)) {
      selectDate(selectedDateNew)
    }
  },
  { deep: true },
)

watch(
  () => props.initialView,
  () => {
    if (isOpen.value) {
      ctx.setInitialView()
    }
  },
)

watch(isInline, (isNowInline) => {
  if (!isNowInline) {
    close()
    return
  }
  setInitialView()
})

watch(isActive, (hasJustBecomeActive, isNoLongerActive) => {
  if (hasJustBecomeActive) {
    datepickerIsActive()
  }

  if (isNoLongerActive) {
    datepickerIsInactive()
  }
})

watch(latestValidTypedDate as Ref<Date>, (date: Date) => {
  setPageDate(date)
})

watch(
  () => props.modelValue,
  (newValue, oldValue) => {
    let parsedValue = utils.parseAsDate(newValue)
    const oldParsedValue = utils.parseAsDate(oldValue)

    if (!utils.compareDates(parsedValue, oldParsedValue)) {
      const isDateDisabledNew = parsedValue && isDateDisabled(parsedValue)

      if (isDateDisabledNew) {
        parsedValue = null
      }
      ctx.setValue(parsedValue)
    }
  },
  { immediate: true },
)

watch(computedOpenDate, (newDate) => {
  ctx.setPageDate(newDate)
})

watch(view, (newView, oldView) => {
  if (oldView === '') {
    setPageDate(utils.adjustDateToView(computedOpenDate.value, newView as View))
  }
  handleViewChange(newView, oldView)
})

// onMounted
onMounted(() => {
  init()
  document.addEventListener('click', handleClickOutside)
})

// onBeforeUnmount
onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

// methods
/**
 * Converts a date to first in month for `month` view or first in year for `year` view
 * @param   {Date} date The date to convert
 * @returns {Date}
 */
function getCellDate(date: Date) {
  switch (view.value) {
    case 'month':
      return new Date(utils.setDate(date, 1))
    case 'year':
      return new Date(utils.setMonth(new Date(utils.setDate(date, 1)), 0))
    default:
      return date
  }
}

/**
 * Returns true, unless tabbing should be focus-trapped
 * @return {Boolean}
 */
function allowNormalTabbing(event: KeyboardEvent) {
  if (!isOpen.value) {
    return true
  }
  /* c8 ignore start */
  return isTabbingAwayFromInlineDatepicker(event)
}
/* c8 ignore stop */

/**
 * Focuses the first non-disabled element found in the `focus.refs` array and sets `navElementsFocusedIndex`
 */
function applyFocus() {
  const focusRefs = [...focus.refs, ...fallbackElementsToFocus.value]
  for (let i = 0; i < focusRefs.length; i += 1) {
    const element = getElementByRef(focusRefs[i])

    if (element && element.getAttribute('disabled') === null) {
      element.focus()
      setNavElementsFocusedIndex()
      break
    }
  }
}

/**
 * Ensures the most recently focused tabbable cell is focused when tabbing backwards to an inline calendar
 * If no element has previously been focused, the tabbable cell is reset and focused
 */
/* c8 ignore start */
function focusInlineTabbableCell() {
  if (inlineTabbableCell.value) {
    inlineTabbableCell.value.focus()

    return
  }

  resetTabbableCell.value = true
  setTabbableCell()
  tabbableCell.value?.focus()
  resetTabbableCell.value = false
}
/* c8 ignore stop */

/**
 * Returns the currently focused cell element, if there is one...
 */
function getActiveCell() {
  const activeElement = getActiveElement() as HTMLElement
  const isActiveElementACell = hasClass(activeElement, 'cell')
  const isOnSameView = hasClass(activeElement, view.value)

  if (isActiveElementACell && isOnSameView && !resetTabbableCell.value) {
    return activeElement
  }

  return null
}

/**
 * Returns the currently focused element, using shadowRoot for web-components...
 */
function getActiveElement() {
  return document.activeElement?.shadowRoot
    ? document.activeElement.shadowRoot.activeElement
    : document.activeElement
}

/**
 * Returns the `cellId` for a given a date
 * @param {Date} date The date for which we need the cellId
 * @returns {Number|null}
 */
function getCellId(date: Date) {
  /* c8 ignore next 3 (N.B. Cypress needs this null check) */
  if (!date) {
    return null
  }

  const cellDate = getCellDate(date)
  const cells: Cell[] = pickerRef.value!.cells

  for (let i = 0; i < cells.length; i += 1) {
    if (cells[i].timestamp === cellDate.valueOf()) {
      return i
    }
  }

  return null
}

/**
 * Finds an element by its `ref` attribute
 * @param {string} ref        The `ref` name of the wanted element
 * @returns {HTMLElement|Vue} A Vue element
 */
// eslint-disable-next-line complexity
function getElementByRef(elementToFocus: ElementToFocus) {
  switch (elementToFocus) {
    case 'tabbableCell':
      return tabbableCell.value
    case 'input':
      return dateInputRef.value?.inputRef
    case 'calendarButton':
      return dateInputRef.value && dateInputRef.value.calendarButtonRef
    case 'openDate':
      return pickerRef.value.pickerCellsRef.openDateRef
    default:
      if (props.showHeader) {
        return pickerRef.value?.pickerHeaderRef[elementToFocus]
      }
      /* c8 ignore next */
      return null
  }
}

/**
 * Returns an array of all HTML elements which should be focus-trapped in the calendarFooter slot
 * @returns {Array}   An array of HTML elements
 */
function getElementsFromCalendarFooter() {
  const footerSlotIndex = hasSlot('beforeCalendarHeader') ? 2 : 1

  return getFocusableElements(viewRef.value!.children[footerSlotIndex])
}

/**
 * Returns an array of all HTML elements which should be focus-trapped in the specified slot
 * @returns {Array}   An array of HTML elements
 */
function getElementsFromSlot(slotName: CalendarSlot) {
  if (!hasSlot(slotName)) {
    return []
  }

  if (slotName === 'beforeCalendarHeader') {
    return getFocusableElements(viewRef.value!.children[0])
  }

  if (slotName === 'calendarFooter') {
    return getElementsFromCalendarFooter()
  }

  const isBeforeHeader = slotName.indexOf('beforeCalendarHeader') > -1
  const pickerElement = pickerRef.value!.$el
  const index = isBeforeHeader ? 0 : pickerElement.children.length - 1

  return getFocusableElements(pickerElement.children[index])
}

/**
 * Returns an array of all HTMLButtonElements which should be focus-trapped in the header
 * @returns {Array}   An array of HTMLButtonElements
 */
function getElementsFromHeader() {
  if (!pickerRef.value!.pickerHeaderRef) {
    return []
  }
  const header = pickerRef.value!.pickerHeaderRef.$el
  const navNodeList = header.querySelectorAll('button:enabled')

  return [...Array.prototype.slice.call(navNodeList)]
}

/**
 * Returns an array of focusable elements in a given HTML fragment
 * @param   {Element} fragment The HTML fragment to search
 * @returns {Array}
 */
function getFocusableElements(fragment: HTMLElement) {
  const navNodeList = fragment.querySelectorAll(
    'button:enabled:not([tabindex="-1"]), [href]:not([tabindex="-1"]), input:not([tabindex="-1"]):not([type=hidden]), select:enabled:not([tabindex="-1"]), textarea:enabled:not([tabindex="-1"]), [tabindex]:not([tabindex="-1"])',
  )

  return [...Array.prototype.slice.call(navNodeList)]
}

/**
 * Returns the first focusable element of an inline datepicker
 * @returns {HTMLElement}
 */
/* c8 ignore start */
function getFirstInlineFocusableElement() {
  const popupElements = getFocusableElements(popupRef.value!.$el)

  return popupElements[0]
}
/* c8 ignore stop */

/**
 * Returns the last focusable element of an inline datepicker
 * @returns {HTMLElement}
 */
function getLastInlineFocusableElement() {
  const popupElements = getFocusableElements(popupRef.value!.$el)

  return popupElements[popupElements.length - 1]
}

/**
 * Returns the input element (when typeable)
 * @returns {Element}
 */
function getInputField() {
  if (!props.typeable || props.inline) {
    return null
  }

  return dateInputRef.value!.inputRef
}

/**
 * Used for a typeable datepicker: returns the cell element that corresponds to latestValidTypedDate...
 */
function getTypedCell() {
  if (!props.typeable) {
    return null
  }

  const cellId = getCellId(latestValidTypedDate.value!)

  return cellId ? pickerRef.value.pickerCellsRef.$el.children[cellId] : null
}

/**
 * Sets `datepickerId` (as a global) and keeps track of focusable elements
 */
function handleFocusIn() {
  globalDatepickerId.value = datepickerId.value

  isActive.value = true
  setInlineTabbableCell()
  setNavElements()
}

/**
 * Sets the datepicker's `isActive` state to false and resets `globalDatepickerId`
 */
function handleFocusOut() {
  isActive.value = false
  globalDatepickerId.value = ''
}

/**
 * Returns true if the calendar has been passed the given slot
 * @param  {String} slotName The name of the slot
 * @return {Boolean}
 */
function hasSlot(slotName: CalendarSlot) {
  return !!slots[slotName]
}

/**
 * Returns true if the user is tabbing away from an inline datepicker
 * @return {Boolean}
 */
/* c8 ignore start */
function isTabbingAwayFromInlineDatepicker(event: KeyboardEvent) {
  if (!props.inline) {
    return false
  }

  if (isTabbingAwayFromFirstNavElement(event)) {
    tabAwayFromFirstElement()

    return true
  }

  if (isTabbingAwayFromLastNavElement(event)) {
    tabAwayFromLastElement()

    return true
  }

  return false
}
/* c8 ignore stop */

/**
 * Used for inline calendars; returns true if the user tabs backwards from the first focusable element
 * @param  {object}  event Used to determine whether we are tabbing forwards or backwards
 * @return {Boolean}
 */
/* c8 ignore start */
function isTabbingAwayFromFirstNavElement(event: KeyboardEvent) {
  if (!event.shiftKey) {
    return false
  }

  const activeElement = getActiveElement()
  const firstNavElement = navElements.value[0]

  return activeElement === firstNavElement
}
/* c8 ignore stop */

/**
 * Used for inline calendars; returns true if the user tabs forwards from the last focusable element
 * @param  {object}  event Used to determine whether we are tabbing forwards or backwards
 * @return {Boolean}
 */
/* c8 ignore start */
function isTabbingAwayFromLastNavElement(event: KeyboardEvent) {
  if (event.shiftKey) {
    return false
  }

  const activeElement = getActiveElement()
  const lastNavElement = navElements.value[navElements.value.length - 1]

  return activeElement === lastNavElement
}
/* c8 ignore stop */

/**
 * Resets the focus to the open date
 */
function resetFocusToOpenDate(focusedDateTimestampNew: number) {
  focus.refs = ['openDate']
  setTransitionAndFocusDelay(focusedDateTimestampNew, computedOpenDate.value)

  if (!isMinimumView.value) {
    isRevertingToOpenDate.value = true
    view.value = props.minimumView as View
  }

  setPageDate(computedOpenDate.value)
  reviewFocus()
}

/**
 * Sets the correct focus on next tick
 */
function reviewFocus() {
  if (skipReviewFocus.value) {
    return
  }

  tabbableCell.value = null
  resetTabbableCell.value = true

  nextTick(() => {
    setNavElements()

    setTimeout(() => {
      applyFocus()
    }, focus.delay)

    resetTabbableCell.value = false
  })
}

/**
 * Stores the current tabbableCell of an inline datepicker
 * N.B. This is used when tabbing back (shift + tab) to an inline calendar from further down the page
 */
function setInlineTabbableCell() {
  if (!props.inline) {
    return
  }

  inlineTabbableCell.value = tabbableCell.value
}

/**
 * Sets the direction of the slide transition and whether or not to delay application of the focus
 * @param {Date|Number} startDate     The date from which to measure
 * @param {Date|Number} endDate       Is this before or after the startDate? And is it on the same page?
 */
function setTransitionAndFocusDelay(
  startDate: Date | number,
  endDate: Date | number,
) {
  const startPageDate = utils.setDate(new Date(startDate), 1)
  const endPageDate = utils.setDate(new Date(endDate), 1)
  const isInTheFuture = startPageDate < endPageDate

  if (isMinimumView.value) {
    focus.delay = isInTheFuture ? slideDuration.value : 0
  } else {
    focus.delay = 0
  }

  setTransitionName(endPageDate - startPageDate)
}

/**
 * Set the focus
 * @param {Array} elementsToFocus An array of `elementsToFocus` to focus (in order of preference)
 */
function setFocus(elementsToFocus: ElementToFocus[]) {
  focus.refs = elementsToFocus
  applyFocus()
}

/**
 * Determines which elements in datepicker should be focus-trapped
 */
function setNavElements() {
  if (!view.value) return

  updateTabbableCell()

  const viewName = ucFirst(view.value)

  navElements.value = [
    getInputField(),
    getElementsFromSlot('beforeCalendarHeader'),
    getElementsFromSlot(`beforeCalendarHeader${viewName}`),
    getElementsFromHeader(),
    tabbableCell.value,
    getElementsFromSlot(`calendarFooter${viewName}`),
    getElementsFromSlot('calendarFooter'),
  ]
    .filter((item) => !!item)
    .reduce((acc, val) => acc.concat(val), [])
}

/**
 * Keeps track of the currently focused index in the navElements array
 */
function setNavElementsFocusedIndex() {
  const activeElement = getActiveElement()

  for (let i = 0; i < navElements.value.length; i += 1) {
    if (activeElement === navElements.value[i]) {
      navElementsFocusedIndex.value = i
      return
    }
  }

  navElementsFocusedIndex.value = 0
}

/**
 * Sets the focus-trapped cell in the picker
 */
// eslint-disable-next-line complexity
function setTabbableCell() {
  const pickerCells = pickerRef.value?.pickerCellsRef.$el

  tabbableCell.value =
    getActiveCell() ||
    getTypedCell() ||
    pickerCells.querySelector('button.selected:not(.muted):enabled') ||
    pickerCells.querySelector('button.open:not(.muted):enabled') ||
    pickerCells.querySelector('button.today:not(.muted):enabled') ||
    pickerCells.querySelector('button.cell:not(.muted):enabled')
}

/**
 * Sets the direction of the slide transition
 * @param {Number} plusOrMinus Positive for the future; negative for the past
 */
function setTransitionName(plusOrMinus: number) {
  const isInTheFuture = plusOrMinus > 0

  if (isRtl.value) {
    transitionName.value = isInTheFuture ? 'slide-left' : 'slide-right'
  } else {
    transitionName.value = isInTheFuture ? 'slide-right' : 'slide-left'
  }
}

/**
 * Focuses the first focusable element of an inline datepicker, so that the previous element on the page will be tabbed to
 */
/* c8 ignore start */
function tabAwayFromFirstElement() {
  const firstElement = getFirstInlineFocusableElement()

  // Keep a record of `tabbableCell` in case `showHeader=false` and this is the first date
  // in the month (with no edge dates from the previous month) to which we may want to
  // tab back down to later.
  setInlineTabbableCell()

  firstElement.focus()

  // Reset the tabbableCell as we don't want it to be the `firstElement` if the latter is
  // an edge date from the previous month
  tabbableCell.value = inlineTabbableCell.value
}
/* c8 ignore stop */

/**
 * Focuses the last focusable element of an inline datepicker, so that the next element on the page will be tabbed to
 */
/* c8 ignore start */
function tabAwayFromLastElement() {
  const lastElement = getLastInlineFocusableElement()

  // Keep a record of `tabbableCell` in case this is the last date in the month
  // (with no edge dates from the next month) to which we may want to shift+tab
  // back up to later.
  setInlineTabbableCell()

  lastElement.focus()

  // Reset the tabbableCell as we don't want it to be the `lastElement` if the latter is
  // an edge date from the next month
  tabbableCell.value = inlineTabbableCell.value
}
/* c8 ignore stop */

/**
 * Tab backwards through the focus-trapped elements
 */
/* c8 ignore start */
function tabBackwards() {
  navElementsFocusedIndex.value -= 1

  if (navElementsFocusedIndex.value < 0) {
    navElementsFocusedIndex.value = navElements.value.length - 1
  }

  navElements.value[navElementsFocusedIndex.value].focus()
}
/* c8 ignore stop */

/**
 * Tab forwards through the focus-trapped elements
 */
/* c8 ignore start */
function tabForwards() {
  navElementsFocusedIndex.value += 1

  if (navElementsFocusedIndex.value >= navElements.value.length) {
    navElementsFocusedIndex.value = 0
  }

  navElements.value[navElementsFocusedIndex.value].focus()
}
/* c8 ignore stop */

/**
 * Tab through the focus-trapped elements
 * @param event
 */
/* c8 ignore start */
function tabThroughNavigation(event: KeyboardEvent) {
  if (allowNormalTabbing(event)) {
    return
  }

  event.preventDefault()

  if (event.shiftKey) {
    tabBackwards()
  } else {
    tabForwards()
  }
}
/* c8 ignore stop */

/**
 * Special cases for when tabbing to an inline datepicker
 */
/* c8 ignore start */
function tabToCorrectInlineCell() {
  const lastElement = getLastInlineFocusableElement()
  const isACell = hasClass(lastElement, 'cell')
  const activeElement = getActiveElement()
  const isLastElementFocused = activeElement === lastElement

  // If there are no focusable elements in the footer slots and the inline datepicker has been tabbed to (backwards)
  if (isACell && isLastElementFocused) {
    focusInlineTabbableCell()
    return
  }

  // If `show-header` is false and the inline datepicker has been tabbed to (forwards)
  nextTick(() => {
    const isFirstCell = activeElement?.getAttribute('data-id') === '0'

    if (isFirstCell) {
      focusInlineTabbableCell()
    }
  })
}
/* c8 ignore stop */

/**
 * Update which cell in the picker should be focus-trapped
 */
function updateTabbableCell() {
  const activeElement = getActiveElement() as HTMLElement
  const isActiveElementACell = hasClass(activeElement, 'cell')
  const needToUpdate = !tabbableCell.value || isActiveElementACell

  if (needToUpdate) {
    setTabbableCell()
  }
}

/**
 * Are we allowed to show a specific picker view?
 * @param {String} thisView
 * @return {Boolean}
 */
function allowedToShowView(thisView: View | 'decade' | undefined) {
  const views: View[] = ['day', 'month', 'year']
  const minimumViewIndex = views.indexOf(props.minimumView)
  const maximumViewIndex = views.indexOf(props.maximumView)
  const viewIndex = views.indexOf(thisView)

  return viewIndex >= minimumViewIndex && viewIndex <= maximumViewIndex
}

/**
 * Clear the selected date
 */
function clearDate() {
  if (!selectedDate.value) {
    return
  }

  selectDate(null)

  if (isInline.value) {
    resetFocusToOpenDate(focusedDateTimestamp.value)
  } else {
    focus.refs = ['input']
    close()
  }

  emit('cleared')
}

/**
 * Close the calendar
 */
function close() {
  if (isInline.value) {
    return
  }

  view.value = ''

  if (props.showCalendarOnFocus) {
    dateInputRef.value.shouldToggleOnClick = true
    dateInputRef.value.shouldToggleOnFocus = true
  }

  if (isClickOutside.value) {
    isClickOutside.value = false
  } else {
    reviewFocus()
  }

  emit('closed')
}

/**
 * Returns true if the given date differs from the `selectedDate`
 * @param   {Date} date The date to check
 * @returns {Boolean}
 */
function dateHasChanged(date: Date | null) {
  return !utils.compareDates(date, selectedDate.value)
}

/**
 * Emits `focus` when the datepicker receives focus (and for an `inline`
 * datepicker, ensures the correct cell is tabbed to)
 */
function datepickerIsActive() {
  emit('focus')

  if (props.inline) {
    setNavElementsFocusedIndex()
    tabToCorrectInlineCell()
  }
}

/**
 * Emits `blur` when the datepicker loses focus (and selects a typed date)
 */
function datepickerIsInactive() {
  emit('blur')

  if (props.typeable) {
    skipReviewFocus.value = true
    selectTypedDateOnLosingFocus()

    nextTick(() => {
      skipReviewFocus.value = false
    })
  }
}

/**
 * Closes the calendar when no element within it has focus
 */
function handleClickOutside() {
  if (!isOpen.value) {
    return
  }

  if (!globalDatepickerId.value) {
    isClickOutside.value = true
    close()
  }
}

/**
 * Set the new pageDate, focus the relevant element and emit a `changed-<view>` event
 */
function handlePageChange({ focusRefs, pageDate: newPageDate }: PageChange) {
  setPageDate(newPageDate)
  focus.refs = focusRefs
  focus.delay = slideDuration.value
  reviewFocus()
  emit(`changed${ucFirst(nextView.value.up as View)}`, newPageDate)
}

/**
 * Set the date, or go to the next view down
 */
// eslint-disable-next-line max-statements,complexity
function handleSelect(cell: CellDay) {
  if (allowedToShowView(nextView.value.down as View)) {
    showNextViewDown(cell)
    return
  }

  dateInputRef.value.typedDate = ''
  const date = new Date(cell?.timestamp)

  if (isInline.value && !dateHasChanged(date)) {
    selectedDate.value = null
    emit('cleared')
    return
  }

  selectDate(date)
  focus.delay = cell.isNextMonth ? slideDuration.value : 0
  focus.refs = isInline.value ? ['tabbableCell'] : ['input']
  close()

  if (props.showCalendarOnFocus && !props.inline) {
    dateInputRef.value.shouldToggleOnClick = true
    dateInputRef.value.shouldToggleOnFocus = false
  } else {
    reviewFocus()
  }
}

/**
 * Updates the page (if necessary) after a 'typedDate' event and sets `tabbableCell` & `latestValidTypedDate`
 * @param {Date=} date
 */
function handleTypedDate(date: Date) {
  const originalTypedDate = new Date(latestValidTypedDate.value!)
  const originalPageDate = new Date(pageDate.value)

  latestValidTypedDate.value = date || computedOpenDate.value
  setTransitionAndFocusDelay(originalTypedDate, latestValidTypedDate.value)
  setPageDate(date)

  if (isPageChange(originalPageDate)) {
    handlePageChange({
      focusRefs: [],
      pageDate: pageDate.value,
    })
    return
  }

  setTabbableCell()
}

/**
 * Focus the relevant element when the view changes
 * @param {String} newView
 * @param {String} oldView
 */
function handleViewChange(newView: View, oldView: View) {
  const isClosing = newView === ''
  const isOpeningInline = oldView === '' && isInline.value

  if (isClosing || isOpeningInline) {
    return
  }

  if (!isRevertingToOpenDate.value) {
    setViewChangeFocusRefs(newView, oldView)
    reviewFocus()
  }

  isRevertingToOpenDate.value = false
}

/**
 * Returns true if element has the given className
 * @param   {HTMLElement} element
 * @param   {String}      className
 * @returns {Boolean}
 */
function hasClass(element: HTMLElement, className: string) {
  return element && element.className.split(' ').includes(className)
}

/**
 * Used for typeable datepicker: returns true if a typed date causes the page to change
 * @param   {Date}    originalPageDate
 * @returns {Boolean}
 */
function isPageChange(originalPageDate: Date) {
  if (!isOpen.value) {
    return false
  }

  return originalPageDate.valueOf() !== pageDate.value.valueOf()
}

/**
 * Initiate the component
 */
function init() {
  if (props.typeable) {
    latestValidTypedDate.value = selectedDate.value || computedOpenDate.value
  }

  if (isInline.value) {
    setInitialView()
  }

  setSlideDuration()
}

/**
 * Returns true if a date is disabled
 * @param {Date} date
 * @returns {Boolean}
 */
function isDateDisabled(date: Date) {
  if (!props.disabledDates) return false

  return new DisabledDate(
    utils,
    props.disabledDates as DisabledConfig,
  ).isDateDisabled(date)
}

/**
 * Returns true if we should reset the focus to computedOpenDate
 * @returns {Boolean}
 */
function isResetFocus() {
  if (!isOpen.value) {
    return false
  }

  const activeElement = getActiveElement() as HTMLElement
  const isOpenCellFocused =
    hasClass(activeElement, 'cell') && !hasClass(activeElement, 'open')

  return isInline.value || !isMinimumView.value || isOpenCellFocused
}

/**
 * Opens the calendar with the relevant view: 'day', 'month', or 'year'
 */
function open() {
  if (props.disabled || isInline.value) {
    return
  }

  setInitialView()
  reviewFocus()

  emit('opened')
}

/**
 * Focus the open date, or close the calendar if already focused
 */
function resetOrClose() {
  if (isResetFocus()) {
    resetFocusToOpenDate(focusedDateTimestamp.value)
    return
  }

  if (isOpen.value) {
    focus.refs = ['input']
    close()
  }
}

/**
 * Select the date
 * @param {Date|null} date
 */
function selectDate(date: Date | null) {
  if (dateHasChanged(date)) {
    emit('changed', date)
  }
  setValue(date)
  emit('selected', date)
  emit('update:modelValue', date)
}

/**
 * Select the date from a 'selectTypedDate' event
 * @param {Date=} date
 */
function selectTypedDate(date: Date) {
  selectDate(date)
  reviewFocus()

  if (isOpen.value) {
    close()
  }
}

/**
 * Selects the typed date when the datepicker loses focus, provided it's valid and differs from the current selected date
 */
function selectTypedDateOnLosingFocus() {
  const parsedDate = dateInputRef.value.parseInput()
  const date = utils.isValidDate(parsedDate) ? parsedDate : null

  if (dateHasChanged(date)) {
    selectDate(date)
  }
}

/**
 * Sets the initial picker page view: day, month or year
 */
function setInitialView() {
  const initialView = computedInitialView.value

  if (!allowedToShowView(initialView)) {
    throw new Error(
      `initialView '${props.initialView}' cannot be rendered based on minimum '${props.minimumView}' and maximum '${props.maximumView}'`,
    )
  }

  setView(initialView)
}

/**
 * Sets the date that the calendar should open on
 * @param {Date=} date The date to set for the page
 */
function setPageDate(date: Date | null) {
  const validDate = utils.parseAsDate(date) || computedOpenDate.value
  let dateTemp = utils.getNewDateObject(validDate)
  dateTemp = new Date(utils.setDate(dateTemp, 1))

  const timestamp = utils.adjustDateToView(dateTemp, view.value).valueOf()

  pageTimestamp.value = timestamp
}

/**
 * Sets the slide duration in milliseconds by looking up the stylesheet
 */
function setSlideDuration() {
  if (!pickerRef.value?.pickerCellsRef) {
    return
  }
  const cells = pickerRef.value.pickerCellsRef.$el
  const durationInSecs = window.getComputedStyle(cells).transitionDuration

  slideDuration.value = parseFloat(durationInSecs) * 1000
}

/**
 * Set the datepicker modelValue (and, if typeable, update `latestValidTypedDate`)
 * @param {Date|String|Number|null} date
 */
function setValue(date: Date | null) {
  selectedDate.value = date || null
  setPageDate(date)

  if (props.typeable) {
    latestValidTypedDate.value = date || computedOpenDate.value
  }
}

/**
 * Set the picker view
 * @param {String} view
 */
function setView(newView: View) {
  if (allowedToShowView(newView)) {
    view.value = newView
  }
}

/**
 * Sets the array of `refs` that might be focused following a view change
 * @param {String} newView The view being changed to
 * @param {String} oldView The previous view
 */
function setViewChangeFocusRefs(newView: View, oldView: View) {
  if (oldView === '') {
    focus.refs = []
    return
  }

  const views: View[] = ['day', 'month', 'year']
  const isNewView = (thisView: View) => thisView === newView
  const isOldView = (thisView: View) => thisView === oldView
  const newViewIndex = views.findIndex(isNewView)
  const oldViewIndex = views.findIndex(isOldView)
  const isViewChangeUp = newViewIndex - oldViewIndex > 0

  focus.refs = isViewChangeUp ? ['up', 'tabbableCell'] : ['tabbableCell', 'up']
}

type ChangedView = 'changedDay' | 'changedMonth' | 'changedYear'
/**
 * Set the view to the next view down e.g. from `month` to `day`
 * @param {Object} cell The currently focused cell
 */
function showNextViewDown(cell: Cell) {
  setPageDate(new Date(cell.timestamp))
  const viewName = ucFirst(view.value as View)
  emit(`changed${viewName}` as ChangedView, cell)
  setView(nextView.value.down as View)
}

/**
 * Capitalizes the first letter
 * @param {String} view The string to capitalize
 * @returns {String}
 */
function ucFirst(view: View) {
  return (view[0].toUpperCase() + view.substring(1)) as 'Day' | 'Month' | 'Year'
}
</script>

<style lang="scss">
@import '../styles/style.scss';
</style>
