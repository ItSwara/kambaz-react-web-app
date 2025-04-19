import React from "react";
import { Form, Button, InputGroup, Row, Col, Card } from "react-bootstrap";
import { MultipleChoiceQuestion } from "../QuizQuestionEditor";
import { FaTrash, FaCheck } from "react-icons/fa";

interface MultipleChoiceEditorProps {
  question: MultipleChoiceQuestion;
  onChange: (question: MultipleChoiceQuestion) => void;
  onCancel: () => void;
  onSave: () => void;
}

export default function MultipleChoiceEditor({ question, onChange, onCancel, onSave }: MultipleChoiceEditorProps) {
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

  const handleOptionTextChange = (index: number, text: string) => {
    const updatedOptions = [...question.options];
    updatedOptions[index] = {
      ...updatedOptions[index],
      text
    };
    
    onChange({
      ...question,
      options: updatedOptions
    });
  };

  const handleCorrectAnswerChange = (index: number) => {
    const updatedOptions = question.options.map((option, i) => ({
      ...option,
      isCorrect: i === index
    }));
    
    onChange({
      ...question,
      options: updatedOptions
    });
  };

  const handleAddOption = () => {
    onChange({
      ...question,
      options: [
        ...question.options,
        { text: "", isCorrect: false }
      ]
    });
  };

  const handleRemoveOption = (index: number) => {
    if (question.options.length <= 2) {
      return; // Minimum 2 options
    }
    
    const updatedOptions = [...question.options];
    updatedOptions.splice(index, 1);
    
    // If we removed the correct answer, set the first option as correct
    const hasCorrectAnswer = updatedOptions.some(option => option.isCorrect);
    if (!hasCorrectAnswer) {
      updatedOptions[0].isCorrect = true;
    }
    
    onChange({
      ...question,
      options: updatedOptions
    });
  };

  return (
    <Card className="border">
      <Card.Body>
        <Row className="mb-3 align-items-center">
          <Col md={6}>
            <Form.Control 
              type="text" 
              placeholder="Easy Question" 
              value={question.text} 
              onChange={(e) => handleTitleChange(e.target.value)}
              className="mb-2 mb-md-0"
            />
          </Col>
          <Col md={3}>
            <Form.Select defaultValue="MULTIPLE_CHOICE" disabled>
              <option value="MULTIPLE_CHOICE">Multiple Choice</option>
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
          Enter your question and multiple answers, then select the one correct answer.
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
              placeholder="How much is 2 + 2?"
              className="border-0"
            />
          </div>
        </div>

        <div className="mb-3">
          <h6>Answers:</h6>
          {question.options.map((option, index) => (
            <div key={index} className="d-flex align-items-center mb-2">
              {option.isCorrect ? (
                <div className="me-2 text-success" style={{width: "120px"}}>
                  <FaCheck className="me-1" />
                  <span>Correct Answer</span>
                </div>
              ) : (
                <div className="me-2" style={{width: "120px"}}>
                  Possible Answer
                </div>
              )}
              
              <InputGroup>
                <Form.Control
                  type="text"
                  placeholder={`Answer ${index + 1}`}
                  value={option.text}
                  onChange={(e) => handleOptionTextChange(index, e.target.value)}
                />
                <Button
                  variant="outline-secondary"
                  onClick={() => handleCorrectAnswerChange(index)}
                  className={option.isCorrect ? "bg-success text-white" : ""}
                >
                  <FaCheck />
                </Button>
                <Button
                  variant="outline-danger"
                  onClick={() => handleRemoveOption(index)}
                  disabled={question.options.length <= 2}
                >
                  <FaTrash />
                </Button>
              </InputGroup>
            </div>
          ))}
          
          <div className="text-center mt-3">
            <Button 
              variant="link" 
              onClick={handleAddOption}
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