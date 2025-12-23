import { useParams, useNavigate } from "react-router-dom";

export default function Tickets() {
  const { adminid, ticketid } = useParams();
  const navigate = useNavigate();

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome {adminid}
              </h1>
              <p className="text-gray-600">Ticket ID : {ticketid}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
