import test from 'tape';

import {registerGameResult, startSession, getSession} from '../index'
import {sessionRepo} from './mocks'
import {beforeFactory, noWarmup, assertSessionEnded} from './utils'

const before = beforeFactory(sessionRepo)

export default () => {
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
}
