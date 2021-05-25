import { Given, When, Then, And } from 'cypress-cucumber-preprocessor/steps'

const { createCalendar, focusThe, the } = cy

describe('@id-1: Press the enter key', () => {
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

  When('the user presses the enter key', () => {
    focusThe('input').type(`{enter}`)
  })

  Then('the calendar {string}', (opensOrCloses) => {
    const isNot = opensOrCloses === 'closes' ? 'not.' : ''

    the('calendar').should(`${isNot}be.visible`)
  })

  And('the date is {string}', (formattedOrCleared) => {
    const value = formattedOrCleared === 'formatted' ? '01 Mar 2021' : ''

    the('input').should('have.value', value)
  })

  And('the input has focus', () => {
    the('input').should('have.focus')
  })
})

describe('@id-2: Press the down arrow', () => {
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

  When('the user presses the `down` arrow', () => {
    focusThe('input').type(`{downArrow}`)
  })

  Then('the calendar {string}', (opensOrCloses) => {
    const isNot = opensOrCloses === 'closes' ? 'not.' : ''

    the('calendar').should(`${isNot}be.visible`)
  })

  And('the date is {string}', (formattedOrCleared) => {
    const value = formattedOrCleared === 'formatted' ? '01 Mar 2021' : ''

    the('input').should('have.value', value)
  })

  And('the previous button has focus', () => {
    the('previous-button').should('have.focus')
  })
})
