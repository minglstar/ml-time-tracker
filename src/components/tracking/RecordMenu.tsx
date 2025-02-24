import React from 'react';
import { Menu, MenuItem } from '@mui/material';
import { TimerRecord } from '../../types/types';

interface RecordMenuProps {
  anchorEl: HTMLElement | null;
  selectedRecord: TimerRecord | null;
  onClose: () => void;
  onContinue: () => void;
  onDelete: (id: string) => void;
}

const RecordMenu: React.FC<RecordMenuProps> = ({
  anchorEl,
  selectedRecord,
  onClose,
  onContinue,
  onDelete,
}) => (
  <Menu
    anchorEl={anchorEl}
    open={Boolean(anchorEl)}
    onClose={onClose}
    disableScrollLock
    PaperProps={{
      sx: {
        mt: 1,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        minWidth: 120,
      },
    }}
  >
    <MenuItem onClick={onContinue}>继续计时</MenuItem>
    <MenuItem
      onClick={() => {
        if (selectedRecord) {
          onDelete(selectedRecord.id);
        }
        onClose();
      }}
    >
      删除
    </MenuItem>
  </Menu>
);

export default RecordMenu;
