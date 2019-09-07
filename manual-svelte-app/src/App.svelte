<script>
  import {startSessionFactory, getSessionFactory, registerGameResultFactory} from 'no-self-control'
  import Session from './Session.svelte'

  export let name;
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
  const registerGameResult = gameResult => registerGameResultFactory({sessionRepo: svelteRepo})('some name', gameResult)

  async function start() {
    await startSession('some name')
  }
</script>

{#if !sessions.length}
  <button on:click={start}>start</button>
{/if}
{#each sessions as session (session)}
  <Session session={repo[session]} {registerGameResult}/>
{/each}
