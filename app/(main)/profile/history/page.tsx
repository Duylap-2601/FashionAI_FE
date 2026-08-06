'use client';

import React, { useState } from 'react';
import { 
  Search, 
  Calendar, 
  Sparkles, 
  Camera,
  Eye,
  Download,
  Trash2,
  Check,
  Zap,
  ChevronLeft
} from 'lucide-react';
import Link from 'next/link';
import { useTryOnHistory, useDeleteTryOnHistory } from '@/hooks/useTryOn';
import { useSession } from 'next-auth/react';

export default function TryOnHistoryPage() {
  const { history, isLoading, refetch } = useTryOnHistory();
  const { deleteHistoryItem, deleteBulkItems, isDeleting, isBulkDeleting } = useDeleteTryOnHistory();
  const { data: session } = useSession();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const userTier = session?.user?.tier || 'free';

  // Filtering
  const filteredHistory = history.filter(item => {
    const productName = item.product?.name || item.productId || 'Sản phẩm tự do';
    const matchesSearch = productName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Tất cả' || 
      item.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  // Limit display history for free tier to 10 if BE doesn't enforce it (as per UI specification)
  const displayHistory = userTier === 'free' ? filteredHistory.slice(0, 10) : filteredHistory;

  // Bulk actions
  const toggleSelectAll = () => {
    if (selectedItems.size === displayHistory.length && displayHistory.length > 0) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(displayHistory.map(i => i.id)));
    }
  };

  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSet = new Set(selectedItems);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedItems(newSet);
  };

  const handleBulkDelete = () => {
    if (selectedItems.size === 0) return;
    if (confirm(`Bạn có chắc chắn muốn xóa ${selectedItems.size} kết quả thử đồ này?`)) {
      deleteBulkItems(Array.from(selectedItems), {
        onSuccess: () => {
          setSelectedItems(new Set());
        }
      });
    }
  };

  const handleDeleteItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Bạn có chắc chắn muốn xóa kết quả thử đồ này?')) {
      deleteHistoryItem(id);
    }
  };

  const handleDownload = async (url: string, filename: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename || 'try-on-result.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      // Fallback open in new tab if cors issues
      window.open(url, '_blank');
    }
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-brand-cream text-neutral-900 font-sans pb-24 relative">
      
      {/* BULK ACTION STICKY BAR */}
      <div className={`fixed top-[64px] left-0 right-0 z-40 bg-brand-navy text-white px-4 md:px-8 transition-all duration-300 flex items-center justify-between shadow-md ${
        selectedItems.size > 0 ? 'h-16 opacity-100 translate-y-0' : 'h-0 opacity-0 -translate-y-full overflow-hidden'
      }`}>
        <div className="max-w-[1200px] mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleSelectAll}
              className="w-5 h-5 rounded flex items-center justify-center border-2 border-white transition-colors bg-white text-brand-navy"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
            <span className="text-label-md font-medium text-white">Đã chọn {selectedItems.size} mục</span>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSelectedItems(new Set())}
              className="px-4 py-2 text-label-sm font-medium text-white/80 hover:text-white transition-colors"
            >
              Hủy
            </button>
            <button 
              onClick={handleBulkDelete}
              disabled={isBulkDeleting}
              className="flex items-center gap-2 px-4 py-2 bg-semantic-error hover:bg-red-600 text-white rounded-lg text-label-sm font-medium transition-colors shadow-sm disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" /> {isBulkDeleting ? 'Đang xóa...' : 'Xóa đã chọn'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-8 md:py-12">
        
        {/* Breadcrumb & Navigation */}
        <div className="mb-4">
          <Link href="/profile/measurements" className="inline-flex items-center gap-1.5 text-body-sm text-neutral-500 hover:text-brand-navy transition-colors">
            <ChevronLeft className="w-4 h-4" /> Quay lại Hồ sơ
          </Link>
        </div>

        {/* HEADER & FILTER BAR */}
        <div className="mb-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h1 className="text-heading-h2 font-semibold text-neutral-900 flex items-center gap-3">
              Lịch sử Try-On 
              {!isLoading && (
                <span className="text-label-md bg-neutral-200 text-neutral-600 px-2.5 py-0.5 rounded-full font-medium">
                  {displayHistory.length}
                </span>
              )}
            </h1>

            {/* Search Bar */}
            <div className="relative w-full md:w-[320px]">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-neutral-400" />
              </div>
              <input 
                type="text" 
                placeholder="Tìm theo tên sản phẩm..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-200 rounded-full text-body-sm focus:outline-none focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy transition-all"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center bg-white border border-neutral-200 rounded-full p-1">
              {['Tất cả', 'Tops', 'Bottoms', 'One-pieces'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-label-sm font-medium transition-colors ${
                    selectedCategory.toLowerCase() === cat.toLowerCase()
                      ? 'bg-neutral-100 text-neutral-900' 
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* UPGRADE BANNER (Free Tier) */}
        {userTier === 'free' && history.length > 10 && (
          <div className="mb-8 bg-gradient-to-r from-brand-navy/5 to-brand-gold/5 border border-brand-navy/10 rounded-xl p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0">
                <Sparkles className="w-5 h-5 text-brand-gold" />
              </div>
              <div>
                <h3 className="text-label-md font-bold text-neutral-900 mb-0.5">Bạn đang xem 10 kết quả gần nhất</h3>
                <p className="text-body-sm text-neutral-600">Nâng lên Member bằng cách hoàn thành 1 đơn hàng để lưu trữ không giới hạn.</p>
              </div>
            </div>
            <Link href="/products" className="w-full md:w-auto px-6 py-2.5 bg-brand-navy hover:bg-brand-navy/90 text-white rounded-lg text-label-md font-semibold transition-colors shrink-0 shadow-md text-center">
              Mua hàng ngay
            </Link>
          </div>
        )}

        {/* LOADING STATE */}
        {isLoading ? (
          <div className="flex justify-center items-center py-40">
            <div className="w-10 h-10 border-4 border-brand-navy border-t-transparent rounded-full animate-spin" />
          </div>
        ) : displayHistory.length === 0 ? (
          /* EMPTY STATE */
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white rounded-2xl border border-neutral-200 border-dashed">
            <div className="relative w-24 h-24 mb-6">
              <div className="absolute inset-0 bg-brand-navy/5 rounded-full animate-pulse"></div>
              <Camera className="w-12 h-12 text-neutral-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              <Sparkles className="w-6 h-6 text-brand-navy absolute top-2 right-2" />
            </div>
            <h3 className="text-heading-h3 font-semibold text-neutral-900 mb-2">
              {searchTerm || selectedCategory !== 'Tất cả' ? 'Không tìm thấy kết quả' : 'Chưa có lịch sử thử đồ'}
            </h3>
            <p className="text-body-md text-neutral-500 mb-8 max-w-md">
              {searchTerm || selectedCategory !== 'Tất cả' 
                ? 'Hãy thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm của bạn.' 
                : 'Những bộ trang phục bạn đã thử bằng AI sẽ xuất hiện ở đây. Hãy khám phá và thử đồ ngay!'}
            </p>
            <Link 
              href="/products"
              className="px-6 py-3 bg-brand-navy hover:bg-brand-navy/90 text-white rounded-xl text-label-md font-semibold transition-colors shadow-md flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" /> Khám phá sản phẩm
            </Link>
          </div>
        ) : (
          /* COLUMNS (MASONRY) GRID */
          <div className="columns-1 sm:columns-2 md:columns-3 gap-6 space-y-6">
            {displayHistory.map((item) => {
              const isSelected = selectedItems.has(item.id);
              const productName = item.product?.name || item.productId || 'Sản phẩm tự do';
              return (
                <div 
                  key={item.id} 
                  className={`break-inside-avoid mb-6 group relative rounded-xl overflow-hidden bg-white shadow-sm border transition-all duration-300 ${
                    isSelected ? 'border-brand-navy ring-2 ring-brand-navy/20 scale-[0.98]' : 'border-neutral-200 hover:shadow-md'
                  }`}
                >
                  {/* Checkbox */}
                  <button 
                    onClick={(e) => toggleSelect(item.id, e)}
                    type="button"
                    className={`absolute top-3 left-3 w-6 h-6 rounded-md flex items-center justify-center z-20 transition-all ${
                      isSelected 
                        ? 'bg-brand-navy border-2 border-brand-navy' 
                        : 'bg-white/80 border-2 border-neutral-300 text-transparent opacity-0 group-hover:opacity-100 hover:bg-white scale-90 group-hover:scale-100 backdrop-blur-sm'
                    } text-white`}
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>

                  {/* Cache Badge */}
                  {item.isCacheHit && (
                    <div 
                      className="absolute top-3 right-3 z-20 bg-brand-gold/90 backdrop-blur text-white w-7 h-7 rounded-full flex items-center justify-center shadow-sm"
                      title="Kết quả được tối ưu tốc độ (Cache)"
                    >
                      <Zap className="w-4 h-4" />
                    </div>
                  )}

                  {/* Image Container */}
                  <div className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-100 cursor-pointer">
                    <img 
                      src={item.resultUrl} 
                      alt={productName} 
                      className={`w-full h-full object-cover transition-transform duration-500 ${isSelected ? 'scale-105' : 'group-hover:scale-105'}`}
                    />
                    
                    {/* Hover Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Hover Actions */}
                    <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0 z-10">
                      <a href={item.resultUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/90 hover:bg-white backdrop-blur rounded-full flex items-center justify-center text-brand-navy shadow-lg transition-colors" title="Xem ảnh đầy đủ">
                        <Eye className="w-5 h-5" />
                      </a>
                      <button 
                        onClick={(e) => handleDownload(item.resultUrl, `${productName.replace(/\s+/g, '-')}-tryon.png`, e)}
                        className="w-10 h-10 bg-white/90 hover:bg-white backdrop-blur rounded-full flex items-center justify-center text-brand-navy shadow-lg transition-colors" 
                        title="Tải về"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={(e) => handleDeleteItem(item.id, e)}
                        disabled={isDeleting}
                        className="w-10 h-10 bg-white/90 hover:bg-semantic-error hover:text-white backdrop-blur rounded-full flex items-center justify-center text-semantic-error shadow-lg transition-colors disabled:opacity-50" 
                        title="Xóa"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Bottom Info */}
                  <div className="p-4 border-t border-neutral-100">
                    <div className="text-[11px] font-bold tracking-wider uppercase text-neutral-400 mb-1 flex items-center justify-between">
                      <span>{item.category}</span>
                      <span>{formatDate(item.createdAt)}</span>
                    </div>
                    <h4 className="text-body-sm font-semibold text-neutral-800 line-clamp-1">
                      {productName}
                    </h4>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
      </div>
    </div>
  );
}
