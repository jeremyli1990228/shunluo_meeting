import { Clock, Users, AlertCircle } from 'lucide-react';
import { Meeting } from '@/types';
import { formatTime, getMinutesRemaining } from '@/utils/timeUtils';

interface MeetingCardProps {
  meeting: Meeting;
  onEnd?: () => void;
  showEndButton?: boolean;
}

export const MeetingCard = ({ meeting, onEnd, showEndButton = true }: MeetingCardProps) => {
  const minutesRemaining = getMinutesRemaining(meeting.endTime);
  const isImportant = meeting.level === 'important';

  const cardClasses = isImportant
    ? 'bg-gradient-to-br from-red-600 via-red-700 to-red-800 text-white'
    : 'bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 text-white';

  return (
    <div className={`relative rounded-2xl p-5 shadow-lg overflow-hidden ${cardClasses}`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            isImportant ? 'bg-red-500/30 text-red-100' : 'bg-blue-400/30 text-blue-100'
          }`}>
            {isImportant ? '重要会议' : '普通会议'}
          </span>
        </div>

        <h3 className="text-xl font-bold mb-3 truncate">{meeting.title}</h3>

        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2 text-white/80">
            <Clock className="w-4 h-4" />
            <span className="text-sm">
              {formatTime(meeting.startTime)} - {formatTime(meeting.endTime)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-white/70 mb-4">
          <Users className="w-4 h-4" />
          <span className="text-sm">
            {meeting.participants.join('、')}
          </span>
        </div>

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
            className="mt-4 w-full py-2.5 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-medium transition-colors backdrop-blur-sm"
          >
            提前结束会议
          </button>
        )}
      </div>
    </div>
  );
};
