// Mock data for quizzes
export const mockQuizzes = [
    {
      _id: "Q0001",
      title: "Q1 - HTML",
      course: "RS101",
      quizType: "Graded Quiz",
      points: 29,
      assignmentGroup: "QUIZZES",
      shuffleAnswers: true,
      timeLimit: 30,
      multipleAttempts: false,
      attempts: 1,
      showCorrectAnswers: "Immediately",
      oneQuestionAtATime: true,
      webcamRequired: false,
      lockQuestionsAfterAnswering: false,
      due_date: "2025-09-21T13:00:00",
      available_from_date: "2025-09-21T11:40:00",
      availableUntil: "2025-09-21T13:00:00",
      published: true,
      questions: 11,
      status: "Closed"
    },
    {
      _id: "Q0002",
      title: "Q2 - CSS",
      course: "RS101",
      quizType: "Graded Quiz",
      points: 32,
      assignmentGroup: "QUIZZES",
      shuffleAnswers: true,
      timeLimit: 45,
      multipleAttempts: false,
      attempts: 1,
      showCorrectAnswers: "Immediately",
      oneQuestionAtATime: true,
      webcamRequired: false,
      lockQuestionsAfterAnswering: false,
      due_date: "2025-10-05T13:00:00",
      available_from_date: "2025-10-05T10:00:00",
      availableUntil: "2025-10-05T13:00:00",
      published: true,
      questions: 7,
      status: "Closed"
    },
    {
      _id: "Q0003",
      title: "Q3 - JS, ES6",
      course: "RS101",
      quizType: "Graded Quiz",
      points: 38,
      assignmentGroup: "QUIZZES",
      shuffleAnswers: true,
      timeLimit: 50,
      multipleAttempts: true,
      attempts: 2,
      showCorrectAnswers: "After Last Attempt",
      oneQuestionAtATime: true,
      webcamRequired: false,
      lockQuestionsAfterAnswering: false,
      due_date: "2025-10-15T13:00:00",
      available_from_date: "2025-10-12T09:00:00",
      availableUntil: "2025-10-15T13:00:00",
      published: true,
      questions: 13,
      status: "Available"
    },
    {
      _id: "Q0004",
      title: "Q4 - NODE",
      course: "RS101",
      quizType: "Graded Quiz",
      points: 25,
      assignmentGroup: "QUIZZES",
      shuffleAnswers: true,
      timeLimit: 30,
      multipleAttempts: false,
      attempts: 1,
      showCorrectAnswers: "After Due Date",
      oneQuestionAtATime: true,
      webcamRequired: false,
      lockQuestionsAfterAnswering: true,
      due_date: "2025-11-20T15:00:00",
      available_from_date: "2025-11-20T09:00:00",
      availableUntil: "2025-11-20T15:00:00",
      published: true,
      questions: 4,
      status: "Closed"
    },
    {
      _id: "Q0005",
      title: "Q5 - MONGO",
      course: "RS101",
      quizType: "Graded Quiz",
      points: 38,
      assignmentGroup: "QUIZZES",
      shuffleAnswers: true,
      timeLimit: 45,
      multipleAttempts: false,
      attempts: 1,
      showCorrectAnswers: "Immediately",
      oneQuestionAtATime: true,
      webcamRequired: true,
      lockQuestionsAfterAnswering: true,
      due_date: "2025-11-30T16:00:00",
      available_from_date: "2025-11-30T11:40:00",
      availableUntil: "2025-11-30T16:00:00",
      published: false,
      questions: 10,
      status: "Not available"
    },
    {
      _id: "Q0006",
      title: "EXAM 1 FA23",
      course: "RS101",
      quizType: "Graded Quiz",
      points: 113,
      assignmentGroup: "EXAMS",
      shuffleAnswers: true,
      timeLimit: 120,
      multipleAttempts: false,
      attempts: 1,
      showCorrectAnswers: "After Due Date",
      oneQuestionAtATime: true,
      webcamRequired: true,
      lockQuestionsAfterAnswering: true,
      due_date: "2025-10-26T17:30:00",
      available_from_date: "2025-10-26T15:00:00",
      availableUntil: "2025-10-26T17:30:00",
      published: true,
      questions: 20,
      status: "Closed"
    },
    {
      _id: "Q0007",
      title: "EXAM 2 FA23",
      course: "RS101",
      quizType: "Graded Quiz",
      points: 104,
      assignmentGroup: "EXAMS",
      shuffleAnswers: true,
      timeLimit: 120,
      multipleAttempts: false,
      attempts: 1,
      showCorrectAnswers: "After Due Date",
      oneQuestionAtATime: true,
      webcamRequired: true,
      lockQuestionsAfterAnswering: true,
      due_date: "2025-12-15T16:00:00",
      available_from_date: "2025-12-15T13:30:00",
      availableUntil: "2025-12-15T16:00:00",
      published: false,
      questions: 18,
      status: "Not available"
    }
  ];
  
  // Mock data for quiz questions
  export const mockQuestions = {
    "Q0001": [ // HTML Quiz questions
      {
        _id: "QQ0001",
        quizId: "Q0001",
        title: "What does HTML stand for?",
        questionType: "MULTIPLE_CHOICE",
        points: 3,
        options: [
          { id: "A", text: "Hyper Text Markup Language", isCorrect: true },
          { id: "B", text: "High Tech Multi Language", isCorrect: false },
          { id: "C", text: "Hyper Transfer Markup Language", isCorrect: false },
          { id: "D", text: "Hyperlink and Text Markup Language", isCorrect: false }
        ]
      },
      {
        _id: "QQ0002",
        quizId: "Q0001",
        title: "Which HTML element is used to define the title of a document?",
        questionType: "MULTIPLE_CHOICE",
        points: 2,
        options: [
          { id: "A", text: "<header>", isCorrect: false },
          { id: "B", text: "<head>", isCorrect: false },
          { id: "C", text: "<title>", isCorrect: true },
          { id: "D", text: "<h1>", isCorrect: false }
        ]
      },
      {
        _id: "QQ0003",
        quizId: "Q0001",
        title: "HTML is a programming language.",
        questionType: "TRUE_FALSE",
        points: 2,
        correctAnswer: "FALSE"
      }
    ],
    "Q0002": [ // CSS Quiz questions
      {
        _id: "QQ0004",
        quizId: "Q0002",
        title: "What does CSS stand for?",
        questionType: "MULTIPLE_CHOICE",
        points: 3,
        options: [
          { id: "A", text: "Computer Style Sheets", isCorrect: false },
          { id: "B", text: "Creative Style System", isCorrect: false },
          { id: "C", text: "Cascading Style Sheets", isCorrect: true },
          { id: "D", text: "Colorful Style Sheets", isCorrect: false }
        ]
      },
      {
        _id: "QQ0005",
        quizId: "Q0002",
        title: "Which property is used to change the background color?",
        questionType: "MULTIPLE_CHOICE",
        points: 2,
        options: [
          { id: "A", text: "bgcolor", isCorrect: false },
          { id: "B", text: "background-color", isCorrect: true },
          { id: "C", text: "color", isCorrect: false },
          { id: "D", text: "background", isCorrect: false }
        ]
      }
    ],
    "Q0003": [ // JS, ES6 Quiz questions
      {
        _id: "QQ0006",
        quizId: "Q0003",
        title: "Which of the following are ES6 features? (Select all that apply)",
        questionType: "MULTIPLE_ANSWER",
        points: 4,
        options: [
          { id: "A", text: "let and const declarations", isCorrect: true },
          { id: "B", text: "Arrow functions", isCorrect: true },
          { id: "C", text: "Class syntax", isCorrect: true },
          { id: "D", text: "document.getElementById()", isCorrect: false }
        ]
      },
      {
        _id: "QQ0007",
        quizId: "Q0003",
        title: "What will be the output of: console.log(typeof []);",
        questionType: "MULTIPLE_CHOICE",
        points: 3,
        options: [
          { id: "A", text: "array", isCorrect: false },
          { id: "B", text: "object", isCorrect: true },
          { id: "C", text: "undefined", isCorrect: false },
          { id: "D", text: "null", isCorrect: false }
        ]
      }
    ]
  };