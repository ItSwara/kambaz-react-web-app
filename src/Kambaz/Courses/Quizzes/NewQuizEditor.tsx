import { useState } from "react";
import { Button, Form } from "react-bootstrap";
import { useParams } from "react-router";

export default function QuizCreator({
  handleClose, 
  addQuiz
} : {
  handleClose: () => void; 
  addQuiz: (quiz: object) => void;
}) {
  const [quizId, setQuizId] = useState(`Q${Date.now()}`);
  const [quizTitle, setQuizTitle] = useState("");
  const [quizType, setQuizType] = useState("Graded Quiz");
  const [assignmentGroup, setAssignmentGroup] = useState("QUIZZES");
  const [timeLimit, setTimeLimit] = useState(30);
  const [shuffleAnswers, setShuffleAnswers] = useState(true);
  const [dueDate, setDueDate] = useState("");
  const [availableFromDate, setAvailableFromDate] = useState("");
  const [availableUntilDate, setAvailableUntilDate] = useState("");
  const {cid} = useParams();

  return(
    <div>
      <Form className="p-3 border fs-5">
        <Form.Group className="mb-2" controlId="quiz-id">
          <Form.Label>Quiz ID</Form.Label>
          <Form.Control 
            type="text" 
            autoFocus={true} 
            onChange={(e) => setQuizId(e.target.value)} 
            defaultValue={quizId}
          />
        </Form.Group>
        
        <Form.Group className="mb-2" controlId="quiz-title">
          <Form.Label>Quiz Title</Form.Label>
          <Form.Control 
            type="text" 
            onChange={(e) => setQuizTitle(e.target.value)} 
            defaultValue={quizTitle}
          />
        </Form.Group>
        
        <Form.Group className="mb-2" controlId="quiz-type">
          <Form.Label>Quiz Type</Form.Label>
          <Form.Select 
            onChange={(e) => setQuizType(e.target.value)} 
            defaultValue={quizType}
          >
            <option value="Graded Quiz">Graded Quiz</option>
            <option value="Practice Quiz">Practice Quiz</option>
            <option value="Graded Survey">Graded Survey</option>
            <option value="Ungraded Survey">Ungraded Survey</option>
          </Form.Select>
        </Form.Group>
        
        <Form.Group className="mb-2" controlId="assignment-group">
          <Form.Label>Assignment Group</Form.Label>
          <Form.Select 
            onChange={(e) => setAssignmentGroup(e.target.value)} 
            defaultValue={assignmentGroup}
          >
            <option value="QUIZZES">Quizzes</option>
            <option value="EXAMS">Exams</option>
            <option value="ASSIGNMENTS">Assignments</option>
            <option value="PROJECT">Project</option>
          </Form.Select>
        </Form.Group>
        
        <Form.Group className="mb-2" controlId="shuffle-answers">
          <Form.Label>Shuffle Answers</Form.Label>
          <Form.Select 
            onChange={(e) => setShuffleAnswers(e.target.value === "Yes")} 
            defaultValue={shuffleAnswers ? "Yes" : "No"}
          >
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </Form.Select>
        </Form.Group>
        
        <Form.Group className="mb-2" controlId="time-limit">
          <Form.Label>Time Limit (Minutes)</Form.Label>
          <Form.Control 
            type="number" 
            onChange={(e) => setTimeLimit(Number(e.target.value))} 
            defaultValue={timeLimit}
          />
        </Form.Group>
        
        <Form.Group className="mt-3" controlId="due-date">
          <Form.Label>Due</Form.Label>
          <Form.Control 
            type="datetime-local" 
            onChange={(e) => setDueDate(e.target.value)}
          />
        </Form.Group>
        
        <Form.Group className="mt-3">
          <Form.Group controlId="available-from">
            <Form.Label>Available From</Form.Label>
            <Form.Control 
              type="datetime-local" 
              onChange={(e) => setAvailableFromDate(e.target.value)} 
            />
          </Form.Group>
          
          <Form.Group className="mt-2" controlId="available-until">
            <Form.Label>Until</Form.Label>
            <Form.Control 
              type="datetime-local" 
              onChange={(e) => setAvailableUntilDate(e.target.value)} 
            />
          </Form.Group>
        </Form.Group>
        
        <Button 
          variant="primary" 
          type="submit" 
          className="mt-3" 
          onClick={(e) => {
            e.preventDefault();
            addQuiz({ 
              "_id": quizId, 
              "title": quizTitle || "New Quiz", 
              "course": cid, 
              "quizType": quizType,
              "assignmentGroup": assignmentGroup,
              "shuffleAnswers": shuffleAnswers,
              "timeLimit": timeLimit,
              "multipleAttempts": false,
              "attempts": 1,
              "showCorrectAnswers": "Immediately",
              "oneQuestionAtATime": true,
              "webcamRequired": false,
              "lockQuestionsAfterAnswering": false,
              "due_date": dueDate,
              "available_from_date": availableFromDate,
              "availableUntil": availableUntilDate,
              "questions": 0,
              "points": 0,
              "published": false
            });
          }}
        >
          Create Quiz
        </Button>
      </Form>
    </div>
  );
}