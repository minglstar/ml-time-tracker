import React from 'react';
import { Box, IconButton, Paper, Typography } from '@mui/material';
import { Edit } from '@mui/icons-material';

interface TaskInfoEditorProps {
  title: string;
  earned: string;
  customer: string;
  onEditTitle: () => void;
  onEditEarned: () => void;
  onEditCustomer: () => void;
}

const TaskInfoEditor: React.FC<TaskInfoEditorProps> = ({
  title,
  earned,
  customer,
  onEditTitle,
  onEditEarned,
  onEditCustomer
}) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1" sx={{ flexGrow: 1 }}>
          {title}
        </Typography>
        <IconButton size="small" onClick={onEditTitle}>
          <Edit />
        </IconButton>
      </Box>

      <Paper variant="outlined" sx={{ p: 2, flexGrow: 1, mr: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, alignItems: 'center' }}>
          <Typography color="text.secondary">Earned</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography>{earned}</Typography>
            <IconButton size="small" onClick={onEditEarned}>
              <Edit fontSize="small" />
            </IconButton>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography color="text.secondary">Customer</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography>{customer}</Typography>
            <IconButton size="small" onClick={onEditCustomer}>
              <Edit fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default TaskInfoEditor;