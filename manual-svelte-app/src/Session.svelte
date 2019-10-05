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

<style>
  .Session {
    grid-column: span 2;
    grid-row: span 3;

    background-color: #88D9E6;
    border-radius: 3px;
    text-align: center;
    color: #424874;
  }

  .Session.finished {
    opacity: .5;
  }

  p {
    font-size: 1.3em;
  }

  em {
    display: block;
    margin-bottom: 1em;
  }

  h3 + hr {
    width: 75%;
    border-color: #424874;
    border-bottom: 0;
  }

  button {
    border: 0;
    font-weight: bold;
    padding: .5em 1em;
    letter-spacing: 2px;
    width: 25%;
  }

  .win {
    background-color: #2EC4B6;
    color: #CCFF66;
  }

  .loss {
    background-color: #FF6666;
    color: white;
  }

  .hp {
    font-weight: bold;
    font-size: 1.4rem;
  }
</style>

<div class="Session {finished ? 'finished' : ''}">
  <h3>{session.name}</h3>
  <hr />
  <p>HP: <span class="hp">{session.hp}</span></p>
  <p>games: {session.gamesCount}{finished ? ` (${session.wins}/${session.losses})` : ''}</p>
  <em>
    {#if warmingUp}
      relax, this is still warmup
    {:else if !finished}
      THE GAME IS AFOOT
    {:else if finished}
      you're done, mate
    {/if}
  </em>
  <button class="win" disabled={finished} on:click={win}>WIN</button>
  <button class="loss" disabled={finished} on:click={loss}>LOSS</button>
</div>
