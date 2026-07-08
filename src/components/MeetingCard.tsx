import { Clock, Users, AlertCircle, Phone, Tag, Building2, FileText, Paperclip } from 'lucide-react';
import { Meeting } from '@/types';
import { formatTime, getMinutesRemaining } from '@/utils/timeUtils';

interface MeetingCardProps {
  meeting: Meeting;
  onEnd?: () => void;
  showEndButton?: boolean;
}

const getFileIcon = (type: string) => {
  const iconMap: Record<string, string> = {
    pdf: '📄',
    docx: '📝',
    xlsx: '📊',
    pptx: '📽️',
    png: '🖼️',
    jpg: '🖼️',
    zip: '📦',
    figma: '🎨',
    txt: '📃',
  };
  return iconMap[type] || '📎';
};

export const MeetingCard = ({ meeting, onEnd, showEndButton = true }: MeetingCardProps) => {
  const minutesRemaining = getMinutesRemaining(meeting.endTime);
  const isImportant = meeting.level === 'important';

  const cardClasses = isImportant
    ? 'bg-gradient-to-br from-red-600 via-red-700 to-red-800 text-white'
    : 'bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 text-white';

  return (
    <div className={`relative rounded-2xl p-6 shadow-lg overflow-hidden ${cardClasses}`}>
      <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
      
      <div className="relative z-10 space-y-5">
        <h3 className="text-2xl font-bold">{meeting.title}</h3>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-white/80">
            <Clock className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">
              {formatTime(meeting.startTime)} - {formatTime(meeting.endTime)}
            </span>
          </div>
          {meeting.contact && (
            <div className="flex items-center gap-2 text-white/80">
              <Phone className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm truncate">{meeting.contact}</span>
            </div>
          )}
          {meeting.category && (
            <div className="flex items-center gap-2 text-white/80">
              <Tag className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{meeting.category}</span>
            </div>
          )}
          {meeting.department && (
            <div className="flex items-center gap-2 text-white/80">
              <Building2 className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{meeting.department}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 text-white/70">
          <Users className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm">
            {meeting.participants.join('、')}
          </span>
        </div>

        {meeting.content && (
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-white/70" />
              <span className="text-sm font-medium text-white/90">会议内容</span>
            </div>
            <p className="text-sm text-white/80 leading-relaxed">{meeting.content}</p>
          </div>
        )}

        {meeting.attachments && meeting.attachments.length > 0 && (
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-3">
              <Paperclip className="w-4 h-4 text-white/70" />
              <span className="text-sm font-medium text-white/90">
                会议附件 ({meeting.attachments.length})
              </span>
            </div>
            <div className="space-y-2">
              {meeting.attachments.map(att => (
                <div
                  key={att.id}
                  className="flex items-center gap-3 p-2 rounded-lg bg-white/10 hover:bg-white/20 cursor-pointer transition-colors"
                >
                  <span className="text-lg">{getFileIcon(att.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white/90 truncate">{att.name}</p>
                    {att.size && <p className="text-xs text-white/60">{att.size}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {meeting.status === 'ongoing' && (
          <div className={`flex items-center gap-2 p-3 rounded-xl ${
            isImportant ? 'bg-red-500/20' : 'bg-blue-400/20'
          }`}>
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm font-medium">
              剩余时长：还有{minutesRemaining}分钟结束
            </span>
          </div>
        )}

        {showEndButton && meeting.status === 'ongoing' && onEnd && (
          <button
            onClick={onEnd}
            className="w-full py-3 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-medium transition-colors backdrop-blur-sm"
          >
            提前结束会议
          </button>
        )}
      </div>
    </div>
  );
};
