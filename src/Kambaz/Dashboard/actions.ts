// export const ENROLL_COURSE = "ENROLL_COURSE";
// export const UNENROLL_COURSE = "UNENROLL_COURSE";

// export const enrollCourse = (userId: string, courseId: string) => ({
//   type: ENROLL_COURSE,
//   payload: { userId, courseId },
// });

// export const unenrollCourse = (userId: string, courseId: string) => ({
//   type: UNENROLL_COURSE,
//   payload: { userId, courseId },
// });

// Enhanced action creators with thunk pattern
// This is an alternative approach you could use for better integration

import axios from 'axios';

export const ENROLL_COURSE = "ENROLL_COURSE";
export const UNENROLL_COURSE = "UNENROLL_COURSE";
export const ENROLL_FAILURE = "ENROLL_FAILURE";
export const UNENROLL_FAILURE = "UNENROLL_FAILURE";

// Simple action creators
export const enrollCourse = (userId: any, courseId: string) => ({
  type: ENROLL_COURSE,
  payload: { userId, courseId },
});

export const unenrollCourse = (userId: any, courseId: string) => ({
  type: UNENROLL_COURSE,
  payload: { userId, courseId },
});

// Thunk action creators for API integration
export const enrollCourseAsync = (courseId: string) => async (dispatch: (arg0: { type: string; payload: { userId: any; courseId: string; } | { error: any; }; }) => void, getState: () => { (): any; new(): any; accountReducer: { currentUser: any; }; }) => {
  try {
    const { currentUser } = getState().accountReducer;
    
    const response = await axios.post(`/api/courses/${courseId}/enroll`, {}, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    // Dispatch success action
    dispatch(enrollCourse(currentUser._id, courseId));
    return response.data;
  } catch (error) {
    // Dispatch failure action
    dispatch({
      type: ENROLL_FAILURE,
      payload: { error:onmessage }
    });
    throw error;
  }
};

export const unenrollCourseAsync = (courseId: any) => async (dispatch: (arg0: { type: string; payload: { userId: any; courseId: any; } | { error: any; }; }) => void, getState: () => { (): any; new(): any; accountReducer: { currentUser: any; }; }) => {
  try {
    const { currentUser } = getState().accountReducer;
    
    const response = await axios.delete(`/api/courses/${courseId}/enroll`, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    // Dispatch success action
    dispatch(unenrollCourse(currentUser._id, courseId));
    return response.data;
  } catch (error) {
    // Dispatch failure action
    dispatch({
      type: UNENROLL_FAILURE,
      payload: { error:onmessage }
    });
    throw error;
  }
};