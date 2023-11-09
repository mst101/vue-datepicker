/* eslint-disable max-lines-per-function, max-statements */

import { nextTick } from 'vue'
import makeDateUtils from '~/utils/DateUtils'
import useDisabledDates from './useDisabledDates'

export default function useNavigation(cells, pickerCellsRef, opts = {}) {
  const { pageDate, slideDuration, useUtc, view = 'day', yearRange = 10 } = opts

  const { disabledDates, emit } = opts
  const utils = makeDateUtils(useUtc)
  const {
    earliestPossibleDate,
    latestPossibleDate,
    isPreviousDisabled,
    isNextDisabled,
  } = useDisabledDates(disabledDates, {
    pageDate,
    useUtc,
    view,
  })

  /**
   * Returns the first or last cell, depending on the direction of the search
   * @param  {Number} delta The number of cells that the focus should move
   * @return {HTMLButtonElement}
   */
  function getFirstOrLastElement(delta) {
    const isNext = delta > 0
    const elements = pickerCellsRef.value.$el.children

    return isNext ? elements[0] : elements[elements.length - 1]
  }

  /**
   * Changes the page up or down
   * @param {Number} incrementBy
   * @param {[String]} focusRefs
   */
  function changePage({ incrementBy, focusRefs }) {
    const pageDateNew = new Date(pageDate.value)
    const units = view.value === 'year' ? incrementBy * yearRange.value : incrementBy

    emit('setTransitionName', incrementBy)

    if (view.value === 'day') {
      utils.setMonth(pageDateNew, utils.getMonth(pageDateNew) + units)
    } else {
      utils.setFullYear(pageDateNew, utils.getFullYear(pageDateNew) + units)
    }

    emit('pageChange', { focusRefs, pageDate: pageDateNew })
  }

  /**
   * Sets the focus on the correct cell following a page change
   * @param {Object} options
   */
  // eslint-disable-next-line max-statements
  function setFocusOnNewPage({ delta, stepsRemaining }) {
    const currentElement = getFirstOrLastElement(delta)
    const options = {
      currentElement,
      delta,
      stepsRemaining,
    }

    if (stepsRemaining <= 0) {
      if (isMutedOrDisabled(currentElement)) {
        options.stepsRemaining = Math.abs(options.delta)

        setTimeout(() => {
          setFocusToAvailableCell(options)
        }, slideDuration.value)

        return
      }

      setTimeout(() => {
        currentElement.focus()
      }, slideDuration.value)

      return
    }

    setTimeout(() => {
      setFocusToAvailableCell(options)
    }, slideDuration.value)
  }

  /**
   * Used when an arrow key press would cause the focus to land on a disabled date
   * @param {Object} options
   */
  function addMoreSteps(options) {
    if (options.stepsRemaining <= 0 && Math.abs(options.delta) > 1) {
      return Math.abs(options.delta)
    }
    return options.stepsRemaining
  }

  /**
   * Returns true if the given element cannot be focused
   * @param  {HTMLButtonElement} element The element in question
   * @return {Boolean}
   */
  function isMutedOrDisabled(element) {
    const isMuted = element.classList.value.split(' ').includes('muted')
    const isDisabled = element.disabled

    return isMuted || isDisabled
  }

  /**
   * Returns the first or last non-disabled date, depending on the direction of the search
   * @param  {HTMLButtonElement} currentElement  The element currently being iterated on
   * @param  {Number}            delta           The number of cells that the focus should move
   */
  function firstOrLastPossibleDate({ currentElement, delta }) {
    if (delta > 0) {
      return getElementSibling(currentElement, -1)
    }

    return getElementSibling(currentElement, 1)
  }

  /**
   * Returns true if the current element's date is NOT possible, given the `disabled-dates`
   * @param  {HTMLButtonElement} element The element in question
   * @param  {Number}            delta   Used to determine direction of travel
   * @return {Boolean}
   */
  function isDatePossible(element, delta) {
    const cellId = element.getAttribute('data-id')
    const cellDate = new Date(cells.value[cellId].timestamp)

    if (delta > 0) {
      return cellDate > utils.adjustDateToView(latestPossibleDate.value, view.value)
    }

    return cellDate < utils.adjustDateToView(earliestPossibleDate.value, view.value)
  }

  /**
   * Returns true if the given element cannot be focused
   * @param  {HTMLButtonElement} currentElement  The element currently being iterated on
   * @param  {Number}            delta           The number of cells that the focus should move
   * @return {Boolean}
   */
  function isBeyondPossibleDate({ currentElement, delta }) {
    if (delta > 0 && latestPossibleDate.value) {
      return isDatePossible(currentElement, delta)
    }

    if (delta < 0 && earliestPossibleDate.value) {
      return isDatePossible(currentElement, delta)
    }

    return false
  }

  /**
   * Changes the page and focuses the cell that is being 'arrowed' to
   * @param {Object} options
   */
  function changePageAndSetFocus(options) {
    const { delta } = options
    const isPageDisabled =
      (delta > 0 && isNextDisabled.value) ||
      (delta < 0 && isPreviousDisabled.value)

    if (isPageDisabled) {
      return
    }

    emit('setSkipReviewFocus', true)

    changePage({
      incrementBy: Math.sign(delta),
      focusRefs: ['arrow-to-cell'],
    })

    nextTick(() => {
      setFocusOnNewPage(options)
      emit('setSkipReviewFocus', false)
    })
  }

  /**
   * Sets the focus on the next focusable cell when an arrow key is pressed
   * @param {Object} options
   */
  function setFocusToAvailableCell(options) {
    const element = getElement(options)

    if (element) {
      element.focus()
    }
  }

  /**
   * Returns the element directly next to the currentElement
   * @param  {HTMLButtonElement} currentElement The element currently being iterated on
   * @param  {Number}            delta          The number of cells that the focus should move
   * @return {HTMLButtonElement}
   */
  function getElementSibling(currentElement, delta) {
    const isNext = delta > 0

    return isNext
      ? currentElement.nextElementSibling
      : currentElement.previousElementSibling
  }

  /**
   * Returns the element that should be focused when navigating via an arrow key
   * @param  {HTMLButtonElement} currentElement  The element currently being iterated on
   * @param  {Number}            delta           The number of cells that the focus should move
   * @param  {Number}            stepsRemaining  The number of steps remaining in the iteration
   * @return {HTMLButtonElement | void}
   */
  // eslint-disable-next-line complexity,max-statements
  function getElement({ currentElement, delta, stepsRemaining }) {
    const element = getElementSibling(currentElement, delta)
    const options = {
      currentElement: element,
      delta,
      stepsRemaining: stepsRemaining - 1,
    }

    if (!element) {
      return changePageAndSetFocus(options)
    }

    if (isBeyondPossibleDate(options)) {
      return firstOrLastPossibleDate(options)
    }

    if (isMutedOrDisabled(element)) {
      options.stepsRemaining = addMoreSteps(options)

      return getElement(options)
    }

    if (stepsRemaining > 1 && options.currentElement) {
      return getElement(options)
    }

    return element
  }

  /**
   * Moves the focused cell up/down/left/right
   * @param {Object}
   */
  function handleArrow({ delta }) {
    const activeElement = document.activeElement.shadowRoot
      ? document.activeElement.shadowRoot.activeElement
      : document.activeElement
    const stepsRemaining = Math.abs(delta)
    const options = {
      currentElement: activeElement,
      delta,
      stepsRemaining,
    }

    setFocusToAvailableCell(options)
  }

  return {
    changePage,
    handleArrow,
  }
}
