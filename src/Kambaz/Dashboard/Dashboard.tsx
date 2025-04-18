import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "react-bootstrap";
import { useSelector } from "react-redux";
import axios from "axios";

// Define the type for a course
interface Course {
  _id: string;
  name: string;
  description: string;
  image?: string;
  enrolled?: boolean;
}

// Define the props interface for the Dashboard component
interface DashboardProps {
  courses: Course[];
  newCourse: Course;
  editMode: boolean;
  setCourses: (courses: Course[]) => void;
  setNewCourse: (course: Course) => void;
  setEditMode: (editMode: boolean) => void;
  addNewCourse: () => void;
  deleteCourse: (courseId: string) => void;
  updateCourse: () => void;
  enrolling: boolean;
  setEnrolling: (enrolling: boolean) => void;
  updateEnrollment: (courseId: string, enrolled: boolean) => void;
}

// Define your base API URL - adjust this to match your server
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

export default function Dashboard({
  courses,
  newCourse,
  editMode,
  setCourses,
  setNewCourse,
  setEditMode,
  addNewCourse,
  deleteCourse,
  updateCourse,
  enrolling,
  setEnrolling,
  updateEnrollment
}: DashboardProps) {
  const { currentUser } = useSelector((state: any) => state.accountReducer);
  
  // State for loading
  const [isLoading, setIsLoading] = useState(false);
  
  // Error state
  const [error, setError] = useState<string | null>(null);

  const userRole = currentUser?.role;

  return (
    <div className="p-4" id="wd-dashboard">
      <div className="d-flex justify-content-between align-items-center">
        <h1 id="wd-dashboard-title">Dashboard</h1>
        <button
          className="btn btn-primary"
          onClick={() => setEnrolling(!enrolling)}
          disabled={isLoading}
          id="toggle-courses-button"
        >
          {isLoading 
            ? "Loading..." 
            : (enrolling ? "My Courses" : "All Courses")
          }
        </button>
      </div>
      <hr />
      
      {userRole === "FACULTY" && (
        <div className="d-flex align-items-start mb-3">
          <h5 className="me-3">{editMode ? "Edit Course" : "New Course"}</h5>
          <div className="flex-grow-1">
            <input
              type="text"
              className="form-control mb-2"
              placeholder="Course Name"
              value={newCourse.name || ""}
              onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
            />
            <textarea
              className="form-control"
              rows={3}
              placeholder="Course Description"
              value={newCourse.description || ""}
              onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
            />
          </div>
          {editMode ? (
            <button className="btn btn-warning ms-3" onClick={updateCourse}>Update</button>
          ) : (
            <button 
              className="btn btn-primary ms-3" 
              onClick={addNewCourse}
            >
              Add
            </button>
          )}
        </div>
      )}
      
      <hr />
      <h2 id="wd-dashboard-published">
        {enrolling 
          ? `All Courses (${courses.length})` 
          : `My Courses (${courses.length})`
        }
      </h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <hr />
      
      {isLoading ? (
        <div className="text-center p-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-md-3 g-4">
          {courses.map((course) => (
            <div key={course._id} className="col">
              <div className="card h-100">
                <Link
                  to={userRole === "FACULTY" ? `/Kambaz/Courses/${course._id}/Home` : (course.enrolled ? `/Kambaz/Courses/${course._id}/Home` : "#")}
                  className="text-decoration-none text-dark"
                  onClick={(e) => {
                    if (userRole !== "FACULTY" && !course.enrolled) {
                      e.preventDefault();
                      alert("You must be enrolled to access this course.");
                    }
                  }}
                >
                  <img
                    src={course.image || `/images/${course._id}.png`}
                    alt={course.name}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/images/reactjs.jpg"; // Fallback image
                    }}
                    className="card-img-top"
                    style={{ height: "160px", objectFit: "cover" }}
                  />
                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title text-nowrap overflow-hidden">
                      {enrolling && (
                        <button
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            updateEnrollment(course._id, !course.enrolled);
                          }}
                          className={`btn ${course.enrolled ? "btn-danger" : "btn-success"} float-end`}
                        >
                          {course.enrolled ? "Unenroll" : "Enroll"}
                        </button>
                      )}
                      {course.name}
                    </h5>
                    <p className="card-text overflow-hidden" style={{ height: "100px" }}>{course.description}</p>
                    <div className="mt-auto d-flex justify-content-between align-items-center">
                      <Button variant="primary">View Course</Button>
                      {userRole === "FACULTY" ? (
                        <div>
                          <button
                            onClick={(event) => {
                              event.preventDefault();
                              deleteCourse(course._id);
                            }}
                            className="btn btn-danger me-2"
                          >
                            Delete
                          </button>
                          <button
                            onClick={(event) => {
                              event.preventDefault();
                              setNewCourse(course);
                              setEditMode(true);
                            }}
                            className="btn btn-warning"
                          >
                            Edit
                          </button>
                        </div>
                      ) : (
                        !enrolling && course.enrolled && (
                          <button
                            className="btn btn-danger"
                            onClick={(e) => {
                              e.preventDefault();
                              updateEnrollment(course._id, false);
                            }}
                          >
                            Unenroll
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// import { useState, useEffect } from "react";
// import { Link } from "react-router-dom";
// import { Button } from "react-bootstrap";
// import { useSelector } from "react-redux";
// import axios from "axios";

// // Define the type for a course
// interface Course {
//   _id: string;
//   name: string;
//   description: string;
//   image?: string;
//   enrolled?: boolean;
// }

// // Define the props interface for the Dashboard component
// interface DashboardProps {
//   courses: Course[];
//   newCourse: Course;
//   editMode: boolean;
//   setCourses: (courses: Course[]) => void;
//   setNewCourse: (course: Course) => void;
//   setEditMode: (editMode: boolean) => void;
//   addNewCourse: () => void;
//   deleteCourse: (courseId: string) => void;
//   updateCourse: () => void;
// }

// // Define your base API URL - adjust this to match your server
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

// export default function Dashboard({
//   courses,
//   newCourse,
//   editMode,
//   setCourses,
//   setNewCourse,
//   setEditMode,
//   addNewCourse,
//   deleteCourse,
//   updateCourse,
// }: DashboardProps) {
//   const { currentUser } = useSelector((state: any) => state.accountReducer);
  
//   // State for enrolled courses
//   const [enrollments, setEnrollments] = useState<any[]>([]);
//   const userRole = currentUser?.role;
  
//   // State for toggle
//   const [showAllCourses, setShowAllCourses] = useState(false);
  
//   // Loading state
//   const [isLoading, setIsLoading] = useState(false);
  
//   // Error state
//   const [error, setError] = useState<string | null>(null);

//   // Configure axios to include credentials
//   const api = axios.create({
//     baseURL: API_BASE_URL,
//     withCredentials: true, // Important for session cookies
//   });

//   // Fetch all enrollments on component mount
//   useEffect(() => {
//     const fetchEnrollments = async () => {
//       if (!currentUser?._id) return;
      
//       try {
//         const response = await api.get(`/api/enrollments`);
//         setEnrollments(response.data || []);
//       } catch (err) {
//         console.error("Error fetching enrollments:", err);
//         setEnrollments([]);
//       }
//     };

//     fetchEnrollments();
//   }, [currentUser]);

//   // Fetch all courses function
//   const fetchAllCourses = async () => {
//     setIsLoading(true);
//     setError(null);
//     try {
//       const response = await api.get(`/api/courses`);
      
//       // Mark enrolled courses
//       const markedCourses = response.data.map((course: Course) => ({
//         ...course,
//         enrolled: enrollments.some(
//           (enrollment: any) => enrollment.user === currentUser._id && enrollment.course === course._id
//         )
//       }));
      
//       setCourses(markedCourses);
//     } catch (err) {
//       console.error("Error fetching all courses:", err);
//       setError("Failed to fetch courses. Please try again.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Fetch enrolled courses for the current user
//   const fetchEnrolledCourses = async () => {
//     if (!currentUser?._id) return;
    
//     setIsLoading(true);
//     setError(null);
//     try {
//       const response = await api.get(`/api/users/${currentUser._id}/courses`);
      
//       // Mark all courses as enrolled
//       const enrolledCourses = response.data.map((course: Course) => ({
//         ...course,
//         enrolled: true
//       }));
      
//       setCourses(enrolledCourses);
//     } catch (err) {
//       console.error("Error fetching enrolled courses:", err);
//       setError("Failed to fetch enrolled courses. Please try again.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Load initial courses based on toggle state
//   useEffect(() => {
//     if (showAllCourses) {
//       fetchAllCourses();
//     } else {
//       fetchEnrolledCourses();
//     }
//   }, [showAllCourses, currentUser, enrollments.length]);

//   // Toggle handler
//   const handleToggleClick = () => {
//     setShowAllCourses(!showAllCourses);
//   };

//   // Enrollment toggle function
//   const toggleEnrollment = async (courseId: string) => {
//     if (!currentUser?._id) return;
    
//     const isEnrolled = enrollments.some(
//       (enrollment: any) => enrollment.user === currentUser._id && enrollment.course === courseId
//     );

//     try {
//       setError(null);
//       if (isEnrolled) {
//         // Unenroll
//         await api.delete(`/api/courses/${courseId}/enroll`);
        
//         // Update local state
//         setEnrollments(
//           enrollments.filter(
//             (e) => !(e.user === currentUser._id && e.course === courseId)
//           )
//         );
        
//         // Update course enrollment status
//         setCourses(courses.map(course => 
//           course._id === courseId 
//             ? { ...course, enrolled: false } 
//             : course
//         ));
        
//         // Refresh courses if viewing enrolled courses
//         if (!showAllCourses) {
//           await fetchEnrolledCourses();
//         }
//       } else {
//         // Enroll
//         const response = await api.post(`/api/courses/${courseId}/enroll`);
//         setEnrollments([...enrollments, response.data]);
        
//         // Update course enrollment status
//         setCourses(courses.map(course => 
//           course._id === courseId 
//             ? { ...course, enrolled: true } 
//             : course
//         ));
//       }
//     } catch (err: any) {
//       console.error("Error toggling enrollment:", err);
//       setError(err.response?.data?.message || "Failed to update enrollment. Please try again.");
//     }
//   };

//   return (
//     <div className="p-4" id="wd-dashboard">
//       <div className="d-flex justify-content-between align-items-center">
//         <h1 id="wd-dashboard-title">Dashboard</h1>
//         <button
//           className="btn btn-primary"
//           onClick={handleToggleClick}
//           disabled={isLoading}
//           id="toggle-courses-button"
//         >
//           {isLoading 
//             ? "Loading..." 
//             : (showAllCourses ? "My Courses" : "All Courses")
//           }
//         </button>
//       </div>
//       <hr />
      
//       {userRole === "FACULTY" && (
//         <div className="d-flex align-items-start mb-3">
//           <h5 className="me-3">{editMode ? "Edit Course" : "New Course"}</h5>
//           <div className="flex-grow-1">
//             <input
//               type="text"
//               className="form-control mb-2"
//               placeholder="Course Name"
//               value={newCourse.name || ""}
//               onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
//             />
//             <textarea
//               className="form-control"
//               rows={3}
//               placeholder="Course Description"
//               value={newCourse.description || ""}
//               onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
//             />
//           </div>
//           {editMode ? (
//             <button className="btn btn-warning ms-3" onClick={updateCourse}>Update</button>
//           ) : (
//             <button 
//               className="btn btn-primary ms-3" 
//               onClick={addNewCourse}
//             >
//               Add
//             </button>
//           )}
//         </div>
//       )}
      
//       <hr />
//       <h2 id="wd-dashboard-published">
//         {showAllCourses 
//           ? `All Courses (${courses.length})` 
//           : `My Courses (${courses.length})`
//         }
//       </h2>
//       {error && <div className="alert alert-danger">{error}</div>}
//       <hr />
      
//       {isLoading ? (
//         <div className="text-center p-5">
//           <div className="spinner-border" role="status">
//             <span className="visually-hidden">Loading...</span>
//           </div>
//         </div>
//       ) : (
//         <div className="row row-cols-1 row-cols-md-3 g-4">
//           {courses.map((course) => (
//             <div key={course._id} className="col">
//               <div className="card h-100">
//                 <Link
//                   to={userRole === "FACULTY" ? `/Kambaz/Courses/${course._id}/Home` : (course.enrolled ? `/Kambaz/Courses/${course._id}/Home` : "#")}
//                   className="text-decoration-none text-dark"
//                   onClick={(e) => {
//                     if (userRole !== "FACULTY" && !course.enrolled) {
//                       e.preventDefault();
//                       alert("You must be enrolled to access this course.");
//                     }
//                   }}
//                 >
//                   <img
//                     src={course.image || `/images/${course._id}.png`}
//                     alt={course.name}
//                     onError={(e) => {
//                       const target = e.target as HTMLImageElement;
//                       target.src = "/images/reactjs.jpg"; // Fallback image
//                     }}
//                     className="card-img-top"
//                     style={{ height: "160px", objectFit: "cover" }}
//                   />
//                   <div className="card-body d-flex flex-column">
//                     <h5 className="card-title text-nowrap overflow-hidden">{course.name}</h5>
//                     <p className="card-text overflow-hidden" style={{ height: "100px" }}>{course.description}</p>
//                     <div className="mt-auto d-flex justify-content-between align-items-center">
//                       <Button variant="primary">View Course</Button>
//                       {userRole === "FACULTY" ? (
//                         <div>
//                           <button
//                             onClick={(event) => {
//                               event.preventDefault();
//                               deleteCourse(course._id);
//                             }}
//                             className="btn btn-danger me-2"
//                           >
//                             Delete
//                           </button>
//                           <button
//                             onClick={(event) => {
//                               event.preventDefault();
//                               setNewCourse(course);
//                               setEditMode(true);
//                             }}
//                             className="btn btn-warning"
//                           >
//                             Edit
//                           </button>
//                         </div>
//                       ) : (
//                         <button
//                           className={`btn ${course.enrolled ? "btn-danger" : "btn-success"}`}
//                           onClick={(e) => {
//                             e.preventDefault();
//                             toggleEnrollment(course._id);
//                           }}
//                         >
//                           {course.enrolled ? "Unenroll" : "Enroll"}
//                         </button>
//                       )}
//                     </div>
//                   </div>
//                 </Link>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }





// import { useState, useEffect } from "react";
// import { Link } from "react-router-dom";
// import { Button } from "react-bootstrap";
// import { useSelector } from "react-redux";
// import axios from "axios";

// // Define the type for a course
// interface Course {
//   _id: string;
//   name: string;
//   description: string;
//   image?: string;
// }

// // Define the props interface for the Dashboard component
// interface DashboardProps {
//   courses: Course[];
//   newCourse: Course;
//   editMode: boolean;
//   setCourses: (courses: Course[]) => void;
//   setNewCourse: (course: Course) => void;
//   setEditMode: (editMode: boolean) => void;
//   addNewCourse: () => void;
//   deleteCourse: (courseId: string) => void;
//   updateCourse: () => void;
// }

// // Define your base API URL - adjust this to match your server
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL  || "http://localhost:4000" ;//|| "https://kambaz-node-server-app-lba7.onrender.com" ;

// export default function Dashboard({
//   courses,
//   newCourse,
//   editMode,
//   setCourses,
//   setNewCourse,
//   setEditMode,
//   addNewCourse,
//   deleteCourse,
//   updateCourse,
// }: DashboardProps) {
//   //const dispatch = useDispatch();
//   const { currentUser } = useSelector((state: any) => state.accountReducer);
  
//   // Initialize with local state instead of relying on Redux immediately
//   const [enrollments, setEnrollments] = useState<any[]>([]);
//   const userRole = currentUser.role;
  
//   // State for toggle
//   const [showAllCourses, setShowAllCourses] = useState(false);
  
//   // Loading state
//   const [isLoading, setIsLoading] = useState(false);
  
//   // Error state
//   const [error, setError] = useState<string | null>(null);

//   // Configure axios to include credentials
//   const api = axios.create({
//     baseURL: API_BASE_URL,
//     withCredentials: true, // Important for session cookies
//   });

//   // Fetch all enrollments on component mount
//   useEffect(() => {
//     const fetchEnrollments = async () => {
//       try {
//         const response = await api.get(`/api/enrollments`);
//         setEnrollments(response.data || []);
//       } catch (err) {
//         console.error("Error fetching enrollments:", err);
//         setEnrollments([]);
//       }
//     };

//     fetchEnrollments();
//   }, []);

//   // Fetch all courses function
//   const fetchAllCourses = async () => {
//     setIsLoading(true);
//     setError(null);
//     try {
//       const response = await api.get(`/api/courses`);
//       setCourses(response.data);
//     } catch (err) {
//       console.error("Error fetching all courses:", err);
//       setError("Failed to fetch courses. Please try again.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Fetch enrolled courses for the current user
//   const fetchEnrolledCourses = async () => {
//     setIsLoading(true);
//     setError(null);
//     try {
//       // Get all enrollments for the current user
//       const enrollmentsResponse = await api.get(`/api/users/${currentUser._id}/enrollments`);
//       const userEnrollments = enrollmentsResponse.data;
      
//       // Get all courses
//       const coursesResponse = await api.get(`/api/courses`);
//       const allCourses = coursesResponse.data;
      
//       // Filter courses based on user enrollments
//       const enrolledCourseIds = userEnrollments.map((enrollment: any) => enrollment.course);
//       const enrolledCourses = allCourses.filter((course: Course) => 
//         enrolledCourseIds.includes(course._id)
//       );
      
//       setCourses(enrolledCourses);
//     } catch (err) {
//       console.error("Error fetching enrolled courses:", err);
//       setError("Failed to fetch enrolled courses. Please try again.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Toggle handler
//   const handleToggleClick = async () => {
//     if (!showAllCourses) {
//       // Show all courses
//       await fetchAllCourses();
//     } else {
//       // Show only enrolled courses
//       await fetchEnrolledCourses();
//     }
//     setShowAllCourses(!showAllCourses);
//   };

//   // Enrollment toggle function
//   const toggleEnrollment = async (courseId: string) => {
//     const isEnrolled = enrollments.some(
//       (enrollment: any) => enrollment.user === currentUser._id && enrollment.course === courseId
//     );

//     try {
//       setError(null);
//       if (isEnrolled) {
//         // Unenroll
//         const response = await api.delete(`/api/courses/${courseId}/enroll`);
//         console.log("Unenroll response:", response.data);
        
//         // Update local state
//         setEnrollments(
//           enrollments.filter(
//             (e) => !(e.user === currentUser._id && e.course === courseId)
//           )
//         );
        
//         // Refresh courses if viewing enrolled courses
//         if (!showAllCourses) {
//           await fetchEnrolledCourses();
//         }
//       } else {
//         // Enroll
//         const response = await api.post(`/api/courses/${courseId}/enroll`);
//         console.log("Enroll response:", response.data);
//         setEnrollments([...enrollments, response.data]);
//       }
//     } catch (err: any) {
//       console.error("Error toggling enrollment:", err);
//       setError(err.response?.data?.message || "Failed to update enrollment. Please try again.");
//     }
//   };

//   // Compute enrolled courses based on local state
//   const userEnrolledCourses = courses.filter((course) =>
//     enrollments.some(
//       (enrollment: any) => enrollment.user === currentUser._id && enrollment.course === course._id
//     )
//   );

//   // Determine which courses to display
//   const coursesToDisplay = showAllCourses ? courses : userEnrolledCourses;

//   return (
//     <div className="p-4" id="wd-dashboard">
//       <div className="d-flex justify-content-between align-items-center">
//         <h1 id="wd-dashboard-title">Dashboard</h1>
//         <button
//           className="btn btn-primary"
//           onClick={handleToggleClick}
//           disabled={isLoading}
//           id="toggle-courses-button"
//         >
//           {isLoading 
//             ? "Loading..." 
//             : (showAllCourses ? "Enrolled Courses" : "All Courses")
//           }
//         </button>
//       </div>
//       <hr />
//       {userRole === "FACULTY" && (
//         <div className="d-flex align-items-start mb-3">
//           <h5 className="me-3">{editMode ? "Edit Course" : "New Course"}</h5>
//           <div className="flex-grow-1">
//             <input
//               type="text"
//               className="form-control mb-2"
//               value={newCourse.name}
//               onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
//             />
//             <textarea
//               className="form-control"
//               rows={3}
//               value={newCourse.description}
//               onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
//             />
//           </div>
//           {editMode ? (
//             <button className="btn btn-warning ms-3" onClick={updateCourse}>Update</button>
//           ) : (
//             <button 
//               className="btn btn-primary ms-3" 
//               onClick={() => {
//                 addNewCourse();
//                 // Auto-enroll faculty in their newly created course
//                 if (newCourse._id) {
//                   toggleEnrollment(newCourse._id);
//                 }
//               }}
//             >
//               Add
//             </button>
//           )}
//         </div>
//       )}
//       <hr />
//       <h2 id="wd-dashboard-published">
//         {showAllCourses 
//           ? `All Courses (${coursesToDisplay.length})` 
//           : `Enrolled Courses (${coursesToDisplay.length})`
//         }
//       </h2>
//       {error && <div className="alert alert-danger">{error}</div>}
//       <hr />
//       {isLoading ? (
//         <div className="text-center p-5">
//           <div className="spinner-border" role="status">
//             <span className="visually-hidden">Loading...</span>
//           </div>
//         </div>
//       ) : (
//         <div className="row row-cols-1 row-cols-md-3 g-4">
//           {coursesToDisplay.map((course) => {
//             const isEnrolled = enrollments.some(
//               (enrollment: any) => enrollment.user === currentUser._id && enrollment.course === course._id
//             );

//             return (
//               <div key={course._id} className="col">
//                 <div className="card" style={{ width: "100%" }}>
//                   <Link
//                     to={userRole === "FACULTY" ? `/Kambaz/Courses/${course._id}/Home` : (isEnrolled ? `/Kambaz/Courses/${course._id}/Home` : "#")}
//                     className="text-decoration-none text-dark"
//                     onClick={(e) => {
//                       if (userRole !== "FACULTY" && !isEnrolled) {
//                         e.preventDefault();
//                         alert("You must be enrolled to access this course.");
//                       }
//                     }}
//                   >
//                     <img
//                       src={course.image || `/images/${course._id}.png`}
//                       alt="Course"
//                       onError={(e) => {
//                         const target = e.target as HTMLImageElement;
//                         target.src = "/images/reactjs.jpg"; // Fallback image
//                       }}
//                       style={{ width: "100%", height: "160px" }}
//                     />
//                     <div className="card-body">
//                       <h5 className="card-title text-nowrap overflow-hidden">{course.name}</h5>
//                       <p className="card-text overflow-hidden" style={{ height: "100px" }}>{course.description}</p>
//                       <div className="d-flex justify-content-between align-items-center">
//                         <Button variant="primary" className="btn-lg">Go</Button>
//                         {userRole === "FACULTY" ? (
//                           <div>
//                             <button
//                               onClick={(event) => {
//                                 event.preventDefault();
//                                 deleteCourse(course._id);
//                               }}
//                               className="btn btn-danger btn-lg me-2"
//                             >
//                               Delete
//                             </button>
//                             <button
//                               onClick={(event) => {
//                                 event.preventDefault();
//                                 setNewCourse(course);
//                                 setEditMode(true);
//                               }}
//                               className="btn btn-warning btn-lg"
//                             >
//                               Edit
//                             </button>
//                           </div>
//                         ) : (
//                           <button
//                             className={`btn btn-lg ${isEnrolled ? "btn-danger" : "btn-success"}`}
//                             onClick={(e) => {
//                               e.preventDefault();
//                               toggleEnrollment(course._id);
//                             }}
//                           >
//                             {isEnrolled ? "Unenroll" : "Enroll"}
//                           </button>
//                         )}
//                       </div>
//                     </div>
//                   </Link>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// }









