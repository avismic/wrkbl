import { MoreHorizontal } from 'lucide-react';

export const JobsTable = ({ jobs, onViewApplicants }) => {
  const getStatusClass = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-700';
      case 'Paused': return 'bg-yellow-100 text-yellow-700';
      case 'Closed': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Active Jobs</h2>
            <button className="bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 transition-colors">+ New Job</button>
        </div>
        <table className="w-full text-left">
            <thead>
                <tr className="border-b border-gray-200 text-sm text-gray-500">
                    <th className="py-3 px-4">JOB TITLE</th>
                    <th className="py-3 px-4">APPLIED</th>
                    <th className="py-3 px-4">SHORTLISTED</th>
                    <th className="py-3 px-4">INTERVIEWING</th>
                    <th className="py-3 px-4">STATUS</th>
                    <th className="py-3 px-4"></th>
                </tr>
            </thead>
            <tbody>
                {jobs.map(job => (
                    <tr key={job.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-semibold text-gray-800">{job.title}</td>
                        <td className="py-3 px-4">{job.applied}</td>
                        <td className="py-3 px-4">{job.shortlisted}</td>
                        <td className="py-3 px-4">{job.interviewing}</td>
                        <td className="py-3 px-4">
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getStatusClass(job.status)}`}>
                                {job.status}
                            </span>
                        </td>
                        <td className="py-3 px-4">
                            <button onClick={() => onViewApplicants(job)} className="text-green-600 font-semibold hover:underline">View</button>
                            <button className="text-gray-400 hover:text-gray-600 ml-2 p-1"><MoreHorizontal size={20} /></button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
  );
};