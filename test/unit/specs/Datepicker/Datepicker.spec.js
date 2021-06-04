import { mount, shallowMount } from '@vue/test-utils'
import { addDays } from 'date-fns'
import { he } from '~/locale'
import DateInput from '~/components/DateInput.vue'
import Datepicker from '~/components/Datepicker.vue'

describe('Datepicker unmounted', () => {
  it('has a mounted hook', () => {
    expect(typeof Datepicker.mounted).toEqual('function')
  })

  it('sets the correct default data', () => {
    expect(typeof Datepicker.data).toEqual('function')
    const defaultData = Datepicker.data()
    const defaultProps = Datepicker.props
    expect(defaultData.selectedDate).toEqual(null)
    expect(defaultData.view).toEqual('')
    expect(defaultData.calendarHeight).toEqual(0)

    expect(typeof defaultProps.fixedPosition.validator).toEqual('function')
    expect(defaultProps.fixedPosition.validator('bottom')).toBeTruthy()
    expect(defaultProps.fixedPosition.validator(true)).toBeFalsy()
  })
})

describe('Datepicker mounted', () => {
  let wrapper

  beforeEach(() => {
    jest.useFakeTimers()
    wrapper = mount(Datepicker)
  })

  afterEach(() => {
    jest.clearAllTimers()
    wrapper.destroy()
  })

  it('can select a day', () => {
    const dateTemp = new Date(2016, 9, 1)
    wrapper.vm.setView('day')
    wrapper.vm.handleSelect({ timestamp: dateTemp.valueOf() })
    expect(wrapper.vm.pageTimestamp).toEqual(dateTemp.valueOf())
    expect(wrapper.vm.selectedDate.getMonth()).toEqual(9)
    expect(wrapper.emitted().selected).toBeTruthy()
  })

  it('can select a month', () => {
    const dateTemp = new Date(2016, 9, 9)
    wrapper.vm.setView('month')
    wrapper.vm.handleSelect({ timestamp: dateTemp.valueOf() })
    expect(wrapper.emitted('changed-month')).toBeTruthy()
    expect(wrapper.emitted('changed-month')[0][0].timestamp).toEqual(
      dateTemp.valueOf(),
    )
    expect(new Date(wrapper.vm.pageTimestamp).getMonth()).toEqual(
      dateTemp.getMonth(),
    )
    expect(wrapper.vm.picker).toEqual('PickerDay')
  })

  it('can select a year', () => {
    const dateTemp = new Date(2018, 9, 9)
    wrapper.vm.setView('year')
    wrapper.vm.handleSelect({ timestamp: dateTemp.valueOf() })
    expect(wrapper.emitted('changed-year')).toBeTruthy()
    expect(wrapper.emitted('changed-year')[0][0].timestamp).toEqual(
      dateTemp.valueOf(),
    )
    expect(new Date(wrapper.vm.pageTimestamp).getFullYear()).toEqual(
      dateTemp.getFullYear(),
    )
    expect(wrapper.vm.picker).toEqual('PickerMonth')
  })

  it('selects an edge date from the next month', async () => {
    await wrapper.setProps({
      value: new Date(2020, 0, 1),
    })

    const cells = wrapper.findAll('button.cell')
    const lastCell = cells.at(cells.length - 1)

    await lastCell.trigger('click')

    expect(wrapper.vm.selectedDate).toStrictEqual(new Date(2020, 1, 1))
  })

  it('watches initialView when open', async () => {
    const spy = jest.spyOn(wrapper.vm, 'setInitialView')
    await wrapper.vm.open()

    await wrapper.setProps({ initialView: 'month' })

    expect(spy).toHaveBeenCalled()
  })

  it('derives `picker` from the current `view`', async () => {
    await wrapper.setProps({
      initialView: 'day',
    })

    expect(wrapper.vm.picker).toBe('PickerDay')
    await wrapper.setProps({ initialView: 'month' })

    expect(wrapper.vm.picker).toBe('PickerMonth')
  })

  it('emits changed-month/year/decade', async () => {
    const pageDate = new Date(2016, 2, 1)
    await wrapper.vm.setView('day')
    await wrapper.vm.handlePageChange(pageDate)

    expect(wrapper.emitted('changed-month')).toBeTruthy()

    await wrapper.vm.setView('month')
    await wrapper.vm.handlePageChange(pageDate)
    expect(wrapper.emitted('changed-year')).toBeTruthy()

    await wrapper.vm.setView('year')
    await wrapper.vm.handlePageChange(pageDate)
    expect(wrapper.emitted('changed-decade')).toBeTruthy()
  })

  it('emits blur', () => {
    const input = wrapper.find('input')
    input.trigger('blur')
    expect(wrapper.emitted().blur).toBeTruthy()
  })

  it('emits focus', () => {
    const input = wrapper.find('input')
    input.trigger('focus')
    expect(wrapper.emitted().focus).toBeTruthy()
  })

  it('toggles when the input field is clicked', async () => {
    const input = wrapper.find('input')
    await input.trigger('click')

    expect(wrapper.vm.isOpen).toBeTruthy()

    await input.trigger('click')
    expect(wrapper.vm.isOpen).toBeFalsy()
  })

  it('opens on focusing the input when showCalendarOnFocus = true', async () => {
    await wrapper.setProps({
      showCalendarOnFocus: true,
    })
    const input = wrapper.find('input')

    await input.trigger('focus')

    expect(wrapper.vm.isOpen).toBeTruthy()
  })

  it('toggles on clicking the input when showCalendarOnFocus = true', async () => {
    await wrapper.setProps({
      showCalendarOnFocus: true,
    })
    const input = wrapper.find('input')

    await input.trigger('focus')
    await input.trigger('click')
    expect(wrapper.vm.isOpen).toBeTruthy()
    jest.advanceTimersByTime(300)

    await input.trigger('focus')
    await input.trigger('click')
    expect(wrapper.vm.isOpen).toBeFalsy()
  })

  it('toggles on clicking the input when typeable and showCalendarOnFocus = true', async () => {
    await wrapper.setProps({
      showCalendarOnFocus: true,
      typeable: true,
    })
    const input = wrapper.find('input')

    await input.trigger('focus')
    await input.trigger('click')
    expect(wrapper.vm.isOpen).toBeTruthy()
    jest.advanceTimersByTime(300)

    await input.trigger('focus')
    await input.trigger('click')
    expect(wrapper.vm.isOpen).toBeFalsy()
  })

  it('toggles via the calendar button', async () => {
    await wrapper.setProps({
      calendarButton: true,
    })

    const calendarButton = wrapper.find('button[data-test-calendar-button]')
    await calendarButton.trigger('click')
    expect(wrapper.vm.isOpen).toBeTruthy()

    await calendarButton.trigger('click')
    expect(wrapper.vm.isOpen).toBeFalsy()
  })

  it('toggles via the calendar button when showCalendarOnFocus = true', async () => {
    await wrapper.setProps({
      calendarButton: true,
      showCalendarOnFocus: true,
    })

    const calendarButton = wrapper.find('button[data-test-calendar-button]')

    await calendarButton.trigger('click')
    expect(wrapper.vm.isOpen).toBeTruthy()

    await calendarButton.trigger('click')
    expect(wrapper.vm.isOpen).toBeFalsy()
  })

  it('closes via the calendar button when typeable and showCalendarOnFocus = true, despite input being focused', async () => {
    await wrapper.setProps({
      calendarButton: true,
      showCalendarOnFocus: true,
      typeable: true,
    })

    const input = wrapper.find('input')
    const calendarButton = wrapper.find('button[data-test-calendar-button]')

    await input.trigger('focus')
    expect(wrapper.vm.isOpen).toBeTruthy()

    await calendarButton.trigger('click')
    expect(wrapper.vm.isOpen).toBeFalsy()
  })

  it('resets the date correctly when typeable', async () => {
    wrapper.setProps({
      typeable: true,
    })

    const input = wrapper.find('input')
    await input.trigger('click')
    input.setValue('1 Jan 2000')
    await input.trigger('keyup')
    expect(wrapper.vm.selectedDate).toEqual(new Date(2000, 0, 1))

    await wrapper.setProps({
      value: new Date(2016, 1, 15),
    })

    expect(wrapper.vm.selectedDate).toEqual(new Date(2016, 1, 15))
  })

  it('sets the pickerHeight correctly', async () => {
    await wrapper.setProps({
      openDate: new Date(2020, 0, 1),
    })

    const input = wrapper.find('input')
    await input.trigger('click')
    jest.advanceTimersByTime(wrapper.vm.fadeDuration)
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.pickerHeight).toBe(240)
  })
})

