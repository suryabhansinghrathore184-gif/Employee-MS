import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, Plus, FolderPlus, Clock, AlertCircle, X, User, 
  Search, Filter, CheckCircle2, ListTodo, Layers, ArrowUpRight 
} from 'lucide-react';
import { api } from '../services/api';

export default function ProjectTaskManager({ user, showToast }) {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  // Form states
  const [projectData, setProjectData] = useState({ name: '', code: '', description: '' });
  const [taskData, setTaskData] = useState({ project_id: '', title: '', description: '', assigned_to: '', priority: 'Medium', due_date: '' });

  // Filters state
  const [selectedProjectId, setSelectedProjectId] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [projRes, taskRes, empRes] = await Promise.all([
        api.getProjects(),
        api.getTasks(),
        api.getEmployees(),
      ]);
      if (projRes.status === 'success') setProjects(projRes.data);
      if (taskRes.status === 'success') setTasks(taskRes.data);
      if (empRes.status === 'success') setEmployees(empRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!projectData.name || !projectData.code) {
      showToast('Project name and code are required.', 'error');
      return;
    }
    try {
      await api.createProject({ ...projectData, manager_id: user?.employee_id || 1 });
      showToast(`Project '${projectData.name}' created successfully!`);
      setIsProjectModalOpen(false);
      setProjectData({ name: '', code: '', description: '' });
      fetchData();
    } catch (err) {
      showToast(err.message || 'Failed to create project', 'error');
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskData.title || !taskData.project_id) {
      showToast('Task title and project are required.', 'error');
      return;
    }
    try {
      await api.createTask({ ...taskData, created_by: user?.employee_id || 1 });
      showToast(`Task '${taskData.title}' assigned successfully!`);
      setIsTaskModalOpen(false);
      setTaskData({ project_id: '', title: '', description: '', assigned_to: '', priority: 'Medium', due_date: '' });
      fetchData();
    } catch (err) {
      showToast(err.message || 'Failed to assign task', 'error');
    }
  };

  const handleTaskStatusChange = async (taskId, newStatus) => {
    try {
      await api.updateTaskStatus(taskId, newStatus);
      showToast(`Task status updated to ${newStatus}`);
      fetchData();
    } catch (err) {
      showToast(err.message || 'Failed to update status', 'error');
    }
  };

  // Filter tasks locally by project, status tab, and search term
  const filteredTasks = tasks.filter(t => {
    const matchesProject = selectedProjectId === 'All' ? true : Number(t.project_id) === Number(selectedProjectId);
    const matchesStatus = statusFilter === 'All' ? true : t.status === statusFilter;
    const q = searchTerm.toLowerCase();
    const matchesSearch = (t.title || '').toLowerCase().includes(q) || 
                          (t.assignee_name || '').toLowerCase().includes(q) || 
                          (t.project_name || '').toLowerCase().includes(q);
    return matchesProject && matchesStatus && matchesSearch;
  });

  const canManage = ['admin', 'hr', 'manager', 'employee'].includes(user?.role); // All roles can manage or create tasks

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-3xl shadow-lg">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-blue-400" /> Projects & Task Management
          </h2>
          <p className="text-sm text-slate-300 mt-1">Assign projects, track deliverables, set deadlines & monitor Kanban progress</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setIsProjectModalOpen(true)}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-2xl shadow-md transition-all flex items-center gap-2 cursor-pointer border border-slate-700"
          >
            <FolderPlus className="w-4 h-4 text-blue-400" /> + New Project Form
          </button>

          <button
            onClick={() => {
              if (projects.length > 0 && !taskData.project_id) setTaskData(t => ({ ...t, project_id: projects[0].id }));
              if (employees.length > 0 && !taskData.assigned_to) setTaskData(t => ({ ...t, assigned_to: employees[0].id }));
              setIsTaskModalOpen(true);
            }}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-2xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> + Assign Task Form
          </button>
        </div>
      </div>

      {/* Projects Roster Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600" /> Active Projects ({projects.length})
          </h3>
          {selectedProjectId !== 'All' && (
            <button
              onClick={() => setSelectedProjectId('All')}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
            >
              Show All Projects
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((p) => {
            const isSelected = String(selectedProjectId) === String(p.id);
            const total = Number(p.total_tasks || 0);
            const completed = Number(p.completed_tasks || 0);
            const progress = total ? Math.round((completed / total) * 100) : 0;

            return (
              <div
                key={p.id}
                onClick={() => setSelectedProjectId(isSelected ? 'All' : p.id)}
                className={`bg-white rounded-3xl p-5 border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                  isSelected
                    ? 'border-blue-600 ring-2 ring-blue-600/20 shadow-md bg-blue-50/20'
                    : 'border-slate-200/80 shadow-2xs hover:shadow-md hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-100">
                      {p.code}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {p.status}
                    </span>
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-base mb-1 hover:text-blue-600 transition-colors">
                    {p.name}
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-2">{p.description || 'Project deliverables and milestone tracking.'}</p>
                </div>

                <div className="space-y-2 pt-3 border-t border-slate-100 text-xs">
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-600">Manager: {p.manager_name || 'Vikram Mehta'}</span>
                    <span className="text-blue-600 font-bold">{completed} / {total} Tasks ({progress}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Control Toolbar & Status Filter Tabs */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold flex-wrap">
          {['All', 'Pending', 'In Progress', 'Completed'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                statusFilter === st
                  ? st === 'Completed' ? 'bg-emerald-600 text-white shadow-xs font-bold'
                    : st === 'In Progress' ? 'bg-blue-600 text-white shadow-xs font-bold'
                    : st === 'Pending' ? 'bg-amber-600 text-white shadow-xs font-bold'
                    : 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st} ({st === 'All' ? tasks.length : tasks.filter(t => t.status === st).length})
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search task, project, assignee..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:outline-none"
          />
        </div>
      </div>

      {/* Tasks Roster Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <ListTodo className="w-5 h-5 text-blue-600" /> Assigned Task Board ({filteredTasks.length})
          </h3>
          <span className="text-xs font-semibold text-slate-400">Total {tasks.length} Tasks</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Loading task board...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase border-b border-slate-100">
                  <th className="py-3.5 px-6">Task Title</th>
                  <th className="py-3.5 px-6">Project</th>
                  <th className="py-3.5 px-6">Assignee</th>
                  <th className="py-3.5 px-6">Priority</th>
                  <th className="py-3.5 px-6">Due Date</th>
                  <th className="py-3.5 px-6">Status Update</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredTasks.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6 font-semibold text-slate-900">
                      {t.title}
                      <span className="block text-xs font-normal text-slate-500 mt-0.5">{t.description || 'Deliverable task item.'}</span>
                    </td>
                    <td className="py-4 px-6 font-semibold text-blue-600 text-xs">{t.project_name}</td>
                    <td className="py-4 px-6 font-medium text-slate-900 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">
                          {(t.assignee_name || 'U').charAt(0)}
                        </div>
                        <span>{t.assignee_name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        t.priority === 'Urgent' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                        t.priority === 'High' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {t.priority}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-mono text-xs text-slate-600">{t.due_date}</td>
                    <td className="py-4 px-6">
                      <select
                        value={t.status}
                        onChange={(e) => handleTaskStatusChange(t.id, e.target.value)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border focus:outline-none cursor-pointer ${
                          t.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          t.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </td>
                  </tr>
                ))}
                {filteredTasks.length === 0 && (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-slate-400 text-sm">
                      No tasks found for current filter. Click <strong>+ Assign Task Form</strong> to add a new task.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create New Project Modal Form */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <FolderPlus className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-extrabold text-slate-900">Create New Project Form</h3>
              </div>
              <button onClick={() => setIsProjectModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">Project Name *</label>
                <input
                  type="text"
                  required
                  value={projectData.name}
                  onChange={(e) => setProjectData({...projectData, name: e.target.value})}
                  placeholder="e.g. Employee Management System"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">Project Code *</label>
                <input
                  type="text"
                  required
                  value={projectData.code}
                  onChange={(e) => setProjectData({...projectData, code: e.target.value.toUpperCase()})}
                  placeholder="e.g. PROJ-EMS"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl uppercase focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">Description</label>
                <textarea
                  rows="3"
                  value={projectData.description}
                  onChange={(e) => setProjectData({...projectData, description: e.target.value})}
                  placeholder="Describe key scope and goals..."
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setIsProjectModalOpen(false)} className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all cursor-pointer">
                  Save & Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign New Task Modal Form */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <CheckSquare className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-extrabold text-slate-900">Assign New Task Form</h3>
              </div>
              <button onClick={() => setIsTaskModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">Target Project *</label>
                <select
                  required
                  value={taskData.project_id}
                  onChange={(e) => setTaskData({...taskData, project_id: e.target.value})}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:outline-none"
                >
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name} ({p.code})</option>)}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  value={taskData.title}
                  onChange={(e) => setTaskData({...taskData, title: e.target.value})}
                  placeholder="e.g. Design UI Layouts and Charts"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">Assign To Employee *</label>
                <select
                  required
                  value={taskData.assigned_to}
                  onChange={(e) => setTaskData({...taskData, assigned_to: e.target.value})}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:outline-none"
                >
                  {employees.map(e => <option key={e.id} value={e.id}>{e.first_name} {e.last_name} ({e.designation})</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">Priority</label>
                  <select
                    value={taskData.priority}
                    onChange={(e) => setTaskData({...taskData, priority: e.target.value})}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:outline-none"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">Due Date *</label>
                  <input
                    type="date"
                    required
                    value={taskData.due_date}
                    onChange={(e) => setTaskData({...taskData, due_date: e.target.value})}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setIsTaskModalOpen(false)} className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all cursor-pointer">
                  Assign Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
