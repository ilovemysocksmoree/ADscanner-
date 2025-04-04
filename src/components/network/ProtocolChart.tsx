import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';
import { Box, Typography, Paper } from '@mui/material';
import { ProtocolData } from '../../interfaces/networkScanner';

interface ProtocolChartProps {
  data: ProtocolData[];
  title?: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#AF19FF', '#FF5733', '#C70039'];

const ProtocolChart: React.FC<ProtocolChartProps> = ({ 
  data, 
  title = 'Protocol Distribution'
}) => {
  // Calculate percentages
  const totalCount = data.reduce((sum, item) => sum + item.count, 0);
  const dataWithPercentage = data.map(item => ({
    ...item,
    percentage: totalCount > 0 ? Math.round((item.count / totalCount) * 100) : 0
  }));

  // Sort by count descending
  const sortedData = [...dataWithPercentage].sort((a, b) => b.count - a.count);

  // Custom tooltip formatter
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Paper elevation={3} sx={{ p: 1.5, backgroundColor: 'background.paper' }}>
          <Typography variant="subtitle2">{data.protocol}</Typography>
          <Typography variant="body2">Count: {data.count.toLocaleString()}</Typography>
          <Typography variant="body2">Percentage: {data.percentage}%</Typography>
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
          <PieChart>
            <Pie
              data={sortedData}
              dataKey="count"
              nameKey="protocol"
              cx="50%"
              cy="50%"
              outerRadius="70%"
              innerRadius="40%"
              paddingAngle={1}
              label={({ protocol, percentage }) => `${protocol}: ${percentage}%`}
              labelLine={false}
            >
              {sortedData.map((entry, index) => (
                <Cell
                  key={`cell-${entry.protocol}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No data available
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default ProtocolChart;