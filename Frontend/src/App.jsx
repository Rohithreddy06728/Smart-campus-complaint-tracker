

import { useCallback, useEffect, useState } from "react";

import { useAuth } from "./context/AuthContext";

import AuthPage from "./components/AuthPage";

import "./App.css";

const API_URL = `${import.meta.env.VITE_API_URL}/api/complaints`;

const CATEGORIES = [

  "Internet/Wi-Fi",

  "Hostel",

  "Mess/Food",

  "Transport",

  "Infrastructure",

  "Electrical",

  "Cleanliness",

  "Academics",

  "Security",

  "Other",

];

const STATUSES = [

  "SUBMITTED",

  "UNDER_REVIEW",

  "ASSIGNED",

  "IN_PROGRESS",

  "RESOLVED",

  "CLOSED",

];

const EMPTY_FORM = {

  title: "",

  description: "",

  category: "Infrastructure",

  location: "",

};

function formatStatus(status = "SUBMITTED") {

  return status.replaceAll("_", " ");

}

function formatDate(date) {

  if (!date) return "Just now";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "Unknown date";

  return parsed.toLocaleString();

}

async function readResponse(response) {

  if (response.status === 204) return null;

  const text = await response.text();

  let data = null;

  try {

    data = text ? JSON.parse(text) : null;

  } catch {

    data = text;

  }

  if (!response.ok) {

    const message =

      data?.detail ||

      data?.message ||

      data?.error ||

      (typeof data === "string" ? data : null) ||

      `Request failed (${response.status})`;

    throw new Error(message);

  }

  return data;

}

