import { X } from "lucide-react";
import { toast } from "sonner";

export const showSuccessToast = (message: string) => {
  toast.custom((t) => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-md flex items-center justify-between gap-3 min-w-80">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        <span className="text-sm text-gray-800">{message}</span>
      </div>
      <button
        onClick={() => toast.dismiss(t)}
        className="text-gray-500 hover:text-gray-700 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  ));
};

export const showErrorToast = (message: string) => {
  toast.custom((t) => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-md flex items-center justify-between gap-3 min-w-80">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
        <span className="text-sm text-gray-800">{message}</span>
      </div>
      <button
        onClick={() => toast.dismiss(t)}
        className="text-gray-500 hover:text-gray-700 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  ));
};

export const showWarningToast = (message: string) => {
  toast.custom((t) => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-md flex items-center justify-between gap-3 min-w-80">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
        <span className="text-sm text-gray-800">⚠️ {message}</span>
      </div>
      <button
        onClick={() => toast.dismiss(t)}
        className="text-gray-500 hover:text-gray-700 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  ));
};
