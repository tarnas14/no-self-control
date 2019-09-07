export const defaultSettings = {
  hp: 3,
  lossesToLoseHP: 1,
  winsToGainHP: 2,
}

class DomainError extends Error {
  constructor(message) {
    super(message)
    this.domain = true
  }
}

export const startSession = ({sessionRepo}) => (sessionName, settings) => {
  const sessionSettings = Object.assign({}, defaultSettings, settings)

  const newSession = {
    name: sessionName,
    hp: sessionSettings.hp,
    get gameCount() {
      return this.wins + this.losses
    },
    wins: 0,
    losses: 0,
    settings: sessionSettings,
  }

  return sessionRepo.save(newSession)
}

export const registerGameResult = ({sessionRepo}) => async (sessionName, gameInfo) => {
  const session = await sessionRepo.get(sessionName)

  if (session.hp === 0) {
    throw new DomainError('You do not have HP to keep playing.')
  }

  const {settings} = session
  const events = []

  if (gameInfo.win) {
    session.wins += 1

    if (session.wins % settings.winsToGainHP === 0) {
      session.hp += 1
    }
  } else {
    session.losses += 1

    if (session.losses % settings.lossesToLoseHP === 0) {
      session.hp -= 1
    }
  }

  if (session.hp === 0) {
    events.push({type: 'END_OF_SESSION'})
  }

  await sessionRepo.save(session)

  return events
}

export const getSession = ({sessionRepo}) => sessionName => sessionRepo.get(sessionName)