export default function App() {

  const { user, logout, apiFetch } = useAuth();

  const [complaints, setComplaints] = useState([]);

  const [form, setForm] = useState(EMPTY_FORM);

  const [editingId, setEditingId] = useState(null);

  const [activeTab, setActiveTab] = useState("dashboard");

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("ALL");

  const [loading, setLoading] = useState(false);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [notice, setNotice] = useState("");

  const isAdmin = user?.role === "ADMIN";

  const request = useCallback(

    async (url, options = {}) => {

      const response = await apiFetch(url, {

        ...options,

        headers: {

          ...(options.body

            ? { "Content-Type": "application/json" }

            : {}),

          ...(options.headers || {}),

        },

      });

      return readResponse(response);

    },

    [apiFetch]

  );

  const loadComplaints = useCallback(async () => {

    if (!user) return;

    setLoading(true);

    setError("");

    try {

      const data = await request(API_URL);

      setComplaints(Array.isArray(data) ? data : []);

    } catch (err) {

      setError(err.message || "Unable to load complaints.");

      if (

        err.message?.includes("401") ||

        err.message?.includes("403")

      ) {

        setNotice("Your session may have expired. Please log in again.");

      }

    } finally {

      setLoading(false);

    }

  }, [user, request]);

  useEffect(() => {

    if (user) {

      loadComplaints();

    }

  }, [user, loadComplaints]);

  if (!user) {

    return <AuthPage />;

  }

  const total = complaints.length;

  const submitted = complaints.filter(

    (item) => item.status === "SUBMITTED"

  ).length;

  const inProgress = complaints.filter(

    (item) =>

      item.status === "IN_PROGRESS" ||

      item.status === "UNDER_REVIEW" ||

      item.status === "ASSIGNED"

  ).length;

  const resolved = complaints.filter(

    (item) =>

      item.status === "RESOLVED" ||

      item.status === "CLOSED"

  ).length;

  const filteredComplaints = complaints.filter((item) => {

    const query = search.toLowerCase();

    const matchesSearch = [

      item.title,

      item.description,

      item.category,

      item.location,

      String(item.id),

    ].some((value) => String(value || "").toLowerCase().includes(query));

    const matchesStatus =

      statusFilter === "ALL" || item.status === statusFilter;

    return matchesSearch && matchesStatus;

  });

  function updateField(event) {

    const { name, value } = event.target;

    setForm((previous) => ({

      ...previous,

      [name]: value,

    }));

  }

  function resetForm() {

    setForm(EMPTY_FORM);

    setEditingId(null);

  }

  async function handleSubmit(event) {

    event.preventDefault();

    setError("");

    setNotice("");

    setSaving(true);

    try {

      const payload = {

        title: form.title.trim(),

        description: form.description.trim(),

        category: form.category,

        location: form.location.trim(),

      };

      const url = editingId

        ? `${API_URL}/${editingId}`

        : API_URL;

      const method = editingId ? "PUT" : "POST";

      await request(url, {

        method,

        body: JSON.stringify(payload),

      });

      setNotice(

        editingId

          ? "Complaint updated successfully."

          : "Complaint submitted successfully."

      );

      resetForm();

      setActiveTab("complaints");

      await loadComplaints();

    } catch (err) {

      setError(err.message || "Unable to save complaint.");

    } finally {

      setSaving(false);

    }

  }

  function startEdit(complaint) {

    if (!isAdmin) return;

    setEditingId(complaint.id);

    setForm({

      title: complaint.title || "",

      description: complaint.description || "",

      category: complaint.category || "Other",

      location: complaint.location || "",

    });

    setActiveTab("submit");

    setError("");

    setNotice("");

  }

  async function updateStatus(complaint, newStatus) {

    if (!isAdmin || !STATUSES.includes(newStatus)) return;

    setError("");

    setNotice("");

    try {

      await request(`${API_URL}/${complaint.id}`, {

        method: "PUT",

        body: JSON.stringify({

          title: complaint.title,

          description: complaint.description,

          category: complaint.category,

          location: complaint.location,

          status: newStatus,

        }),

      });

      setNotice(`Complaint #${complaint.id} status updated.`);

      await loadComplaints();

    } catch (err) {

      setError(err.message || "Unable to update complaint status.");

    }

  }

  async function deleteComplaint(complaint) {

    if (!isAdmin) return;

    const confirmed = window.confirm(

      `Delete complaint #${complaint.id}: "${complaint.title}"?`

    );

    if (!confirmed) return;

    setError("");

    setNotice("");

    try {

      await request(`${API_URL}/${complaint.id}`, {

        method: "DELETE",

      });

      setNotice("Complaint deleted successfully.");

      await loadComplaints();

    } catch (err) {

      setError(err.message || "Unable to delete complaint.");

    }

  }

  function handleLogout() {

    const confirmed = window.confirm("Are you sure you want to log out?");

    if (confirmed) {

      logout();

    }

  }

  return (

    <div className="campus-app">

      <aside className="sidebar">

        <div className="sidebar-brand">

          <div className="brand-icon">CC</div>

          <div>

            <h2>CampusCare</h2>

            <p>Smart Campus Tracker</p>

          </div>

        </div>

        <div className="sidebar-section-label">WORKSPACE</div>

        <nav className="sidebar-nav">

          <button

            className={activeTab === "dashboard" ? "nav-item active" : "nav-item"}

            onClick={() => setActiveTab("dashboard")}

          >

            <span>▦</span> Dashboard

          </button>

          <button

            className={activeTab === "complaints" ? "nav-item active" : "nav-item"}

            onClick={() => setActiveTab("complaints")}

          >

            <span>☷</span> {isAdmin ? "All Complaints" : "Complaints"}

          </button>

          {!isAdmin && (

            <button

              className={activeTab === "submit" ? "nav-item active" : "nav-item"}

              onClick={() => {

                resetForm();

                setActiveTab("submit");

              }}

            >

              <span>＋</span> Submit Complaint

            </button>

          )}

        </nav>

        <div className="sidebar-bottom">

          <div className="sidebar-user">

            <div className="user-avatar">

              {(user.fullName || "U").charAt(0).toUpperCase()}

            </div>

            <div className="user-info">

              <strong>{user.fullName}</strong>

              <span>{isAdmin ? "Administrator" : "Student"}</span>

            </div>

          </div>

          <button className="logout-button" onClick={handleLogout}>

            ↪ Logout

          </button>

        </div>

      </aside>

      <main className="main-content">

        <header className="topbar">

          <div>

            <p className="topbar-eyebrow">

              {isAdmin ? "ADMINISTRATION" : "STUDENT PORTAL"}

            </p>

            <h1>

              {activeTab === "dashboard"

                ? "Dashboard"

                : activeTab === "complaints"

                  ? isAdmin

                    ? "Manage Complaints"

                    : "Campus Complaints"

                  : editingId

                    ? "Edit Complaint"

                    : "Submit a Complaint"}

            </h1>

          </div>

          <div className="topbar-user">

            <span className="online-dot" />

            <span>{user.fullName}</span>

          </div>

        </header>

        <section className="page-content">

          {error && (

            <div className="app-alert error-alert">

              <span>{error}</span>

              <button onClick={() => setError("")}>×</button>

            </div>

          )}

          {notice && (

            <div className="app-alert success-alert">

              <span>{notice}</span>

              <button onClick={() => setNotice("")}>×</button>

            </div>

          )}

          {activeTab === "dashboard" && (

            <>

              <div className="welcome-panel">

                <div>

                  <p className="welcome-label">WELCOME BACK</p>

                  <h2>Hello, {user.fullName?.split(" ")[0] || "User"}!</h2>

                  <p>

                    {isAdmin

                      ? "Monitor campus complaints and manage their progress."

                      : "Help make your campus better by reporting issues."}

                  </p>

                </div>

                <div className="welcome-illustration">🏫</div>

              </div>

              <div className="stats-grid">

                <StatCard

                  label="Total Complaints"

                  value={total}

                  symbol="☷"

                  color="blue"

                />

                <StatCard

                  label="Submitted"

                  value={submitted}

                  symbol="◷"

                  color="orange"

                />

                <StatCard

                  label="In Progress"

                  value={inProgress}

                  symbol="↻"

                  color="purple"

                />

                <StatCard

                  label="Resolved"

                  value={resolved}

                  symbol="✓"

                  color="green"

                />

              </div>

              <section className="content-card">

                <div className="section-heading">

                  <div>

                    <h2>Recent Complaints</h2>

                    <p>Latest complaints recorded in the system</p>

                  </div>

                  <button

                    className="text-button"

                    onClick={() => setActiveTab("complaints")}

                  >

                    View all →

                  </button>

                </div>

                <ComplaintTable

                  complaints={complaints.slice(0, 5)}

                  isAdmin={isAdmin}

                  onEdit={startEdit}

                  onDelete={deleteComplaint}

                  onStatusChange={updateStatus}

                  loading={loading}

                />

              </section>

            </>

          )}

          {activeTab === "complaints" && (

            <section className="content-card">

              <div className="section-heading">

                <div>

                  <h2>{isAdmin ? "All Campus Complaints" : "Complaint List"}</h2>

                  <p>

                    {filteredComplaints.length} complaint

                    {filteredComplaints.length === 1 ? "" : "s"} found

                  </p>

                </div>

                {!isAdmin && (

                  <button

                    className="primary-button"

                    onClick={() => {

                      resetForm();

                      setActiveTab("submit");

                    }}

                  >

                    + New Complaint

                  </button>

                )}

              </div>

              <div className="filter-bar">

                <input

                  type="search"

                  placeholder="Search by title, category, location or ID..."

                  value={search}

                  onChange={(event) => setSearch(event.target.value)}

                />

                <select

                  value={statusFilter}

                  onChange={(event) => setStatusFilter(event.target.value)}

                >

                  <option value="ALL">All statuses</option>

                  {STATUSES.map((status) => (

                    <option key={status} value={status}>

                      {formatStatus(status)}

                    </option>

                  ))}

                </select>

                <button className="secondary-button" onClick={loadComplaints}>

                  Refresh

                </button>

              </div>

              <ComplaintTable

                complaints={filteredComplaints}

                isAdmin={isAdmin}

                onEdit={startEdit}

                onDelete={deleteComplaint}

                onStatusChange={updateStatus}

                loading={loading}

              />

            </section>

          )}

          {activeTab === "submit" && (

            <section className="content-card form-card">

              <div className="section-heading">

                <div>

                  <h2>{editingId ? "Edit Complaint" : "Report a Campus Issue"}</h2>

                  <p>

                    {editingId

                      ? "Update the complaint details."

                      : "Provide the details so the campus team can address the issue."}

                  </p>

                </div>

              </div>

              <form className="complaint-form" onSubmit={handleSubmit}>

                <label>

                  Complaint title \*

                  <input

                    name="title"

                    value={form.title}

                    onChange={updateField}

                    placeholder="e.g. Wi-Fi not working in Block B"

                    maxLength={200}

                    required

                  />

                </label>

                <label>

                  Category \*

                  <select

                    name="category"

                    value={form.category}

                    onChange={updateField}

                    required

                  >

                    {CATEGORIES.map((category) => (

                      <option key={category} value={category}>

                        {category}

                      </option>

                    ))}

                  </select>

                </label>

                <label>

                  Location

                  <input

                    name="location"

                    value={form.location}

                    onChange={updateField}

                    placeholder="e.g. Block B, Second Floor"

                    maxLength={200}

                  />

                </label>

                <label>

                  Description \*

                  <textarea

                    name="description"

                    value={form.description}

                    onChange={updateField}

                    placeholder="Describe the problem in detail..."

                    rows={5}

                    maxLength={2000}

                    required

                  />

                  <span className="character-count">

                    {form.description.length}/2000 characters

                  </span>

                </label>

                <div className="form-actions">

                  <button

                    type="button"

                    className="secondary-button"

                    onClick={() => {

                      resetForm();

                      setActiveTab("complaints");

                    }}

                  >

                    Cancel

                  </button>

                  <button

                    type="submit"

                    className="primary-button"

                    disabled={saving}

                  >

                    {saving

                      ? "Saving..."

                      : editingId

                        ? "Save Changes"

                        : "Submit Complaint"}

                  </button>

                </div>

              </form>

            </section>

          )}

        </section>

      </main>

    </div>

  );

}

