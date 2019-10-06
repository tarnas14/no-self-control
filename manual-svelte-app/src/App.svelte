<script>
  import {ERRORS, defaultSettings, startSessionFactory, getSessionFactory, registerGameResultFactory} from 'no-self-control'

  import Session from './Session.svelte'
  import Settings from './Settings.svelte'

  const settings = {...defaultSettings}

  const TRANSLATE = {
    [ERRORS.SESSION_ALREADY_EXISTS]: 'Session with this name already exists, mate',
  }

  let form = {
    name: '2v2',
    error: ''
  }
  let repo = {}
  $: sessions = Object.keys(repo)

  const svelteRepo = {
    save: session => {
      repo = {...repo, [session.name]: session}
    },
    get: sessionName => repo[sessionName]
  }

  const startSession = startSessionFactory({sessionRepo: svelteRepo})
  const getSession = getSessionFactory({sessionRepo: svelteRepo})
  const registerGameResult = (sessionName, gameResult) => registerGameResultFactory({sessionRepo: svelteRepo})(sessionName, gameResult)

  async function handleSessionStart() {
    try {
      await startSession(form.name, settings)
      form = {name: '', error: ''}
    } catch (error) {
      form.error = TRANSLATE[error.message]
    }
  }

  function clearError() {
    form.error = ''
  }

</script>

<style>
  :global(body) {
    background-color: #424874;
  }

  .App {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    grid-template-rows: 50px 30px repeat(3, 1fr);
    grid-column-gap: 5px;
    grid-row-gap: 5px;

    width: 1000px;
    margin: 20px auto;
  }

  .session-starter {
    grid-row: 1 / 2;
    grid-column: 2 / -2;

    display: flex;
    justify-content: center;
  }

  #sessionName {
    flex-grow: 8;
    margin-bottom: 0;
  }

  .validation-errors {
    grid-row: 2 / 3;
    grid-column: 2 / -2;
    text-align: center;
    color: red;
  }
</style>

<div class="App">
  <form
    class="session-starter"
    on:submit|preventDefault={handleSessionStart}
  >
    <input
      placeholder="session name here"
      id="sessionName"
      bind:value={form.name}
      on:input={clearError}
      />
    <Settings {settings} />
  </form>
  <div class="validation-errors">
    {form.error}
  </div>

  {#each sessions as session (session)}
    <Session session={repo[session]} registerGameResult={gameResult => registerGameResult(session, gameResult)}/>
  {/each}
</div>
