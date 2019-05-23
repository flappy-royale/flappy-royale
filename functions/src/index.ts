import * as functions from "firebase-functions"
import { SeedsResponse } from "./api-contracts"
import * as admin from "firebase-admin"

// So we can access the db
admin.initializeApp()

/** Gets a consistent across all API versions seed for a day */
export const dailySeed = (version: string, offset: number) => {
    const date = new Date()
    return `${version}-${date.getFullYear()}-${date.getMonth()}-${date.getDate() + offset}`
}

/** Gets a consistent across all API versions seed for an hour */
export const hourlySeed = (version: string, offset: number) => {
    const date = new Date()
    return `${version}-${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours() + offset}}`
}

export const seeds = functions.https.onRequest((request, response) => {
    const version = request.query.version || request.params.version
    const responseJSON: SeedsResponse = {
        daily: {
            dev: dailySeed(version, 2),
            staging: dailySeed(version, 1),
            production: dailySeed(version, 0)
        },
        hourly: {
            dev: hourlySeed(version, 2),
            staging: hourlySeed(version, 1),
            production: hourlySeed(version, 0)
        }
    }
    response
        .status(200)
        .header("Access-Control-Allow-Origin", "*")
        .header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
        .send(responseJSON)
})

// WIP DB cleaner

// export const dbCleaner = functions.pubsub.schedule("every 1 day").onRun(async _context => {
//     // const allRecordings = await admin.database().ref("recordings/")
//     // const latestTwoBuilds = allRecordings

//     const url = "https://flappy-royale-3377a.firebaseio.com/recordings.json?shallow=true"
//     const apiVersions = await fetch(url)
//         .then(r => r.json())
//         .then(data => Object.keys(data))

//     // Assume we're working on prod and staging
//     const latestTwoAPIs = apiVersions.sort().slice(2)
//     for (const api of latestTwoAPIs) {
//         const db = admin.firestore()
        
//         const query = db.collection(`recordings/${api}/`)
//         // await deleteQueryBatch(db, query, 50)
//     }
// })

// // // // Grabbed this from
// // // // https://firebase.google.com/docs/firestore/manage-data/delete-data#collections
// const deleteQueryBatch = (db: admin.firestore.Firestore, query: admin.firestore.Query, batchSize: number, resolve: any, reject: any) => {
//     return query.get()
//       .then((snapshot) => {
//         // When there are no documents left, we are done
//         if (snapshot.size == 0) {
//           return 0;
//         }

//         // Delete documents in a batch
//         var batch = db.batch();
//         snapshot.docs.forEach((doc) => {
//           batch.delete(doc.ref);
//         });

//         return batch.commit().then(() => {
//           return snapshot.size;
//         });
//       }).then((numDeleted) => {
//         if (numDeleted === 0) {
//           resolve();
//           return;
//         }

//         // Recurse on the next process tick, to avoid
//         // exploding the stack.
//         process.nextTick(() => {
//           deleteQueryBatch(db, query, batchSize, resolve, reject);
//         });
//       })
//       .catch(reject);
//   }
