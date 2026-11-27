
import { useEffect, useState } from 'react';
import { api } from '../api';
import {
  PageHeader,
  Card,
  Table,
  Modal,
  Field,
  Notice,
  useLoad,
  money,
  Status
} from '../components/UI';
import { Plus, Search, Trash2, Edit3 } from 'lucide-react';

const blank = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  hire_date: new Date().toISOString().slice(0, 10),
  department_id: '',
  job_id: '',
  base_salary: '',
  employment_status: 'Active'
};

export default function Employees() {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blank);
  const [error, setError] = useState('');

  const {
    data: employees,
    refresh
  } = useLoad(
    () => api('/employees?search=' + encodeURIComponent(search)),
    [search]
  );

  const { data: departments } = useLoad(
    () => api('/departments')
  );

  const [jobs, setJobs] = useState([]);

  // Load job options for the employee form.
  useEffect(() => {
    api('/reference/jobs')
      .then(setJobs)
      .catch(() => setJobs([]));
  }, []);

  // Open the form for adding or editing an employee.
  function start(row) {
    setEditing(row || null);

    setForm(
      row
        ? {
            ...row,
            hire_date: String(row.hire_date).slice(0, 10)
          }
        : { ...blank }
    );

    setError('');
    setOpen(true);
  }

  // Save a new employee or update an existing employee.
  async function save(e) {
    e.preventDefault();
    setError('');

    try {
      await api(
        editing
          ? `/employees/${editing.emp_id}`
          : '/employees',
        {
          method: editing ? 'PUT' : 'POST',
          body: JSON.stringify({
            ...form,
            department_id: Number(form.department_id),
            job_id: Number(form.job_id),
            base_salary: Number(form.base_salary)
          })
        }
      );

      setOpen(false);
      refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  // Delete an employee after confirmation.
  async function remove(row) {
    if (
      !confirm(
        `Delete ${row.first_name} ${row.last_name}?`
      )
    ) {
      return;
    }

    try {
      await api(`/employees/${row.emp_id}`, {
        method: 'DELETE'
      });

      refresh();
    } catch (err) {
      alert(err.message);
    }
  }

  // Employee table columns.
  const columns = [
    {
      key: 'emp_id',
      label: 'ID'
    },
    {
      key: 'name',
      label: 'Employee',
      render: (r) => (
        <div className="person-cell">
          <div className="avatar small">
            {r.first_name[0]}
            {r.last_name[0]}
          </div>

          <div>
            <b>
              {r.first_name} {r.last_name}
            </b>
            <small>{r.email}</small>
          </div>
        </div>
      )
    },
    {
      key: 'department_name',
      label: 'Department'
    },
    {
      key: 'job_title',
      label: 'Job title'
    },
    {
      key: 'base_salary',
      label: 'Base salary',
      render: (r) => money(r.base_salary)
    },
    {
      key: 'employment_status',
      label: 'Status',
      render: (r) => (
        <Status value={r.employment_status} />
      )
    },
    {
      key: 'actions',
      label: '',
      render: (r) => (
        <div className="row-actions">
          <button
            className="icon-button"
            onClick={() => start(r)}
            title="Edit"
          >
            <Edit3 size={16} />
          </button>

          <button
            className="icon-button danger-text"
            onClick={() => remove(r)}
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <>
      <PageHeader
        eyebrow="PEOPLE"
        title="Employees"
        description="Manage your employee directory and employment details."
        action={
          <button
            className="btn primary"
            onClick={() => start()}
          >
            <Plus size={17} />
            Add employee
          </button>
        }
      />

      <Card>
        <div className="toolbar">
          <div className="search-box">
            <Search size={17} />

            <input
              placeholder="Search employees…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <span className="muted">
            {employees.length} records
          </span>
        </div>

        <Table
          columns={columns}
          rows={employees}
        />
      </Card>

      {open && (
        <Modal
          title={editing ? 'Edit employee' : 'Add employee'}
          onClose={() => setOpen(false)}
        >
          <form
            onSubmit={save}
            className="form-grid"
          >
            <Field label="First name">
              <input
                value={form.first_name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    first_name: e.target.value
                  })
                }
                required
              />
            </Field>

            <Field label="Last name">
              <input
                value={form.last_name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    last_name: e.target.value
                  })
                }
                required
              />
            </Field>

            <Field label="Email">
              <input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm({
                    ...form,
                    email: e.target.value
                  })
                }
                required
              />
            </Field>

            <Field label="Phone">
              <input
                value={form.phone || ''}
                onChange={(e) =>
                  setForm({
                    ...form,
                    phone: e.target.value
                  })
                }
              />
            </Field>

            <Field label="Hire date">
              <input
                type="date"
                value={form.hire_date}
                onChange={(e) =>
                  setForm({
                    ...form,
                    hire_date: e.target.value
                  })
                }
                required
              />
            </Field>

            <Field label="Department">
              <select
                value={form.department_id}
                onChange={(e) =>
                  setForm({
                    ...form,
                    department_id: e.target.value
                  })
                }
                required
              >
                <option value="">
                  Choose department
                </option>

                {departments.map((d) => (
                  <option
                    key={d.department_id}
                    value={d.department_id}
                  >
                    {d.department_name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Job">
              <select
                value={form.job_id}
                onChange={(e) =>
                  setForm({
                    ...form,
                    job_id: e.target.value
                  })
                }
                required
              >
                <option value="">
                  Choose job
                </option>

                {jobs.map((j) => (
                  <option
                    key={j.job_id}
                    value={j.job_id}
                  >
                    {j.job_title}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Base salary (₹)">
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.base_salary}
                onChange={(e) =>
                  setForm({
                    ...form,
                    base_salary: e.target.value
                  })
                }
                required
              />
            </Field>

            <Field label="Employment status">
              <select
                value={form.employment_status}
                onChange={(e) =>
                  setForm({
                    ...form,
                    employment_status: e.target.value
                  })
                }
              >
                <option>Active</option>
                <option>Inactive</option>
                <option>On Leave</option>
              </select>
            </Field>

            <div className="form-footer">
              <Notice error={error} />

              <button
                type="button"
                className="btn secondary"
                onClick={() => setOpen(false)}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="btn primary"
              >
                Save employee
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
