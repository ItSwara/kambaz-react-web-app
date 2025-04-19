
import { useEffect, useState } from "react";
import * as quizClient from "./client.ts";

export default function QuizControlButtons({quiz}: {quiz: any; })
{
    const [q, setQ] = useState([{}]);
    const  totalQuestions = async(quiz: any) => {
        setQ( await quizClient.getQuestionsForQuiz(quiz.course, quiz._id));
    }

    useEffect(() => {
        totalQuestions(quiz);
    }
    , [quiz]);

    return (
        <div>
            <span className="wd-assigment-info d-block mt-1 ps-5">
                Multiple Modules | <b>Not available until</b> {quiz.available} | <b>Due</b> {quiz.due} | {quiz.points} pts | {q && q.length} Questions
            </span>
        </div> 
    );
}