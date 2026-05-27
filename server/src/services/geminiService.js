import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
import { EXTRACT_ANSWERS_PROMPT, EVALUATE_ANSWERS_PROMPT, GENERATE_ANALYTICS_PROMPT } from '../prompts/evaluationPrompts.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const getModel = (vision = false) => {
  return genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
};

const safeParseJSON = (text) => {
  try {
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error('Failed to parse AI response as JSON');
  }
};

const fileToGenerativePart = (filePath, mimeType) => {
  const data = fs.readFileSync(filePath);
  return {
    inlineData: {
      data: data.toString('base64'),
      mimeType,
    },
  };
};

export const extractAnswers = async (filePaths) => {
  try {
    const model = getModel(true);
    const parts = [{ text: EXTRACT_ANSWERS_PROMPT }];

    for (const fp of filePaths) {
      if (fs.existsSync(fp.path)) {
        const mime = fp.mimetype || 'image/jpeg';
        if (mime.startsWith('image/') || mime === 'application/pdf') {
          parts.push(fileToGenerativePart(fp.path, mime));
        }
      }
    }

    const result = await model.generateContent(parts);
    const text = result.response.text();
    return safeParseJSON(text);
  } catch (err) {
    console.error('extractAnswers error:', err.message);
    return {
      extractedText: 'Could not extract text from uploaded files.',
      answers: [],
      confidence: 'low',
    };
  }
};

export const evaluateAnswers = async (examData) => {
  try {
    const model = getModel();
    const prompt = EVALUATE_ANSWERS_PROMPT(examData);
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return safeParseJSON(text);
  } catch (err) {
    console.error('evaluateAnswers error:', err.message);
    throw new Error('AI evaluation failed: ' + err.message);
  }
};

export const generateFeedback = async (evaluationData) => {
  try {
    const model = getModel();
    const prompt = `
      Based on this evaluation result, generate a comprehensive, encouraging yet honest feedback letter for the student.
      
      Evaluation: ${JSON.stringify(evaluationData)}
      
      Write a 3-4 paragraph feedback that:
      1. Acknowledges what was done well
      2. Points out specific areas that need improvement  
      3. Gives actionable study tips
      4. Ends with encouragement
      
      Return plain text feedback, not JSON.
    `;
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (err) {
    console.error('generateFeedback error:', err.message);
    return evaluationData.overallFeedback || 'Feedback generation failed.';
  }
};

export const generateAnalytics = async (classData) => {
  try {
    const model = getModel();
    const prompt = GENERATE_ANALYTICS_PROMPT(classData);
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return safeParseJSON(text);
  } catch (err) {
    console.error('generateAnalytics error:', err.message);
    throw new Error('Analytics generation failed: ' + err.message);
  }
};
