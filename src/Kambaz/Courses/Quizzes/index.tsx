import { Button, ListGroup, ListGroupItem } from "react-bootstrap";
import { FaPlus } from "react-icons/fa6";
import { useSelector } from "react-redux";
import { useParams } from "react-router";
import QuizControls from "./QuizControl";
import { IoRocketOutline } from "react-icons/io5";
import * as quizClient from "./client.ts";
import { useEffect, useState } from "react";
import QuizComment from "./QuizComment.tsx";
import { Link } from "react-router-dom";

export default function Quizzes() {
  const { currentUser } = useSelector((state: any) => state.accountReducer);
  const { cid } = useParams();
  const [quizList, setQuizzes] = useState([]);

  const fetchQuizzes = async () => {
    const quizzes = await quizClient.getQuizzesForCourse(cid);
    setQuizzes(quizzes);
    return quizzes;
  }

  useEffect(() => {
    fetchQuizzes();
  }, [cid]);

  return (
    <div className="wd-quizzes">
      
      <div id="input-group" className="d-flex justify-content-end">
        <input className="rounded-3 me-2 fs-5" placeholder="🔍 Search for Quiz" id="wd-search-quiz" />
        { currentUser.role === "FACULTY" && (
          <Button className="btn btn-danger btn-lg me-2" id="wd-add-quiz">
            <FaPlus className="position-relative me-2" style={{ bottom: "1px" }} />
            Quiz
          </Button>)
        }
      </div>
      <h3 className="bg-secondary ps-2 mt-2 rounded-1 fw-bold dropdown-toggle w-100">Quizzes
      </h3>
      <div className="wd-quiz-list">
        <ListGroup className="list-group">
          { quizList.map((quiz: any) => (
              <ListGroupItem className="list-group-item">
                  <IoRocketOutline className="text-success me-2 fs-5" />
                  <Link to={`/Kambaz/Courses/${cid}/Quizzes/${quiz._id}/details`} className="wd-quiz-link" >
                    {quiz.title}
                  </Link>
                  
                <QuizControls quiz={quiz} /> 
                <QuizComment quiz={quiz} />
              </ListGroupItem>
            ))
          }
        </ListGroup>
      </div>
    </div>
  );
}