import { useEffect, useMemo, useState } from 'react';

const TOKEN_KEY = 'task_api_token';
const USER_KEY = 'task_api_user';

const defaultError = 'Something went wrong. Please try again.';
const FLOW_LOG = true;

const logFlow = (step, details) => {
  if (!FLOW_LOG) return;
  console.log(`[FLOW] ${step}`, details || '');
};

function App() {
  const apiBase = useMemo(
    () => import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001',
    []
  );
  const isNgrokBase = apiBase.includes('ngrok-free.app');

  const [token, setToken] = useState(localStorage.getItem(TOKEN_KEY) || '');
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem(USER_KEY);
    return saved ? JSON.parse(saved) : null;
  });

  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [editingTaskId, setEditingTaskId] = useState('');
  const [editingTitle, setEditingTitle] = useState('');
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const isLoggedIn = Boolean(token);

  const clearSession = () => {
    logFlow('clearSession', 'Clearing token, user, and tasks from local state');
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken('');
    setUser(null);
    setTasks([]);
  };

  const apiRequest = async (path, options = {}) => {
    const { method = 'GET', body, requiresAuth = false } = options;
    logFlow('apiRequest:start', { method, path, requiresAuth, body });

    const headers = {
      'Content-Type': 'application/json',
    };

    if (isNgrokBase) {
      headers['ngrok-skip-browser-warning'] = 'true';
    }

    if (requiresAuth && token) {
      logFlow('apiRequest:authHeader', 'Bearer token attached');
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${apiBase}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    let data = null;
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      data = await response.json();
    }

    if (!response.ok) {
      const apiMessage = data?.message || defaultError;
      logFlow('apiRequest:error', {
        status: response.status,
        path,
        message: apiMessage,
      });

      if (response.status === 401 && requiresAuth) {
        logFlow('apiRequest:unauthorized', 'Token invalid/expired. Clearing session');
        clearSession();
      }

      throw new Error(apiMessage);
    }

    logFlow('apiRequest:success', { method, path, status: response.status, data });
    return data;
  };

  const loadTasks = async () => {
    if (!isLoggedIn) {
      logFlow('loadTasks:skip', 'User is not logged in');
      return;
    }

    try {
      setIsLoadingTasks(true);
      setError('');
      logFlow('loadTasks:start', 'Fetching tasks for current user');
      const data = await apiRequest('/tasks', { requiresAuth: true });
      setTasks(data || []);
      logFlow('loadTasks:done', { count: data?.length || 0 });
    } catch (err) {
      setError(err.message || defaultError);
      logFlow('loadTasks:failed', err.message || defaultError);
    } finally {
      setIsLoadingTasks(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [isLoggedIn]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAuthChange = (event) => {
    const { name, value } = event.target;
    setAuthForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetAuthForm = () => {
    setAuthForm({
      name: '',
      email: '',
      password: '',
    });
  };

  const handleAuthSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    try {
      setIsAuthLoading(true);
      const path = authMode === 'register' ? '/auth/register' : '/auth/login';
      logFlow('auth:submit', { mode: authMode, path });

      const payload =
        authMode === 'register'
          ? authForm
          : { email: authForm.email, password: authForm.password };

      const data = await apiRequest(path, {
        method: 'POST',
        body: payload,
      });

      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      logFlow('auth:success', { userEmail: data.user?.email });
      setMessage(authMode === 'register' ? 'Registration successful' : 'Login successful');
      resetAuthForm();
    } catch (err) {
      setError(err.message || defaultError);
      logFlow('auth:failed', err.message || defaultError);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    setError('');
    setMessage('');
    logFlow('logout:start', 'Attempting logout');

    try {
      await apiRequest('/auth/logout', {
        method: 'POST',
        requiresAuth: true,
      });
      logFlow('logout:server', 'Logout API request completed');
    } catch (err) {
      // Logout should clear local session even if request fails.
      logFlow('logout:serverFailed', err.message || defaultError);
    } finally {
      clearSession();
      logFlow('logout:done', 'Client session cleared');
      setMessage('Logged out');
    }
  };

  const handleCreateTask = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    logFlow('task:create:start', { title: newTaskTitle });

    try {
      const data = await apiRequest('/tasks', {
        method: 'POST',
        body: { title: newTaskTitle },
        requiresAuth: true,
      });

      setTasks((prev) => [data, ...prev]);
      setNewTaskTitle('');
      logFlow('task:create:success', data);
      setMessage('Task created');
    } catch (err) {
      setError(err.message || defaultError);
      logFlow('task:create:failed', err.message || defaultError);
    }
  };

  const handleDeleteTask = async (taskId) => {
    setError('');
    setMessage('');
    logFlow('task:delete:start', { taskId });

    try {
      await apiRequest(`/tasks/${taskId}`, {
        method: 'DELETE',
        requiresAuth: true,
      });
      setTasks((prev) => prev.filter((task) => task.id !== taskId));
      logFlow('task:delete:success', { taskId });
      setMessage('Task deleted');
    } catch (err) {
      setError(err.message || defaultError);
      logFlow('task:delete:failed', err.message || defaultError);
    }
  };

  const handleToggleCompleted = async (task) => {
    setError('');
    setMessage('');
    logFlow('task:toggle:start', { taskId: task.id, from: task.completed, to: !task.completed });

    try {
      const updated = await apiRequest(`/tasks/${task.id}`, {
        method: 'PATCH',
        body: { completed: !task.completed },
        requiresAuth: true,
      });
      setTasks((prev) => prev.map((item) => (item.id === task.id ? updated : item)));
      logFlow('task:toggle:success', updated);
      setMessage('Task updated');
    } catch (err) {
      setError(err.message || defaultError);
      logFlow('task:toggle:failed', err.message || defaultError);
    }
  };

  const handleStartEdit = (task) => {
    logFlow('task:edit:start', { taskId: task.id });
    setEditingTaskId(task.id);
    setEditingTitle(task.title);
  };

  const handleCancelEdit = () => {
    logFlow('task:edit:cancel', { taskId: editingTaskId });
    setEditingTaskId('');
    setEditingTitle('');
  };

  const handleSaveEdit = async (task) => {
    setError('');
    setMessage('');
    logFlow('task:edit:saveStart', { taskId: task.id, title: editingTitle });

    try {
      const updated = await apiRequest(`/tasks/${task.id}`, {
        method: 'PATCH',
        body: { title: editingTitle },
        requiresAuth: true,
      });

      setTasks((prev) => prev.map((item) => (item.id === task.id ? updated : item)));
      setEditingTaskId('');
      setEditingTitle('');
      logFlow('task:edit:success', updated);
      setMessage('Task title updated');
    } catch (err) {
      setError(err.message || defaultError);
      logFlow('task:edit:failed', err.message || defaultError);
    }
  };

  return (
    <main className="page">
      <section className="card">
        <header className="card-header">
          <h1>Task App</h1>
          <p>React + Node + MongoDB + JWT</p>
        </header>

        {!isLoggedIn ? (
          <div className="auth-box">
            <div className="auth-toggle">
              <button
                type="button"
                className={authMode === 'login' ? 'active' : ''}
                onClick={() => setAuthMode('login')}
              >
                Login
              </button>
              <button
                type="button"
                className={authMode === 'register' ? 'active' : ''}
                onClick={() => setAuthMode('register')}
              >
                Register
              </button>
            </div>

            <form className="auth-form" onSubmit={handleAuthSubmit}>
              {authMode === 'register' ? (
                <label>
                  Name
                  <input
                    name="name"
                    value={authForm.name}
                    onChange={handleAuthChange}
                    placeholder="Enter your name"
                    required
                  />
                </label>
              ) : null}

              <label>
                Email
                <input
                  type="email"
                  name="email"
                  value={authForm.email}
                  onChange={handleAuthChange}
                  placeholder="Enter your email"
                  required
                />
              </label>

              <label>
                Password
                <input
                  type="password"
                  name="password"
                  value={authForm.password}
                  onChange={handleAuthChange}
                  placeholder="Enter password"
                  required
                />
              </label>

              <button type="submit" disabled={isAuthLoading}>
                {isAuthLoading ? 'Please wait...' : authMode === 'register' ? 'Create account' : 'Login'}
              </button>
            </form>
          </div>
        ) : (
          <div className="task-box">
            <div className="user-bar">
              <div>
                <strong>{user?.name}</strong>
                <p>{user?.email}</p>
              </div>
              <button type="button" onClick={handleLogout}>
                Logout
              </button>
            </div>

            <form className="create-task-form" onSubmit={handleCreateTask}>
              <input
                value={newTaskTitle}
                onChange={(event) => setNewTaskTitle(event.target.value)}
                placeholder="Add a new task"
                required
              />
              <button type="submit">Add</button>
            </form>

            {isLoadingTasks ? (
              <p>Loading tasks...</p>
            ) : (
              <ul className="task-list">
                {tasks.map((task) => (
                  <li key={task.id} className="task-item">
                    <label className="task-check">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => handleToggleCompleted(task)}
                      />
                    </label>

                    {editingTaskId === task.id ? (
                      <input
                        className="task-edit-input"
                        value={editingTitle}
                        onChange={(event) => setEditingTitle(event.target.value)}
                      />
                    ) : (
                      <span className={task.completed ? 'done' : ''}>{task.title}</span>
                    )}

                    <div className="task-actions">
                      {editingTaskId === task.id ? (
                        <>
                          <button type="button" onClick={() => handleSaveEdit(task)}>
                            Save
                          </button>
                          <button type="button" className="ghost" onClick={handleCancelEdit}>
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button type="button" onClick={() => handleStartEdit(task)}>
                            Edit
                          </button>
                          <button
                            type="button"
                            className="danger"
                            onClick={() => handleDeleteTask(task.id)}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </li>
                ))}
                {tasks.length === 0 ? <li className="empty">No tasks yet</li> : null}
              </ul>
            )}
          </div>
        )}

        {message ? <p className="message success">{message}</p> : null}
        {error ? <p className="message error">{error}</p> : null}
      </section>
    </main>
  );
}

export default App;
