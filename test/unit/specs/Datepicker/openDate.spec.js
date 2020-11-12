import { mount, shallowMount } from '@vue/test-utils'
import Datepicker from '~/components/Datepicker'

describe('Datepicker with open date: shallowMount', () => {
  const openDate = new Date(2016, 9, 12)
  let wrapper
  beforeEach(() => {
    wrapper = shallowMount(Datepicker, {
      propsData: {
        openDate,
      },
    })
  })

  afterEach(() => {
    wrapper.destroy()
  })

  it('should be set to October', () => {
    expect(wrapper.vm.pageDate.getMonth()).toEqual(9)
    expect(wrapper.vm.pageDate.getFullYear()).toEqual(2016)
  })

  it('should set pageTimestamp to be first day of open date\'s month', () => {
    const date = new Date(wrapper.vm.pageTimestamp)
    expect(wrapper.vm.openDate.valueOf()).toEqual(openDate.valueOf())
    wrapper.vm.setPageDate()
    expect(date.getFullYear()).toEqual(openDate.getFullYear())
    expect(date.getMonth()).toEqual(openDate.getMonth())
    expect(date.getDate()).toEqual(1)
  })

  it('should show today\'s date if no open date is set', () => {
    wrapper = shallowMount(Datepicker)
    const today = new Date()
    expect(wrapper.vm.pageDate.getMonth()).toEqual(today.getMonth())
    expect(wrapper.vm.pageDate.getFullYear()).toEqual(today.getFullYear())
  })
})

describe('Datepicker with open date: mount', () => {
  const openDate = new Date(2016, 9, 12)
  let wrapper
  beforeEach(() => {
    wrapper = mount(Datepicker, {
      propsData: {
        openDate,
      },
    })
  })

  afterEach(() => {
    wrapper.destroy()
  })

  it('should open with selected date if one is set', () => {
    const newDate = new Date(2018, 10, 9)
    wrapper.vm.selectDate({ timestamp: newDate.valueOf() })
    expect(wrapper.vm.pageDate.getMonth()).toEqual(10)
    expect(wrapper.vm.pageDate.getFullYear()).toEqual(2018)
  })
})
