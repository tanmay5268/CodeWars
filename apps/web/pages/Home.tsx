import React from "react";
import { RoomStatus } from "../components/RoomStatus";
import Nav from "../components/HomePage/Nav";

const Home = () => {
  const [whatTodo, setWhatTodo] = React.useState("");
  return (
    <div className=" w-screen h-screen">
      <Nav></Nav>
    </div>
  );
};

export default Home;
