# PixelQuest Asset Integration Plan

## Current placeholder content

### Phaser scenes and entities
- **HubScene** draws the hub floor, doors, labels, prompts, and unlock banners with Phaser `rectangle` + `text` primitives.
- **PEWingScene** draws all zone blocks, lock overlays, wall visuals, and the return door with primitives.
- **Player** and **Boss** visuals are generated at runtime via `createPlaceholderTextures()` and `graphics.generateTexture(...)` (`player` = 24x28 blue block, `boss` = 72x72 red block).
- **NPCs** are currently yellow marker rectangles with text labels/prompts.

### React HUD/UI
- The side HUD is fully CSS-based (`ui-panel`, `ui-button`, `health-track`) with no external UI textures/icons/audio yet.

## Replacement priority (safest first)
1. **Environment tilesets (Modern Interiors / Modern Exteriors)**
   - Replace hub + PE colored rectangle backgrounds with static tilemap layers while keeping current collision logic unchanged initially.
2. **Player sprite (Ninja Adventure first, then optional LPC fallback)**
   - Replace `player` generated texture with a spritesheet and add directional idle/walk animations.
3. **NPC + boss/enemy sprites (Fantasy Battlers + Ninja Adventure where appropriate)**
   - Replace marker rectangles and boss block texture after player animation is stable.
4. **UI art/icons (Kenney UI + game-icons)**
   - Replace panel/button/boss health visuals progressively in React and Phaser overlays without changing combat/quest logic.
5. **SFX (Kenney audio packs)**
   - Add low-risk event SFX: interact, confirm, damage, victory, unlock; keep gameplay loop unchanged.
6. **Fungus Cave tileset**
   - Integrate as a new biome/scene after base asset pipeline is stable (avoid mixing into first replacement pass).

## Recommended runtime folder structure (Phaser-friendly)
Use `public/assets` so Vite serves files directly via `/assets/...` URLs.

- `public/assets/tilesets/`
  - `modern-interiors/`
  - `modern-exteriors/`
  - `fungus-cave/`
  - `shared/` (collision/debug tiles, transition tiles)
- `public/assets/characters/`
  - `player/`
  - `npcs/`
  - `enemies/`
  - `bosses/`
  - `ninja-adventure/` (raw pack imports)
  - `fantasy-battlers/` (raw pack imports)
- `public/assets/ui/`
  - `kenney-ui/`
  - `game-icons/`
  - `hud/` (processed in-game HUD sprites)
- `public/assets/audio/`
  - `sfx/ui/`
  - `sfx/combat/`
  - `sfx/ambient/`
  - `music/`
- `public/assets/atlases/`
- `public/assets/maps/`

## Technical risks to watch

1. **Asset key collisions in Phaser**
   - Existing code assumes `player` and `boss` texture keys. Loading assets with duplicate keys or multiple scene preload paths can overwrite textures unexpectedly.

2. **Spritesheet frame mismatch**
   - `Player` currently uses `body.setSize(24, 28)` and direct velocity movement. If incoming frames are larger (e.g., 32x32, 48x48), collision boxes and origin offsets must be adjusted to avoid clipping through walls.

3. **Scene-local preload duplication**
   - As scenes grow, loading the same textures in multiple scenes can cause redundant memory usage and lifecycle confusion. A shared Boot/Preload scene will eventually be cleaner.

4. **Atlas vs spritesheet assumptions**
   - Some packs ship as atlases (JSON + PNG), others as fixed-grid sheets. Mixing `load.atlas` and `load.spritesheet` requires clear naming conventions and metadata checks.

5. **Tilemap coordinate/collision drift**
   - Current world geometry is hardcoded rectangles. Migrating to tilemap collisions can change pathing unless tile size, world bounds, and blocked layers are aligned carefully.

6. **UI consistency between React and Phaser**
   - React HUD is DOM/CSS while scene prompts are Phaser text objects. Re-skinning both with shared visual language requires style tokens or a design map to avoid a mismatched look.

7. **Audio spam and overlap**
   - Frequent events (exercise logging, repeated interactions) can stack SFX rapidly unless cooldown/debounce rules are added.

## Recommended implementation order
1. Add asset manifest constants and naming convention (no gameplay changes).
2. Introduce a dedicated preload/bootstrap scene that loads shared textures/audio once.
3. Swap player texture to spritesheet + animations; keep same movement and combat code.
4. Replace NPC and boss placeholders with static sprites; preserve interaction/combat ranges.
5. Replace hub/PE background blocks with tilemap layers, while keeping current wall colliders first.
6. Transition colliders from hardcoded rectangles to tile collision layers in a second pass.
7. Add UI iconography and panel skinning (React first, Phaser prompts second).
8. Add SFX hooks to existing events with conservative volume and overlap limits.
9. Integrate Fungus Cave as a new area once pipeline is proven stable.
