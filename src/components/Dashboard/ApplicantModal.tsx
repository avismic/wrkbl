import { X, ChevronRight } from "lucide-react";

export const ApplicantModal = ({ job, applicants, onClose }) => {
  const getStatusClass = (status) => {
    switch (status) {
      case "Interviewing":
        return "bg-blue-100 text-blue-700";
      case "Shortlisted":
        return "bg-purple-100 text-purple-700";
      case "Applied":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl transform transition-all">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Applicants</h2>
            <p className="text-sm text-gray-500">{job.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <ul className="space-y-3">
            {applicants.map((applicant) => (
              <li
                key={applicant.id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={applicant.avatar}
                    alt={applicant.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-gray-800">
                      {applicant.name}
                    </p>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getStatusClass(
                        applicant.status
                      )}`}
                    >
                      {applicant.status}
                    </span>
                  </div>
                </div>
                <button className="flex items-center gap-1 text-sm font-medium text-green-600 hover:text-green-700">
                  View Profile <ChevronRight size={16} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
