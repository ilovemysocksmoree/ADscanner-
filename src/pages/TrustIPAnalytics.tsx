import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  CircularProgress,
  Chip,
  Card,
  CardContent,
  Alert,
  Rating,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  LinearProgress,
  IconButton,
  styled,
  Link,
} from '@mui/material';
import {
  Security as SecurityIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Timeline as TimelineIcon,
  Language as LanguageIcon,
  Flag as FlagIcon,
  Speed as SpeedIcon,
  Public as PublicIcon,
  BugReport as BugReportIcon,
  Shield as ShieldIcon,
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
  TooltipProps
} from 'recharts';

interface IPAnalysisResult {
  ip: string;
  riskScore: number;
  origin: {
    country: string;
    city: string;
    asn: string;
    requests: string;
  };
  reputation: {
    knownAs: string[];
    knownFor: string[];
  };
  violations: {
    type: string;
    percentage: number;
  }[];
  violationsOverTime: {
    date: string;
    pathTraversal: number;
    automatedAttack: number;
    sqli: number;
    rce: number;
    spam: number;
    misc: number;
    xss: number;
  }[];
  targetIndustries: {
    name: string;
    percentage: number;
  }[];
  geographicalTargets: {
    source: string;
    target: string;
    weight: number;
  }[];
}

interface RecentIP {
  ip: string;
  country: string;
  flag: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#FF4842'];

const INITIAL_RECENT_IPS: RecentIP[] = [
  { ip: '44.197.185.15', country: 'US', flag: '🇺🇸' },
  { ip: '31.13.127.3', country: 'IE', flag: '🇮🇪' },
  { ip: '161.97.118.98', country: 'FR', flag: '🇫🇷' },
  { ip: '149.28.70.75', country: 'US', flag: '🇺🇸' },
  { ip: '158.46.166.233', country: 'TH', flag: '🇹🇭' },
];

const mockAnalysis = (ip: string): Promise<IPAnalysisResult> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        ip,
        riskScore: 71,
        origin: {
          country: 'United States',
          city: 'Brea',
          asn: 'DREAMHOST-AS (#26347)',
          requests: '43.2K'
        },
        reputation: {
          knownAs: ['GoogleBot Impersonators'],
          knownFor: ['IP reputation Medium risk']
        },
        violations: [
          { type: 'Automated Attack', percentage: 86 },
          { type: 'Path Traversal/LFI', percentage: 10 },
          { type: 'SQLi', percentage: 2 },
          { type: 'Other Violations', percentage: 2 }
        ],
        violationsOverTime: Array.from({ length: 14 }, (_, i) => ({
          date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          pathTraversal: Math.floor(Math.random() * 100),
          automatedAttack: Math.floor(Math.random() * 100),
          sqli: Math.floor(Math.random() * 50),
          rce: Math.floor(Math.random() * 30),
          spam: Math.floor(Math.random() * 20),
          misc: Math.floor(Math.random() * 10),
          xss: Math.floor(Math.random() * 40)
        })).reverse(),
        targetIndustries: [
          { name: 'Unclassified', percentage: 38 },
          { name: 'Healthcare', percentage: 14 },
          { name: 'Retail', percentage: 10 },
          { name: 'Other Industries', percentage: 38 }
        ],
        geographicalTargets: [
          { source: 'United States', target: 'Brazil', weight: 10 },
          { source: 'United States', target: 'Mexico', weight: 8 },
          { source: 'United States', target: 'Colombia', weight: 6 }
        ]
      });
    }, 1500);
  });
};