describe('Datepicker mounted to body', () => {
  let wrapper

  beforeEach(() => {
    jest.useFakeTimers()

    wrapper = mount(Datepicker, {
      attachTo: document.body,
    })
  })

  afterEach(() => {
    jest.clearAllTimers()

    wrapper.destroy()
  })

  it("focuses today's date by default", async () => {
    wrapper.vm.open()

    jest.advanceTimersByTime(wrapper.vm.fadeDuration)
    const todayCell = wrapper.find('button.today')

    expect(todayCell.text()).toBe(new Date().getDate().toString())
    expect(document.activeElement).toBe(todayCell.element)
  })

  it('closes when the calendar loses focus', async () => {
    wrapper.vm.open()

    jest.advanceTimersByTime(wrapper.vm.fadeDuration)

    const todayCell = wrapper.find('button.today')
    expect(wrapper.vm.isOpen).toBeTruthy()
    expect(document.activeElement).toStrictEqual(todayCell.element)

    await document.activeElement.blur()
    await document.body.click()

    jest.advanceTimersByTime(wrapper.vm.fadeDuration)

    expect(wrapper.vm.isOpen).toBeFalsy()
  })
})

describe('Datepicker mounted to body with openDate', () => {
  let wrapper

  beforeEach(() => {
    jest.useFakeTimers()

    wrapper = mount(Datepicker, {
      attachTo: document.body,
      propsData: {
        openDate: new Date(2020, 0, 1),
      },
    })
  })

  afterEach(() => {
    jest.clearAllTimers()
    wrapper.destroy()
  })

  it('arrows right on cell', async () => {
    const input = wrapper.find('input')
    await input.trigger('click')

    const firstOfMonth = wrapper.findAll('button.cell').at(3)
    const secondOfMonth = wrapper.findAll('button.cell').at(4)

    firstOfMonth.element.focus()
    await firstOfMonth.trigger('keydown.right')

    expect(document.activeElement).toBe(secondOfMonth.element)
  })

  it('arrows left on cell', async () => {
    const input = wrapper.find('input')
    await input.trigger('click')

    const secondOfMonth = wrapper.findAll('button.cell').at(4)
    const firstOfMonth = wrapper.findAll('button.cell').at(3)

    secondOfMonth.element.focus()
    await firstOfMonth.trigger('keydown.left')

    expect(document.activeElement).toBe(firstOfMonth.element)
  })

  it('arrows up on cell', async () => {
    const input = wrapper.find('input')
    await input.trigger('click')

    const lastOfMonth = wrapper.findAll('button.cell').at(33)
    lastOfMonth.element.focus()
    await lastOfMonth.trigger('keydown.up')

    const cellUp = wrapper.findAll('button.cell').at(26)
    expect(document.activeElement).toBe(cellUp.element)
  })

  it('arrows down on cell', async () => {
    const input = wrapper.find('input')
    await input.trigger('click')

    const firstOfMonth = wrapper.findAll('button.cell').at(3)
    firstOfMonth.element.focus()
    await firstOfMonth.trigger('keydown.down')

    const cellDown = wrapper.findAll('button.cell').at(10)
    expect(document.activeElement).toBe(cellDown.element)
  })

  it('cannot arrow to a disabled page', async () => {
    await wrapper.setProps({
      disabledDates: {
        to: new Date(2020, 0, 1),
        from: new Date(2020, 0, 31),
      },
    })

    const input = wrapper.find('input')
    await input.trigger('click')

    const firstOfMonth = wrapper.findAll('button.cell').at(3)
    firstOfMonth.element.focus()
    await firstOfMonth.trigger('keydown.up')
    expect(document.activeElement).toBe(firstOfMonth.element)

    const lastOfMonth = wrapper.findAll('button.cell').at(33)
    lastOfMonth.element.focus()
    await lastOfMonth.trigger('keydown.down')
    expect(document.activeElement).toBe(lastOfMonth.element)
  })

  it('arrows left on cell to previous page', async () => {
    const input = wrapper.find('input')
    await input.trigger('click')

    const firstOfMonth = wrapper.findAll('button.cell').at(3)

    firstOfMonth.element.focus()
    await firstOfMonth.trigger('keydown.left')

    const lastOfPreviousMonth = wrapper.findAll('button.cell').at(30)
    setTimeout(
      () => expect(document.activeElement).toBe(lastOfPreviousMonth.element),
      wrapper.vm.slideDuration,
    )
  })

  it('arrows right on cell to next page', async () => {
    const input = wrapper.find('input')
    await input.trigger('click')

    const lastOfMonth = wrapper.findAll('button.cell').at(33)

    lastOfMonth.element.focus()
    await lastOfMonth.trigger('keydown.right')

    const firstOfNextMonth = wrapper.findAll('button.cell').at(3)
    setTimeout(
      () => expect(document.activeElement).toBe(firstOfNextMonth.element),
      wrapper.vm.slideDuration,
    )
  })

  it('arrows up on cell to previous page', async () => {
    const input = wrapper.find('input')
    await input.trigger('click')

    const firstOfMonth = wrapper.findAll('button.cell').at(3)

    firstOfMonth.element.focus()
    await firstOfMonth.trigger('keydown.up')

    const cellUp = wrapper.findAll('button.cell').at(24)

    jest.advanceTimersByTime(wrapper.vm.slideDuration)

    expect(document.activeElement).toBe(cellUp.element)
  })

  it('arrows down on cell to next page', async () => {
    const input = wrapper.find('input')
    await input.trigger('click')

    const lastOfMonth = wrapper.findAll('button.cell').at(33)

    lastOfMonth.element.focus()
    await lastOfMonth.trigger('keydown.down')

    const cellDown = wrapper.findAll('button.cell').at(12)
    jest.advanceTimersByTime(wrapper.vm.slideDuration)
    expect(document.activeElement).toBe(cellDown.element)
  })

  it('arrows up on cell to muted cell on previous page', async () => {
    const input = wrapper.find('input')
    await input.trigger('click')

    const cellBelowMuted = wrapper.findAll('button.cell').at(9)

    cellBelowMuted.element.focus()
    await cellBelowMuted.trigger('keydown.up')

    jest.advanceTimersByTime(wrapper.vm.slideDuration)
    const cellUp = wrapper.findAll('button.cell').at(30)
    expect(document.activeElement).toBe(cellUp.element)
  })

  it('arrows down on cell to muted cell on next page', async () => {
    const input = wrapper.find('input')
    await input.trigger('click')

    const cellAboveMuted = wrapper.findAll('button.cell').at(27)

    cellAboveMuted.element.focus()
    await cellAboveMuted.trigger('keydown.down')

    jest.advanceTimersByTime(wrapper.vm.slideDuration)
    const cellDown = wrapper.findAll('button.cell').at(6)
    expect(document.activeElement).toBe(cellDown.element)
  })

  it('arrows up on cell, bypassing a muted cell on the previous page', async () => {
    const input = wrapper.find('input')
    await input.trigger('click')

    const firstOfMonth = wrapper.findAll('button.cell').at(3)

    firstOfMonth.element.focus()
    await firstOfMonth.trigger('keydown.up')

    const cellUp = wrapper.findAll('button.cell').at(24)
    jest.advanceTimersByTime(wrapper.vm.slideDuration)
    expect(document.activeElement).toBe(cellUp.element)
  })

  it('arrows down on cell, bypassing a muted cell on the next page', async () => {
    const input = wrapper.find('input')
    await input.trigger('click')

    const lastOfMonth = wrapper.findAll('button.cell').at(33)

    lastOfMonth.element.focus()
    await lastOfMonth.trigger('keydown.down')

    const cellDown = wrapper.findAll('button.cell').at(12)
    jest.advanceTimersByTime(wrapper.vm.slideDuration)
    expect(document.activeElement).toBe(cellDown.element)
  })

  it('arrows up on cell, bypassing a disabled cell on the previous page', async () => {
    wrapper.setProps({
      disabledDates: {
        dates: [new Date(2019, 11, 25)],
      },
    })

    const input = wrapper.find('input')
    await input.trigger('click')

    const firstOfMonth = wrapper.findAll('button.cell').at(3)

    firstOfMonth.element.focus()
    await firstOfMonth.trigger('keydown.up')

    const cellUp = wrapper.findAll('button.cell').at(17)
    jest.advanceTimersByTime(wrapper.vm.slideDuration)
    expect(document.activeElement).toBe(cellUp.element)
  })

  it('arrows down on cell, bypassing a disabled cell on the next page', async () => {
    wrapper.setProps({
      disabledDates: {
        dates: [new Date(2020, 1, 5)],
      },
    })

    const input = wrapper.find('input')
    await input.trigger('click')

    const lastOfMonth = wrapper.findAll('button.cell').at(33)

    lastOfMonth.element.focus()
    await lastOfMonth.trigger('keydown.down')

    const cellDown = wrapper.findAll('button.cell').at(12)
    jest.advanceTimersByTime(wrapper.vm.slideDuration)
    expect(document.activeElement).toBe(cellDown.element)
  })

  it('arrows left on cell, bypassing a disabled cell on the previous page', async () => {
    wrapper.setProps({
      disabledDates: {
        dates: [new Date(2019, 11, 31)],
      },
    })

    const input = wrapper.find('input')
    await input.trigger('click')

    const firstOfMonth = wrapper.findAll('button.cell').at(3)

    firstOfMonth.element.focus()
    await firstOfMonth.trigger('keydown.left')

    const cellLeft = wrapper.findAll('button.cell').at(29)
    jest.advanceTimersByTime(wrapper.vm.slideDuration)
    expect(document.activeElement).toBe(cellLeft.element)
  })

  it('arrows right on cell, bypassing a disabled cell on the next page', async () => {
    wrapper.setProps({
      disabledDates: {
        dates: [new Date(2020, 1, 1)],
      },
    })

    const input = wrapper.find('input')
    await input.trigger('click')

    const lastOfMonth = wrapper.findAll('button.cell').at(33)

    lastOfMonth.element.focus()
    await lastOfMonth.trigger('keydown.right')

    const cellRight = wrapper.findAll('button.cell').at(7)
    jest.advanceTimersByTime(wrapper.vm.slideDuration)
    expect(document.activeElement).toBe(cellRight.element)
  })

  it('arrows left on first cell (with no dates from previous month) to the previous page', async () => {
    wrapper.setProps({
      value: new Date(2020, 2, 1),
    })

    const input = wrapper.find('input')
    await input.trigger('click')

    const firstOfMonth = wrapper.findAll('button.cell').at(0)

    firstOfMonth.element.focus()
    await firstOfMonth.trigger('keydown.left')

    const cellLeft = wrapper.findAll('button.cell').at(34)
    jest.advanceTimersByTime(wrapper.vm.slideDuration)
    expect(document.activeElement).toBe(cellLeft.element)
  })

  it('arrows right on last cell (with no dates from next month) to the next page', async () => {
    wrapper.setProps({
      value: new Date(2020, 1, 29),
    })

    const input = wrapper.find('input')
    await input.trigger('click')

    const lastOfMonth = wrapper.findAll('button.cell').at(34)

    lastOfMonth.element.focus()
    await lastOfMonth.trigger('keydown.right')

    const cellRight = wrapper.findAll('button.cell').at(0)
    jest.advanceTimersByTime(wrapper.vm.slideDuration)
    expect(document.activeElement).toBe(cellRight.element)
  })

  it('arrows up on first cell (with no dates from previous month) to the previous page', async () => {
    wrapper.setProps({
      value: new Date(2020, 2, 1),
    })

    const input = wrapper.find('input')
    await input.trigger('click')

    const firstOfMonth = wrapper.findAll('button.cell').at(0)

    firstOfMonth.element.focus()
    await firstOfMonth.trigger('keydown.up')

    const cellUp = wrapper.findAll('button.cell').at(28)
    jest.advanceTimersByTime(wrapper.vm.slideDuration)
    expect(document.activeElement).toBe(cellUp.element)
  })

  it('arrows down on last cell (with no dates from next month) to the next page', async () => {
    wrapper.setProps({
      value: new Date(2020, 1, 29),
    })

    const input = wrapper.find('input')
    await input.trigger('click')

    const lastOfMonth = wrapper.findAll('button.cell').at(34)

    lastOfMonth.element.focus()
    await lastOfMonth.trigger('keydown.down')

    const cellDown = wrapper.findAll('button.cell').at(6)
    jest.advanceTimersByTime(wrapper.vm.slideDuration)
    expect(document.activeElement).toBe(cellDown.element)
  })

  it('arrows up on cell, bypassing a disabled cell, to reach the previous page', async () => {
    wrapper.setProps({
      value: new Date(2020, 1, 8),
      disabledDates: {
        dates: [new Date(2020, 1, 1)],
      },
    })

    const input = wrapper.find('input')
    await input.trigger('click')

    const startCell = wrapper.findAll('button.cell').at(13)

    startCell.element.focus()
    await startCell.trigger('keydown.up')

    const cellUp = wrapper.findAll('button.cell').at(27)
    jest.advanceTimersByTime(wrapper.vm.slideDuration)
    expect(document.activeElement).toBe(cellUp.element)
  })

  it('arrows down on cell, bypassing a disabled cell, to reach the next page', async () => {
    wrapper.setProps({
      value: new Date(2020, 1, 22),
      disabledDates: {
        dates: [new Date(2020, 1, 29)],
      },
    })

    const input = wrapper.find('input')
    await input.trigger('click')

    const startCell = wrapper.findAll('button.cell').at(27)

    startCell.element.focus()
    await startCell.trigger('keydown.down')

    const cellDown = wrapper.findAll('button.cell').at(6)
    jest.advanceTimersByTime(wrapper.vm.slideDuration)
    expect(document.activeElement).toBe(cellDown.element)
  })

  it('arrows down from the input field to the previous button when typeable', async () => {
    await wrapper.setProps({
      typeable: true,
    })

    const input = wrapper.find('input')
    await input.trigger('click')

    expect(document.activeElement).toBe(input.element)

    await input.trigger('keydown.down')
    const prevButton = wrapper.find('button.prev')

    expect(document.activeElement).toBe(prevButton.element)
  })

  it('arrows down from the input field to the `tabbable-cell` when typeable is true and `show-header` is false', async () => {
    await wrapper.setProps({
      typeable: true,
      showHeader: false,
    })

    const input = wrapper.find('input')
    await input.trigger('click')

    expect(document.activeElement).toBe(input.element)

    await input.trigger('keydown.down')
    const tabbableCell = wrapper.find('button.cell[data-test-tabbable-cell]')

    expect(document.activeElement).toStrictEqual(tabbableCell.element)
  })

  it('opens the calendar on pressing the `down` arrow when the input is focused', async () => {
    const input = wrapper.find('input')
    await input.trigger('keydown.down')

    const openDateCell = wrapper.find('button.open')
    expect(document.activeElement).toStrictEqual(openDateCell.element)
  })

  it('reverts focus to the `open-date` when another date on the same page has focus and the `escape` key is pressed', async () => {
    const input = wrapper.find('input')
    await input.trigger('click')

    const openDateCell = wrapper.find('button.open')
    expect(document.activeElement).toStrictEqual(openDateCell.element)

    await openDateCell.trigger('keydown.down')

    const downCell = wrapper.findAll('button.cell').at(10)
    await downCell.trigger('keydown.esc')

    // TODO: Not sure why we need this?
    jest.advanceTimersByTime(0)

    expect(document.activeElement).toBe(openDateCell.element)
  })

  it('reverts focus to the `open-date` when a date on a different page has focus and the `escape` key is pressed', async () => {
    const input = wrapper.find('input')

    await input.trigger('click')
    jest.advanceTimersByTime(wrapper.vm.fadeDuration)

    let openDateCell = wrapper.find('button.open')
    expect(document.activeElement).toStrictEqual(openDateCell.element)

    await openDateCell.trigger('keydown.up')
    jest.advanceTimersByTime(wrapper.vm.slideDuration)

    const upCell = wrapper.findAll('button.cell').at(24)
    expect(document.activeElement).toBe(upCell.element)

    await upCell.trigger('keydown.esc')

    jest.advanceTimersByTime(wrapper.vm.slideDuration)
    openDateCell = wrapper.find('button.open')
    expect(document.activeElement).toBe(openDateCell.element)
  })

  it('reverts focus to the `open-date` when a month has focus and the `escape` key is pressed', async () => {
    const input = wrapper.find('input')
    await input.trigger('click')
    jest.advanceTimersByTime(wrapper.vm.fadeDuration)
    expect(wrapper.vm.view).toBe('day')

    const upButton = wrapper.find('button.up')
    await upButton.trigger('click')
    jest.advanceTimersByTime(wrapper.vm.fadeDuration)
    expect(wrapper.vm.view).toBe('month')

    const firstCell = wrapper.find('button.cell:not(.muted)')
    await firstCell.trigger('focusin')
    await firstCell.trigger('keydown.esc')
    jest.advanceTimersByTime(wrapper.vm.fadeDuration)
    expect(wrapper.vm.view).toBe('day')

    const openDateCell = wrapper.find('button.open')
    expect(document.activeElement).toBe(openDateCell.element)
  })

  it('reverts focus to the `open-date` when a year has focus and the `escape` key is pressed', async () => {
    const input = wrapper.find('input')
    await input.trigger('click')
    jest.advanceTimersByTime(wrapper.vm.fadeDuration)
    expect(wrapper.vm.view).toBe('day')

    let upButton = wrapper.find('button.up')
    await upButton.trigger('click')
    jest.advanceTimersByTime(wrapper.vm.fadeDuration)
    expect(wrapper.vm.view).toBe('month')

    upButton = wrapper.find('button.up')
    await upButton.trigger('focusin')
    await upButton.trigger('click')
    jest.advanceTimersByTime(wrapper.vm.fadeDuration)
    expect(wrapper.vm.view).toBe('year')

    const firstCell = wrapper.find('button.cell:not(.muted)')
    await firstCell.trigger('focusin')
    await firstCell.trigger('keydown.esc')
    jest.advanceTimersByTime(wrapper.vm.fadeDuration)
    expect(wrapper.vm.view).toBe('day')

    const openDateCell = wrapper.find('button.open')
    expect(document.activeElement).toBe(openDateCell.element)
  })

  it('clears the date and closes the calendar on pressing the `escape` key, if the `open-date` is focused', async () => {
    const input = wrapper.find('input')
    await input.trigger('click')

    expect(wrapper.vm.isOpen).toBeTruthy()
    const openDateCell = wrapper.find('button.open')
    await openDateCell.trigger('focus')
    expect(document.activeElement).toStrictEqual(openDateCell.element)

    await openDateCell.trigger('keydown.esc')
    expect(wrapper.vm.isOpen).toBeFalsy()
    expect(wrapper.vm.selectedDate).toEqual(null)
  })

  it('clears the date and reverts the calendar to `minimumView` on pressing the `escape` key', async () => {
    const input = wrapper.find('input')

    await input.trigger('click')
    expect(wrapper.vm.isOpen).toBeTruthy()

    const upButton = wrapper.find('button.up')
    await upButton.trigger('click')
    expect(wrapper.vm.view).toBe('month')

    const firstCell = wrapper.find('button.cell')
    await firstCell.element.focus()
    expect(document.activeElement).toBe(firstCell.element)

    await firstCell.trigger('keydown.esc')
    jest.advanceTimersByTime(wrapper.vm.slideDuration)

    const openDate = wrapper.find('button.open')
    expect(wrapper.vm.view).toBe('day')
    expect(wrapper.vm.isOpen).toBeTruthy()
    expect(wrapper.vm.selectedDate).toEqual(null)
    expect(document.activeElement).toBe(openDate.element)
  })

  it('focuses the calendar button when closed via the calendar button', async () => {
    await wrapper.setProps({
      calendarButton: true,
    })

    const calendarButton = wrapper.find('button[data-test-calendar-button]')
    await calendarButton.trigger('click')
    jest.advanceTimersByTime(wrapper.vm.fadeDuration)

    expect(wrapper.vm.isOpen).toBeTruthy()

    const openDateCell = wrapper.find('button.open')
    expect(document.activeElement).toStrictEqual(openDateCell.element)

    await calendarButton.trigger('click')
    jest.advanceTimersByTime(wrapper.vm.fadeDuration)

    expect(wrapper.vm.isOpen).toBeFalsy()
    expect(document.activeElement).toBe(calendarButton.element)
  })

  it('has no element focused on selecting a date when show-calendar-on-focus = true', async () => {
    await wrapper.setProps({
      showCalendarOnFocus: true,
    })

    const input = wrapper.find('input')

    await input.trigger('click')

    const open = wrapper.find('button.open')
    await open.trigger('click')

    expect(wrapper.vm.selectedDate).toStrictEqual(new Date(2020, 0, 1))
    expect(document.activeElement).toBe(document.body)
  })
})

