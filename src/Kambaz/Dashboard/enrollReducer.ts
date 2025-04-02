import { createSlice } from "@reduxjs/toolkit";

// Define the enrollment interface
interface Enrollment {
  _id?: string;
  user: string;
  course: string;
}

// Define the initial state
interface EnrollmentState {
  enrollments: Enrollment[];
}

const initialState: EnrollmentState = {
  enrollments: [],
};

// Create the enrollment slice
const enrollSlice = createSlice({
  name: "enroll",
  initialState,
  reducers: {
    setEnrollments: (state, action) => {
      state.enrollments = action.payload;
    },
    addEnrollment: (state, action) => {
      state.enrollments = [...state.enrollments, action.payload];
    },
    deleteEnrollments: (state, action) => {
      state.enrollments = state.enrollments.filter(
        (e) => !(e.user === action.payload.userId && e.course === action.payload.courseId)
      );
    },
  }
});

// Export actions and reducer
export const { setEnrollments, addEnrollment, deleteEnrollments } = enrollSlice.actions;
export default enrollSlice.reducer;













// import { createSlice } from "@reduxjs/toolkit";

// // Define the enrollment interface
// interface Enrollment {
//   _id?: string;
//   user: string;
//   course: string;
// }

// // Define the initial state
// interface EnrollmentState {
//   enrollments: Enrollment[];
// }

// const initialState: EnrollmentState = {
//   enrollments: [],
// };

// // Create the enrollment slice
// const enrollSlice = createSlice({
//   name: "enroll",
//   initialState,
//   reducers: {
//     setEnrollments: (state, action) => {
//       state.enrollments = action.payload;
//     },
//     addEnrollment: (state, action) => {
//       state.enrollments = [...state.enrollments, action.payload];
//     },
//     deleteEnrollments: (state, action) => {
//       state.enrollments = state.enrollments.filter(
//         (e) => !(e.user === action.payload.userId && e.course === action.payload.courseId)
//       );
//     },
//   }
// });

// // Export actions and reducer
// export const { setEnrollments, addEnrollment, deleteEnrollments } = enrollSlice.actions;
// export default enrollSlice.reducer;