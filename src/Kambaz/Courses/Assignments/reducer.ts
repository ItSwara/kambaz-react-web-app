import { createSlice } from "@reduxjs/toolkit";
import { assignments } from "../../Database";

const initialState = {
  assignments: assignments,
};

const assignmentsSlice = createSlice({
    name: "assignments", 
    initialState,
    reducers: {
        setAssignments: (state, action) => {
            state.assignments = action.payload;
        },
        addAssignment: (state, { payload: assignment }) => {
            state.assignments = [...state.assignments, assignment] as any;
        },
        deleteAssignment: (state, { payload: assignmentId }) => {
            state.assignments = state.assignments.filter(
                (a) => a._id !== assignmentId);
        },
        updateAssignment: (state, { payload: assignment }) => {
            state.assignments = state.assignments.map((a) =>
                a._id === assignment._id ? assignment : a
            );
        },
        editAssignment: (state, { payload: assignmentId }) => {
            state.assignments = state.assignments.map((a) =>
                a._id === assignmentId ? { ...a, editing: true } : a
            );
        },
        // Additional reducers can be added here if needed
    },
});

export const { 
    setAssignments, 
    addAssignment, 
    deleteAssignment, 
    updateAssignment, 
    editAssignment 
} = assignmentsSlice.actions;
export default assignmentsSlice.reducer;




// import { createSlice } from "@reduxjs/toolkit";
// import { assignments } from "../../Database";

// const initialState = {
//   assignments: assignments,
// };

// const assignmentsSlice = createSlice({
//     name: "assignments", 
//     initialState,
//     reducers: {
//         addAssignment: (state, { payload: assignment }) => {
//         state.assignments = [...state.assignments, assignment] as any;
//         },
//         deleteAssignment: (state, { payload: assignmentId }) => {
//         state.assignments = state.assignments.filter(
//             (a) => a._id !== assignmentId);
//         },
//         updateAssignment: (state, { payload: assignment }) => {
//         state.assignments = state.assignments.map((a) =>
//             a._id === assignment._id ? assignment : a
//         );
//         },
//         editAssignment: (state, { payload: assignmentId }) => {
//         state.assignments = state.assignments.map((a) =>
//             a._id === assignmentId ? { ...a, editing: true } : a
//         );
//         },
//     },
// });

// export const { addAssignment, deleteAssignment, updateAssignment, editAssignment } = assignmentsSlice.actions;
// export default assignmentsSlice.reducer;





// import { createSlice } from "@reduxjs/toolkit";
// import { assignments as initialAssignments } from "../../Database";

// const initialState = {
//     assignments: initialAssignments,
// };

// const assignmentsSlice = createSlice({
//     name: "assignments",
//     initialState,
//     reducers: {
//         addAssignment: (state, { payload: assignment }) => {
//             const newAssignment = {
//                 _id: new Date().getTime().toString(),
//                 title: assignment.title,
//                 course: assignment.course,
//                 description: assignment.description,
//                 points: assignment.points,
//                 due_date: assignment.due_date,
//                 available_from_date: assignment.available_from_date,
//                 available_until_date: assignment.available_until_date,
//                 gradeType: assignment.gradeType,
//                 submissionType: assignment.submissionType,
//             };
//             state.assignments = [...state.assignments, newAssignment] as any;
//         },

//         updateAssignment: (state, { payload: updatedAssignment }) => {
//             state.assignments = state.assignments.map((assignment: any) =>
//                 assignment._id === updatedAssignment._id ? updatedAssignment : assignment
//             ) as any;
//         },
//         deleteAssignment: (state, { payload: assignmentId }) => {
//             state.assignments = state.assignments.filter(
//                 (assignment: any) => assignment._id !== assignmentId
//             );
//         },
//     },
// });

// export const {
//     addAssignment,
//     updateAssignment,
//     deleteAssignment,
// } = assignmentsSlice.actions;

// export default assignmentsSlice.reducer;
