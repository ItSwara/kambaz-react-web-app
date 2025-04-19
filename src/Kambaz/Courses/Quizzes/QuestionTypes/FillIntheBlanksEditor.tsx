import React from "react";
import { Form, Button, InputGroup, Row, Col, Card } from "react-bootstrap";
import { FillInBlankQuestion } from "../QuizQuestionEditor";
import { FaTrash } from "react-icons/fa";

interface FillInBlankEditorProps {
  question: FillInBlankQuestion;
  onChange: (question: FillInBlankQuestion) => void;
  onCancel: () => void;
  onSave: () => void;
}

interface PossibleAnswer {
  text: string;
}

// Extend the FillInBlankQuestion to handle multiple possible answers
interface ExtendedFillInBlankQuestion extends FillInBlankQuestion {
  possibleAnswers?: PossibleAnswer[];
}

export default function FillInBlankEditor({ question, onChange, onCancel, onSave }: FillInBlankEditorProps) {
  // Set up a local version of the question with possible answers array
  const extendedQuestion = question as ExtendedFillInBlankQuestion;
  if (!extendedQuestion.possibleAnswers) {
    extendedQuestion.possibleAnswers = [{ text: extendedQuestion.correctAnswer || "" }];
  }

  const handleTitleChange = (title: string) => {
    onChange({
      ...extendedQuestion,
      text: title
    } as FillInBlankQuestion);
  };

  const handlePointsChange = (points: number) => {
    onChange({
      ...extendedQuestion,
      points: points
    } as FillInBlankQuestion);
  };

  const handleAnswerChange = (index: number, text: string) => {
    const updatedAnswers = [...extendedQuestion.possibleAnswers!];
    updatedAnswers[index] = { text };
    
    // Update the first answer as the primary correct answer
    const updatedQuestion = {
      ...extendedQuestion,
      correctAnswer: updatedAnswers[0].text,
      possibleAnswers: updatedAnswers
    };
    
    onChange(updatedQuestion as FillInBlankQuestion);
  };

  const handleAddAnswer = () => {
    const updatedQuestion = {
      ...extendedQuestion,
      possibleAnswers: [...extendedQuestion.possibleAnswers!, { text: "" }]
    };
    
    onChange(updatedQuestion as FillInBlankQuestion);
  };

  const handleRemoveAnswer = (index: number) => {
    if (extendedQuestion.possibleAnswers!.length <= 1) {
      return; // Keep at least one answer
    }
    
    const updatedAnswers = [...extendedQuestion.possibleAnswers!];
    updatedAnswers.splice(index, 1);
    
    // Update the first answer as the primary correct answer
    const updatedQuestion = {
      ...extendedQuestion,
      correctAnswer: updatedAnswers[0].text,
      possibleAnswers: updatedAnswers
    };
    
    onChange(updatedQuestion as FillInBlankQuestion);
  };

  return (
    <Card className="border">
      <Card.Body>
        <Row className="mb-3 align-items-center">
          <Col md={6}>
            <Form.Control 
              type="text" 
              placeholder="Easy fill the blank" 
              value={question.text} 
              onChange={(e) => handleTitleChange(e.target.value)}
              className="mb-2 mb-md-0"
            />
          </Col>
          <Col md={3}>
            <Form.Select defaultValue="FILL_IN_BLANK" disabled>
              <option value="FILL_IN_BLANK">Fill In the Blank</option>
            </Form.Select>
          </Col>
          <Col md={3} className="d-flex align-items-center justify-content-end">
            <span className="me-2">pts:</span>
            <Form.Control 
              type="number" 
              min="1" 
              value={question.points} 
              onChange={(e) => handlePointsChange(parseInt(e.target.value))}
              style={{ width: "60px" }}
            />
          </Col>
        </Row>

        <div className="text-muted mb-2">
          Enter your question text, then define all possible correct answers for the blank.
          Students will see the question followed by a small text box to type their answer.
        </div>

        <div className="mb-3">
          <h6>Question:</h6>
          <div className="border p-2 mb-2">
            <div className="d-flex mb-2 border-bottom pb-2">
              <Button variant="light" size="sm" className="me-1">Edit</Button>
              <Button variant="light" size="sm" className="me-1">View</Button>
              <Button variant="light" size="sm" className="me-1">Insert</Button>
              <Button variant="light" size="sm" className="me-1">Format</Button>
              <Button variant="light" size="sm" className="me-1">Tools</Button>
              <Button variant="light" size="sm" className="me-1">Table</Button>
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
              <Button variant="light" size="sm" className="me-1">T²</Button>
              <Button variant="light" size="sm" className="me-1">⋮</Button>
            </div>
            <Form.Control
              as="textarea"
              rows={2}
              placeholder="How much is 2 + 2 = _____?"
              className="border-0"
            />
          </div>
        </div>

        <div className="mb-3">
          <h6>Answers:</h6>
          {extendedQuestion.possibleAnswers!.map((answer, index) => (
            <div key={index} className="d-flex align-items-center mb-2">
              <div className="me-2" style={{width: "120px"}}>
                Possible Answer:
              </div>
              
              <InputGroup>
                <Form.Control
                  type="text"
                  placeholder={`Answer ${index + 1}`}
                  value={answer.text}
                  onChange={(e) => handleAnswerChange(index, e.target.value)}
                />
                <Button
                  variant="outline-danger"
                  onClick={() => handleRemoveAnswer(index)}
                  disabled={extendedQuestion.possibleAnswers!.length <= 1}
                >
                  <FaTrash />
                </Button>
              </InputGroup>
            </div>
          ))}
          
          <div className="text-center mt-3">
            <Button 
              variant="link" 
              onClick={handleAddAnswer}
              className="text-danger"
            >
              + Add Another Answer
            </Button>
          </div>
        </div>

        <div className="d-flex mt-4">
          <Button 
            variant="secondary" 
            onClick={onCancel}
            className="me-2"
          >
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={onSave}
          >
            Update Question
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}   