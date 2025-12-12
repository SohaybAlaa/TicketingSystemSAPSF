import { useParams, useNavigate } from "react-router-dom";

export default function Tickets() {
  const adminId = "EmadOmar";
  const ticketId = 1;
  const navigate = useNavigate();
  return (
    <>
    <h1 className="text-4xl text-center font-black">Welcome {adminId}</h1>
      <h3 className="text-4xl text-center font-black">
        Ticket ID : {ticketId} 
      </h3>
    </>
  );
}
