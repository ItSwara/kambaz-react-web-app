import { useEffect, useState } from "react";
import { CiEdit } from "react-icons/ci";
import { useParams } from "react-router";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { Button } from "react-bootstrap";
import * as quizClient from "./client.ts";

export default function QuizDetails()
{
  const { cid, qid } = useParams();
  const { currentUser } = useSelector((state: any) => state.accountReducer);
  const [quiz, setQuiz] = useState({
    _id: 0,
    title: "sdfsdds",
    type: "",
    description: "",
    course: 0,
    questions: [],
    published: false,
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
    const quiz = await quizClient.findQuizById(cid, qid);
    setQuiz(quiz);
  }

  useEffect(() => {
    getQuiz();
  }, []);

  return (
    <div className="wd-quiz-details">
      <h2 className="text-danger">
        Quiz Details
      </h2>
      {currentUser.role === "STUDENT" && (
        <div className="wd-quiz-details-actions d-flex justify-content-center">
          <Link to={`/Kambaz/Courses/${cid}/Quizzes/${qid}/attempt`}>
            <Button variant="primary" className="wd-btn-primary">
              Attempt Quiz
            </Button>
          </Link>
        </div>
      )}
      {
        currentUser.role === "FACULTY" && (
          <div className="wd-quiz-details-actions d-flex justify-content-center flex-row"> 
            <div className="wd-quiz-details-preview me-2">
              <Link to={`/Kambaz/Courses/${cid}/Quizzes/${qid}/preview`}>
                <Button variant="secondary" className="wd-btn-primary">
                  Preview Quiz
                </Button>
              </Link>
            </div>
            <div className="wd-quiz-details-edit">
              <Link to={`/Kambaz/Courses/${cid}/Quizzes/${qid}/edit`}>
                <Button variant="secondary" className="wd-btn-primary">
                  Edit Quiz
                  <CiEdit className="ms-2" />
                </Button>
              </Link>
            </div>
          </div>
        )
      }
      <hr />
      <div>
        <h1 className="mb-5">{quiz.title}</h1>
        <div id="wd-details" className="ms-5 mt-3 mb-5 w-50">
          <div className="row">
            <div className="col-5">
              <b>Quiz Type</b>
            </div>
            <div className="col-7">
              { (quiz.type === "GRADEDQUIZ" && "Graded Quiz")
                || (quiz.type === "PRACTICEQUIZ" && "Practice Quiz") 
                || (quiz.type === "GRADEDSURVEY" && "Graded Survey") 
                || (quiz.type === "UNGRADEDSURVEY" && "Ungraded Survey")
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}






// import { useEffect, useState } from "react";
// import { CiEdit } from "react-icons/ci";
// import { useParams } from "react-router";
// import { Link } from "react-router-dom";
// import { useSelector } from "react-redux";
// import { Button } from "react-bootstrap";
// import * as quizClient from "./client.ts";

// export default function QuizDetails()
// {
//   const { cid, qid } = useParams();
//   const { currentUser } = useSelector((state: any) => state.accountReducer);
//   const [quiz, setQuiz] = useState({
//     _id: 0,
//     title: "sdfsdds",
//     type: "",
//     description: "",
//     course: 0,
//     questions: [],
//     published: false,
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
//     const quiz = await quizClient.findQuizById(cid, qid);
//     setQuiz(quiz);
//   }

//     useEffect(() => {
//         getQuiz();
//     }, []);

//   return (
//         <div className="wd-quiz-details">
//             <h2 className="text-danger">
//                 Quiz Details
//             </h2>
//             {currentUser.role === "STUDENT" && (
//                 <div className="wd-quiz-details-actions d-flex justify-content-center">
//                     <Link to={`/courses/${cid}/quizzes/${qid}/attempt`}>
//                         <Button variant="primary" className="wd-btn-primary">
//                             Attempt Quiz
//                         </Button>
//                     </Link>
//                 </div>
//             )}
//             {
//                 currentUser.role === "FACULTY" && (
//                     <div className="wd-quiz-details-actions d-flex justify-content-center flex-row"> 
//                         <div className="wd-quiz-details-preview me-2">
//                             <Link to={`/Courses/${cid}/quizzes/${qid}/preview`}>
//                                 <Button variant="secondary" className="wd-btn-primary">
//                                     Preview Quiz
//                                 </Button>
//                             </Link>
//                         </div>
//                         <div className="wd-quiz-details-edit">
//                             <Link to={`/Courses/${cid}/quizzes/${qid}/edit`}>
//                                 <Button variant="secondary" className="wd-btn-primary">
//                                     Edit Quiz
//                                     <CiEdit className="ms-2" />
//                                 </Button>
//                             </Link>
                            
//                         </div>
//                     </div>
//                 )
//             }
//             <hr />
//             <div>
//                 <h1 className="mb-5">{quiz.title}</h1>
//                 <div id="wd-details" className="ms-5 mt-3 mb-5 w-50">
//                 <div className="row">
//                         <div className="col-5">
//                             <b>Quiz Type</b>
//                         </div>
//                         <div className="col-7">
//                             <p>
//                                 {JSON.stringify(quiz)}
//                             </p>
//                             { (quiz.type === "GRADEDQUIZ" && "Graded Quiz")
//                                   || (quiz.type === "PRACTICEQUIZ" && "Practice Quiz") 
//                                   || (quiz.type === "GRADEDSURVEY" && "Graded Survey") 
//                                   || (quiz.type === "UNGRADEDSURVEY" && "Ungraded Survey")
//                             }
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }