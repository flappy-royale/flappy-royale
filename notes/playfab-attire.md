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

## Locked attire items

The client's login request returns us both the user's current attire, and an array of ID strings of all attires the user
has unlocked (= their UserInventory on PlayFab).

When viewing the attire screen, we show items as "locked" if (a) the Attire object's `free` property is `false`, and (b)
the Attire object's id isn't found in the list of owned attire IDs.

However, let's say the user somehow manages to submit an attire update request with items they don't actually own. The
attire update goes through a Firebase cloud fn that looks up the user and cross-references all the items they want to
update. On the server, we consider an item to be "free" if the CatalogItem's`VirtualCurrencyPrices.RM` price, or if
it's 0. If an item is not free, and the player doesn't own it, we bail on the entire attire request.

Currently, the client doesn't rely on Catalog/Store information at all, everything is loaded from client codebase files.
Our syncing functions (see above) are responsible for e.g. setting the RM VirtualCurrencyPrice accordingly.

## Loot boxes

There is a Firebase cloud function for assigning a loot box.

When you call it, you pass it a playfabId and a drop table ID. It looks up the drop table, and randomly rolls an item
from it, respecting the drop table's set weights but also making sure to not give the player an item they already have.
It then assigns that item to that player's inventory, and returns the item ID so the client can display it.

Currently, it doesn't do any ad receipt validation: if you ask it for an item, it'll naively give you an item. Having it
require a drop table ID from the client, rather than an enum value or something, is intentional. These values aren't
particularly secret for anyone snooping around, but it at least means that the magic values someone needs to fake a
network request aren't present in this repo.
