import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Coffee, ShoppingBag, CheckCircle, AlertCircle, ToggleLeft, ToggleRight, ScanLine } from 'lucide-react';
import { api } from '../../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Scanner } from '@yudiel/react-qr-scanner';
import Badge from '../../components/ui/Badge';
import CustomTable from '../../components/ui/CustomTable';
import Skeleton from '../../components/ui/Skeleton';

const EMPTY_FORM = { name: '', description: '', price: '', category: '', isAvailable: true };
const CATEGORIES = ['Mains', 'Beverages', 'Snacks', 'Desserts', 'Breakfast', 'Other'];
const ORDER_STATUSES = ['PENDING', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'];

export default function AdminCanteenPage() {
    const [activeTab, setActiveTab] = useState('menu');
    const [menuItems, setMenuItems] = useState([]);
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editItem, setEditItem] = useState(null); // null = create, object = edit
    const [form, setForm] = useState(EMPTY_FORM);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [toast, setToast] = useState('');
    const [scannedOrder, setScannedOrder] = useState(null);

    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

    const fetchAll = async () => {
        try {
            const [menuData, ordersData] = await Promise.all([
                api.get('/canteen/menu/all'),
                api.get('/canteen/orders')
            ]);
            setMenuItems(menuData);
            setOrders(ordersData);
        } catch (err) {
            console.error('AdminCanteen fetch error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchAll(); }, []);

    // ── Modal helpers ──────────────────────────────────────────
    const openCreate = () => { setEditItem(null); setForm(EMPTY_FORM); setError(''); setShowModal(true); };
    const openEdit = (item) => { setEditItem(item); setForm({ name: item.name, description: item.description, price: item.price.toString(), category: item.category, isAvailable: item.isAvailable }); setError(''); setShowModal(true); };
    const closeModal = () => { setShowModal(false); setError(''); };

    // ── CRUD handlers ──────────────────────────────────────────
    const handleSave = async (e) => {
        e.preventDefault();
        if (!form.name || !form.price || !form.category) { setError('Name, price, and category are required.'); return; }
        setSubmitting(true);
        try {
            if (editItem) {
                await api.put(`/canteen/menu/${editItem.id}`, { ...form, price: parseFloat(form.price) });
                showToast('Menu item updated!');
            } else {
                await api.post('/canteen/menu', { ...form, price: parseFloat(form.price) });
                showToast('New item added to menu!');
            }
            closeModal();
            await fetchAll();
        } catch (err) {
            setError('Failed to save. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (item) => {
        if (!window.confirm(`Delete "${item.name}"? This cannot be undone.`)) return;
        try {
            await api.delete(`/canteen/menu/${item.id}`);
            showToast(`"${item.name}" removed.`);
            await fetchAll();
        } catch (err) {
            showToast('Failed to delete item.');
        }
    };

    const handleToggleAvailability = async (item) => {
        try {
            await api.put(`/canteen/menu/${item.id}`, { isAvailable: !item.isAvailable });
            showToast(item.isAvailable ? `"${item.name}" hidden from menu.` : `"${item.name}" is now available.`);
            await fetchAll();
        } catch (err) { showToast('Failed to update.'); }
    };

    const handleOrderStatus = async (orderId, status) => {
        try {
            await api.put(`/canteen/orders/${orderId}/status`, { status });
            showToast('Order status updated.');
            await fetchAll();
        } catch (err) { showToast('Failed to update order status.'); }
    };

    // ── Badges ─────────────────────────────────────────────────
    const getOrderBadge = (status) => {
        const map = { PENDING: 'warning', PREPARING: 'info', READY: 'primary', COMPLETED: 'success', CANCELLED: 'danger' };
        return <Badge variant={map[status] || 'outline'}>{status}</Badge>;
    };

    // ── Menu Stats ─────────────────────────────────────────────
    const availableCount = menuItems.filter(i => i.isAvailable).length;
    const pendingOrdersCount = orders.filter(o => o.status === 'PENDING' || o.status === 'PREPARING').length;
    const totalRevenue = orders.filter(o => o.status === 'COMPLETED').reduce((s, o) => s + o.total, 0);

    if (isLoading) return (
        <div className="animate-fade-in">
            <Skeleton width="220px" height="38px" className="mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {[1, 2, 3].map(i => <div key={i} className="card h-[100px]"><Skeleton width="80%" height="24px" /></div>)}
            </div>
            <Skeleton width="100%" height="300px" />
        </div>
    );

    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                        style={{ position: 'fixed', top: '88px', right: '24px', zIndex: 9999, background: 'var(--text-main)', color: 'white', padding: '12px 20px', borderRadius: '12px', fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', boxShadow: 'var(--shadow-xl)' }}
                    >
                        <CheckCircle size={16} /> {toast}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Canteen Management</h1>
                    <p className="page-subtitle">Manage menu items and monitor all orders in real time.</p>
                </div>
                {activeTab === 'menu' && (
                    <div className="header-actions">
                        <button className="btn btn-primary" onClick={openCreate}>
                            <Plus size={18} /> Add Menu Item
                        </button>
                    </div>
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[
                    { icon: <Coffee size={22} />, label: 'Menu Items', value: menuItems.length, sub: `${availableCount} available`, color: 'var(--primary-color)' },
                    { icon: <ShoppingBag size={22} />, label: 'Active Orders', value: pendingOrdersCount, sub: 'pending or preparing', color: 'var(--warning)' },
                    { icon: <CheckCircle size={22} />, label: 'Total Revenue', value: `₹${totalRevenue.toFixed(2)}`, sub: 'from completed orders', color: 'var(--success)' },
                ].map(({ icon, label, value, sub, color }) => (
                    <div key={label} className="card glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px 24px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: `${color}18`, color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{icon}</div>
                        <div>
                            <p style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>{label}</p>
                            <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', margin: '2px 0 0', letterSpacing: '-0.03em' }}>{value}</p>
                            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>{sub}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', borderBottom: '1px solid var(--border-color)' }}>
                {[
                    { key: 'menu', label: `Menu (${menuItems.length})`, icon: <Coffee size={16} /> }, 
                    { key: 'orders', label: `Orders (${orders.length})`, icon: <ShoppingBag size={16} /> },
                    { key: 'scanner', label: `Scanner`, icon: <ScanLine size={16} /> }
                ].map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '10px 20px', fontSize: '0.9rem', fontWeight: 600,
                            background: 'transparent', border: 'none',
                            borderBottom: `2px solid ${activeTab === tab.key ? 'var(--primary-color)' : 'transparent'}`,
                            color: activeTab === tab.key ? 'var(--primary-color)' : 'var(--text-muted)',
                            cursor: 'pointer', transition: 'all 0.2s', marginBottom: '-1px'
                        }}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            {/* ─── MENU TAB ─────────────────────────────────────────── */}
            {activeTab === 'menu' && (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <CustomTable
                        columns={[
                            { key: 'item', header: 'Item' },
                            { key: 'category', header: 'Category' },
                            { key: 'price', header: 'Price' },
                            { key: 'status', header: 'Available' },
                            { key: 'actions', header: 'Actions' }
                        ]}
                        data={menuItems.map(item => ({
                            item: (
                                <div>
                                    <p style={{ fontWeight: 700, color: 'var(--text-main)', margin: '0 0 2px' }}>{item.name}</p>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>{item.description}</p>
                                </div>
                            ),
                            category: <Badge variant="info">{item.category}</Badge>,
                            price: <span style={{ fontWeight: 700, color: 'var(--primary-color)', fontFamily: 'Outfit, sans-serif', fontSize: '1rem' }}>₹{item.price.toFixed(2)}</span>,
                            status: (
                                <button
                                    onClick={() => handleToggleAvailability(item)}
                                    title={item.isAvailable ? 'Click to hide' : 'Click to make available'}
                                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: item.isAvailable ? 'var(--success)' : 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem', padding: '4px 0' }}
                                >
                                    {item.isAvailable ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                                    {item.isAvailable ? 'Available' : 'Hidden'}
                                </button>
                            ),
                            actions: (
                                <div style={{ display: 'flex', gap: '6px' }}>
                                    <button onClick={() => openEdit(item)} style={{ padding: '7px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--surface-color)', color: 'var(--primary-color)', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', transition: 'all 0.2s' }}>
                                        <Pencil size={14} /> Edit
                                    </button>
                                    <button onClick={() => handleDelete(item)} style={{ padding: '7px 14px', borderRadius: '8px', border: '1px solid var(--danger-bg)', background: 'var(--danger-bg)', color: 'var(--danger)', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', transition: 'all 0.2s' }}>
                                        <Trash2 size={14} /> Delete
                                    </button>
                                </div>
                            )
                        }))}
                        emptyMessage="No menu items yet. Click 'Add Menu Item' to get started."
                    />
                </div>
            )}

            {/* ─── ORDERS TAB ───────────────────────────────────────── */}
            {activeTab === 'orders' && (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <CustomTable
                        columns={[
                            { key: 'id', header: 'Order ID' },
                            { key: 'student', header: 'Student' },
                            { key: 'items', header: 'Items' },
                            { key: 'total', header: 'Total' },
                            { key: 'status', header: 'Status' },
                            { key: 'action', header: 'Update' },
                            { key: 'date', header: 'Placed At' }
                        ]}
                        data={orders.map(order => ({
                            id: <span style={{ fontFamily: 'monospace', fontSize: '0.78rem', background: 'var(--bg-color)', padding: '2px 8px', borderRadius: '6px', color: 'var(--text-muted)' }}>#{order.id.substring(0, 8)}</span>,
                            student: <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{order.user?.name || 'Unknown'}</span>,
                            items: (
                                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', maxWidth: '200px', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {order.items?.map(i => `${i.menuItem?.name || 'Item'} x${i.quantity}`).join(', ')}
                                </span>
                            ),
                            total: <span style={{ fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: 'var(--success)' }}>₹{order.total.toFixed(2)}</span>,
                            status: getOrderBadge(order.status),
                            action: (
                                <select
                                    value={order.status}
                                    onChange={e => handleOrderStatus(order.id, e.target.value)}
                                    style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--surface-color)', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)', cursor: 'pointer', outline: 'none', fontFamily: 'Inter, sans-serif' }}
                                >
                                    {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            ),
                            date: <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(order.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        }))}
                        emptyMessage="No orders placed yet."
                    />
                </div>
            )}

            {/* ─── SCANNER TAB ───────────────────────────────────────── */}
            {activeTab === 'scanner' && (
                <div className="card glass-card" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
                    <h2 className="text-xl font-bold mb-4 flex items-center justify-center gap-2">
                        <ScanLine className="text-primary" /> Scan Pickup QR
                    </h2>
                    {!scannedOrder ? (
                         <div style={{ borderRadius: '16px', overflow: 'hidden', border: '5px solid var(--border-color)', margin: '0 20px' }}>
                            <Scanner
                                onScan={(result) => {
                                    if(result && result[0]) {
                                        const id = result[0].rawValue;
                                        const order = orders.find(o => o.id === id);
                                        if(order) setScannedOrder(order);
                                        else showToast('Order not found or invalid QR!');
                                    }
                                }}
                            />
                        </div>
                    ) : (
                        <div className="text-left bg-surface-color p-6 rounded-xl border border-border-color shadow-sm mt-4">
                            <div className="flex justify-between items-center mb-4 pb-4 border-b border-border-color">
                                <div>
                                    <h3 className="font-bold text-lg text-main">Order #{scannedOrder.id.substring(0, 8)}</h3>
                                    <p className="text-muted text-sm">Student: {scannedOrder.user?.name || 'Unknown'}</p>
                                </div>
                                {getOrderBadge(scannedOrder.status)}
                            </div>
                            <div className="mb-6 space-y-2">
                                {scannedOrder.items?.map(i => (
                                    <div key={i.id} className="flex justify-between items-center text-sm font-medium">
                                        <span>{i.menuItem?.name} <span className="text-muted text-xs ml-2">x{i.quantity}</span></span>
                                        <span>₹{(i.price * i.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between items-center pt-4 border-t border-border-color mb-6">
                                <span className="font-bold">Total Paid</span>
                                <span className="font-bold text-xl text-primary">₹{scannedOrder.total.toFixed(2)}</span>
                            </div>
                            <div className="flex gap-4">
                                <button
                                    className="btn btn-secondary flex-1"
                                    onClick={() => setScannedOrder(null)}
                                >
                                    Cancel scan
                                </button>
                                <button
                                    className="btn btn-primary flex-1 items-center justify-center"
                                    onClick={() => {
                                        handleOrderStatus(scannedOrder.id, 'COMPLETED');
                                        setScannedOrder(null);
                                    }}
                                    disabled={scannedOrder.status === 'COMPLETED' || scannedOrder.status === 'CANCELLED'}
                                >
                                    Confirm Pickup
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ─── ADD / EDIT MODAL ─────────────────────────────────── */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="modal-overlay" onClick={closeModal}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 30 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                            className="modal-card" onClick={e => e.stopPropagation()}
                        >
                            <div className="modal-card-header">
                                <div className="modal-card-header-icon"><Coffee size={22} /></div>
                                <div>
                                    <h2 className="modal-card-title">{editItem ? 'Edit Menu Item' : 'Add Menu Item'}</h2>
                                    <p className="modal-card-subtitle">{editItem ? 'Update the item details below.' : 'Fill in the details for a new menu item.'}</p>
                                </div>
                                <button className="modal-card-close" onClick={closeModal}><X size={18} /></button>
                            </div>

                            <form onSubmit={handleSave} className="modal-card-body">
                                <AnimatePresence>
                                    {error && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="modal-error">
                                            <AlertCircle size={16} /> {error}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="form-group">
                                    <label className="form-label">Item Name</label>
                                    <input className="form-input" placeholder="e.g., Classic Burger" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Description</label>
                                    <textarea className="form-textarea" rows={2} placeholder="Short description of the item..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div className="form-group">
                                        <label className="form-label">Price (₹)</label>
                                        <input className="form-input" type="number" step="0.01" min="0" placeholder="e.g., 60.00" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Category</label>
                                        <select className="form-input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                                            <option value="">Select category...</option>
                                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Availability</label>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        {[true, false].map(val => (
                                            <button
                                                key={String(val)} type="button"
                                                onClick={() => setForm({ ...form, isAvailable: val })}
                                                style={{
                                                    flex: 1, padding: '10px', borderRadius: '12px', border: `1.5px solid ${form.isAvailable === val ? 'var(--primary-color)' : 'var(--border-color)'}`,
                                                    background: form.isAvailable === val ? 'var(--primary-light)' : 'var(--surface-color)',
                                                    color: form.isAvailable === val ? 'var(--primary-color)' : 'var(--text-muted)',
                                                    fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', transition: 'all 0.2s'
                                                }}
                                            >
                                                {val ? '✅ Available' : '🚫 Hidden'}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="modal-card-actions">
                                    <button type="button" className="btn-modal-cancel" onClick={closeModal}>Cancel</button>
                                    <button type="submit" className="btn-modal-submit" disabled={submitting}>
                                        {submitting ? <><span className="btn-spinner" /> Saving...</> : <>{editItem ? <><Pencil size={16} /> Update Item</> : <><Plus size={16} /> Add Item</>}</>}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
