
import { FaSearch } from "react-icons/fa";
import { BsFileText, BsThreeDotsVertical } from "react-icons/bs";
import { FaPlus } from "react-icons/fa";
import GreenCheckmark from "./GreenCheckmark";
import { useParams } from "react-router";
import * as db from "../../Database";

export default function Assignments() {
  const { cid } = useParams();
  const assignments = db.assignments.filter((assignment) => assignment.course === cid);

  return (
    <div className="container-fluid p-0" style={{ maxWidth: "1200px" }}>
      {/*  search and buttons section */}
      <div className="d-flex justify-content-between align-items-center mb-5">
    <div className="position-relative ms-1" style={{ width: "250px" }}>   
      <div className="input-group">
     <span className="position-absolute" style={{ 
      left: "4px", 
      top: "50%", 
      transform: "translateY(-50%)", 
      zIndex: "1" 
    }}>
      <FaSearch className="text-secondary" />
    </span>
    <input
      type="text"
      className="form-control ps-4 rounded"
      placeholder="Search..."
      style={{ 
        paddingLeft: "40px",
        backgroundColor: "#ffffff",
        border: "1px solid #ced4da", 
        borderRadius: "4px",        
        height: "40px"               
      }}
    />
  </div>
</div>

      <div className="d-flex gap-3">
        <button className="btn rounded px-4 py-2" 
          style={{ 
            backgroundColor: "#dee2e6",
            fontSize: "18px",
            border: "none"
          }}>
          + Group
        </button>
        <button className="btn btn-danger rounded px-4 py-2" 
          style={{ 
            fontSize: "18px",
            backgroundColor: "#dc3545"
          }}>
          + Assignment
        </button>
      </div>
    </div>

    {/* Assignments Header */}
    <div className="d-flex justify-content-between align-items-center w-100 border p-3 mb-2" 
      style={{ backgroundColor: "#dee2e6" }}>
      <div className="d-flex align-items-center gap-2">
        <BsThreeDotsVertical />
        <span>▼</span>
        <span style={{ fontSize: "24px", marginLeft: "8px" }}>ASSIGNMENTS</span>
      </div>
      <div className="d-flex align-items-center gap-2">
        <span className=" rounded-pill px-4 py-1" 
          style={{ backgroundColor: "#dee2e6" ,
          border:"1px solid black" 
          }}>
          40% of Total
        </span>
        <FaPlus />
        <BsThreeDotsVertical />
      </div>
    </div>

{/* Dynamic ness of Assignment names */}

      <div className="border rounded">
        <div className="border-start border-success border-4">
          <ul className="list-group w-100">
            {assignments.map((assignment) => (
              <div key={assignment._id}>
                <li className="list-group-item border-0 px-4">
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="d-flex align-items-start">
                      <BsThreeDotsVertical className="me-2 mt-1" />
                      <BsFileText className="text-success me-2" style={{ fontSize: '22px' }} />
                      <div>
                        <div className="fs-5 fw-bold">
                          <a href={`#/Kambaz/Courses/${cid}/Assignments/${assignment._id}`}
                            style={{
                              textDecoration: 'none',
                              color: 'inherit'
                            }}>
                            {assignment.title}
                          </a>
                        </div>
                        <div>
                          <span className="text-danger">Multiple Modules</span>
                          <span className="text-secondary"> | </span>
                          <span className="fw-bold">Not available until</span>
                          <span className="text-secondary"> May 6 at 12:00am |</span>
                          <br />
                          <span><span className="fw-bold">Due</span> May 13 at 11:59pm | 100 pts</span>
                        </div>
                      </div>
                    </div>
                    <div className="d-flex align-items-center">
                      <GreenCheckmark />
                      <BsThreeDotsVertical className="ms-2" />
                    </div>
                  </div>
                </li>
                {/* Add horizontal line for all except last item */}
                {assignments.indexOf(assignment) !== assignments.length - 1 && 
                  <hr className="my-2 mx-3" />
                }
              </div>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}






// import {  FaSearch } from "react-icons/fa";
// import {  BsFileText, BsThreeDotsVertical } from "react-icons/bs";
// import {  FaPlus } from "react-icons/fa";
// import GreenCheckmark from "./GreenCheckmark";

// export default function Assignments() {
//   return (
//     <div className="container-fluid p-0" style={{ maxWidth: "1200px" }}>
//     {/* Search and Buttons Section */}
//     <div className="d-flex justify-content-between align-items-center mb-5">
//     <div className="position-relative ms-1" style={{ width: "250px" }}>
//   <div className="input-group">
//     <span className="position-absolute" style={{ 
//       left: "4px", 
//       top: "50%", 
//       transform: "translateY(-50%)", 
//       zIndex: "1" 
//     }}>
//       <FaSearch className="text-secondary" />
//     </span>
//     <input
//       type="text"
//       className="form-control ps-4 rounded"
//       placeholder="Search..."
//       style={{ 
//         paddingLeft: "40px",
//         backgroundColor: "#ffffff",
//         border: "1px solid #ced4da", 
//         borderRadius: "4px",        
//         height: "40px"               
//       }}
//     />
//   </div>
// </div>

//       <div className="d-flex gap-3">
//         <button className="btn rounded px-4 py-2" 
//           style={{ 
//             backgroundColor: "#dee2e6",
//             fontSize: "18px",
//             border: "none"
//           }}>
//           + Group
//         </button>
//         <button className="btn btn-danger rounded px-4 py-2" 
//           style={{ 
//             fontSize: "18px",
//             backgroundColor: "#dc3545"
//           }}>
//           + Assignment
//         </button>
//       </div>
//     </div>

//     {/* Assignments Header */}
//     <div className="d-flex justify-content-between align-items-center w-100 border p-3 mb-2" 
//       style={{ backgroundColor: "#dee2e6" }}>
//       <div className="d-flex align-items-center gap-2">
//         <BsThreeDotsVertical />
//         <span>▼</span>
//         <span style={{ fontSize: "24px", marginLeft: "8px" }}>ASSIGNMENTS</span>
//       </div>
//       <div className="d-flex align-items-center gap-2">
//         <span className=" rounded-pill px-4 py-1" 
//           style={{ backgroundColor: "#dee2e6" ,
//           border:"1px solid black" 
//           }}>
//           40% of Total
//         </span>
//         <FaPlus />
//         <BsThreeDotsVertical />
//       </div>
//     </div>


//           <div className="border rounded">
//             <div className="border-start border-success border-4">
//               <ul className="list-group w-100">
//                   <div>
//                       <li className="list-group-item border-0 px-4">
//                           <div className="d-flex justify-content-between align-items-start">
//                               <div className="d-flex align-items-start">
//                                   <BsThreeDotsVertical className="me-2 mt-1" />
//                                   <BsFileText className="text-success me-2" style={{ fontSize: '22px' }} />
//                                   <div>
//                                       <div className="fs-4 fw-bold">
//                                       <a href="#/Kambaz/Courses/1234/Assignments/123" 
//                            style={{ 
//                                textDecoration: 'none', 
//                                color: 'inherit'
//                            }}>
//                             A1
//                         </a>
//                                         </div>
//                                       <div>
//                                           <span className="text-danger">Multiple Modules</span>
//                                           <span className="text-secondary"> | </span>
//                                           <span className="fw-bold">Not available until</span>
//                                           <span className="text-secondary"> May 6 at 12:00am |</span>
//                                           <br />
//                                           <span><span className="fw-bold">Due</span> May 13 at 11:59pm | 100 pts</span>
//                                       </div>
//                                   </div>
//                               </div>
//                               <div className="d-flex align-items-center">
//                                   <GreenCheckmark />
//                                   <BsThreeDotsVertical className="ms-2" />
//                               </div>
//                           </div>
//                       </li>
//                       <hr className="my-2 mx-3" />
//                   </div>

//                   <div>
//                       <li className="list-group-item border-0 px-4">
//                           <div className="d-flex justify-content-between align-items-start">
//                               <div className="d-flex align-items-start">
//                                   <BsThreeDotsVertical className="me-2 mt-1" />
//                                   <BsFileText className="text-success me-2" style={{ fontSize: '22px' }} />
//                                   <div>
//                                       <div className="fs-4 fw-bold">
//                                       <a href="#/Kambaz/Courses/1234/Assignments/234" 
//                            style={{ 
//                                textDecoration: 'none', 
//                                color: 'inherit'
//                            }}>
//                             A2
//                         </a>
//                                         </div>
//                                       <div>
//                                           <span className="text-danger">Multiple Modules</span>
//                                           <span className="text-secondary"> | </span>
//                                           <span className="fw-bold">Not available until</span>
//                                           <span className="text-secondary"> May 13 at 12:00am |</span>
//                                           <br />
//                                           <span><span className="fw-bold">Due</span> May 20 at 11:59pm | 100 pts</span>
//                                       </div>
//                                   </div>
//                               </div>
//                               <div className="d-flex align-items-center">
//                                   <GreenCheckmark />
//                                   <BsThreeDotsVertical className="ms-2" />
//                               </div>
//                           </div>
//                       </li>
//                       <hr className="my-2 mx-3" />
//                   </div>

//                   <div>
//                       <li className="list-group-item border-0 px-4">
//                           <div className="d-flex justify-content-between align-items-start">
//                               <div className="d-flex align-items-start">
//                                   <BsThreeDotsVertical className="me-2 mt-1" />
//                                   <BsFileText className="text-success me-2" style={{ fontSize: '22px' }} />
//                                   <div>
//                                       <div className="fs-4 fw-bold">
//                                       <a href="#/Kambaz/Courses/1234/Assignments/123" 
//                            style={{ 
//                                textDecoration: 'none', 
//                                color: 'inherit'
//                            }}>
//                             A3
//                         </a>
                                        
//                                       </div>
//                                       <div>
//                                           <span className="text-danger">Multiple Modules</span>
//                                           <span className="text-secondary"> | </span>
//                                           <span className="fw-bold">Not available until</span>
//                                           <span className="text-secondary"> May 20 at 12:00am |</span>
//                                           <br />
//                                           <span><span className="fw-bold">Due</span> May 27 at 11:59pm | 100 pts</span>
//                                       </div>
//                                   </div>
//                               </div>
//                               <div className="d-flex align-items-center">
//                                   <GreenCheckmark />
//                                   <BsThreeDotsVertical className="ms-2" />
//                               </div>
//                           </div>
//                       </li>
//                   </div>
//               </ul>
//             </div>
//           </div>
//       </div>
//   );
// }








