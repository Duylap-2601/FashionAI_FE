'use client';

import { AdminAnalyticsPanel } from '@/features/admin/components/admin-analytics-panel';
import { AdminCouponsPanel } from '@/features/admin/components/admin-coupons-panel';
import { AdminLiveTryOnSettingsPanel } from '@/features/admin/components/admin-live-try-on-settings-panel';
import { AdminOrderIssueModal } from '@/features/admin/components/admin-order-issue-modal';
import { AdminOrderIssuesPanel } from '@/features/admin/components/admin-order-issues-panel';
import { AdminOrderModal } from '@/features/admin/components/admin-order-modal';
import { AdminOrdersPanel } from '@/features/admin/components/admin-orders-panel';
import { AdminPlatformsPanel } from '@/features/admin/components/admin-platforms-panel';
import { AdminProductModal } from '@/features/admin/components/admin-product-modal';
import { AdminProductsPanel } from '@/features/admin/components/admin-products-panel';
import { AdminReconciliationPanel } from '@/features/admin/components/admin-reconciliation-panel';
import { AdminSaleCampaignsPanel } from '@/features/admin/components/admin-sale-campaigns-panel';
import { AdminShipmentModal } from '@/features/admin/components/admin-shipment-modal';
import { AdminShipmentsPanel } from '@/features/admin/components/admin-shipments-panel';
import { AdminShippingSettingsPanel } from '@/features/admin/components/admin-shipping-settings-panel';
import { AdminSidebar } from '@/features/admin/components/admin-sidebar';
import { AdminTopbar } from '@/features/admin/components/admin-topbar';
import { AdminUserModal } from '@/features/admin/components/admin-user-modal';
import { AdminUsersPanel } from '@/features/admin/components/admin-users-panel';
import { DashboardOverview } from '@/features/admin/components/dashboard-overview';
import { useAdminDashboard } from '@/features/admin/hooks/use-admin-dashboard';
import type { AdminPage } from '@/features/admin/types/admin-dashboard-page';
import { AdminGuard } from '@/features/auth/components/AdminGuard';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { AdminCollectionManager } from '@/features/collections/components/AdminCollectionManager';
import { AdminReviewTable } from '@/features/reviews/components/AdminReviewTable';
import { AnimatePresence } from 'motion/react';
import { useCallback, useState } from 'react';

