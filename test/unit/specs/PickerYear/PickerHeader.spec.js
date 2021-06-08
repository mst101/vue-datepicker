import { shallowMount } from '@vue/test-utils'
import PickerHeader from '~/components/PickerHeader.vue'

describe('PickerHeader', () => {
  let wrapper

  beforeEach(() => {
    wrapper = shallowMount(PickerHeader, {
      propsData: {
        isRtl: false,
        isNextDisabled: false,
        isPreviousDisabled: false,
      },
    })
  })

  afterEach(() => {
    wrapper.destroy()
  })

  it('should decrement the page when the `previous` button is clicked', async () => {
    const prevButton = wrapper.find('button.prev')
    await prevButton.trigger('click')

    expect(wrapper.emitted('page-change')[0][0]).toEqual({
      incrementBy: -1,
      focusRefs: ['prev'],
    })
  })

  it('should increment the page when the `next` button is clicked', async () => {
    const nextButton = wrapper.find('button.next')
    await nextButton.trigger('click')

    expect(wrapper.emitted('page-change')[0][0]).toEqual({
      incrementBy: 1,
      focusRefs: ['next'],
    })
  })
})
