// Careful now! Please don't import the game code into this module
// so that site's webpack run only imports our code

/** Things that are needed for showing stuff to a user */
export interface PresentationAttire extends Attire {
    /** A text description for the UI  */
    description: string
}

export interface Attire {
    /** Things that are needed for the game */
    fit: "loose" | "tight"
    /** The ID in the cache manager */
    id: string
    /** The url to the url */
    href: string
    /** Is this something that can be used as the base (e.g. represents the whole bird)  */
    base: boolean
}

export const hedgehog: PresentationAttire = {
    id: "hedgehog",
    description: "Whole hedgehog",
    fit: "tight",
    base: true,
    href: require("../assets/bases/Hedgehog.png")
}

export const dog: PresentationAttire = {
    id: "dog-1",
    description: "Woof woof",
    fit: "tight",
    base: true,
    href: require("../assets/bases/Dog1.png")
}

export const sheep: PresentationAttire = {
    id: "sheep",
    description: "Bird got punk'd",
    fit: "tight",
    base: true,
    href: require("../assets/bases/Sheep.png")
}

export const defaultAttire = hedgehog

export const v1Attire: PresentationAttire[] = [
    defaultAttire,
    {
        id: "turtle-shell",
        description: "Flapping in a half-shell",
        fit: "tight",
        base: true,
        href: require("../assets/bases/Turtle.png")
    },
    {
        id: "banana",
        description: "It's a banana or A COISS, kk",
        fit: "tight",
        base: true,
        href: require("../assets/bases/Banana.png")
    },
    dog,
    {
        id: "cave",
        description: "It flaps",
        fit: "tight",
        base: true,
        href: require("../assets/bases/CaveBody.png")
    },
    {
        id: "default-body",
        description: "It flaps",
        fit: "tight",
        base: true,
        href: require("../assets/bases/BirdBody.png")
    },
    {
        id: "bad-beard",
        description: "A really dodgy beard",
        fit: "tight",
        base: false,
        href: require("../assets/attire/BadBeard.png")
    },
    {
        id: "flat-cap1",
        description: "A good old flat cap",
        fit: "loose",
        base: false,
        href: require("../assets/attire/FlatCap.png")
    },
    {
        id: "crown1",
        description: "We can all be royale-ty",
        fit: "loose",
        base: false,
        href: require("../assets/attire/Crown1.png")
    },
    {
        id: "crown2",
        description: "We can all be royale-ty",
        fit: "loose",
        base: false,
        href: require("../assets/attire/Crown2.png")
    },
    {
        id: "baseball-1",
        description: "Going to a generic game",
        fit: "loose",
        base: false,
        href: require("../assets/attire/Baseball-Whiteblue.png")
    },
    {
        id: "bobble-1",
        description: "Keeping your noggin wawrm",
        fit: "loose",
        base: false,
        href: require("../assets/attire/BobbleHat.png")
    },
    {
        id: "sunnies-1",
        description: "Going to a generic game",
        fit: "tight",
        base: false,
        href: require("../assets/attire/Sunnies.png")
    },
    {
        id: "tophat-1",
        description: "Going to a generic game",
        fit: "loose",
        base: false,
        href: require("../assets/attire/TopHat.png")
    },
    {
        id: "straw-1",
        description: "Going to a generic game",
        fit: "loose",
        base: false,
        href: require("../assets/attire/SummerHat.png")
    },
    {
        id: "mohawk-1",
        description: "Bird got punk'd",
        fit: "tight",
        base: false,
        href: require("../assets/attire/Mohawk.png")
    },
    {
        id: "bandana1",
        description: "Bird got punk'd",
        fit: "tight",
        base: false,
        href: require("../assets/attire/bad-dana.png")
    },
    {
        id: "zen",
        description: "See no evil",
        fit: "tight",
        base: false,
        href: require("../assets/attire/zen.png")
    },
    {
        id: "nervous",
        description: ":|",
        fit: "tight",
        base: false,
        href: require("../assets/attire/nervous.png")
    },
    // {
    //     id: "pig",
    //     description: "Bird got punk'd",
    //     fit: "tight",
    //     base: true,
    //     href: require("../assets/bases/Pig.png")
    // },
    {
        id: "tired",
        description: "Bird got punk'd",
        fit: "tight",
        base: false,
        href: require("../assets/attire/tired.png")
    },
    {
        id: "paranoid",
        description: "Bird got punk'd",
        fit: "tight",
        base: false,
        href: require("../assets/attire/Paranoid.png")
    },
    {
        id: "halo",
        description: "Bird got punk'd",
        fit: "tight",
        base: false,
        href: require("../assets/attire/halo.png")
    },
    {
        id: "big-mouth",
        description: "Bird got punk'd",
        fit: "tight",
        base: false,
        href: require("../assets/attire/bigmouth.png")
    },
    {
        id: "drool",
        description: "Bird got punk'd",
        fit: "tight",
        base: false,
        href: require("../assets/attire/drool.png")
    },
    {
        id: "tiny-eye",
        description: "Bird got punk'd",
        fit: "tight",
        base: true,
        href: require("../assets/bases/Tiny_eyes.png")
    },
    {
        id: "ghost",
        description: "Bird got punk'd",
        fit: "tight",
        base: true,
        href: require("../assets/bases/Ghost.png")
    },
    {
        id: "fantasy",
        description: "Bird got punk'd",
        fit: "tight",
        base: true,
        href: require("../assets/bases/Fantasy.png")
    },
    {
        id: "sheep",
        description: "Bird got punk'd",
        fit: "tight",
        base: true,
        href: require("../assets/bases/Sheep.png")
    },
    {
        id: "pug",
        description: "Bird got punk'd",
        fit: "tight",
        base: true,
        href: require("../assets/bases/Pug.png")
    },
    {
        id: "robin",
        description: "Bird got punk'd",
        fit: "tight",
        base: true,
        href: require("../assets/bases/Robin.png")
    }
]

