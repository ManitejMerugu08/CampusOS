import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, X, CheckCircle, Coffee, QrCode } from 'lucide-react';
import QRCode from 'react-qr-code';
import Badge from '../../components/ui/Badge';
import CustomTable from '../../components/ui/CustomTable';
import { api } from '../../utils/api';

const CanteenPage = () => {
    const [menuItems, setMenuItems] = useState([]);
    const [orders, setOrders] = useState([]);
    const [cart, setCart] = useState([]); // [{ item, quantity }]
    const [isLoading, setIsLoading] = useState(true);
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [activeTab, setActiveTab] = useState('menu');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [menu, myOrders] = await Promise.all([
                    api.get('/canteen/menu'),
                    api.get('/canteen/orders'),
                ]);
                setMenuItems(menu);
                setOrders(myOrders);
            } catch (err) {
                console.error('Canteen fetch error:', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const addToCart = (item) => {
        setCart(prev => {
            const existing = prev.find(c => c.item.id === item.id);
            if (existing) return prev.map(c => c.item.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
            return [...prev, { item, quantity: 1 }];
        });
    };

    const removeFromCart = (itemId) => {
        setCart(prev => prev.filter(c => c.item.id !== itemId));
    };

    const changeQty = (itemId, delta) => {
        setCart(prev => prev.map(c => {
            if (c.item.id !== itemId) return c;
            const newQty = c.quantity + delta;
            return newQty < 1 ? null : { ...c, quantity: newQty };
        }).filter(Boolean));
    };

    const cartTotal = cart.reduce((sum, c) => sum + c.item.price * c.quantity, 0);
    const cartCount = cart.reduce((sum, c) => sum + c.quantity, 0);

    const placeOrder = async () => {
        if (cart.length === 0) return;
        try {
            const items = cart.map(c => ({ menuItemId: c.item.id, quantity: c.quantity }));
            await api.post('/canteen/orders', { items });
            const updatedOrders = await api.get('/canteen/orders');
            setOrders(updatedOrders);
            setCart([]);
            setOrderSuccess(true);
            setTimeout(() => setOrderSuccess(false), 3000);
            setActiveTab('orders');
        } catch (err) {
            console.error('Order failed:', err);
        }
    };

    const categories = [...new Set(menuItems.map(i => i.category))];

    const getOrderBadge = (status) => {
        const map = { PENDING: 'warning', PREPARING: 'info', READY: 'success', COMPLETED: 'outline', CANCELLED: 'danger' };
        return <Badge variant={map[status] || 'outline'}>{status}</Badge>;
    };

    if (isLoading) return <div className="p-8 text-center text-muted">Loading canteen...</div>;

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Smart Canteen</h1>
                    <p className="page-subtitle">Browse the menu and place your order.</p>
                </div>
                <div className="header-actions">
                    {cartCount > 0 && (
                        <button className="btn btn-primary" onClick={() => setActiveTab('cart')}>
                            <ShoppingCart size={18} /> Cart ({cartCount}) · ₹{cartTotal.toFixed(2)}
                        </button>
                    )}
                </div>
            </div>

            {orderSuccess && (
                <div className="card mb-6 flex items-center gap-3" style={{ background: 'var(--success-bg)', borderColor: 'var(--success)', color: 'var(--success)' }}>
                    <CheckCircle size={20} />
                    <span className="font-semibold">Order placed successfully! Check your order history below.</span>
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-border-color pb-0">
                {['menu', 'cart', 'orders'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`capitalize px-5 py-2.5 font-semibold transition-colors border-b-2 ${activeTab === tab ? 'text-primary' : 'border-transparent text-muted hover:text-main'}`}
                        style={{
                            fontSize: '0.9rem',
                            borderColor: activeTab === tab ? 'var(--primary-color)' : 'transparent',
                            color: activeTab === tab ? 'var(--primary-color)' : undefined
                        }}
                    >
                        {tab === 'cart' ? `Cart (${cartCount})` : tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            {/* MENU TAB */}
            {activeTab === 'menu' && (
                <div>
                    {categories.map(cat => (
                        <div key={cat} className="mb-8">
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <Coffee size={18} className="text-primary" /> {cat}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {menuItems.filter(i => i.category === cat).map(item => {
                                    const inCart = cart.find(c => c.item.id === item.id);
                                    return (
                                        <div key={item.id} className="card glass-card flex flex-col gap-3 hover-lift" style={{ padding: '1.2rem' }}>
                                            {item.image && (
                                                <div style={{ height: '160px', width: '100%', overflow: 'hidden', borderRadius: '12px', marginBottom: '8px' }}>
                                                    <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                </div>
                                            )}
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-bold text-[1.05rem] tracking-tight">{item.name}</p>
                                                    <p className="text-muted text-[0.85rem] mt-1 leading-snug">{item.description}</p>
                                                </div>
                                                <Badge variant="info">{item.category}</Badge>
                                            </div>
                                            <div className="flex justify-between items-center mt-auto pt-4 border-t border-border-color">
                                                <span className="font-bold text-xl text-primary">₹{item.price.toFixed(2)}</span>
                                                {inCart ? (
                                                    <div className="flex items-center gap-2">
                                                        <button className="btn btn-ghost" style={{ padding: '6px' }} onClick={() => changeQty(item.id, -1)}><Minus size={16} /></button>
                                                        <span className="font-bold w-6 text-center">{inCart.quantity}</span>
                                                        <button className="btn btn-ghost" style={{ padding: '6px' }} onClick={() => changeQty(item.id, 1)}><Plus size={16} /></button>
                                                    </div>
                                                ) : (
                                                    <button className="btn btn-primary btn-sm" onClick={() => addToCart(item)}>
                                                        <Plus size={16} /> ADD TO CART
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* CART TAB */}
            {activeTab === 'cart' && (
                <div className="card glass-card max-w-2xl">
                    <h2 className="text-lg font-bold mb-6">Your Cart</h2>
                    {cart.length === 0 ? (
                        <p className="text-muted text-center py-8">Your cart is empty. Browse the menu to add items!</p>
                    ) : (
                        <>
                            <div className="flex flex-col gap-3 mb-6">
                                {cart.map(({ item, quantity }) => (
                                    <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-bg-color border border-border-color">
                                        <div>
                                            <p className="font-semibold">{item.name}</p>
                                            <p className="text-muted text-sm">₹{item.price.toFixed(2)} each</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-2">
                                                <button className="btn btn-ghost" style={{ padding: '4px' }} onClick={() => changeQty(item.id, -1)}><Minus size={14} /></button>
                                                <span className="font-bold">{quantity}</span>
                                                <button className="btn btn-ghost" style={{ padding: '4px' }} onClick={() => changeQty(item.id, 1)}><Plus size={14} /></button>
                                            </div>
                                            <span className="font-bold text-primary w-20 text-right">₹{(item.price * quantity).toFixed(2)}</span>
                                            <button className="btn btn-ghost text-muted" style={{ padding: '4px' }} onClick={() => removeFromCart(item.id)}><X size={16} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t border-border-color pt-4 flex justify-between items-center mb-4">
                                <span className="font-bold text-lg">Total</span>
                                <span className="font-bold text-xl text-primary">₹{cartTotal.toFixed(2)}</span>
                            </div>
                            <button className="btn btn-primary w-full" onClick={placeOrder}>
                                <CheckCircle size={18} /> Place Order
                            </button>
                        </>
                    )}
                </div>
            )}

            {/* ORDERS TAB */}
            {activeTab === 'orders' && (
                <div className="card">
                    <h2 className="text-lg font-bold mb-6">My Order History</h2>
                    {orders.length === 0 ? (
                        <p className="text-muted text-center py-8">No orders yet. Go order something!</p>
                    ) : (
                        <CustomTable
                            columns={[
                                { key: 'qr', header: 'Pick-Up QR' },
                                { key: 'items', header: 'Items' },
                                { key: 'total', header: 'Total' },
                                { key: 'status', header: 'Status' },
                                { key: 'date', header: 'Date' }
                            ]}
                            data={orders.map(order => ({
                                qr: <div style={{ background: 'white', padding: '4px', borderRadius: '4px', display: 'inline-block', border: '1px solid var(--border-color)' }}>
                                        <QRCode value={order.id} size={48} level="L" />
                                    </div>,
                                items: <span className="font-medium" style={{ fontSize: '0.85rem' }}>{order.items.map(i => `${i.menuItem?.name} x${i.quantity}`).join(', ')}</span>,
                                total: <span className="font-bold text-primary">₹{order.total.toFixed(2)}</span>,
                                status: getOrderBadge(order.status),
                                date: <span className="text-muted" style={{ fontSize: '0.85rem' }}>{new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            }))}
                            emptyMessage="No orders found."
                        />
                    )}
                </div>
            )}
        </div>
    );
};

export default CanteenPage;
