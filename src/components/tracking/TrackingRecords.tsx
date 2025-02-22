import React, { useState } from 'react';
import { Box } from '@mui/material';
import { TimerRecord, Project } from '../../types/types';
import RecordMenu from './RecordMenu';
// 移除未使用的 RecordCard 导入
import DateGroup from './DateGroup';
import { formatTime, groupRecordsByDate } from '../../utils/utils';

interface TrackingRecordsProps {
  records: TimerRecord[];
  onDeleteRecord: (id: string) => void;
  onContinueRecord?: (record: TimerRecord) => void;
  projects?: Project[];
}



const TrackingRecords: React.FC<TrackingRecordsProps> = ({ records, onDeleteRecord, onContinueRecord, projects }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRecord, setSelectedRecord] = useState<TimerRecord | null>(null);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, record: TimerRecord) => {
    setAnchorEl(event.currentTarget);
    setSelectedRecord(record);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRecord(null);
  };

  const handleContinue = () => {
    if (selectedRecord && onContinueRecord) {
      onContinueRecord(selectedRecord);
    }
    handleMenuClose();
  };



  return (
    <Box sx={{ mt: 3 }}>
      {Object.entries(groupRecordsByDate(records)).map(([date, dateRecords]) => (
        <DateGroup
          key={date}
          date={date}
          records={dateRecords}
          formatTime={formatTime}
          onMenuClick={handleMenuClick}
          onMenuClose={handleMenuClose}
          projects={projects}
        />
      ))}
      <RecordMenu
        anchorEl={anchorEl}
        selectedRecord={selectedRecord}
        onClose={handleMenuClose}
        onContinue={handleContinue}
        onDelete={onDeleteRecord}
      />
    </Box>
  );
};

export default TrackingRecords;