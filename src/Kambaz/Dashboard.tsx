import { Link } from "react-router-dom";
import reactImage from '../../src/public/images/reactjs.jpg';
import nodeImage from '../../src/public/images/nodejs.png';
import typescriptImage from '../../src/public/images/typescript.png';
import pythonImage from  '../../src/public/images/python.jpeg';
import awsImage from '../../src/public/images/aws.png';
import dockerImage from  '../../src/public/images/docker.png';
import sqlImage from '../../src/public/images/sql.png';




export default function Dashboard() {
  return (
    <div id="wd-dashboard" style={{ textAlign: "left" }}>
      <h1 id="wd-dashboard-title">Dashboard</h1> <hr />
      <h2 id="wd-dashboard-published">Published Courses (12)</h2> <hr />
      <div id="wd-dashboard-courses">
        {/* Course 1 */}
        <div className="wd-dashboard-course">
          <Link to="/Kambaz/Courses/1234/Home"
                className="wd-dashboard-course-link" >
            <img src= {reactImage} width={100} />
            <div>
              <h5> CS1234 React JS </h5>
              <p className="wd-dashboard-course-title">
                Full Stack software developer  </p>
              <button> Go </button>
            </div>
          </Link>
        </div>

        {/* Course 2 */}
        <div className="wd-dashboard-course">
          <Link to="/Kambaz/Courses/5678/Home" className="wd-dashboard-course-link">
            <img src={nodeImage} width={200} alt="Node.js" />
            <div>
              <h5>CS5678 Node.js</h5>
              <p className="wd-dashboard-course-title">
                Backend Development with Node.js
              </p>
              <button>Go</button>
            </div>
          </Link>
        </div>


        {/* Course 3 */}
        <div className="wd-dashboard-course">
          <Link to="/Kambaz/Courses/9101/Home" className="wd-dashboard-course-link">
            <img src={typescriptImage} width={200} alt="TypeScript" />
            <div>
              <h5>CS9101 TypeScript</h5>
              <p className="wd-dashboard-course-title">
                Strongly Typed JavaScript
              </p>
              <button>Go</button>
            </div>
          </Link>
        </div>

{/* Course 4 */}
        <div className="wd-dashboard-course">
          <Link to="/Kambaz/Courses/1122/Home" className="wd-dashboard-course-link">
            <img src={pythonImage} width={200} alt="Python" />
            <div>
              <h5>CS1122 Python</h5>
              <p className="wd-dashboard-course-title">
                Data Analysis and Machine Learning
              </p>
              <button>Go</button>
            </div>
          </Link>
        </div>


        {/* Course 5 */}
        <div className="wd-dashboard-course">
          <Link to="/Kambaz/Courses/3344/Home" className="wd-dashboard-course-link">
            <img src={awsImage} width={200} alt="AWS" />
            <div>
              <h5>CS3344 AWS Cloud</h5>
              <p className="wd-dashboard-course-title">
                Cloud Computing Fundamentals
              </p>
              <button>Go</button>
            </div>
          </Link>
        </div>

        {/* Course 6 */}
        <div className="wd-dashboard-course">
          <Link to="/Kambaz/Courses/5566/Home" className="wd-dashboard-course-link">
            <img src={dockerImage} width={200} alt="Docker" />
            <div>
              <h5>CS5566 Docker</h5>
              <p className="wd-dashboard-course-title">
                Containerization for Developers
              </p>
              <button>Go</button>
            </div>
          </Link>
        </div>

        {/* Course 7 */}
        <div className="wd-dashboard-course">
          <Link to="/Kambaz/Courses/7788/Home" className="wd-dashboard-course-link">
            <img src={sqlImage} width={200} alt="SQL" />
            <div>
              <h5>CS7788 SQL</h5>
              <p className="wd-dashboard-course-title">
                Advanced Database Management
              </p>
              <button>Go</button>
            </div>
          </Link>
        </div>





      </div>
    </div>
);}
