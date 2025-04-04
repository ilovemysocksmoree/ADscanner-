// Network Scanner specific interfaces

export interface ProtocolData {
  protocol: string;
  count: number;
  percentage?: number; // Optional as it can be calculated
}

export interface EndpointData {
  ip: string;
  packetsIn: number;
  packetsOut: number;
  bytesIn: number;
  bytesOut: number;
  location?: {
    city: string;
    country: string;
    countryCode: string;
  };
  hostname?: string;
}

export interface ApplicationData {
  application: string;
  connections: number;
  bytesTransferred: number;
}

export interface TtlDistributionData {
  ttl: number;
  count: number;
}

export interface NetworkDevice {
  ip: string;
  hostname: string;
  type: 'computer' | 'router';
  services: {
    port: number;
    name: string;
    status: string;
  }[];
}

export interface NetworkAlert {
  id: string;
  title: string;
  message: string;
  severity: 'error' | 'warning' | 'info' | 'success';
  deviceIp?: string;
}

export interface AnalysisDetails {
  timestamp: string;
  totalPackets: number;
  totalBytes: number;
  duration: string;
  protocols: ProtocolData[];
  endpoints: EndpointData[];
  applications: ApplicationData[];
  ttlDistribution: TtlDistributionData[];
  topTalkers: {
    ip: string;
    packets: number;
    bytes: string;
    protocols: string[];
  }[];
  suspiciousActivities: {
    type: string;
    description: string;
    severity: 'high' | 'medium' | 'low';
    timestamp: string;
  }[];
}

export interface ApiResponseData {
  application_layer_metrics: {
    ProtocolStats: {
      [protocol: string]: {
        Anomalies: { [anomalyType: string]: number };
        Domains: { [domain: string]: number };
        PacketCount: number;
        PayloadSizes: { [payload: string]: number };
        RequestCount: number;
        ResponseCount: number;
      };
    };
    TLSStats: {
      CipherSuites: { [suite: string]: number };
      Versions: { [version: string]: number };
      Certificates: number;
      SNI: { [sni: string]: number };
    };
  };
  description: string;
  message: string;
  name: string;
  network_layer_metrics: {
    FragmentedPackets: number;
    IPStats: { [ipAddress: string]: number };
    ProtocolDist: { [protocol: string]: number };
    ReassembledFlows: number;
    TTLStats: { [ttl: string]: number };
    TotalPacket: number;
  };
  status: string;
  transport_layer_metrics: {
    InvalidTCPFlags: number;
    PortStats: { [port: string]: number };
    Retransmissions: number;
    StreamData: { [stream: string]: number };
    TCPConnections: number;
    TCPPacketCount: number;
    UDPFloodPorts: { [port: string]: number };
    UDPPacketCount: number;
  };
} 