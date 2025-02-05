import { Link } from "react-router-dom";
import { Row, Col, Card, Button } from "react-bootstrap";
import reactImage from '/images/reactjs.jpg';
import nodeImage from '/images/nodejs.png';
import typescriptImage from '/images/typescript.png';
import pythonImage from '/images/python.jpeg';
import awsImage from '/images/aws.png';
import dockerImage from '/images/docker.png';
import sqlImage from '/images/sql.png';

export default function Dashboard() {
    return (
        <div id="wd-dashboard">
            <h1 id="wd-dashboard-title">Dashboard</h1> <hr />
            <h2 id="wd-dashboard-published">Published Courses (7)</h2> <hr />
            <div id="wd-dashboard-courses">
                <Row xs={1} md={5} className="g-4">
                    <Col className="wd-dashboard-course" style={{ width: "300px" }}>
                        <Card className="rounded-3 overflow-hidden">
                            <Link className="text-decoration-none text-dark"
                                to="/Kambaz/Courses/1234/Home">
                                <Card.Img variant="top" src={reactImage} height={160} />
                                <Card.Body>
                                    <Card.Title>CS1234 React JS</Card.Title>
                                    <Card.Text>
                                        CS1234.MERGED.202530
                                        202530_2 Spring 2025 Full Term
                                    </Card.Text>
                                    <Button variant="primary">Go</Button>
                                </Card.Body>
                            </Link>
                        </Card>
                    </Col>

                    <Col className="wd-dashboard-course" style={{ width: "300px" }}>
                        <Card className="rounded-3 overflow-hidden">
                            <Link className="text-decoration-none text-dark"
                                to="/Kambaz/Courses/5678/Home">
                                <Card.Img variant="top" src={nodeImage} height={160} />
                                <Card.Body>
                                    <Card.Title>CS5678 Node.js</Card.Title>
                                    <Card.Text>
                                        CS5678.MERGED.202530
                                        202530_2 Spring 2025 Full Term
                                    </Card.Text>
                                    <Button variant="primary">Go</Button>
                                </Card.Body>
                            </Link>
                        </Card>
                    </Col>

                    <Col className="wd-dashboard-course" style={{ width: "300px" }}>
                        <Card className="rounded-3 overflow-hidden">
                            <Link className="text-decoration-none text-dark"
                                to="/Kambaz/Courses/9101/Home">
                                <Card.Img variant="top" src={typescriptImage} height={160} />
                                <Card.Body>
                                    <Card.Title>CS9101 TypeScript</Card.Title>
                                    <Card.Text>
                                        CS9101.MERGED.202530
                                        202530_2 Spring 2025 Full Term
                                    </Card.Text>
                                    <Button variant="primary">Go</Button>
                                </Card.Body>
                            </Link>
                        </Card>
                    </Col>

                    <Col className="wd-dashboard-course" style={{ width: "300px" }}>
                        <Card className="rounded-3 overflow-hidden">
                            <Link className="text-decoration-none text-dark"
                                to="/Kambaz/Courses/1122/Home">
                                <Card.Img variant="top" src={pythonImage} height={160} />
                                <Card.Body>
                                    <Card.Title>CS1122 Python</Card.Title>
                                    <Card.Text>
                                        CS1122.MERGED.202530
                                        202530_2 Spring 2025 Full Term
                                    </Card.Text>
                                    <Button variant="primary">Go</Button>
                                </Card.Body>
                            </Link>
                        </Card>
                    </Col>

                    <Col className="wd-dashboard-course" style={{ width: "300px" }}>
                        <Card className="rounded-3 overflow-hidden">
                            <Link className="text-decoration-none text-dark"
                                to="/Kambaz/Courses/3344/Home">
                                <Card.Img variant="top" src={awsImage} height={160} />
                                <Card.Body>
                                    <Card.Title>CS3344 AWS Cloud</Card.Title>
                                    <Card.Text>
                                        CS3344.MERGED.202530
                                        202530_2 Spring 2025 Full Term
                                    </Card.Text>
                                    <Button variant="primary">Go</Button>
                                </Card.Body>
                            </Link>
                        </Card>
                    </Col>

                    <Col className="wd-dashboard-course" style={{ width: "300px" }}>
                        <Card className="rounded-3 overflow-hidden">
                            <Link className="text-decoration-none text-dark"
                                to="/Kambaz/Courses/5566/Home">
                                <Card.Img variant="top" src={dockerImage} height={160} />
                                <Card.Body>
                                    <Card.Title>CS5566 Docker</Card.Title>
                                    <Card.Text>
                                        CS5566.MERGED.202530
                                        202530_2 Spring 2025 Full Term
                                    </Card.Text>
                                    <Button variant="primary">Go</Button>
                                </Card.Body>
                            </Link>
                        </Card>
                    </Col>

                    <Col className="wd-dashboard-course" style={{ width: "300px" }}>
                        <Card className="rounded-3 overflow-hidden">
                            <Link className="text-decoration-none text-dark"
                                to="/Kambaz/Courses/7788/Home">
                                <Card.Img variant="top" src={sqlImage} height={160} />
                                <Card.Body>
                                    <Card.Title>CS7788 SQL</Card.Title>
                                    <Card.Text>
                                        CS7788.MERGED.202530
                                        202530_2 Spring 2025 Full Term
                                    </Card.Text>
                                    <Button variant="primary">Go</Button>
                                </Card.Body>
                            </Link>
                        </Card>
                    </Col>
                </Row>
            </div>
        </div>
    );
}
