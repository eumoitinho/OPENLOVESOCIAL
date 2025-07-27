import { useState, useCallback } from "react"

interface PostToast {
  id: string;
  title: string;
  content: string;
  author: string;
  timestamp: Date;
  postId: string;
}

export const usePostToast = () => {
  const [toasts, setToasts] = useState<PostToast[]>([]);

  const showToast = useCallback((toast: Omit<PostToast, 'id' | 'timestamp'>) => {
    const newToast: PostToast = {
      ...toast,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date() };
    
    setToasts(prev => [...prev, newToast]);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      hideToast(newToast.id);
    }, 5000);
  }, []);

  const hideToast = useCallback((toastId: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== toastId));
  }, []);

  const hideAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return {
    toasts,
    showToast,
    hideToast,
    hideAllToasts };
}; 
