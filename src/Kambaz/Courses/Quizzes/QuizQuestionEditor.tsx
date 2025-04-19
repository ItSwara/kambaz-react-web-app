import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { Button, Form, Nav, Tab, Container, Alert } from "react-bootstrap";
import * as quizClient from "./client.ts";
import QuestionEditor from "./QuestionEditor.tsx";

// Question type definitions
export interface BaseQuestion {
  _id?: string;
  type: string;
  text: string;
  points: number;
  isEditing?: boolean;
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  type: "MULTIPLE_CHOICE";
  options: Array<{
    text: string;
    isCorrect: boolean;
  }>;
}

export interface TrueFalseQuestion extends BaseQuestion {
  type: "TRUE_FALSE";
  correctAnswer: boolean;
}

export interface FillInBlankQuestion extends BaseQuestion {
  type: "FILL_IN_BLANK";
  correctAnswer: string;
}

export type Question = MultipleChoiceQuestion | TrueFalseQuestion | FillInBlankQuestion;

// Full Quiz interface that matches what the API expects
interface Quiz {
  _id: string | undefined;
  title: string;
  type: string;
  description: string;
  course: string | undefined;
  questions: Question[];
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

export default function QuizQuestionsEditor() {
  const { cid, qid } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state: any) => state.accountReducer);
  const [saveStatus, setSaveStatus] = useState<{ type: string; message: string } | null>(null);
  
  // Initialize with all required fields
  const [quiz, setQuiz] = useState<Quiz>({
    _id: qid || undefined,
    title: "",
    type: "GRADEDQUIZ", // Default value
    description: "",
    course: cid || undefined,
    questions: [],
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
    if (qid && cid) {
      try {
        const fetchedQuiz = await quizClient.findQuizById(cid, qid);
        // Map fetched questions to our internal format
        const formattedQuestions = fetchedQuiz.questions && fetchedQuiz.questions.length > 0 
          ? fetchedQuiz.questions.map((q: any) => {
              if (q.type === "MULTIPLE_CHOICE") {
                return {
                  ...q,
                  isEditing: false
                } as MultipleChoiceQuestion;
              } else if (q.type === "TRUE_FALSE") {
                return {
                  ...q,
                  isEditing: false
                } as TrueFalseQuestion;
              } else if (q.type === "FILL_IN_BLANK") {
                return {
                  ...q,
                  isEditing: false
                } as FillInBlankQuestion;
              }
              return q;
            })
          : [];

        setQuiz({
          ...quiz, // Keep default values for any missing properties
          ...fetchedQuiz,
          questions: formattedQuestions
        });
      } catch (error) {
        console.error("Error fetching quiz:", error);
        setSaveStatus({
          type: "danger",
          message: "Error loading quiz questions."
        });
      }
    }
  };

  useEffect(() => {
    getQuiz();
  }, [qid, cid]);

  const handleAddQuestion = () => {
    const newQuestion: MultipleChoiceQuestion = {
      type: "MULTIPLE_CHOICE",
      text: "New question",
      points: 1,
      isEditing: true,
      options: [
        { text: "", isCorrect: true },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false }
      ]
    };
    
    setQuiz({
      ...quiz,
      questions: [...quiz.questions, newQuestion]
    });
  };

  const handleEditQuestion = (index: number) => {
    const updatedQuestions = [...quiz.questions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      isEditing: true
    };
    
    setQuiz({
      ...quiz,
      questions: updatedQuestions
    });
  };

  const handleSaveQuestion = (index: number, updatedQuestion: Question) => {
    const updatedQuestions = [...quiz.questions];
    updatedQuestions[index] = {
      ...updatedQuestion,
      isEditing: false
    };
    
    setQuiz({
      ...quiz,
      questions: updatedQuestions
    });

    setSaveStatus({
      type: "success",
      message: "Question updated successfully!"
    });

    // Clear the status message after 3 seconds
    setTimeout(() => {
      setSaveStatus(null);
    }, 3000);
  };

  const handleCancelEdit = (index: number) => {
    const updatedQuestions = [...quiz.questions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      isEditing: false
    };
    
    setQuiz({
      ...quiz,
      questions: updatedQuestions
    });
  };

  const handleDeleteQuestion = (index: number) => {
    const updatedQuestions = [...quiz.questions];
    updatedQuestions.splice(index, 1);
    
    setQuiz({
      ...quiz,
      questions: updatedQuestions
    });

    setSaveStatus({
      type: "warning",
      message: "Question deleted."
    });

    // Clear the status message after 3 seconds
    setTimeout(() => {
      setSaveStatus(null);
    }, 3000);
  };

  const calculateTotalPoints = () => {
    return quiz.questions.reduce((total, question) => total + question.points, 0);
  };

  const handleSave = async () => {
    try {
      // Check if cid and qid are defined
      if (!cid || !qid) {
        throw new Error("Course ID or Quiz ID is missing");
      }
  
      // Get the original quiz from the API first
      const originalQuiz = await quizClient.findQuizById(cid, qid);
      
      // Remove isEditing flag from questions
      const updatedQuestions = quiz.questions.map(q => {
        const { isEditing, ...questionWithoutEditing } = q;
        return questionWithoutEditing;
      });
      
      // Merge the updated questions into the original quiz
      const updatedQuiz = {
        ...originalQuiz,
        questions: updatedQuestions,
        points: calculateTotalPoints()
      };
      
      // Use type assertion to bypass TypeScript's type checking
      await quizClient.updateQuiz(cid, qid, updatedQuiz as any);
      
      setSaveStatus({
        type: "success",
        message: "Quiz questions saved successfully!"
      });
      
      // Navigate back to quiz details after a brief delay
      setTimeout(() => {
        navigate(`/Kambaz/Courses/${cid}/Quizzes/${qid}/details`);
      }, 1000);
    } catch (error) {
      console.error("Error saving quiz:", error);
      setSaveStatus({
        type: "danger",
        message: "Error saving quiz questions."
      });
    }
  };

  const handleCancel = () => {
    if (cid && qid) {
      navigate(`/Kambaz/Courses/${cid}/Quizzes/${qid}/details`);
    } else {
      navigate(`/Kambaz/Courses`);
    }
  };

  return (
    <Container className="wd-quiz-questions-editor py-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Quiz Questions</h4>
        <div>
          <span className="fw-bold me-2">Points: {calculateTotalPoints()}</span>
        </div>
      </div>

      {saveStatus && (
        <Alert variant={saveStatus.type} className="my-3">
          {saveStatus.message}
        </Alert>
      )}

      <Tab.Container id="quiz-editor-tabs" defaultActiveKey="questions">
        <Nav variant="tabs" className="mb-4">
          <Nav.Item>
            <Nav.Link 
              as={Link} 
              to={cid && qid ? `/Kambaz/Courses/${cid}/Quizzes/${qid}/edit` : "#"}
            >
              Details
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="questions">
              Questions
            </Nav.Link>
          </Nav.Item>
        </Nav>

        <Tab.Content>
          <Tab.Pane eventKey="questions">
            <div className="text-center mb-4">
              <Button 
                variant="outline-secondary" 
                className="px-4 py-2"
                onClick={handleAddQuestion}
              >
                + New Question
              </Button>
            </div>

            {quiz.questions.length === 0 ? (
              <Alert variant="info">
                This quiz doesn't have any questions yet. Click "New Question" to add one.
              </Alert>
            ) : (
              <div className="wd-questions-list">
                {quiz.questions.map((question, index) => (
                  <div key={index} className="mb-4">
                    {question.isEditing ? (
                      <QuestionEditor
                        question={question}
                        index={index}
                        onEdit={() => {}} // Not needed in edit mode
                        onSave={(updatedQuestion) => handleSaveQuestion(index, updatedQuestion)}
                        onCancel={() => handleCancelEdit(index)}
                        onDelete={() => handleDeleteQuestion(index)}
                      />
                    ) : (
                      <div className="question-preview border p-3 rounded">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <div>
                            <span className="badge bg-primary me-2">Question {index + 1}</span>
                            <span className="badge bg-secondary">{question.points} pts</span>
                            <span className="ms-2 fw-bold">{question.text}</span>
                          </div>
                          <Button 
                            variant="outline-primary" 
                            size="sm"
                            onClick={() => handleEditQuestion(index)}
                          >
                            Edit
                          </Button>
                        </div>
                        <div className="question-content">
                          {/* Simple preview based on question type */}
                          {question.type === "MULTIPLE_CHOICE" && (
                            <div className="ms-3">
                              Multiple choice question with {(question as MultipleChoiceQuestion).options.length} options
                            </div>
                          )}
                          {question.type === "TRUE_FALSE" && (
                            <div className="ms-3">
                              True/False question: Correct answer is {(question as TrueFalseQuestion).correctAnswer ? "True" : "False"}
                            </div>
                          )}
                          {question.type === "FILL_IN_BLANK" && (
                            <div className="ms-3">
                              Fill in the blank question: Answer is "{(question as FillInBlankQuestion).correctAnswer}"
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="d-flex justify-content-start mt-4">
              <Button 
                variant="outline-secondary" 
                className="me-2"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button 
                variant="danger" 
                onClick={handleSave}
                disabled={quiz.questions.length === 0}
              >
                Save
              </Button>
            </div>
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    </Container>
  );
}