import  { useState } from "react";
import { FormControl } from "react-bootstrap";
const REMOTE_SERVER = import.meta.env.VITE_REMOTE_SERVER;


export default function WorkingWithObjects() {
    const [module, setModule] = useState(
        {
            id: "M2",
            name: "Introduction to React",
            description: "Learn the fundamentals of React, including components, state management, and JSX syntax.",
            course: "Frontend Development"
        });


    const [assignment, setAssignment] = useState({
        id: 1, title: "NodeJS Assignment",
        description: "Create a NodeJS server with ExpressJS",
        due: "2021-10-10", completed: false, score: 0,
      });
      const ASSIGNMENT_API_URL = `${REMOTE_SERVER}/lab5/assignment`

   

  return (
    <div id="wd-working-with-objects">
      <h3>Working With Objects</h3>
      <h4>Retrieving Objects</h4>
      <a id="wd-retrieve-assignments" className="btn btn-primary"
         href={`${REMOTE_SERVER}/lab5/assignment`}>
        Get Assignment
      </a><hr/>

      <h4>Retrieving Properties</h4>
      <a id="wd-retrieve-assignment-title" className="btn btn-primary"
         href={`${REMOTE_SERVER}/lab5/assignment/title`}>
        Get Title
      </a><hr/>

      <h4>Modifying Properties</h4>
      <a id="wd-update-assignment-title"
         className="btn btn-primary float-end"
         href={`${ASSIGNMENT_API_URL}/title/${assignment.title}`}>
        Update Title
      </a>
      <FormControl className="w-75" id="wd-assignment-title"
        defaultValue={assignment.title} onChange={(e) =>
          setAssignment({ ...assignment, title: e.target.value })}/>
      <hr />


      <h4>Get Module</h4>
            <a href={`${REMOTE_SERVER}/lab5/module`} id="wd-get-module"
                className="btn btn-primary">
                Get Module
            </a>

            <hr />

            <h4>Get Module Name</h4>
            <a href={`${REMOTE_SERVER}/lab5/module/name`} id="wd-get-module-name"
                className="btn btn-primary">
                Get Module Name
            </a>

            <hr />

            <h4>Updating fields</h4>

            <input type="number" className="form-control " id="wd-assignment-score" value={assignment.score}
                onChange={
                    (e) =>
                        setAssignment({ ...assignment, score: parseInt(e.target.value) })
                } />

            <br />

            <a className="btn btn-primary " id="wd-update-assignment-score"
                href={`${ASSIGNMENT_API_URL}/score/${assignment.score}`}>
                Update Score
            </a>

            <hr />

            <input type="checkbox" id="wd-completed"
                checked={assignment.completed}
                onChange={
                    (e) => {
                        setAssignment({ ...assignment, completed: e.target.checked })
                    }} />
            &nbsp; Check this box to mark as completed
            
            <br />
            <a className="btn btn-primary" id="wd-update-completed"
                href={`${ASSIGNMENT_API_URL}/completed/${assignment.completed}`}>
                Update Completed
            </a>

            <hr />

            <h4>Modifying Module</h4>
            <a className="btn btn-primary float-end" id="wd-update-module-name"
                href={`${REMOTE_SERVER}/lab5/module/name/${module.name}`}>
                Update Name
            </a>

            <input type="text" className="form-control w-75" id="wd-module-name" value={module.name}
                onChange={
                    (e) => setModule({ ...module, name: e.target.value })
                } />

            <hr />

            <h4>Modifying Module Description</h4>
            <textarea className="form-control w-25" name="module-description" id="wd-module-description"
                value={module.description}
                onChange={(e) =>
                    setModule({ ...module, description: e.target.value })
                }
            />

            <hr />

            <a className="btn btn-primary " id="wd-update-module-description"
                href={`${REMOTE_SERVER}/lab5/module/description/${module.description}`}>
                Update Description
            </a>

            <hr />

    </div>
);}
