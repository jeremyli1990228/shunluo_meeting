import { X, AlertCircle, CheckCircle, Clock, Phone } from 'lucide-react';
import { useMeeting } from '@/context/MeetingContext';

export const Modal = () => {
  const { state, dispatch } = useMeeting();
  const { activeModal, modalData } = state;

  if (!activeModal) return null;

  const handleClose = () => {
    dispatch({ type: 'CLOSE_MODAL' });
  };

  const renderContent = () => {
    switch (activeModal) {
      case 'reminder': {
        const { meeting, minutesRemaining } = modalData as { meeting: { title: string }; minutesRemaining: number };
        return (
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">会议即将结束</h3>
            <p className="text-gray-600 mb-4">
              本次会议「{meeting.title}」还有 <span className="text-blue-600 font-bold">{minutesRemaining}</span> 分钟即将结束
            </p>
            <button
              onClick={handleClose}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
            >
              我知道了
            </button>
          </div>
        );
      }

      case 'confirm': {
        const { title, message, onConfirm } = modalData as { title: string; message: string; onConfirm: () => void };
        return (
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleClose}
                className="px-5 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  handleClose();
                }}
                className="px-5 py-3 bg-orange-600 text-white rounded-xl font-medium hover:bg-orange-700 transition-colors"
              >
                确认
              </button>
            </div>
          </div>
        );
      }

      case 'success': {
        const { order } = modalData as { order: { items: { name: string; quantity: number }[] } };
        return (
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">下单成功</h3>
            <p className="text-gray-600 mb-4">您的订单已提交，工作人员将尽快送达</p>
            <div className="bg-gray-50 rounded-xl p-4 mb-6 max-h-40 overflow-y-auto">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                  <span className="text-gray-700">{item.name}</span>
                  <span className="text-gray-500">x{item.quantity}</span>
                </div>
              ))}
            </div>
            <button
              onClick={handleClose}
              className="px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors"
            >
              确定
            </button>
          </div>
        );
      }

      case 'order': {
        return (
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
              <Phone className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">呼叫确认</h3>
            <p className="text-gray-600 mb-6">请确认您的订单信息，确认后将呼叫服务人员</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleClose}
                className="px-5 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => {
                  handleClose();
                }}
                className="px-5 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
              >
                确认下单
              </button>
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 relative animate-in fade-in zoom-in duration-200">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
        {renderContent()}
      </div>
    </div>
  );
};
