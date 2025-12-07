/**
 * useConfirm Composable
 * 提供全域的確認對話框功能，取代原生 confirm()
 */

import { reactive } from "vue";

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
}

interface ConfirmState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  variant: "danger" | "warning" | "info";
  resolve: ((value: boolean) => void) | null;
}

// 全域狀態
const state = reactive<ConfirmState>({
  isOpen: false,
  title: "",
  message: "",
  confirmText: "確認",
  cancelText: "取消",
  variant: "info",
  resolve: null,
});

/**
 * 顯示確認對話框並返回 Promise
 * @param options 對話框選項
 * @returns Promise<boolean> - 使用者確認返回 true，取消返回 false
 */
const confirm = (options: ConfirmOptions): Promise<boolean> => {
  return new Promise((resolve) => {
    state.isOpen = true;
    state.title = options.title || "";
    state.message = options.message;
    state.confirmText = options.confirmText || "確認";
    state.cancelText = options.cancelText || "取消";
    state.variant = options.variant || "info";
    state.resolve = resolve;
  });
};

/**
 * 處理確認
 */
const handleConfirm = () => {
  if (state.resolve) {
    state.resolve(true);
  }
  state.isOpen = false;
  state.resolve = null;
};

/**
 * 處理取消
 */
const handleCancel = () => {
  if (state.resolve) {
    state.resolve(false);
  }
  state.isOpen = false;
  state.resolve = null;
};

/**
 * useConfirm Hook
 */
export const useConfirm = () => {
  return {
    state,
    confirm,
    handleConfirm,
    handleCancel,
  };
};

export default useConfirm;
