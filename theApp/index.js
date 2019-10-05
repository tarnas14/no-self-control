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

export const ERRORS = {
  SESSION_ALREADY_EXISTS: 'SESSION_ALREADY_EXISTS',
  SESSION_DOES_NOT_EXIST: 'SESSION_DOES_NOT_EXIST',
  SESSION_ALREADY_ENDED: 'SESSION_ALREADY_ENDED',
}

export const EVENTS = {
  WARMUP_FINISHED: 'WARMUP_FINISHED',
  WARMUP: 'WARMUP',
  END_OF_SESSION: 'END_OF_SESSION',
}

export const startSessionFactory = ({sessionRepo}) => async (
  sessionName,
  settings,
) => {
  const sessionSettings = Object.assign({}, defaultSettings, settings)

  const sessionWithName = await sessionRepo.get(sessionName)

  if (sessionWithName) {
    throw new DomainError(ERRORS.SESSION_ALREADY_EXISTS)
  }

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

const sessionEnded = session =>
  session.hp === 0 ||
  (session.settings.maxGames &&
    session.gamesCount === session.settings.maxGames) ||
  (session.settings.maxConsecutiveLosses > 0 &&
    session.games.length >= session.settings.maxConsecutiveLosses &&
    session.games
      .slice(0, session.settings.maxConsecutiveLosses)
      .every(({win}) => !win))

const warmingUp = session => session.warmups < session.settings.warmupGames

const takeWhile = (predicate, array) => {
  const [head, ...tail] = array

  if (array.length === 0) {
    return []
  }

  if (predicate(head)) {
    return [head, ...takeWhile(predicate, tail)]
  }

  return []
}

const currentWinStreak = session =>
  takeWhile(({win}) => win, session.games.filter(({warmup}) => !warmup))
const currentLossStreak = session =>
  takeWhile(({win}) => !win, session.games.filter(({warmup}) => !warmup))

export const registerGameResultFactory = ({sessionRepo}) => async (
  sessionName,
  gameInfo,
) => {
  const session = await sessionRepo.get(sessionName)

  if (!session) {
    throw new DomainError(ERRORS.SESSION_DOES_NOT_EXIST)
  }

  const game = Object.assign({}, gameInfo)

  if (sessionEnded(session)) {
    throw new DomainError(ERRORS.SESSION_ALREADY_ENDED)
  }

  const {settings} = session
  const events = []

  if (warmingUp(session)) {
    game.warmup = true
  }

  session.games = [game, ...session.games]

  if (game.warmup && !warmingUp(session)) {
    events.push({type: EVENTS.WARMUP_FINISHED})
  }

  if (game.warmup && warmingUp(session)) {
    events.push({type: EVENTS.WARMUP})
  }

  if (!game.warmup) {
    if (game.win) {
      const winStreak = currentWinStreak(session)

      if (winStreak.length % settings.winsToGainHP === 0) {
        session.hp += 1
      }
    }

    if (!game.win) {
      const lossStreak = currentLossStreak(session)

      if (lossStreak.length % settings.lossesToLoseHP === 0) {
        session.hp -= 1
      }
    }
  }

  if (sessionEnded(session)) {
    events.push({type: EVENTS.END_OF_SESSION})
  }

  await sessionRepo.save(session)

  return events
}

export const getSessionFactory = ({sessionRepo}) => async sessionName => {
  const session = sessionRepo.get(sessionName)

  if (!session) {
    throw new DomainError(ERRORS.SESSION_DOES_NOT_EXIST)
  }

  return session
}
