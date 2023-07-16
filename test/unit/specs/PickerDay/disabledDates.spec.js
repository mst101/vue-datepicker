import { mount } from '@vue/test-utils'
import PickerDay from '~/components/PickerDay.vue'
import { en } from '~/locale'

describe('PickerDay mounted', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(PickerDay, {
      props: {
        pageDate: new Date(2016, 9, 1),
        translation: en,
        view: 'day',
      },
    })
  })

  afterEach(() => {
    wrapper.unmount()
  })

  it('disables dates from a given date', async () => {
    await wrapper.setProps({
      disabledDates: {
        from: new Date(2016, 9, 26),
      },
    })

    expect(wrapper.vm.isDisabledDate(new Date(2006, 9, 25))).toEqual(false)
    expect(wrapper.vm.isDisabledDate(new Date(2026, 9, 26))).toEqual(true)
  })

  it('disables dates to a given date', async () => {
    await wrapper.setProps({
      disabledDates: {
        to: new Date(2016, 9, 4),
      },
    })

    expect(wrapper.vm.isDisabledDate(new Date(2006, 9, 3))).toEqual(true)
    expect(wrapper.vm.isDisabledDate(new Date(2026, 9, 4))).toEqual(false)
  })

  it('accepts an array of disabled dates', async () => {
    await wrapper.setProps({
      disabledDates: {
        dates: [
          new Date(2016, 9, 2),
          new Date(2016, 9, 9),
          new Date(2016, 9, 16),
        ],
      },
    })

    expect(wrapper.vm.isDisabledDate(new Date(2016, 9, 2))).toEqual(true)
    expect(wrapper.vm.isDisabledDate(new Date(2016, 9, 3))).toEqual(false)
  })

  it('accepts an array of disabled dates in a range', async () => {
    await wrapper.setProps({
      disabledDates: {
        ranges: [
          {
            from: new Date(2005, 6, 5),
            to: new Date(2016, 9, 4),
          },
          {
            from: new Date(2016, 9, 26),
            to: new Date(2030, 11, 25),
          },
        ],
      },
    })

    expect(wrapper.vm.isDisabledDate(new Date(2005, 6, 4))).toEqual(false)
    expect(wrapper.vm.isDisabledDate(new Date(2005, 6, 5))).toEqual(true)
    expect(wrapper.vm.isDisabledDate(new Date(2030, 11, 25))).toEqual(true)
    expect(wrapper.vm.isDisabledDate(new Date(2030, 11, 26))).toEqual(false)
  })

  it('accepts an array of disabled days of the week', async () => {
    await wrapper.setProps({
      disabledDates: {
        days: [6, 0],
      },
    })

    expect(wrapper.vm.isDisabledDate(new Date(2016, 9, 2))).toEqual(true)
    expect(wrapper.vm.isDisabledDate(new Date(2016, 9, 3))).toEqual(false)
  })

  it('accepts an array of disabled days of the month', async () => {
    await wrapper.setProps({
      disabledDates: {
        daysOfMonth: [29, 30, 31],
      },
    })

    expect(wrapper.vm.isDisabledDate(new Date(2016, 8, 29))).toEqual(true)
    expect(wrapper.vm.isDisabledDate(new Date(2016, 9, 31))).toEqual(true)
    expect(wrapper.vm.isDisabledDate(new Date(2016, 10, 30))).toEqual(true)
    expect(wrapper.vm.isDisabledDate(new Date(2016, 9, 11))).toEqual(false)
  })

  it('accepts a customPredictor to check if the date is disabled', async () => {
    await wrapper.setProps({
      disabledDates: {
        customPredictor(date) {
          return date.getDate() % 4 === 0
        },
      },
    })

    expect(wrapper.vm.isDisabledDate(new Date(2016, 8, 29))).toEqual(false)
    expect(wrapper.vm.isDisabledDate(new Date(2016, 9, 28))).toEqual(true)
    expect(wrapper.vm.isDisabledDate(new Date(2016, 10, 24))).toEqual(true)
    expect(wrapper.vm.isDisabledDate(new Date(2016, 9, 11))).toEqual(false)
  })

  it('sets `isNextDisabled` and `isPreviousDisabled` correctly', async () => {
    await wrapper.setProps({
      disabledDates: {
        to: new Date(2016, 8, 30),
        from: new Date(2016, 10, 1),
      },
    })

    expect(wrapper.vm.isNextDisabled).toBeTruthy()
    expect(wrapper.vm.isPreviousDisabled).toBeTruthy()

    await wrapper.setProps({
      disabledDates: {
        to: new Date(2016, 8, 29),
        from: new Date(2016, 10, 2),
      },
    })

    expect(wrapper.vm.isNextDisabled).toBeFalsy()
    expect(wrapper.vm.isPreviousDisabled).toBeFalsy()
  })

  it('knows the earliest possible date', async () => {
    expect(wrapper.vm.earliestPossibleDate).toBeNull()

    await wrapper.setProps({
      disabledDates: {
        dates: [new Date(2016, 9, 4)],
        to: new Date(2016, 9, 3),
      },
    })

    expect(wrapper.vm.earliestPossibleDate).toEqual(new Date(2016, 9, 5))

    await wrapper.setProps({
      disabledDates: {
        dates: [new Date(2016, 9, 4)],
        ranges: [
          {
            from: new Date(2016, 9, 4),
            to: new Date(2016, 9, 8),
          },
        ],
        to: new Date(2016, 9, 4),
      },
    })

    expect(wrapper.vm.earliestPossibleDate).toEqual(new Date(2016, 9, 9))
  })

  it('knows the latest possible date', async () => {
    expect(wrapper.vm.latestPossibleDate).toBeNull()

    await wrapper.setProps({
      disabledDates: {
        dates: [new Date(2016, 9, 26)],
        from: new Date(2016, 9, 27),
      },
    })

    expect(wrapper.vm.latestPossibleDate).toEqual(new Date(2016, 9, 25))

    await wrapper.setProps({
      disabledDates: {
        dates: [new Date(2016, 9, 19)],
        ranges: [
          {
            from: new Date(2016, 9, 20),
            to: new Date(2016, 9, 27),
          },
        ],
        from: new Date(2016, 9, 29),
      },
    })

    expect(wrapper.vm.latestPossibleDate).toEqual(new Date(2016, 9, 28))
  })
})
