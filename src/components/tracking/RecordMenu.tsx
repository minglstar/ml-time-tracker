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
  <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={onClose}>
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
