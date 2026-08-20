let cachedIceServers: RTCIceServer[] | null = null;
let cacheExpiry = 0;

class WebRTCService {
  static async getIceServers(): Promise<RTCIceServer[] | null> {
    try {
      if (cachedIceServers && Date.now() < cacheExpiry) {
        return cachedIceServers;
      }

      const apiKey = process.env.METERED_API_KEY;
      const res = await fetch(
        `https://speak-up.metered.live/api/v1/turn/credentials?apiKey=${apiKey}`,
      );

      if (!res.ok) throw new Error("Failed to fetch TURN credentials");

      cachedIceServers = await res.json();
      cacheExpiry = Date.now() + 1000 * 60 * 60 * 12; // cache for 12 hours

      return cachedIceServers;
    } catch {
      return [
        {
          urls: [
            "stun:stun.l.google.com:19302",
            "stun:stun1.l.google.com:19302",
          ],
        },
      ];
    }
  }
}

export default WebRTCService;
