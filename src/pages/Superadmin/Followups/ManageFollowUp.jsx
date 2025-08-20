import { useNavigate } from "react-router-dom";
import { Activity, ArrowLeft, Users } from "lucide-react";

export default function ManageFollowUp() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard/Superadmin/Dashboard')}
            className="flex items-center text-slate-600 hover:text-slate-800 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </button>
          <h1 className="text-xl font-bold text-slate-800 mb-2">
            Follow-up Management
          </h1>
          <p className="text-slate-600">
            Manage and monitor patient follow-up assessments
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100">
          <div className="p-6 border-b border-blue-100">
            <h2 className="text-lg font-semibold text-slate-800 flex items-center">
              <Activity className="h-5 w-5 mr-2 text-blue-500" />
              Follow-up Management
            </h2>
            <p className="text-slate-600 mt-1">
              Access follow-up management features
            </p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button
                onClick={() => navigate('/dashboard/Superadmin/Followups/ViewFollowUpPatients')}
                className="p-6 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors text-left"
              >
                <Users className="h-8 w-8 text-blue-500 mb-3" />
                <h3 className="text-sm font-semibold text-slate-800 mb-2">View Follow-up Patients</h3>
                <p className="text-slate-600">Browse all patients with follow-up records across centers</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}