describe('Datepicker mounted to body with slots', () => {
  let wrapper

  beforeEach(() => {
    jest.useFakeTimers()

    const beforeCalendarHeaderDay =
      '<div key="0">Example <a href="#">beforeCalendarHeaderDay</a> slot</div>'
    const calendarFooterDay =
      '<div key="1">Example <a href="#">calendarFooterDay</a> slot</div>'
    const beforeCalendarHeaderMonth =
      '<div key="2">Example <a href="#">beforeCalendarHeaderMonth</a> slot</div>'
    const calendarFooterMonth =
      '<div key="3">Example <a href="#">calendarFooterMonth</a> slot</div>'
    const beforeCalendarHeaderYear =
      '<div key="4">Example <a href="#">beforeCalendarHeaderYear</a> slot</div>'
    const calendarFooterYear =
      '<div key="5">Example <a href="#">calendarFooterYear</a> slot</div>'

    wrapper = mount(Datepicker, {
      attachTo: document.body,
      slots: {
        beforeCalendarHeaderDay,
        calendarFooterDay,
        beforeCalendarHeaderMonth,
        calendarFooterMonth,
        beforeCalendarHeaderYear,
        calendarFooterYear,
      },
    })
  })

  afterEach(() => {
    jest.clearAllTimers()
    wrapper.destroy()
  })

  it('knows how many navElements there are', async () => {
    expect(wrapper.vm.navElements.length).toEqual(0)

    const input = wrapper.find('input')
    await input.trigger('click')

    jest.advanceTimersByTime(wrapper.vm.fadeDuration)

    expect(wrapper.vm.navElements.length).toEqual(6)
  })
})

