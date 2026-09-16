"use server";

import { extractText } from "unpdf";

export async function parsePdfAction(formData: FormData) {
  // 1. Extract the specific keys mapped by your front-end components
  const questionFile = formData.get("questionFile") as File | null;
  const answerKeyFile = formData.get("answerKeyFile") as File | null;

  if (!questionFile) {
    return { success: false, error: "Question file is required." };
  }

  try {
    let questionText = "";
    let answerKeyText = "";

    // 2. Parse the Question PDF
    const questionArrayBuffer = await questionFile.arrayBuffer();
    const questionBuffer = new Uint8Array(questionArrayBuffer);
    const parsedQuestion = await extractText(questionBuffer);
    questionText = parsedQuestion.text[0];

    // 3. Conditionally parse the Answer Key PDF if it was uploaded
    if (answerKeyFile && answerKeyFile.size > 0) {
      const answerKeyArrayBuffer = await answerKeyFile.arrayBuffer();
      const answerKeyBuffer = new Uint8Array(answerKeyArrayBuffer);
      const parsedAnswerKey = await extractText(answerKeyBuffer);
      answerKeyText = parsedAnswerKey.text[0];
    }

    // 4. Return matching key footprints expected by handleParse in your UI
    return {
      success: true,
      questionText,
      answerKeyText,
      text: questionText, // Fallback for backward compatibility
    };
  } catch (error: any) {
    console.error("PDF Parsing failed:", error);
    return {
      success: false,
      error: error.message || "Failed to process the uploaded PDF documents.",
    };
  }
}
