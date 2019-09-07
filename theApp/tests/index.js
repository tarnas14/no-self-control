import test from 'tape';

import {registerGameResult, startSession, getSession, defaultSettings} from '../index'

import {sessionRepo} from './mocks'

const notImplementedYet = assert => {
  assert.fail('NOT IMPLEMENTED YET')
  assert.end()
}

const before = () => sessionRepo.reset()

test('should start session with default HP and 0 games', async assert => {
  before()
  const sessionName = '2v2'

  await startSession({sessionRepo})(sessionName)
  const session = await getSession({sessionRepo})(sessionName)

  assert.equal(session.hp, defaultSettings.hp)
  assert.equal(session.gameCount, 0)

  assert.end()
})

test('should count games when results are registered', async assert => {
  before()
  const sessionName = '2v2'

  await startSession({sessionRepo})(sessionName)

  await registerGameResult({sessionRepo})(sessionName, {win: true})
  await registerGameResult({sessionRepo})(sessionName, {win: false})

  const session = await getSession({sessionRepo})(sessionName)

  assert.equal(session.gameCount, 2)

  assert.end()
})

test('should lose 1HP after 1 loss', async assert => {
  before()
  const sessionName = '2v2'

  await startSession({sessionRepo})(sessionName)

  await registerGameResult({sessionRepo})(sessionName, {win: false})

  const session = await getSession({sessionRepo})(sessionName)

  assert.equal(session.hp, 2)

  assert.end()
})

test('should lose 1HP after 2 losses', async assert => {
  before()
  const sessionName = '2v2'

  await startSession({sessionRepo})(sessionName, {lossesToLoseHP: 2})

  await registerGameResult({sessionRepo})(sessionName, {win: false})
  assert.equal((await getSession({sessionRepo})(sessionName)).hp, 3, 'should still have 3 hp')

  await registerGameResult({sessionRepo})(sessionName, {win: false})
  assert.equal((await getSession({sessionRepo})(sessionName)).hp, 2)

  assert.end()
})

test('should gain 1HP after 2 wins', async assert => {
  before()
  const sessionName = '2v2'

  await startSession({sessionRepo})(sessionName)

  await registerGameResult({sessionRepo})(sessionName, {win: true})
  assert.equal((await getSession({sessionRepo})(sessionName)).hp, 3, 'should still have 3 hp')

  await registerGameResult({sessionRepo})(sessionName, {win: true})
  assert.equal((await getSession({sessionRepo})(sessionName)).hp, 4)

  assert.end()
})

test('should return END_OF_SESSION event after HP reaches 0', async assert => {
  before()
  const sessionName = '2v2'

  await startSession({sessionRepo})(sessionName, {hp: 1})

  const events = await registerGameResult({sessionRepo})(sessionName, {win: false})

  assert.equal(events.length, 1)
  assert.equal(events[0].type, 'END_OF_SESSION')

  assert.equal((await getSession({sessionRepo})(sessionName)).hp, 0, 'should still have 3 hp')

  assert.end()
})

test('should not allow registering results in a session that has ended', async assert => {
  before()

  const sessionName = '2v2'

  await startSession({sessionRepo})(sessionName, {hp: 1})
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

test('should not allow starting two sessions with the same name', notImplementedYet)
test('should not get session that was not started ', notImplementedYet)