describe('Datepicker shallowMounted', () => {
  let wrapper
  beforeEach(() => {
    wrapper = shallowMount(Datepicker, {
      propsData: {
        format: 'yyyy-MM-dd',
        value: new Date(2016, 1, 15),
      },
    })
  })

  afterEach(() => {
    wrapper.destroy()
  })

  it('correctly sets the value from method', () => {
    const newDate = new Date(2016, 9, 15)
    expect(typeof wrapper.vm.setValue).toEqual('function')
    wrapper.vm.setValue(newDate)
    expect(wrapper.vm.selectedDate).toEqual(newDate)
    const now = new Date()
    wrapper.vm.setValue()
    expect(wrapper.vm.selectedDate).toEqual(null)
    const pageDate = new Date(wrapper.vm.pageDate)
    expect(pageDate.getFullYear()).toEqual(now.getFullYear())
    expect(pageDate.getMonth()).toEqual(now.getMonth())
    expect(pageDate.getDate()).toEqual(1)
  })

  it('sets the date', () => {
    const dateTemp = new Date(2016, 9, 9)
    const wrapperTemp = shallowMount(Datepicker, {
      propsData: {
        format: 'yyyy-MM-dd',
      },
    })
    wrapperTemp.vm.selectDate(dateTemp.valueOf())
    expect(wrapperTemp.vm.selectedDate.valueOf()).toEqual(dateTemp.valueOf())
  })

  it('clears the date', () => {
    const dateTemp = new Date(2016, 9, 9)
    const wrapperTemp = shallowMount(Datepicker)
    wrapperTemp.vm.selectDate(dateTemp.valueOf())
    wrapperTemp.vm.clearDate()
    expect(wrapperTemp.vm.selectedDate).toEqual(null)
  })

  it('sets pageTimestamp to be now', () => {
    const data = Datepicker.data()
    const d = new Date(data.pageTimestamp)
    expect(d.getFullYear()).toEqual(new Date().getFullYear())
    expect(d.getMonth()).toEqual(new Date().getMonth())
    expect(d.getDate()).toEqual(1)
  })

  it('toggles the calendar', async () => {
    wrapper.vm.setAllElements = jest.fn

    expect(wrapper.vm.isOpen).toEqual(false)

    await wrapper.vm.setView('month')
    expect(wrapper.vm.isOpen).toEqual(true)

    await wrapper.vm.close()
    expect(wrapper.vm.isOpen).toEqual(false)

    await wrapper.vm.setView('year')
    expect(wrapper.vm.isOpen).toEqual(true)

    await wrapper.vm.close()
    expect(wrapper.vm.isOpen).toEqual(false)

    await wrapper.vm.setView('day')
    expect(wrapper.vm.isOpen).toEqual(true)

    await wrapper.vm.close()
    expect(wrapper.vm.isOpen).toEqual(false)

    await wrapper.vm.setView('invalid date')
    expect(wrapper.vm.isOpen).toEqual(false)
  })

  it('resets the default page date', () => {
    const today = new Date()
    wrapper.vm.selectDate(today.valueOf())
    expect(wrapper.vm.pageDate.getFullYear()).toEqual(today.getFullYear())
    expect(wrapper.vm.pageDate.getMonth()).toEqual(today.getMonth())
    expect(wrapper.vm.pageDate.getDate()).toEqual(1)
    wrapper.vm.resetDefaultPageDate()
    expect(wrapper.vm.pageDate.getFullYear()).toEqual(today.getFullYear())
    expect(wrapper.vm.pageDate.getMonth()).toEqual(today.getMonth())
    expect(wrapper.vm.pageDate.getDate()).toEqual(1)
  })

  it('does not set the default page date if a date is selected', () => {
    const today = new Date()
    const pastDate = new Date(2018, 3, 20)
    wrapper.vm.selectDate(today.valueOf())
    expect(wrapper.vm.pageDate.getFullYear()).toEqual(today.getFullYear())
    expect(wrapper.vm.pageDate.getMonth()).toEqual(today.getMonth())
    expect(wrapper.vm.pageDate.getDate()).toEqual(1)
    wrapper.vm.selectDate(pastDate.valueOf())
    wrapper.vm.resetDefaultPageDate()
    expect(wrapper.vm.pageDate.getFullYear()).toEqual(pastDate.getFullYear())
    expect(wrapper.vm.pageDate.getMonth()).toEqual(pastDate.getMonth())
    expect(wrapper.vm.pageDate.getDate()).toEqual(1)
  })

  it('sets the date on typedDate event', () => {
    wrapper.setProps({
      typeable: true,
    })
    const today = new Date()
    wrapper.vm.handleTypedDate(today)
    expect(wrapper.vm.selectedDate).toEqual(today)
  })

  it('watches value', async () => {
    const spy = jest.spyOn(wrapper.vm, 'setValue')
    wrapper.setProps({ value: '2018-04-26' })
    await wrapper.vm.$nextTick()
    expect(spy).toHaveBeenCalled()
  })

  it('watches openDate', async () => {
    await wrapper.setProps({
      openDate: new Date(2018, 0, 1),
    })
    const spy = jest.spyOn(wrapper.vm, 'setPageDate')
    wrapper.setProps({ openDate: new Date(2018, 3, 26) })
    await wrapper.vm.$nextTick()
    expect(spy).toHaveBeenCalled()
  })

  it('sets picker classes correctly', async () => {
    await wrapper.setProps({
      calendarClass: 'my-calendar-class',
      inline: true,
    })

    await wrapper.vm.$nextTick()
    const datepicker = wrapper.find('.vdp-datepicker__calendar')

    expect(datepicker.element.className).toContain('vdp-datepicker__calendar')
    expect(datepicker.element.className).toContain('my-calendar-class')
    expect(datepicker.element.className).toContain('inline')
    expect(datepicker.element.className).not.toContain('rtl')

    await wrapper.setProps({
      appendToBody: true,
      language: he,
    })

    expect(datepicker.element.className).toContain('rtl')
  })

  it('clears date on default date disabled', async () => {
    const someDate = new Date('2021-01-15')
    const wrapperTemp = shallowMount(Datepicker, {
      propsData: {
        value: someDate,
        disabledDates: {
          customPredictor(customPredictorDate) {
            if (customPredictorDate < addDays(someDate, 4)) {
              return true
            }
            return false
          },
        },
      },
    })
    await wrapperTemp.vm.$nextTick()
    expect(wrapperTemp.vm.selectedDate).toEqual(null)
    expect(wrapperTemp.emitted().input).toBeTruthy()
  })

  it('sets the transition correctly', () => {
    wrapper.vm.setTransitionName(1)
    expect(wrapper.vm.transitionName).toBe('slide-right')

    wrapper.vm.setTransitionName(-1)
    expect(wrapper.vm.transitionName).toBe('slide-left')

    wrapper.setData({ translation: { rtl: true } })

    wrapper.vm.setTransitionName(1)
    expect(wrapper.vm.transitionName).toBe('slide-left')

    wrapper.vm.setTransitionName(-1)
    expect(wrapper.vm.transitionName).toBe('slide-right')
  })
})

