import { shallowMount } from '@vue/test-utils'
import PickerYear from '~/components/PickerYear.vue'
import { en } from '~/locale'

describe('PickerYear', () => {
  let wrapper
  beforeEach(() => {
    jest.useFakeTimers()

    wrapper = shallowMount(PickerYear, {
      propsData: {
        translation: en,
        pageDate: new Date(2018, 1, 1),
        view: 'year',
      },
    })
  })

  afterEach(() => {
    jest.clearAllTimers()

    wrapper.destroy()
  })

  it('knows the selected year', async () => {
    const newDate = new Date(2016, 9, 15)

    await wrapper.setProps({
      selectedDate: newDate,
    })

    expect(wrapper.vm.isSelectedYear(newDate)).toEqual(true)
    expect(wrapper.vm.isSelectedYear(new Date(2017, 1, 1))).toEqual(false)
  })

  it('knows the selected year when useUtc = true', async () => {
    const newDate = new Date(2016, 9, 15)

    await wrapper.setProps({
      selectedDate: newDate,
      useUtc: true,
    })

    expect(wrapper.vm.isSelectedYear(newDate)).toEqual(true)
    expect(wrapper.vm.isSelectedYear(new Date(2017, 1, 1))).toEqual(false)
  })

  it('can set the next decade', () => {
    wrapper.vm.changePage({ incrementBy: 1, refsToFocus: ['next'] })
    expect(wrapper.emitted('page-change')[0][0].pageDate.getFullYear()).toEqual(
      2028,
    )
  })

  it('can set the previous decade', () => {
    wrapper.vm.changePage({ incrementBy: -1, refsToFocus: ['prev'] })
    expect(wrapper.emitted('page-change')[0][0].pageDate.getFullYear()).toEqual(
      2008,
    )
  })

  it('formats the decade range', async () => {
    await wrapper.setProps({
      pageDate: new Date(2021, 1, 1),
    })
    jest.advanceTimersByTime(wrapper.vm.fadeDuration)

    expect(wrapper.vm.pageTitle).toEqual('2020 - 2029')

    await wrapper.setProps({
      pageDate: new Date(2001, 1, 1),
    })
    jest.advanceTimersByTime(wrapper.vm.fadeDuration)

    expect(wrapper.vm.pageTitle).toEqual('2000 - 2009')
  })

  it('emits an event when selected', () => {
    wrapper.vm.handleSelect({ isDisabled: false })
    expect(wrapper.emitted('select')).toBeTruthy()
  })

  it('should set custom decade range', async () => {
    wrapper.setProps({
      pageDate: new Date(2021, 1, 1),
      yearRange: 12,
    })
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.pageTitle).toEqual('2016 - 2027')
    expect(wrapper.vm.cells.length).toEqual(12)
  })
})
