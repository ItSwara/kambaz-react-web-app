import { IoEllipsisVertical } from "react-icons/io5";
import GreenCheckmark from "./GreenCheckmark";
import { BsPlus } from "react-icons/bs";

export default function ModuleControlButtons() {
    return (
        <div className="ms-auto align-items-center gap-2">
            <GreenCheckmark />
            <BsPlus className="fs-4" />
            <IoEllipsisVertical className="fs-4" />
        </div>
    );
}