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
  test('should lose 1HP after 1 loss', async assert => {
    before()
    const sessionName = '2v2'

    await startSession(sessionName, noWarmup())

    await registerGameResult(sessionName, {win: false})

    const session = await getSession(sessionName)

    assert.equal(session.hp, 2)

    assert.end()
  })

  test('should lose 1HP after 2 losses', async assert => {
    before()
    const sessionName = '2v2'

    await startSession(sessionName, noWarmup({lossesToLoseHP: 2}))

    await registerGameResult(sessionName, {win: false})
    assert.equal(
      (await getSession(sessionName)).hp,
      3,
      'should still have 3 hp',
    )

    await registerGameResult(sessionName, {win: false})
    assert.equal((await getSession(sessionName)).hp, 2)

    assert.end()
  })

  test('should gain 1HP after 2 consecutive wins', async assert => {
    before()
    const sessionName = '2v2'

    await startSession(sessionName, noWarmup())

    await registerGameResult(sessionName, {win: true})
    assert.equal(
      (await getSession(sessionName)).hp,
      3,
      'should still have 3 hp',
    )

    await registerGameResult(sessionName, {win: true})
    assert.equal((await getSession(sessionName)).hp, 4)

    assert.end()
  })

  test('should not gain 1HP after 2 wins with loss in between', async assert => {
    before()
    const sessionName = '2v2'

    await startSession(sessionName, noWarmup())

    await registerGameResult(sessionName, {win: true})
    assert.equal(
      (await getSession(sessionName)).hp,
      3,
      'should still have 3 hp',
    )

    await registerGameResult(sessionName, {win: false})
    await registerGameResult(sessionName, {win: true})
    assert.equal((await getSession(sessionName)).hp, 2, 'should have lost 1 hp')

    assert.end()
  })
}
