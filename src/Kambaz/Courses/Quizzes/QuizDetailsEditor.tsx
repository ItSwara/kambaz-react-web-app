import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { Button, Form, Nav, Tab, Row, Col } from "react-bootstrap";
import * as quizClient from "./client.ts";

// Define the Question interface
interface QuizQuestion {
  _id?: string;
  points: number;
  text?: string;
  options?: any[];
  answer?: any;
  type?: string;
}

// Use a type assertion function to safely convert between types
function asQuizWithQuestions(quiz: any): Quiz {
  return {
    ...quiz,
    questions: (quiz.questions || []) as QuizQuestion[]
  };
}

interface Quiz {
  _id: string | undefined;
  title: string;
  type: string;
  description: string;
  course: string | undefined;
  questions: QuizQuestion[]; // Using QuizQuestion type
  published: boolean;
  points: number;
  assignmentGroup: string;
  shuffleAnswers: boolean;
  timeLimit: number;
  multipleAttempts: boolean;
  showCorrectAnswers: boolean;
  accessCode: string;
  oneQuestionAtATime: boolean;
  webcamRequired: boolean;
  lockQuestionsAfterAnswering: boolean;
  dueDate: string;
  availableFrom: string;
  availableUntil: string;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    _id: number;
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
}

export default function QuizDetailsEditor() {
  const { cid, qid } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state: any) => state.accountReducer);
  
  const [quiz, setQuiz] = useState<Quiz>({
    _id: qid || undefined,
    title: "Unnamed Quiz",
    type: "GRADEDQUIZ",
    description: "",
    course: cid || undefined,
    questions: [] as QuizQuestion[], // Using QuizQuestion type
    published: false,
    points: 0,
    assignmentGroup: "ASSIGNMENTS",
    shuffleAnswers: true,
    timeLimit: 20,
    multipleAttempts: false,
    showCorrectAnswers: false,
    accessCode: "",
    oneQuestionAtATime: true,
    webcamRequired: false,
    lockQuestionsAfterAnswering: false,
    dueDate: "",
    availableFrom: "",
    availableUntil: "",
    createdAt: "",
    updatedAt: "",
    createdBy: {
      _id: 0,
      username: "",
      password: "",
      firstName: "",
      lastName: "",
      email: "",
      role: ""
    }
  });

  const getQuiz = async () => {
    if (qid) {
      try {
        const fetchedQuiz = await quizClient.findQuizById(cid, qid);
        // Use the type assertion function to safely convert
        setQuiz(asQuizWithQuestions(fetchedQuiz));
      } catch (error) {
        console.error("Error fetching quiz:", error);
      }
    }
  };

  useEffect(() => {
    getQuiz();
  }, [qid]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setQuiz({
      ...quiz,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const handleSave = async (publish = false) => {
    try {
      const updatedQuiz = {...quiz};
      if (publish) {
        updatedQuiz.published = true;
      }
      
      // When sending to API, ensure it matches the expected type
      if (qid) {
        await quizClient.updateQuiz(cid, qid, updatedQuiz as any);
      } else {
        await quizClient.createQuiz(cid, updatedQuiz as any);
      }
      
      if (publish) {
        navigate(`/Kambaz/Courses/${cid}/Quizzes`);
      } else {
        navigate(`/Kambaz/Courses/${cid}/Quizzes/${qid || updatedQuiz._id}/details`);
      }
    } catch (error) {
      console.error("Error saving quiz:", error);
    }
  };

  const handleCancel = () => {
    navigate(`/Kambaz/Courses/${cid}/Quizzes`);
  };

  const calculateTotalPoints = () => {
    return quiz.questions.reduce((total, question) => total + (question.points || 0), 0);
  };

  return (
    <div className="wd-quiz-editor">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <span>Points {calculateTotalPoints()} </span>
          <Form.Check
            type="switch"
            id="published-switch"
            label="Not Published"
            checked={quiz.published}
            onChange={(e) => setQuiz({...quiz, published: e.target.checked})}
            className="d-inline-block ms-2"
          />
        </div>
        <div className="text-end">
          <Button variant="link">⋮</Button>
        </div>
      </div>

      <Tab.Container id="quiz-editor-tabs" defaultActiveKey="details">
        <Nav variant="tabs" className="mb-3">
          <Nav.Item>
            <Nav.Link eventKey="details">Details</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link 
              as={Link} 
              to={`/Kambaz/Courses/${cid}/Quizzes/${qid}/questions`}
              eventKey="questions"
            >
              Questions
            </Nav.Link>
          </Nav.Item>
        </Nav>

        <Tab.Content>
          <Tab.Pane eventKey="details">
            <Form>
              <Form.Group className="mb-3">
                <Form.Control
                  type="text"
                  placeholder="Unnamed Quiz"
                  name="title"
                  value={quiz.title}
                  onChange={handleChange}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Quiz Instructions:</Form.Label>
                <div className="border rounded p-2">
                  <div className="d-flex mb-2 border-bottom pb-2">
                    <Button variant="light" size="sm" className="me-1">Edit</Button>
                    <Button variant="light" size="sm" className="me-1">View</Button>
                    <Button variant="light" size="sm" className="me-1">Insert</Button>
                    <Button variant="light" size="sm" className="me-1">Format</Button>
                    <Button variant="light" size="sm" className="me-1">Tools</Button>
                    <Button variant="light" size="sm" className="me-1">Table</Button>
                    <div className="ms-auto">100%</div>
                  </div>
                  <div className="d-flex align-items-center mb-2">
                    <Form.Select size="sm" className="me-2" style={{width: "80px"}}>
                      <option>12pt</option>
                    </Form.Select>
                    <Form.Select size="sm" className="me-2" style={{width: "120px"}}>
                      <option>Paragraph</option>
                    </Form.Select>
                    <Button variant="light" size="sm" className="me-1">B</Button>
                    <Button variant="light" size="sm" className="me-1">I</Button>
                    <Button variant="light" size="sm" className="me-1">U</Button>
                    <Button variant="light" size="sm" className="me-1">A</Button>
                    <Button variant="light" size="sm" className="me-1">-</Button>
                    <Button variant="light" size="sm" className="me-1">T</Button>
                    <Button variant="light" size="sm" className="me-1">⋮</Button>
                  </div>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    name="description"
                    value={quiz.description}
                    onChange={handleChange}
                    className="border-0"
                  />
                  <div className="d-flex align-items-center mt-2">
                    <span>p</span>
                    <span className="ms-auto me-2">0 words</span>
                    <Button variant="light" size="sm" className="me-1">&lt;/&gt;</Button>
                    <Button variant="light" size="sm" className="me-1">🔍</Button>
                    <Button variant="light" size="sm" className="me-1">⊥</Button>
                  </div>
                </div>
              </Form.Group>

              <Row className="mb-3">
                <Form.Group as={Col} md={4}>
                  <Form.Label>Quiz Type</Form.Label>
                  <Form.Select 
                    name="type" 
                    value={quiz.type} 
                    onChange={handleChange}
                  >
                    <option value="GRADEDQUIZ">Graded Quiz</option>
                    <option value="PRACTICEQUIZ">Practice Quiz</option>
                    <option value="GRADEDSURVEY">Graded Survey</option>
                    <option value="UNGRADEDSURVEY">Ungraded Survey</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group as={Col} md={8}>
                  <Form.Label>Assignment Group</Form.Label>
                  <Form.Select 
                    name="assignmentGroup" 
                    value={quiz.assignmentGroup} 
                    onChange={handleChange}
                  >
                    <option value="ASSIGNMENTS">ASSIGNMENTS</option>
                    <option value="QUIZZES">QUIZZES</option>
                    <option value="EXAMS">EXAMS</option>
                    <option value="PROJECTS">PROJECTS</option>
                  </Form.Select>
                </Form.Group>
              </Row>

              <div className="border rounded p-3 mb-3">
                <h5>Options</h5>
                <Form.Group className="mb-2">
                  <Form.Check
                    type="checkbox"
                    id="shuffle-answers"
                    label="Shuffle Answers"
                    name="shuffleAnswers"
                    checked={quiz.shuffleAnswers}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group className="mb-2 d-flex align-items-center">
                  <Form.Check
                    type="checkbox"
                    id="time-limit"
                    label="Time Limit"
                    name="timeLimitEnabled"
                    checked={quiz.timeLimit > 0}
                    onChange={(e) => setQuiz({...quiz, timeLimit: e.target.checked ? 20 : 0})}
                    className="me-2"
                  />
                  {quiz.timeLimit > 0 && (
                    <>
                      <Form.Control
                        type="number"
                        size="sm"
                        style={{width: "80px"}}
                        value={quiz.timeLimit}
                        name="timeLimit"
                        onChange={handleChange}
                        min="1"
                      />
                      <span className="ms-2">Minutes</span>
                    </>
                  )}
                </Form.Group>

                <Form.Group className="mb-2">
                  <Form.Check
                    type="checkbox"
                    id="multiple-attempts"
                    label="Allow Multiple Attempts"
                    name="multipleAttempts"
                    checked={quiz.multipleAttempts}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group className="mb-2">
                  <Form.Check
                    type="checkbox"
                    id="one-question"
                    label="One Question at a Time"
                    name="oneQuestionAtATime"
                    checked={quiz.oneQuestionAtATime}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group className="mb-2">
                  <Form.Check
                    type="checkbox"
                    id="webcam"
                    label="Webcam Required"
                    name="webcamRequired"
                    checked={quiz.webcamRequired}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group className="mb-2">
                  <Form.Check
                    type="checkbox"
                    id="lock-questions"
                    label="Lock Questions After Answering"
                    name="lockQuestionsAfterAnswering"
                    checked={quiz.lockQuestionsAfterAnswering}
                    onChange={handleChange}
                  />
                </Form.Group>
              </div>

              <div className="border rounded p-3 mb-3">
                <h5>Assign</h5>
                <div className="mb-3">
                  <h6>Assign to</h6>
                  <div className="border rounded p-2 d-flex align-items-center">
                    <span>Everyone</span>
                    <button type="button" className="btn btn-sm ms-2">×</button>
                  </div>
                </div>

                <div className="mb-3">
                  <h6>Due</h6>
                  <Form.Control
                    type="date"
                    name="dueDate"
                    value={quiz.dueDate}
                    onChange={handleChange}
                  />
                </div>

                <Row className="mb-3">
                  <Col md={6}>
                    <h6>Available from</h6>
                    <div className="d-flex align-items-center">
                      <Form.Control
                        type="date"
                        name="availableFrom"
                        value={quiz.availableFrom}
                        onChange={handleChange}
                      />
                      <Button variant="light" className="ms-2">📅</Button>
                    </div>
                  </Col>
                  <Col md={6}>
                    <h6>Until</h6>
                    <div className="d-flex align-items-center">
                      <Form.Control
                        type="date"
                        name="availableUntil"
                        value={quiz.availableUntil}
                        onChange={handleChange}
                      />
                      <Button variant="light" className="ms-2">📅</Button>
                    </div>
                  </Col>
                </Row>

                <div className="text-center">
                  <Button variant="outline-primary" type="button">+ Add</Button>
                </div>
              </div>

              <div className="d-flex justify-content-end border-top pt-3">
                <Button 
                  variant="outline-secondary" 
                  className="me-2"
                  onClick={handleCancel}
                  type="button"
                >
                  Cancel
                </Button>
                <Button 
                  variant="danger" 
                  onClick={() => handleSave(false)}
                  type="button"
                >
                  Save
                </Button>
              </div>
            </Form>
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    </div>
  );
}


// import { useEffect, useState } from "react";
// import { useParams, useNavigate, Link } from "react-router-dom";
// import { useSelector } from "react-redux";
// import { Button, Form, Nav, Tab, Row, Col } from "react-bootstrap";
// import * as quizClient from "./client.ts";

// // Define the Question interface
// interface QuizQuestion {
//   _id?: string;
//   points: number;
//   text?: string;
//   options?: any[];
//   answer?: any;
//   type?: string;
// }

// // Use a type assertion function to safely convert between types
// function asQuizWithQuestions(quiz: any): Quiz {
//   return {
//     ...quiz,
//     questions: (quiz.questions || []) as QuizQuestion[]
//   };
// }

// interface Quiz {
//   _id: string | undefined;
//   title: string;
//   type: string;
//   description: string;
//   course: string | undefined;
//   questions: QuizQuestion[]; // Using QuizQuestion type
//   published: boolean;
//   points: number;
//   assignmentGroup: string;
//   shuffleAnswers: boolean;
//   timeLimit: number;
//   multipleAttempts: boolean;
//   showCorrectAnswers: boolean;
//   accessCode: string;
//   oneQuestionAtATime: boolean;
//   webcamRequired: boolean;
//   lockQuestionsAfterAnswering: boolean;
//   dueDate: string;
//   availableFrom: string;
//   availableUntil: string;
//   createdAt: string;
//   updatedAt: string;
//   createdBy: {
//     _id: number;
//     username: string;
//     password: string;
//     firstName: string;
//     lastName: string;
//     email: string;
//     role: string;
//   };
// }

// export default function QuizDetailsEditor() {
//   const { cid, qid } = useParams();
//   const navigate = useNavigate();
//   const { currentUser } = useSelector((state: any) => state.accountReducer);
  
//   const [quiz, setQuiz] = useState<Quiz>({
//     _id: qid || undefined,
//     title: "Unnamed Quiz",
//     type: "GRADEDQUIZ",
//     description: "",
//     course: cid || undefined,
//     questions: [] as QuizQuestion[], // Using QuizQuestion type
//     published: false,
//     points: 0,
//     assignmentGroup: "ASSIGNMENTS",
//     shuffleAnswers: true,
//     timeLimit: 20,
//     multipleAttempts: false,
//     showCorrectAnswers: false,
//     accessCode: "",
//     oneQuestionAtATime: true,
//     webcamRequired: false,
//     lockQuestionsAfterAnswering: false,
//     dueDate: "",
//     availableFrom: "",
//     availableUntil: "",
//     createdAt: "",
//     updatedAt: "",
//     createdBy: {
//       _id: 0,
//       username: "",
//       password: "",
//       firstName: "",
//       lastName: "",
//       email: "",
//       role: ""
//     }
//   });

//   const getQuiz = async () => {
//     if (qid) {
//       try {
//         const fetchedQuiz = await quizClient.findQuizById(cid, qid);
//         // Use the type assertion function to safely convert
//         setQuiz(asQuizWithQuestions(fetchedQuiz));
//       } catch (error) {
//         console.error("Error fetching quiz:", error);
//       }
//     }
//   };

//   useEffect(() => {
//     getQuiz();
//   }, [qid]);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
//     const { name, value, type } = e.target;
//     const checked = (e.target as HTMLInputElement).checked;
    
//     setQuiz({
//       ...quiz,
//       [name]: type === "checkbox" ? checked : value
//     });
//   };

//   const handleSave = async (publish = false) => {
//     try {
//       const updatedQuiz = {...quiz};
//       if (publish) {
//         updatedQuiz.published = true;
//       }
      
//       // When sending to API, ensure it matches the expected type
//       if (qid) {
//         await quizClient.updateQuiz(cid, qid, updatedQuiz as any);
//       } else {
//         await quizClient.createQuiz(cid, updatedQuiz as any);
//       }
      
//       if (publish) {
//         navigate(`/courses/${cid}/quizzes`);
//       } else {
//         navigate(`/courses/${cid}/quizzes/${qid || updatedQuiz._id}/details`);
//       }
//     } catch (error) {
//       console.error("Error saving quiz:", error);
//     }
//   };

//   const handleCancel = () => {
//     navigate(`/courses/${cid}/quizzes`);
//   };

//   const calculateTotalPoints = () => {
//     return quiz.questions.reduce((total, question) => total + (question.points || 0), 0);
//   };

//   return (
//     <div className="wd-quiz-editor">
//       <div className="d-flex justify-content-between align-items-center mb-3">
//         <div>
//           <span>Points {calculateTotalPoints()} </span>
//           <Form.Check
//             type="switch"
//             id="published-switch"
//             label="Not Published"
//             checked={quiz.published}
//             onChange={(e) => setQuiz({...quiz, published: e.target.checked})}
//             className="d-inline-block ms-2"
//           />
//         </div>
//         <div className="text-end">
//           <Button variant="link">⋮</Button>
//         </div>
//       </div>

//       <Tab.Container id="quiz-editor-tabs" defaultActiveKey="details">
//         <Nav variant="tabs" className="mb-3">
//           <Nav.Item>
//             <Nav.Link eventKey="details">Details</Nav.Link>
//           </Nav.Item>
//           <Nav.Item>
//             <Nav.Link 
//               as={Link} 
//               to={`/courses/${cid}/quizzes/${qid}/questions`}
//               eventKey="questions"
//             >
//               Questions
//             </Nav.Link>
//           </Nav.Item>
//         </Nav>

//         <Tab.Content>
//           <Tab.Pane eventKey="details">
//             <Form>
//               <Form.Group className="mb-3">
//                 <Form.Control
//                   type="text"
//                   placeholder="Unnamed Quiz"
//                   name="title"
//                   value={quiz.title}
//                   onChange={handleChange}
//                 />
//               </Form.Group>

//               <Form.Group className="mb-3">
//                 <Form.Label>Quiz Instructions:</Form.Label>
//                 <div className="border rounded p-2">
//                   <div className="d-flex mb-2 border-bottom pb-2">
//                     <Button variant="light" size="sm" className="me-1">Edit</Button>
//                     <Button variant="light" size="sm" className="me-1">View</Button>
//                     <Button variant="light" size="sm" className="me-1">Insert</Button>
//                     <Button variant="light" size="sm" className="me-1">Format</Button>
//                     <Button variant="light" size="sm" className="me-1">Tools</Button>
//                     <Button variant="light" size="sm" className="me-1">Table</Button>
//                     <div className="ms-auto">100%</div>
//                   </div>
//                   <div className="d-flex align-items-center mb-2">
//                     <Form.Select size="sm" className="me-2" style={{width: "80px"}}>
//                       <option>12pt</option>
//                     </Form.Select>
//                     <Form.Select size="sm" className="me-2" style={{width: "120px"}}>
//                       <option>Paragraph</option>
//                     </Form.Select>
//                     <Button variant="light" size="sm" className="me-1">B</Button>
//                     <Button variant="light" size="sm" className="me-1">I</Button>
//                     <Button variant="light" size="sm" className="me-1">U</Button>
//                     <Button variant="light" size="sm" className="me-1">A</Button>
//                     <Button variant="light" size="sm" className="me-1">-</Button>
//                     <Button variant="light" size="sm" className="me-1">T</Button>
//                     <Button variant="light" size="sm" className="me-1">⋮</Button>
//                   </div>
//                   <Form.Control
//                     as="textarea"
//                     rows={4}
//                     name="description"
//                     value={quiz.description}
//                     onChange={handleChange}
//                     className="border-0"
//                   />
//                   <div className="d-flex align-items-center mt-2">
//                     <span>p</span>
//                     <span className="ms-auto me-2">0 words</span>
//                     <Button variant="light" size="sm" className="me-1">&lt;/&gt;</Button>
//                     <Button variant="light" size="sm" className="me-1">🔍</Button>
//                     <Button variant="light" size="sm" className="me-1">⊥</Button>
//                   </div>
//                 </div>
//               </Form.Group>

//               <Row className="mb-3">
//                 <Form.Group as={Col} md={4}>
//                   <Form.Label>Quiz Type</Form.Label>
//                   <Form.Select 
//                     name="type" 
//                     value={quiz.type} 
//                     onChange={handleChange}
//                   >
//                     <option value="GRADEDQUIZ">Graded Quiz</option>
//                     <option value="PRACTICEQUIZ">Practice Quiz</option>
//                     <option value="GRADEDSURVEY">Graded Survey</option>
//                     <option value="UNGRADEDSURVEY">Ungraded Survey</option>
//                   </Form.Select>
//                 </Form.Group>

//                 <Form.Group as={Col} md={8}>
//                   <Form.Label>Assignment Group</Form.Label>
//                   <Form.Select 
//                     name="assignmentGroup" 
//                     value={quiz.assignmentGroup} 
//                     onChange={handleChange}
//                   >
//                     <option value="ASSIGNMENTS">ASSIGNMENTS</option>
//                     <option value="QUIZZES">QUIZZES</option>
//                     <option value="EXAMS">EXAMS</option>
//                     <option value="PROJECTS">PROJECTS</option>
//                   </Form.Select>
//                 </Form.Group>
//               </Row>

//               <div className="border rounded p-3 mb-3">
//                 <h5>Options</h5>
//                 <Form.Group className="mb-2">
//                   <Form.Check
//                     type="checkbox"
//                     id="shuffle-answers"
//                     label="Shuffle Answers"
//                     name="shuffleAnswers"
//                     checked={quiz.shuffleAnswers}
//                     onChange={handleChange}
//                   />
//                 </Form.Group>

//                 <Form.Group className="mb-2 d-flex align-items-center">
//                   <Form.Check
//                     type="checkbox"
//                     id="time-limit"
//                     label="Time Limit"
//                     name="timeLimitEnabled"
//                     checked={quiz.timeLimit > 0}
//                     onChange={(e) => setQuiz({...quiz, timeLimit: e.target.checked ? 20 : 0})}
//                     className="me-2"
//                   />
//                   {quiz.timeLimit > 0 && (
//                     <>
//                       <Form.Control
//                         type="number"
//                         size="sm"
//                         style={{width: "80px"}}
//                         value={quiz.timeLimit}
//                         name="timeLimit"
//                         onChange={handleChange}
//                         min="1"
//                       />
//                       <span className="ms-2">Minutes</span>
//                     </>
//                   )}
//                 </Form.Group>

//                 <Form.Group className="mb-2">
//                   <Form.Check
//                     type="checkbox"
//                     id="multiple-attempts"
//                     label="Allow Multiple Attempts"
//                     name="multipleAttempts"
//                     checked={quiz.multipleAttempts}
//                     onChange={handleChange}
//                   />
//                 </Form.Group>

//                 <Form.Group className="mb-2">
//                   <Form.Check
//                     type="checkbox"
//                     id="one-question"
//                     label="One Question at a Time"
//                     name="oneQuestionAtATime"
//                     checked={quiz.oneQuestionAtATime}
//                     onChange={handleChange}
//                   />
//                 </Form.Group>

//                 <Form.Group className="mb-2">
//                   <Form.Check
//                     type="checkbox"
//                     id="webcam"
//                     label="Webcam Required"
//                     name="webcamRequired"
//                     checked={quiz.webcamRequired}
//                     onChange={handleChange}
//                   />
//                 </Form.Group>

//                 <Form.Group className="mb-2">
//                   <Form.Check
//                     type="checkbox"
//                     id="lock-questions"
//                     label="Lock Questions After Answering"
//                     name="lockQuestionsAfterAnswering"
//                     checked={quiz.lockQuestionsAfterAnswering}
//                     onChange={handleChange}
//                   />
//                 </Form.Group>
//               </div>

//               <div className="border rounded p-3 mb-3">
//                 <h5>Assign</h5>
//                 <div className="mb-3">
//                   <h6>Assign to</h6>
//                   <div className="border rounded p-2 d-flex align-items-center">
//                     <span>Everyone</span>
//                     <button type="button" className="btn btn-sm ms-2">×</button>
//                   </div>
//                 </div>

//                 <div className="mb-3">
//                   <h6>Due</h6>
//                   <Form.Control
//                     type="date"
//                     name="dueDate"
//                     value={quiz.dueDate}
//                     onChange={handleChange}
//                   />
//                 </div>

//                 <Row className="mb-3">
//                   <Col md={6}>
//                     <h6>Available from</h6>
//                     <div className="d-flex align-items-center">
//                       <Form.Control
//                         type="date"
//                         name="availableFrom"
//                         value={quiz.availableFrom}
//                         onChange={handleChange}
//                       />
//                       <Button variant="light" className="ms-2">📅</Button>
//                     </div>
//                   </Col>
//                   <Col md={6}>
//                     <h6>Until</h6>
//                     <div className="d-flex align-items-center">
//                       <Form.Control
//                         type="date"
//                         name="availableUntil"
//                         value={quiz.availableUntil}
//                         onChange={handleChange}
//                       />
//                       <Button variant="light" className="ms-2">📅</Button>
//                     </div>
//                   </Col>
//                 </Row>

//                 <div className="text-center">
//                   <Button variant="outline-primary" type="button">+ Add</Button>
//                 </div>
//               </div>

//               <div className="d-flex justify-content-end border-top pt-3">
//                 <Button 
//                   variant="outline-secondary" 
//                   className="me-2"
//                   onClick={handleCancel}
//                   type="button"
//                 >
//                   Cancel
//                 </Button>
//                 <Button 
//                   variant="danger" 
//                   onClick={() => handleSave(false)}
//                   type="button"
//                 >
//                   Save
//                 </Button>
//               </div>
//             </Form>
//           </Tab.Pane>
//         </Tab.Content>
//       </Tab.Container>
//     </div>
//   );
// }