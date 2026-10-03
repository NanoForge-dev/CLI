<script lang="ts">
  import { EditorServices } from '@nanoforge-dev/editor-sdk';
  import { Button, type WidgetInstance } from '@nanoforge-dev/editor-sdk/ui';

  import { count } from './counter';
  import { HISTORY } from './index';

  const { instance }: { instance: WidgetInstance } = $props();
  const add = () => instance.services.get(EditorServices.Commands).execute('<%= id %>.add');

  // While this panel has focus, undo and redo act on the plugin's history.
  $effect(() => {
    instance.setHistoryContext(HISTORY);
    return () => instance.setHistoryContext(undefined);
  });
</script>

<section class="<%= short %>" aria-label="<%= title %>">
  <p class="count" role="status">{$count}</p>
  <Button variant="primary" onclick={() => void add()}>Add</Button>
</section>

<style>
  .<%= short %> {
    display: grid;
    gap: var(--nf-space-3);
    justify-items: center;
    padding: var(--nf-space-4);
  }
  .count {
    margin: 0;
    font-size: 2.5rem;
    font-weight: 600;
  }
</style>
