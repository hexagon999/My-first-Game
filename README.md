# Aetheria Online

**Browser-first 3D fantasy MMORPG for desktop and Android browsers.**

> Status: phased prototype development. Planned systems must not be described as implemented until they exist and have been tested.

## Vision
Build an original, persistent MMORPG toward modern AAA production quality: rich 3D worlds, characters, monsters, animation, audio, combat, progression, multiplayer, social systems, dungeons, events, and secure Game Master tools. AAA quality is a long-term target, not a claim about the current prototype.

## Technology direction
- Client: React, TypeScript, Vite, Three.js, WebGL.
- 3D content: Blender workflows, glTF 2.0 / GLB, skeletal animation, PBR materials.
- Server: Node.js, TypeScript, Colyseus, WebSockets, authoritative gameplay.
- Persistence: PostgreSQL, Prisma; Redis when justified.
- Quality: Vitest, Playwright where useful, TypeScript strict mode, ESLint, Prettier.
- Use npm workspaces initially. Introduce dependencies and services only when a phase needs them.

## Target folder architecture

Create this structure progressively. Inspect and preserve existing work; do not move files blindly or create empty modules just to fill the tree.

```text
Aetheria-Online/
├── apps/
│   ├── game-client/src/{app,components,features,game,hooks,services,stores,styles,types,utils}/
│   ├── game-server/src/{bootstrap,config,rooms,networking,authentication,players,characters,combat,monsters,inventory,items,quests,parties,guilds,trading,world,events,chat,security}/
│   ├── api-server/src/{routes,controllers,services,authentication,middleware,validation,admin,monitoring}/
│   └── gm-panel/src/{app,components,layouts,pages,services,hooks,stores,types}/
├── packages/{shared-types,game-data,game-config,network-protocol,validation,ui-components,game-utilities}/
├── assets/{source,characters,monsters,npcs,environments,maps,items,weapons,armor,animations,textures,materials,effects,particles,audio,music,interface,icons,reference}/
├── database/{prisma, seeds,documentation}/
├── tools/{asset-importer,asset-validator,map-editor,item-editor,monster-editor,quest-editor,development-tools}/
├── tests/{unit,integration,multiplayer,security,e2e}/
├── docs/{architecture,game-design,asset-pipeline,database,networking,security,gm-system,development-roadmap}/
├── scripts/
├── .github/workflows/
└── package.json, package-lock.json, tsconfig.base.json, .gitignore, .env.example, README.md, CONTRIBUTING.md
```

Keep player UI, GM UI, server logic, shared contracts, data definitions, and assets separated. The API server may initially be part of the game server; avoid unnecessary service proliferation.

## AAA asset library and production pipeline

Build an original asset library. Do not rely entirely on primitive Three.js shapes or temporary placeholders.

### Characters
- Player classes: Warrior, Mage, Archer, Assassin, Support.
- Character customization, rigs, armor variants, hair/accessories, weapon attachment points, previews, and LODs.
- NPCs and bosses use reusable rigs, materials, and animation workflows.

### Monsters
- Slimes, beasts, insects, undead, humanoids, magical creatures, elites, dungeon monsters, and world bosses.
- Each monster references model, rig, animations, materials, audio, AI configuration, spawn rules, combat stats, and loot table.

### Environments and maps
- Forests, grasslands, mountains, rivers, lakes, caves, dungeons, towns, buildings, vegetation, rocks, props, and architecture.
- Initial region: Greenwind Meadow. Future regions may include Starting Village, Ancient Forest, Forgotten Cave, Crystal Mountains, Desert Region, dungeon arenas, and world-boss arenas.
- Each map defines terrain, object references, collision, navigation, boundaries, player spawns, NPC placements, monster groups, teleport destinations, and lighting/weather settings.

### Items, animation, textures, effects, and audio
- Items: weapons, armor, accessories, consumables, crafting materials, quest items, and icons.
- Animations: idle, walk, run, jump, attack, cast, hit, block, dodge, death, victory, emotes, and interactions.
- PBR textures: base color, normal, roughness, metallic, ambient occlusion, and emissive where appropriate.
- Effects: magic, fire, ice, lightning, poison, healing, weapon trails, impacts, environmental particles, and boss effects.
- Audio: login, region and dungeon music; combat, weapon, magic, monster, UI, and environmental sound effects; optional voice.
- Build reusable animation state machines and an audio manager with volume settings, transitions, spatial audio where suitable, and cleanup.

