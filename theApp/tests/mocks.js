let thing = {}

export const sessionRepo = {
  save: session => {
    thing[session.name] = session
  },
  get: sessionName => thing[sessionName],
  reset: () => {
    thing = {}
  },
}
