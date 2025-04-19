import axios from "axios";

const REMOTE_SERVER = import.meta.env.VITE_REMOTE_SERVER;
const QUIZ_API = `${REMOTE_SERVER}/api`;

const axiosWithCredentials = axios.create({
  withCredentials: true,
});

export const getQuizzesForCourse = async (courseId: any) => {
  const response = await axiosWithCredentials.get(`${QUIZ_API}/courses/${courseId}/quizzes`);
  return response.data;
};

export const publishQuiz = async (cid: any, quizId: any, quiz: any) => {
    quiz = { ...quiz, published: true };
    const response = await axiosWithCredentials.post(`${QUIZ_API}/courses/${cid}/quiz/${quizId}/publish`, quiz);
    return response.status;
}

export const unpublishQuiz = async (cid: any, quizId: any, quiz: any) => {
    quiz = { ...quiz, published: false };
    const response = await axiosWithCredentials.post(`${QUIZ_API}/courses/${cid}/quiz/${quizId}/unpublish`, quiz);
    return response.status;
}

export const getQuestionsForQuiz = async (cid: any, quizId: any) => {
    const response = await axiosWithCredentials.get(`${QUIZ_API}/courses/${cid}/quiz/${quizId}`)
    return response.data;
}

export const findQuizById = async (cid: any, quizId: any) => {
    const response = await axiosWithCredentials.get(`${QUIZ_API}/courses/${cid}/quiz/${quizId}/details`)
    return response.data;
}

export function updateQuiz(cid: string | undefined, qid: string, updatedQuiz: { _id: string | undefined; title: string; type: string; description: string; course: string | undefined; questions: never[]; published: boolean; points: number; assignmentGroup: string; shuffleAnswers: boolean; timeLimit: number; multipleAttempts: boolean; showCorrectAnswers: boolean; accessCode: string; oneQuestionAtATime: boolean; webcamRequired: boolean; lockQuestionsAfterAnswering: boolean; dueDate: string; availableFrom: string; availableUntil: string; createdAt: string; updatedAt: string; createdBy: { _id: number; username: string; password: string; firstName: string; lastName: string; email: string; role: string; }; }) {
    throw new Error("Function not implemented.");
}
export function createQuiz(cid: string | undefined, updatedQuiz: { _id: string | undefined; title: string; type: string; description: string; course: string | undefined; questions: never[]; published: boolean; points: number; assignmentGroup: string; shuffleAnswers: boolean; timeLimit: number; multipleAttempts: boolean; showCorrectAnswers: boolean; accessCode: string; oneQuestionAtATime: boolean; webcamRequired: boolean; lockQuestionsAfterAnswering: boolean; dueDate: string; availableFrom: string; availableUntil: string; createdAt: string; updatedAt: string; createdBy: { _id: number; username: string; password: string; firstName: string; lastName: string; email: string; role: string; }; }) {
    throw new Error("Function not implemented.");
}

