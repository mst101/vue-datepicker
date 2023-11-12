import { mount } from '@vue/test-utils'
import PickerDay from '~/components/PickerDay.vue'
import { en, mn } from '~/locale'

describe('PickerDay mounted', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(PickerDay, {
      props: {
        translation: en,
        pageDate: new Date(2018, 1, 1),
      },
    })
  })

  afterEach(() => {
    wrapper.unmount()
  })

  it('renders correct contents', () => {
    expect(wrapper.vm.cells.length).toBeGreaterThan(0)
  })

  it('knows the selected date', async () => {
    const newDate = new Date(2016, 9, 15)
    await wrapper.setProps({
      selectedDate: newDate,
    })
    expect(wrapper.vm.isSelectedDate(newDate)).toEqual(true)
    expect(wrapper.vm.isSelectedDate(new Date(2017, 1, 1))).toEqual(false)
  })

  it('can set the next month', () => {
    wrapper.vm.changePage({ incrementBy: 1, focusRefs: ['next'] })
    expect(wrapper.emitted('pageChange')[0][0].pageDate.getMonth()).toEqual(2)
  })

  it('can set the previous month', () => {
    wrapper.vm.changePage({ incrementBy: -1, focusRefs: ['prev'] })
    expect(wrapper.emitted('pageChange')[0][0].pageDate.getMonth()).toEqual(0)
  })

  it('emits an event when selected', () => {
    wrapper.vm.select({ isDisabled: false })
    expect(wrapper.emitted('select')).toBeTruthy()
  })

  it('knows the current page month', async () => {
    expect(wrapper.vm.pageMonth).toEqual(1)
    expect(wrapper.vm.currMonthName).toEqual('Feb')

    await wrapper.setProps({
      showFullMonthName: true,
    })
    expect(wrapper.vm.currMonthName).toEqual('February')
  })

  it('displays page title correctly', async () => {
    expect(wrapper.vm.pageTitleDay).toEqual('Feb 2018')

    await wrapper.setProps({
      translation: mn, // Mongolian has dates in ymd format
    })

    expect(wrapper.vm.pageTitleDay).toEqual('2018 2-р сар')
  })

  it('emits set-view event with `month` when the up button is clicked', async () => {
    const upButton = wrapper.find('.vdp-datepicker__up')
    await upButton.trigger('click')
    expect(wrapper.emitted('setView')[0][0]).toBe('month')
  })

  it('displays edge dates by default', () => {
    const cells = wrapper.findAll('button.cell')
    const firstCell = cells[0]
    const lastCell = cells[34]

    expect(firstCell.text()).toBe('28')
    expect(lastCell.text()).toBe('3')
  })

  it('does not display edge dates when show-edge-dates = false', async () => {
    await wrapper.setProps({
      showEdgeDates: false,
    })

    const cells = wrapper.findAll('button.cell')
    const firstCell = cells[0]
    const lastCell = cells[34]

    expect(firstCell.text()).toBe('')
    expect(lastCell.text()).toBe('')
  })

  it('selects an edge date from the previous month', async () => {
    const cells = wrapper.findAll('button.cell')
    const firstCell = cells[0]

    await firstCell.trigger('click')

    expect(wrapper.emitted('select')[0][0].date).toBe(28)
  })

  it('selects an edge date from the next month', async () => {
    const cells = wrapper.findAll('button.cell')
    const lastCell = cells[34]

    await lastCell.trigger('click')

    expect(wrapper.emitted('select')[0][0].date).toBe(3)
  })

  it("only highlights today's edge date if shown", async () => {
    const cell = {
      date: 1,
      isToday: true,
      isPreviousMonth: false,
      isNextMonth: true,
    }

    await wrapper.setProps({
      showEdgeDates: true,
    })

    let cellClasses = wrapper.vm.pickerCellsRef.cellClasses(cell)

    expect(cellClasses[2].today).toBeTruthy()

    await wrapper.setProps({
      showEdgeDates: false,
    })

    cellClasses = wrapper.vm.pickerCellsRef.cellClasses(cell)

    expect(cellClasses[2].today).toBeFalsy()
  })

  it('only highlights selected edge date if shown', async () => {
    const day = {
      date: 1,
      isSelected: true,
      isPreviousMonth: false,
      isNextMonth: true,
    }

    await wrapper.setProps({
      showEdgeDates: true,
    })

    let cellClasses = wrapper.vm.pickerCellsRef.cellClasses(day)

    expect(cellClasses[2].selected).toBeTruthy()

    await wrapper.setProps({
      showEdgeDates: false,
    })

    cellClasses = wrapper.vm.pickerCellsRef.cellClasses(day)

    expect(cellClasses[2].selected).toBeFalsy()
  })
})

describe('PickerDay mounted with Monday as first day of week', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(PickerDay, {
      props: {
        firstDayOfWeek: 'mon',
        translation: en,
        pageDate: new Date(2018, 1, 1),
      },
    })
  })

  afterEach(() => {
    wrapper.unmount()
  })

  it('returns Monday as a first day of week', () => {
    expect(wrapper.vm.daysOfWeek[0]).toEqual('Mon')
  })

  it('returns Sunday as a seventh day of week', () => {
    expect(wrapper.vm.daysOfWeek[6]).toEqual('Sun')
  })

  it('has 6 days from previous month when month starts on a Sunday', async () => {
    await wrapper.setProps({
      pageDate: new Date(2020, 10, 1),
    })

    for (let i = 0; i < 6; i += 1) {
      expect(wrapper.vm.cells[i].isPreviousMonth).toBeTruthy()
      expect(wrapper.vm.cells[i].isNextMonth).toBeFalsy()
    }
  })

  it('has no days from previous month when month starts on a Monday', async () => {
    await wrapper.setProps({
      pageDate: new Date(2020, 5, 1),
    })

    expect(wrapper.vm.cells[0].isPreviousMonth).toBeFalsy()
    expect(wrapper.vm.cells[0].isNextMonth).toBeFalsy()
  })
})

describe('PickerDay mounted with Saturday as first day of week', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(PickerDay, {
      props: {
        firstDayOfWeek: 'sat',
        translation: en,
        pageDate: new Date(2018, 1, 1),
      },
    })
  })

  afterEach(() => {
    wrapper.unmount()
  })

  it('has 6 days from previous month when month starts on a Friday', async () => {
    await wrapper.setProps({
      pageDate: new Date(2021, 0, 1),
    })

    for (let i = 0; i < 6; i += 1) {
      expect(wrapper.vm.cells[i].isPreviousMonth).toBeTruthy()
      expect(wrapper.vm.cells[i].isNextMonth).toBeFalsy()
    }
  })

  it('has no days from previous month when month starts on a Saturday', async () => {
    await wrapper.setProps({
      pageDate: new Date(2020, 7, 1),
    })

    expect(wrapper.vm.cells[0].isPreviousMonth).toBeFalsy()
    expect(wrapper.vm.cells[0].isNextMonth).toBeFalsy()
  })
})

describe('PickerDay mounted with scoped slot', () => {
  it('displays the dayCellContent scoped slot correctly', () => {
    const wrapper = mount(PickerDay, {
      props: {
        translation: en,
        pageDate: new Date(2018, 1, 1),
      },
      slots: {
        dayCellContent: `<template #dayCellContent="{ cell }">
                          <span>test{{ cell.date }}</span>
                        </template>`,
      },
    })

    const firstCell = wrapper.find('.cell')

    expect(firstCell.text()).toBe('test28')
  })
})
