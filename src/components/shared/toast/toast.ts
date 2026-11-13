

export type ToastKind = 'success' | 'info' | 'warning' | 'error';

export interface ToastMessage {
  id: number;
  title: string;
  kind: ToastKind;
}

let toasts: ToastMessage[] = [];
let nextId = 1;
const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

export function showToast(title: string, kind: ToastKind = 'success') {
  const id = nextId++;
  toasts = [...toasts, { id, title, kind }];
  emitChange();
  setTimeout(() => dismissToast(id), 4000);
}

export function dismissToast(id: number) {
  toasts = toasts.filter((toast) => toast.id !== id);
  emitChange();
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getToasts() {
  return toasts;
}
