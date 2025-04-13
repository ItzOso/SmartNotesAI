import * as functions from "firebase-functions";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { FieldValue } from "firebase-admin/firestore";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();
initializeApp();
const db = getFirestore();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const generateSummary = functions.https.onCall(async (request) => {
  const auth = request.auth;

  if (!auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "No authorization token was found."
    );
  }

  try {
    const userRef = db.collection("users").doc(auth.uid);
    const userSnapshot = await userRef.get();

    if (!userSnapshot.exists) {
      throw new functions.https.HttpsError("not-found", "User data not found.");
    }

    const userData = userSnapshot.data();
    console.log(userData);
    const MAX_DAILY_USAGES = 5;
    const HOURS_24 = 24 * 60 * 60 * 1000;

    if (userData.usagesLeft === 0) {
      const lastReset = userData.lastReset?.toMillis?.() ?? 0;

      if (Date.now() - lastReset >= HOURS_24) {
        await userRef.update({
          usagesLeft: MAX_DAILY_USAGES - 1,
          lastReset: FieldValue.serverTimestamp(),
        });
      } else {
        throw new functions.https.HttpsError(
          "resource-exhausted",
          `You've used your ${MAX_DAILY_USAGES} free usages for the day. Resets every 24 hours.`
        );
      }
    } else {
      await userRef.update({
        usagesLeft: FieldValue.increment(-1),
      });

      console.log("Subtracted");
    }

    const content = request.data.content?.trim();
    if (!content) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Must send notes"
      );
    }

    if (content.trim().split(/\s+/).length < 50) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Notes must be 50+ words long"
      );
    }

    const systemPrompt = `
You are an AI-powered study assistant that summarizes student notes for quick review. Your summaries must:
- Focus only on key concepts or essential facts.
- Be significantly shorter than the original notes — no more than 30-50% of the original length.
- Never include full sentences from the notes unless they are extremely important.
- Avoid filler, repetition, or unnecessary phrasing.

If the original notes are short, your summary must be even shorter.
Never let the summary be close in length or longer than the original notes.
`;

    const userPrompt = `
Summarize the following notes into a concise, structured paragraph for study review. The summary must be no more than 30-50% the length of the original notes and only include the most important points.

Notes:
${content}
`;

    const response = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      max_tokens: 300,
      temperature: 0.3,
    });

    const summary = response.choices[0].message.content.trim();

    return { summary };
  } catch (error) {
    console.log("Erorr generating summary:", error);
    throw new functions.https.HttpsError(error.code, error.message);
  }
});

export const generateFlashcards = functions.https.onCall(async (request) => {
  const auth = request.auth;

  if (!auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "No authorization token was found."
    );
  }

  try {
    const userRef = db.collection("users").doc(auth.uid);
    const userSnapshot = await userRef.get();

    if (!userSnapshot.exists) {
      throw new functions.https.HttpsError("not-found", "User data not found.");
    }

    const userData = userSnapshot.data();
    const MAX_DAILY_USAGES = 5;
    const HOURS_24 = 24 * 60 * 60 * 1000;

    if (userData.usagesLeft === 0) {
      const lastReset = userData.lastReset?.toMillis?.() ?? 0;

      if (Date.now() - lastReset >= HOURS_24) {
        await userRef.update({
          usagesLeft: MAX_DAILY_USAGES - 1,
          lastReset: FieldValue.serverTimestamp(),
        });
      } else {
        throw new functions.https.HttpsError(
          "resource-exhausted",
          `You've used your ${MAX_DAILY_USAGES} free usages for the day. Resets every 24 hours.`
        );
      }
    } else {
      await userRef.update({
        usagesLeft: FieldValue.increment(-1),
      });
    }

    const content = request.data.content?.trim();
    if (!content) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Must send notes"
      );
    }

    if (content.trim().split(/\s+/).length < 75) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Notes must be 75+ words long"
      );
    }

    const systemPrompt = `
You are an AI that generates study flashcards from class notes.

Only respond with a JSON array of flashcard objects in this exact format:
[
  {
    "question": "A clear, concise question.",
    "answer": "An accurate, well-structured answer."
  }
]

Guidelines:
- Only use information found in the notes.
- If a term is mentioned without definition, infer its meaning from context.
- Do NOT use outside knowledge.
- Do NOT include any commentary, explanation, or markdown — only return a raw JSON array.
- Do NOT repeat flashcards.
- Each flashcard must test a distinct concept.
- Questions should be short and specific.
- Answers should be concise and factual.
`;

    const userPrompt = `
Generate 5 to 10 high-quality flashcards from the following class notes.

Respond with a JSON array only, in this format:
[
  { "question": "What is ...?", "answer": "..." }
]

If there’s not enough information for 5, generate as many as possible (minimum 1).

Class Notes:
${content}
`;

    const response = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      max_tokens: 500,
      temperature: 0.3,
    });

    const rawText = response.choices[0].message.content.trim();

    // Safely parse the flashcards JSON
    let flashcards = [];
    try {
      flashcards = JSON.parse(rawText);
    } catch (err) {
      throw new functions.https.HttpsError(
        "internal",
        "Failed to parse flashcards JSON. AI response:\n" + rawText
      );
    }

    return { flashcards };
  } catch (error) {
    console.log("Erorr generating flashcards:", error);
    throw new functions.https.HttpsError(error.code, error.message);
  }
});
