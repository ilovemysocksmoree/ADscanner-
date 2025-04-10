import { ProtocolData, EndpointData, ApplicationData, NetworkDevice, NetworkAlert } from '../types/network';

export const mockProtocolData: ProtocolData[] = [
    { protocol: 'TCP', count: 1250 },
    { protocol: 'UDP', count: 850 },
    { protocol: 'ICMP', count: 400 },
    { protocol: 'Other', count: 280 },
];

export const mockEndpointData: EndpointData[] = [
    { ip: '192.168.1.100', packetsIn: 2500, packetsOut: 1800, bytesIn: 250000, bytesOut: 180000, hostname: 'Desktop-PC' },
    { ip: '192.168.1.101', packetsIn: 1500, packetsOut: 1200, bytesIn: 150000, bytesOut: 120000, hostname: 'Laptop-User' },
    { ip: '192.168.1.150', packetsIn: 5230, packetsOut: 4100, bytesIn: 1200000, bytesOut: 850000, hostname: 'Server-Main' },
    { ip: '192.168.1.200', packetsIn: 500, packetsOut: 300, bytesIn: 50000, bytesOut: 30000, hostname: 'Unknown-Device' },
    { ip: '8.8.8.8', packetsIn: 100, packetsOut: 1000, bytesIn: 10000, bytesOut: 100000, hostname: 'google-dns' },
    { ip: '104.16.132.229', packetsIn: 50, packetsOut: 800, bytesIn: 5000, bytesOut: 80000, hostname: 'cloudflare' },
];

export const mockAppData: ApplicationData[] = [
    { application: 'HTTPS', connections: 450, bytesTransferred: 500000 },
    { application: 'DNS', connections: 250, bytesTransferred: 25000 },
    { application: 'SMB', connections: 150, bytesTransferred: 300000 },
    { application: 'SMTP', connections: 80, bytesTransferred: 150000 },
    { application: 'TLS', connections: 600, bytesTransferred: 1000000 },
];

export const mockDevices: NetworkDevice[] = [
    { ip: '192.168.1.1', hostname: 'Gateway-Router', type: 'router', services: [{ port: 80, name: 'HTTP', status: 'open' }, { port: 443, name: 'HTTPS', status: 'open' }, { port: 53, name: 'DNS', status: 'open' }] },
    { ip: '192.168.1.100', hostname: 'Desktop-PC', type: 'computer', services: [{ port: 445, name: 'SMB', status: 'open' }, { port: 139, name: 'NetBIOS', status: 'open' }] },
    { ip: '192.168.1.101', hostname: 'Laptop-User', type: 'computer', services: [{ port: 22, name: 'SSH', status: 'closed' }] },
];

export const mockNetworkAlerts: NetworkAlert[] = [
    { id: '1', title: 'Suspicious Network Activity', message: 'Unusual port scanning detected from device 192.168.1.150', severity: 'error', deviceIp: '192.168.1.150' },
    { id: '2', title: 'New Device Detected', message: 'Unrecognized device joined the network: 192.168.1.200', severity: 'warning', deviceIp: '192.168.1.200' },
    { id: '3', title: 'External Communication Anomaly', message: 'High outbound traffic from 192.168.1.150 to 104.16.132.229 (Cloudflare)', severity: 'warning', deviceIp: '192.168.1.150' },
]; 