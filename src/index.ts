
interface TimeUnits {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}





setTimeout(() => {
  const numEls = document.querySelectorAll<HTMLElement>('.time-container .digit');
  const dateEl = document.getElementById('date');
  const nextMeeting = findFutureRelativeToNow(new Date('2022-03-27T19:00:00.000Z'));
  if (dateEl) {
    const dateTime = (new Date(nextMeeting)).toDateString();
    dateEl.innerText = dateTime;
  }
  startCountdown(numEls, nextMeeting);
  document.getElementsByTagName('main')[0].classList.add('show');
}, 300);



function startCountdown(numEls: NodeListOf<HTMLElement>, nextMeeting: number) {
  if (numEls.length != 4) {
    throw Error('Missing Time Elements');
  }

  const interval = setInterval(() => displayTime(nextMeeting, numEls, (time) => {
    const {days, hours, minutes, seconds} = time;
    if (   days == 0
        && hours == 0
        && minutes == 0
        && seconds == 0
    ) { clearInterval(interval); }
  }), 1000);
  displayTime(nextMeeting, numEls, null);
}


function displayTime(
  nextMeeting: number,
  numEls: NodeListOf<HTMLElement>,
  cb: null|((timeObj: TimeUnits) => void)
) {
  const relativeTime = getRelativeTime(nextMeeting);
  const {days, hours, minutes, seconds} = relativeTime;
  const [dayEl, hourEl, minuteEl, secondEl] = numEls;

  const zeroHoursLeft   = days == 0       && hours   == 0;
  const zeroMinutesLeft = zeroHoursLeft   && minutes == 0;
  const tenSecondsLeft  = zeroMinutesLeft && seconds <= 10;

  if (days <= 3) {
    toggleElColor(dayEl, 'green');
  }

  if (days <= 1) {
    toggleElColor(dayEl, 'yellow');
  }

  if (days <= 1 && (hours <= 8 || days == 0)) {
    toggleElColor(hourEl, 'green');
    toggleElColor(minuteEl, 'green');
    toggleElColor(secondEl, 'green');
  }

  if (days == 0 && hours <= 12) {
    toggleElColor(dayEl, 'red');
  }

  if (days == 0 && hours <= 8) {
    toggleElColor(hourEl, 'yellow');
  }

  if (zeroHoursLeft) {
    toggleElColor(hourEl, 'red');
    toggleElColor(minuteEl, 'yellow');
  }

  if (zeroMinutesLeft) {
    toggleElColor(minuteEl, 'red');
    toggleElColor(secondEl, 'yellow');
  }

  if (tenSecondsLeft) {
    toggleElColor(secondEl, 'red');
  }

  dayEl.innerText    = days.toString();
  hourEl.innerText   = padNumber(hours);
  minuteEl.innerText = padNumber(minutes);
  secondEl.innerText = padNumber(seconds);

  cb && cb(relativeTime);
}


/**
 * Returns how many milliseconds are between now and
 * the origin date in the future.
 *
 * If the origin is `Sunday at 3:00` then it looks
 * ahead to the next `Sunday at 3:00` **after**
 * `now` and returns how many milliseconds are left.
 */
function findFutureRelativeToNow(originDate: Date) {
  const week = 7 * 24 * 60 * 60 * 1000;
  const now = Date.now();

  for (let i = 1, meetingTime = originDate.getTime();;i++) {
    const nextWeek = meetingTime + (week * i);
    if (now > nextWeek) continue;
    return nextWeek;
  }
}


function getRelativeTime(future: number) {
  const now = Date.now();
  const preciseSeconds = (future - now) / 1000;
  const preciseMinutes = preciseSeconds / 60;
  const preciseHours = preciseMinutes / 60;
  const preciseDays = preciseHours / 24;

  const seconds = Math.floor(preciseMinutes % 1 * 60);
  const minutes = Math.floor(preciseHours % 1 * 60);
  const hours   = Math.floor(preciseDays % 1 * 24);
  const days    = Math.floor(preciseDays);

  return {
    days,
    hours,
    minutes,
    seconds,
  };
}


function toggleElColor(el: HTMLElement, color: 'green'|'yellow'|'red') {
  el.classList.remove('yellow');
  el.classList.remove('green');
  el.classList.remove('red');
  el.classList.add(color);
}


function padNumber(num: number) {
  return (num < 10) ? `0${num}` : `${num}`;
}











