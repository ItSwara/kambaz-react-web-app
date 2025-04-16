
import { Link, useLocation } from "react-router";
import Nav from "react-bootstrap/Nav";
  export default function TOC() {
    const { pathname } = useLocation();
    return (
      <Nav variant="pills" id="wd-toc">
      <Nav.Item> <Nav.Link as={Link} to="/Labs/Lab1" id="wd-a1"
          active={pathname.includes("Lab1")}> Lab 1 </Nav.Link> </Nav.Item>
      <Nav.Item> <Nav.Link as={Link} to="/Labs/Lab2" id="wd-a2"
          active={pathname.includes("Lab2")}> Lab 2 </Nav.Link> </Nav.Item>
      <Nav.Item> <Nav.Link as={Link} to="/Labs/Lab3" id="wd-a3"
          active={pathname.includes("Lab3")}> Lab 3 </Nav.Link> </Nav.Item>
        <Nav.Item> <Nav.Link as={Link} to="/Labs/Lab4" id="wd-a4"
          active={pathname.includes("Lab4")}> Lab 4 </Nav.Link> </Nav.Item>
      <Nav.Item> <Nav.Link as={Link} to="/Labs/Lab5" id="wd-a5"
          active={pathname.includes("Lab5")}> Lab 5 </Nav.Link> </Nav.Item>
        
      <Nav.Item> <Nav.Link as={Link} to="/Kambaz" id="wd-k"> Kambaz </Nav.Link> </Nav.Item>
      <Nav.Item> <Nav.Link href="https://github.com/ItSwara/kambaz-react-web-app.git" target="_blank"> My Client GitHub </Nav.Link> </Nav.Item>
      <Nav.Item> <Nav.Link href="https://github.com/ItSwara/kambaz-node-server-app.git" target="_blank"> My Server GitHub </Nav.Link> </Nav.Item>
    </Nav>
  );
}

   
  
