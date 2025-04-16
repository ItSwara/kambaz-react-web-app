// import { ENROLL_COURSE, UNENROLL_COURSE } from "./actions";

import { ENROLL_COURSE, UNENROLL_COURSE } from "./actions";

// Define the enrollment state interface
interface EnrollmentState {
  enrollments: {
    user: string;
    course: string;
  }[];
}

// Initial state
const initialState: EnrollmentState = {
  enrollments: []
};

// Reducer function
const enrollmentReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case ENROLL_COURSE:
      return {
        ...state,
        enrollments: [
          ...state.enrollments,
          {
            user: action.payload.userId,
            course: action.payload.courseId
          }
        ]
      };

    case UNENROLL_COURSE:
      return {
        ...state,
        enrollments: state.enrollments.filter(
          enrollment => !(
            enrollment.user === action.payload.userId && 
            enrollment.course === action.payload.courseId
          )
        )
      };

    default:
      return state;
  }
};

export default enrollmentReducer;















// import { ENROLL_COURSE, UNENROLL_COURSE } from "./actions";

// interface Enrollment {
//   user: string;
//   course: string;
// }

// interface EnrollmentState {
//   enrollments: Enrollment[];
// }

// const initialState: EnrollmentState = {
//   enrollments: [],
// };

// const enrollmentReducer = (state = initialState, action: any): EnrollmentState => {
//   switch (action.type) {
//     case ENROLL_COURSE:
//       return {
//         ...state,
//         enrollments: [
//           ...state.enrollments,
//           { user: action.payload.userId, course: action.payload.courseId },
//         ],
//       };
//     case UNENROLL_COURSE:
//       return {
//         ...state,
//         enrollments: state.enrollments.filter(
//           (enrollment) =>
//             !(
//               enrollment.user === action.payload.userId &&
//               enrollment.course === action.payload.courseId
//             )
//         ),
//       };
//     default:
//       return state;
//   }
// };

// export default enrollmentReducer;