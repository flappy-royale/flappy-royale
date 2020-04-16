## Flappy Royale

A HTML5 Game, built to be embedded in apps using Phaser 3.

<a href="./web/assets/1-full.png"><img src="./web/assets/1-thumb.png"></a>
<a href="./web/assets/2-full.png"><img src="./web/assets/2-thumb.png"></a>
<a href="./web/assets/3-full.png"><img src="./web/assets/3-thumb.png"></a>
<a href="./web/assets/4-full.png"><img src="./web/assets/4-thumb.png"></a>

## Setup

Clone, and run `yarn install`, run `yarn start` to load up into the app:

```sh
cd flappy-battle
yarn install
code .
yarn start
```

To build this app you will need access to our assets git submodule, I'm afraid we're not giving out access to that. So,
think of this as a resource for learning from and not really for sending PRs to. Sorry, but games are just too easily
cloned when the bar is that low.

## Key Tech

To grok the codebase entirely, you'll see:

-   Phaser 3
-   TypeScript
-   Webpack
-   Microsoft Azure (storage/functions)
-   Firebase (hosting)

## Deploy

1. Running `yarn build` will create a `dist` folder, which is the game statically compiled.
2. Running `yarn deploy` will:

-   Update all functions
-   Compile your app in webpack
-   Ship the webpack build to firebase hosting

## Microsite

The site for the app lives inside the `web/` folder.
