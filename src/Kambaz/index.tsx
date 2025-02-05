import { Routes, Route, Navigate } from "react-router";
import Account from "./Account";
import Dashboard from "./Dashboard";
import Courses from "./Courses";
import "./style.css"
import KambazNavigation from "./Navigation";


export default function Kambaz() {
    return (
      <div id="wd-kambaz" >
        
            <KambazNavigation />
       
            <div className="wd-main-content-offset p-3">

            <Routes>
              <Route path="/" element={<Navigate to="/Kambaz/Account" />} />
              <Route path="/Account/*" element={<Account />} />
              <Route path="/Dashboard" element={<Dashboard />} />
              <Route path="/Courses/:cid/*" element={<Courses />} />
              <Route path="/Calendar" element={<h1>Calendar</h1>} />
              <Route path="/Inbox" element={<h1>Inbox</h1>} />

            </Routes>
            </div>
      </div>
  );}



  