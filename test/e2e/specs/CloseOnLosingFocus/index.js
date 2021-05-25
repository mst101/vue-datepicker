import { Given, When, Then, And } from 'cypress-cucumber-preprocessor/steps'

const { clickThe, createCalendar, focusThe, the } = cy

describe('Close on losing focus', () => {
  describe('@id-1: Click outside', () => {
    Given('the calendar is {string}', (openOrClosed) => {
      const view = openOrClosed === 'closed' ? '' : 'day'
      const isNot = openOrClosed === 'closed' ? 'not.' : ''

      createCalendar({
        calendarButton: true,
        initialView: view,
      })

      the('calendar').should(`${isNot}be.visible`)
    })

    And('the input field is focused', () => {
      focusThe('input')
    })

    When('the user clicks the body', () => {
      clickThe('body', 'bottom')
    })

    Then('the calendar {string}', (opensOrCloses) => {
      const isNot = opensOrCloses === 'closes' ? 'not.' : ''

      the('calendar').should(`${isNot}be.visible`)
    })

    And('no element has focus', () => {
      the('input').should('not.be.focused')
    })
  })

  describe('@id-2: Click outside (typeable)', () => {
    Given(
      'the typeable calendar is {string} and a {string} date is typed',
      (openOrClosed, validity) => {
        const view = openOrClosed === 'closed' ? '' : 'day'
        const date = validity === 'valid' ? '1 March 2021' : 'invalid date'
        const isNot = openOrClosed === 'closed' ? 'not.' : ''

        createCalendar({
          calendarButton: true,
          initialView: view,
          typeable: true,
        })

        focusThe('input').type(date)

        the('calendar').should(`${isNot}be.visible`)
      },
    )

    And('the input field is focused', () => {
      focusThe('input')
    })

    When('the user clicks the body', () => {
      clickThe('body', 'bottom')
    })

    Then('the calendar {string}')

    And('the date is {string}', (formattedOrCleared) => {
      const value = formattedOrCleared === 'formatted' ? '01 Mar 2021' : ''

      the('input').should('have.value', value)
    })

    And('no element has focus')
  })
})
