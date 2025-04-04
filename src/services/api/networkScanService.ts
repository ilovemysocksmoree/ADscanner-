import axios from 'axios';
import { ApiResponseData } from '../../interfaces/networkScanner';

const API_URL = 'http://127.0.0.1:4444/api/v1';

export class NetworkScanService {
  /**
   * Uploads and analyzes a PCAP file
   */
  static async analyzePcapFile(file: File): Promise<ApiResponseData> {
    try {
      const formData = new FormData();
      formData.append('pcap_file', file);

      const response = await axios.post(
        `${API_URL}/scan/pcap`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data as ApiResponseData;
    } catch (error) {
      console.error('PCAP analysis error:', error);
      throw error;
    }
  }

  /**
   * Transforms the API response into chart-ready data
   */
  static transformApiResponseToChartData(apiResponse: ApiResponseData) {
    // Protocol data
    const protocols = Object.entries(apiResponse.application_layer_metrics.ProtocolStats).map(([protocol, stats]) => ({
      protocol,
      count: stats.PacketCount,
    }));

    // Endpoint data
    const endpoints = Object.entries(apiResponse.network_layer_metrics.IPStats).map(([ip, count]) => ({
      ip,
      packetsIn: count,
      packetsOut: 0,
      bytesIn: 0,
      bytesOut: 0,
    }));

    // Application data
    const applications = Object.entries(apiResponse.application_layer_metrics.ProtocolStats).map(([application, stats]) => ({
      application,
      connections: stats.RequestCount + stats.ResponseCount,
      bytesTransferred: 0,
    }));

    // TTL distribution
    const ttlDistribution = Object.entries(apiResponse.network_layer_metrics.TTLStats).map(([ttl, count]) => ({
      ttl: parseInt(ttl),
      count,
    }));

    // Calculate totalBytes
    let totalBytes = 0;
    if (apiResponse.transport_layer_metrics.StreamData) {
      Object.values(apiResponse.transport_layer_metrics.StreamData).forEach(bytes => {
        totalBytes += bytes;
      });
    }

    return {
      timestamp: new Date().toISOString(),
      totalPackets: apiResponse.network_layer_metrics.TotalPacket,
      totalBytes,
      duration: "00:00:00", 
      protocols,
      endpoints,
      applications,
      ttlDistribution,
      topTalkers: [], 
      suspiciousActivities: [],
    };
  }
} 