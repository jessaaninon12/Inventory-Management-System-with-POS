import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Boxes, 
  Truck, 
  Users, 
  FileText, 
  Store, 
  Moon, 
  Sun, 
  LogOut,
  RefreshCw,
  ArrowRight,
  Download,
  AlertTriangle,
  ClipboardList,
  History,
  Trash2,
  Barcode,
  CheckCircle2,
  UserCircle,
  Settings,
  Plus,
  Search,
  Minus,
  X,
  Menu,
  Eye,
  EyeOff,
  Lock,
  CreditCard
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Section, User, Product, CartItem } from './types';
import { MOCK_PRODUCTS, MOCK_SALES, MOCK_USERS, LOW_STOCK_THRESHOLD } from './constants';
import { api } from './services/api';

// --- Hooks ---

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// --- Components ---

const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative bg-main-bg border border-main-border rounded-[40px] p-8 max-w-lg w-full shadow-2xl overflow-hidden"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-medium text-login-text">{title}</h3>
            <button onClick={onClose} className="p-2 hover:bg-badge-bg rounded-full transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
          {children}
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

const Toast = ({ message, visible }: { message: string, visible: boolean }) => (
  <AnimatePresence>
    {visible && (
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.9 }}
        className="fixed bottom-8 right-8 bg-toast-bg text-white px-6 py-3 rounded-full shadow-2xl z-[9999] flex items-center gap-2"
      >
        <span>✨</span> {message}
      </motion.div>
    )}
  </AnimatePresence>
);