const RiskScoreGauge = ({ score }: { score: number }) => {
  return (
    <Box sx={{ position: 'relative', width: '100%', maxWidth: '200px', height: '120px' }}>
      <svg width="100%" height="100%" viewBox="0 0 200 100">
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fdd835" />
            <stop offset="50%" stopColor="#ff9800" />
            <stop offset="100%" stopColor="#f44336" />
          </linearGradient>
        </defs>
        
        {/* Background Arc */}
        <path
          d="M 20 80 A 60 60 0 0 1 180 80"
          fill="none"
          stroke="#f5f5f5"
          strokeWidth="16"
          strokeLinecap="round"
        />
        
        {/* Score Arc */}
        <path
          d="M 20 80 A 60 60 0 0 1 180 80"
          fill="none"
          stroke="url(#gaugeGradient)"
          strokeWidth="16"
          strokeLinecap="round"
          strokeDasharray={`${(score / 100) * 251.2} 251.2`}
        />
        
        {/* Indicator */}
        <g transform={`rotate(${(score / 100) * 180 - 90}, 100, 80)`}>
          <line
            x1="100"
            y1="80"
            x2="100"
            y2="40"
            stroke="#333"
            strokeWidth="1.5"
          />
          <circle cx="100" cy="40" r="3" fill="#333" />
        </g>
        
        {/* Score Text */}
        <text
          x="100"
          y="70"
          textAnchor="middle"
          fontSize="28"
          fontWeight="500"
          fill="#333"
        >
          {score}
        </text>
        
        {/* Labels */}
        <text x="20" y="95" fontSize="12" fill="#666">Low</text>
        <text x="170" y="95" fontSize="12" fill="#666">High</text>
      </svg>
    </Box>
  );
};

// Styled components
const SearchTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    borderRadius: '16px',
    backgroundColor: 'white',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    transition: 'all 0.3s ease',
    '& fieldset': {
      borderColor: 'transparent',
    },
    '&:hover': {
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      '& fieldset': {
        borderColor: 'transparent',
      }
    },
    '&.Mui-focused': {
      boxShadow: '0 4px 16px rgba(25, 118, 210, 0.15)',
      '& fieldset': {
        borderColor: '#1976d2',
      }
    },
    '& input': {
      padding: '10px 16px',
      fontSize: '0.9rem',
      '&::placeholder': {
        color: '#9e9e9e',
        opacity: 1,
      }
    }
  },
});

const SearchButton = styled(IconButton)({
  position: 'absolute',
  right: '4px',
  top: '50%',
  transform: 'translateY(-50%)',
  backgroundColor: '#1976d2',
  color: 'white',
  width: '32px',
  height: '32px',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: '#1565c0',
    transform: 'translateY(-50%) scale(1.05)',
  },
  '& .MuiSvgIcon-root': {
    fontSize: '1rem',
  }
});

