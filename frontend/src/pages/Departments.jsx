
import { useState } from 'react';
import { api } from '../api';
import {
  PageHeader,
  Card,
  Table,
  Modal,
  Field,
  Notice,
  useLoad
} from '../components/UI';
import {
  Plus,
  Building2,
  Edit3,
  Trash2
} from 'lucide-react';

export default function Departments() {
  const { data, refresh } = useLoad(
    () => api('/departments')
  );

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [error, setError] = useState('');

  // Open the form for adding or editing a department.
  function start(row = null) {
    setEditing(row);

    setName(row ? row.department_name : '');
    setLocation(row ? row.location || '' : '');

    setError('');
    setOpen(true);
  }

  // Create or update a department.
  async function save(e) {
    e.preventDefault();
    setError('');

    try {
      await api(
        editing
          ? `/departments/${editing.department_id}`
          : '/departments',
        {
          method: editing ? 'PUT' : 'POST',
          body: JSON.stringify({
            department_name: name,
            location
          })
        }
      );

      setOpen(false);
      setEditing(null);
      setName('');
      setLocation('');

      refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  // Delete a department after confirmation.
  async function remove(row) {
    const confirmed = confirm(
      `Are you sure you want to delete ${row.department_name}?`
    );

    if (!confirmed) return;

    try {
      await api(
        `/departments/${row.department_id}`,
        {
          method: 'DELETE'
        }
      );

      refresh();
    } catch (err) {
      alert(err.message);
    }
  }

  // Department directory table columns.
  const columns = [
    {
      key: 'department_id',
      label: 'ID'
    },
    {
      key: 'department_name',
      label: 'Department'
    },
    {
      key: 'location',
      label: 'Location',
      render: (row) => row.location || 'Not set'
    },
    {
      key: 'employee_count',
      label: 'Employees'
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="row-actions">
          <button
            className="icon-button"
            title="Edit department"
            onClick={() => start(row)}
          >
            <Edit3 size={16} />
          </button>

          <button
            className="icon-button danger-text"
            title="Delete department"
            onClick={() => remove(row)}
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
        eyebrow="ORGANIZATION"
        title="Departments"
        description="View and create organizational departments."
        action={
          <button
            className="btn primary"
            onClick={() => start()}
          >
            <Plus size={17} />
            Add department
          </button>
        }
      />

      {/* Department cards */}
      <div className="department-grid">
        {data.map((d) => (
          <Card
            className="department-card"
            key={d.department_id}
          >
            <div className="department-icon">
              <Building2 />
            </div>

            <h3>{d.department_name}</h3>

            <p>
              {d.location || 'Location not set'}
            </p>

            <div className="department-count">
              <b>{d.employee_count}</b>
              <span>team members</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Department directory */}
      <Card>
        <div className="card-title">
          Department directory
        </div>

        <Table
          columns={columns}
          rows={data}
        />
      </Card>

      {/* Add/Edit department modal */}
      {open && (
        <Modal
          title={
            editing
              ? 'Edit department'
              : 'Add department'
          }
          onClose={() => setOpen(false)}
        >
          <form
            onSubmit={save}
            className="form-grid one-col"
          >
            <Field label="Department name">
              <input
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                required
              />
            </Field>

            <Field label="Location">
              <input
                value={location}
                onChange={(e) =>
                  setLocation(e.target.value)
                }
              />
            </Field>

            <Notice error={error} />

            <div className="form-footer">
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
                {editing
                  ? 'Save changes'
                  : 'Create department'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
