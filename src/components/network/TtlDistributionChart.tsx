import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { Box, Typography, Paper } from '@mui/material';
import { TtlDistributionData } from '../../interfaces/networkScanner';

interface TtlDistributionChartProps {
  data: TtlDistributionData[];
  title?: string;
  color?: string;
}

const TtlDistributionChart: React.FC<TtlDistributionChartProps> = ({
  data,
  title = 'TTL Distribution',
  color = '#FF8042',
}) => {
  // Sort by TTL value ascending
  const sortedData = [...data].sort((a, b) => a.ttl - b.ttl);

  // Custom tooltip formatter
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Paper elevation={3} sx={{ p: 1.5, backgroundColor: 'background.paper' }}>
          <Typography variant="subtitle2">TTL: {data.ttl}</Typography>
          <Typography variant="body2">Count: {data.count.toLocaleString()}</Typography>
        </Paper>
      );
    }
    return null;
  };

  return (
    <Paper sx={{ p: 2, height: 400 }}>
      <Typography variant="h6" gutterBottom align="center">
        {title}
      </Typography>
      
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height="90%">
          <BarChart data={sortedData} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="ttl" 
              label={{ 
                value: 'TTL Value', 
                position: 'insideBottom', 
                offset: -10 
              }}
            />
            <YAxis 
              label={{ 
                value: 'Packet Count', 
                angle: -90, 
                position: 'insideLeft' 
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="count" name="Packet Count" fill={color} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No TTL distribution data available
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default TtlDistributionChart; 