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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#FF4842'];

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
  const rotation = (score / 100) * 180;
  
  return (
    <Box sx={{ position: 'relative', width: '200px', height: '100px', margin: '0 auto' }}>
      <svg width="200" height="100" viewBox="0 0 200 100">
        {/* Background arc */}
        <path
          d="M20 80 A 60 60 0 0 1 180 80"
          fill="none"
          stroke="#e0e0e0"
          strokeWidth="20"
          strokeLinecap="round"
        />
        {/* Score arc */}
        <path
          d="M20 80 A 60 60 0 0 1 180 80"
          fill="none"
          stroke={score > 75 ? '#ff4842' : score > 50 ? '#ffa726' : '#4caf50'}
          strokeWidth="20"
          strokeLinecap="round"
          strokeDasharray={`${(rotation / 180) * 251.2}, 251.2`}
        />
        {/* Score text */}
        <text
          x="100"
          y="85"
          textAnchor="middle"
          fontSize="24"
          fontWeight="bold"
          fill="#333"
        >
          {score}
        </text>
      </svg>
    </Box>
  );
};

export default function TrustIPAnalytics() {
  const [ipAddress, setIpAddress] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<IPAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
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
    } catch (err) {
      setError('Failed to analyze IP address');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              label="Enter IP Address"
              variant="outlined"
              value={ipAddress}
              onChange={(e) => setIpAddress(e.target.value)}
              placeholder="e.g., 69.163.133.10"
              error={!!error}
              helperText={error}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              startIcon={isAnalyzing ? <CircularProgress size={20} /> : <SecurityIcon />}
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze IP'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {analysisResult && (
        <Grid container spacing={3}>
          {/* Risk Score */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Risk Score
                </Typography>
                <RiskScoreGauge score={analysisResult.riskScore} />
                <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
                  Risk score reason: Low magnitude SQLi, Path Traversal/LFI, MISC attacks targeting several customers
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Origin & Reputation */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                      Origin
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">Country</Typography>
                      <Typography variant="body1">{analysisResult.origin.country}</Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">City</Typography>
                      <Typography variant="body1">{analysisResult.origin.city}</Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">ASN</Typography>
                      <Typography variant="body1">{analysisResult.origin.asn}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Requests</Typography>
                      <Typography variant="body1">{analysisResult.origin.requests}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                      Reputation
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">Known as</Typography>
                      {analysisResult.reputation.knownAs.map((item, index) => (
                        <Chip
                          key={index}
                          label={item}
                          sx={{ mr: 1, mb: 1 }}
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Known for</Typography>
                      {analysisResult.reputation.knownFor.map((item, index) => (
                        <Chip
                          key={index}
                          label={item}
                          sx={{ mr: 1, mb: 1 }}
                          color="warning"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Violations Over Time */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Violations over time
                </Typography>
                <Box sx={{ height: 400, mt: 2 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analysisResult.violationsOverTime}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Line type="monotone" dataKey="pathTraversal" stroke="#8884d8" name="Path Traversal/LFI" />
                      <Line type="monotone" dataKey="automatedAttack" stroke="#82ca9d" name="Automated Attack" />
                      <Line type="monotone" dataKey="sqli" stroke="#ffc658" name="SQLi" />
                      <Line type="monotone" dataKey="rce" stroke="#ff7300" name="RCE/RFI" />
                      <Line type="monotone" dataKey="spam" stroke="#ff4842" name="Spam" />
                      <Line type="monotone" dataKey="misc" stroke="#00C49F" name="MISC" />
                      <Line type="monotone" dataKey="xss" stroke="#FFBB28" name="XSS" />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Violations Distribution */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Violations
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analysisResult.violations}
                        dataKey="percentage"
                        nameKey="type"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        label
                      >
                        {analysisResult.violations.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Target Industries */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Target Industries
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analysisResult.targetIndustries}
                        dataKey="percentage"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        label
                      >
                        {analysisResult.targetIndustries.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
} 