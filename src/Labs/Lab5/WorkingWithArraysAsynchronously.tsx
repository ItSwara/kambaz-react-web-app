import  { useState, useEffect } from "react";
import * as client from "./client";
import { FormControl, ListGroup } from "react-bootstrap";
import { FaTrash } from "react-icons/fa";
import { FaPlusCircle } from "react-icons/fa";
import { TiDelete } from "react-icons/ti";
import { FaPencil } from "react-icons/fa6";
export default function WorkingWithArraysAsynchronously() {
  const [errorMessage, setErrorMessage] = useState(null);
  const [todos, setTodos] = useState<any[]>([]);
  const fetchTodos = async () => {
    const todos = await client.fetchTodos();
    setTodos(todos);
  };
  useEffect(() => {
    fetchTodos();
  }, []);

  const removeTodo = async (todo: any) => {
    const updatedTodos = await client.removeTodo(todo);
    setTodos(updatedTodos);
  };

  const createTodo = async () => {
    const todos = await client.createTodo();
    setTodos(todos);
  };

  const postTodo = async () => {
    const newTodo = await client.postTodo({
      title: "New Posted Todo",
      completed: false,
    });
    setTodos([...todos, newTodo]);
  };

  const deleteTodo = async (todo: any) => {
    try {
      await client.deleteTodo(todo);
      const newTodos = todos.filter((t) => t.id !== todo.id);
      setTodos(newTodos);
    } catch (error: any) {
      console.log(error);
      setErrorMessage(error.response.data.message);
    }
  };

  const editTodo = (todo: any) => {
    const updatedTodos = todos.map((t) =>
      t.id === todo.id ? { ...todo, editing: true } : t
    );
    setTodos(updatedTodos);
  };

  const updateTodo = async (todo: any) => {
    try {
      await client.updateTodo(todo);
      setTodos(todos.map((t) => (t.id === todo.id ? todo : t)));
    } catch (error: any) {
      setErrorMessage(error.response.data.message);
    }
  };

  return (
    <div id="wd-asynchronous-arrays">
      <h3>Working with Arrays Asynchronously</h3>
      {errorMessage && (
        <div
          id="wd-todo-error-message"
          className="alert alert-danger mb-2 mt-2"
        >
          {errorMessage}
        </div>
      )}
      <h4>
        Todos
        <FaPlusCircle
          onClick={createTodo}
          className="text-success float-end fs-3"
          id="wd-create-todo"
        />
        <FaPlusCircle
          onClick={postTodo}
          className="text-primary float-end fs-3 me-3"
          id="wd-post-todo"
        />
      </h4>
      <ListGroup>
        {todos.map((todo) => (
          <ListGroup.Item key={todo.id}>
            <FaPencil
              onClick={() => editTodo(todo)}
              className="text-primary float-end me-3 mt-1"
            />
            <FaTrash
              onClick={() => removeTodo(todo)}
              className="text-danger float-end me-3 mt-1"
              id="wd-remove-todo"
            />
            <TiDelete
              onClick={() => deleteTodo(todo)}
              className="text-danger float-end me-2 fs-3"
              id="wd-delete-todo"
            />
            <input
              type="checkbox"
              className="form-check-input me-2"
              defaultChecked={todo.completed}
            />
            onChange=
            {(e: { target: { checked: any } }) =>
              updateTodo({ ...todo, completed: e.target.checked })
            }
            {!todo.editing ? (
              todo.title
            ) : (
              <FormControl
                className="w-50 float-start"
                defaultValue={todo.title}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    updateTodo({ ...todo, editing: false });
                  }
                }}
                onChange={(e) => updateTodo({ ...todo, title: e.target.value })}
              />
            )}
            <span
              style={{
                textDecoration: todo.completed ? "line-through" : "none",
              }}
            >
              {todo.title}
            </span>
          </ListGroup.Item>
        ))}
      </ListGroup>{" "}
      <hr />
    </div>
  );
}
