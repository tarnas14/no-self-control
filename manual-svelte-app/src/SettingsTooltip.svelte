<script>
  import MdSettings from 'svelte-icons/md/MdSettings.svelte'
  import {onMount} from 'svelte'
  import Tooltip from 'tooltip.js'

  export let settings;

  let tooltipAnchor;
  let tooltip;

  onMount(() => {
    tooltip = new Tooltip(tooltipAnchor, {
      title: `<dl class="settings-list">
        <dt>HP</dt>
        <dd>${settings.hp}</dd>
        <br/>
        <dt>wins to gain HP</dt>
        <dd>${settings.winsToGainHP}</dd>
        <br/>
        <dt>losses to lose HP</dt>
        <dd>${settings.lossesToLoseHP}</dd>
        <br/>
        <dt>warmup games</dt>
        <dd>${settings.warmupGames}</dd>
        <br/>
        <dt>max games</dt>
        <dd>${settings.maxGames}</dd>
        <br/>
        <dt>max consecutive losses</dt>
        <dd>${settings.maxConsecutiveLosses}</dd>
      </dl> `,
      placement: 'bottom',
      html: true,
    })
  })
</script>

<style>
  .gear {
    cursor: pointer;
    display: block;
    width: 30px;
    color: #F8FA90;
  }

  :global(.settings-list) {
    border-radius: 3px;
    width: 200px;
    background-color: #ECF8F8;
    font-style: italic;
  }

  :global(.settings-list dt:after) {
    content: ':';
  }

  :global(.settings-list dt, .settings-list dd) {
    display: inline-block;
    text-align: left;
    padding: 0;
    margin: 0;
  }
</style>

<em class="gear" bind:this={tooltipAnchor}>
  <MdSettings />
</em>
