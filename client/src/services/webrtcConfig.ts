import $api from "@/http";

let cache: RTCConfiguration | null = null;

async function getWebRTCConfig(): Promise<RTCConfiguration> {
  if (cache) return cache;

  try {
    const res = await $api.webrtc.getIceServers();
    if (!res.data) throw new Error(res.errorMessage || "");

    const iceServers = res.data;

    cache = {
      iceServers,
      bundlePolicy: "max-bundle",
      iceCandidatePoolSize: 10,
    };
  } catch (e) {
    console.warn("Failed to load ICE servers, falling back to public STUN:", e);

    cache = {
      iceServers: [
        {
          urls: [
            "stun:stun.l.google.com:19302",
            "stun:stun1.l.google.com:19302",
          ],
        },
      ],
      bundlePolicy: "max-bundle",
      iceCandidatePoolSize: 10,
    };
  }

  return cache;
}

export default getWebRTCConfig;
