import Create from "./Create";
import Join from "./Join";

interface RoomStatusProps {
    whatTodo: string;
}
export const RoomStatus = (props: RoomStatusProps) => {

  return (
    <div>
        <div>RoomStatus</div>
      {props.whatTodo === "create" && (
        <Create />
      )}
      {props.whatTodo === "join" && (
        <Join />
      )}
    </div>
  )
}
