/**
 * @fileoverview Formatting date string.
 */

/** @var {Array} */
const monthMapings = [
  'Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'Jun.',
  'Jul.', 'Aug.', 'Sep.', 'Oct.', 'Nov.', 'Dec.',
];

/**
 * @description Return date string. For example, 'Sep.9, 2016 12:00'.
 * @param {Date}
 * @return {string}
 */
export function getLastUpdated(date) {
  if (!(date instanceof Date)) {
    throw Error('Invalid argument. Only instance of Date Object');
  }

  const year = date.getFullYear();
  const month = monthMapings[date.getMonth()];
  const day = date.getDate();
  let hour = date.getHours();
  let minute = date.getMinutes();

  if (hour < 10) {
    hour = `0${hour}`;
  }

  if (minute < 10) {
    minute = `0${minute}`;
  }

  return `${month}${day}, ${year} ${hour}:${minute}`;
}
