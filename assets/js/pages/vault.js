// VAULT — the visible private room. Content lives encrypted in vault/sealed.json.
import { boot } from '../core/layout.js';
import { mountVault } from '../core/vault.js';

const sky = boot({ page: 'vault', sky: 'vault' });
mountVault(document.getElementById('room'), {
  file: 'vault/sealed.json',
  title: 'The vault',
  prompt: 'A private room. If you’re not me, there’s nothing to see — but the aurora is nice.',
  sky,
});
