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

interface RecentIP {
  ip: string;
  country: string;
  flag: string;
}

const recentIPs: RecentIP[] = [
  { ip: '44.197.185.15', country: 'US', flag: '🇺🇸' },
  { ip: '31.13.127.3', country: 'IE', flag: '🇮🇪' },
  { ip: '161.97.118.98', country: 'FR', flag: '🇫🇷' },
  { ip: '149.28.70.75', country: 'US', flag: '🇺🇸' },
  { ip: '158.46.166.233', country: 'TH', flag: '🇹🇭' },
];

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

  const handleSearch = () => {
    if (ipAddress) {
      // Handle search logic
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(180deg, #f8f9ff 0%, #ffffff 100%)',
    }}>
      {/* Main Content Container */}
      <Box sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: { xs: 3, sm: 4, md: 5 },
        px: { xs: 2, sm: 2.5, md: 3 },
      }}>
        {/* Search Container */}
        <Box sx={{
          width: '100%',
          maxWidth: '600px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mb: analysisResult ? 4 : 0
        }}>
          {/* Title */}
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

          {/* Search Section */}
          <Box sx={{ 
            width: '100%',
            position: 'relative', 
            mb: 3,
            px: { xs: 1, sm: 1.5 }
          }}>
            <SearchTextField
              fullWidth
              placeholder="Enter IP to reveal its reputation..."
              value={ipAddress}
              onChange={(e) => setIpAddress(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <SearchButton onClick={handleSearch}>
              <SearchIcon />
            </SearchButton>
          </Box>

          {/* Recently Investigated IPs */}
          <Box sx={{ 
            width: '100%',
            px: { xs: 1, sm: 1.5 },
            mb: 3
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
              pt: 1.5,
              pb: 1
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
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      transform: 'translateY(-1px)'
                    }
                  }}
                >
                  <Typography sx={{ 
                    mr: 1, 
                    fontSize: '0.9rem',
                    filter: 'grayscale(0.2)'
                  }}>
                    {ip.flag}
                  </Typography>
                  <Link
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setIpAddress(ip.ip);
                      handleSearch();
                    }}
                    sx={{
                      color: '#1976d2',
                      textDecoration: 'none',
                      fontWeight: 500,
                      fontSize: '0.8rem',
                      '&:hover': {
                        color: '#1565c0',
                        textDecoration: 'none',
                      },
                    }}
                  >
                    {ip.ip}
                  </Link>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        {/* Analysis Result */}
        {analysisResult && (
          <Box sx={{ width: '100%', maxWidth: '1000px' }}>
            <Grid container spacing={2} sx={{ mt: 0 }}>
              {/* Risk Score */}
              <Grid item xs={12} md={4}>
                <Card sx={{ 
                  borderRadius: '8px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  height: '100%',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 25px rgba(0,0,0,0.12)',
                  }
                }}>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{ 
                      fontWeight: 600,
                      color: '#1a237e',
                      mb: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      fontSize: '0.9rem'
                    }}>
                      <SecurityIcon color="primary" sx={{ fontSize: '1.1rem' }} />
                      Risk Score
                    </Typography>
                    <RiskScoreGauge score={analysisResult.riskScore} />
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      align="center" 
                      sx={{ 
                        mt: 1.5,
                        fontSize: '0.75rem',
                        lineHeight: 1.4,
                        px: 1
                      }}
                    >
                      Risk score reason: Low magnitude SQLi, Path Traversal/LFI, MISC attacks targeting several customers
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Origin & Reputation */}
              <Grid item xs={12} md={8}>
                <Card sx={{ 
                  borderRadius: '8px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  height: '100%',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 25px rgba(0,0,0,0.12)',
                  }
                }}>
                  <CardContent sx={{ p: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" gutterBottom sx={{ 
                          fontWeight: 600,
                          color: '#1a237e',
                          mb: 1.5,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          fontSize: '0.9rem'
                        }}>
                          <PublicIcon color="primary" sx={{ fontSize: '1.1rem' }} />
                          Origin
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                          <Box>
                            <Typography variant="body2" color="text.secondary" sx={{ 
                              mb: 0.25, 
                              fontSize: '0.7rem', 
                              textTransform: 'uppercase', 
                              letterSpacing: '0.5px' 
                            }}>
                              Country
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.85rem' }}>
                              {analysisResult.origin.country}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="body2" color="text.secondary" sx={{ 
                              mb: 0.25, 
                              fontSize: '0.7rem', 
                              textTransform: 'uppercase', 
                              letterSpacing: '0.5px' 
                            }}>
                              City
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.85rem' }}>
                              {analysisResult.origin.city}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="body2" color="text.secondary" sx={{ 
                              mb: 0.25, 
                              fontSize: '0.7rem', 
                              textTransform: 'uppercase', 
                              letterSpacing: '0.5px' 
                            }}>
                              ASN
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.85rem' }}>
                              {analysisResult.origin.asn}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="body2" color="text.secondary" sx={{ 
                              mb: 0.25, 
                              fontSize: '0.7rem', 
                              textTransform: 'uppercase', 
                              letterSpacing: '0.5px' 
                            }}>
                              Requests
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.85rem' }}>
                              {analysisResult.origin.requests}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" gutterBottom sx={{ 
                          fontWeight: 600,
                          color: '#1a237e',
                          mb: 1.5,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          fontSize: '0.9rem'
                        }}>
                          <ShieldIcon color="primary" sx={{ fontSize: '1.1rem' }} />
                          Reputation
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <Box>
                            <Typography variant="body2" color="text.secondary" sx={{ 
                              mb: 1, 
                              fontSize: '0.7rem', 
                              textTransform: 'uppercase', 
                              letterSpacing: '0.5px' 
                            }}>
                              Known as
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                              {analysisResult.reputation.knownAs.map((item, index) => (
                                <Chip
                                  key={index}
                                  label={item}
                                  sx={{
                                    borderRadius: '6px',
                                    backgroundColor: 'rgba(25, 118, 210, 0.08)',
                                    color: '#1976d2',
                                    fontWeight: 500,
                                    fontSize: '0.75rem',
                                    height: '24px',
                                    '&:hover': {
                                      backgroundColor: 'rgba(25, 118, 210, 0.12)',
                                    }
                                  }}
                                />
                              ))}
                            </Box>
                          </Box>
                          <Box>
                            <Typography variant="body2" color="text.secondary" sx={{ 
                              mb: 1, 
                              fontSize: '0.7rem', 
                              textTransform: 'uppercase', 
                              letterSpacing: '0.5px' 
                            }}>
                              Known for
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                              {analysisResult.reputation.knownFor.map((item, index) => (
                                <Chip
                                  key={index}
                                  label={item}
                                  sx={{
                                    borderRadius: '6px',
                                    backgroundColor: 'rgba(255, 152, 0, 0.08)',
                                    color: '#f57c00',
                                    fontWeight: 500,
                                    fontSize: '0.75rem',
                                    height: '24px',
                                    '&:hover': {
                                      backgroundColor: 'rgba(255, 152, 0, 0.12)',
                                    }
                                  }}
                                />
                              ))}
                            </Box>
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Violations Over Time */}
              <Grid item xs={12}>
                <Card sx={{ borderRadius: '8px', /* ... existing styles ... */ }}>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{ /* ... same as above ... */ }}>
                      <TimelineIcon color="primary" sx={{ fontSize: '1.1rem' }} />
                      Violations over time
                    </Typography>
                    <Box sx={{ height: 300, mt: 1 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={analysisResult.violationsOverTime}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                          <XAxis dataKey="date" stroke="#666" />
                          <YAxis stroke="#666" />
                          <RechartsTooltip 
                            contentStyle={{
                              backgroundColor: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                              padding: '12px'
                            }}
                          />
                          <Legend />
                          <Line type="monotone" dataKey="pathTraversal" stroke="#8884d8" strokeWidth={2} name="Path Traversal/LFI" dot={false} />
                          <Line type="monotone" dataKey="automatedAttack" stroke="#82ca9d" strokeWidth={2} name="Automated Attack" dot={false} />
                          <Line type="monotone" dataKey="sqli" stroke="#ffc658" strokeWidth={2} name="SQLi" dot={false} />
                          <Line type="monotone" dataKey="rce" stroke="#ff7300" strokeWidth={2} name="RCE/RFI" dot={false} />
                          <Line type="monotone" dataKey="spam" stroke="#ff4842" strokeWidth={2} name="Spam" dot={false} />
                          <Line type="monotone" dataKey="misc" stroke="#00C49F" strokeWidth={2} name="MISC" dot={false} />
                          <Line type="monotone" dataKey="xss" stroke="#FFBB28" strokeWidth={2} name="XSS" dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Violations Distribution */}
              <Grid item xs={12} md={6}>
                <Card sx={{ borderRadius: '8px', /* ... existing styles ... */ }}>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{ /* ... same as above ... */ }}>
                      <BugReportIcon color="primary" sx={{ fontSize: '1.1rem' }} />
                      Violations
                    </Typography>
                    <Box sx={{ height: 220 }}>
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
                          <RechartsTooltip 
                            contentStyle={{
                              backgroundColor: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                              padding: '12px'
                            }}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Target Industries */}
              <Grid item xs={12} md={6}>
                <Card sx={{ borderRadius: '8px', /* ... existing styles ... */ }}>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{ /* ... same as above ... */ }}>
                      <LanguageIcon color="primary" sx={{ fontSize: '1.1rem' }} />
                      Target Industries
                    </Typography>
                    <Box sx={{ height: 220 }}>
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
                          <RechartsTooltip 
                            contentStyle={{
                              backgroundColor: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                              padding: '12px'
                            }}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}
      </Box>
    </Box>
  );
} 