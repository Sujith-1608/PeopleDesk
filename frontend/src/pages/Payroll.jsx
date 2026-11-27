
import { useState } from 'react';
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
  date,
  Status
} from '../components/UI';
import { Plus, CheckCircle2 } from 'lucide-react';

const month = () => new Date().toISOString().slice(0, 7) + '-01';

export default function Payroll() {
  const { data, refresh } = useLoad(
    () => api('/payroll')
  );

  const { data: employees } = useLoad(
    () => api('/employees')
  );

  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    emp_id: '',
    payroll_month: month(),
    allowances: 0,
    deductions: 0
  });

  const [error, setError] = useState('');

  // Generate payroll.
  async function save(e) {
    e.preventDefault();
    setError('');

    try {
      await api('/payroll', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          emp_id: Number(form.emp_id),
          allowances: Number(form.allowances),
          deductions: Number(form.deductions)
        })
      });

      setOpen(false);

      setForm({
        emp_id: '',
        payroll_month: month(),
        allowances: 0,
        deductions: 0
      });

      refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  // Mark payroll as paid.
  async function markPaid(id) {
    try {
      await api(`/payroll/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({
          payment_status: 'Paid'
        })
      });

      refresh();
    } catch (err) {
      alert(err.message);
    }
  }

  // Payroll table columns.
  const columns = [
    {
      key: 'payroll_id',
      label: 'ID'
    },
    {
      key: 'employee_name',
      label: 'Employee'
    },
    {
      key: 'payroll_month',
      label: 'Payroll month',
      render: (r) => date(r.payroll_month).slice(0, 7)
    },
    {
      key: 'basic_salary',
      label: 'Basic',
      render: (r) => money(r.basic_salary)
    },
    {
      key: 'allowances',
      label: 'Allowances',
      render: (r) => money(r.allowances)
    },
    {
      key: 'deductions',
      label: 'Deductions',
      render: (r) => money(r.deductions)
    },
    {
      key: 'net_salary',
      label: 'Net salary',
      render: (r) => (
        <b>{money(r.net_salary)}</b>
      )
    },
    {
      key: 'payment_status',
      label: 'Status',
      render: (r) => (
        <Status value={r.payment_status} />
      )
    },
    {
      key: 'actions',
      label: '',
      render: (r) =>
        r.payment_status !== 'Paid' ? (
          <button
            className="icon-button success-text"
            onClick={() => markPaid(r.payroll_id)}
            title="Mark paid"
          >
            <CheckCircle2 size={17} />
          </button>
        ) : (
          '—'
        )
    }
  ];

  // Include Active and On Leave employees.
  const eligibleEmployees = employees.filter(
    (e) =>
      ['Active', 'On Leave'].includes(e.employment_status)
  );

  return (
    <>
      <PageHeader
        eyebrow="COMPENSATION"
        title="Payroll"
        description="Generate monthly payroll and track payment status."
        action={
          <button
            className="btn primary"
            onClick={() => {
              setError('');
              setOpen(true);
            }}
          >
            <Plus size={17} />
            Generate payroll
          </button>
        }
      />

      {/* Payroll summary */}
      <div className="payroll-summary">
        <Card>
          <span>Total payroll records</span>
          <b>{data.length}</b>
        </Card>

        <Card>
          <span>Total net payroll</span>
          <b>
            {money(
              data.reduce(
                (s, r) => s + Number(r.net_salary || 0),
                0
              )
            )}
          </b>
        </Card>

        <Card>
          <span>Pending payments</span>
          <b>
            {
              data.filter(
                (r) => r.payment_status === 'Pending'
              ).length
            }
          </b>
        </Card>
      </div>

      {/* Payroll records */}
      <Card>
        <Table
          columns={columns}
          rows={data}
        />
      </Card>

      {/* Generate payroll modal */}
      {open && (
        <Modal
          title="Generate payroll"
          onClose={() => setOpen(false)}
        >
          <form
            onSubmit={save}
            className="form-grid"
          >
            <Field label="Employee">
              <select
                required
                value={form.emp_id}
                onChange={(e) =>
                  setForm({
                    ...form,
                    emp_id: e.target.value
                  })
                }
              >
                <option value="">
                  Choose employee
                </option>

                {eligibleEmployees.map((e) => (
                  <option
                    key={e.emp_id}
                    value={e.emp_id}
                  >
                    {e.first_name} {e.last_name} — {money(e.base_salary)}
                    {e.employment_status === 'On Leave'
                      ? ' (On Leave)'
                      : ''}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Payroll month (first day)">
              <input
                type="date"
                value={form.payroll_month}
                onChange={(e) =>
                  setForm({
                    ...form,
                    payroll_month:
                      e.target.value.slice(0, 7) + '-01'
                  })
                }
              />
            </Field>

            <Field label="Allowances (₹)">
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.allowances}
                onChange={(e) =>
                  setForm({
                    ...form,
                    allowances: e.target.value
                  })
                }
              />
            </Field>

            <Field label="Deductions (₹)">
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.deductions}
                onChange={(e) =>
                  setForm({
                    ...form,
                    deductions: e.target.value
                  })
                }
              />
            </Field>

            <p className="form-note">
              Basic salary is fetched from the employee record.
              Net salary is calculated by MySQL as basic salary
              + allowances - deductions.
              Employees on leave are included; enter any
              applicable unpaid leave deduction manually.
            </p>

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
                Generate payroll
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
