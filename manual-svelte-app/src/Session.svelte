<script>
  export let session
  export let registerGameResult
  let warmingUp = true
  let finished = false

  function handle(events) {
    events.forEach(event => {
      switch(event.type) {
        case 'WARMUP_FINISHED':
          warmingUp = false
          break
        case 'END_OF_SESSION':
          finished = true
          break
      }
    })
  }

  async function win() {
    const events = await registerGameResult({win: true})

    handle(events)
  }

  async function loss() {
    const events = await registerGameResult({win: false})

    handle(events)
  }
</script>

<p>{session.name}</p>
<p>HP: {session.hp}</p>
<p>games: {session.gamesCount}</p>
{#if warmingUp}
  <p>relax, this is still warmup</p>
{:else finished !finished}
  <p>THE GAME IS AFOOT</p>
{:else if finished}
  <p>you're done, mate</p>
{/if}
<button disabled={finished} on:click={win}>WIN</button>
<button disabled={finished} on:click={loss}>LOSS</button>
