import test from 'tape';

import {registerGameResult, startSession, getSession} from '../index'
import {sessionRepo} from './mocks'
import {beforeFactory, noWarmup, assertSessionEnded} from './utils'

const before = beforeFactory(sessionRepo)

export default () => {
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
}
