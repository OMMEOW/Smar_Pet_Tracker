import { AlertTriangle, X } from 'lucide-react';

interface AlertBoxProps {
  title: string;
  message: string;
  onClose: () => void;
}

export function AlertBox({ title, message, onClose }: AlertBoxProps) {
  return (
    <div className="w-96 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl shadow-2xl shadow-red-500/50 p-6 border-2 border-red-400 animate-in slide-in-from-top-5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-white">{title}</h3>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/20 transition-colors"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>
      
      <p className="text-sm text-white/90 mb-4">{message}</p>
      
      <div className="flex gap-2">
        <button className="flex-1 px-4 py-2 bg-white text-red-600 rounded-lg text-sm hover:bg-white/90 transition-colors">
          View Location
        </button>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg text-sm hover:bg-white/30 transition-colors"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
