import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

export default function CircularIndeterminate() {
  return (
    <Box>
      <CircularProgress size="1em" sx={{ color: 'white' }}/>
    </Box>
  );
}