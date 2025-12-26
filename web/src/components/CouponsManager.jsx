import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { FiEdit2, FiPlus, FiSearch, FiTrash2 } from 'react-icons/fi';
import { storeManagerService } from '../services';

const toInputDate = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};

const fromInputDate = (value) => {
    const v = String(value || '').trim();
    if (!v) return null;
    const date = new Date(`${v}T00:00:00.000Z`);
    if (Number.isNaN(date.getTime())) return null;
    return date.toISOString();
};

const emptyForm = {
    code: '',
    description: '',
    discountType: 'percentage',
    value: 10,
    maxDiscountAmount: 0,
    minOrderAmount: 0,
    usageLimit: 0,
    startsAt: '',
    expiresAt: '',
    isActive: true,
};

const CouponsManager = ({ Layout, title = 'Coupons' }) => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [coupons, setCoupons] = useState([]);
    const [search, setSearch] = useState('');
    const [active, setActive] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(emptyForm);

    const formTitle = useMemo(() => (editing ? 'Edit Coupon' : 'New Coupon'), [editing]);

    const loadCoupons = async () => {
        try {
            setLoading(true);
            const res = await storeManagerService.getCoupons({ search: search.trim() || undefined, active: active || undefined });
            setCoupons(Array.isArray(res?.data) ? res.data : []);
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to load coupons');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCoupons();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const openCreate = () => {
        setEditing(null);
        setForm(emptyForm);
        setShowForm(true);
    };

    const openEdit = (coupon) => {
        setEditing(coupon);
        setForm({
            code: coupon?.code || '',
            description: coupon?.description || '',
            discountType: coupon?.discountType || 'percentage',
            value: Number(coupon?.value ?? 0),
            maxDiscountAmount: Number(coupon?.maxDiscountAmount ?? 0),
            minOrderAmount: Number(coupon?.minOrderAmount ?? 0),
            usageLimit: Number(coupon?.usageLimit ?? 0),
            startsAt: toInputDate(coupon?.startsAt),
            expiresAt: toInputDate(coupon?.expiresAt),
            isActive: coupon?.isActive !== false,
        });
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setEditing(null);
        setForm(emptyForm);
    };

    const onFormChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

    const handleSave = async (e) => {
        e.preventDefault();
        if (!String(form.code || '').trim()) {
            toast.error('Please enter a coupon code');
            return;
        }
        if (!form.discountType) {
            toast.error('Please select a discount type');
            return;
        }
        if (Number(form.value) <= 0) {
            toast.error('Discount value must be greater than 0');
            return;
        }

        const payload = {
            code: String(form.code).trim(),
            description: String(form.description || '').trim(),
            discountType: form.discountType,
            value: Number(form.value),
            maxDiscountAmount: Number(form.maxDiscountAmount || 0),
            minOrderAmount: Number(form.minOrderAmount || 0),
            usageLimit: Number(form.usageLimit || 0),
            startsAt: fromInputDate(form.startsAt),
            expiresAt: fromInputDate(form.expiresAt),
            isActive: !!form.isActive,
        };

        try {
            setSaving(true);
            if (editing?._id) {
                const res = await storeManagerService.updateCoupon(editing._id, payload);
                const updated = res?.data;
                setCoupons((prev) => prev.map((c) => (c._id === updated?._id ? updated : c)));
                toast.success('Coupon updated');
            } else {
                const res = await storeManagerService.createCoupon(payload);
                const created = res?.data;
                setCoupons((prev) => [created, ...prev]);
                toast.success('Coupon created');
            }
            closeForm();
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to save coupon');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (coupon) => {
        const ok = window.confirm(`Delete coupon ${coupon?.code}?`);
        if (!ok) return;
        try {
            await storeManagerService.deleteCoupon(coupon._id);
            setCoupons((prev) => prev.filter((c) => c._id !== coupon._id));
            toast.success('Coupon deleted');
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to delete coupon');
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        await loadCoupons();
    };

    const Wrapper = Layout || (({ children }) => <>{children}</>);

    return (
        <Wrapper>
            <div className="mb-8 flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                    <p className="text-gray-500">Create and manage discount coupons for your store</p>
                </div>
                <button
                    type="button"
                    onClick={openCreate}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                    <FiPlus className="w-4 h-4" />
                    New Coupon
                </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <form onSubmit={handleSearch} className="flex items-center gap-2 w-full md:max-w-xl">
                        <div className="relative w-full">
                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by code…"
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                            />
                        </div>
                        <select
                            value={active}
                            onChange={(e) => setActive(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg bg-white"
                        >
                            <option value="">All</option>
                            <option value="true">Active</option>
                            <option value="false">Inactive</option>
                        </select>
                        <button type="submit" className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800">
                            Filter
                        </button>
                    </form>
                    <button
                        type="button"
                        onClick={loadCoupons}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        Refresh
                    </button>
                </div>

                {loading ? (
                    <div className="p-10 text-center text-gray-500">Loading coupons…</div>
                ) : coupons.length === 0 ? (
                    <div className="p-10 text-center text-gray-500">No coupons yet.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-50 text-gray-500">
                                <tr>
                                    <th className="text-left font-semibold px-4 py-3">Code</th>
                                    <th className="text-left font-semibold px-4 py-3">Discount</th>
                                    <th className="text-left font-semibold px-4 py-3">Min Order</th>
                                    <th className="text-left font-semibold px-4 py-3">Usage</th>
                                    <th className="text-left font-semibold px-4 py-3">Dates</th>
                                    <th className="text-left font-semibold px-4 py-3">Status</th>
                                    <th className="text-right font-semibold px-4 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {coupons.map((c) => {
                                    const usage = c.usageLimit > 0 ? `${c.usedCount || 0}/${c.usageLimit}` : `${c.usedCount || 0}/∞`;
                                    const discountLabel =
                                        c.discountType === 'percentage'
                                            ? `${c.value}%${c.maxDiscountAmount > 0 ? ` (max NRS ${c.maxDiscountAmount})` : ''}`
                                            : `NRS ${c.value}`;
                                    const dates = `${c.startsAt ? toInputDate(c.startsAt) : '—'} → ${c.expiresAt ? toInputDate(c.expiresAt) : '—'}`;
                                    return (
                                        <tr key={c._id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 font-semibold text-gray-900">{c.code}</td>
                                            <td className="px-4 py-3 text-gray-700">{discountLabel}</td>
                                            <td className="px-4 py-3 text-gray-700">NRS {Number(c.minOrderAmount || 0).toLocaleString()}</td>
                                            <td className="px-4 py-3 text-gray-700">{usage}</td>
                                            <td className="px-4 py-3 text-gray-700">{dates}</td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                        c.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                                    }`}
                                                >
                                                    {c.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => openEdit(c)}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50"
                                                    >
                                                        <FiEdit2 className="w-4 h-4" />
                                                        Edit
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(c)}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 border border-red-200 text-red-700 rounded-lg hover:bg-red-50"
                                                    >
                                                        <FiTrash2 className="w-4 h-4" />
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {showForm ? (
                <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl border border-gray-200 shadow-xl">
                        <div className="p-5 border-b border-gray-200 flex items-center justify-between">
                            <div className="text-lg font-bold text-gray-900">{formTitle}</div>
                            <button type="button" onClick={closeForm} className="text-gray-500 hover:text-gray-800">
                                Close
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                                <input
                                    value={form.code}
                                    onChange={(e) => onFormChange('code', e.target.value.toUpperCase())}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                    placeholder="SAVE10"
                                />
                            </div>
                            <div className="flex items-end gap-3">
                                <label className="flex items-center gap-2 text-sm text-gray-700">
                                    <input
                                        type="checkbox"
                                        checked={!!form.isActive}
                                        onChange={(e) => onFormChange('isActive', e.target.checked)}
                                        className="h-4 w-4"
                                    />
                                    Active
                                </label>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
                                <input
                                    value={form.description}
                                    onChange={(e) => onFormChange('description', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                    placeholder="10% off on orders above NRS 1000"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type</label>
                                <select
                                    value={form.discountType}
                                    onChange={(e) => onFormChange('discountType', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
                                >
                                    <option value="percentage">Percentage</option>
                                    <option value="fixed">Fixed amount</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Value {form.discountType === 'percentage' ? '(%)' : '(NRS)'}
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={form.value}
                                    onChange={(e) => onFormChange('value', Number(e.target.value))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Max Discount (NRS)</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={form.maxDiscountAmount}
                                    onChange={(e) => onFormChange('maxDiscountAmount', Number(e.target.value))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                    disabled={form.discountType !== 'percentage'}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Min Order (NRS)</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={form.minOrderAmount}
                                    onChange={(e) => onFormChange('minOrderAmount', Number(e.target.value))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Usage Limit (0 = unlimited)</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={form.usageLimit}
                                    onChange={(e) => onFormChange('usageLimit', Number(e.target.value))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Starts At</label>
                                <input
                                    type="date"
                                    value={form.startsAt}
                                    onChange={(e) => onFormChange('startsAt', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Expires At</label>
                                <input
                                    type="date"
                                    value={form.expiresAt}
                                    onChange={(e) => onFormChange('expiresAt', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>

                            <div className="md:col-span-2 flex items-center justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={closeForm}
                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-5 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-60"
                                >
                                    {saving ? 'Saving…' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            ) : null}
        </Wrapper>
    );
};

export default CouponsManager;

