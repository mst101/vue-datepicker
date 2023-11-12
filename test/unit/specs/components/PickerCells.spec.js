import { shallowMount, mount } from '@vue/test-utils'
import PickerCells from '~/components/PickerCells.vue'

describe('PickerCells shallowMounted', () => {
  let wrapper
  beforeEach(() => {
    wrapper = shallowMount(PickerCells, {
      props: {
        cells: [],
        view: 'day',
      },
    })
  })

  afterEach(() => {
    wrapper.unmount()
  })

  it('knows the number of columns', async () => {
    expect(wrapper.vm.columns).toEqual(7)

    await wrapper.setProps({
      view: 'month',
    })

    expect(wrapper.vm.columns).toEqual(3)
  })

  it('emits an `arrow` event when an arrow key is pressed', () => {
    wrapper.vm.handleArrow({ cellId: 0, delta: 1 })
    expect(wrapper.emitted('arrow')).toBeTruthy()
  })

  it("does not highlight today's date when show-edge-dates = false", async () => {
    const cell = {
      date: 1,
      isToday: true,
      isPreviousMonth: false,
      isNextMonth: true,
    }

    await wrapper.setProps({
      showEdgeDates: true,
    })

    let cellClasses = wrapper.vm.cellClasses(cell)
    expect(cellClasses[2].today).toBeTruthy()

    await wrapper.setProps({
      showEdgeDates: false,
    })

    cellClasses = wrapper.vm.cellClasses(cell)

    expect(cellClasses[2].today).toBeFalsy()
  })
})

describe('PickerCells mounted', () => {
  let wrapper
  beforeEach(() => {
    wrapper = mount(PickerCells, {
      props: {
        cells: [
          {
            date: 1,
            isDisabled: false,
            isHighlightEnd: false,
            isHighlightStart: false,
            isHighlighted: false,
            isNextMonth: false,
            isOpenDate: false,
            isPreviousMonth: false,
            isSaturday: false,
            isSelected: false,
            isSunday: false,
            isToday: false,
            isWeekend: false,
            timestamp: 1698796800000,
          },
        ],
        view: 'day',
      },
    })
  })

  afterEach(() => {
    wrapper.unmount()
  })

  it('emits the correct delta value when arrowing right', async () => {
    let firstCell = wrapper.find('.day')
    await firstCell.trigger('keydown.right')
    expect(wrapper.emitted('arrow')[0][0].delta).toBe(1)

    await wrapper.setProps({
      isRtl: true,
    })

    firstCell = wrapper.find('.day')
    await firstCell.trigger('keydown.right')
    expect(wrapper.emitted('arrow')[1][0].delta).toBe(-1)
  })

  it('emits the correct delta value when arrowing left', async () => {
    let firstCell = wrapper.find('.day')
    await firstCell.trigger('keydown.left')
    expect(wrapper.emitted('arrow')[0][0].delta).toBe(-1)

    await wrapper.setProps({
      isRtl: true,
    })

    firstCell = wrapper.find('.day')
    await firstCell.trigger('keydown.left')
    expect(wrapper.emitted('arrow')[1][0].delta).toBe(1)
  })
})
