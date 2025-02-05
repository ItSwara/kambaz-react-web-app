import { IoIosSearch } from "react-icons/io";


export default function AssignmentControls() {
    return (
        <div id="assignment-controls" className="text-nowrap mb-3 d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
                <IoIosSearch size={24} />
                <input id="wd-search-assignment" className="form-control me-2" placeholder="Search..." />
            </div>
            <div>
                <button id="wd-add-assignment" className="btn btn-lg btn-danger me-1 float-end">
                    + Assignment
                </button>
                <button id="wd-add-assignment-group" className="btn btn-lg btn-secondary me-1 float-end">
                    + Group
                </button>
            </div>
        </div>
    );
}