describe('Datepicker.vue set by string', () => {
  let wrapper
  it('can parse a string date', () => {
    wrapper = shallowMount(Datepicker, {
      propsData: {
        format: 'yyyy MM dd',
        value: '2016-02-20',
      },
    })
    const date = new Date('2016-02-20')
    expect(wrapper.vm.selectedDate.getFullYear()).toEqual(date.getFullYear())
    expect(wrapper.vm.selectedDate.getMonth()).toEqual(date.getMonth())
    expect(wrapper.vm.selectedDate.getDate()).toEqual(date.getDate())
  })

  it('nullifies malformed value', () => {
    wrapper = shallowMount(Datepicker, {
      propsData: {
        value: 'today',
      },
    })
    expect(wrapper.vm.selectedDate).toBeNull()
  })
})

describe('Datepicker.vue set by timestamp', () => {
  let wrapper
  it('can parse unix timestamp', () => {
    wrapper = shallowMount(Datepicker, {
      propsData: {
        format: 'yyyy MM dd',
        value: new Date(Date.UTC(2018, 0, 29)).valueOf(),
      },
    })
    expect(wrapper.vm.selectedDate.getUTCFullYear()).toEqual(2018)
    expect(wrapper.vm.selectedDate.getUTCMonth()).toEqual(0)
    expect(wrapper.vm.selectedDate.getUTCDate()).toEqual(29)
  })
})