### Asset sourcing and validation
- Use original assets, properly licensed open assets, or commercial assets whose licenses allow the intended use.
- Do not rip or redistribute copyrighted assets from commercial games without permission.
- Track asset source and license. Keep source files separate from optimized runtime files.
- Use Blender-compatible workflows and GLB/glTF for runtime models.
- Build asset import, validation, preview, duplicate detection, manifest generation, and optimization tools.
- Optimize with texture compression, geometry compression where useful, LODs, instancing, culling, lazy loading, streaming, and object pooling.
- Do not load the entire asset library at startup. Use Git LFS or external asset storage for large binaries when appropriate.

### Asset manifest example

```json
{
  "id": "character_warrior_001",
  "name": "Warrior",
  "category": "character",
  "format": "glb",
  "path": "characters/player/warrior/warrior.glb",
  "animations": ["idle", "walk", "run", "attack"],
  "lod": true,
  "license": "original",
  "version": 1
}
```

The manifest tracks unique ID, path, category, format, version, license, dependencies, loading priority, LOD availability, and optimization status.

## Data-driven game content

Store structured definitions in packages/game-data, grouped into classes, stats, skills, items, weapons, armor, monsters, NPCs, quests, loot tables, maps, spawn points, dungeons, world events, and progression.

Use unique IDs and validation schemas. Define class stats and progression; monster stats, AI, aggro, spawn and loot; item rarity, restrictions, stats and asset references; skill costs, cooldowns, range, targeting and effects; quest requirements, objectives and rewards; and map spawns, boundaries, navigation and teleport points. Keep one source of truth and share safe definitions/contracts between client and server.

## Gameplay systems

### World
- Third-person exploration, terrain, forests, settlements, rivers, distant scenery, weather, fog, lighting, day/night, water, environmental audio, map boundaries, and world streaming.

### Characters and progression
- Character creation/selection, customization, classes, stats, levels, experience, skill points, equipment restrictions, and persistence.

### Combat
- Targeting, basic attacks, skills, cooldowns, range checks, damage, critical hits, defense, status effects, healing, aggro, boss mechanics, animations, sound, and effects.
- Server validates attack timing, range, cooldowns, resources, targets, and outcomes. Never trust client-reported damage.

### Monsters and NPCs
- Passive, aggressive, elite, dungeon, boss, and world-boss monsters.
- Merchant, quest giver, trainer, teleport, crafting, and repair NPCs.
- Reusable data-driven definitions and server-side spawn control.

### Inventory and economy
- Inventory, equipment, weapons, armor, accessories, consumables, rarity, enhancement, storage, loot, crafting, and player trading.
- Use server validation and database transactions. Prevent duplication, negative quantities, invalid equipment, and concurrent transaction exploits.

### Quests and social
- Main, side, daily, and repeatable quests; dialogue, objectives, prerequisites, tracking, rewards, and persistent progress.
- Friends, private messages, chat channels, parties, invitations, party leadership, guild creation/ranks/permissions, announcements, and trading.

### Dungeons and events
- Instanced dungeons, entry requirements, party encounters, boss mechanics, rewards, world bosses, scheduled events, participation tracking, and server-authoritative rewards.

## Multiplayer and backend

Use an authoritative Node.js/TypeScript server with Colyseus or equivalent. Implement authentication, sessions, rooms, player synchronization, movement, combat, monster state, chat, parties, guilds, trading, reconnection, and persistence. Clearly distinguish real server-connected multiplayer from local simulation. Validate important state changes on the server.

## Database

Use PostgreSQL and Prisma when persistence is introduced. Model accounts, sessions, characters, stats, inventory, item definitions, equipment, skills, quests, quest progress, guilds, guild members, parties, friends, chat, trades, dungeon runs, world events, GM accounts, permissions, and audit logs. Use migrations, seeds, indexes, constraints, and transactions. Keep credentials in environment variables; commit placeholders only in .env.example.

## Secure Game Master panel

Build a separate GM interface with overview/server status, online players, player and character inspection, inventory, item database, monster and NPC management, world controls, events, announcements, moderation, audit logs, GM accounts, permissions, and settings.

Role-based capabilities may include player inspection, teleportation, messaging, announcements, mute/kick, reports, inventory inspection and justified corrections, monster spawning/despawning, spawn management, weather/time controls, and event controls.

Security requirements:
- Authenticate GM accounts and enforce role-based permissions on the server for every operation.
- Roles: Administrator, Senior GM, Game Master, Moderator.
- Audit every action with actor, action, target, timestamp, reason, and outcome.
- Validate and rate-limit commands; require confirmation for destructive actions.
- Never trust client-side role checks. Never use a universal hidden GM password or expose credentials.
- Clearly label mock data and mock controls. Do not pretend they operate on live game state.

## UI and mobile

