import React, { useState, useEffect } from 'react';
import { Play, Square, Clock, Plus, FileText, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export default function TimeTracker({ user, showToast }) {
  const [timesheets, setTimesheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [taskDesc, setTaskDesc] = useState('');
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [startTime, setStartTime] = useState(null);

  const fetchTimesheets = async () => {
    try {
      setLoading(true);
      const empId = user?.role === 'employee' ? user.employee_id : null;
      const res = await api.getTimesheets(empId);
      if (res.status === 'success') {
        setTimesheets(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimesheets();
  }, [user]);

  useEffect(() => {
    let interval = null;
    if (isTimerRunning) {
      interval = setInterval(() => setSeconds(s => s + 1), 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTimer = (totalSeconds) => {
    const hrs = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const mins = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const secs = String(totalSeconds % 60).padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  };

  const handleToggleTimer = async () => {
    if (!isTimerRunning) {
      if (!taskDesc.trim()) {
        showToast('Please enter a task description before starting timer.', 'error');
        return;
      }
      setIsTimerRunning(true);
      setStartTime(new Date());
    } else {
      // Stop timer and submit log
      setIsTimerRunning(false);
      const endTime = new Date();
      const hoursLogged = Math.max(0.1, roundToTwo(seconds / 3600));

      try {
        await api.logTimesheet({
          employee_id: user?.employee_id || 1,
          date: new Date().toISOString().split('T')[0],
          start_time: startTime.toTimeString().split(' ')[0],
          end_time: endTime.toTimeString().split(' ')[0],
          total_hours: hoursLogged,
          task_description: taskDesc
        });
        showToast(`Timesheet logged: ${hoursLogged} hours recorded.`);
        setTaskDesc('');
        setSeconds(0);
        fetchTimesheets();
      } catch (err) {
        showToast(err.message, 'error');
      }
    }
  };

  const roundToTwo = (num) => Math.round(num * 100) / 100;

  return (
    <div className="space-y-6">
      {/* Live Timer Card */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1 space-y-2">
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Time Tracker</h2>
            <input
              type="text"
              disabled={isTimerRunning}
              placeholder="What task are you working on right now?"
              value={taskDesc}
              onChange={(e) => setTaskDesc(e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none disabled:bg-gray-100"
            />
          </div>

          <div className="flex items-center gap-4 bg-slate-900 text-white px-6 py-4 rounded-2xl shrink-0 justify-between">
            <div className="font-mono text-3xl font-bold tracking-wider">{formatTimer(seconds)}</div>
            <button
              onClick={handleToggleTimer}
              className={`px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all cursor-pointer ${
                isTimerRunning
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg'
              }`}
            >
              {isTimerRunning ? (
                <>
                  <Square className="w-4 h-4 fill-white" /> Stop Work
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" /> Start Work
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Timesheets Log Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" /> Timesheet Entries
          </h3>
          <span className="text-xs text-gray-400">{timesheets.length} Logs Recorded</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-400 text-sm">Loading timesheets...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 text-[11px] font-bold text-gray-500 uppercase border-b border-gray-100">
                  <th className="py-3.5 px-6">Date</th>
                  <th className="py-3.5 px-6">Employee</th>
                  <th className="py-3.5 px-6">Start Time</th>
                  <th className="py-3.5 px-6">End Time</th>
                  <th className="py-3.5 px-6">Duration</th>
                  <th className="py-3.5 px-6">Task Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {timesheets.map((ts) => (
                  <tr key={ts.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-4 px-6 font-medium text-gray-900">{ts.date}</td>
                    <td className="py-4 px-6 font-semibold text-gray-900">
                      {ts.first_name} {ts.last_name}
                      <span className="block text-xs font-mono font-normal text-indigo-600">{ts.employee_code}</span>
                    </td>
                    <td className="py-4 px-6 font-mono text-xs text-gray-600">{ts.start_time}</td>
                    <td className="py-4 px-6 font-mono text-xs text-gray-600">{ts.end_time || '--:--'}</td>
                    <td className="py-4 px-6 font-bold text-indigo-600 text-xs">{ts.total_hours} hrs</td>
                    <td className="py-4 px-6 text-gray-700 text-xs max-w-xs truncate">{ts.task_description}</td>
                  </tr>
                ))}
                {timesheets.length === 0 && (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-gray-400 text-sm">
                      No timesheet entries logged yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
