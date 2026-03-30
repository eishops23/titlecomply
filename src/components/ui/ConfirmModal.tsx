"use client";

import { Button } from "./button";
import { Modal } from "./modal";

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "default";
  isLoading?: boolean;
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  isLoading = false,
}: ConfirmModalProps) {
  const confirmButton =
    variant === "danger" ? (
      <Button
        type="button"
        variant="danger"
        onClick={onConfirm}
        loading={isLoading}
      >
        {confirmLabel}
      </Button>
    ) : variant === "warning" ? (
      <Button
        type="button"
        variant="primary"
        onClick={onConfirm}
        loading={isLoading}
        className="bg-amber-500 text-white hover:bg-amber-600 focus-visible:ring-amber-500/40 disabled:bg-amber-500/50"
      >
        {confirmLabel}
      </Button>
    ) : (
      <Button type="button" variant="primary" onClick={onConfirm} loading={isLoading}>
        {confirmLabel}
      </Button>
    );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
            className="border border-gray-300 text-gray-700 hover:bg-slate-50"
          >
            {cancelLabel}
          </Button>
          {confirmButton}
        </>
      }
    >
      <p className="text-sm text-muted">{message}</p>
    </Modal>
  );
}
