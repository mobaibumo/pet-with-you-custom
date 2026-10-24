[简体中文](README.md) | [English](README.en.md)

# Big Blue Fish · Custom Codex Quota Card

A Windows desktop-pet customization based on [Refining-colors/pet-with-you](https://github.com/Refining-colors/pet-with-you), preserving its character animations, desktop interactions, chat and Codex task feedback.

This is customized source based on 1.0.2, not an official upstream release. Upstream installers do not include this quota card. No custom installer has been published here.

## Preview

<img src="docs/images/quota-custom.png" width="440" alt="Custom quota card with fixture data" />

All account values and dates in this screenshot are simulated.

## Customization

- Separate quota windows with remaining percentages, progress bars, used percentages and full reset timestamps.
- Dedicated reset-credit count and update time; zero and unavailable values remain distinct.
- A pale-blue bubble with transparent PNG character/wave decoration and selectable live text.
- A 60% overall scale, up to approximately 216 CSS pixels wide, adapting to available space. Only the content scrolls when height is limited.
- Existing dismissal and hover-to-pause timing, without extra polling or model calls.

The original 106 animations and other functionality remain available. See the [usage guide](docs/USER_GUIDE.md), currently in Chinese.

## Run

Requires Windows 10/11 and Node.js 22.12+. Initial installation downloads Electron.

```powershell
git clone https://github.com/mobaibumo/pet-with-you-custom.git
cd pet-with-you-custom
npm ci --include=dev
npm start
```

`npm start` opens a development preview using isolated settings and Codex directories under `.local/`. It does not automatically load everyday account data or install Hooks. The first launch is pure-pet mode. `Start-Pet.cmd` is the everyday source entry and uses the Windows user-data directory. See the [installation guide](docs/INSTALL.md) and [workspace guide](docs/WORKSPACE.md).

## Preview and checks

```powershell
.\node_modules\electron\dist\electron.exe scripts/preview-quota.cjs
npm test
npm run test:ui
npm run check:docs
```

The quota preview uses fixtures, saves results under `qa-output/quota-redesign/`, and exits after completion. It does not call chat models. UI tests use isolated data and mocked providers. Live quota reads require a compatible Codex runtime and account state; cloud or remote tasks may not be fully observed. A custom Windows installer has not been rebuilt or tested.

For everyday integration, enable the Codex connection in settings and review Hooks in the client. Hook integration and chat-provider configuration are separate steps.

## Source map

- `runtime/codex-quota.js`: quota data model and card DOM.
- `runtime/codex-quota.css`: layout and scaling.
- `runtime/quota-header.png`: header illustration.
- `quota.cjs`: existing quota retrieval.
- `scripts/preview-quota.cjs`: isolated preview checks.

## Attribution and licensing

Desktop application base: [Refining-colors/pet-with-you](https://github.com/Refining-colors/pet-with-you). Original project and animation source: [PC2005-cloud/dsh-pet](https://github.com/PC2005-cloud/dsh-pet).

Existing code licenses and notices remain in [LICENSE](LICENSE) and [LICENSE.upstream](LICENSE.upstream). A license decision for newly added work is pending maintainer confirmation. Character assets and animations retain upstream noncommercial and attribution conditions; generated character decorations do not expand these rights. See [ATTRIBUTION.md](ATTRIBUTION.md).

Fonts without confirmed redistribution permission remain local and are excluded from Git. The interface uses system fonts. Personal data, credentials, installations, caches, original design drafts and test outputs are excluded. Confirm licensing and asset distribution terms before making the repository public.
