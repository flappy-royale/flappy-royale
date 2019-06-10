# Attire

There are two types of attire: bases and attire

You have to have a base, but can wear up to three attires.

## How they work

The physics body of the bird is actually the wings, everything else is just attached to the wings are is ignored in the
collision detection. There are two 'definitions' of how attire is connected to the player: loose or tight. A loose item
will be one physics loop run behind (so hats, or sunglasses would bounce.)

Attire is always positioned and attached at 0.5 x 0.5. You can build attire at any size, and the reference of the base
will always be at the center. Bases are nearly always odd numbers in height (17 × 12) so you should keep it always (
oddxeven )

# Ideas

There is a [zip file here](./flappy-assets-ex.zip) which contains a subset of our assets for bases and attires to give
you a sense of how it is done.

### Hats

-   Baseball caps
-   Beret
-   Pork Pie
-   Panama
-   Bobble Hat
-   Flower Crown
-   More crowns
-   Navy-ish
-   Pirate captain

### Hair

-   Long
-   Buzz
-   Mohawk
-   Dreads

### Masks

-   Super hero-y?
-   Colored

### Misc

-   Robes
-   Glasses
-   Sunglasses
-   Headphones
-   Raincoat

### Bodies

-   Dragon
-   UFO
-   Helicopter
-   Dragonfly?
-   Horse
-   Unicorn
-   Dinosaur