export default function TrustIPAnalytics() {
  const [ipAddress, setIpAddress] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<IPAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recentIPs, setRecentIPs] = useState<RecentIP[]>(INITIAL_RECENT_IPS);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const handleSearch = async () => {
    if (!ipAddress) {
      setError('Please enter an IP address');
      return;
    }

    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(ipAddress)) {
      setError('Invalid IP address format');
      return;
    }

    setError(null);
    setIsAnalyzing(true);
    try {
      const result = await mockAnalysis(ipAddress);
      setAnalysisResult(result);
      // Add to recent IPs if not already present
      const newIP = {
        ip: ipAddress,
        country: result.origin.country,
        flag: getCountryFlag(result.origin.country)
      };
      setRecentIPs(prevIPs => {
        const exists = prevIPs.some(ip => ip.ip === ipAddress);
        if (!exists) {
          return [newIP, ...prevIPs.slice(0, 4)];
        }
        return prevIPs;
      });
      setShowAnalysis(true);
    } catch (err) {
      setError('Failed to analyze IP address');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  // Add helper function for country flags
  const getCountryFlag = (country: string): string => {
    const flags: { [key: string]: string } = {
      'Japan': '🇯🇵',
      'United States': '🇺🇸',
      'China': '🇨🇳',
      'South Korea': '🇰🇷',
      // Add more countries as needed
    };
    return flags[country] || '🌐';
  };

  if (showAnalysis && analysisResult) {
  return (
      <Box sx={{ 
        minHeight: '100vh',
        bgcolor: '#fff',
        p: 3
      }}>
        {/* Risk and Origin Section */}
        <Box sx={{ 
              bgcolor: '#fff',
          borderRadius: 1,
          mb: 3
        }}>
          <Typography variant="h6" sx={{ 
            color: '#666',
            fontSize: '0.875rem',
            fontWeight: 500,
            mb: 2,
            textTransform: 'none'
          }}>
            Risk and origin
          </Typography>

          <Grid container spacing={3}>
            {/* Risk Score */}
            <Grid item xs={12} md={4}>
              <Box>
                <Typography variant="subtitle2" sx={{ 
                  mb: 2, 
                  color: '#666',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  textTransform: 'uppercase'
                }}>
                  RISK SCORE <InfoIcon sx={{ fontSize: '1rem', color: '#999', opacity: 0.7 }} />
              </Typography>
                <RiskScoreGauge score={75} />
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'flex-start',
                  gap: 1,
                  mt: 2
                }}>
                  <Box sx={{ 
                    width: '8px', 
                    height: '8px', 
                    borderRadius: '50%', 
                    bgcolor: '#2196f3', 
                    mt: 0.6 
                  }} />
                  <Typography variant="body2" sx={{ 
                    color: '#666',
                    fontSize: '0.85rem',
                    lineHeight: 1.4
                  }}>
                    Risk score reason: Low magnitude RCE/RFI, Backdoor/Trojan attacks targeting many customers
              </Typography>
            </Box>
              </Box>
            </Grid>

            {/* Origin & Reputation */}
            <Grid item xs={12} md={8}>
              <Box>
                <Typography variant="subtitle2" sx={{ 
                  mb: 2,
                  color: '#666',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5
                }}>
                  ORIGIN <InfoIcon sx={{ fontSize: '1rem', color: '#999', opacity: 0.7 }} />
              </Typography>
              <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                        <Typography sx={{ 
                          color: '#666',
                          fontSize: '0.75rem',
                          width: '80px'
                        }}>
                    Country
                  </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography sx={{ fontSize: '0.875rem', color: '#333' }}>Japan</Typography>
                          <Box component="img" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAALCAYAAAB24g05AAAACXBIWXMAAAsTAAALEwEAmpwYAAABEElEQVQokZXSPUsDQRAG4GcvuUAUFCwEQYJgYaGdWFiIhYiFlX/B0kLwJ1hYiYWFhYVYWFhYiJ2FhYVYCIKFIAhBEEQQgkJAYpFbvdxlL5d44DBvM7Mzu+/uRXEcK0Yd27jBHZbxhBk8Yx8bmMQIVrCFR0wjxTWOsIxpPGAfDQWAKg7QxiD6cYYWtnGPBKNI0UAXhxjDEFbRg0XsIUUZTbygF5c4wQ0qSHCOBvpQ+mHcxTvqmMMNLjCBccQ4xBs2MY8EZZz+BvCXlHGMd8yhimtcYQJ1vOIe42jjDvN/gYsAKQZwhnc0MY0mzjGJUbxhB6NYwyeaWMBcnvGXRHEcJ1jCJnbxhB4MYwdP2MVnl/9fvt2TPzX0NgIAAAAASUVORK5CYII=" sx={{ width: 16, height: 12 }} />
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                        <Typography sx={{ 
                          color: '#666',
                          fontSize: '0.75rem',
                          width: '80px'
                        }}>
                    ASN
                  </Typography>
                        <Typography sx={{ fontSize: '0.875rem', color: '#333' }}>
                          MICROSOFT-CORP-MSN-AS-BLOCK (#8075)
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                        <Typography sx={{ 
                          color: '#666',
                          fontSize: '0.75rem',
                          width: '80px'
                        }}>
                          Requests
                        </Typography>
                        <Typography sx={{ fontSize: '0.875rem', color: '#333' }}>
                          656.3K
                  </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>

                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" sx={{ 
                    mb: 2,
                    color: '#666',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5
                  }}>
                    REPUTATION <InfoIcon sx={{ fontSize: '1rem', color: '#999', opacity: 0.7 }} />
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
                      <Typography sx={{ color: '#666', fontSize: '0.75rem', mb: 1 }}>
                  Known to use
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip 
                          label="Microsoft" 
                    sx={{ 
                            bgcolor: '#e3f2fd',
                            color: '#1976d2',
                            height: '24px',
                      fontSize: '0.75rem',
                            borderRadius: '4px',
                            fontWeight: 400,
                            border: 'none'
                    }} 
                  />
                  <Chip 
                          label="Microsoft Azure" 
                    sx={{ 
                            bgcolor: '#e3f2fd',
                            color: '#1976d2',
                            height: '24px',
                      fontSize: '0.75rem',
                            borderRadius: '4px',
                            fontWeight: 400,
                            border: 'none'
                    }} 
                  />
                </Box>
              </Box>
              <Box>
                      <Typography sx={{ color: '#666', fontSize: '0.75rem', mb: 1 }}>
                  Known for
                </Typography>
                <Chip 
                  label="IP reputation Medium risk"
                  sx={{ 
                          bgcolor: '#e8f5e9',
                          color: '#2e7d32',
                          height: '24px',
                          fontSize: '0.75rem',
                          borderRadius: '4px',
                          fontWeight: 400,
                          border: 'none'
                        }} 
                      />
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Violations Over Time */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ 
            mb: 2,
            color: '#666',
                    fontSize: '0.75rem',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: 0.5
          }}>
            Violations over time <InfoIcon sx={{ fontSize: '1rem', color: '#999', opacity: 0.7 }} />
          </Typography>
          <Box sx={{ 
            height: 300,
            bgcolor: '#fff',
            borderRadius: 1,
            p: 2,
            '& .recharts-cartesian-grid-horizontal line, & .recharts-cartesian-grid-vertical line': {
              stroke: '#eee'
            },
            '& .recharts-tooltip-wrapper': {
              outline: 'none'
            }
          }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart 
                data={[
                  { date: '26. Feb', pathTraversal: 0, automatedAttack: 100, sqli: 0, misc: 0 },
                  { date: '27. Feb', pathTraversal: 200, automatedAttack: 300, sqli: 50, misc: 20 },
                  { date: '28. Feb', pathTraversal: 0, automatedAttack: 0, sqli: 0, misc: 0 },
                  { date: '1. Mar', pathTraversal: 800, automatedAttack: 100, sqli: 100, misc: 0 },
                  { date: '2. Mar', pathTraversal: 850, automatedAttack: 50, sqli: 150, misc: 0 },
                  { date: '3. Mar', pathTraversal: 400, automatedAttack: 0, sqli: 200, misc: 0 },
                  { date: '4. Mar', pathTraversal: 200, automatedAttack: 0, sqli: 0, misc: 0 },
                  { date: '5. Mar', pathTraversal: 100, automatedAttack: 0, sqli: 0, misc: 0 },
                  { date: '6. Mar', pathTraversal: 300, automatedAttack: 900, sqli: 100, misc: 0 },
                  { date: '7. Mar', pathTraversal: 200, automatedAttack: 2200, sqli: 150, misc: 0 },
                  { date: '8. Mar', pathTraversal: 100, automatedAttack: 1800, sqli: 200, misc: 0 },
                  { date: '9. Mar', pathTraversal: 300, automatedAttack: 900, sqli: 100, misc: 0 },
                  { date: '10. Mar', pathTraversal: 400, automatedAttack: 2000, sqli: 50, misc: 0 },
                  { date: '11. Mar', pathTraversal: 200, automatedAttack: 1000, sqli: 0, misc: 0 },
                  { date: '12. Mar', pathTraversal: 0, automatedAttack: 0, sqli: 0, misc: 0 }
                ]}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis 
                  dataKey="date" 
                  stroke="#666"
                  tick={{ fontSize: 12, fill: '#666' }}
                  tickLine={{ stroke: '#666' }}
                  axisLine={{ stroke: '#666' }}
                />
                <YAxis 
                  stroke="#666"
                  tick={{ fontSize: 12, fill: '#666' }}
                  tickLine={{ stroke: '#666' }}
                  axisLine={{ stroke: '#666' }}
                  tickFormatter={(value) => value === 0 ? '0' : `${value/1000}k`}
                  domain={[0, 3000]}
                />
                <RechartsTooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <Box sx={{
                          backgroundColor: 'white',
                          border: '1px solid #eee',
                          borderRadius: '4px',
                          padding: '8px 12px',
                          fontSize: '12px',
                          outline: 'none'
                        }}>
                          <Typography sx={{ mb: 1, fontWeight: 500 }}>{label}</Typography>
                          {payload.map((entry, index) => (
                            <Typography key={index} sx={{ color: entry.color }}>
                              {entry.name}: {entry.value}
                            </Typography>
                          ))}
                        </Box>
                      );
                    }
                    return null;
                  }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  iconType="line"
                  iconSize={10}
                  wrapperStyle={{ fontSize: '12px', color: '#666' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="pathTraversal" 
                  name="Path Traversal/LFI" 
                  stroke="#1976d2" 
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={{ r: 2, fill: '#1976d2' }}
                  activeDot={{ r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="automatedAttack" 
                  name="Automated Attack" 
                  stroke="#4caf50" 
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={{ r: 2, fill: '#4caf50' }}
                  activeDot={{ r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="sqli" 
                  name="SQLi" 
                  stroke="#9c27b0" 
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={{ r: 2, fill: '#9c27b0' }}
                  activeDot={{ r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="misc" 
                  name="MISC" 
                  stroke="#f44336" 
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={{ r: 2, fill: '#f44336' }}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </Box>

        {/* Bottom Charts */}
        <Grid container spacing={3}>
          {/* Violations */}
          <Grid item xs={12} md={4}>
            <Box sx={{ 
              bgcolor: '#fff',
              borderRadius: 1,
              p: 2
            }}>
              <Typography variant="subtitle2" sx={{ 
                mb: 2,
                color: '#666',
                fontSize: '0.75rem',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5
              }}>
                Violations <InfoIcon sx={{ fontSize: '1rem', color: '#999', opacity: 0.7 }} />
              </Typography>
              <Box sx={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Automated Attack', value: 76 },
                        { name: 'Path Traversal/LFI', value: 21 },
                        { name: 'SQLi', value: 3 },
                        { name: 'Other Violations', value: 1 }
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      dataKey="value"
                      startAngle={90}
                      endAngle={-270}
                    >
                      <Cell fill="#2196f3" />
                      <Cell fill="#4caf50" />
                      <Cell fill="#673ab7" />
                      <Cell fill="#e0e0e0" />
                    </Pie>
                    <Legend
                      layout="vertical"
                      align="right"
                      verticalAlign="middle"
                      iconType="plainline"
                      iconSize={30}
                      formatter={(value, entry) => (
                        <Typography sx={{ 
                          fontSize: '0.75rem', 
                          color: '#666',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1
                        }}>
                          {value} ({entry?.payload?.value}%)
                        </Typography>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Box>
        </Grid>

          {/* Client Applications */}
          <Grid item xs={12} md={4}>
            <Box sx={{ 
              bgcolor: '#fff',
              borderRadius: 1,
              p: 2
            }}>
              <Typography variant="subtitle2" sx={{ 
                mb: 2,
                color: '#666',
                fontSize: '0.75rem',
                fontWeight: 500,
              display: 'flex',
                alignItems: 'center',
              gap: 0.5
              }}>
                Client applications <InfoIcon sx={{ fontSize: '1rem', color: '#999', opacity: 0.7 }} />
              </Typography>
              <Box sx={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Legitimate', value: 70 },
                        { name: 'Suspicious', value: 24 },
                        { name: 'Malicious', value: 6 }
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      dataKey="value"
                      startAngle={90}
                      endAngle={-270}
                    >
                      <Cell fill="#e0e0e0" />
                      <Cell fill="#ffc107" />
                      <Cell fill="#f44336" />
                    </Pie>
                    <Legend
                      layout="vertical"
                      align="right"
                      verticalAlign="middle"
                      iconType="plainline"
                      iconSize={30}
                      formatter={(value, entry) => (
                        <Typography sx={{ 
                          fontSize: '0.75rem', 
                          color: '#666',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1
                        }}>
                          {value} ({entry?.payload?.value}%)
                        </Typography>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Box>
          </Grid>

          {/* Target Industries */}
          <Grid item xs={12} md={4}>
            <Box sx={{ 
              bgcolor: '#fff',
              borderRadius: 1,
              p: 2
            }}>
              <Typography variant="subtitle2" sx={{ 
                mb: 2,
                color: '#666',
                fontSize: '0.75rem',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5
              }}>
                Target industries <InfoIcon sx={{ fontSize: '1rem', color: '#999', opacity: 0.7 }} />
              </Typography>
              <Box sx={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Unclassified', value: 26 },
                        { name: 'Retail', value: 21 },
                        { name: 'Healthcare', value: 10 },
                        { name: 'Other Industries', value: 43 }
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      dataKey="value"
                      startAngle={90}
                      endAngle={-270}
                    >
                      <Cell fill="#2196f3" />
                      <Cell fill="#4caf50" />
                      <Cell fill="#673ab7" />
                      <Cell fill="#e0e0e0" />
                    </Pie>
                    <Legend
                      layout="vertical"
                      align="right"
                      verticalAlign="middle"
                      iconType="plainline"
                      iconSize={30}
                      formatter={(value, entry) => (
                        <Typography sx={{ 
                          fontSize: '0.75rem', 
                          color: '#666',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1
                        }}>
                          {value} ({entry?.payload?.value}%)
                        </Typography>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      bgcolor: '#fff',
      p: 3
    }}>
      <Box sx={{
        width: '100%',
        maxWidth: '600px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <Typography 
          variant="h4" 
          sx={{ 
            mb: 3, 
            color: '#1a237e',
            fontWeight: 600,
            textAlign: 'center',
            fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
            letterSpacing: '-0.5px',
            '& span': {
              color: '#1976d2',
            }
          }}
        >
          IP <span>Lookup</span>
        </Typography>

        <Box sx={{ 
          width: '100%',
          position: 'relative', 
          mb: 3
        }}>
          <SearchTextField
            fullWidth
            placeholder="Enter IP to reveal its reputation..."
            value={ipAddress}
            onChange={(e) => setIpAddress(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isAnalyzing}
            error={!!error}
            helperText={error}
          />
          <SearchButton 
            onClick={handleSearch}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <SearchIcon />
            )}
          </SearchButton>
        </Box>

        {isAnalyzing && (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            mt: 4 
          }}>
            <CircularProgress size={40} />
            <Typography 
              variant="body2" 
              sx={{ 
                mt: 2,
                color: 'text.secondary',
                fontSize: '0.85rem'
              }}
            >
              Analyzing IP address...
            </Typography>
          </Box>
        )}

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mt: 2,
              width: '100%',
              fontSize: '0.85rem'
            }}
          >
            {error}
          </Alert>
        )}

        {/* Recently Investigated IPs */}
        <Box sx={{ 
          width: '100%',
          mt: 3
        }}>
          <Typography 
            variant="subtitle2" 
                sx={{ 
              mb: 1.5, 
              color: '#37474f',
              fontWeight: 500,
              fontSize: '0.8rem',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              textAlign: 'center'
            }}
          >
            Recently investigated IPs
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 1.5,
            justifyContent: 'center',
            borderTop: '1px solid rgba(0,0,0,0.08)',
            pt: 1.5
          }}>
            {recentIPs.map((ip, index) => (
              <Box 
                key={index} 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  background: 'white',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  '&:hover': {
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    transform: 'translateY(-1px)'
                  }
                }}
                onClick={() => {
                  setIpAddress(ip.ip);
                  handleSearch();
                }}
              >
                <Typography sx={{ 
                  mr: 1, 
                  fontSize: '0.9rem',
                  filter: 'grayscale(0.2)'
                }}>
                  {ip.flag}
                </Typography>
                <Typography sx={{
                  color: '#1976d2',
                  fontWeight: 500,
                  fontSize: '0.8rem'
                }}>
                  {ip.ip}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
            </Box>
    </Box>
  );
} 