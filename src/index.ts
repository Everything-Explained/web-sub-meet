
interface TimeUnits {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}







// Default date: 2022-03-27T19:00:00.000Z
const _originDate   = Date.UTC(2022, 2, 27, 19);
const _countdownEl  = document.getElementsByClassName('countdown')[0] as HTMLElement|undefined;
const _mainEl       = document.getElementsByClassName('main')[0];
const _legendEl     = document.getElementsByClassName('legend')[0] as HTMLElement;
const _legendIconEl = document.getElementsByClassName('legend__icon')[0] as HTMLElement;
const numEls        = document.querySelectorAll<HTMLElement>('.countdown__numbers .countdown__number');
const dateEl        = document.getElementsByClassName('countdown__date')[0] as HTMLElement;
const nextMeeting   = findFutureRelativeToNow(new Date(_originDate));

if (!_legendIconEl) throw Error('Missing Legend Icon Element');

if (dateEl) {
  const locale = Intl.NumberFormat().resolvedOptions().locale;
  const dateTime = new Intl.DateTimeFormat(locale, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  }).format(nextMeeting);
  dateEl.innerText = dateTime;
}
startCountdown(numEls, nextMeeting);
if (!_mainEl) throw Error('Missing Main Element');
setTimeout(() => {
  _mainEl.classList.add('--show');

  _legendIconEl.addEventListener('click', () => {
    if (!_legendEl) throw Error('Missing Legend Element');
    if (!_countdownEl) throw Error('Missing Countdown Element');

    if (_legendEl.classList.contains('--show')) {
      _legendEl.classList.remove('--show');
      _countdownEl.classList.add('--show');
      _legendIconEl.classList.remove('--animate');
      return;
    }

    _countdownEl.classList.remove('--show');
    _legendEl.classList.add('--show');
    _legendIconEl.classList.add('--animate');
  });
}, 500);







function startCountdown(numEls: NodeListOf<HTMLElement>, nextMeeting: number) {
  if (numEls.length != 4) {
    throw Error('Missing Time Elements');
  }

  if (!_countdownEl) throw Error('Missing Countdown Element');

  const interval = setInterval(() => {
    const hoursFromLastMeeting = findHoursFromLastWeek(nextMeeting);

    if (hoursFromLastMeeting <= 1.30) {
      displayState('started');
      return;
    }

    if (hoursFromLastMeeting <= 4.3) {
      displayState('ended');
      return;
    }

    displayTime(nextMeeting, numEls, (time) => {
      const {days, hours, minutes, seconds} = time;
      if (   days == 0
          && hours == 0
          && minutes == 0
          && seconds == 0
      ) {
        clearInterval(interval);
        setTimeout(() => {
          startCountdown(numEls, findFutureRelativeToNow(new Date(_originDate)));
        }, 1100);
      }
    });

    if (_legendEl.classList.contains('--show')) return;
    if (_countdownEl.classList.contains('--show')) return;

    displayState('countdown');
    _countdownEl.classList.add('--show');
  }, 1000);
}


function displayState(state: 'countdown'|'started'|'ended') {
  const [startedEl, endedEl] = document.getElementsByClassName('session__state') as HTMLCollectionOf<HTMLElement>;

  if (!startedEl || !endedEl) throw Error('Missing Start/End Session Elements');
  if (!_countdownEl)          throw Error('Missing Countdown Element');

  if (state == 'started') {
    _countdownEl.classList.remove('--show');
    startedEl.classList.add('--show');
    setTimeout(() => startedEl.classList.add('--animate'), 720);
  }

  if (state == 'ended') {
    startedEl.classList.remove('--animate');
    startedEl.classList.remove('--show');
    endedEl.classList.add('--show');
    setTimeout(() => endedEl.classList.add('--animate'), 720);
  }

  if (state == 'countdown') {
    endedEl.classList.remove('--animate');
    endedEl.classList.remove('--show');
  }
}


function findHoursFromLastWeek(nextWeek: number) {
  const week = 7 * 24 * 60 * 60 * 1000;
  return (week - (nextWeek - Date.now())) / 1000 / 60 / 60;
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











