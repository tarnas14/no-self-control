<script>
  export let value;
  export let label;
  export let id;
  export let min = 1;
  export let max = 8;
</script>

<style>
  .input-group {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: .5em;
  }

  input[type="range"] {
    margin: 0 10px 0 0;
  }
</style>

<div class="input-group">
  <label for={id}>
    {label}
  </label>
  <span>
    <input
      id={id}
      type="range"
      {min}
      {max}
      step="1"
      name={id}
      bind:value={value}
    />
    <em>({value})</em>
  </span>
</div>
