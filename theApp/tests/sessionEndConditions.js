import test from 'tape'

import {
  registerGameResultFactory,
  startSessionFactory,
  getSessionFactory,
} from '../index'
import {sessionRepo} from './mocks'
import {beforeFactory, noWarmup, assertSessionEnded} from './utils'

const before = beforeFactory(sessionRepo)

const startSession = startSessionFactory({sessionRepo})
const registerGameResult = registerGameResultFactory({sessionRepo})
const getSession = getSessionFactory({sessionRepo})

export default () => {
  test('should end session when HP reaches 0', async assert => {
    before()
    const sessionName = '2v2'

    await startSession(sessionName, noWarmup({hp: 1}))

    const events = await registerGameResult(sessionName, {
      win: false,
    })

    assertSessionEnded(assert, events)

    assert.equal(
      (await getSession(sessionName)).hp,
      0,
      'should still have 3 hp',
    )

    assert.end()
  })

  test('should not allow registering results in a session that has ended due to HP reaching 0', async assert => {
    before()

    const sessionName = '2v2'

    await startSession(sessionName, noWarmup({hp: 1}))
    await registerGameResult(sessionName, {win: false})

    try {
      await registerGameResult(sessionName, {win: true})

      assert.fail('should have thrown an error')
    } catch (error) {
      assert.ok(error.domain, 'not domain error')
      assert.equal(
        error.message,
        'SESSION_ALREADY_ENDED',
        'wrong error message',
      )
    }

    assert.end()
  })

  test('should end session when max number of games is reached', async assert => {
    before()
    const sessionName = '2v2'

    await startSession(sessionName, noWarmup({maxGames: 2}))
    const firstGameEvents = await registerGameResult(sessionName, {win: false})
    const secondGameEvents = await registerGameResult(sessionName, {win: false})

    assert.equal(firstGameEvents.length, 0)
    assertSessionEnded(assert, secondGameEvents)

    assert.end()
  })

  test('should not allow registering results in a session that has ended due to max games', async assert => {
    before()
    const sessionName = '2v2'

    await startSession(sessionName, noWarmup({maxGames: 1}))
    await registerGameResult(sessionName, {win: false})

    try {
      await registerGameResult(sessionName, {win: true})

      assert.fail('should have thrown an error')
    } catch (error) {
      assert.ok(error.domain, 'not domain error')
      assert.equal(
        error.message,
        'SESSION_ALREADY_ENDED',
        'wrong error message',
      )
    }

    assert.end()
  })

  test('should end session when max consecutive losses was reached', async assert => {
    before()
    const sessionName = '2v2'

    await startSession(sessionName, noWarmup({maxConsecutiveLosses: 2, hp: 5}))
    await registerGameResult(sessionName, {win: false})
    const events = await registerGameResult(sessionName, {
      win: false,
    })

    assertSessionEnded(assert, events)

    assert.end()
  })
}
