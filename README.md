## Flappy Royale

A HTML5 Game, built to be embedded in apps using Phaser 3.

## Setup

Clone, and run `yarn install`, run `yarn start` to load up into the app:

```sh
cd flappy-battle
yarn install
code .
yarn start
```

## Key Tech

To grok the codebase entirely, you'll see:

- Phaser 3
- TypeScript
- Webpack
- Firebase (DB/Functions/Hosting)

## Deploy

1. Running `yarn build` will create a `dist` folder, which is the game statically compiled.
2. Running `yarn deploy` will:
 - Update all functions
 - Compile your app in webpack
 - Ship the webpack build to firebase hosting

