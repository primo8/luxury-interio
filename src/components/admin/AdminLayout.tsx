import { useAdmin } from '../../context/AdminContext';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { GlobalSearchModal } from './GlobalSearchModal';
import { DashboardHome } from './DashboardHome';
import { OrdersManager } from './OrdersManager';
import { PaymentsManager } from './PaymentsManager';
import { ProductsManager } from './ProductsManager';
import { InventoryManager } from './InventoryManager';
import { CustomersManager } from './CustomersManager';
import { DiscountsManager } from './DiscountsManager';
import { CategoriesManager } from './CategoriesManager';
import { ReviewsManager } from './ReviewsManager';
import { DeliveryManager } from './DeliveryManager';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { ThreeStudioManager } from './ThreeStudioManager';
import { HomepageCMSManager } from './HomepageCMSManager';
import { NotificationsCenter } from './NotificationsCenter';
import { StaffManager } from './StaffManager';
import { MtnSandboxPage } from './MtnSandboxPage';
import { SystemSettings } from './SystemSettings';
import { AuditLogsViewer } from './AuditLogsViewer';
import './admin.css';

export function AdminLayout() {
  const { activeTab, adminToasts, dismissAdminToast } = useAdmin();

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardHome />;
      case 'orders':
        return <OrdersManager />;
      case 'payments':
        return <PaymentsManager />;
      case 'products':
        return <ProductsManager />;
      case 'inventory':
        return <InventoryManager />;
      case 'customers':
        return <CustomersManager />;
      case 'discounts':
        return <DiscountsManager />;
      case 'categories':
        return <CategoriesManager />;
      case 'reviews':
        return <ReviewsManager />;
      case 'delivery':
        return <DeliveryManager />;
      case 'analytics':
        return <AnalyticsDashboard />;
      case '3d-studio':
        return <ThreeStudioManager />;
      case 'cms':
        return <HomepageCMSManager />;
      case 'notifications':
        return <NotificationsCenter />;
      case 'staff':
        return <StaffManager />;
      case 'mtn-sandbox':
        return <MtnSandboxPage />;
      case 'settings':
        return <SystemSettings />;
      case 'audit-logs':
        return <AuditLogsViewer />;
      default:
        return <DashboardHome />;
    }
  };

  return (
    <div className="admin-shell">
      {/* 1. Collapsible Left Sidebar */}
      <AdminSidebar />

      {/* 2. Main Content Frame */}
      <div className="admin-main">
        {/* Top Header */}
        <AdminHeader />

        {/* Page Body Viewport */}
        <main className="admin-page-container">
          {renderActiveTabContent()}
        </main>
      </div>

      {/* Global Search Palette (⌘K) */}
      <GlobalSearchModal />

      {/* Floating Admin Toast Notifications */}
      <div
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 120,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          maxWidth: '380px',
        }}
      >
        {adminToasts.map((toast) => (
          <div
            key={toast.id}
            onClick={() => dismissAdminToast(toast.id)}
            style={{
              padding: '0.85rem 1.25rem',
              borderRadius: '10px',
              color: '#FFFFFF',
              background:
                toast.type === 'error'
                  ? '#EF4444'
                  : toast.type === 'warning'
                  ? '#F59E0B'
                  : toast.type === 'info'
                  ? '#3B82F6'
                  : '#10B981',
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              animation: 'fadeIn 0.2s ease-out',
            }}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
}
