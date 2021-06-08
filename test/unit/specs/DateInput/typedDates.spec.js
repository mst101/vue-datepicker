import { mount, shallowMount } from '@vue/test-utils'
import { format, parse } from 'date-fns'
import DateInput from '~/components/DateInput.vue'
import Datepicker from '~/components/Datepicker.vue'
import { en } from '~/locale'

describe('DateInput', () => {
  let wrapper

  beforeEach(() => {
    wrapper = shallowMount(DateInput, {
      propsData: {
        format: 'dd MMM yyyy',
        translation: en,
        typeable: true,
      },
    })
  })

  afterEach(() => {
    wrapper.destroy()
  })

  it('does not format the date when typed', () => {
    const dateString = '2018-04-24'
    wrapper.vm.input.value = dateString
    expect(wrapper.vm.input.value).toEqual(dateString)
    wrapper.setData({
      typedDate: dateString,
    })
    wrapper.setProps({
      selectedDate: new Date(dateString),
    })
    expect(wrapper.vm.typedDate).toEqual(dateString)
    expect(wrapper.vm.formattedValue).toEqual(dateString)
  })

  it('allows international custom date format d.M.yyyy', () => {
    const dateString = '24.06.2018'
    wrapper.setProps({
      selectedDate: new Date(dateString),
      typeable: true,
      format: 'd.M.yyyy',
    })
    const input = wrapper.find('input')
    wrapper.vm.input.value = dateString
    expect(wrapper.vm.input.value).toEqual(dateString)
    input.trigger('keyup')
    expect(wrapper.vm.formattedValue).toEqual(dateString)
  })

  it('allows international custom date format dd/MM/yyyy', () => {
    const dateString = '24/06/2018'
    wrapper.setProps({
      selectedDate: new Date(dateString),
      typeable: true,
      format: 'dd/MM/yyyy',
    })
    const input = wrapper.find('input')
    wrapper.vm.input.value = dateString
    expect(wrapper.vm.input.value).toEqual(dateString)
    input.trigger('keyup')
    expect(wrapper.vm.formattedValue).toEqual(dateString)
  })

  it('allows international custom date format dd MM yyyy', () => {
    const dateString = '24 06 2018'
    wrapper.setProps({
      selectedDate: new Date(dateString),
      typeable: true,
      format: 'dd MM yyyy',
    })
    const input = wrapper.find('input')
    wrapper.vm.input.value = dateString
    expect(wrapper.vm.input.value).toEqual(dateString)
    input.trigger('keyup')
    expect(wrapper.vm.formattedValue).toEqual(dateString)
  })

  it('allows function format', () => {
    const dateString = '2018-08-12'
    wrapper.setProps({
      selectedDate: new Date(dateString),
      typeable: true,
      format(date) {
        return format(new Date(date), 'dd.MM.yyyy')
      },
      parser(date) {
        return parse(date, 'dd.MM.yyyy', new Date())
      },
    })
    const input = wrapper.find('input')
    input.setValue(dateString)
    expect(input.element.value).toEqual(dateString)
    input.trigger('keyup')
    expect(wrapper.vm.formattedValue).toEqual('12.08.2018')
  })

  it('emits the date when typed', async () => {
    const input = wrapper.find('input')
    input.setValue('2018-04-24')
    await input.trigger('keyup')
    expect(wrapper.emitted('typed-date')).toBeDefined()
    expect(wrapper.emitted('typed-date')[0][0]).toBeInstanceOf(Date)
  })

  it('emits close-calendar when return is pressed', () => {
    const input = wrapper.find('input')
    input.trigger('keydown.enter')
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it("doesn't emit the date if typeable=false", () => {
    const wrapperNotTypeAble = shallowMount(DateInput, {
      propsData: {
        format: 'dd MMM yyyy',
        translation: en,
        typeable: false,
      },
    })
    const input = wrapperNotTypeAble.find('input')
    wrapperNotTypeAble.vm.input.value = '2018-04-24'
    input.trigger('keydown')
    input.trigger('keyup')
    expect(wrapperNotTypeAble.emitted().typedDate).not.toBeDefined()
  })
})

describe('Datepicker mount', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(Datepicker, {
      propsData: {
        format: 'dd MMM yyyy',
        translation: en,
        typeable: true,
        useUtc: true,
      },
    })
  })

  afterEach(() => {
    wrapper.destroy()
  })

  it('shows the correct month as you type', async () => {
    const spySelectDate = jest.spyOn(wrapper.vm, 'selectDate')
    const input = wrapper.find('input')

    await input.trigger('click')
    input.element.value = 'Jan'
    await input.trigger('keyup')

    expect(spySelectDate).toHaveBeenCalled()
    expect(wrapper.vm.isOpen).toBeTruthy()
    expect(new Date(wrapper.vm.pageDate).getMonth()).toBe(0)

    input.element.value = 'Feb'
    await input.trigger('keyup')

    expect(new Date(wrapper.vm.pageDate).getMonth()).toBe(1)
  })

  it('formats a valid date when the input field is blurred', async () => {
    const input = wrapper.find('input')
    input.setValue('2018-04-24')
    await input.trigger('keyup')
    await input.trigger('blur')
    expect(input.element.value).toEqual('24 Apr 2018')
  })

  it('clears an invalid date when the input field is blurred', async () => {
    const input = wrapper.find('input')

    await input.trigger('click')
    expect(wrapper.vm.isOpen).toBeTruthy()

    input.setValue('invalid date')
    await input.trigger('keyup')
    await input.trigger('blur')

    expect(input.element.value).toBe('')
    expect(wrapper.vm.selectedDate).toBeNull()
  })
})
