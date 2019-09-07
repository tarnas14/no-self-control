import test from 'tape';

import {registerGameResult, startSession, getSession, defaultSettings} from '../index'

import {sessionRepo} from './mocks'

const notImplementedYet = assert => {
  assert.fail('NOT IMPLEMENTED YET')
  assert.end()
}

const noWarmup = (settings = {}) => Object.assign(settings, {warmupGames: 0})

const before = () => sessionRepo.reset()

const assertSessionEnded = (assert, events) => {
  assert.equal(events.length, 1)
  assert.equal(events[0].type, 'END_OF_SESSION')
}

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

test('should lose 1HP after 1 loss', async assert => {
  before()
  const sessionName = '2v2'

  await startSession({sessionRepo})(sessionName, noWarmup())

  await registerGameResult({sessionRepo})(sessionName, {win: false})

  const session = await getSession({sessionRepo})(sessionName)

  assert.equal(session.hp, 2)

  assert.end()
})

test('should lose 1HP after 2 losses', async assert => {
  before()
  const sessionName = '2v2'

  await startSession({sessionRepo})(sessionName, noWarmup({lossesToLoseHP: 2}))

  await registerGameResult({sessionRepo})(sessionName, {win: false})
  assert.equal((await getSession({sessionRepo})(sessionName)).hp, 3, 'should still have 3 hp')

  await registerGameResult({sessionRepo})(sessionName, {win: false})
  assert.equal((await getSession({sessionRepo})(sessionName)).hp, 2)

  assert.end()
})

test('should gain 1HP after 2 wins', async assert => {
  before()
  const sessionName = '2v2'

  await startSession({sessionRepo})(sessionName, noWarmup())

  await registerGameResult({sessionRepo})(sessionName, {win: true})
  assert.equal((await getSession({sessionRepo})(sessionName)).hp, 3, 'should still have 3 hp')

  await registerGameResult({sessionRepo})(sessionName, {win: true})
  assert.equal((await getSession({sessionRepo})(sessionName)).hp, 4)

  assert.end()
})

test('should end session when HP reaches 0', async assert => {
  before()
  const sessionName = '2v2'

  await startSession({sessionRepo})(sessionName, noWarmup({hp: 1}))

  const events = await registerGameResult({sessionRepo})(sessionName, {win: false})

  assertSessionEnded(assert, events)

  assert.equal((await getSession({sessionRepo})(sessionName)).hp, 0, 'should still have 3 hp')

  assert.end()
})

test('should not allow registering results in a session that has ended due to HP reaching 0', async assert => {
  before()

  const sessionName = '2v2'

  await startSession({sessionRepo})(sessionName, noWarmup({hp: 1}))
  await registerGameResult({sessionRepo})(sessionName, {win: false})

  try {
    await registerGameResult({sessionRepo})(sessionName, {win: true})

    assert.fail('should have thrown an error')
  } catch (error) {
    assert.ok(error.domain, 'not domain error')
    assert.equal(error.message, 'You do not have HP to keep playing.', 'wrong error message')
  }

  assert.end()
})

test('should end session when max number of games is reached', async assert => {
  before()
  const sessionName = '2v2'

  await startSession({sessionRepo})(sessionName, noWarmup({maxGames: 2}))
  const firstGameEvents = await registerGameResult({sessionRepo})(sessionName, {win: false})
  const secondGameEvents = await registerGameResult({sessionRepo})(sessionName, {win: false})

  assert.equal(firstGameEvents.length, 0)
  assertSessionEnded(assert, secondGameEvents)

  assert.end()
})

test('should not allow registering results in a session that has ended due to max games', async assert => {
  before()

  const sessionName = '2v2'

  await startSession({sessionRepo})(sessionName, noWarmup({maxGames: 1}))
  await registerGameResult({sessionRepo})(sessionName, {win: false})

  try {
    await registerGameResult({sessionRepo})(sessionName, {win: true})

    assert.fail('should have thrown an error')
  } catch (error) {
    assert.ok(error.domain, 'not domain error')
    assert.equal(error.message, 'You do not have HP to keep playing.', 'wrong error message')
  }

  assert.end()
})

test('should not count warmup games toward HP gain/loss', async assert => {
  before()
  const sessionName = '2v2'

  await startSession({sessionRepo})(sessionName, {lossesToLoseHP: 1, winsToGainHP: 1, warmupGames: 2})

  await registerGameResult({sessionRepo})(sessionName, {win: false})
  assert.equal((await getSession({sessionRepo})(sessionName)).hp, 3, 'warmup game, should not count loss')

  await registerGameResult({sessionRepo})(sessionName, {win: true})
  assert.equal((await getSession({sessionRepo})(sessionName)).hp, 3, 'warmup game, should not count win')

  await registerGameResult({sessionRepo})(sessionName, {win: false})
  assert.equal((await getSession({sessionRepo})(sessionName)).hp, 2, 'not warmup, should count loss')

  await registerGameResult({sessionRepo})(sessionName, {win: true})
  assert.equal((await getSession({sessionRepo})(sessionName)).hp, 3, 'not warmup, should count win')

  assert.end()
})

test('should count warmup games towards total gameCount', async assert => {
  before()
  const sessionName = '2v2'

  await startSession({sessionRepo})(sessionName, {warmupGames: 2})

  await registerGameResult({sessionRepo})(sessionName, {win: false})
  await registerGameResult({sessionRepo})(sessionName, {win: true})

  const session = await getSession({sessionRepo})(sessionName)

  assert.equal(session.gamesCount, 2)

  assert.end()
})

test('should count warmup games towards max games', async assert => {
  before()
  const sessionName = '2v2'

  await startSession({sessionRepo})(sessionName, {maxGames: 2, warmupGames: 2})

  await registerGameResult({sessionRepo})(sessionName, {win: false})
  const events = await registerGameResult({sessionRepo})(sessionName, {win: true})

  assertSessionEnded(assert, events)

  assert.end()
})

test('should not allow starting two sessions with the same name', notImplementedYet)
test('should not get session that was not started ', notImplementedYet)
