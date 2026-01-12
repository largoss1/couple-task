"use client";
import { Navbar, Nav, Container } from "react-bootstrap";

export default function AppNavbar() {
  return (
    <Navbar bg="dark" data-bs-theme="dark" expand="lg">
      <Container>
        <Navbar.Brand href="/">Couple Schedule</Navbar.Brand>
        <Nav className="ms-auto">
          <Nav.Link href="/login">Đăng nhập</Nav.Link>
          <Nav.Link href="/register">Đăng ký</Nav.Link>
        </Nav>
      </Container>
    </Navbar>
  );
}
