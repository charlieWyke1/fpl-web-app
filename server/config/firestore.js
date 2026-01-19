import { db, FieldValue } from "./firebaseAdmin.js";
import { doc, collection, updateDoc } from "firebase/firestore";

export async function getUserById(userId) {
  try {
    const docRef = db.collection("users").doc(userId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      console.log("No user");
      return null;
    }

    return { id: docSnap.id, ...docSnap.data() };
  } catch (error) {
    console.error("Error getting user:", error);
    throw error;
  }
}

export async function getAllUsers(club) {
  try {
    const snapshot = await db.collection("users").get();
    const users = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    return users;
  } catch (error) {
    console.error("Error getting all users:", error);
    throw error;
  }
}

export async function getAllPlayers() {
  try {
    const snapshot = await db.collection("players").get();
    const players = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return players;
  } catch (error) {
    console.error("Error getting all players:", error);
    throw error;
  }
}

export async function getNumbSquads(club) {
  try {
    const docRef = await db.collection("clubs").doc(club);
    const doc = await docRef.get();

    if (!doc.exists) {
      console.log("No such club!");
      return null;
    }

    return doc.data().numbTeams;
  } catch (error) {
    console.error("Error getting number of squads:", error);
    throw error;
  }
}

// (userId, currentGW)
export async function getTeam(userId) {
  try {
    const gwDocRef = db.collection("teams").doc(userId).collection("gameweeks");
    const gwDoc = await gwDocRef.get();

    // console.log("hello");

    const gwData = gwDoc.docs.map((doc) => ({
      gw: doc.id.replace("gw", ""),
      ...doc.data(),
    }));

    console.log(gwData);

    return gwData;
  } catch (error) {
    console.error("Error getting team:", error);
    throw error;
  }
}

export async function addPlayer(name, cost, position, club, totalPoints, team) {
  try {
    const newPlayerRef = await db.collection("players").add({
      name,
      cost,
      position,
      club,
      totalPoints,
      gameweeks: {},
      team,
    });
    console.log("Player added with ID: ", newPlayerRef.id);
    return true;
  } catch (error) {
    console.error("Error adding player:", error);
  }
}

export async function getFixtures(club) {
  try {
    const clubRef =  db.collection("fixtures").doc(club);

    const result = {}; 
    
    const squadCollections = await clubRef.listCollections();
    for (const squad of squadCollections) {
      // skip cutOff for now
      if (squad.id === "cutOff") continue;

      result[squad.id] = {};
      const gwDocRef = squad.doc("gameweeks");
      const gwCollections = await gwDocRef.listCollections(); // gets gw1, gw2, ...

      for (const gw of gwCollections) {
        const fixtureSnapshot = await gw.get();
        result[squad.id][gw.id] = {};
        fixtureSnapshot.forEach((fixtureDoc) => {
          result[squad.id][gw.id][fixtureDoc.id] = fixtureDoc.data();
        });
      }
    }

    // now get cutoff data
    const cutOffDocRef = await clubRef.collection("cutOff").doc("fplCutOffTime");
    const cutOffDoc = await cutOffDocRef.get();

    if (cutOffDoc.exists) {
      const gameweeksMap = cutOffDoc.data().gameweeks || {};
      result.cutOff = gameweeksMap;
    } else {
      result.cutOff = {}
    }

    return result;
  } catch (error) {
    console.error("Error getting fixtures:", error);
    throw error;
  }
}

export async function addResult(
  homeScore,
  awayScore,
  userClub,
  squad,
  gw,
  fixture
) {
  try {
    const fixtureRef = db
      .collection("fixtures")
      .doc(userClub)
      .collection(squad)
      .doc("gameweeks")
      .collection(gw)
      .doc(fixture);

    await fixtureRef.update({
      "home.score": homeScore,
      "away.score": awayScore,
      status: "played",
    });

    return true;
  } catch (error) {
    console.error("Error adding result:", error);
    throw error;
  }
}

export async function updateGW(userId, newGW) {
  try {
    const userRef = db.collection("users").doc(userId);
    await userRef.update({ currentGW: newGW });
    return true;
  } catch (error) {
    console.error("Error updating current GW:", error);
    throw error;
  }
}

export async function addGWPoints(playerData, gw) {
  try {
    const batch = db.batch();

    playerData.forEach((player) => {
      const { playerId, goals, assists, yellows, reds, cleanSheet, gwPoints } =
        player;
      const playerRef = db.collection("players").doc(playerId);

      batch.set(
        playerRef,
        {
          gameweeks: {
            [gw]: {
              goals: goals || 0,
              assists: assists || 0,
              yellows: yellows || 0,
              reds: reds || 0,
              started: true,
              cleanSheet: cleanSheet,
              gwPoints: gwPoints || 0,
            },
          },
          totalPoints: FieldValue.increment(gwPoints || 0),
        },
        { merge: true }
      );
    });
    await batch.commit();

    return true;
  } catch (error) {
    console.error("Error adding GW points:", error);
    throw error;
  }
}

export async function checkTeamExistence(userId) {
  try {
    const teamDocRef = db.collection("teams").doc(userId);
    const docSnap = await teamDocRef.get();

    return docSnap.exists;
  } catch (error) {
    console.error("Error checking team existence:", error);
    throw error;
  }
}

export async function getTeamData(club) {
  try {
    const clubDocRef = db.collection("clubs").doc(club);
    const docSnap = await clubDocRef.get();
    return docSnap.data();
  } catch (error) {
    console.error("Error getting team data:", error);
    throw error;
  }
}

export async function saveFirstTeam(userId, teamName, team, gw, budget) {
  try {
    const teamRef = db.collection("teams").doc(userId);
    const gwKey = `gw${gw}`;

    await teamRef.set(
      {
        budget: budget,
        gameweeks: {
          [gwKey]: {
            team: team,
            savedAt: new Date(),
          },
        },
      },
      { merge: true }
    );

    const userRef = db.collection("users").doc(userId);
    await userRef.set({ teamName: teamName }, { merge: true });

    return true;
  } catch (error) {
    console.error("Error saving team:", error);
    throw error;
  }
}

export async function getCurrentGWTeam(userId, gw) {
  try {
    const teamRef = db.collection("teams").doc(userId);
    const docSnap = await teamRef.get();
    const teamData = docSnap.data();

    return teamData;
  } catch (error) {
    console.error("Error finding team", error);
    throw error;
  }
}

export async function saveFirstSquad(userId, squad, gw) {
  try {
    const teamRef = db.collection("teams").doc(userId);
    const gwKey = `gw${gw}`;

    await teamRef.set(
      {
        gameweeks: {
          [gwKey]: {
            team: squad,
            savedAt: new Date(),
          },
        },
      },
      { merge: true }
    );

    return true;
  } catch (error) {
    console.error("Error saving team: ", error);
    throw error;
  }
}
