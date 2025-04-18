import { configureStore } from "@reduxjs/toolkit";
import modulesReducer from "./Courses/Modules/reducer";
import accountReducer from "./Account/reducer";
import assignmentReducer from "./Courses/Assignments/reducer"
import enrollmentReducer  from '../Kambaz/Dashboard/reducer';
import quizReducer from "../Kambaz/Courses/Quizzes/reducer";
const store = configureStore({
  reducer: {
    modulesReducer,
    accountReducer,
    assignmentReducer,
    enrollmentReducer,
    quizReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export default store;