"use client"

import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth, sendEmailVerification, updateEmail, User as FirebaseUser } from "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyD58vD30x0yJPvWJfDy9ftjHzrhL8rkc5c",
  authDomain: "smartweigh.firebaseapp.com",
  projectId: "smartweigh",
  storageBucket: "smartweigh.firebasestorage.app",
  messagingSenderId: "746519829027",
  appId: "1:746519829027:web:9df624766f58f9f3186f96",
}

// Prevent multiple app instances (VERY IMPORTANT in Next.js)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()

export const auth = getAuth(app)

export async function sendEmailVerificationToCurrentUser(user: FirebaseUser) {
  return sendEmailVerification(user)
}

export async function updateUserEmail(currentUser: FirebaseUser, newEmail: string) {
  return updateEmail(currentUser, newEmail)
}