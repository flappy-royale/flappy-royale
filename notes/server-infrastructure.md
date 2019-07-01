# How it originally worked

We started out using a Firebase database. A game level is defined by its seed (used to seed the deterministic RNG), so
each collection of replays lived in a document keyed by its seed.

To avoid too much network congestion, we limited the number of replays for any given seed to 100. We had some complex
upload logic when you try to upload a recording:

-   If there are fewer than 50 recordings, just add it.
-   If you have previously contributed a recording to this seed, randomly replace one of your old recordings with the
    new one
-   If you're a new player to this seed, and there are 50 < N < 100 recordings, add your recording.
-   If you're a new player, and there are 100 recordings, replace a random one

It was laughably naive how much time we spent on this algorithm, in a world where we'd eventually have 10 games played
per second :)

This logic all happened in a Firebase cloud function that clients called to upload. Cloud fns can be slow to start, but
that's fine for uploading which doesn't need to be instant.

When you are going to play a recording, we directly queried the Firebase DB from the client.

# Launch woes

Once we started getting traction, this immediately used up our Firebase plan. The cheapest Firebase plan gives you 50k
writes and 20k reads per day; our launch day alone, we had 252k writes and 2.9mm reads!

The first thing we did was cut off reads. We were fetching recordings for a seed every time you played it, to ensure
every game was different. We cut that off; if you had any old cached data for a seed with at least 100 opponents, we
didn't refetch it. Didn't help with writes, and meant that players might see the same game again (nobody complained!),
but helped stymie the costs as users grew.

# Seed queries

We also had a large number of Firebase cloud function calls. Part of that was uploads, but part of it was also uploading
seeds. Every time you hit the main menu, we fetched the list of seeds you should use to play. Particularly grating since
we're not currently cycling royale seeds, only trial. This is just generated in code, so no DB usage, but still costing
us money to run functions.

This is still using a Firebase cloud fn, but the seed data returned now includes an `expiry` value that notes when the
seeds should next be fetched. It's currently every day, when we change over the daily trial.

# Moving to disk use

The next thing we did was try to remove/minimize DB reads from the equation. A bundle of replay data for a given seed is
just some JSON (with the actual replay data zipped up); that can be static! We wrote a Firebase cloud function that
grabs the replays for a given seed, and writes them to a static JSON file hosted on Firebase Storage (like Amazon S3).
It runs every hour, with every active seed. Clients grab data from that static JSON file, rather than hitting Firebase
directly. Like with seed queries, that data blob includes an expiry to tell clients when to fetch new data instead of
using the cache.

This worked great, although continued the pattern that users would see the same replays for the same seed. Again,
nobody's noticed, but it matters to us :)

This is also still using FIrebase FB, so our writes and reads are still high.

# Current attempt - all disk use!

Let's take the disk use strategy even farther!

The current stratgy we're working on: when trying to upload a recording, we look in a disk folder of recordings for that
seed. If there are fewer than 100, we upload that JSON file into that folder.

Once an hour, a process goes through each folder, collates those replays into a single static JSON for the client to
consume, and deletes the single-replay JSON files it took. That means that, at any given time, replays for a given seed
will be the first 100 people who played that seed in the current hour.

One explicit goal is that players should never play the same game twice. Part of that is going to be upping the number
of distinct royale seeds to 50 or 100, so you won't play the same game again unless you've played 100 rounds this hour.

Also to experiment with: upping the number of replays per seed to 200 or 300, so someone with offline data will have
more variety.
