'use client'
import { RoomStatus } from "../components/RoomStatus"

const page = () => {
    return (
        <div className="flex flex-col h-screen gap-4 w-screen items-center justify-center">
            <div className="flex gap-3">
                <button className="px-3 py-2 bg-blue-500 text-white rounded">Join Room</button>
                <button className="px-3 py-2 bg-blue-500 text-white rounded">Create Room</button>
            </div>
            <RoomStatus></RoomStatus>
        </div>
    )
}

export default page
