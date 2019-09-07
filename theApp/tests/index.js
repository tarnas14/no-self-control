import test from 'tape';

import {registerGameResult, startSession, getSession, defaultSettings} from '../index'
import {sessionRepo} from './mocks'
import {notImplementedYet, noWarmup, beforeFactory, assertSessionEnded} from './utils'
import warmupTests from './warmup'
import hpCountingTests from './hpCounting'
import sessionEndConditionsTests from './sessionEndConditions'

const before = beforeFactory(sessionRepo)

warmupTests()
hpCountingTests()
sessionEndConditionsTests()

test('should start session with default HP and 0 games', async assert => {
  before()
  const sessionName = '2v2'

  await startSession({sessionRepo})(sessionName, noWarmup())
  const session = await getSession({sessionRepo})(sessionName)

  assert.equal(session.hp, defaultSettings.hp)
  assert.equal(session.gamesCount, 0)

  assert.end()
})

test('should count games when results are registered', async assert => {
  before()
  const sessionName = '2v2'

  await startSession({sessionRepo})(sessionName, noWarmup())

  await registerGameResult({sessionRepo})(sessionName, {win: true})
  await registerGameResult({sessionRepo})(sessionName, {win: false})

  const session = await getSession({sessionRepo})(sessionName)

  assert.equal(session.gamesCount, 2)

  assert.end()
})

test('should not allow starting two sessions with the same name', notImplementedYet)
test('should not get session that was not started ', notImplementedYet)
test('should not allow registering results for session that was not started', notImplementedYet)
test('should end session when max consecutive losses was reached', notImplementedYet)
