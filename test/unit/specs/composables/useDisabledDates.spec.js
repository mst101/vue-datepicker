import useDisabledDates from '~/composables/useDisabledDates'
import { withSetup } from '../../withSetup'

describe('useDisabledDates', () => {
  let app
  let results

  afterEach(() => {
    app.unmount()
  })

  it('only disables dates when provided with a disabledDates prop', () => {
    ;[app, results] = withSetup(useDisabledDates)

    const { isDisabledDate } = results

    expect(isDisabledDate(new Date(2016, 9, 3))).toBe(false)
  })

  it('disables dates to a given date', () => {
    const disabledDates = {
      to: new Date(2021, 9, 13),
    }

    ;[app, results] = withSetup(useDisabledDates, disabledDates)

    const { isDisabledDate } = results

    expect(isDisabledDate(new Date(2021, 9, 13))).toBe(true)
    expect(isDisabledDate(new Date(2021, 9, 14))).toBe(false)
  })

  it('disables dates from a given date', () => {
    const disabledDates = {
      from: new Date(2021, 9, 13),
    }

    ;[app, results] = withSetup(useDisabledDates, disabledDates)

    const { isDisabledDate } = results

    expect(isDisabledDate(new Date(2021, 9, 12))).toBe(false)
    expect(isDisabledDate(new Date(2021, 9, 13))).toBe(true)
  })

  it('disables an array of individual dates', () => {
    const disabledDates = {
      dates: [new Date(2016, 9, 4), new Date(2016, 9, 6)],
    }

    ;[app, results] = withSetup(useDisabledDates, disabledDates)

    const { isDisabledDate } = results

    expect(isDisabledDate(new Date(2016, 9, 3))).toBe(false)
    expect(isDisabledDate(new Date(2016, 9, 4))).toBe(true)
    expect(isDisabledDate(new Date(2016, 9, 5))).toBe(false)
    expect(isDisabledDate(new Date(2016, 9, 6))).toBe(true)
    expect(isDisabledDate(new Date(2016, 9, 7))).toBe(false)
  })

  it('disables an array of date ranges', () => {
    const disabledDates = {
      ranges: [
        {
          from: new Date(2016, 9, 4),
          to: new Date(2016, 9, 8),
        },
      ],
    }

    ;[app, results] = withSetup(useDisabledDates, disabledDates)

    const { isDisabledDate } = results

    expect(isDisabledDate(new Date(2016, 9, 3))).toBe(false)
    expect(isDisabledDate(new Date(2016, 9, 4))).toBe(true)
    expect(isDisabledDate(new Date(2016, 9, 8))).toBe(true)
    expect(isDisabledDate(new Date(2016, 9, 9))).toBe(false)
  })

  it('disables an array of days of the week', async () => {
    const disabledDates = {
      days: [6, 0],
    }

    ;[app, results] = withSetup(useDisabledDates, disabledDates)

    const { isDisabledDate } = results

    expect(isDisabledDate(new Date(2016, 9, 2))).toBe(true)
    expect(isDisabledDate(new Date(2016, 9, 3))).toBe(false)
  })

  it('disables an array of days of the month', async () => {
    const disabledDates = {
      daysOfMonth: [29, 30, 31],
    }

    ;[app, results] = withSetup(useDisabledDates, disabledDates)

    const { isDisabledDate } = results

    expect(isDisabledDate(new Date(2016, 8, 29))).toBe(true)
    expect(isDisabledDate(new Date(2016, 9, 31))).toBe(true)
    expect(isDisabledDate(new Date(2016, 10, 30))).toBe(true)
    expect(isDisabledDate(new Date(2016, 9, 11))).toBe(false)
  })

  it('disables dates via a customPredictor function', async () => {
    const disabledDates = {
      customPredictor(date) {
        return date.getDate() % 4 === 0
      },
    }

    ;[app, results] = withSetup(useDisabledDates, disabledDates)

    const { isDisabledDate } = results

    expect(isDisabledDate(new Date(2016, 8, 29))).toBe(false)
    expect(isDisabledDate(new Date(2016, 9, 28))).toBe(true)
    expect(isDisabledDate(new Date(2016, 10, 24))).toBe(true)
    expect(isDisabledDate(new Date(2016, 9, 11))).toBe(false)
  })

  it('knows if a month is disabled', () => {
    const view = 'month'
    const disabledDates = {
      to: new Date(2021, 6, 15),
      from: new Date(2021, 10, 15),
    }

    ;[app, results] = withSetup(useDisabledDates, disabledDates, { view })

    const { isDisabledMonth } = results

    expect(isDisabledMonth(new Date(2020, 0, 1))).toBe(true)
    expect(isDisabledMonth(new Date(2021, 5, 1))).toBe(true)
    expect(isDisabledMonth(new Date(2021, 6, 1))).toBe(false)
    expect(isDisabledMonth(new Date(2021, 10, 1))).toBe(false)
    expect(isDisabledMonth(new Date(2021, 11, 1))).toBe(true)
    expect(isDisabledMonth(new Date(2022, 11, 1))).toBe(true)
  })

  it('knows if a year is disabled', () => {
    const view = 'year'
    const disabledDates = {
      to: new Date(2021, 6, 15),
      from: new Date(2023, 6, 15),
    }

    ;[app, results] = withSetup(useDisabledDates, disabledDates, { view })

    const { isDisabledYear } = results

    expect(isDisabledYear(new Date(2020, 0, 1))).toBe(true)
    expect(isDisabledYear(new Date(2021, 0, 1))).toBe(false)
    expect(isDisabledYear(new Date(2023, 0, 1))).toBe(false)
    expect(isDisabledYear(new Date(2024, 0, 1))).toBe(true)
  })

  it('knows the earliest possible date', () => {
    let disabledDates
    ;[app, results] = withSetup(useDisabledDates, disabledDates)

    let earliestPossibleDate = results.earliestPossibleDate.value

    expect(earliestPossibleDate).toBeNull()

    disabledDates = {
      to: new Date(2016, 9, 3),
    }
    ;[app, results] = withSetup(useDisabledDates, disabledDates)
    earliestPossibleDate = results.earliestPossibleDate.value

    expect(earliestPossibleDate).toEqual(new Date(2016, 9, 4))
  })

  it('knows the latest possible date', () => {
    let disabledDates
    ;[app, results] = withSetup(useDisabledDates, disabledDates)
    let latestPossibleDate = results.latestPossibleDate.value

    expect(latestPossibleDate).toBeNull()

    disabledDates = {
      from: new Date(2016, 9, 27),
    }
    ;[app, results] = withSetup(useDisabledDates, disabledDates)
    latestPossibleDate = results.latestPossibleDate.value

    expect(latestPossibleDate).toEqual(new Date(2016, 9, 26))
  })

  it('disables the previous button correctly on a `day` view', () => {
    const view = 'day'
    const disabledDates = {
      to: new Date(2016, 9, 15),
    }

    ;[app, results] = withSetup(useDisabledDates, disabledDates, {
      pageDate: new Date(2016, 9, 1),
      view,
    })
    let isPreviousDisabled = results.isPreviousDisabled.value

    expect(isPreviousDisabled).toBe(true)
    ;[app, results] = withSetup(useDisabledDates, disabledDates, {
      pageDate: new Date(2016, 10, 1),
      view,
    })
    isPreviousDisabled = results.isPreviousDisabled.value

    expect(isPreviousDisabled).toBe(false)
  })

  it('disables the previous button correctly on a `month` view', () => {
    const view = 'month'
    const disabledDates = {
      to: new Date(2016, 9, 15),
    }

    ;[app, results] = withSetup(useDisabledDates, disabledDates, {
      pageDate: new Date(2016, 0, 1),
      view,
    })
    let isPreviousDisabled = results.isPreviousDisabled.value

    expect(isPreviousDisabled).toBe(true)
    ;[app, results] = withSetup(useDisabledDates, disabledDates, {
      pageDate: new Date(2017, 0, 1),
      view,
    })
    isPreviousDisabled = results.isPreviousDisabled.value

    expect(isPreviousDisabled).toBe(false)
  })

  it('disables the previous button correctly on a `year` view', () => {
    const view = 'year'
    const disabledDates = {
      to: new Date(2016, 9, 15),
    }

    ;[app, results] = withSetup(useDisabledDates, disabledDates, {
      pageDate: new Date(2010, 0, 1),
      view,
    })
    let isPreviousDisabled = results.isPreviousDisabled.value

    expect(isPreviousDisabled).toBe(true)
    ;[app, results] = withSetup(useDisabledDates, disabledDates, {
      pageDate: new Date(2020, 0, 1),
      view,
    })
    isPreviousDisabled = results.isPreviousDisabled.value

    expect(isPreviousDisabled).toBe(false)
  })

  it('disables the next button correctly on a `day` view', () => {
    const view = 'day'
    const disabledDates = {
      from: new Date(2016, 9, 15),
    }

    ;[app, results] = withSetup(useDisabledDates, disabledDates, {
      pageDate: new Date(2016, 8, 1),
      view,
    })
    let isNextDisabled = results.isNextDisabled.value

    expect(isNextDisabled).toBe(false)
    ;[app, results] = withSetup(useDisabledDates, disabledDates, {
      pageDate: new Date(2016, 9, 1),
      view,
    })
    isNextDisabled = results.isNextDisabled.value

    expect(isNextDisabled).toBe(true)
  })

  it('disables the next button correctly on a `month` view', () => {
    const view = 'month'
    const disabledDates = {
      from: new Date(2016, 9, 15),
    }

    ;[app, results] = withSetup(useDisabledDates, disabledDates, {
      pageDate: new Date(2015, 0, 1),
      view,
    })
    let isNextDisabled = results.isNextDisabled.value

    expect(isNextDisabled).toBe(false)
    ;[app, results] = withSetup(useDisabledDates, disabledDates, {
      pageDate: new Date(2016, 0, 1),
      view,
    })
    isNextDisabled = results.isNextDisabled.value

    expect(isNextDisabled).toBe(true)
  })

  it('disables the next button correctly on a `year` view', () => {
    const view = 'year'
    const disabledDates = {
      from: new Date(2016, 9, 15),
    }

    ;[app, results] = withSetup(useDisabledDates, disabledDates, {
      pageDate: new Date(2000, 0, 1),
      view,
    })
    let isNextDisabled = results.isNextDisabled.value

    expect(isNextDisabled).toBe(false)
    ;[app, results] = withSetup(useDisabledDates, disabledDates, {
      pageDate: new Date(2010, 0, 1),
      view,
    })
    isNextDisabled = results.isNextDisabled.value

    expect(isNextDisabled).toBe(true)
  })
})
