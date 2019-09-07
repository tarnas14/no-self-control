export const notImplementedYet = assert => {
  assert.fail('NOT IMPLEMENTED YET')
  assert.end()
}

export const noWarmup = (settings = {}) => Object.assign(settings, {warmupGames: 0})

export const beforeFactory = sessionRepo => () => sessionRepo.reset()

export const assertSessionEnded = (assert, events) => {
  assert.equal(events.length, 1)
  assert.equal(events[0].type, 'END_OF_SESSION')
}

