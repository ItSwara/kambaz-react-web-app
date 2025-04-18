import axios from "axios";

const REMOTE_SERVER = import.meta.env.VITE_REMOTE_SERVER;
const QUIZZES_API = `${REMOTE_SERVER}/api/quizzes`;
const COURSES_API = `${REMOTE_SERVER}/api/courses`;

// Get all quizzes for a course
export const findQuizzesForCourse = async (courseId: string) => {
  const response = await axios.get(`${COURSES_API}/${courseId}/quizzes`);
  return response.data;
};

// Get a quiz by ID
export const findQuizById = async (quizId: string) => {
  const response = await axios.get(`${QUIZZES_API}/${quizId}`);
  return response.data;
};

// Create a new quiz for a course
export const createQuiz = async (courseId: string, quiz: any) => {
  const response = await axios.post(`${COURSES_API}/${courseId}/quizzes`, quiz);
  return response.data;
};

// Update a quiz
export const updateQuiz = async (quiz: any) => {
  const response = await axios.put(`${QUIZZES_API}/${quiz._id}`, quiz);
  return response.data;
};

// Delete a quiz
export const deleteQuiz = async (quizId: string) => {
  const response = await axios.delete(`${QUIZZES_API}/${quizId}`);
  return response.data;
};

// Get all questions for a quiz
export const findQuestionsForQuiz = async (quizId: string) => {
  const response = await axios.get(`${QUIZZES_API}/${quizId}/questions`);
  return response.data;
};

// Create a new question for a quiz
export const createQuestion = async (quizId: string, question: any) => {
  const response = await axios.post(`${QUIZZES_API}/${quizId}/questions`, question);
  return response.data;
};

// Update a question
export const updateQuestion = async (questionId: string, question: any) => {
  const response = await axios.put(`${QUIZZES_API}/questions/${questionId}`, question);
  return response.data;
};

// Delete a question
export const deleteQuestion = async (questionId: string) => {
  const response = await axios.delete(`${QUIZZES_API}/questions/${questionId}`);
  return response.data;
};

// Submit a quiz attempt
export const submitQuizAttempt = async (quizId: string, attempt: any) => {
  const response = await axios.post(`${QUIZZES_API}/${quizId}/attempts`, attempt);
  return response.data;
};

// Get all attempts for a quiz for the current user
export const findAttemptsForQuiz = async (quizId: string) => {
  const response = await axios.get(`${QUIZZES_API}/${quizId}/attempts`);
  return response.data;
};