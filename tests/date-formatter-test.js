/**
 * @fileoverview Unit test for browser/lib/date-formatter.js
 */
const test = require('ava')
const { getLastUpdated } = require('browser/lib/date-formatter')

test(t => {
  t.throws(
    () => getLastUpdated('invalid argument'),
    'Invalid argument.'
  )
})
