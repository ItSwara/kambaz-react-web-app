import { useState, useEffect } from "react";
import { FaSearch, FaPlus } from "react-icons/fa";
import { BsThreeDotsVertical, BsFileText } from "react-icons/bs";
import { IoMdArrowDropdown } from "react-icons/io";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setQuizzes, addQuiz, deleteQuiz as deleteQuizAction } from "./reducer";
import QuizCreator from "./NewQuizEditor";
import { Modal } from "react-bootstrap";
import * as quizzesClient from "./client";

// Define user role type
type UserRole = "FACULTY" | "STUDENT";

export default function Quizzes() {
  const { cid } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Local state to track quizzes
  const [quizzesList, setQuizzesList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Current user role (typically would come from Redux)
  const currentUserRole: UserRole = "FACULTY"; // Now correctly typed
  
  // Modal state for quiz creation
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  
  // Quiz actions
  const createQuizForCourse = async (quiz: any) => {
    try {
      console.log("Creating quiz:", quiz);
      const newQuiz = await quizzesClient.createQuiz(cid as string, quiz);
      console.log("Created quiz:", newQuiz);
      dispatch(addQuiz(newQuiz));
      setQuizzesList([...quizzesList, newQuiz]);
      handleClose();
    } catch (error) {
      console.error("Error creating quiz:", error);
      setError("Failed to create quiz. Please try again.");
    }
  };

  const removeQuiz = async (quizId: string) => {
    try {
      await quizzesClient.deleteQuiz(quizId);
      dispatch(deleteQuizAction(quizId));
      setQuizzesList(quizzesList.filter(quiz => quiz._id !== quizId));
    } catch (error) {
      console.error("Error deleting quiz:", error);
      setError("Failed to delete quiz. Please try again.");
    }
  };

  const handleQuizClick = (quizId: string) => {
    navigate(`/Kambaz/Courses/${cid}/Quizzes/${quizId}`);
  };

  const fetchQuizzes = async () => {
    try {
      setIsLoading(true);
      setError("");
      console.log("Fetching quizzes for course:", cid);
      const fetchedQuizzes = await quizzesClient.findQuizzesForCourse(cid as string);
      console.log("Fetched quizzes:", fetchedQuizzes);
      
      // Update both Redux and local state
      dispatch(setQuizzes(fetchedQuizzes));
      setQuizzesList(fetchedQuizzes);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      setError("Failed to load quizzes. Please try again.");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (cid) {
      fetchQuizzes();
    }
  }, [cid]);

  // Helper function to determine quiz availability status
  const getQuizStatus = (quiz: any) => {
    const now = new Date();
    const availableDate = quiz.available_from_date ? new Date(quiz.available_from_date) : null;
    const dueDate = quiz.due_date ? new Date(quiz.due_date) : null;
    
    if (!availableDate) return "Not configured";
    
    if (now < availableDate) {
      return `Not available until ${availableDate.toLocaleDateString()} ${availableDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
    } else if (dueDate && now > dueDate) {
      return "Closed";
    } else {
      return "Available";
    }
  };

  return (
    <div className="container-fluid p-0" style={{ maxWidth: "1000px" }}>
      {/* Debug info - remove in production */}
      <div className="mb-2 p-2 bg-light rounded">
        <p className="mb-0"><small>Course ID: {cid}</small></p>
        <p className="mb-0"><small>Quizzes Count: {quizzesList?.length || 0}</small></p>
        <p className="mb-0"><small>Loading: {isLoading ? "Yes" : "No"}</small></p>
        {error && <p className="mb-0 text-danger"><small>Error: {error}</small></p>}
      </div>

      {/* Search and buttons section */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="position-relative" style={{ width: "400px" }}>
          <div className="input-group">
            <input
              type="text"
              className="form-control ps-4 rounded-3 py-2"
              placeholder="Search..."
              style={{
                border: "1px solid #ced4da",
                fontSize: "16px"
              }}
            />
            <div className="position-absolute" style={{ left: "15px", top: "50%", transform: "translateY(-50%)" }}>
              <FaSearch className="text-secondary" />
            </div>
          </div>
        </div>

        <div className="d-flex gap-2">
          {currentUserRole === "FACULTY" && (
            <>
              <button
                onClick={handleShow}
                className="btn btn-danger rounded-3 px-3 py-2"
                style={{
                  fontSize: "16px",
                }}
              >
                + Quiz
              </button>
              
              {/* Quiz Creator Modal */}
              <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                  <Modal.Title>Quiz Creator</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <QuizCreator 
                    handleClose={handleClose} 
                    addQuiz={createQuizForCourse}
                  />
                </Modal.Body>
              </Modal>
            </>
          )}
        </div>
      </div>

      {/* Quizzes Header */}
      <div
        className="d-flex justify-content-between align-items-center w-100 p-2 mb-0 rounded-top"
        style={{ backgroundColor: "#e9ecef" }}
      >
        <div className="d-flex align-items-center">
          <BsThreeDotsVertical className="fs-5 me-2" />
          <IoMdArrowDropdown className="fs-5 me-2" />
          <span style={{ fontSize: "20px", fontWeight: "500" }}>QUIZZES</span>
        </div>
        <div className="d-flex align-items-center">
          <span
            className="rounded-pill px-3 py-1 me-2"
            style={{
              backgroundColor: "white",
              border: "1px solid #ced4da",
              fontSize: "14px"
            }}
          >
            20% of Total
          </span>
          {currentUserRole === "FACULTY" && (
            <>
              <FaPlus className="fs-6 me-2" />
              <BsThreeDotsVertical className="fs-5" />
            </>
          )}
        </div>
      </div>

      {/* Quiz List */}
      <div className="border rounded-bottom">
        <div className="border-start border-success border-4">
          {isLoading ? (
            <div className="p-4 text-center">
              <p>Loading quizzes...</p>
            </div>
          ) : error ? (
            <div className="p-4 text-center text-danger">
              <p>{error}</p>
              <button className="btn btn-outline-primary" onClick={fetchQuizzes}>
                Try Again
              </button>
            </div>
          ) : quizzesList?.length === 0 ? (
            <div className="p-4 text-center">
              <p className="mb-3">No quizzes available. Click the "+ Quiz" button to create a new quiz.</p>
              {currentUserRole === "FACULTY" && (
                <button
                  onClick={handleShow}
                  className="btn btn-outline-danger rounded-3 px-3 py-2"
                >
                  + Add Quiz
                </button>
              )}
            </div>
          ) : (
            <ul className="list-group list-group-flush w-100">
              {quizzesList.map((quiz, index) => (
                <div key={quiz._id}>
                  <li
                    className="list-group-item border-0 p-3"
                    style={{ cursor: "pointer" }}
                  >
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="d-flex">
                        <BsThreeDotsVertical className="me-2 fs-6 mt-1" />
                        <BsFileText className="text-success me-2 fs-5 mt-1" />
                        <div onClick={() => handleQuizClick(quiz._id)}>
                          <div className="fs-5 fw-bold">{quiz.title}</div>
                          <div className="mt-1" style={{ fontSize: "14px" }}>
                            <span className={getQuizStatus(quiz).includes("Not available") ? "text-danger" : "text-success"}>
                              {getQuizStatus(quiz)}
                            </span>
                            <span> | </span>
                            <span className="fw-bold">Due</span>
                            <span> {quiz.due_date ? new Date(quiz.due_date).toLocaleDateString() + " at " + 
                              new Date(quiz.due_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "Not set"} | </span>
                            <span>{quiz.points} pts</span>
                            <span> | {quiz.questions || 0} Questions</span>
                            {currentUserRole === "STUDENT" && quiz.published && (
                              <span className="ms-2 badge bg-success">Score: Not attempted</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="d-flex align-items-start">
                        {currentUserRole === "FACULTY" ? (
                          <div className="d-flex align-items-center">
                            {/* Publish/Unpublish Icon */}
                            <div style={{ cursor: "pointer" }}>
                              {quiz.published ? (
                                <span className="text-success fs-5 me-2">✅</span>
                              ) : (
                                <span className="text-danger fs-5 me-2">🚫</span>
                              )}
                            </div>
                            
                            {/* Dropdown Button */}
                            <div className="dropdown">
                              <button 
                                className="btn btn-link p-0" 
                                type="button" 
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                              >
                                <BsThreeDotsVertical className="fs-4" />
                              </button>
                              <ul className="dropdown-menu">
                                <li>
                                  <button 
                                    className="dropdown-item" 
                                    onClick={() => handleQuizClick(quiz._id)}
                                  >
                                    Edit
                                  </button>
                                </li>
                                <li>
                                  <button 
                                    className="dropdown-item text-danger" 
                                    onClick={() => removeQuiz(quiz._id)}
                                  >
                                    Delete
                                  </button>
                                </li>
                              </ul>
                            </div>
                          </div>
                        ) : (
                          <>
                            {quiz.published ? (
                              <span className="text-success fs-5 me-2">✅</span>
                            ) : (
                              <span className="text-danger fs-5 me-2">🚫</span>
                            )}
                            <BsThreeDotsVertical className="ms-2 fs-6" />
                          </>
                        )}
                      </div>
                    </div>
                  </li>
                  {index !== quizzesList.length - 1 && <hr className="my-0 mx-3" />}
                </div>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}


// import { useState, useEffect } from "react";
// import { FaSearch, FaPlus } from "react-icons/fa";
// import { BsThreeDotsVertical, BsFileText } from "react-icons/bs";
// import { IoMdArrowDropdown } from "react-icons/io";
// import GreenCheckmark from "../Assignments/";
// import { useParams, useNavigate } from "react-router-dom";
// import { useSelector, useDispatch } from "react-redux";
// import { setQuizzes, addQuiz, deleteQuiz as deleteQuizAction } from "./reducer";
// import QuizCreator from "./NewQuizEditor";
// import { Modal } from "react-bootstrap";
// import QuizControlButtons from "./QuizControlButtons";
// import * as quizzesClient from "./client";

// // Define the RootState type to match your Redux store structure
// interface RootState {
//   accountReducer: {
//     currentUser: {
//       role: string;
//     };
//   };
//   quizReducer: {
//     quizzes: Array<{
//       _id: string;
//       title: string;
//       course: string | undefined;
//       available_from_date?: string;
//       due_date?: string;
//       points: number | string;
//       status?: string;
//       published?: boolean;
//       questions?: number;
//       quizType?: string;
//       timeLimit?: number;
//       shuffleAnswers?: boolean;
//       multipleAttempts?: boolean;
//       showCorrectAnswers?: string;
//       oneQuestionAtATime?: boolean;
//       webcamRequired?: boolean;
//       lockQuestionsAfterAnswering?: boolean;
//     }>;
//   };
// }

// export default function Quizzes() {
//   const { cid } = useParams();
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
  
//   // Get current user and quizzes from Redux store with proper typing
//   const { currentUser } = useSelector((state: RootState) => state.accountReducer);
//   const { quizzes } = useSelector((state: RootState) => state.quizReducer || { quizzes: [] });
  
//   // Modal state for quiz creation
//   const [show, setShow] = useState(false);
//   const handleClose = () => setShow(false);
//   const handleShow = () => setShow(true);
  
//   // Quiz actions
//   const createQuizForCourse = async (quiz: any) => {
//     try {
//       const newQuiz = await quizzesClient.createQuiz(cid as string, quiz);
//       dispatch(addQuiz(newQuiz));
//       handleClose();
//     } catch (error) {
//       console.error("Error creating quiz:", error);
//     }
//   };

//   const removeQuiz = async (quizId: string) => {
//     try {
//       await quizzesClient.deleteQuiz(quizId);
//       dispatch(deleteQuizAction(quizId));
//     } catch (error) {
//       console.error("Error deleting quiz:", error);
//     }
//   };

//   const handleQuizClick = (quizId: string) => {
//     navigate(`/Kambaz/Courses/${cid}/Quizzes/${quizId}`);
//   };

//   const fetchQuizzes = async () => {
//     try {
//       const quizzes = await quizzesClient.findQuizzesForCourse(cid as string);
//       dispatch(setQuizzes(quizzes));
//     } catch (error) {
//       console.error("Error fetching quizzes:", error);
//     }
//   };

//   useEffect(() => {
//     fetchQuizzes();
//   }, [cid]);

//   const filteredQuizzes = quizzes?.filter(
//     (quiz) => quiz.course === cid
//   ) || [];

//   // Helper function to determine quiz availability status
//   const getQuizStatus = (quiz: any) => {
//     const now = new Date();
//     const availableDate = quiz.available_from_date ? new Date(quiz.available_from_date) : null;
//     const dueDate = quiz.due_date ? new Date(quiz.due_date) : null;
    
//     if (!availableDate) return "Not configured";
    
//     if (now < availableDate) {
//       return `Not available until ${availableDate.toLocaleDateString()} ${availableDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
//     } else if (dueDate && now > dueDate) {
//       return "Closed";
//     } else {
//       return "Available";
//     }
//   };

//   return (
//     <div className="container-fluid p-0" style={{ maxWidth: "1000px" }}>
//       {/* Search and buttons section */}
//       <div className="d-flex justify-content-between align-items-center mb-4">
//         <div className="position-relative" style={{ width: "400px" }}>
//           <div className="input-group">
//             <input
//               type="text"
//               className="form-control ps-4 rounded-3 py-2"
//               placeholder="Search..."
//               style={{
//                 border: "1px solid #ced4da",
//                 fontSize: "16px"
//               }}
//             />
//             <div className="position-absolute" style={{ left: "15px", top: "50%", transform: "translateY(-50%)" }}>
//               <FaSearch className="text-secondary" />
//             </div>
//           </div>
//         </div>

//         <div className="d-flex gap-2">
//           {currentUser?.role === "FACULTY" && (
//             <>
//               <button
//                 onClick={handleShow}
//                 className="btn btn-danger rounded-3 px-3 py-2"
//                 style={{
//                   fontSize: "16px",
//                 }}
//               >
//                 + Quiz
//               </button>
              
//               {/* Quiz Creator Modal */}
//               <Modal show={show} onHide={handleClose}>
//                 <Modal.Header closeButton>
//                   <Modal.Title>Quiz Creator</Modal.Title>
//                 </Modal.Header>
//                 <Modal.Body>
//                   <QuizCreator 
//                     handleClose={handleClose} 
//                     addQuiz={createQuizForCourse}
//                   />
//                 </Modal.Body>
//               </Modal>
//             </>
//           )}
//         </div>
//       </div>

//       {/* Quizzes Header */}
//       <div
//         className="d-flex justify-content-between align-items-center w-100 p-2 mb-0 rounded-top"
//         style={{ backgroundColor: "#e9ecef" }}
//       >
//         <div className="d-flex align-items-center">
//           <BsThreeDotsVertical className="fs-5 me-2" />
//           <IoMdArrowDropdown className="fs-5 me-2" />
//           <span style={{ fontSize: "20px", fontWeight: "500" }}>QUIZZES</span>
//         </div>
//         <div className="d-flex align-items-center">
//           <span
//             className="rounded-pill px-3 py-1 me-2"
//             style={{
//               backgroundColor: "white",
//               border: "1px solid #ced4da",
//               fontSize: "14px"
//             }}
//           >
//             20% of Total
//           </span>
//           {currentUser?.role === "FACULTY" && (
//             <>
//               <FaPlus className="fs-6 me-2" />
//               <BsThreeDotsVertical className="fs-5" />
//             </>
//           )}
//         </div>
//       </div>

//       {/* Quiz List */}
//       <div className="border rounded-bottom">
//         <div className="border-start border-success border-4">
//           {filteredQuizzes.length === 0 ? (
//             <div className="p-4 text-center">
//               <p className="mb-3">No quizzes available. Click the "+ Quiz" button to create a new quiz.</p>
//               {currentUser?.role === "FACULTY" && (
//                 <button
//                   onClick={handleShow}
//                   className="btn btn-outline-danger rounded-3 px-3 py-2"
//                 >
//                   + Add Quiz
//                 </button>
//               )}
//             </div>
//           ) : (
//             <ul className="list-group list-group-flush w-100">
//               {filteredQuizzes.map((quiz, index) => (
//                 <div key={quiz._id}>
//                   <li
//                     className="list-group-item border-0 p-3"
//                     style={{ cursor: "pointer" }}
//                   >
//                     <div className="d-flex justify-content-between align-items-start">
//                       <div className="d-flex">
//                         <BsThreeDotsVertical className="me-2 fs-6 mt-1" />
//                         <BsFileText className="text-success me-2 fs-5 mt-1" />
//                         <div onClick={() => handleQuizClick(quiz._id)}>
//                           <div className="fs-5 fw-bold">{quiz.title}</div>
//                           <div className="mt-1" style={{ fontSize: "14px" }}>
//                             <span className={getQuizStatus(quiz).includes("Not available") ? "text-danger" : "text-success"}>
//                               {getQuizStatus(quiz)}
//                             </span>
//                             <span> | </span>
//                             <span className="fw-bold">Due</span>
//                             <span> {quiz.due_date ? new Date(quiz.due_date).toLocaleDateString() + " at " + 
//                               new Date(quiz.due_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "Not set"} | </span>
//                             <span>{quiz.points} pts</span>
//                             <span> | {quiz.questions || 0} Questions</span>
//                             {currentUser?.role === "STUDENT" && quiz.published && (
//                               <span className="ms-2 badge bg-success">Score: Not attempted</span>
//                             )}
//                           </div>
//                         </div>
//                       </div>
//                       <div className="d-flex align-items-start">
//                         {currentUser?.role === "FACULTY" ? (
//                           <QuizControlButtons 
//                             quizId={quiz._id} 
//                             deleteQuiz={removeQuiz}
//                             isPublished={quiz.published || false}
//                           />
//                         ) : (
//                           <>
//                             {quiz.published ? (
//                               <GreenCheckmark />
//                             ) : (
//                               <span className="text-danger fs-5 me-2">🚫</span>
//                             )}
//                             <BsThreeDotsVertical className="ms-2 fs-6" />
//                           </>
//                         )}
//                       </div>
//                     </div>
//                   </li>
//                   {index !== filteredQuizzes.length - 1 && <hr className="my-0 mx-3" />}
//                 </div>
//               ))}
//             </ul>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }