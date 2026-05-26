import { Users } from 'lucide-react';

export default function MembersPage() {
  return (
    <div className="flex flex-col items-center justify-center h-[80vh] text-center p-6">
      <div className="w-20 h-20 bg-blue-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
        <Users className="w-10 h-10 text-blue-600 dark:text-blue-400" />
      </div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Member Management</h1>
      <p className="text-lg text-gray-500 dark:text-slate-400 max-w-md">
        This feature is launching soon! You will be able to manage all club members and their statuses from here.
      </p>
      <div className="mt-8 px-6 py-2 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full text-sm font-semibold tracking-wide uppercase">
        Coming Soon
      </div>
    </div>
  );
}
