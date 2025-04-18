// src/Kambaz/Courses/reducer.ts
export interface Course {
    _id: string;
    name: string;
    description: string;
    image?: string;
  }
  
  interface CourseAction {
    type: string;
    payload: any;
  }
  
  const initialState: Course[] = [];
  
  export const courseReducer = (state = initialState, action: CourseAction) => {
    switch (action.type) {
      case 'addCourse':
        return [...state, action.payload];
      case 'deleteCourse':
        return state.filter(course => course._id !== action.payload);
      case 'updateCourse':
        return state.map(course => 
          course._id === action.payload._id ? action.payload : course
        );
      case 'setCourses':
        return action.payload;
      default:
        return state;
    }
  };
  
  // Action creators
  export const addCourse = (course: Course) => ({
    type: 'addCourse',
    payload: course
  });
  
  export const removeCourse = (courseId: string) => ({
    type: 'deleteCourse',
    payload: courseId
  });
  
  export const editCourse = (course: Course) => ({
    type: 'updateCourse',
    payload: course
  });
  
  export const setCourses = (courses: Course[]) => ({
    type: 'setCourses',
    payload: courses
  });
  