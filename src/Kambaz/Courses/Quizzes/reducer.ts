import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define Quiz interface with correct types
interface Quiz {
  _id: string;
  title: string;
  course: string | undefined;
  available_from_date?: string;
  due_date?: string;
  points: number | string;
  status?: string;
  published?: boolean;
  questions?: number;
  quizType?: string;
  timeLimit?: number;
  shuffleAnswers?: boolean;
  multipleAttempts?: boolean;
  showCorrectAnswers?: string;
  oneQuestionAtATime?: boolean;
  webcamRequired?: boolean;
  lockQuestionsAfterAnswering?: boolean;
  [key: string]: any; // For other properties
}

// Define the state interface
interface QuizState {
  quizzes: Quiz[];
  selectedQuiz: Quiz | null;
}

// Initial state with proper typing
const initialState: QuizState = {
  quizzes: [],
  selectedQuiz: null,
};

const quizSlice = createSlice({
  name: "quiz",
  initialState,
  reducers: {
    setQuizzes: (state, action: PayloadAction<Quiz[]>) => {
      state.quizzes = action.payload;
    },
    
    addQuiz: (state, action: PayloadAction<Quiz>) => {
      state.quizzes.push(action.payload);
    },
    
    updateQuiz: (state, action: PayloadAction<Quiz>) => {
      state.quizzes = state.quizzes.map(quiz => 
        quiz._id === action.payload._id ? { ...quiz, ...action.payload } : quiz
      );
    },
    
    deleteQuiz: (state, action: PayloadAction<string>) => {
      state.quizzes = state.quizzes.filter(quiz => quiz._id !== action.payload);
    },
    
    selectQuiz: (state, action: PayloadAction<Quiz>) => {
      state.selectedQuiz = action.payload;
    }
  },
});

export const { setQuizzes, addQuiz, updateQuiz, deleteQuiz, selectQuiz } = quizSlice.actions;
export default quizSlice.reducer;