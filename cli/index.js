import vorpal from 'vorpal'
import {
  startSessionFactory,
  registerGameResultFactory,
  getSessionFactory,
} from 'no-self-control'

import inMemorySessionRepo from './inMemorySessionRepo'

const startSession = startSessionFactory({sessionRepo: inMemorySessionRepo})
const registerGameResult = registerGameResultFactory({
  sessionRepo: inMemorySessionRepo,
})
const getSession = getSessionFactory({sessionRepo: inMemorySessionRepo})
const cli = vorpal().delimiter('no-self-control:')

const SESSION_NAME = 'cli session'
const showCurrentState = async () => {
  const session = await getSession(SESSION_NAME)
  cli.log(`HP: ${session.hp} games: ${session.gamesCount}`)
}
const handle = events => {
  events.forEach(event => {
    switch (event.type) {
      case 'END_OF_SESSION':
        cli.log('WHOOPS! this is the end of session, I am afraid, move on')
        break
    }
  })
}
const handleDomainErrors = async action => {
  try {
    await action()
  } catch (error) {
    if (error.domain) {
      switch (error.message) {
        case 'SESSION_ALREADY_ENDED':
          cli.log('this session has already ended, you should move on')
          break
      }
    }
  }
}

cli
  .command('won')
  .alias('win')
  .alias('W')
  .description('you won a game!')
  .action(async function(args, callback) {
    await handleDomainErrors(async () => {
      const events = await registerGameResult(SESSION_NAME, {win: true})

      handle(events)
    })
    await showCurrentState()

    callback()
  })

cli
  .command('lost')
  .alias('lose')
  .alias('L')
  .description('you lost :(')
  .action(async function(args, callback) {
    await handleDomainErrors(async () => {
      const events = await registerGameResult(SESSION_NAME, {win: false})

      handle(events)
    })
    await showCurrentState()

    callback()
  })

const run = async () => {
  await startSession(SESSION_NAME)
  await showCurrentState()
  cli.show()
}

run()