function StatCard({ label, value, symbol, color }) {

  return (

    <article className="stat-card">

      <div className={`stat-icon ${color}`}>{symbol}</div>

      <div>

        <p>{label}</p>

        <strong>{value}</strong>

      </div>

    </article>

  );

}

function ComplaintTable({

  complaints,

  isAdmin,

  onEdit,

  onDelete,

  onStatusChange,

  loading,

}) {

  if (loading && complaints.length === 0) {

    return <div className="empty-state">Loading complaints...</div>;

  }

  if (complaints.length === 0) {

    return (

      <div className="empty-state">

        <div className="empty-icon">☷</div>

        <h3>No complaints found</h3>

        <p>New complaints will appear here when they are submitted.</p>

      </div>

    );

  }

  return (

    <div className="table-wrapper">

      <table className="complaints-table">

        <thead>

          <tr>

            <th>Sl. No. / Title</th>

            <th>Category</th>

            <th>Location</th>

            <th>Status</th>

            <th>Created</th>

            {isAdmin && <th>Actions</th>}

          </tr>

        </thead>

        <tbody>

          {complaints.map((complaint) => (

            <tr key={complaint.id}>

              <td>

                <div className="complaint-title-cell">

                  <span className="complaint-id">#{complaints.findIndex((item) => item.id === complaint.id) + 1}</span>

                  <strong>{complaint.title}</strong>

                  <small>{complaint.description}</small>

                </div>

              </td>

              <td>{complaint.category}</td>

              <td>{complaint.location || "—"}</td>

              <td>

                {isAdmin ? (

                  <select

                    className={`status-select status-${(complaint.status || "SUBMITTED").toLowerCase()}`}

                    value={complaint.status || "SUBMITTED"}

                    onChange={(event) =>

                      onStatusChange(complaint, event.target.value)

                    }

                    aria-label={`Update status for complaint ${complaint.id}`}

                  >

                    {STATUSES.map((status) => (

                      <option key={status} value={status}>

                        {formatStatus(status)}

                      </option>

                    ))}

                  </select>

                ) : (

                  <span

                    className={`status-badge status-${(complaint.status || "SUBMITTED").toLowerCase()}`}

                  >

                    {formatStatus(complaint.status)}

                  </span>

                )}

              </td>

              <td>{formatDate(complaint.createdAt)}</td>

              {isAdmin && (

                <td>

                  <div className="table-actions">

                    <button

                      className="action-button"

                      onClick={() => onEdit(complaint)}

                      title="Edit complaint"

                    >

                      Edit

                    </button>

                    <button

                      className="action-button danger"

                      onClick={() => onDelete(complaint)}

                      title="Delete complaint"

                    >

                      Delete

                    </button>

                  </div>

                </td>

              )}

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  );

}
