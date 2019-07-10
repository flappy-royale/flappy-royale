# Attire stored on PlayFab

For unlockables, we're migrating attire to be stored in PlayFab. Here's a summary of their data model, and how we
interact with it.

A **catalog** contains every single item in the game. This is all our attire!

A **catalog item** represents one item for sale. Currently, I'm not sure how we're ultimately going to use their "item
classes" or "tags", but for now: class is one of "base", "loose", or "tight", and `tags` contain any of "base", "fit",
and "tight".

A **store** is a collection of items (with attached pricing) grouped together. An item might appear in multiple stores;
PlayFab's intent is so that you can e.g. have differently-priced items for different cohorts of users. In our case, 1
store = 1 set of items, so an item won't appear in multiple stores.

Bundles/containers/drop tables are things we'll deal with as we implement loot boxes.

## Updating the store

We currently have a bunch of `Attire` / `AttireSet` stored in our own format. `uploadAttireCatalog.ts` has some helper
functions to convert our data into PlayFab-friendly JSON and then sync that data with PlayFab's server.

There are two network calls: `PlayFabAdmin.SetCatalogItems` overwrites the current catalog with the passed-in items, and
`PlayFabAdmin.SetStoreItems` then sets up a store containing the passed-in items.

This file lives in `scripts`, but right now isn't runnable outside of `src` (there are shenanigans with the way we load
the image files that causes non-webpack execution to try to load in PNG data as text, rather than resolving to a file
path). For now, when I need to run this, I copy it into `src` and import/call it from user-land code.
