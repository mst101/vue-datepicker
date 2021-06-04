import { shallowMount } from '@vue/test-utils'
import PickerCells from '~/components/PickerCells.vue'

describe('PickerCells', () => {
  let wrapper
  beforeEach(() => {
    wrapper = shallowMount(PickerCells, {
      propsData: {
        cells: [],
        view: 'day',
      },
    })
  })

  afterEach(() => {
    wrapper.destroy()
  })

  it('knows the number of columns', () => {
    expect(wrapper.vm.columns).toEqual(7)

    wrapper.setProps({ view: 'month' })

    expect(wrapper.vm.columns).toEqual(3)
  })

  it('displays the date correctly', async () => {
    await wrapper.setProps({ cells: [{ date: 1 }] })

    const firstCell = wrapper.find('button.cell').element
    expect(firstCell.innerHTML.replace(/\s/g, '')).toBe('1')
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