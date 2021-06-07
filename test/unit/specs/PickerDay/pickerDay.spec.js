import { mount, shallowMount } from '@vue/test-utils'
import PickerDay from '~/components/PickerDay.vue'
import { en, mn } from '~/locale'

describe('PickerDay: shallowMount', () => {
  let wrapper
  beforeEach(() => {
    wrapper = shallowMount(PickerDay, {
      propsData: {
        translation: en,
        pageDate: new Date(2018, 1, 1),
        view: 'day',
      },
    })
  })

  afterEach(() => {
    wrapper.destroy()
  })

  it('knows the selected date', () => {
    const newDate = new Date(2016, 9, 15)
    wrapper.setProps({
      selectedDate: newDate,
    })
    expect(wrapper.vm.isSelectedDate(newDate)).toEqual(true)
    expect(wrapper.vm.isSelectedDate(new Date(2017, 1, 1))).toEqual(false)
  })

  it('can set the next month', () => {
    wrapper.vm.changePage({ incrementBy: 1, refsToFocus: ['next'] })
    expect(wrapper.emitted('page-change')[0][0].pageDate.getMonth()).toEqual(2)
  })

  it('can set the previous month', () => {
    wrapper.vm.changePage({ incrementBy: -1, refsToFocus: ['prev'] })
    expect(wrapper.emitted('page-change')[0][0].pageDate.getMonth()).toEqual(0)
  })

  it('emits an event when selected', () => {
    wrapper.vm.select({ isDisabled: false })
    expect(wrapper.emitted('select')).toBeTruthy()
  })

  it('knows the current page month', () => {
    expect(wrapper.vm.pageMonth).toEqual(1)
    expect(wrapper.vm.currMonthName).toEqual('Feb')

    wrapper.setProps({
      showFullMonthName: true,
    })
    expect(wrapper.vm.currMonthName).toEqual('February')
  })

  it('displays page title correctly', () => {
    expect(wrapper.vm.pageTitleDay).toEqual('Feb 2018')

    wrapper.setProps({
      translation: mn, // Mongolian has dates in ymd format
    })

    expect(wrapper.vm.pageTitleDay).toEqual('2018 2-р сар')
  })

  it('emits set-view event with `month` when the up button is clicked', () => {
    const upButton = wrapper.findComponent({ ref: 'up' })
    upButton.vm.$emit('select')
    expect(wrapper.emitted()['set-view'][0][0]).toBe('month')
  })
})

describe('PickerDay: mount', () => {
  let wrapper
  beforeEach(() => {
    wrapper = mount(PickerDay, {
      propsData: {
        translation: en,
        pageDate: new Date(2018, 1, 1),
        view: 'day',
      },
    })
  })

  afterEach(() => {
    wrapper.destroy()
  })

  it('displays edge dates by default', () => {
    const cells = wrapper.findAll('button.cell')
    const firstCell = cells.at(0)
    const lastCell = cells.at(34)

    expect(firstCell.text()).toBe('28')
    expect(lastCell.text()).toBe('3')
  })

  it('does not display edge dates when show-edge-dates = false', async () => {
    await wrapper.setProps({
      showEdgeDates: false,
    })

    const cells = wrapper.findAll('button.cell')
    const firstCell = cells.at(0)
    const lastCell = cells.at(34)

    expect(firstCell.text()).toBe('')
    expect(lastCell.text()).toBe('')
  })

  it('should select an edge date from the previous month', async () => {
    const cells = wrapper.findAll('button.cell')
    const firstCell = cells.at(0)

    await firstCell.trigger('click')

    expect(wrapper.emitted('select')[0][0].date).toBe(28)
  })

  it('should select an edge date from the next month', async () => {
    const cells = wrapper.findAll('button.cell')
    const lastCell = cells.at(34)

    await lastCell.trigger('click')

    expect(wrapper.emitted('select')[0][0].date).toBe(3)
  })
})
