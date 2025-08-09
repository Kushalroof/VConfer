import React, { useRef, useState, useEffect } from "react";
import "../styles/VideoComponent.css";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { io } from "socket.io-client";
import IconButton from "@mui/material/IconButton";
import VideocamOffOutlinedIcon from "@mui/icons-material/VideocamOffOutlined";
import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";
import CallEndOutlinedIcon from "@mui/icons-material/CallEndOutlined";
import MicNoneOutlinedIcon from "@mui/icons-material/MicNoneOutlined";
import MicOffOutlinedIcon from "@mui/icons-material/MicOffOutlined";
import PresentToAllOutlinedIcon from "@mui/icons-material/PresentToAllOutlined";
import CancelPresentationOutlinedIcon from "@mui/icons-material/CancelPresentationOutlined";
import ChatBubbleOutlineOutlinedIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";
import Badge from "@mui/material/Badge";
import { useNavigate } from "react-router-dom";
import server from "../environment";

const server_url = server;

var connections = {};
const peerConfigConnections = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export default function VideoMeetComponent() {
  const socketRef = useRef();
  const socketIdRef = useRef("");
  const localVideoRef = useRef();
  const [videos, setVideos] = useState([]);
  const [videoAvailable, setVideoAvailable] = useState(true);
  const [audioAvailable, setAudioAvailable] = useState(true);
  const [video, setVideo] = useState(true);
  const [audio, setAudio] = useState(true);
  const [screenAvailable, setScreenAvailable] = useState();
  const [askForUsername, setAskForUsername] = useState(true);
  const [username, setUsername] = useState("");
  const [screenShare, setScreenShare] = useState(false);
  const [newMessage, setNewMessage] = useState(0);
  const [showModel, setModel] = useState(true);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const getPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setVideoAvailable(true);
      setAudioAvailable(true);
      window.localStream = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      if (navigator.mediaDevices.getDisplayMedia) {
        setScreenAvailable(true);
      } else {
        setScreenAvailable(false);
      }
    } catch (err) {
      setVideoAvailable(false);
      setAudioAvailable(false);
    }
  };

  useEffect(() => {
    getPermissions();
  }, []);

  const silence = () => {
    let ctx = new AudioContext();
    let oscillator = ctx.createOscillator();
    let dst = oscillator.connect(ctx.createMediaStreamDestination());
    oscillator.start();
    ctx.resume();
    return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
  };

  const black = ({ width = 640, height = 480 } = {}) => {
    let canvas = Object.assign(document.createElement("canvas"), {
      width,
      height,
    });
    canvas.getContext("2d").fillRect(0, 0, width, height);
    let stream = canvas.captureStream();
    return Object.assign(stream.getVideoTracks()[0], { enabled: false });
  };

  const gotMessageFromServer = (fromId, message) => {
    const signal = JSON.parse(message);
    if (fromId !== socketIdRef.current) {
      let pc = connections[fromId];
      if (!pc) return;

      if (signal.sdp) {
        const sdp = signal.sdp;
        pc.setRemoteDescription(new RTCSessionDescription(sdp))
          .then(() => {
            if (sdp.type === "offer") {
              pc.createAnswer()
                .then((desc) => pc.setLocalDescription(desc))
                .then(() => {
                  socketRef.current.emit(
                    "signal",
                    fromId,
                    JSON.stringify({ sdp: pc.localDescription })
                  );
                });
            }
          })
          .catch(console.log);
      }
      if (signal.ice) {
        pc.addIceCandidate(new RTCIceCandidate(signal.ice)).catch(console.log);
      }
    }
  };

  let addMessage=(data, sender, socketIdSender)=>{
    
    setMessages((prevMessages)=>[
      ...prevMessages, {sender: sender, data: data}
    ]);
    if(socketIdSender !== socketIdRef.current){
      setNewMessage((prevMessages)=> prevMessages+1);
    }
  }

  const connectToSocketServer = () => {
    socketRef.current = io.connect(server_url, { secure: false });

    socketRef.current.on("connect", () => {
      socketRef.current.emit("join-call", window.location.href);
      socketIdRef.current = socketRef.current.id;
      socketRef.current.on("chat-message", addMessage);

      setVideos((prev) => [
        ...prev,
        { socketId: socketRef.current.id, stream: window.localStream },
      ]);

      socketRef.current.on("signal", (fromId, message) => {
        gotMessageFromServer(fromId, message);
      });

      socketRef.current.on("user-left", (id) => {
        setVideos((prev) => prev.filter((video) => video.socketId !== id));
        if (connections[id]) {
          connections[id].close();
          delete connections[id];
        }
      });

      socketRef.current.on("user-joined", (id, clients) => {
        clients.forEach((socketListId) => {
          if (
            socketListId === socketIdRef.current ||
            connections[socketListId]
          )
            return;

          const pc = new RTCPeerConnection(peerConfigConnections);
          connections[socketListId] = pc;

          pc.onicecandidate = (event) => {
            if (event.candidate) {
              socketRef.current.emit(
                "signal",
                socketListId,
                JSON.stringify({ ice: event.candidate })
              );
            }
          };

          pc.ontrack = (event) => {
            setVideos((prev) => {
              const exists = prev.some(
                (v) => v.socketId === socketListId
              );
              if (!exists) {
                return [
                  ...prev,
                  { socketId: socketListId, stream: event.streams[0] },
                ];
              }
              return prev;
            });
          };

          const stream =
            window.localStream || new MediaStream([black(), silence()]);
          stream.getTracks().forEach((track) => pc.addTrack(track, stream));
        });

        if (id === socketIdRef.current) {
          for (let id2 in connections) {
            if (id2 === socketIdRef.current) continue;
            const pc = connections[id2];
            pc.createOffer()
              .then((desc) => pc.setLocalDescription(desc))
              .then(() => {
                socketRef.current.emit(
                  "signal",
                  id2,
                  JSON.stringify({ sdp: pc.localDescription })
                );
              });
          }
        }
      });
    });
  };

  const connect = () => {
    setAskForUsername(false);
    connectToSocketServer();
  };

  const handleVideo = () => {
    if (window.localStream) {
      const videoTrack = window.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setVideo(videoTrack.enabled);
      }
    }
  };

  const handleAudio = () => {
    if (window.localStream) {
      const audioTrack = window.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setAudio(audioTrack.enabled);
      }
    }
  };

  const replaceTrackForPeers = (newTrack) => {
    Object.values(connections).forEach((pc) => {
      const sender = pc.getSenders().find(
        (s) => s.track && s.track.kind === newTrack.kind
      );
      if (sender) {
        sender.replaceTrack(newTrack);
      }
    });
  };

  const getDisplayMediaSuccess = (stream) => {
    const videoTrack = stream.getVideoTracks()[0];
    replaceTrackForPeers(videoTrack);
    window.localStream.removeTrack(window.localStream.getVideoTracks()[0]);
    window.localStream.addTrack(videoTrack);
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }
    setScreenShare(true);

    videoTrack.onended = () => {
      restoreCamera();
    };
  };

  const restoreCamera = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((camStream) => {
        const newVideoTrack = camStream.getVideoTracks()[0];
        replaceTrackForPeers(newVideoTrack);
        window.localStream.removeTrack(
          window.localStream.getVideoTracks()[0]
        );
        window.localStream.addTrack(newVideoTrack);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = window.localStream;
        }
        setScreenShare(false);
      })
      .catch((e) => console.log("Error restoring camera:", e));
  };

  const handleScreen = () => {
    if (!screenShare) {
      navigator.mediaDevices
        .getDisplayMedia({ video: true })
        .then(getDisplayMediaSuccess)
        .catch((e) => console.log(e));
    } else {
      restoreCamera();
    }
  };

  const handleChat = ()=>{
    setModel(!showModel);
  }

  let navigate=useNavigate();

  let sendMessage=() =>{
    socketRef.current.emit("chat-message", message, username);
    setMessage("");
  }

  let handleEndCall = () =>{
    try{
      let tracks = localVideoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
    }catch(e){}
    navigate("/home");
  }

  return (
    <div
      style={{
        backgroundImage: "url('/background.jpeg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh",
      }}
    >
      {askForUsername ? (
        <div className="lobbyContainer">
          <div className="lobbyCard">
            <h2 style={{ color: "#710117" }}>Join Call</h2>
            <TextField
              label="Display name"
              value={username}
              style={{ color: "#710117" }}
              onChange={(e) => setUsername(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start"></InputAdornment>
                ),
              }}
              variant="standard"
              fullWidth
            />
            <Button
              variant="contained"
              onClick={connect}
              style={{
                marginTop: "20px",
                backgroundColor: "#710117",
              }}
            >
              Connect
            </Button>
            <div className="localVideoWrapper">
              <video ref={localVideoRef} autoPlay muted />
            </div>
          </div>
        </div>
      ) : (
        <div className="meetButtonContainer">
          <div className="buttonContainers">
            <IconButton onClick={handleVideo} className="videoIcon">
              {video ? <VideocamOutlinedIcon /> : <VideocamOffOutlinedIcon />}
            </IconButton>
            <IconButton className="callEndIcon" onClick={handleEndCall}>
              <CallEndOutlinedIcon />
            </IconButton>
            <IconButton onClick={handleAudio} className="micIcon">
              {audio ? <MicNoneOutlinedIcon /> : <MicOffOutlinedIcon />}
            </IconButton>
            {screenAvailable && (
              <IconButton className="screenShare" onClick={handleScreen}>
                {screenShare ? (
                  <CancelPresentationOutlinedIcon />
                ) : (
                  <PresentToAllOutlinedIcon />
                )}
              </IconButton>
            )}
            <Badge badgeContent={newMessage} max={999} color="success" onClick={handleChat}>
              <IconButton className="chatIcon">
                <ChatBubbleOutlineOutlinedIcon />
              </IconButton>
            </Badge>
          </div>

          {showModel ? <div className="MessageArea">
            <div className="chatRoom">
            <h1>Messages</h1>
            <div className="chatDisplay">
              {messages.length>0?messages.map((item,index)=>{
                return(
                  <div key={index}>
                    <p style={{fontWeight:"bold"}}>{item.sender}</p>
                    <p style={{marginBottom: "15px"}}> {item.data}</p>
                  </div>
                )
              }) :<p>No messages</p>}
            </div>
            </div>
              <div className="inputArea">
                <input value={message} onChange={(e)=> setMessage(e.target.value)} type="text" placeholder="Type a message..." />
                <button onClick={sendMessage}>Send</button>
              </div>
            </div>
           : <></> }
          
          <div className={`meetVideoContainer ${showModel? "chatOpen": "" }`}>
            {videos.map((video) => (
              <div key={video.socketId}>
                <video
                  data-socket={video.socketId}
                  ref={(ref) => {
                    if (ref && video.stream) {
                      ref.srcObject = video.stream;
                    }
                  }}
                  autoPlay
                  muted={video.socketId === socketIdRef.current}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
