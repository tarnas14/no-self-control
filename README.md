# No Self Control App

## The Problem

The basic problem this app solves is tracking of Rocket League gaming sessions.
But can be used with any set of exercises that have win/loss condition.

## Business Logic

* based on settings we track HP of current session. adding wins and losses affects HP
* end of session:
when HP reaches 0 points
or reached maximum number of games
or maximum number of consecutive losses has been reached
* after session has ended it cannot be modified

settings are defined as follows:

```
starting HP (default: 3)
how many warmup games (default: 1)
how many consecutive wins to gain 1HP (default: 2)
how many consecutive losses to lose 1HP (default: 1)
max number of games (default 0, means limit not set)
max number of consecutive losses (default 3)
```

## Technical aim

Make this repo a showcase for clean/hexagonal/ports and adapters architecture.
The app logic is going to be written in pure JS, well tested and stuff.

This will then be used in different actual applications based on different frameworks, with different interfaces.
Hopefully it will

a) work
b) help me lose less MMR on Rocket League ladder
c) prove that you can make a JS application cleanly (y)
