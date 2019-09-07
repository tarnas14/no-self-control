export const defaultSettings = {
  hp: 3,
  lossesToLoseHP: 1,
  winsToGainHP: 2,
  warmupGames: 1,
  maxGames: 0,
  maxConsecutiveLosses: 0,
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
    games: [],
    get warmups() {
      return this.games.filter(({warmup}) => warmup).length
    },
    get wins() {
      return this.games.filter(({win}) => win).length
    },
    get losses() {
      return this.games.filter(({win}) => !win).length
    },
    get gamesCount() {
      return this.wins + this.losses
    },
    settings: sessionSettings,
  }

  return sessionRepo.save(newSession)
}

const sessionEnded = session => session.hp === 0
  || (session.settings.maxGames && session.gamesCount === session.settings.maxGames)
  || (session.settings.maxConsecutiveLosses > 0
    && session.games.length >= session.settings.maxConsecutiveLosses
    && session.games.slice(0, session.settings.maxConsecutiveLosses).every(({win}) => !win))

const warmingUp = session => session.warmups < session.settings.warmupGames

export const registerGameResult = ({sessionRepo}) => async (sessionName, gameInfo) => {
  const session = await sessionRepo.get(sessionName)
  const game = Object.assign({}, gameInfo)

  if (sessionEnded(session)) {
    throw new DomainError('SESSION_ALREADY_ENDED')
  }

  const {settings} = session
  const events = []

  if (warmingUp(session)) {
    game.warmup = true
  }

  session.games = [game, ...session.games]

  if (!game.warmup) {
    if (game.win && session.wins % settings.winsToGainHP === 0) {
      session.hp += 1
    }

    if (!game.win && session.losses % settings.lossesToLoseHP === 0) {
      session.hp -= 1
    }
  }

  if (sessionEnded(session)) {
    events.push({type: 'END_OF_SESSION'})
  }

  await sessionRepo.save(session)

  return events
}

export const getSession = ({sessionRepo}) => sessionName => sessionRepo.get(sessionName)
