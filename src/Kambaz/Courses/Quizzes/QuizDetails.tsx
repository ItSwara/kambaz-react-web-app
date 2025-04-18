import { Button, Col, Container, Form, Row, Alert } from "react-bootstrap";
import { useNavigate, useParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { updateQuiz as updateQuizAction } from "./reducer";
import { updateQuiz as updateQuizAPI, findQuizById } from "./client";
import { useEffect, useState } from "react";

interface RootState {
  accountReducer: {
    currentUser: {
      role: string;
    };
  };
  quizReducer?: {
    quizzes: Array<{
      _id: string;
      title: string;
      course: string | undefined;
      available_from_date?: string;
      due_date?: string;
      points: number | string;
      status?: string;
      published?: boolean;
      questions?: number;
      quizType?: string;
      timeLimit?: number;
      shuffleAnswers?: boolean;
      multipleAttempts?: boolean;
      attempts?: number;
      showCorrectAnswers?: string;
      accessCode?: string;
      oneQuestionAtATime?: boolean;
      webcamRequired?: boolean;
      lockQuestionsAfterAnswering?: boolean;
      availableUntil?: string;
      assignmentGroup?: string;
    }>;
  };
}

export default function QuizDetails() {
  const { cid, qid } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Get current user from Redux (with safe fallback)
  const currentUser = useSelector((state: RootState) => 
    state.accountReducer?.currentUser || { role: "STUDENT" }
  );
  
  // Get quizzes from Redux (with safe fallback for missing reducer)
  const quizzes = useSelector((state: RootState) => {
    if (!state.quizReducer) {
      console.warn("quizReducer not found in Redux store");
      return [];
    }
    return state.quizReducer.quizzes || [];
  });
  
  // Find the quiz data in Redux
  const quizData = quizzes.find((q) => q._id === qid && q.course === cid);
  
  // Local state for loading and errors
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [directlyFetchedQuiz, setDirectlyFetchedQuiz] = useState<any>(null);
  
  // Initialize state with quiz data or defaults
  const [quizTitle, setQuizTitle] = useState<string>("");
  const [quizType, setQuizType] = useState<string>("Graded Quiz");
  const [assignmentGroup, setAssignmentGroup] = useState<string>("QUIZZES");
  const [shuffleAnswers, setShuffleAnswers] = useState<boolean>(true);
  const [timeLimit, setTimeLimit] = useState<number>(30);
  const [multipleAttempts, setMultipleAttempts] = useState<boolean>(false);
  const [attempts, setAttempts] = useState<number>(1);
  const [showCorrectAnswers, setShowCorrectAnswers] = useState<string>("Immediately");
  const [accessCode, setAccessCode] = useState<string>("");
  const [oneQuestionAtATime, setOneQuestionAtATime] = useState<boolean>(true);
  const [webcamRequired, setWebcamRequired] = useState<boolean>(false);
  const [lockQuestionsAfterAnswering, setLockQuestionsAfterAnswering] = useState<boolean>(false);
  const [dueDate, setDueDate] = useState<string>("");
  const [availableFromDate, setAvailableFromDate] = useState<string>("");
  const [availableUntilDate, setAvailableUntilDate] = useState<string>("");
  const [questions, setQuestions] = useState<number>(0);
  const [points, setPoints] = useState<number>(0);
  const [published, setPublished] = useState<boolean>(false);
  
  // If quiz not in Redux, fetch directly from API
  useEffect(() => {
    const loadQuizDirectly = async () => {
      if (!quizData && qid) {
        setIsLoading(true);
        setError("");
        try {
          console.log("Fetching quiz directly:", qid);
          const quiz = await findQuizById(qid);
          console.log("Direct API response:", quiz);
          setDirectlyFetchedQuiz(quiz);
          
          // Update local state with fetched data
          updateLocalState(quiz);
          setIsLoading(false);
        } catch (error) {
          console.error("Error fetching quiz directly:", error);
          setError("Failed to load quiz. Please try again.");
          setIsLoading(false);
        }
      }
    };
    
    loadQuizDirectly();
  }, [qid, quizData]);
  
  // Initialize form with data when component mounts
  useEffect(() => {
    const quiz = quizData || directlyFetchedQuiz;
    if (quiz) {
      updateLocalState(quiz);
    }
  }, [quizData, directlyFetchedQuiz]);
  
  // Helper function to update all local state
  const updateLocalState = (quiz: any) => {
    setQuizTitle(quiz.title || "");
    setQuizType(quiz.quizType || "Graded Quiz");
    setAssignmentGroup(quiz.assignmentGroup || "QUIZZES");
    setShuffleAnswers(quiz.shuffleAnswers !== undefined ? quiz.shuffleAnswers : true);
    setTimeLimit(quiz.timeLimit || 30);
    setMultipleAttempts(quiz.multipleAttempts || false);
    setAttempts(quiz.attempts || 1);
    setShowCorrectAnswers(quiz.showCorrectAnswers || "Immediately");
    setAccessCode(quiz.accessCode || "");
    setOneQuestionAtATime(quiz.oneQuestionAtATime !== undefined ? quiz.oneQuestionAtATime : true);
    setWebcamRequired(quiz.webcamRequired || false);
    setLockQuestionsAfterAnswering(quiz.lockQuestionsAfterAnswering || false);
    setDueDate(quiz.due_date || "");
    setAvailableFromDate(quiz.available_from_date || "");
    setAvailableUntilDate(quiz.availableUntil || "");
    setQuestions(quiz.questions || 0);
    setPoints(Number(quiz.points) || 0);
    setPublished(quiz.published || false);
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    const updatedQuiz = {
      _id: qid,
      title: quizTitle,
      course: cid,
      quizType,
      assignmentGroup,
      shuffleAnswers,
      timeLimit,
      multipleAttempts,
      attempts,
      showCorrectAnswers,
      accessCode,
      oneQuestionAtATime,
      webcamRequired,
      lockQuestionsAfterAnswering,
      due_date: dueDate,
      available_from_date: availableFromDate,
      availableUntil: availableUntilDate,
      questions,
      points,
      published // Keep published status
    };

    try {
      // Update the backend
      const result = await updateQuizAPI(updatedQuiz);
      console.log("Update result:", result);
      
      // Update Redux store
      dispatch(updateQuizAction(updatedQuiz));
      
      // Update local state
      setDirectlyFetchedQuiz(updatedQuiz);
      
      // Show success message
      alert("Quiz updated successfully!");
      
      // Navigate back
      navigate(-1);
    } catch (error) {
      console.error("Failed to update quiz:", error);
      setError("Failed to update quiz. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle publish/unpublish
  const handlePublishToggle = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      const updatedQuiz = {
        _id: qid,
        published: !published
      };
      
      // Update on backend
      await updateQuizAPI(updatedQuiz);
      
      // Update Redux
      dispatch(updateQuizAction({
        ...(quizData || directlyFetchedQuiz),
        published: !published
      }));
      
      // Update local state
      setPublished(!published);
      
      // Show confirmation
      alert(published ? "Quiz unpublished!" : "Quiz published! Students can now access it.");
    } catch (error) {
      console.error("Failed to toggle published status:", error);
      setError("Failed to update published status. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartQuiz = () => {
    navigate(`/Kambaz/Courses/${cid}/Quizzes/${qid}/take`);
  };

  // Loading state
  if (isLoading && !quizData && !directlyFetchedQuiz) {
    return (
      <Container>
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading quiz...</p>
        </div>
      </Container>
    );
  }

  // Error state
  if (error && !quizData && !directlyFetchedQuiz) {
    return (
      <Container>
        <Alert variant="danger">
          <Alert.Heading>Error</Alert.Heading>
          <p>{error}</p>
          <Button variant="outline-danger" onClick={() => navigate(-1)}>Go Back</Button>
        </Alert>
      </Container>
    );
  }

  // If quiz not found
  if (!quizData && !directlyFetchedQuiz) {
    return (
      <Container>
        <Alert variant="warning">
          <Alert.Heading>Quiz Not Found</Alert.Heading>
          <p>The requested quiz could not be found. It may have been deleted or you may not have permission to view it.</p>
          <Button variant="outline-primary" onClick={() => navigate(-1)}>Go Back</Button>
        </Alert>
      </Container>
    );
  }

  // Student view
  if (currentUser?.role === "STUDENT") {
    return (
      <Container>
        <div className="p-4 border rounded shadow-sm mb-4">
          {/* Publish Status Alert */}
          <Alert variant={published ? "success" : "warning"}>
            <strong>Status:</strong> {published ? "Published" : "Not Published"}
          </Alert>
          
          <h2>{quizTitle}</h2>
          <hr />
          <div className="row mb-3">
            <div className="col-md-6">
              <div><strong>Points:</strong> {points}</div>
              <div><strong>Questions:</strong> {questions}</div>
              <div><strong>Time Limit:</strong> {timeLimit} Minutes</div>
            </div>
            <div className="col-md-6">
              <div>
                <strong>Available From:</strong> {
                  availableFromDate 
                    ? new Date(availableFromDate).toLocaleString() 
                    : "Not set"
                }
              </div>
              <div>
                <strong>Due:</strong> {
                  dueDate 
                    ? new Date(dueDate).toLocaleString() 
                    : "Not set"
                }
              </div>
              <div><strong>Attempts Allowed:</strong> {multipleAttempts ? attempts : 1}</div>
            </div>
          </div>
          <Button
            variant="primary"
            size="lg"
            onClick={handleStartQuiz}
            disabled={
              !published ||
              (availableFromDate && new Date() < new Date(availableFromDate)) ||
              (dueDate && new Date() > new Date(dueDate))
            }
          >
            Start Quiz
          </Button>
          {!published && (
            <div className="alert alert-warning mt-3">
              This quiz is not yet published.
            </div>
          )}
          {(availableFromDate && new Date() < new Date(availableFromDate)) && (
            <div className="alert alert-info mt-3">
              This quiz will be available from {new Date(availableFromDate).toLocaleString()}.
            </div>
          )}
          {(dueDate && new Date() > new Date(dueDate)) && (
            <div className="alert alert-danger mt-3">
              The due date for this quiz has passed.
            </div>
          )}
        </div>
      </Container>
    );
  }

  // Faculty view - Quiz editor
  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Quiz Details</h2>
        <div>
          <Button 
            variant={published ? "warning" : "success"}
            onClick={handlePublishToggle}
            className="me-2"
            disabled={isLoading}
          >
            {published ? "Unpublish Quiz" : "Publish Quiz"}
          </Button>
          <Button 
            variant="secondary" 
            onClick={() => navigate(-1)}
            disabled={isLoading}
          >
            Back
          </Button>
        </div>
      </div>
      
      {/* Status alert */}
      <Alert variant={published ? "success" : "warning"} className="mb-4">
        <strong>Status:</strong> {published ? "Published" : "Not Published"}
        {published && (
          <span className="ms-2">
            (Students can now access this quiz)
          </span>
        )}
      </Alert>
      
      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}
      
      <Form className="p-4 border rounded shadow-sm">
        <Form.Group className="mb-3" controlId="quiz-title">
          <Form.Label>Quiz Title</Form.Label>
          <Form.Control 
            type="text" 
            value={quizTitle}
            onChange={(e) => setQuizTitle(e.target.value)} 
          />
        </Form.Group>

        <Row className="mb-3">
          <Col md={6}>
            <Form.Group controlId="quiz-type">
              <Form.Label>Quiz Type</Form.Label>
              <Form.Select 
                value={quizType} 
                onChange={(e) => setQuizType(e.target.value)}
              >
                <option value="Graded Quiz">Graded Quiz</option>
                <option value="Practice Quiz">Practice Quiz</option>
                <option value="Graded Survey">Graded Survey</option>
                <option value="Ungraded Survey">Ungraded Survey</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="points">
              <Form.Label>Points</Form.Label>
              <Form.Control 
                type="number" 
                value={points}
                onChange={(e) => setPoints(Number(e.target.value))}
                disabled
              />
              <Form.Text className="text-muted">
                Total points will be calculated from questions
              </Form.Text>
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <Form.Group controlId="assignment-group">
              <Form.Label>Assignment Group</Form.Label>
              <Form.Select 
                value={assignmentGroup} 
                onChange={(e) => setAssignmentGroup(e.target.value)}
              >
                <option value="QUIZZES">Quizzes</option>
                <option value="EXAMS">Exams</option>
                <option value="ASSIGNMENTS">Assignments</option>
                <option value="PROJECT">Project</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="shuffle-answers">
              <Form.Label>Shuffle Answers</Form.Label>
              <Form.Select 
                value={shuffleAnswers ? "Yes" : "No"} 
                onChange={(e) => setShuffleAnswers(e.target.value === "Yes")}
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <Form.Group controlId="time-limit">
              <Form.Label>Time Limit (Minutes)</Form.Label>
              <Form.Control 
                type="number" 
                value={timeLimit}
                onChange={(e) => setTimeLimit(Number(e.target.value))}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="multiple-attempts">
              <Form.Label>Multiple Attempts</Form.Label>
              <Form.Select 
                value={multipleAttempts ? "Yes" : "No"} 
                onChange={(e) => setMultipleAttempts(e.target.value === "Yes")}
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        {multipleAttempts && (
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="attempts">
                <Form.Label>How Many Attempts</Form.Label>
                <Form.Control 
                  type="number" 
                  value={attempts}
                  onChange={(e) => setAttempts(Number(e.target.value))}
                  min={1}
                />
              </Form.Group>
            </Col>
          </Row>
        )}

        <Row className="mb-3">
          <Col md={6}>
            <Form.Group controlId="show-correct-answers">
              <Form.Label>Show Correct Answers</Form.Label>
              <Form.Select 
                value={showCorrectAnswers} 
                onChange={(e) => setShowCorrectAnswers(e.target.value)}
              >
                <option value="Immediately">Immediately</option>
                <option value="After Last Attempt">After Last Attempt</option>
                <option value="After Due Date">After Due Date</option>
                <option value="Never">Never</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="access-code">
              <Form.Label>Access Code (Optional)</Form.Label>
              <Form.Control 
                type="text" 
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                placeholder="Leave blank for no access code"
              />
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={4}>
            <Form.Group controlId="one-question-at-a-time">
              <Form.Label>One Question at a Time</Form.Label>
              <Form.Select 
                value={oneQuestionAtATime ? "Yes" : "No"} 
                onChange={(e) => setOneQuestionAtATime(e.target.value === "Yes")}
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group controlId="webcam-required">
              <Form.Label>Webcam Required</Form.Label>
              <Form.Select 
                value={webcamRequired ? "Yes" : "No"} 
                onChange={(e) => setWebcamRequired(e.target.value === "Yes")}
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group controlId="lock-questions">
              <Form.Label>Lock Questions After Answering</Form.Label>
              <Form.Select 
                value={lockQuestionsAfterAnswering ? "Yes" : "No"} 
                onChange={(e) => setLockQuestionsAfterAnswering(e.target.value === "Yes")}
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        <hr />

        <h4 className="mb-3">Availability</h4>
        <Row className="mb-3">
          <Col md={4}>
            <Form.Group controlId="due-date">
              <Form.Label>Due Date</Form.Label>
              <Form.Control 
                type="datetime-local" 
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group controlId="available-from">
              <Form.Label>Available From</Form.Label>
              <Form.Control 
                type="datetime-local" 
                value={availableFromDate}
                onChange={(e) => setAvailableFromDate(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group controlId="available-until">
              <Form.Label>Until</Form.Label>
              <Form.Control 
                type="datetime-local" 
                value={availableUntilDate}
                onChange={(e) => setAvailableUntilDate(e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>

        <hr />

        <div className="d-flex justify-content-between">
          <Button 
            variant="primary" 
            onClick={() => navigate(`/Kambaz/Courses/${cid}/Quizzes/${qid}/questions`)}
          >
            Edit Questions ({questions})
          </Button>
          
          <div>
            <Button 
              variant="secondary" 
              className="me-2" 
              onClick={() => navigate(-1)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              variant="success" 
              onClick={handleSave}
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </Form>
    </Container>
  );
}





// import { Button, Col, Container, Form, Row } from "react-bootstrap";
// import { useNavigate, useParams } from "react-router";
// import { useDispatch, useSelector } from "react-redux";
// import { updateQuiz as updateQuizAction } from "./reducer";
// import { updateQuiz as updateQuizAPI } from "./client";
// import * as quizzesclient from "./client"
// import { useEffect, useState } from "react";

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
//       attempts?: number;
//       showCorrectAnswers?: string;
//       accessCode?: string;
//       oneQuestionAtATime?: boolean;
//       webcamRequired?: boolean;
//       lockQuestionsAfterAnswering?: boolean;
//       availableUntil?: string;
//       assignmentGroup?: string;
//     }>;
//   };
// }

// export default function QuizDetails() {
//   const { cid, qid } = useParams();
//   //const { quizzes } = useSelector((state: RootState) => state.quizReducer);
//   const quizzes = useSelector((state: any) => {
//     // Check if quizReducer exists, if not, use local state
//     if (!state.quizReducer) {
//       console.warn("quizReducer not found in Redux store");
//       return [];
//     }
//     return state.quizReducer.quizzes || [];
//   });
//   const { currentUser } = useSelector((state: RootState) => state.accountReducer);
//   const quizData = quizzes?.find((q: { _id: string | undefined; course: string | undefined; }) => q._id === qid && q.course === cid);
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
  
//   // Initialize state with quiz data or defaults
//   const [quizTitle, setQuizTitle] = useState<string>("");
//   const [quizType, setQuizType] = useState<string>("Graded Quiz");
//   const [assignmentGroup, setAssignmentGroup] = useState<string>("QUIZZES");
//   const [shuffleAnswers, setShuffleAnswers] = useState<boolean>(true);
//   const [timeLimit, setTimeLimit] = useState<number>(30);
//   const [multipleAttempts, setMultipleAttempts] = useState<boolean>(false);
//   const [attempts, setAttempts] = useState<number>(1);
//   const [showCorrectAnswers, setShowCorrectAnswers] = useState<string>("Immediately");
//   const [accessCode, setAccessCode] = useState<string>("");
//   const [oneQuestionAtATime, setOneQuestionAtATime] = useState<boolean>(true);
//   const [webcamRequired, setWebcamRequired] = useState<boolean>(false);
//   const [lockQuestionsAfterAnswering, setLockQuestionsAfterAnswering] = useState<boolean>(false);
//   const [dueDate, setDueDate] = useState<string>("");
//   const [availableFromDate, setAvailableFromDate] = useState<string>("");
//   const [availableUntilDate, setAvailableUntilDate] = useState<string>("");
//   const [isLoading, setIsLoading] = useState<boolean>(false);
//   const [questions, setQuestions] = useState<number>(0);
//   const [points, setPoints] = useState<number>(0);
  
//   // Initialize form with data when component mounts
//   // useEffect(() => {
//   //   if (quizData) {
//   //     setQuizTitle(quizData.title || "");
//   //     setQuizType(quizData.quizType || "Graded Quiz");
//   //     setAssignmentGroup(quizData.assignmentGroup || "QUIZZES");
//   //     setShuffleAnswers(quizData.shuffleAnswers || true);
//   //     setTimeLimit(quizData.timeLimit || 30);
//   //     setMultipleAttempts(quizData.multipleAttempts || false);
//   //     setAttempts(quizData.attempts || 1);
//   //     setShowCorrectAnswers(quizData.showCorrectAnswers || "Immediately");
//   //     setAccessCode(quizData.accessCode || "");
//   //     setOneQuestionAtATime(quizData.oneQuestionAtATime || true);
//   //     setWebcamRequired(quizData.webcamRequired || false);
//   //     setLockQuestionsAfterAnswering(quizData.lockQuestionsAfterAnswering || false);
//   //     setDueDate(quizData.due_date || "");
//   //     setAvailableFromDate(quizData.available_from_date || "");
//   //     setAvailableUntilDate(quizData.availableUntil || "");
//   //     setQuestions(quizData.questions || 0);
//   //     setPoints(Number(quizData.points) || 0);
//   //   }
//   // }, [quizData]);

//   useEffect(() => {
//     const loadQuizDirectly = async () => {
//       if (!quizData && qid) {
//         try {
//           console.log("Fetching quiz directly:", qid);
//           const quiz = await quizzesclient.findQuizById(qid);
//           console.log("Direct API response:", quiz);
          
//           // Set local state with quiz data
//           setQuizTitle(quiz.title || "");
//           setQuizType(quiz.quizType || "Graded Quiz");
//           setAssignmentGroup(quiz.assignmentGroup || "QUIZZES");
//           setShuffleAnswers(quiz.shuffleAnswers || true);
//           setTimeLimit(quiz.timeLimit || 30);
//           setMultipleAttempts(quiz.multipleAttempts || false);
//           setAttempts(quiz.attempts || 1);
//           setShowCorrectAnswers(quiz.showCorrectAnswers || "Immediately");
//           setAccessCode(quiz.accessCode || "");
//           setOneQuestionAtATime(quiz.oneQuestionAtATime || true);
//           setWebcamRequired(quiz.webcamRequired || false);
//           setLockQuestionsAfterAnswering(quiz.lockQuestionsAfterAnswering || false);
//           setDueDate(quiz.due_date || "");
//           setAvailableFromDate(quiz.available_from_date || "");
//           setAvailableUntilDate(quiz.availableUntil || "");
//           setQuestions(quiz.questions || 0);
//           setPoints(Number(quiz.points) || 0);
//         } catch (error) {
//           console.error("Error fetching quiz directly:", error);
//         }
//       }
//     };
    
//     loadQuizDirectly();
//   }, [qid, quizData]);

//   const handleSave = async (e: React.MouseEvent) => {
//     e.preventDefault();
//     setIsLoading(true);
    
//     const updatedQuiz = {
//       _id: qid,
//       title: quizTitle,
//       course: cid,
//       quizType,
//       assignmentGroup,
//       shuffleAnswers,
//       timeLimit,
//       multipleAttempts,
//       attempts,
//       showCorrectAnswers,
//       accessCode,
//       oneQuestionAtATime,
//       webcamRequired,
//       lockQuestionsAfterAnswering,
//       due_date: dueDate,
//       available_from_date: availableFromDate,
//       availableUntil: availableUntilDate,
//       questions,
//       points
//     };

//     try {
//       // Update the backend
//       await updateQuizAPI(updatedQuiz);
      
//       // Update Redux store
//       dispatch(updateQuizAction(updatedQuiz));
      
//       // Navigate back
//       navigate(-1);
//     } catch (error) {
//       console.error("Failed to update quiz:", error);
//       alert("Failed to update quiz. Please try again.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleStartQuiz = () => {
//     navigate(`/Kambaz/Courses/${cid}/Quizzes/${qid}/take`);
//   };

//   // If quiz not found
//   if (!quizData) {
//     return (
//       <Container>
//         <div className="alert alert-warning">Quiz not found</div>
//         <Button onClick={() => navigate(-1)}>Go Back</Button>
//       </Container>
//     );
//   }

//   // Student view
//   if (currentUser?.role === "STUDENT") {
//     return (
//       <Container>
//         <div className="p-4 border rounded shadow-sm mb-4">
//           <h2>{quizTitle}</h2>
//           <hr />
//           <div className="row mb-3">
//             <div className="col-md-6">
//               <div><strong>Points:</strong> {points}</div>
//               <div><strong>Questions:</strong> {questions}</div>
//               <div><strong>Time Limit:</strong> {timeLimit} Minutes</div>
//             </div>
//             <div className="col-md-6">
//               <div><strong>Available From:</strong> {new Date(availableFromDate).toLocaleString()}</div>
//               <div><strong>Due:</strong> {new Date(dueDate).toLocaleString()}</div>
//               <div><strong>Attempts Allowed:</strong> {multipleAttempts ? attempts : 1}</div>
//             </div>
//           </div>
//           <Button
//             variant="primary"
//             size="lg"
//             onClick={handleStartQuiz}
//             disabled={
//               !quizData.published ||
//               (new Date() < new Date(availableFromDate)) ||
//               (new Date() > new Date(dueDate))
//             }
//           >
//             Start Quiz
//           </Button>
//           {!quizData.published && (
//             <div className="alert alert-warning mt-3">
//               This quiz is not yet published.
//             </div>
//           )}
//           {(new Date() < new Date(availableFromDate)) && (
//             <div className="alert alert-info mt-3">
//               This quiz will be available from {new Date(availableFromDate).toLocaleString()}.
//             </div>
//           )}
//           {(new Date() > new Date(dueDate)) && (
//             <div className="alert alert-danger mt-3">
//               The due date for this quiz has passed.
//             </div>
//           )}
//         </div>
//       </Container>
//     );
//   }

//   // Faculty view - Quiz editor
//   return (
//     <Container>
//       <h2 className="mb-4">Quiz Details</h2>
//       <Form className="p-4 border rounded shadow-sm">
//         <Form.Group className="mb-3" controlId="quiz-title">
//           <Form.Label>Quiz Title</Form.Label>
//           <Form.Control 
//             type="text" 
//             value={quizTitle}
//             onChange={(e) => setQuizTitle(e.target.value)} 
//           />
//         </Form.Group>

//         <Row className="mb-3">
//           <Col md={6}>
//             <Form.Group controlId="quiz-type">
//               <Form.Label>Quiz Type</Form.Label>
//               <Form.Select 
//                 value={quizType} 
//                 onChange={(e) => setQuizType(e.target.value)}
//               >
//                 <option value="Graded Quiz">Graded Quiz</option>
//                 <option value="Practice Quiz">Practice Quiz</option>
//                 <option value="Graded Survey">Graded Survey</option>
//                 <option value="Ungraded Survey">Ungraded Survey</option>
//               </Form.Select>
//             </Form.Group>
//           </Col>
//           <Col md={6}>
//             <Form.Group controlId="points">
//               <Form.Label>Points</Form.Label>
//               <Form.Control 
//                 type="number" 
//                 value={points}
//                 onChange={(e) => setPoints(Number(e.target.value))}
//                 disabled
//               />
//               <Form.Text className="text-muted">
//                 Total points will be calculated from questions
//               </Form.Text>
//             </Form.Group>
//           </Col>
//         </Row>

//         <Row className="mb-3">
//           <Col md={6}>
//             <Form.Group controlId="assignment-group">
//               <Form.Label>Assignment Group</Form.Label>
//               <Form.Select 
//                 value={assignmentGroup} 
//                 onChange={(e) => setAssignmentGroup(e.target.value)}
//               >
//                 <option value="QUIZZES">Quizzes</option>
//                 <option value="EXAMS">Exams</option>
//                 <option value="ASSIGNMENTS">Assignments</option>
//                 <option value="PROJECT">Project</option>
//               </Form.Select>
//             </Form.Group>
//           </Col>
//           <Col md={6}>
//             <Form.Group controlId="shuffle-answers">
//               <Form.Label>Shuffle Answers</Form.Label>
//               <Form.Select 
//                 value={shuffleAnswers ? "Yes" : "No"} 
//                 onChange={(e) => setShuffleAnswers(e.target.value === "Yes")}
//               >
//                 <option value="Yes">Yes</option>
//                 <option value="No">No</option>
//               </Form.Select>
//             </Form.Group>
//           </Col>
//         </Row>

//         <Row className="mb-3">
//           <Col md={6}>
//             <Form.Group controlId="time-limit">
//               <Form.Label>Time Limit (Minutes)</Form.Label>
//               <Form.Control 
//                 type="number" 
//                 value={timeLimit}
//                 onChange={(e) => setTimeLimit(Number(e.target.value))}
//               />
//             </Form.Group>
//           </Col>
//           <Col md={6}>
//             <Form.Group controlId="multiple-attempts">
//               <Form.Label>Multiple Attempts</Form.Label>
//               <Form.Select 
//                 value={multipleAttempts ? "Yes" : "No"} 
//                 onChange={(e) => setMultipleAttempts(e.target.value === "Yes")}
//               >
//                 <option value="No">No</option>
//                 <option value="Yes">Yes</option>
//               </Form.Select>
//             </Form.Group>
//           </Col>
//         </Row>

//         {multipleAttempts && (
//           <Row className="mb-3">
//             <Col md={6}>
//               <Form.Group controlId="attempts">
//                 <Form.Label>How Many Attempts</Form.Label>
//                 <Form.Control 
//                   type="number" 
//                   value={attempts}
//                   onChange={(e) => setAttempts(Number(e.target.value))}
//                   min={1}
//                 />
//               </Form.Group>
//             </Col>
//           </Row>
//         )}

//         <Row className="mb-3">
//           <Col md={6}>
//             <Form.Group controlId="show-correct-answers">
//               <Form.Label>Show Correct Answers</Form.Label>
//               <Form.Select 
//                 value={showCorrectAnswers} 
//                 onChange={(e) => setShowCorrectAnswers(e.target.value)}
//               >
//                 <option value="Immediately">Immediately</option>
//                 <option value="After Last Attempt">After Last Attempt</option>
//                 <option value="After Due Date">After Due Date</option>
//                 <option value="Never">Never</option>
//               </Form.Select>
//             </Form.Group>
//           </Col>
//           <Col md={6}>
//             <Form.Group controlId="access-code">
//               <Form.Label>Access Code (Optional)</Form.Label>
//               <Form.Control 
//                 type="text" 
//                 value={accessCode}
//                 onChange={(e) => setAccessCode(e.target.value)}
//                 placeholder="Leave blank for no access code"
//               />
//             </Form.Group>
//           </Col>
//         </Row>

//         <Row className="mb-3">
//           <Col md={4}>
//             <Form.Group controlId="one-question-at-a-time">
//               <Form.Label>One Question at a Time</Form.Label>
//               <Form.Select 
//                 value={oneQuestionAtATime ? "Yes" : "No"} 
//                 onChange={(e) => setOneQuestionAtATime(e.target.value === "Yes")}
//               >
//                 <option value="Yes">Yes</option>
//                 <option value="No">No</option>
//               </Form.Select>
//             </Form.Group>
//           </Col>
//           <Col md={4}>
//             <Form.Group controlId="webcam-required">
//               <Form.Label>Webcam Required</Form.Label>
//               <Form.Select 
//                 value={webcamRequired ? "Yes" : "No"} 
//                 onChange={(e) => setWebcamRequired(e.target.value === "Yes")}
//               >
//                 <option value="No">No</option>
//                 <option value="Yes">Yes</option>
//               </Form.Select>
//             </Form.Group>
//           </Col>
//           <Col md={4}>
//             <Form.Group controlId="lock-questions">
//               <Form.Label>Lock Questions After Answering</Form.Label>
//               <Form.Select 
//                 value={lockQuestionsAfterAnswering ? "Yes" : "No"} 
//                 onChange={(e) => setLockQuestionsAfterAnswering(e.target.value === "Yes")}
//               >
//                 <option value="No">No</option>
//                 <option value="Yes">Yes</option>
//               </Form.Select>
//             </Form.Group>
//           </Col>
//         </Row>

//         <hr />

//         <h4 className="mb-3">Availability</h4>
//         <Row className="mb-3">
//           <Col md={4}>
//             <Form.Group controlId="due-date">
//               <Form.Label>Due Date</Form.Label>
//               <Form.Control 
//                 type="datetime-local" 
//                 value={dueDate}
//                 onChange={(e) => setDueDate(e.target.value)}
//               />
//             </Form.Group>
//           </Col>
//           <Col md={4}>
//             <Form.Group controlId="available-from">
//               <Form.Label>Available From</Form.Label>
//               <Form.Control 
//                 type="datetime-local" 
//                 value={availableFromDate}
//                 onChange={(e) => setAvailableFromDate(e.target.value)}
//               />
//             </Form.Group>
//           </Col>
//           <Col md={4}>
//             <Form.Group controlId="available-until">
//               <Form.Label>Until</Form.Label>
//               <Form.Control 
//                 type="datetime-local" 
//                 value={availableUntilDate}
//                 onChange={(e) => setAvailableUntilDate(e.target.value)}
//               />
//             </Form.Group>
//           </Col>
//         </Row>

//         <hr />

//         <div className="d-flex justify-content-between">
//           <Button 
//             variant="primary" 
//             onClick={() => navigate(`/Kambaz/Courses/${cid}/Quizzes/${qid}/questions`)}
//           >
//             Edit Questions ({questions})
//           </Button>
          
//           <div>
//             <Button 
//               variant="secondary" 
//               className="me-2" 
//               onClick={() => navigate(-1)}
//               disabled={isLoading}
//             >
//               Cancel
//             </Button>
//             <Button 
//               variant="success" 
//               onClick={handleSave}
//               disabled={isLoading}
//             >
//               {isLoading ? "Saving..." : "Save"}
//             </Button>
//           </div>
//         </div>
//       </Form>
//     </Container>
//   );
// }