"use client";
import { useEffect, useRef } from "react";

const wsUrl = `wss://{VARIABLE}:3001/ws`;

export default function Home() {
  const localVideo = useRef<HTMLVideoElement>(null);
  const remoteVideo = useRef<HTMLVideoElement>(null);
  const pc = useRef<RTCPeerConnection | null>(null);
  const sc = useRef<WebSocket | null>(null);

  const localId = "userA"; // 動的にIDを入力させたいなら別UIにする
  const remoteId = "userB";

  useEffect(() => {
    const ws = new WebSocket(wsUrl);
    sc.current = ws;

    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
      if (localVideo.current) localVideo.current.srcObject = stream;

      ws.onopen = () => {
        ws.send(JSON.stringify({ open: { local: localId, remote: remoteId } }));
      };

      ws.onmessage = async (event) => {
        const data = JSON.parse(event.data);

        if (data.start) {
          const isOffer = data.start === "offer";
          pc.current = createPeer(stream, ws, isOffer);
          if (isOffer) {
            const offer = await pc.current.createOffer();
            await pc.current.setLocalDescription(offer);
            ws.send(JSON.stringify({ sdp: offer, remote: remoteId }));
          }
        }

        if (data.sdp && pc.current) {
          await pc.current.setRemoteDescription(new RTCSessionDescription(data.sdp));
          if (data.sdp.type === "offer") {
            const answer = await pc.current.createAnswer();
            await pc.current.setLocalDescription(answer);
            ws.send(JSON.stringify({ sdp: answer, remote: remoteId }));
          }
        }

        if (data.ice && pc.current) {
          await pc.current.addIceCandidate(data.ice);
        }
      };
    });
  }, []);

  const createPeer = (stream: MediaStream, ws: WebSocket, isOffer: boolean) => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    stream.getTracks().forEach(track => pc.addTrack(track, stream));

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        ws.send(JSON.stringify({ ice: e.candidate, remote: remoteId }));
      }
    };

    pc.ontrack = (e) => {
      if (remoteVideo.current) {
        remoteVideo.current.srcObject = e.streams[0];
      }
    };

    return pc;
  };

  return (
    <main>
      <h1>WebRTC Demo</h1>
      <video ref={localVideo} autoPlay muted playsInline style={{ width: "45%" }} />
      <video ref={remoteVideo} autoPlay playsInline style={{ width: "45%" }} />
    </main>
  );
}