function AdminDashboardContent() {
  const { logout, currentUser } = useAuth();
  const adminName = currentUser.name && currentUser.name !== 'Khách' ? currentUser.name : 'Admin FashionAI';
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [analyticsRefreshSignal, setAnalyticsRefreshSignal] = useState(0);

  const {
    activeTab,
    navigateAdminTab,
    openTab,
    searchQuery,
    setSearchQuery,
    isLoading,
    refresh,
    chartDays,
    setChartDays,
    metrics,
    products,
    productEditor,
    orders,
    shipments,
    issues,
    users,
    overview,
    openOrderByCode,
    handleIssueResolved,
  } = useAdminDashboard();

  const handleSidebarNavigate = useCallback((tab: AdminPage) => {
    openTab(tab);
    setSidebarOpen(false);
  }, [openTab]);
  const openSidebar = useCallback(() => setSidebarOpen(true), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  const handleRefresh = useCallback(() => {
    setAnalyticsRefreshSignal((signal) => signal + 1);
    void refresh();
  }, [refresh]);
  const handleLogout = useCallback(() => {
    void logout();
  }, [logout]);

  return (
    <div className="flex min-h-dvh bg-landing-paper font-sans text-landing-obsidian">
      <AdminSidebar
        activeTab={activeTab}
        isOpen={sidebarOpen}
        onNavigate={handleSidebarNavigate}
        onClose={closeSidebar}
        onLogout={handleLogout}
      />

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar
          activeTab={activeTab}
          adminName={adminName}
          avatarUrl={currentUser.avatar}
          isRefreshing={isLoading}
          onRefresh={handleRefresh}
          onOpenSidebar={openSidebar}
        />

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 bg-landing-paper landing-paper-texture px-4 py-8 md:px-8 md:py-12">
          <div className="mx-auto flex w-full max-w-[1440px] flex-col">
          {activeTab === 'dashboard' && (
            <DashboardOverview
              metrics={metrics}
              orders={orders.items}
              products={products.items}
              setActiveTab={navigateAdminTab}
              openProductEditor={productEditor.openProductEditor}
              chartDays={chartDays}
              setChartDays={setChartDays}
            />
          )}

          {activeTab === 'products' && (
            <AdminProductsPanel
              {...products.panelProps}
              products={products.items}
              handleDeleteProduct={products.handleDeleteProduct}
              openProductEditor={productEditor.openProductEditor}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          )}

          {activeTab === 'users' && (
            <AdminUsersPanel {...users.panelProps} users={users.users} setSelectedUser={users.setSelectedUser} />
          )}

          {activeTab === 'orders' && (
            <AdminOrdersPanel {...orders.panelProps} orders={orders.items} setSelectedOrder={orders.setSelectedOrder} />
          )}

          {activeTab === 'shipments' && (
            <AdminShipmentsPanel
              {...shipments.paginationProps}
              shipments={shipments.items}
              filters={shipments.filters}
              setFilters={shipments.changeFilters}
              onView={shipments.handleViewShipment}
              onSimulatePicked={shipments.handleSimulatePickedShipment}
              onCancel={shipments.handleCancelShipment}
              onOpenOrder={openOrderByCode}
            />
          )}

          {activeTab === 'order-issues' && (
            <AdminOrderIssuesPanel {...issues.panelProps} issues={issues.items} onSelectIssue={issues.setSelectedIssue} />
          )}

          {(activeTab === 'reconciliation' || activeTab === 'webhook-failures') && (
            <AdminReconciliationPanel onStatsRefresh={overview.fetchStats} />
          )}
          {activeTab === 'shipping-settings' && <AdminShippingSettingsPanel />}
          {activeTab === 'analytics' && <AdminAnalyticsPanel refreshSignal={analyticsRefreshSignal} />}
          {activeTab === 'platforms' && <AdminPlatformsPanel />}
          {activeTab === 'live-try-on-settings' && <AdminLiveTryOnSettingsPanel />}
          {activeTab === 'collections' && <AdminCollectionManager />}
          {activeTab === 'reviews' && <AdminReviewTable />}
          {activeTab === 'coupons' && <AdminCouponsPanel />}
          {activeTab === 'sale-campaigns' && <AdminSaleCampaignsPanel />}
          </div>
        </main>

        {/* ─── DRAWER: USER DETAIL ────────────────────────────────────────────── */}
        <AnimatePresence>
          {users.selectedUser && (
            <AdminUserModal
              setSelectedUser={users.setSelectedUser}
              selectedUser={users.selectedUser}
              handleUpdateUser={users.handleUpdateUser}
            />
          )}
        </AnimatePresence>

        {/* ─── DRAWER: ORDER DETAIL ────────────────────────────────────────────── */}
        <AnimatePresence>
          {orders.selectedOrder && (
            <AdminOrderModal
              setSelectedOrder={orders.setSelectedOrder}
              selectedOrder={orders.selectedOrder}
              handleUpdateOrderStatus={orders.handleUpdateOrderStatus}
              handleConfirmManualPayment={orders.handleConfirmManualPayment}
              handleUpdateRefund={orders.handleUpdateRefund}
              handleCreateShipment={shipments.handleCreateShipment}
            />
          )}
        </AnimatePresence>

        {/* ─── DRAWER: SHIPMENT DETAIL ─────────────────────────────────────────── */}
        <AnimatePresence>
          {shipments.selectedShipment && (
            <AdminShipmentModal
              shipment={shipments.selectedShipment}
              onClose={() => shipments.setSelectedShipment(null)}
              onSync={shipments.handleSyncShipment}
              onCancel={shipments.handleCancelShipment}
              onSimulateDelivered={shipments.handleSimulateDelivered}
              onOpenOrder={openOrderByCode}
            />
          )}
        </AnimatePresence>

        {/* ─── DIALOG: PRODUCT EDITOR ─────────────────────────────────────────── */}
        <AnimatePresence>
          {productEditor.editingProduct && (
            <AdminProductModal
              closeProductEditor={productEditor.closeProductEditor}
              editingProduct={productEditor.editingProduct}
              setEditingProduct={productEditor.setEditingProduct}
              addColor={productEditor.addColor}
              updateColor={productEditor.updateColor}
              removeColor={productEditor.removeColor}
              productImages={productEditor.productImages}
              handleSelectImages={productEditor.handleSelectImages}
              handleSetPrimaryImage={productEditor.handleSetPrimaryImage}
              handleSetImageColor={productEditor.handleSetImageColor}
              handleRemoveImage={productEditor.handleRemoveImage}
              handleSaveProduct={productEditor.handleSaveProduct}
            />
          )}
        </AnimatePresence>

        {/* ─── DIALOG: ORDER ISSUE DETAIL ──────────────────────────────────────── */}
        <AdminOrderIssueModal
          issue={issues.selectedIssue}
          isOpen={Boolean(issues.selectedIssue)}
          onClose={() => issues.setSelectedIssue(null)}
          onSuccess={handleIssueResolved}
        />
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <AdminGuard>
      <AdminDashboardContent />
    </AdminGuard>
  );
}
