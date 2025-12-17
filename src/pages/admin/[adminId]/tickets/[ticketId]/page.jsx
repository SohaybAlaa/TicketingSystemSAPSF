import { useParams, useNavigate } from "react-router-dom";

export default function Tickets() {
  const { adminid, ticketid } = useParams();
  const navigate = useNavigate();

  return (
    <>
      <h1 className="text-4xl text-center font-black">Welcome {adminid}</h1>

      <h3 className="text-4xl text-center font-black">
        Ticket ID : {ticketid}
      </h3>
    </>
  );
}
