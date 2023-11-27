import useHighlighted from '~/composables/useHighlighted'
import useDateUtils from '~/composables/useDateUtils'
import makeCellUtils from '~/utils/cellUtils'
import { withSetup } from '../../withSetup'
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import type { DisabledConfig } from '@/types'

describe('useHighlighted', () => {
  let app
  let results
  const utils = makeCellUtils(useDateUtils(false))

  afterEach(() => {
    app.unmount()
  })

  it('only highlights dates when provided with a highlighted prop', () => {
    ;[app, results] = withSetup(useHighlighted)

    const { isHighlightedDate } = results

    expect(isHighlightedDate(new Date(2016, 9, 3))).toBe(false)
  })

  it('highlights dates to a given date', () => {
    const highlighted: DisabledConfig = {
      to: new Date(2021, 9, 13),
    }

    ;[app, results] = withSetup(useHighlighted, highlighted, { utils })

    const { isHighlightedDate } = results

    expect(isHighlightedDate(new Date(2021, 9, 13))).toBe(true)
    expect(isHighlightedDate(new Date(2021, 9, 14))).toBe(false)
  })

  it('highlights dates from a given date', () => {
    const highlighted: DisabledConfig = {
      from: new Date(2021, 9, 13),
    }

    ;[app, results] = withSetup(useHighlighted, highlighted, { utils })

    const { isHighlightedDate } = results

    expect(isHighlightedDate(new Date(2021, 9, 12))).toBe(false)
    expect(isHighlightedDate(new Date(2021, 9, 13))).toBe(true)
  })

  it('highlights an array of individual dates', () => {
    const highlighted: DisabledConfig = {
      dates: [new Date(2016, 9, 4), new Date(2016, 9, 6)],
    }

    ;[app, results] = withSetup(useHighlighted, highlighted, { utils })

    const { isHighlightedDate } = results

    expect(isHighlightedDate(new Date(2016, 9, 3))).toBe(false)
    expect(isHighlightedDate(new Date(2016, 9, 4))).toBe(true)
    expect(isHighlightedDate(new Date(2016, 9, 5))).toBe(false)
    expect(isHighlightedDate(new Date(2016, 9, 6))).toBe(true)
    expect(isHighlightedDate(new Date(2016, 9, 7))).toBe(false)
  })

  it('highlights an array of date ranges', () => {
    const highlighted: DisabledConfig = {
      ranges: [
        {
          from: new Date(2016, 9, 4),
          to: new Date(2016, 9, 8),
        },
      ],
    }

    ;[app, results] = withSetup(useHighlighted, highlighted, { utils })

    const { isHighlightedDate } = results

    expect(isHighlightedDate(new Date(2016, 9, 3))).toBe(false)
    expect(isHighlightedDate(new Date(2016, 9, 4))).toBe(true)
    expect(isHighlightedDate(new Date(2016, 9, 8))).toBe(true)
    expect(isHighlightedDate(new Date(2016, 9, 9))).toBe(false)
  })

  it('highlights an array of days of the week', async () => {
    const highlighted: DisabledConfig = {
      days: [6, 0],
    }

    ;[app, results] = withSetup(useHighlighted, highlighted, { utils })

    const { isHighlightedDate } = results

    expect(isHighlightedDate(new Date(2016, 9, 2))).toBe(true)
    expect(isHighlightedDate(new Date(2016, 9, 3))).toBe(false)
  })

  it('highlights an array of days of the month', async () => {
    const highlighted: DisabledConfig = {
      daysOfMonth: [29, 30, 31],
    }

    ;[app, results] = withSetup(useHighlighted, highlighted, { utils })

    const { isHighlightedDate } = results

    expect(isHighlightedDate(new Date(2016, 8, 29))).toBe(true)
    expect(isHighlightedDate(new Date(2016, 9, 31))).toBe(true)
    expect(isHighlightedDate(new Date(2016, 10, 30))).toBe(true)
    expect(isHighlightedDate(new Date(2016, 9, 11))).toBe(false)
  })

  it('highlights dates via a customPredictor function', async () => {
    const highlighted: DisabledConfig = {
      customPredictor(date: Date) {
        return date.getDate() % 4 === 0
      },
    }

    ;[app, results] = withSetup(useHighlighted, highlighted, { utils })

    const { isHighlightedDate } = results

    expect(isHighlightedDate(new Date(2016, 8, 29))).toBe(false)
    expect(isHighlightedDate(new Date(2016, 9, 28))).toBe(true)
    expect(isHighlightedDate(new Date(2016, 10, 24))).toBe(true)
    expect(isHighlightedDate(new Date(2016, 9, 11))).toBe(false)
  })

  it('does not highlight a disabled date unless configured to do so', async () => {
    const disabledDate = new Date(2016, 11, 5)
    const highlightToDate = new Date(2016, 11, 8)

    const disabledDates: DisabledConfig = {
      dates: [disabledDate],
    }
    let highlighted: DisabledConfig = {
      to: highlightToDate,
    }

    ;[app, results] = withSetup(useHighlighted, highlighted, {
      utils,
      disabledDates,
    })

    let { isHighlightedDate } = results

    expect(isHighlightedDate(disabledDate)).toBe(false)

    highlighted = {
      includeDisabled: true,
      to: highlightToDate,
    }
    ;[app, results] = withSetup(useHighlighted, highlighted, {
      utils,
      disabledDates,
    })

    isHighlightedDate = results.isHighlightedDate

    expect(isHighlightedDate(disabledDate)).toBe(true)
  })

  it('detects the first date of a highlighted range', async () => {
    ;[app, results] = withSetup(useHighlighted)
    let { isHighlightStart } = results

    expect(isHighlightStart(new Date(2016, 11, 4))).toBe(false)

    const highlighted: DisabledConfig = {
      ranges: [
        {
          from: new Date(2016, 11, 4),
          to: new Date(2016, 11, 8),
        },
      ],
    }

    ;[app, results] = withSetup(useHighlighted, highlighted, {
      utils,
    })
    isHighlightStart = results.isHighlightStart

    expect(isHighlightStart(new Date(2016, 11, 3))).toBe(false)
    expect(isHighlightStart(new Date(2016, 11, 4))).toBe(true)
    expect(isHighlightStart(new Date(2016, 11, 5))).toBe(false)
  })

  it('detects the last date of a highlighted range', async () => {
    ;[app, results] = withSetup(useHighlighted)
    let { isHighlightEnd } = results

    expect(isHighlightEnd(new Date(2016, 11, 8))).toBe(false)

    const highlighted: DisabledConfig = {
      ranges: [
        {
          from: new Date(2016, 11, 4),
          to: new Date(2016, 11, 8),
        },
      ],
    }

    ;[app, results] = withSetup(useHighlighted, highlighted, {
      utils,
    })
    isHighlightEnd = results.isHighlightEnd

    expect(isHighlightEnd(new Date(2016, 11, 7))).toBe(false)
    expect(isHighlightEnd(new Date(2016, 11, 8))).toBe(true)
    expect(isHighlightEnd(new Date(2016, 11, 9))).toBe(false)
  })
})