describe('Datepicker.vue using UTC', () => {
  let wrapper
  it('correctly sets the value using UTC', async () => {
    const timezoneOffset = new Date().getTimezoneOffset() / 60

    // this is ambiguous because localzone differs by one day than UTC
    const ambiguousHour = 25 - timezoneOffset
    const ambiguousDate = new Date(2018, 3, 15, ambiguousHour)
    const ambiguousYear = ambiguousDate.getUTCFullYear()
    const ambiguousMonth = `0${ambiguousDate.getUTCMonth() + 1}`.slice(-2)
    const ambiguousDay = `0${ambiguousDate.getUTCDate()}`.slice(-2)
    const UTCString = `${ambiguousYear} ${ambiguousMonth} ${ambiguousDay}`

    // It's important to use the `mount` helper here
    wrapper = mount(Datepicker, {
      propsData: {
        format: 'yyyy MM dd',
        value: ambiguousDate,
        useUtc: true, // This should fail if `useUtc=false`
      },
    })
    // It's important to assert the input rendered output
    await wrapper.vm.$nextTick()
    expect(wrapper.findComponent(DateInput).vm.formattedValue).toEqual(
      UTCString,
    )
  })
})

describe('Datepicker.vue inline', () => {
  let wrapper
  beforeEach(() => {
    wrapper = mount(Datepicker, {
      propsData: {
        inline: true,
      },
    })
  })

  afterEach(() => {
    wrapper.destroy()
  })

  it('shows calendar as already open', () => {
    expect(wrapper.vm.isOpen).toEqual(true)
    expect(wrapper.vm.isInline).toEqual(true)
  })

  it('does not close the calendar when date is selected', () => {
    const date = new Date()
    wrapper.vm.handleSelect({ timestamp: date.valueOf() })
    expect(wrapper.vm.isOpen).toEqual(true)
    document.body.click()
    expect(wrapper.vm.isOpen).toEqual(true)
  })
})

