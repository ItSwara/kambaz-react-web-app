import { useDispatch } from "react-redux";
import { deleteTodo, setTodo } from "./todosReducer";
export default function TodoItem({ todo }: {
    todo: { id: string; title: string };

}) {
    const dispatch = useDispatch();
    return (
        <li key={todo.id} className="list-group-item d-flex" style={{ width: "500px" }}>
            <span className="me-2" style={{ width: "300px" }}>
                {todo.title}
            </span>
            <button className="btn btn-primary me-4" onClick={() => dispatch(setTodo(todo))}
                id="wd-set-todo-click"> Edit </button>
            <button className="btn btn-danger me-2" onClick={() => dispatch(deleteTodo(todo.id))}
                id="wd-delete-todo-click"> Delete </button>
        </li>
    );

}