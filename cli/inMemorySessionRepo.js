let store = {}

export default {
  save: session => {
    store[session.name] = session
  },
  get: sessionName => store[sessionName],
}
