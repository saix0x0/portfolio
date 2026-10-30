// OBSERVATORY — the hidden room (reached from the telescope in the Arctic, or by
// searching “observatory”). Not linked in navigation, noindex. Hidden ≠ secure:
// the real protection is the encryption of observatory/sealed.json.
import { boot } from '../core/layout.js';
import { mountVault } from '../core/vault.js';

const sky = boot({ page: 'observatory', sky: 'observatory' });
mountVault(document.getElementById('room'), {
  file: 'observatory/sealed.json',
  title: 'The observatory',
  prompt: 'You found the telescope. It only focuses for one person.',
  sky,
});
