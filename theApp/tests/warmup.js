import test from 'tape'

import {registerGameResult, startSession, getSession} from '../index'
import {sessionRepo} from './mocks'
import {beforeFactory, assertSessionEnded} from './utils'

const before = beforeFactory(sessionRepo)

export default () => {
  test('should not count warmup games toward HP gain/loss', async assert => {
    before()
    const sessionName = '2v2'

    await startSession({sessionRepo})(sessionName, {
      lossesToLoseHP: 1,
      winsToGainHP: 1,
      warmupGames: 2,
    })

    await registerGameResult({sessionRepo})(sessionName, {win: false})
    assert.equal(
      (await getSession({sessionRepo})(sessionName)).hp,
      3,
      'warmup game, should not count loss',
    )

    await registerGameResult({sessionRepo})(sessionName, {win: true})
    assert.equal(
      (await getSession({sessionRepo})(sessionName)).hp,
      3,
      'warmup game, should not count win',
    )

    await registerGameResult({sessionRepo})(sessionName, {win: false})
    assert.equal(
      (await getSession({sessionRepo})(sessionName)).hp,
      2,
      'not warmup, should count loss',
    )

    await registerGameResult({sessionRepo})(sessionName, {win: true})
    assert.equal(
      (await getSession({sessionRepo})(sessionName)).hp,
      3,
      'not warmup, should count win',
    )

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

    await startSession({sessionRepo})(sessionName, {
      maxGames: 2,
      warmupGames: 2,
    })

    await registerGameResult({sessionRepo})(sessionName, {win: false})
    const events = await registerGameResult({sessionRepo})(sessionName, {
      win: true,
    })

    assertSessionEnded(assert, events)

    assert.end()
  })
}