Player UI: main menu, login, character selection/creation, health/mana/EXP bars, skill hotbar, inventory, equipment, quest tracker, minimap, chat, party, guild, and settings.

Mobile UI: virtual joystick, attack and skill buttons, touch targeting, responsive HUD/menus, adjustable controls, and safe touch targets.

GM UI: responsive dashboard, tables, search, filters, confirmation dialogs, audit logs, and permission-aware navigation.

## Performance, testing, and security

- Support a range of desktop and Android hardware with adaptive quality, controlled pixel ratio, LOD, culling, instancing, streaming, texture compression, efficient animation, pooling, cleanup, and network/database optimization.
- Profile before optimizing. Prioritize stable frame pacing, responsive controls, memory use, and reliable networking.
- Create unit, integration, multiplayer, security, and end-to-end tests where appropriate.
- Test progression, EXP, combat, item transactions, inventory rules, quests, authentication, GM permissions, multiplayer state, persistence, asset loading, and mobile controls.
- Run TypeScript checks, lint, tests, and production builds. Run browser tests when available. Record failures and fix them before marking a milestone verified.

## Development roadmap

### Phase 1 — Playable foundation
- Inspect and stabilize the existing scaffold.
- Modular Three.js engine, Greenwind Meadow, third-person camera/movement, training monsters, basic combat, EXP/leveling, HUD, mobile controls, initial asset manifest and loader.
- Deliverable: verified playable single-player prototype.

### Phase 2 — Asset and world production
- Character/monster pipelines, GLB loading, animation, materials, terrain, map data, environment, audio, effects, asset validation, and world streaming.
- Deliverable: richer world and repeatable content pipeline.

### Phase 3 — Multiplayer foundation
- Backend, authentication, Colyseus rooms, sessions, player synchronization, server-authoritative movement/basic combat, persistent accounts.
- Deliverable: verified multiplayer interaction.

### Phase 4 — Core MMORPG gameplay
- Classes, stats, skills, inventory, equipment, items, monsters, loot, NPCs, quests, and persistence.
- Deliverable: working character progression and gameplay loop.

### Phase 5 — Advanced content
- Guilds, parties, trading, dungeons, bosses, events, additional maps, crafting, and advanced AI.
- Deliverable: expanded MMORPG systems.

### Phase 6 — GM administration
- GM authentication, permissions, dashboard, player management, item/monster/world tools, announcements, moderation, and audit logs.
- Deliverable: verified secure administration.

### Phase 7 — Production hardening
- Visual/mobile optimization, profiling, security review, automated testing, monitoring, backup/recovery strategy, deployment architecture, and documentation.
- Deliverable: stable release candidate, not an unverified claim of commercial AAA readiness.

## GitHub workflow

Repository: https://github.com/hexagon999/My-first-Game

- Inspect branch, recent commits, and current files before changes.
- Preserve existing work and make small, focused changes.
- Run relevant checks before committing.
- Do not overwrite unrelated work.
- Push only to the intended branch and only when authorized.
- Report the actual commit SHA and push result.

## Required milestone report

After each milestone report: completed features and changed files; assets integrated/created/missing and their license status; tests actually run and results; known issues; branch, commit SHA, and push status; remaining tasks and next milestone. Status must be Not started, In progress, Implemented but unverified, or Verified complete.

## First action for the coding agent

1. Inspect the repository and latest commits.
2. Verify what currently works.
3. Create a prioritized Phase 1 checklist.
4. Plan a safe incremental migration to the target folder structure.
5. Stabilize the playable prototype before advanced systems.
6. Add the initial asset manifest and loading foundation.
7. Implement one milestone at a time.
8. Run checks, fix errors, and document limitations.
9. Commit and push verified work when authorized.

Do not spend the entire session planning. Do not restart without a technical reason. Do not create empty modules merely to make the tree look large. Do not jump ahead while Phase 1 is broken.

## Current prototype and development commands

The initial scaffold is intended to provide a low-poly training area, third-person movement, basic enemy combat, XP/level progression, and responsive touch controls. Check the current source and test these features before treating them as complete.

```bash
npm install
npm run dev
```

These commands run the current Vite development scaffold; they do not mean multiplayer, accounts, persistence, or production hosting are implemented.

## Final mission

Build Aetheria Online into an original, persistent, browser-first 3D MMORPG with high-quality environments, characters, monsters, animations, effects, sound, a scalable asset/data library, real multiplayer, progression, inventory, quests, dungeons, guilds, social systems, and secure GM administration.

**Think like a professional MMORPG development studio. Organize like a large game production team. Build like a senior engineering team. Prioritize original content, verified functionality, performance, security, and maintainability.**
