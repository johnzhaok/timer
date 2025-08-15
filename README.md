# timer
A simple workout timer.

Still a work in progress.

This timer is tailer made for my kettlebell-focused program that uses exclusively EMOM (every minute on the minute) and AMRAP (as many reps as possible) workouts.

I decided to build this after trialing multiple workout timers in the app store that, to me, were either too bloated with extra features I would never use or had settings adjustments that were too cumbersome to use quickly on touchscreen devices. I wanted something that prioritized the timers that I use most with minimal clutter and could be adjusted with just simple taps on the screen.

Note that this timer uses JavaScript's built in timing events that are not particularly accurate, especially over longer times. I compensate for this by checking against the system clock for time drift and adjusting accordingly. From my testing, this keeps the timer accurate to within a second over the course of a 10 minute timer, which is good enough for my needs, but the timer's precision is not perfect by any means.