/**

export const versionTwoAttire: PresentationAttire[] = [
    ...v1Attire,

    {
        id: "alt_default",
        description: "TBD",
        fit: "tight",
        base: true,
        href: require("../assets/bases/Alt_Default.png")
    },
    {
        id: "baby_chick",
        description: "TBD",
        fit: "tight",
        base: true,
        href: require("../assets/bases/Baby_Chick.png")
    },
    {
        id: "bandit_chick",
        description: "TBD",
        fit: "tight",
        base: true,
        href: require("../assets/bases/Bandit_Chick.png")
    },
    {
        id: "big_beak",
        description: "TBD",
        fit: "tight",
        base: true,
        href: require("../assets/bases/Big_Beak.png")
    },
    {
        id: "black_cat",
        description: "TBD",
        fit: "tight",
        base: true,
        href: require("../assets/bases/Black_Cat.png")
    },
    {
        id: "blue_chick",
        description: "TBD",
        fit: "tight",
        base: true,
        href: require("../assets/bases/Blue_Chick.png")
    },
    {
        id: "bluechog",
        description: "TBD",
        fit: "tight",
        base: true,
        href: require("../assets/bases/Bluechog.png")
    },
    {
        id: "brainbow",
        description: "TBD",
        fit: "tight",
        base: true,
        href: require("../assets/bases/Brainbow.png")
    },
    {
        id: "bubblegum",
        description: "TBD",
        fit: "tight",
        base: true,
        href: require("../assets/bases/Bubblegum.png")
    },
    {
        id: "cat",
        description: "TBD",
        fit: "tight",
        base: true,
        href: require("../assets/bases/Cat.png")
    },
    {
        id: "chilled_bird",
        description: "TBD",
        fit: "tight",
        base: true,
        href: require("../assets/bases/Chilled_Bird.png")
    },
    {
        id: "cooked",
        description: "TBD",
        fit: "tight",
        base: true,
        href: require("../assets/bases/Cooked.png")
    },
    {
        id: "cthulu_bird",
        description: "TBD",
        fit: "tight",
        base: true,
        href: require("../assets/bases/Cthulu_Bird.png")
    },
    {
        id: "duck",
        description: "TBD",
        fit: "tight",
        base: true,
        href: require("../assets/bases/Duck.png")
    },
    {
        id: "elephant_2",
        description: "TBD",
        fit: "tight",
        base: true,
        href: require("../assets/bases/Elephant 2.png")
    },
    {
        id: "elephant",
        description: "TBD",
        fit: "tight",
        base: true,
        href: require("../assets/bases/Elephant.png")
    },
    {
        id: "evil_brain",
        description: "TBD",
        fit: "tight",
        base: true,
        href: require("../assets/bases/Evil_Brain.png")
    },
    {
        id: "evil_eye",
        description: "TBD",
        fit: "tight",
        base: true,
        href: require("../assets/bases/Evil_Eye.png")
    },
    {
        id: "eye",
        description: "TBD",
        fit: "tight",
        base: true,
        href: require("../assets/bases/Eye.png")
    },
    {
        id: "fox",
        description: "TBD",
        fit: "tight",
        base: true,
        href: require("../assets/bases/Fox.png")
    },
    {
        id: "ginger_cat",
        description: "TBD",
        fit: "tight",
        base: true,
        href: require("../assets/bases/Ginger_Cat.png")
    },
    {
        id: "good_brain",
        description: "TBD",
        fit: "tight",
        base: true,
        href: require("../assets/bases/Good_Brain.png")
    },
    {
        id: "hound_dog",
        description: "TBD",
        fit: "tight",
        base: true,
        href: require("../assets/bases/Hound_Dog.png")
    },
    {
        id: "legless_cook",
        description: "TBD",
        fit: "tight",
        base: true,
        href: require("../assets/bases/Legless_Cook.png")
    },
    {
        id: "little_chicken",
        description: "TBD",
        fit: "tight",
        base: true,
        href: require("../assets/bases/Little_Chicken.png")
    },
    {
        id: "moono_brow",
        description: "TBD",
        fit: "tight",
        base: true,
        href: require("../assets/bases/Moono_Brow.png")
    },
    {
        id: "nimbus",
        description: "TBD",
        fit: "tight",
        base: true,
        href: require("../assets/bases/Nimbus.png")
    },
    {
        id: "penguin",
        description: "TBD",
        fit: "tight",
        base: true,
        href: require("../assets/bases/Penguin.png")
    },
    {
        id: "pink_chick",
        description: "TBD",
        fit: "tight",
        base: true,
        href: require("../assets/bases/Pink_Chick.png")
    },
    {
        id: "plains",
        description: "TBD",
        fit: "tight",
        base: true,
        href: require("../assets/bases/Plains.png")
    },
    {
        id: "pro_racer",
        description: "TBD",
        fit: "tight",
        base: true,
        href: require("../assets/bases/Pro_Racer.png")
    },
    {
        id: "punk_racer",
        description: "TBD",
        fit: "tight",
        base: true,
        href: require("../assets/bases/Punk_Racer.png")
    },
    {
        id: "purple_chick_3",
        description: "TBD",
        fit: "tight",
        base: true,
        href: require("../assets/bases/Purple_Chick 3.png")
    },
    {
        id: "purple_chick_4",
        description: "TBD",
        fit: "tight",
        base: true,
        href: require("../assets/bases/Purple_Chick 4.png")
    },
    {
        id: "purple_chick",
        description: "TBD",
        fit: "tight",
        base: true,
        href: require("../assets/bases/Purple_Chick.png")
    },
    {
        id: "rabbit",
        description: "TBD",
        fit: "tight",
        base: true,
        href: require("../assets/bases/Rabbit.png")
    },
    {
        id: "rage_bird",
        description: "TBD",
        fit: "tight",
        base: true,
        href: require("../assets/bases/Rage_Bird.png")
    },
    {
        id: "rainbow_cat",
        description: "TBD",
        fit: "tight",
        base: true,
        href: require("../assets/bases/Rainbow_Cat.png")
    },
    {
        id: "rainbow_chick",
        description: "TBD",
        fit: "tight",
        base: true,
        href: require("../assets/bases/Rainbow_Chick.png")
    },
    {
        id: "red_chick",
        description: "TBD",
        fit: "tight",
        base: true,
        href: require("../assets/bases/Red_Chick.png")
    },
    {
        id: "saber_tooth",
        description: "TBD",
        fit: "tight",
        base: true,
        href: require("../assets/bases/Saber_Tooth.png")
    },
    {
        id: "seagull_eyebrow_bird",
        description: "TBD",
        fit: "tight",
        base: true,
        href: require("../assets/bases/Seagull_Eyebrow_Bird.png")
    },
    {
        id: "shy_bird",
        description: "TBD",
        fit: "tight",
        base: true,
        href: require("../assets/bases/Shy_Bird.png")
    },
    {
        id: "sketchnook_mascot_freebie",
        description: "TBD",
        fit: "tight",
        base: true,
        href: require("../assets/bases/Sketchnook_Mascot_Freebie.png")
    },
    {
        id: "skull_bird",
        description: "TBD",
        fit: "tight",
        base: true,
        href: require("../assets/bases/Skull_Bird.png")
    },
    {
        id: "standard_cat",
        description: "TBD",
        fit: "tight",
        base: true,
        href: require("../assets/bases/Standard_Cat.png")
    },
    {
        id: "torture",
        description: "TBD",
        fit: "tight",
        base: true,
        href: require("../assets/bases/Torture.png")
    },
    {
        id: "tough_bird",
        description: "TBD",
        fit: "tight",
        base: true,
        href: require("../assets/bases/Tough_Bird.png")
    },
    {
        id: "turkey",
        description: "TBD",
        fit: "tight",
        base: true,
        href: require("../assets/bases/Turkey.png")
    },
    {
        id: "yellowchog",
        description: "TBD",
        fit: "tight",
        base: true,
        href: require("../assets/bases/YellowChog.png")
    },
    {
        id: "focussprite",
        description: "TBD",
        fit: "tight",
        base: true,
        href: require("../assets/bases/focusSprite.png")
    },
    {
        id: "2_eye_shades",
        description: "TBD",
        fit: "tight",
        base: false,
        href: require("../assets/attire/2_Eye_Shades.png")
    },
    {
        id: "bandit_mask",
        description: "TBD",
        fit: "tight",
        base: false,
        href: require("../assets/attire/Bandit_Mask.png")
    },
    {
        id: "beard_disguise",
        description: "TBD",
        fit: "tight",
        base: false,
        href: require("../assets/attire/Beard_Disguise.png")
    },
    {
        id: "bighair1",
        description: "TBD",
        fit: "tight",
        base: false,
        href: require("../assets/attire/BigHair1.png")
    },
    {
        id: "brolly_2",
        description: "TBD",
        fit: "tight",
        base: false,
        href: require("../assets/attire/Brolly 2.png")
    },
    {
        id: "brolly_3",
        description: "TBD",
        fit: "tight",
        base: false,
        href: require("../assets/attire/Brolly 3.png")
    },
    {
        id: "brolly",
        description: "TBD",
        fit: "tight",
        base: false,
        href: require("../assets/attire/Brolly.png")
    },
    {
        id: "chicken_hair",
        description: "TBD",
        fit: "tight",
        base: false,
        href: require("../assets/attire/Chicken_Hair.png")
    },
    {
        id: "crown",
        description: "TBD",
        fit: "tight",
        base: false,
        href: require("../assets/attire/Crown.png")
    },
    {
        id: "face_scar",
        description: "TBD",
        fit: "tight",
        base: false,
        href: require("../assets/attire/Face_Scar.png")
    },
    {
        id: "finish_flag",
        description: "TBD",
        fit: "tight",
        base: false,
        href: require("../assets/attire/Finish_Flag.png")
    },
    {
        id: "flame_aura",
        description: "TBD",
        fit: "tight",
        base: false,
        href: require("../assets/attire/Flame_Aura.png")
    },
    {
        id: "great_hair",
        description: "TBD",
        fit: "tight",
        base: false,
        href: require("../assets/attire/Great_Hair.png")
    },
    {
        id: "holiday_hat",
        description: "TBD",
        fit: "tight",
        base: false,
        href: require("../assets/attire/Holiday_Hat.png")
    },
    {
        id: "meat_leg",
        description: "TBD",
        fit: "tight",
        base: false,
        href: require("../assets/attire/Meat_Leg.png")
    },
    {
        id: "one_eye_shades",
        description: "TBD",
        fit: "tight",
        base: false,
        href: require("../assets/attire/One_Eye_Shades.png")
    },
    {
        id: "open_beak",
        description: "TBD",
        fit: "tight",
        base: false,
        href: require("../assets/attire/Open_Beak.png")
    },
    {
        id: "pixel_spangled_banner",
        description: "TBD",
        fit: "tight",
        base: false,
        href: require("../assets/attire/Pixel_Spangled_Banner.png")
    },
    {
        id: "pride_hunter",
        description: "TBD",
        fit: "tight",
        base: false,
        href: require("../assets/attire/Pride_Hunter.png")
    },
    {
        id: "flag_trans",
        description: "TBD",
        fit: "tight",
        base: false,
        href: require("../assets/attire/Flag_Trans.png")
    },
    {
        id: "flag_nonbinary",
        description: "TBD",
        fit: "tight",
        base: false,
        href: require("../assets/attire/Flag_Nonbinary.png")
    },
    {
        id: "rabbit_ears",
        description: "TBD",
        fit: "tight",
        base: false,
        href: require("../assets/attire/Rabbit_Ears.png")
    },
    {
        id: "rainbow_bird_2",
        description: "TBD",
        fit: "tight",
        base: false,
        href: require("../assets/attire/Rainbow_Bird 2.png")
    },
    {
        id: "rainbow_bird_3",
        description: "TBD",
        fit: "tight",
        base: false,
        href: require("../assets/attire/Rainbow_Bird 3.png")
    },
    {
        id: "rainbow_bird_4",
        description: "TBD",
        fit: "tight",
        base: false,
        href: require("../assets/attire/Rainbow_Bird 4.png")
    },
    {
        id: "rainbow_bird_5",
        description: "TBD",
        fit: "tight",
        base: false,
        href: require("../assets/attire/Rainbow_Bird 5.png")
    },
    {
        id: "rainbow_bird",
        description: "TBD",
        fit: "tight",
        base: false,
        href: require("../assets/attire/Rainbow_Bird.png")
    },
    {
        id: "rainbrolly",
        description: "TBD",
        fit: "tight",
        base: false,
        href: require("../assets/attire/Rainbrolly.png")
    },
    {
        id: "rainfro_",
        description: "TBD",
        fit: "tight",
        base: false,
        href: require("../assets/attire/Rainfro_.png")
    },
    {
        id: "sik_hat",
        description: "TBD",
        fit: "tight",
        base: false,
        href: require("../assets/attire/Sik_Hat.png")
    },
    {
        id: "sparkle_aura",
        description: "TBD",
        fit: "tight",
        base: false,
        href: require("../assets/attire/Sparkle_Aura.png")
    },
    {
        id: "war_spoon",
        description: "TBD",
        fit: "tight",
        base: false,
        href: require("../assets/attire/War_Spoon.png")
    },
    {
        id: "headphones",
        description: "TBD",
        fit: "tight",
        base: false,
        href: require("../assets/attire/headphones.png")
    }
]
*/

// One day these will be different
export const allAttire = v1Attire

export const builtInAttire = v1Attire
