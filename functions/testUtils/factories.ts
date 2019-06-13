import { Attire } from "../../src/attire";
import { UserSettings } from "../../src/user/userManager";
import { PlayerData } from "../../src/firebase";

// Loading the actual default attire requires resolving an image URL, 
// which requires going through the main app's webpack config. 
// Inlining this is easier.
export const AttireFactory = (props?: any): Attire => {
  return {
    id: "default-body",
    description: "It flaps",
    fit: "tight",
    base: true,
    href: "some URL",
    ...props,
  }
}
export const UserFactory = (props?: any): UserSettings => {
  return {
    name: "flappy bird",
    aesthetics: { attire: [AttireFactory()] },
    royale: { seedIndex: -1 },
    ...props,
  }
}

export const PlayerDataFactory = (props?: any, name?: string): PlayerData => {
  let user = name ? UserFactory({ name }) : UserFactory()

  return {
    user,
    actions: [],
    timestamp: 5,
    score: 1,
    ...props,
  }
}