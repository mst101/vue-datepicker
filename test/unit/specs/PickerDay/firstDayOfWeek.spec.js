import { mount } from '@vue/test-utils'
import PickerDay from '~/components/PickerDay.vue'
import { en } from '~/locale'
import makeDateUtils from '~/utils/DateUtils'

const dateUtils = makeDateUtils(false)

describe('PickerDay: Set first day of week', () => {
  let wrapper
  beforeEach(() => {
    wrapper = mount(PickerDay, {
      propsData: {
        firstDayOfWeek: 'mon',
        translation: en,
        pageDate: new Date(2018, 1, 1),
      },
    })
  })

  afterEach(() => {
    wrapper.destroy()
  })

  it('should return Monday as a first day of week', () => {
    expect(wrapper.vm.daysOfWeek[0]).toEqual('Mon')
  })

  it('should return Sunday as a seventh day of week', () => {
    expect(wrapper.vm.daysOfWeek[6]).toEqual('Sun')
  })

  it('should have 6 days from previous month when month starts on a Sunday', () => {
    const testDate = new Date(2020, 10, 1)
    const startDate = dateUtils.getNewDateObject(testDate)

    wrapper.setProps({
      pageDate: testDate,
      pageTimestamp: dateUtils.setDate(startDate, 1),
    })
    for (let i = 0; i < 6; i += 1) {
      expect(wrapper.vm.cells[i].isPreviousMonth).toBeTruthy()
      expect(wrapper.vm.cells[i].isNextMonth).toBeFalsy()
    }
  })

  it('should have no days from previous month when month starts on a Monday', () => {
    const testDate = new Date(2020, 5, 1)
    const startDate = dateUtils.getNewDateObject(testDate)

    wrapper.setProps({
      pageDate: testDate,
      pageTimestamp: dateUtils.setDate(startDate, 1),
    })
    expect(wrapper.vm.cells[0].isPreviousMonth).toBeFalsy()
    expect(wrapper.vm.cells[0].isNextMonth).toBeFalsy()
  })
})

describe('PickerDay: Datepicker with Saturday as first day of week', () => {
  let wrapper
  beforeEach(() => {
    wrapper = mount(PickerDay, {
      propsData: {
        firstDayOfWeek: 'sat',
        translation: en,
        pageDate: new Date(2018, 1, 1),
      },
    })
  })

  afterEach(() => {
    wrapper.destroy()
  })

  it('should have 6 days from previous month when month starts on a Friday', () => {
    const testDate = new Date(2021, 0, 1)
    const startDate = dateUtils.getNewDateObject(testDate)

    wrapper.setProps({
      pageDate: testDate,
      pageTimestamp: dateUtils.setDate(startDate, 1),
    })
    for (let i = 0; i < 6; i += 1) {
      expect(wrapper.vm.cells[i].isPreviousMonth).toBeTruthy()
      expect(wrapper.vm.cells[i].isNextMonth).toBeFalsy()
    }
  })

  it('should have no days from previous month when month starts on a Saturday', () => {
    const testDate = new Date(2020, 7, 1)
    const startDate = dateUtils.getNewDateObject(testDate)

    wrapper.setProps({
      pageDate: testDate,
      pageTimestamp: dateUtils.setDate(startDate, 1),
    })
    expect(wrapper.vm.cells[0].isPreviousMonth).toBeFalsy()
    expect(wrapper.vm.cells[0].isNextMonth).toBeFalsy()
  })
})
