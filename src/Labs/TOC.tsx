import { Link } from "react-router";

export default function TOC() {
    return (
    <div>

      <ul>
        <li><Link to="/Labs">Labs</Link></li>
        <li><Link to="/Labs/Lab1">Lab 1</Link></li>
        <li><Link to="/Labs/Lab2">Lab 2</Link></li>
        <li><Link to="/Labs/Lab3">Lab 3</Link></li>
        <li><Link to="/Kambaz">Kambaz</Link></li>
      </ul>

      <a id = "wd-github" href="https://github.com/ItSwara/kambaz-react-web-app.git" target="_blank" rel="noreferrer">Github</a>

      </div>

    );
  }
  
  