const SidebarItem = ({ 
  icon: Icon, 
  label, 
  active, 
  onClick 
}: { 
  icon: any, 
  label: string, 
  active: boolean, 
  onClick: () => void 
}) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-xl transition-all duration-200 group ${
      active 
        ? 'bg-nav-item-active-bg text-btn-primary border border-nav-item-active-border shadow-sm' 
        : 'text-nav-item hover:bg-nav-item-hover-bg hover:text-btn-primary'
    }`}
  >
    <Icon className={`w-5 h-5 transition-colors ${active ? 'text-btn-primary' : 'text-nav-item group-hover:text-btn-primary'}`} />
    <span className="font-medium text-sm">{label}</span>
  </button>
);

const StatCard = ({ title, value, sub, icon: Icon, actionLabel, onAction }: any) => (
  <div className="bg-card-bg rounded-[30px] p-6 border border-card-border flex flex-col">
    <div className="flex justify-between items-start text-text-secondary text-sm">
      {title} <Icon className="w-4 h-4" />
    </div>
    <div className="text-4xl font-medium text-login-text my-3">{value}</div>
    <div className="text-xs text-text-secondary">{sub}</div>
    <button 
      onClick={onAction}
      className="mt-4 bg-badge-bg border border-input-border rounded-full px-4 py-2 text-xs text-badge-color inline-flex items-center gap-2 hover:brightness-95 self-start"
    >
      {actionLabel} <ArrowRight className="w-3 h-3" />
    </button>
  </div>
);

const ProductForm = ({ 
  initialData, 
  onSubmit, 
  onCancel, 
  submitLabel 
}: { 
  initialData?: Partial<Product>, 
  onSubmit: (data: Omit<Product, 'id'>) => void, 
  onCancel: () => void,
  submitLabel: string
}) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    price: initialData?.price || 0,
    stock: initialData?.stock || 0,
    category: initialData?.category || '',
    lowStockThreshold: initialData?.lowStockThreshold || LOW_STOCK_THRESHOLD
  });

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      onSubmit(formData);
    }} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="text-xs font-bold text-text-secondary uppercase mb-1 block">Product Name</label>
          <input 
            required 
            type="text" 
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 bg-input-bg border border-input-border rounded-xl outline-none focus:border-btn-primary" 
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-text-secondary uppercase mb-1 block">Price ($)</label>
            <input 
              required 
              type="number" 
              step="0.01" 
              value={formData.price}
              onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
              className="w-full px-4 py-3 bg-input-bg border border-input-border rounded-xl outline-none focus:border-btn-primary" 
            />
          </div>
          <div>
            <label className="text-xs font-bold text-text-secondary uppercase mb-1 block">Initial Stock</label>
            <input 
              required 
              type="number" 
              value={formData.stock}
              onChange={e => setFormData({ ...formData, stock: Number(e.target.value) })}
              className="w-full px-4 py-3 bg-input-bg border border-input-border rounded-xl outline-none focus:border-btn-primary" 
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-text-secondary uppercase mb-1 block">Category</label>
            <select 
              required
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-3 bg-input-bg border border-input-border rounded-xl outline-none focus:border-btn-primary"
            >
              <option value="">Select Category</option>
              <option>Beverage</option>
              <option>Canned Goods</option>
              <option>Instant Food</option>
              <option>Snacks</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-text-secondary uppercase mb-1 block">Low Stock Threshold</label>
            <input 
              required 
              type="number" 
              value={formData.lowStockThreshold}
              onChange={e => setFormData({ ...formData, lowStockThreshold: Number(e.target.value) })}
              className="w-full px-4 py-3 bg-input-bg border border-input-border rounded-xl outline-none focus:border-btn-primary" 
            />
          </div>
        </div>
      </div>
      <div className="flex gap-4 pt-4">
        <button 
          type="button" 
          onClick={onCancel}
          className="flex-1 px-6 py-3 border border-input-border rounded-xl font-bold hover:bg-badge-bg transition-colors"
        >
          Cancel
        </button>
        <button 
          type="submit"
          className="flex-1 bg-btn-primary hover:bg-btn-primary-hover text-white py-3 rounded-xl font-bold shadow-lg transition-all active:scale-95"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
};

// --- Main App ---

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeSection, setActiveSection] = useState<Section>('dashboard');
  const [toast, setToast] = useState({ message: '', visible: false });
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('password');
  const [selectedRole, setSelectedRole] = useState<User['role']>('Admin');
  const [showPassword, setShowPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [loginError, setLoginError] = useState('');
  
  // New States
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [inventoryProducts, setInventoryProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [itemToRemove, setItemToRemove] = useState<CartItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [dashboardDetail, setDashboardDetail] = useState<'sales' | 'revenue' | 'products' | 'credits' | null>(null);
  const [showTopSelling, setShowTopSelling] = useState(false);
  const [showLowStock, setShowLowStock] = useState(false);
  const [showPendingPOs, setShowPendingPOs] = useState(false);
  const [showRecentStock, setShowRecentStock] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [pendingPOs, setPendingPOs] = useState([
    { id: '1', name: 'PO#2312', vendor: 'San Miguel Corp', items: 'Pale Pilsen x100', date: '2026-02-26' },
    { id: '2', name: 'PO#2313', vendor: 'CDO Foodsphere', items: 'Century Tuna x50', date: '2026-02-27' },
    { id: '3', name: 'PO#2314', vendor: 'Monde Nissin', items: 'Lucky Me Noodles x200', date: '2026-02-28' },
  ]);

  const topSellingData = [
    { name: 'Liboog', amount: 480, sold: 6, color: 'bg-btn-primary' },
    { name: 'Pale Pilsen', amount: 276, sold: 6, color: 'bg-emerald-500' },
    { name: 'Century Tuna', amount: 210, sold: 6, color: 'bg-amber-500' },
    { name: 'Lucky Me Noodles', amount: 120, sold: 8, color: 'bg-purple-500' },
    { name: 'Nescafe 3-in-1', amount: 100, sold: 10, color: 'bg-pink-500' },
  ];

  const recentStocksData = [
    { product: 'Liboog', change: '+24', date: '2026-02-28T14:30:00' },
    { product: 'Pale Pilsen', change: '+15', date: '2026-02-27T10:00:00' },
    { product: 'Century Tuna', change: '+45', date: '2026-02-26T09:15:00' },
    { product: 'Lucky Me Noodles', change: '+10', date: '2026-02-25T11:00:00' },
    { product: 'Nescafe 3-in-1', change: '+300', date: '2026-02-24T08:30:00' },
  ];

  const filteredProducts = useMemo(() => {
    return inventoryProducts.filter(p => 
      p.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) || 
      p.category.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
    );
  }, [inventoryProducts, debouncedSearchQuery]);

  const lowStockItems = useMemo(() => {
    return inventoryProducts.filter(p => p.stock < (p.lowStockThreshold || LOW_STOCK_THRESHOLD));
  }, [inventoryProducts]);

  // API Integration
  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const products = await api.get('/products/');
      setInventoryProducts(products);
    } catch (err) {
      console.warn('Backend not reachable, using mock data');
      setInventoryProducts(MOCK_PRODUCTS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddProduct = async (newProduct: Omit<Product, 'id'>) => {
    try {
      const created = await api.post('/products/', newProduct);
      setInventoryProducts([...inventoryProducts, created]);
      showToast('Product added successfully');
    } catch (err) {
      // Fallback
      const mockId = Math.random().toString(36).substr(2, 9);
      setInventoryProducts([...inventoryProducts, { ...newProduct, id: mockId }]);
      showToast('Product added (Local)');
    }
    setIsAddingProduct(false);
  };

  const handleUpdateProduct = async (id: string, updatedProduct: Omit<Product, 'id'>) => {
    try {
      const updated = await api.put(`/products/${id}/`, updatedProduct);
      setInventoryProducts(inventoryProducts.map(p => p.id === id ? updated : p));
      showToast('Product updated successfully');
    } catch (err) {
      // Fallback
      setInventoryProducts(inventoryProducts.map(p => p.id === id ? { ...updatedProduct, id } : p));
      showToast('Product updated (Local)');
    }
    setEditingProduct(null);
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/products/${id}/`);
        setInventoryProducts(inventoryProducts.filter(p => p.id !== id));
        showToast('Product deleted');
      } catch (err) {
        // Fallback
        setInventoryProducts(inventoryProducts.filter(p => p.id !== id));
        showToast('Product deleted (Local)');
      }
    }
  };

  const showToast = (msg: string) => {
    setToast({ message: msg, visible: true });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 2000);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() && password.trim()) {
      setCurrentUser({ 
        username, 
        role: selectedRole,
        firstName: 'Demo',
        surname: 'User',
        email: 'demo@example.com',
        phone: '09123456789',
        address: '123 Sari-Sari St.'
      });
      setIsLoggedIn(true);
      showToast(`Logged in as ${selectedRole}`);
    } else {
      setLoginError('Please enter a username and password');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const pass = formData.get('password') as string;
    const confirmPass = formData.get('confirmPassword') as string;

    if (pass !== confirmPass) {
      showToast('Passwords do not match');
      return;
    }

    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      username: formData.get('email') as string,
      firstName: formData.get('firstName') as string,
      surname: formData.get('surname') as string,
      role: formData.get('role') as User['role'],
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      address: formData.get('address') as string,
    };

    setUsers([...users, newUser]);
    showToast('Account created successfully!');
    setIsRegistering(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setActiveSection('dashboard');
    showToast('Logged out');
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    showToast(isDarkMode ? 'Light mode enabled' : 'Dark mode enabled');
  };

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!isLoggedIn) {
    if (isRegistering) {
      return (
        <div className="fixed inset-0 bg-bg-login flex items-center justify-center z-[1000] p-4 overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-login-card-bg backdrop-blur-xl rounded-[40px] p-8 max-w-[500px] w-full border border-white/20 shadow-2xl my-8"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-login-text">Create Account</h2>
              <button onClick={() => setIsRegistering(false)} className="p-2 hover:bg-badge-bg rounded-full">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-text-secondary uppercase mb-1 block">First Name</label>
                  <input name="firstName" required type="text" className="w-full px-4 py-3 bg-input-bg border border-input-border rounded-xl outline-none focus:border-btn-primary" />
                </div>
                <div>
                  <label className="text-xs font-bold text-text-secondary uppercase mb-1 block">Surname</label>
                  <input name="surname" required type="text" className="w-full px-4 py-3 bg-input-bg border border-input-border rounded-xl outline-none focus:border-btn-primary" />
                </div>
              </div>
              
              <div>
                <label className="text-xs font-bold text-text-secondary uppercase mb-1 block">User Type</label>
                <select name="role" className="w-full px-4 py-3 bg-input-bg border border-input-border rounded-xl outline-none focus:border-btn-primary">
                  <option>Admin</option>
                  <option>Manager</option>
                  <option>CEO</option>
                  <option>Staff Worker</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-text-secondary uppercase mb-1 block">Email</label>
                <input name="email" required type="email" className="w-full px-4 py-3 bg-input-bg border border-input-border rounded-xl outline-none focus:border-btn-primary" />
              </div>

              <div>
                <label className="text-xs font-bold text-text-secondary uppercase mb-1 block">Phone Number</label>
                <input name="phone" required type="tel" className="w-full px-4 py-3 bg-input-bg border border-input-border rounded-xl outline-none focus:border-btn-primary" />
              </div>

              <div>
                <label className="text-xs font-bold text-text-secondary uppercase mb-1 block">Address</label>
                <textarea name="address" required className="w-full px-4 py-3 bg-input-bg border border-input-border rounded-xl outline-none focus:border-btn-primary h-20 resize-none"></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-text-secondary uppercase mb-1 block">Input Password</label>
                  <input name="password" required type="password" className="w-full px-4 py-3 bg-input-bg border border-input-border rounded-xl outline-none focus:border-btn-primary" />
                </div>
                <div>
                  <label className="text-xs font-bold text-text-secondary uppercase mb-1 block">Confirm Password</label>
                  <input name="confirmPassword" required type="password" className="w-full px-4 py-3 bg-input-bg border border-input-border rounded-xl outline-none focus:border-btn-primary" />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-btn-primary hover:bg-btn-primary-hover text-white py-4 rounded-xl text-lg font-bold shadow-xl transition-all active:scale-95 mt-4"
              >
                Create
              </button>
            </form>
          </motion.div>
        </div>
      );
    }

    return (
      <div className="fixed inset-0 bg-bg-login flex items-center justify-center z-[1000] p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-login-card-bg backdrop-blur-xl rounded-[60px] p-12 max-w-[440px] w-full border border-white/20 shadow-2xl text-center"
        >
          <div className="w-24 h-24 bg-badge-bg rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-white/30">
            <Store className="w-12 h-12 text-btn-primary" />
          </div>
          <h2 className="text-4xl font-medium text-login-text mb-2">Sari-Sari</h2>
          <p className="text-login-sub mb-4 uppercase font-bold tracking-widest">management system</p>
          
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-btn-primary uppercase">Log In</h3>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username" 
                className="w-full pl-12 pr-6 py-4 bg-input-bg border border-input-border rounded-full text-lg outline-none focus:border-btn-primary focus:ring-4 focus:ring-badge-bg transition-all"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="password" 
                className="w-full pl-12 pr-14 py-4 bg-input-bg border border-input-border rounded-full text-lg outline-none focus:border-btn-primary focus:ring-4 focus:ring-badge-bg transition-all"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-badge-bg rounded-full transition-colors text-text-secondary"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <div className="relative">
              <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as User['role'])}
                className="w-full pl-12 pr-6 py-4 bg-input-bg border border-input-border rounded-full text-lg outline-none focus:border-btn-primary focus:ring-4 focus:ring-badge-bg transition-all appearance-none cursor-pointer"
              >
                <option value="Admin">Admin</option>
                <option value="Manager">Manager</option>
                <option value="CEO">CEO</option>
                <option value="Staff Worker">Staff Worker</option>
              </select>
            </div>
            <button 
              type="submit"
              className="w-full bg-btn-primary hover:bg-btn-primary-hover text-white py-4 rounded-full text-xl font-semibold shadow-xl transition-all active:scale-95 mt-4 flex items-center justify-center gap-2"
            >
              <LogOut className="w-6 h-6 rotate-180" /> Enter dashboard
            </button>
          </form>

          <div className="mt-6">
            <button 
              onClick={() => setIsRegistering(true)}
              className="text-btn-primary font-bold hover:underline"
            >
              Create account below
            </button>
          </div>
          
          {loginError && <p className="text-red-400 mt-4">{loginError}</p>}
          
          <div className="mt-8 bg-badge-bg rounded-full py-3 px-6 text-badge-color border border-dashed border-input-border flex items-center justify-center gap-2 text-sm">
            <Sun className="w-4 h-4" /> demo: any username / password · select role
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen p-4 md:p-8 flex flex-col bg-bg-body">
      <Toast message={toast.message} visible={toast.visible} />
      
      {/* Header Area */}
      <div className="flex justify-between items-center mb-8 max-w-[1600px] w-full mx-auto">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2.5 bg-blue-500 dark:bg-blue-800 border border-blue-500 dark:border-blue-700 rounded-xl text-white hover:bg-white hover:text-blue-500 hover:border-blue-300 dark:hover:bg-blue-900 dark:hover:text-blue-200 dark:hover:border-blue-600 transition-all shadow-sm group"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex flex-col">
            <h1 className="text-xl font-semibold text-login-text tracking-tight">
              {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
            </h1>
            <p className="text-xs text-text-secondary">Sari-Sari Management System</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Real-time UTC Clock */}
          <div className="flex items-center gap-2 px-4 py-2.5 bg-main-bg border border-main-border rounded-xl shadow-sm font-mono">
            <span className="text-sm font-bold text-login-text tracking-wider">
              {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true, timeZone: 'UTC' })}
            </span>
            <span className="text-[9px] text-text-secondary font-bold uppercase">UTC</span>
          </div>

          {/* Logo in Top Right */}
          <div className="flex items-center gap-2.5 px-4 py-2 bg-main-bg border border-main-border rounded-xl shadow-sm mr-2">
            <div className="w-8 h-8 bg-btn-primary rounded-lg flex items-center justify-center">
              <Store className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-base text-login-text tracking-tight">SARI-SARI</span>
          </div>

          <div className="h-8 w-[1px] bg-main-border mx-2"></div>

          <motion.button 
            onClick={toggleTheme}
            whileHover={{ rotate: isDarkMode ? -180 : 180 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="bg-main-bg border border-main-border rounded-full p-2.5 text-text-primary hover:bg-badge-bg transition-all shadow-sm"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </motion.button>
          
          <button 
            onClick={handleLogout}
            className="bg-main-bg border border-main-border rounded-xl px-5 py-2.5 text-sm font-medium text-text-primary hover:bg-badge-bg transition-all flex items-center gap-2 shadow-sm"
          >
            <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>

      <div className="max-w-[1600px] w-full mx-auto flex gap-8 flex-1 relative min-h-0">
        {/* Sidebar */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.aside 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="w-60 flex flex-col gap-1 z-40"
            >
              <SidebarItem 
                icon={LayoutDashboard} 
                label="Dashboard" 
                active={activeSection === 'dashboard'} 
                onClick={() => setActiveSection('dashboard')} 
              />
              <SidebarItem 
                icon={ShoppingCart} 
                label="POS" 
                active={activeSection === 'pos'} 
                onClick={() => setActiveSection('pos')} 
              />
              <SidebarItem 
                icon={Boxes} 
                label="Inventory" 
                active={activeSection === 'inventory'} 
                onClick={() => setActiveSection('inventory')} 
              />
              
              {currentUser?.role === 'Manager' && (
                <SidebarItem 
                  icon={CreditCard} 
                  label="CD" 
                  active={activeSection === 'cd'} 
                  onClick={() => setActiveSection('cd')} 
                />
              )}

              <SidebarItem 
                icon={Truck} 
                label="Stock" 
                active={activeSection === 'stock'} 
                onClick={() => setActiveSection('stock')} 
              />

              {(currentUser?.role === 'Admin' || currentUser?.role === 'CEO' || currentUser?.role === 'Manager') && (
                <SidebarItem 
                  icon={Users} 
                  label="Users" 
                  active={activeSection === 'users'} 
                  onClick={() => setActiveSection('users')} 
                />
              )}

              {(currentUser?.role === 'Admin' || currentUser?.role === 'CEO') && (
                <SidebarItem 
                  icon={FileText} 
                  label="Reports" 
                  active={activeSection === 'reports'} 
                  onClick={() => setActiveSection('reports')} 
                />
              )}
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Panel */}
        <main className={`flex-1 bg-main-bg rounded-3xl border border-main-border shadow-sm overflow-hidden flex flex-col transition-all duration-300 ${!isSidebarOpen ? 'w-full' : ''}`}>
          <div className="flex-1 overflow-y-auto p-8">
            <AnimatePresence mode="wait">
              {activeSection === 'dashboard' && (
                <motion.div 
                  key="dashboard"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-medium text-login-text flex items-center gap-3">
                      <LayoutDashboard className="w-8 h-8" /> Dashboard
                    </h2>
                    <button 
                      onClick={() => showToast('Dashboard refreshed')}
                      className="bg-badge-bg border border-input-border rounded-full px-5 py-2 text-sm text-badge-color flex items-center gap-2 hover:brightness-95"
                    >
                      <RefreshCw className="w-4 h-4" /> refresh
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard 
                      title="Today's Sales" 
                      value="$646.00" 
                      sub="Cash & Credit · +12%" 
                      icon={Sun}
                      actionLabel="view breakdown"
                      onAction={() => setDashboardDetail('sales')}
                    />
                    <StatCard 
                      title="Total Revenue" 
                      value="$646.00" 
                      sub="All-time sales" 
                      icon={ShoppingCart}
                      actionLabel="show chart"
                      onAction={() => setDashboardDetail('revenue')}
                    />
                    <StatCard 
                      title="Total Products" 
                      value="10" 
                      sub="0 low stock · all good" 
                      icon={Boxes}
                      actionLabel="manage"
                      onAction={() => setDashboardDetail('products')}
                    />
                    <StatCard 
                      title="Customer Credits" 
                      value="$0.00" 
                      sub="3 customers · 0 outstanding" 
                      icon={Users}
                      actionLabel="view customers"
                      onAction={() => setDashboardDetail('credits')}
                    />
                  </div>

                  {dashboardDetail && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1100] flex items-center justify-center p-4">
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-main-bg rounded-[40px] border border-main-border shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col"
                      >
                        <div className="p-8 border-b border-main-border flex justify-between items-center bg-card-bg">
                          <h3 className="text-2xl font-bold text-login-text flex items-center gap-3">
                            {dashboardDetail === 'sales' && <><Sun className="w-6 h-6" /> Today's Sales Breakdown</>}
                            {dashboardDetail === 'revenue' && <><ShoppingCart className="w-6 h-6" /> Total Revenue Details</>}
                            {dashboardDetail === 'products' && <><Boxes className="w-6 h-6" /> Product Stock Management</>}
                            {dashboardDetail === 'credits' && <><Users className="w-6 h-6" /> Customer Credits</>}
                          </h3>
                          <button 
                            onClick={() => setDashboardDetail(null)}
                            className="p-2 hover:bg-badge-bg rounded-full transition-colors"
                          >
                            <X className="w-6 h-6" />
                          </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-8">
                          {(dashboardDetail === 'sales' || dashboardDetail === 'revenue') && (
                            <div className="space-y-6">
                              <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                  <thead>
                                    <tr className="border-b border-main-border text-xs font-bold text-text-secondary uppercase tracking-wider">
                                      <th className="pb-4 px-4">ProductID</th>
                                      <th className="pb-4 px-4">Product</th>
                                      <th className="pb-4 px-4">Price</th>
                                      <th className="pb-4 px-4">Timestamp</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-main-border">
                                    {MOCK_SALES.filter(s => dashboardDetail === 'revenue' || s.date.startsWith('2026-02-28')).flatMap(sale => 
                                      sale.items.map((item, idx) => (
                                        <tr key={`${sale.id}-${idx}`} className="text-sm hover:bg-badge-bg/50 transition-colors">
                                          <td className="py-4 px-4 font-mono text-xs">#{item.productId}</td>
                                          <td className="py-4 px-4 font-medium">{item.productName}</td>
                                          <td className="py-4 px-4">${item.price.toFixed(2)}</td>
                                          <td className="py-4 px-4 text-text-secondary">
                                            {new Date(sale.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                                          </td>
                                        </tr>
                                      ))
                                    )}
                                  </tbody>
                                </table>
                              </div>
                              <div className="flex justify-end pt-6 border-t border-main-border">
                                <div className="text-right">
                                  <div className="text-sm text-text-secondary uppercase font-bold">Total {dashboardDetail === 'sales' ? 'Sales' : 'Revenue'}</div>
                                  <div className="text-4xl font-black text-btn-primary">
                                    ${MOCK_SALES.filter(s => dashboardDetail === 'revenue' || s.date.startsWith('2026-02-28')).reduce((acc, curr) => acc + curr.amount, 0).toFixed(2)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {dashboardDetail === 'products' && (
                            <div className="space-y-8">
                              <div className="grid grid-cols-2 gap-6">
                                <div className="bg-emerald-50 dark:bg-emerald-900/10 p-6 rounded-3xl border border-emerald-100 dark:border-emerald-900/20">
                                  <div className="text-sm text-emerald-600 font-bold uppercase mb-1">Total Remaining Stock</div>
                                  <div className="text-4xl font-black text-emerald-700">
                                    {inventoryProducts.reduce((acc, curr) => acc + curr.stock, 0)}
                                  </div>
                                </div>
                                <div className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-3xl border border-blue-100 dark:border-blue-900/20">
                                  <div className="text-sm text-blue-600 font-bold uppercase mb-1">Total Items Sold</div>
                                  <div className="text-4xl font-black text-blue-700">1,240</div>
                                </div>
                              </div>
                              <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                  <thead>
                                    <tr className="border-b border-main-border text-xs font-bold text-text-secondary uppercase tracking-wider">
                                      <th className="pb-4 px-4">Product</th>
                                      <th className="pb-4 px-4">Category</th>
                                      <th className="pb-4 px-4">Sold</th>
                                      <th className="pb-4 px-4">Remaining</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-main-border">
                                    {inventoryProducts.map(product => (
                                      <tr key={product.id} className="text-sm hover:bg-badge-bg/50 transition-colors">
                                        <td className="py-4 px-4 font-medium">{product.name}</td>
                                        <td className="py-4 px-4 text-text-secondary">{product.category}</td>
                                        <td className="py-4 px-4 font-bold text-blue-600">{(Math.random() * 100).toFixed(0)}</td>
                                        <td className="py-4 px-4 font-bold text-emerald-600">{product.stock}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}

                          {dashboardDetail === 'credits' && (
                            <div className="space-y-8">
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                  <h4 className="font-bold text-text-secondary uppercase text-xs tracking-widest">Customer Credits</h4>
                                  <div className="space-y-4">
                                    {[
                                      { name: 'Juan Dela Cruz', amount: 150, status: 'Outstanding' },
                                      { name: 'Maria Santos', amount: 45, status: 'Pending' },
                                      { name: 'Pedro Penduko', amount: 0, status: 'Paid' }
                                    ].map((c, i) => (
                                      <div key={i} className="bg-card-bg p-4 rounded-2xl border border-card-border flex justify-between items-center hover:border-btn-primary transition-colors cursor-pointer group">
                                        <div>
                                          <div className="font-bold text-login-text">{c.name}</div>
                                          <div className={`text-[10px] font-bold uppercase ${c.status === 'Outstanding' ? 'text-red-500' : 'text-emerald-500'}`}>{c.status}</div>
                                        </div>
                                        <div className="text-xl font-black text-login-text group-hover:text-btn-primary transition-colors">${c.amount.toFixed(2)}</div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                <div className="space-y-4">
                                  <h4 className="font-bold text-text-secondary uppercase text-xs tracking-widest">Items Bought</h4>
                                  <div className="bg-badge-bg/30 rounded-3xl p-6 border border-dashed border-input-border h-full">
                                    <div className="space-y-3">
                                      <div className="flex justify-between text-sm">
                                        <span>Liboog x2</span>
                                        <span className="font-bold">$160.00</span>
                                      </div>
                                      <div className="flex justify-between text-sm">
                                        <span>Century Tuna x10</span>
                                        <span className="font-bold">$350.00</span>
                                      </div>
                                      <div className="pt-3 border-t border-input-border flex justify-between font-black text-login-text">
                                        <span>Total</span>
                                        <span>$510.00</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="pt-8 border-t border-main-border">
                                <h4 className="font-bold text-text-secondary uppercase text-xs tracking-widest mb-4">Outstanding Customers List</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                  {['Juan Dela Cruz', 'Maria Santos', 'Ricardo Dalisay'].map((name, i) => (
                                    <div key={i} className="bg-red-50 dark:bg-red-900/10 p-4 rounded-xl border border-red-100 dark:border-red-900/20 flex items-center gap-3">
                                      <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-xs">{name[0]}</div>
                                      <div className="text-sm font-bold text-red-700">{name}</div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    </div>
                  )}

                  {/* Top Selling Overlay */}
                  {showTopSelling && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1100] flex items-center justify-center p-4">
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-main-bg rounded-[40px] border border-main-border shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
                      >
                        <div className="p-8 border-b border-main-border flex justify-between items-center bg-card-bg">
                          <h3 className="text-2xl font-bold text-login-text flex items-center gap-3">
                            🏆 All Top Selling Products
                          </h3>
                          <button onClick={() => setShowTopSelling(false)} className="p-2 hover:bg-badge-bg rounded-full transition-colors">
                            <X className="w-6 h-6" />
                          </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-8">
                          <div className="space-y-4">
                            {topSellingData.map((item, i) => (
                              <div key={i} className="bg-card-bg rounded-2xl p-5 border border-card-border flex items-center justify-between hover:border-btn-primary transition-colors">
                                <div className="flex items-center gap-4">
                                  <div className={`w-10 h-10 ${item.color} rounded-xl flex items-center justify-center text-white font-bold text-sm`}>
                                    #{i + 1}
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-login-text">{item.name}</h4>
                                    <p className="text-xs text-text-secondary">{item.sold} units sold</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-xl font-black text-btn-primary">${item.amount.toFixed(2)}</div>
                                  <div className="w-24 bg-badge-bg h-1.5 rounded-full overflow-hidden mt-1">
                                    <div className={`${item.color} h-full rounded-full`} style={{ width: `${(item.amount / 500) * 100}%` }}></div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="flex justify-end pt-6 border-t border-main-border mt-6">
                            <div className="text-right">
                              <div className="text-sm text-text-secondary uppercase font-bold">Total Revenue</div>
                              <div className="text-4xl font-black text-btn-primary">
                                ${topSellingData.reduce((acc, item) => acc + item.amount, 0).toFixed(2)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  )}

                  {/* Low Stock Overlay */}
                  {showLowStock && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1100] flex items-center justify-center p-4">
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-main-bg rounded-[40px] border border-main-border shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
                      >
                        <div className="p-8 border-b border-main-border flex justify-between items-center bg-card-bg">
                          <h3 className="text-2xl font-bold text-login-text flex items-center gap-3">
                            <AlertTriangle className="w-6 h-6 text-red-500" /> Low Stock Items
                          </h3>
                          <button onClick={() => setShowLowStock(false)} className="p-2 hover:bg-badge-bg rounded-full transition-colors">
                            <X className="w-6 h-6" />
                          </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-8">
                          {lowStockItems.length === 0 ? (
                            <div className="text-center py-12">
                              <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                              <h4 className="text-xl font-bold text-login-text mb-2">All Good!</h4>
                              <p className="text-text-secondary">All items are well-stocked.</p>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {lowStockItems.map(product => (
                                <div key={product.id} className="bg-red-50 dark:bg-red-900/10 rounded-2xl p-5 border border-red-200 dark:border-red-900/20 flex items-center justify-between">
                                  <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center">
                                      <AlertTriangle className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                      <h4 className="font-bold text-login-text">{product.name}</h4>
                                      <p className="text-xs text-text-secondary">{product.category}</p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-lg font-black text-red-600">{product.stock} left</div>
                                    <div className="text-[10px] text-text-secondary uppercase font-bold">
                                      Threshold: {product.lowStockThreshold || LOW_STOCK_THRESHOLD}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    </div>
                  )}

                  {/* Pending POs Overlay */}
                  {showPendingPOs && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1100] flex items-center justify-center p-4">
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-main-bg rounded-[40px] border border-main-border shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
                      >
                        <div className="p-8 border-b border-main-border flex justify-between items-center bg-card-bg">
                          <h3 className="text-2xl font-bold text-login-text flex items-center gap-3">
                            <Truck className="w-6 h-6" /> Pending Purchase Orders
                          </h3>
                          <button onClick={() => setShowPendingPOs(false)} className="p-2 hover:bg-badge-bg rounded-full transition-colors">
                            <X className="w-6 h-6" />
                          </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-8">
                          {pendingPOs.length === 0 ? (
                            <div className="text-center py-12">
                              <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                              <h4 className="text-xl font-bold text-login-text mb-2">All Clear!</h4>
                              <p className="text-text-secondary">No pending purchase orders.</p>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {pendingPOs.map(po => (
                                <div key={po.id} className="bg-card-bg rounded-2xl p-5 border border-card-border flex items-center justify-between hover:border-btn-primary transition-colors">
                                  <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-badge-bg rounded-xl flex items-center justify-center">
                                      <Truck className="w-6 h-6 text-btn-primary" />
                                    </div>
                                    <div>
                                      <h4 className="font-bold text-login-text">{po.name}</h4>
                                      <p className="text-xs text-text-secondary">Vendor: {po.vendor}</p>
                                      <p className="text-xs text-text-secondary">Items: {po.items}</p>
                                      <p className="text-[10px] text-text-secondary mt-1">Date: {po.date}</p>
                                    </div>
                                  </div>
                                  <button 
                                    onClick={() => {
                                      setPendingPOs(prev => prev.filter(p => p.id !== po.id));
                                      showToast(`${po.name} resolved`);
                                    }}
                                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors shadow-sm"
                                  >
                                    <CheckCircle2 className="w-4 h-4" /> Resolve
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    </div>
                  )}

                  {/* Recent Stock Overlay */}
                  {showRecentStock && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1100] flex items-center justify-center p-4">
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-main-bg rounded-[40px] border border-main-border shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
                      >
                        <div className="p-8 border-b border-main-border flex justify-between items-center bg-card-bg">
                          <h3 className="text-2xl font-bold text-login-text flex items-center gap-3">
                            <History className="w-6 h-6" /> Recent Stock Changes
                          </h3>
                          <button onClick={() => setShowRecentStock(false)} className="p-2 hover:bg-badge-bg rounded-full transition-colors">
                            <X className="w-6 h-6" />
                          </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-8">
                          <div className="space-y-4">
                            {recentStocksData.map((stock, i) => (
                              <div key={i} className="bg-card-bg rounded-2xl p-5 border border-card-border flex items-center justify-between hover:border-btn-primary transition-colors">
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center">
                                    <Boxes className="w-5 h-5 text-emerald-600" />
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-login-text">{stock.product}</h4>
                                    <p className="text-xs text-text-secondary">
                                      {new Date(stock.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                      {' · '}
                                      {new Date(stock.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-xl font-black text-emerald-600">{stock.change}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    <div className="lg:col-span-2 bg-alert-bg rounded-[26px] p-6 border border-alert-border">
                      <h4 className="font-medium mb-4 flex items-center justify-between">
                        📈 Sales trend (last 7 days)
                        <button onClick={() => showToast('Exporting 7-day report')} className="text-xs text-badge-color flex items-center gap-1">
                          export <Download className="w-3 h-3" />
                        </button>
                      </h4>
                      <div className="flex items-end gap-2 h-40 mt-6">
                        {MOCK_SALES.map((sale, i) => (
                          <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                            <motion.div 
                              initial={{ height: 0 }}
                              animate={{ height: `${(sale.amount / 1000) * 100}%` }}
                              className="w-full bg-btn-primary rounded-t-lg relative"
                            >
                              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-login-text text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                ${sale.amount}
                              </div>
                            </motion.div>
                            <span className="text-[10px] text-text-secondary">{sale.date}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="bg-alert-bg rounded-[26px] p-6 border border-alert-border">
                        <h4 className="font-medium mb-4 flex items-center justify-between">
                          🏆 Top selling
                          <button onClick={() => setShowTopSelling(true)} className="text-[10px] text-badge-color uppercase font-bold hover:underline">view all</button>
                        </h4>
                        <div className="space-y-4">
                          {[
                            { name: 'Liboog', amount: 480, color: 'bg-btn-primary' },
                            { name: 'Pale Pilsen', amount: 276, color: 'bg-emerald-500' },
                            { name: 'Century Tuna', amount: 210, color: 'bg-amber-500' }
                          ].map((item, i) => (
                            <div key={i}>
                              <div className="flex justify-between text-sm mb-1">
                                <span>{item.name}</span>
                                <span className="font-medium">${item.amount}</span>
                              </div>
                              <div className="w-full bg-badge-bg h-1.5 rounded-full overflow-hidden">
                                <div className={`${item.color} h-full`} style={{ width: `${(item.amount / 500) * 100}%` }}></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="bg-alert-bg rounded-[26px] p-6 border border-alert-border flex items-center justify-between">
                      <div>
                        <div className="text-xs text-text-secondary uppercase font-bold mb-1">Low stock</div>
                        <div className={`text-xl font-medium ${lowStockItems.length === 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                          {lowStockItems.length === 0 ? '✅ 0 items' : `⚠️ ${lowStockItems.length} items`}
                        </div>
                      </div>
                      <button onClick={() => setShowLowStock(true)} className="p-2 hover:bg-badge-bg rounded-full transition-colors">
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="bg-alert-bg rounded-[26px] p-6 border border-alert-border flex items-center justify-between">
                      <div>
                        <div className="text-xs text-text-secondary uppercase font-bold mb-1">Pending POs</div>
                        <div className="text-xl font-medium text-text-secondary">
                          {pendingPOs.length === 0 ? '📦 none' : `📦 ${pendingPOs.length} pending`}
                        </div>
                      </div>
                      <button onClick={() => setShowPendingPOs(true)} className="p-2 hover:bg-badge-bg rounded-full transition-colors">
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="bg-alert-bg rounded-[26px] p-6 border border-alert-border flex items-center justify-between">
                      <div>
                        <div className="text-xs text-text-secondary uppercase font-bold mb-1">Recent stock</div>
                        <div className="text-sm font-medium">{recentStocksData[0]?.product} {recentStocksData[0]?.change}</div>
                      </div>
                      <button onClick={() => setShowRecentStock(true)} className="p-2 hover:bg-badge-bg rounded-full transition-colors">
                        <History className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeSection === 'pos' && (
                <motion.div 
                  key="pos"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="h-full flex flex-col"
                >
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-semibold text-login-text flex items-center gap-3">
                      <ShoppingCart className="w-6 h-6" /> Point of Sale
                    </h2>
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                        <input 
                          type="text" 
                          placeholder="Search products..." 
                          className="pl-11 pr-4 py-2.5 bg-badge-bg border border-input-border rounded-xl outline-none focus:border-btn-primary w-64 text-sm"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 flex gap-8 min-h-0">
                    {/* Product Selection */}
                    <div className="flex-[2] overflow-y-auto pr-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                        {filteredProducts.map(product => (
                          <motion.button 
                            key={product.id}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              const existing = cart.find(c => c.id === product.id);
                              if (existing) {
                                setCart(cart.map(c => c.id === product.id ? { ...c, quantity: c.quantity + 1 } : c));
                              } else {
                                setCart([...cart, { ...product, quantity: 1 }]);
                              }
                              showToast(`Added ${product.name}`);
                            }}
                            className={`p-5 rounded-2xl border text-left transition-all group ${
                              product.stock < (product.lowStockThreshold || LOW_STOCK_THRESHOLD)
                                ? 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-900/40' 
                                : 'bg-info-card-bg border-info-border hover:border-btn-primary hover:shadow-md'
                            }`}
                          >
                            <div className="flex justify-between items-start mb-3">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary bg-badge-bg px-2 py-0.5 rounded">
                                {product.category}
                              </span>
                              {product.stock < (product.lowStockThreshold || LOW_STOCK_THRESHOLD) && (
                                <AlertTriangle className="w-4 h-4 text-red-500" />
                              )}
                            </div>
                            <h3 className="font-semibold text-login-text mb-1">{product.name}</h3>
                            <div className="text-xl font-bold text-btn-primary mb-3">${product.price}</div>
                            <div className="flex items-center justify-between text-[11px]">
                              <span className={product.stock < (product.lowStockThreshold || LOW_STOCK_THRESHOLD) ? 'text-red-600 font-bold' : 'text-text-secondary'}>
                                Stock: {product.stock}
                              </span>
                              <Plus className="w-4 h-4 text-btn-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Cart */}
                    <div className="flex-1 bg-info-card-bg rounded-3xl p-6 flex flex-col border border-info-border">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-lg flex items-center gap-2">
                          Cart <span className="text-sm font-normal text-text-secondary">({cart.reduce((acc, item) => acc + item.quantity, 0)} items)</span>
                        </h3>
                        <button 
                          onClick={() => setCart([])}
                          className="text-xs text-red-500 font-medium hover:underline"
                        >
                          Clear All
                        </button>
                      </div>

                      <div className="flex-1 overflow-y-auto mb-6 space-y-3 pr-1">
                        {cart.length === 0 ? (
                          <div className="h-full flex flex-col items-center justify-center text-text-secondary opacity-50">
                            <ShoppingCart className="w-12 h-12 mb-4" />
                            <p className="text-sm">Your cart is empty</p>
                          </div>
                        ) : (
                          cart.map(item => (
                            <motion.div 
                              layout
                              key={item.id}
                              initial={{ opacity: 0, x: 10 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="bg-card-bg dark:bg-card-bg p-4 rounded-xl border border-card-border flex items-center justify-between shadow-sm"
                            >
                              <div className="flex-1">
                                <h4 className="text-sm font-semibold text-login-text">{item.name}</h4>
                                <p className="text-xs text-text-secondary">${item.price} each</p>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="flex items-center bg-badge-bg rounded-lg border border-input-border">
                                  <button 
                                    onClick={() => {
                                      if (item.quantity > 1) {
                                        setCart(cart.map(c => c.id === item.id ? { ...c, quantity: c.quantity - 1 } : c));
                                      }
                                    }}
                                    className="p-1.5 hover:bg-white dark:hover:bg-zinc-700 rounded-l-lg transition-colors"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                                  <button 
                                    onClick={() => {
                                      setCart(cart.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c));
                                    }}
                                    className="p-1.5 hover:bg-white dark:hover:bg-zinc-700 rounded-r-lg transition-colors"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </div>
                                <button 
                                  onClick={() => setItemToRemove(item)}
                                  className="p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </motion.div>
                          ))
                        )}
                      </div>

                      <div className="space-y-4 pt-4 border-t border-input-border">
                        <div className="flex justify-between text-sm">
                          <span className="text-text-secondary">Subtotal</span>
                          <span className="font-medium">${cart.reduce((acc, item) => acc + (item.price * item.quantity), 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold">
                          <span>Total</span>
                          <span className="text-btn-primary">${cart.reduce((acc, item) => acc + (item.price * item.quantity), 0).toFixed(2)}</span>
                        </div>
                        <button 
                          disabled={cart.length === 0}
                          onClick={() => {
                            showToast('Transaction completed!');
                            setCart([]);
                          }}
                          className="w-full py-4 bg-btn-primary text-white rounded-2xl font-bold hover:bg-btn-primary-hover transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Complete Checkout
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeSection === 'inventory' && (
                <motion.div 
                  key="inventory"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <h2 className="text-2xl font-semibold text-login-text flex items-center gap-3">
                      <Boxes className="w-6 h-6" /> Inventory Management
                    </h2>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                        <input 
                          type="text" 
                          placeholder="Search inventory..." 
                          className="pl-11 pr-4 py-2.5 bg-badge-bg border border-input-border rounded-xl outline-none focus:border-btn-primary w-64 text-sm"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                      <button 
                        onClick={() => setIsAddingProduct(true)} 
                        disabled={currentUser?.role === 'Staff Worker'}
                        className="bg-btn-primary text-white rounded-xl px-5 py-2.5 text-sm font-medium flex items-center gap-2 hover:bg-btn-primary-hover transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus className="w-4 h-4" /> Add Item
                      </button>
                      <button onClick={fetchProducts} className="p-2.5 bg-badge-bg border border-input-border rounded-xl text-text-secondary hover:bg-white dark:hover:bg-zinc-800 transition-all">
                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {isLoading ? (
                      [1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                        <div key={i} className="bg-info-card-bg rounded-2xl p-6 border border-info-border animate-pulse">
                          <div className="h-4 w-20 bg-badge-bg rounded-full mb-4"></div>
                          <div className="h-6 w-32 bg-badge-bg rounded-md mb-2"></div>
                          <div className="h-8 w-24 bg-badge-bg rounded-md mb-4"></div>
                          <div className="h-4 w-full bg-badge-bg rounded-md"></div>
                        </div>
                      ))
                    ) : (
                      filteredProducts.map(product => {
                        const isLowStock = product.stock < (product.lowStockThreshold || LOW_STOCK_THRESHOLD);
                        return (
                          <motion.div 
                            layoutId={product.id}
                            key={product.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ y: -4 }}
                            onClick={() => setEditingProduct(product)}
                            className={`bg-info-card-bg rounded-2xl p-6 border transition-all cursor-pointer group relative ${
                              isLowStock 
                                ? 'border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/30' 
                                : 'border-info-border hover:border-btn-primary hover:shadow-lg'
                            }`}
                          >
                            <div className="flex justify-between items-start mb-4">
                              <span className="bg-badge-bg px-2.5 py-1 rounded-lg text-[10px] text-badge-color uppercase tracking-widest font-bold">
                                {product.category}
                              </span>
                              <div className="flex gap-2">
                                {isLowStock && (
                                  <div className="flex items-center gap-1.5 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-lg group/tooltip">
                                    <AlertTriangle className="w-3 h-3 text-red-500" />
                                    <span className="text-[10px] font-bold text-red-600 uppercase">Low</span>
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-zinc-900 text-white text-[10px] rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                                      Threshold: {product.lowStockThreshold || LOW_STOCK_THRESHOLD}
                                    </div>
                                  </div>
                                )}
                                {(currentUser?.role === 'Admin' || currentUser?.role === 'Manager') && (
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteProduct(product.id);
                                    }}
                                    className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </div>
                            <h3 className={`text-base font-bold mb-1 ${isLowStock ? 'text-red-700' : 'text-login-text'}`}>{product.name}</h3>
                            <div className="text-xl font-black text-btn-primary mb-4">${product.price}</div>
                            
                            <div className="pt-4 border-t border-input-border flex items-center justify-between">
                              <div className="flex flex-col">
                                <span className="text-[10px] uppercase text-text-secondary font-bold tracking-tighter">Current Stock</span>
                                <span className={`text-sm font-bold ${isLowStock ? 'text-red-600' : 'text-login-text'}`}>
                                  {product.stock} units
                                </span>
                              </div>
                              <div className="w-8 h-8 rounded-lg bg-badge-bg flex items-center justify-center group-hover:bg-btn-primary transition-colors">
                                <Settings className="w-4 h-4 text-text-secondary group-hover:text-white transition-colors" />
                              </div>
                            </div>
                          </motion.div>
                        );
                      })
                    )}
                  </div>
                </motion.div>
              )}

              {activeSection === 'stock' && (
                <motion.div 
                  key="stock"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-semibold text-login-text flex items-center gap-3">
                      <Truck className="w-6 h-6" /> Stock Management
                    </h2>
                    <button onClick={() => showToast('New PO created')} className="bg-btn-primary text-white rounded-xl px-5 py-2.5 text-sm font-medium flex items-center gap-2 hover:bg-btn-primary-hover transition-all shadow-sm">
                      <Plus className="w-4 h-4" /> Create PO
                    </button>
                  </div>
                  <div className="bg-info-card-bg rounded-2xl border border-info-border overflow-hidden">
                    <div className="p-6 flex items-center justify-between border-b border-info-border">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-badge-bg rounded-xl flex items-center justify-center">
                          <Truck className="w-6 h-6 text-btn-primary" />
                        </div>
                        <div>
                          <div className="font-bold text-login-text">PO#2312</div>
                          <div className="text-xs text-text-secondary">Vendor: San Miguel Corp</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-lg text-[10px] font-bold uppercase">Open</span>
                        <button onClick={() => showToast('Marked as received')} className="p-2 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors">
                          <CheckCircle2 className="w-6 h-6" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeSection === 'users' && (
                <motion.div 
                  key="users"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-semibold text-login-text flex items-center gap-3">
                      <Users className="w-6 h-6" /> User Management
                    </h2>
                    <button onClick={() => showToast('Invite sent')} className="bg-btn-primary text-white rounded-xl px-5 py-2.5 text-sm font-medium flex items-center gap-2 hover:bg-btn-primary-hover transition-all shadow-sm">
                      <Plus className="w-4 h-4" /> Invite User
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {users.map(user => (
                      <div key={user.id} className="bg-info-card-bg rounded-2xl p-6 border border-info-border shadow-sm">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-badge-bg rounded-2xl flex items-center justify-center">
                              <UserCircle className="w-10 h-10 text-btn-primary" />
                            </div>
                            <div>
                              <h3 className="font-bold text-lg text-login-text">{user.firstName} {user.surname}</h3>
                              <span className="bg-btn-primary/10 text-btn-primary px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                                {user.role}
                              </span>
                            </div>
                          </div>
                          <button onClick={() => showToast('Edit user')} className="p-2 text-text-secondary hover:bg-badge-bg rounded-lg transition-colors">
                            <Settings className="w-5 h-5" />
                          </button>
                        </div>
                        <div className="space-y-2 text-sm text-text-secondary">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4" /> {user.email}
                          </div>
                          <div className="flex items-center gap-2">
                            <History className="w-4 h-4" /> {user.phone}
                          </div>
                          <div className="flex items-start gap-2">
                            <Store className="w-4 h-4 mt-0.5" /> {user.address}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeSection === 'reports' && (
                <motion.div 
                  key="reports"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-semibold text-login-text flex items-center gap-3">
                      <FileText className="w-6 h-6" /> Reports & Analytics
                    </h2>
                    <button onClick={() => showToast('Report generated')} className="bg-btn-primary text-white rounded-xl px-5 py-2.5 text-sm font-medium flex items-center gap-2 hover:bg-btn-primary-hover transition-all shadow-sm">
                      Generate Report
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="bg-info-card-bg rounded-2xl p-6 border border-info-border">
                      <span className="bg-badge-bg px-2.5 py-1 rounded-lg text-[10px] text-badge-color uppercase tracking-widest font-bold">Weekly Sales</span>
                      <div className="text-4xl font-black text-login-text my-4">$3,270</div>
                      <button onClick={() => showToast('PDF downloaded')} className="w-full bg-badge-bg text-text-secondary py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-input-border transition-colors">
                        <Download className="w-4 h-4" /> Download PDF
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeSection === 'cd' && (
                <motion.div 
                  key="cd"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-semibold text-login-text flex items-center gap-3">
                      <CreditCard className="w-6 h-6" /> Customer Credits (CD)
                    </h2>
                    <button onClick={() => showToast('Credit added')} className="bg-btn-primary text-white rounded-xl px-5 py-2.5 text-sm font-medium flex items-center gap-2 hover:bg-btn-primary-hover transition-all shadow-sm">
                      <Plus className="w-4 h-4" /> Add Credit
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-info-card-bg rounded-2xl p-6 border border-info-border shadow-sm">
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-badge-bg rounded-xl flex items-center justify-center">
                          <UserCircle className="w-8 h-8 text-btn-primary" />
                        </div>
                        <span className="bg-red-100 dark:bg-red-900/30 text-red-600 px-2 py-1 rounded text-[10px] font-bold uppercase">Outstanding</span>
                      </div>
                      <h3 className="font-bold text-lg text-login-text mb-1">Juan Dela Cruz</h3>
                      <div className="text-2xl font-black text-red-500 mb-4">$150.00</div>
                      <div className="text-xs text-text-secondary mb-4">Last transaction: 2 days ago</div>
                      <button onClick={() => showToast('Payment recorded')} className="w-full bg-btn-primary text-white py-2 rounded-xl text-sm font-bold hover:bg-btn-primary-hover transition-colors">
                        Record Payment
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Modals outside AnimatePresence for better performance */}
          <Modal 
            isOpen={isAddingProduct} 
            onClose={() => setIsAddingProduct(false)} 
            title="Add New Product"
          >
            <ProductForm 
              onSubmit={handleAddProduct}
              onCancel={() => setIsAddingProduct(false)}
              submitLabel="Add Product"
            />
          </Modal>

          <Modal 
            isOpen={!!editingProduct} 
            onClose={() => setEditingProduct(null)} 
            title="Edit Product"
          >
            {editingProduct && (
              <ProductForm 
                initialData={editingProduct}
                onSubmit={(data) => handleUpdateProduct(editingProduct.id, data)}
                onCancel={() => setEditingProduct(null)}
                submitLabel="Update Product"
              />
            )}
          </Modal>

          <Modal
            isOpen={!!itemToRemove}
            onClose={() => setItemToRemove(null)}
            title="Remove Item"
          >
            <div className="space-y-6">
              <p className="text-text-secondary">
                Are you sure you want to remove <span className="font-bold text-login-text">{itemToRemove?.name}</span> from the cart?
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setItemToRemove(null)}
                  className="flex-1 px-6 py-3 border border-input-border rounded-xl font-bold hover:bg-badge-bg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    if (itemToRemove) {
                      setCart(cart.filter(c => c.id !== itemToRemove.id));
                      showToast('Item removed');
                      setItemToRemove(null);
                    }
                  }}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-bold shadow-lg transition-all active:scale-95"
                >
                  Remove Item
                </button>
              </div>
            </div>
          </Modal>
        </main>
      </div>
    </div>
  );
}
