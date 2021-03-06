import test from 'tape'

import {
  registerGameResultFactory,
  startSessionFactory,
  getSessionFactory,
  defaultSettings,
} from '../index'
import {sessionRepo} from './mocks'
import {
  notImplementedYet,
  noWarmup,
  beforeFactory,
  assertSessionEnded,
} from './utils'
import warmupTests from './warmup'
import hpCountingTests from './hpCounting'
import sessionEndConditionsTests from './sessionEndConditions'

const before = beforeFactory(sessionRepo)

const startSession = startSessionFactory({sessionRepo})
const registerGameResult = registerGameResultFactory({sessionRepo})
const getSession = getSessionFactory({sessionRepo})

test('should start session with default HP and 0 games', async assert => {
  before()
  const sessionName = '2v2'

  await startSession(sessionName, noWarmup())
  const session = await getSession(sessionName)

  assert.equal(session.hp, defaultSettings.hp)
  assert.equal(session.gamesCount, 0)

  assert.end()
})

test('should count games when results are registered', async assert => {
  before()
  const sessionName = '2v2'

  await startSession(sessionName, noWarmup())

  await registerGameResult(sessionName, {win: true})
  await registerGameResult(sessionName, {win: false})

  const session = await getSession(sessionName)

  assert.equal(session.gamesCount, 2)

  assert.end()
})

test('should not allow starting two sessions with the same name', async assert => {
  before()
  const sessionName = '2v2'

  await startSession(sessionName, noWarmup())
  try {
    await startSession(sessionName, noWarmup())

    assert.fail('should have thrown error')
  } catch (error) {
    assert.ok(error.domain)
    assert.ok(error.message, 'SESSION_ALREADY_EXISTS')
  }

  assert.end()
})

test('should not get session that was not started ', async assert => {
  before()
  const sessionName = '2v2'

  try {
    await getSession(sessionName)

    assert.fail('should have thrown error')
  } catch (error) {
    assert.ok(error.domain)
    assert.ok(error.message, 'SESSION_DOES_NOT_EXIST')
  }

  assert.end()
})

test('should not allow registering results for session that does not exist', async assert => {
  before()
  const sessionName = '2v2'

  try {
    await registerGameResult(sessionName, {win: false})

    assert.fail('should have thrown error')
  } catch (error) {
    assert.ok(error.domain)
    assert.ok(error.message, 'SESSION_DOES_NOT_EXIST')
  }

  assert.end()
})

warmupTests()
hpCountingTests()
sessionEndConditionsTests()