describe('Datepicker.vue inline mounted to body', () => {
  let wrapper
  beforeEach(() => {
    jest.useFakeTimers()

    wrapper = mount(Datepicker, {
      attachTo: document.body,
      propsData: {
        inline: true,
      },
    })
  })

  afterEach(() => {
    jest.clearAllTimers()

    wrapper.destroy()
  })

  it('has no focused element unless it has been interacted with', async () => {
    expect(document.activeElement).toEqual(document.body)
    expect(wrapper.vm.isDirty).toBeFalsy()

    const todayCell = wrapper.find('button.today')
    await todayCell.trigger('focusin')
    await todayCell.trigger('click')
    // TODO: Not sure why we need this?
    jest.advanceTimersByTime(0)

    expect(document.activeElement).toEqual(todayCell.element)
    expect(wrapper.vm.isDirty).toBeTruthy()
  })
})

describe('Datepicker with initial-view', () => {
  let wrapper
  beforeEach(() => {
    wrapper = mount(Datepicker)
  })

  afterEach(() => {
    wrapper.destroy()
  })

  it('opens in Day view', () => {
    wrapper.vm.open()
    expect(wrapper.vm.computedInitialView).toEqual('day')
    expect(wrapper.vm.picker).toEqual('PickerDay')
  })

  it('opens in Month view', () => {
    wrapper.setProps({
      initialView: 'month',
    })
    wrapper.vm.open()
    expect(wrapper.vm.computedInitialView).toEqual('month')
    expect(wrapper.vm.picker).toEqual('PickerMonth')
  })

  it('opens in Year view', () => {
    wrapper.setProps({
      initialView: 'year',
    })
    wrapper.vm.open()
    expect(wrapper.vm.computedInitialView).toEqual('year')
    expect(wrapper.vm.picker).toEqual('PickerYear')
  })

  it('does not open if the calendar is disabled', () => {
    wrapper.setProps({
      disabled: true,
    })
    wrapper.vm.open()
    expect(wrapper.vm.isOpen).toBeFalsy()
  })
})

describe('Datepicker on body', () => {
  let wrapper
  it('appends popup to body', async () => {
    wrapper = mount(Datepicker, {
      propsData: {
        appendToBody: true,
      },
    })

    await wrapper.vm.open()

    expect(wrapper.vm.$el.querySelector('.vdp-datepicker__calendar')).toBeNull()
    expect(document.querySelector('.vdp-datepicker__calendar')).toBeDefined()

    await wrapper.vm.close()
    wrapper.destroy()
  })

  it('removes popup on body on component removal', async () => {
    wrapper = mount(Datepicker, {
      propsData: {
        appendToBody: true,
      },
    })

    await wrapper.vm.open()
    await wrapper.vm.close()

    wrapper.destroy()
    expect(document.querySelector('.vdp-datepicker__calendar')).toBeNull()
  })
})
