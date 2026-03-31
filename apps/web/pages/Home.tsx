import React from 'react'
import { RoomStatus } from '../components/RoomStatus'

const Home = () => {
    const [whatTodo, setWhatTodo] = React.useState("")
  return (
    <div className="flex flex-col h-screen gap-4 w-screen items-center justify-center">
            <div className="flex gap-3">
                <button className="px-3 py-2 bg-blue-500 text-white rounded" onClick={() => setWhatTodo("join")}>
                    Join Room
                </button>
                <button className="px-3 py-2 bg-blue-500 text-white rounded" onClick={() => setWhatTodo("create")}>
                    Create Room
                </button>
            </div>
            <RoomStatus whatTodo={whatTodo} />
        </div>
  )
}

export default Home
