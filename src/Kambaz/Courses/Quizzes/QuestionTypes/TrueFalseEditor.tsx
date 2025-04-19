import React from "react";
import { Form, Button, Row, Col, Card } from "react-bootstrap";
import { TrueFalseQuestion } from "../QuizQuestionEditor";
import { FaCheck } from "react-icons/fa";

interface TrueFalseEditorProps {
  question: TrueFalseQuestion;
  onChange: (question: TrueFalseQuestion) => void;
  onCancel: () => void;
  onSave: () => void;
}

export default function TrueFalseEditor({ question, onChange, onCancel, onSave }: TrueFalseEditorProps) {
  const handleTitleChange = (title: string) => {
    onChange({
      ...question,
      text: title
    });
  };

  const handlePointsChange = (points: number) => {
    onChange({
      ...question,
      points: points
    });
  };

  const handleCorrectAnswerChange = (value: boolean) => {
    onChange({
      ...question,
      correctAnswer: value
    });
  };

  return (
    <Card className="border">
      <Card.Body>
        <Row className="mb-3 align-items-center">
          <Col md={6}>
            <Form.Control 
              type="text" 
              placeholder="Is 2 + 2 = 4?" 
              value={question.text} 
              onChange={(e) => handleTitleChange(e.target.value)}
              className="mb-2 mb-md-0"
            />
          </Col>
          <Col md={3}>
            <Form.Select defaultValue="TRUE_FALSE" disabled>
              <option value="TRUE_FALSE">True/False</option>
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
          Enter your question text, then select if True or False is the correct answer.
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
              placeholder="Is it true that 2 + 2 = 4?"
              className="border-0"
            />
          </div>
        </div>

        <div className="mb-3">
          <h6>Answers:</h6>
          <div className="d-flex align-items-center mb-2">
            <div className="d-flex align-items-center">
              <FaCheck className={`me-2 ${question.correctAnswer ? "text-success" : "text-white"}`} />
              <Form.Check
                type="radio"
                id="true-answer"
                label="True"
                checked={question.correctAnswer === true}
                onChange={() => handleCorrectAnswerChange(true)}
                className={question.correctAnswer ? "fw-bold text-success" : ""}
              />
            </div>
          </div>
          <div className="d-flex align-items-center">
            <div className="d-flex align-items-center">
              <FaCheck className={`me-2 ${!question.correctAnswer ? "text-success" : "text-white"}`} />
              <Form.Check
                type="radio"
                id="false-answer"
                label="False"
                checked={question.correctAnswer === false}
                onChange={() => handleCorrectAnswerChange(false)}
                className={!question.correctAnswer ? "fw-bold text-success" : ""}
              />
            </div>
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