### Implementation Details of the Networking

You aren't connecting and playing in pure real-time against people. You can't interact with another player anyway in the
game. We explored a lot of ideas at the start on how you might influence other players, but eventually couldn't find a
game-design pattern that needed true real-time.

Instead we create internally consistent seeded games, store the replays of people playing them, and those are what you
can consider your opponents. Doing it this way drastically simplifies tech specs, but also frees you from the
concurrency problem with players. Who knows how many people could be playing on your timezone at this time? Unless the
game gets very popular, it's likely very few.

With that constraint, it becomes quite a simple networking problem, we have a singular API call which returns a set of
unique IDs which a game can be started from. The game can do an external db lookup for that ID to the backend to grab
all the existing replays. These are stored in a zipped string inside the db.

When a game is over, the game takes player's aesthetics, display name and a set of events and send it up to the server.
Events are a combination of timestamped triggers to flap, y co-ordinate syncs and when the played died (as well as score
metadata.) This makes it easy to replay the birds as though they were player characters, and to account for timing
issues when replaying on different device speeds.

Uploading a replay will have different behavior depending on the game mode.

-   If it's a royale then it will try to keep the max number of replays to a royale at a cap of 99 inserting the new
    replay randomly. This technique means you're always playing against the last people who played, but maybe not the
    2nd last.

-   If it's a trial, then only if it is better than another score (and could replace your own score.)

This keeps our database size consistent (e.g. N^3 players != N^3 db entries) and the data fresh.
