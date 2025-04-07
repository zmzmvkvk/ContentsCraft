// src/lib/firebaseService.js
import { db } from "../lib/firebase";
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";

const FAVORITE_PATH = "favorite";

export async function fetchFavoritesFromDB() {
  const snapshot = await getDocs(collection(db, FAVORITE_PATH));
  return snapshot.docs.map((doc) => doc.data());
}

export async function addFavoriteToDB(video) {
  const ref = doc(db, FAVORITE_PATH, video.id);
  await setDoc(ref, video);
}

export async function removeFavoriteFromDB(videoId) {
  const ref = doc(db, FAVORITE_PATH, videoId);
  await deleteDoc(ref);
}

export async function updateFavoriteMemo(videoId, memo) {
  const ref = doc(db, FAVORITE_PATH, videoId);
  await updateDoc(ref, { memo });
}

export async function updateFavoriteStrategy(videoId, strategyObj) {
  // console.log("✅ updateStrategy 대상:", videoId, strategyObj);
  const ref = doc(db, FAVORITE_PATH, videoId);
  await setDoc(ref, strategyObj, { merge: true });
}
