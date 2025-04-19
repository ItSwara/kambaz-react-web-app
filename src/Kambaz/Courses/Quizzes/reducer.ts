import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  quizzes: [] as any,
};

const quizSlice = createSlice({
    name: "quizzes", 
    initialState,
    reducers: {
        setQuiz: (state, { payload: quizzes }) => {
            state.quizzes = quizzes as any;
        },
        addQuiz: (state, { payload: quiz }) => {
        state.quizzes = [...state.quizzes, quiz] as any;
        },
        editQuiz: (state, { payload: quizId }) => {
        state.quizzes = state.quizzes.map((a: { _id: any; }) =>
            a._id === quizId ? { ...a, editing: true } : a
        );
        },
    },
});

export const { setQuiz, addQuiz, editQuiz } = quizSlice.actions;
export default quizSlice.reducer;