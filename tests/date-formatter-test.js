/**
 * @fileoverview Unit test for browser/lib/date-formatter.js
 */
const test = require('ava')
const { getLastUpdated } = require('browser/lib/date-formatter')

/**
 * @description Get local Date insance.
 * @param {numbr} year
 * @param {number} month
 * @param {number} day
 * @param {number} hour
 * @param {number} minute
 * @param {number} second
 * @return {Date}
 */
function generateLocalDate(year, month, day, hour, minute, second) {
  const date = new Date()
  date.setDate(day)
  date.setFullYear(year)
  date.setHours(hour)
  date.setMinutes(minute)
  date.setMonth(month - 1)
  date.setSeconds(second)
  return date
}

test(t => {
  const testCases = [
    [generateLocalDate(2016, 9, 9, 12, 0, 0), 'Sep.9, 2016 12:00'],
    [generateLocalDate(2016, 9, 9, 2, 0, 0), 'Sep.9, 2016 02:00'],
    [generateLocalDate(2016, 5, 9, 2, 1, 0), 'May9, 2016 02:01'],
  ]

  for (let testCase of testCases) {
    t.is(testCase[1], getLastUpdated(testCase[0]))
  }
})

test(t => {
  t.throws(
    () => getLastUpdated('invalid argument'),
    'Invalid argument. Only instance of Date Object'
  )
})
