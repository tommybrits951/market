import { useState } from "react";
import "./App.css";
import { Routes, Route } from "react-router";
import Register from "./pages/Register";
import Public from "./layouts/Public";
import Private from "./layouts/Private";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";

function App() {
  return (
    <Routes>
      <Route element={<Private />} path="/">
        <Route element={<Dashboard />} path="/" />
      </Route>
      <Route element={<Public />} path="/public">
        <Route element={<Login />} path="/public/login" />
        <Route element={<Register />} path="/public/register" />
      </Route>
    </Routes>
  );
}

export default App;
