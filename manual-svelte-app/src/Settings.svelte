<script>
  import MdSettings from 'svelte-icons/md/MdSettings.svelte'
  import MdArrowForward from 'svelte-icons/md/MdArrowForward.svelte'

  import RangeInput from './RangeInput.svelte'

  export let settings;
  let show = false;

  const toggle = () => {
    show = !show
  }

  console.log(settings)
</script>

<style>
  .gear {
    cursor: pointer;
    flex-grow: 1;
    width: 30px;
  }

  .icon {
    color: #F8FA90;
  }

  .settings-container {
    position: fixed;
    top: 0;
    bottom: 0;
    right: 0;
    width: 27%;
    background-color: #0A2239;
    padding: 20px;
    color: white;
  }

  .close-settings {
    display: block;
    width: 60px;
    cursor: pointer;
  }

  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1em;
  }

  fieldset {
    padding: 0;
    margin: 0;
    margin-bottom: 1.5em;
    border: 0;
  }
</style>

<em class="icon gear" on:click={toggle}>
  <MdSettings />
</em>
{#if show}
  <div class="settings-container">
    <header>
      <em class="icon close-settings" on:click={toggle}>
        <MdArrowForward />
      </em>
      <h1>Settings</h1>
    </header>
    <form>
      <fieldset name="HP">
        <RangeInput
          bind:value={settings.hp}
          label="HP"
          id="hp"
        />
        <RangeInput
          bind:value={settings.lossesToLoseHP}
          min={1}
          label="losses to lose hp"
          id="lossesToLose"
        />
        <RangeInput
          bind:value={settings.winsToGainHP}
          min={2}
          label="wins to gain hp"
          id="winsToGain"
        />
      </fieldset>
      <fieldset>
        <RangeInput
          bind:value={settings.warmupGames}
          min={0}
          label="warmups"
          id="warmups"
        />
        <RangeInput
          bind:value={settings.maxGames}
          min={0}
          label="maxGames"
          id="maxGames"
        />
        <RangeInput
          bind:value={settings.maxConsecutiveLosses}
          min={0}
          label="maxLosses"
          id="maxLosses"
        />
      </fieldset>
    </form>
  </div>
{/if}
