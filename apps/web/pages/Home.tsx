import React from "react";
import { RoomStatus } from "../components/RoomStatus";
import Nav from "../components/HomePage/Nav";
import Hero from "../components/HomePage/Hero";

const Home = () => {
  const [whatTodo, setWhatTodo] = React.useState("");
  return (
    <div className=" w-screen h-screen">
      <Nav></Nav>
      <Hero></Hero>
    </div>
  );
};

export default Home;
