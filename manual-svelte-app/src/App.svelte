<script>
  import {startSessionFactory, getSessionFactory, registerGameResultFactory} from 'no-self-control'
  import Session from './Session.svelte'

  let name = 'session'
  let sessionError = ''
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

  async function start() {
    try {
      await startSession(name)
      name = ''
      sessionError = ''
    } catch (error) {
      console.log(error.message)
      sessionError = error.message
    }
  }
</script>

<style>
  .App {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    grid-template-rows: 50px 30px repeat(3, 1fr);

    width: 1000px;
    margin: 20px auto;
  }

  .session-starter {
    grid-row: 1 / 2;
    grid-column: 2 / -2;

    display: flex;
    justify-content: center;
  }

  .validation-errors {
    grid-row: 2 / 3;
    grid-column: 2 / -2;
    text-align: center;
  }
</style>

<div class="App">
  <div class="session-starter">
    <input bind:value={name}/>
    <button on:click={start}>start</button>
  </div>
  <div class="validation-errors">
    {sessionError}
  </div>

  {#each sessions as session (session)}
    <Session session={repo[session]} registerGameResult={gameResult => registerGameResult(session, gameResult)}/>
  {/each}
</div>
