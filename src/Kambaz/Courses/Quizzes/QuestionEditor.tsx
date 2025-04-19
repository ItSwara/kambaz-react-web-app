import { useState, useEffect } from "react";
import { Question, MultipleChoiceQuestion, TrueFalseQuestion, FillInBlankQuestion } from "./QuizQuestionEditor";
import MultipleChoiceEditor from "./QuestionTypes/MultipleChoiceEditor";
import TrueFalseEditor from "./QuestionTypes/TrueFalseEditor";
import FillInBlankEditor from "./QuestionTypes/FillIntheBlanksEditor";

interface QuestionEditorProps {
  question: Question;
  index: number;
  onEdit: () => void;
  onSave: (question: Question) => void;
  onCancel: () => void;
  onDelete: () => void;
}

export default function QuestionEditor({
  question,
  index,
  onEdit,
  onSave,
  onCancel,
  onDelete
}: QuestionEditorProps) {
  const [editedQuestion, setEditedQuestion] = useState<Question>(question);

  useEffect(() => {
    setEditedQuestion(question);
  }, [question]);

  const handleSave = () => {
    onSave(editedQuestion);
  };

  const renderQuestionEditor = () => {
    switch (editedQuestion.type) {
      case "MULTIPLE_CHOICE":
        return (
          <MultipleChoiceEditor 
            question={editedQuestion as MultipleChoiceQuestion}
            onChange={updatedQuestion => setEditedQuestion(updatedQuestion)}
            onCancel={onCancel}
            onSave={handleSave}
          />
        );
      
      case "TRUE_FALSE":
        return (
          <TrueFalseEditor 
            question={editedQuestion as TrueFalseQuestion}
            onChange={updatedQuestion => setEditedQuestion(updatedQuestion)}
            onCancel={onCancel}
            onSave={handleSave}
          />
        );
      
      case "FILL_IN_BLANK":
        return (
          <FillInBlankEditor 
            question={editedQuestion as FillInBlankQuestion}
            onChange={updatedQuestion => setEditedQuestion(updatedQuestion)}
            onCancel={onCancel}
            onSave={handleSave}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="question-editor mb-4">
      {renderQuestionEditor()}
    </div>
  );
}