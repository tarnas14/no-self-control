import test from 'tape'

import {
  registerGameResultFactory,
  startSessionFactory,
  getSessionFactory,
} from '../index'
import {sessionRepo} from './mocks'
import {beforeFactory, assertSessionEnded} from './utils'

const before = beforeFactory(sessionRepo)

const startSession = startSessionFactory({sessionRepo})
const registerGameResult = registerGameResultFactory({sessionRepo})
const getSession = getSessionFactory({sessionRepo})

export default () => {
  test('should not count warmup games toward HP gain/loss', async assert => {
    before()
    const sessionName = '2v2'

    await startSession(sessionName, {
      lossesToLoseHP: 1,
      winsToGainHP: 1,
      warmupGames: 2,
    })

    await registerGameResult(sessionName, {win: false})
    assert.equal(
      (await getSession(sessionName)).hp,
      3,
      'warmup game, should not count loss',
    )

    await registerGameResult(sessionName, {win: true})
    assert.equal(
      (await getSession(sessionName)).hp,
      3,
      'warmup game, should not count win',
    )

    await registerGameResult(sessionName, {win: false})
    assert.equal(
      (await getSession(sessionName)).hp,
      2,
      'not warmup, should count loss',
    )

    await registerGameResult(sessionName, {win: true})
    assert.equal(
      (await getSession(sessionName)).hp,
      3,
      'not warmup, should count win',
    )

    assert.end()
  })

  test('should count warmup games towards total gameCount', async assert => {
    before()
    const sessionName = '2v2'

    await startSession(sessionName, {warmupGames: 2})

    await registerGameResult(sessionName, {win: false})
    await registerGameResult(sessionName, {win: true})

    const session = await getSession(sessionName)

    assert.equal(session.gamesCount, 2)

    assert.end()
  })

  test('should count warmup games towards max games', async assert => {
    before()
    const sessionName = '2v2'

    await startSession(sessionName, {
      maxGames: 2,
      warmupGames: 2,
    })

    await registerGameResult(sessionName, {win: false})
    const events = await registerGameResult(sessionName, {
      win: true,
    })

    assertSessionEnded(assert, events)

    assert.end()
  })
}
