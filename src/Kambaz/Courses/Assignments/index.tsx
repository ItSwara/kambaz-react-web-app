import { FaSearch, FaPlus } from "react-icons/fa";
import { BsThreeDotsVertical, BsFileText } from "react-icons/bs";
import { IoMdArrowDropdown } from "react-icons/io";
import GreenCheckmark from "./GreenCheckmark";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {  useState } from "react";
import { addAssignment, deleteAssignment } from "./reducer";
import AssignmentCreator from "./NewEditor";
import { Modal } from "react-bootstrap";
import AssignmentControlButtons from "./AssignControlButtons";

// Define the RootState type to match your Redux store structure
interface RootState {
  accountReducer: {
    currentUser: {
      role: string;
    };
  };
  assignmentReducer: {
    assignments: Array<{
      _id: string;
      title: string;
      course: string | undefined;
      available?: string;
      available_from_date?: string;
      due?: string;
      due_date?: string;
      points: number | string;
    }>;
  };
}

export default function Assignments() {
    const { cid } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    
    // Get current user and assignments from Redux store with proper typing
    const { currentUser } = useSelector((state: RootState) => state.accountReducer);
    const assignments = useSelector((state: RootState) => 
        state.assignmentReducer.assignments.filter(
            (assignment) => assignment.course === cid
        )
    );
    
    // Modal state for assignment creation
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    
    // Assignment actions
    const addAssignments = (assignment: any) => {
        dispatch(addAssignment(assignment));
        handleClose();
    };

    const deleteAssignments = (assignmentId: string) => {
        dispatch(deleteAssignment(assignmentId));
    };

    const handleAssignmentClick = (assignmentId: string) => {
        navigate(`/Kambaz/Courses/${cid}/Assignments/${assignmentId}`);
    };

    return (
        <div className="container-fluid p-0" style={{ maxWidth: "1000px" }}>
            {/* Search and buttons section */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="position-relative" style={{ width: "400px" }}>
                    <div className="input-group">
                        <input
                            type="text"
                            className="form-control ps-4 rounded-3 py-2"
                            placeholder="Search..."
                            style={{
                                border: "1px solid #ced4da",
                                fontSize: "16px"
                            }}
                        />
                        <div className="position-absolute" style={{ left: "15px", top: "50%", transform: "translateY(-50%)" }}>
                            <FaSearch className="text-secondary" />
                        </div>
                    </div>
                </div>

                <div className="d-flex gap-2">
                    {currentUser?.role === "FACULTY" && (
                        <>
                            <button
                                className="btn rounded-3 px-3 py-2"
                                style={{
                                    backgroundColor: "#e9ecef",
                                    fontSize: "16px",
                                    border: "none",
                                }}
                            >
                                + Group
                            </button>
                            <button
                                onClick={handleShow}
                                className="btn btn-danger rounded-3 px-3 py-2"
                                style={{
                                    fontSize: "16px",
                                }}
                            >
                                + Assignment
                            </button>
                            
                            {/* Assignment Creator Modal */}
                            <Modal show={show} onHide={handleClose}>
                                <Modal.Header closeButton>
                                    <Modal.Title>Assignment Creator</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    <AssignmentCreator 
                                        handleClose={handleClose} 
                                        addAssignment={addAssignments}
                                    />
                                </Modal.Body>
                            </Modal>
                        </>
                    )}
                </div>
            </div>

            {/* Assignments Header */}
            <div
                className="d-flex justify-content-between align-items-center w-100 p-2 mb-0 rounded-top"
                style={{ backgroundColor: "#e9ecef" }}
            >
                <div className="d-flex align-items-center">
                    <BsThreeDotsVertical className="fs-5 me-2" />
                    <IoMdArrowDropdown className="fs-5 me-2" />
                    <span style={{ fontSize: "20px", fontWeight: "500" }}>ASSIGNMENTS</span>
                </div>
                <div className="d-flex align-items-center">
                    <span
                        className="rounded-pill px-3 py-1 me-2"
                        style={{
                            backgroundColor: "white",
                            border: "1px solid #ced4da",
                            fontSize: "14px"
                        }}
                    >
                        40% of Total
                    </span>
                    {currentUser?.role === "FACULTY" && (
                        <>
                            <FaPlus className="fs-6 me-2" />
                            <BsThreeDotsVertical className="fs-5" />
                        </>
                    )}
                </div>
            </div>

            {/* Assignment List */}
            <div className="border rounded-bottom">
                <div className="border-start border-success border-4">
                    <ul className="list-group list-group-flush w-100">
                        {assignments.map((assignment, index) => (
                            <div key={assignment._id}>
                                <li
                                    className="list-group-item border-0 p-3"
                                    style={{ cursor: "pointer" }}
                                >
                                    <div className="d-flex justify-content-between align-items-start">
                                        <div className="d-flex">
                                            <BsThreeDotsVertical className="me-2 fs-6 mt-1" />
                                            <BsFileText className="text-success me-2 fs-5 mt-1" />
                                            <div onClick={() => handleAssignmentClick(assignment._id)}>
                                                <div className="fs-5 fw-bold">{assignment.title}</div>
                                                <div className="mt-1" style={{ fontSize: "14px" }}>
                                                    <span className="text-danger">Multiple Modules</span>
                                                    <span> | </span>
                                                    <span className="fw-bold">Not available until</span>
                                                    <span> {assignment.available || assignment.available_from_date} | </span>
                                                    <br />
                                                    <span className="fw-bold">Due</span>
                                                    <span> {assignment.due || assignment.due_date} | {assignment.points} pts</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="d-flex align-items-start">
                                            {currentUser?.role === "FACULTY" ? (
                                                <AssignmentControlButtons 
                                                    assignmentId={assignment._id} 
                                                    deleteAssignment={deleteAssignments}
                                                />
                                            ) : (
                                                <>
                                                    <GreenCheckmark />
                                                    <BsThreeDotsVertical className="ms-2 fs-6" />
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </li>
                                {index !== assignments.length - 1 && <hr className="my-0 mx-3" />}
                            </div>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}



