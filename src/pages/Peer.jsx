import React, { useCallback, useContext, useEffect, useMemo, useState } from "react"
import { useSocket } from "../pages/Socket";

const PeerContext = React.createContext()

export const usePeer =() => React.useContext(PeerContext)

export const PeerProvider = (props) =>{
  const { socket } = useSocket();
    const [remoteStream,setRemoteStream] = useState()
   const [remoteTrack,setRemoteTrack] = useState()
   const peer = new RTCPeerConnection({
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
  });

    console.log("Peer connection state:", peer.connectionState);
    console.log("Peer ice connection state:", peer.iceConnectionState);
   
 

    const createOffer= async ()=>{
        const offer = await peer.createOffer()
        await peer.setLocalDescription(offer)
        return offer
    }

    const createAnswer = async(offer)=>{
        console.log("This offer is received",offer)
        await peer.setRemoteDescription(offer)
        const answer = await peer.createAnswer()
        console.log("This is the answer which is sent",answer)
        await peer.setLocalDescription(answer)
        return answer
    }

    const sendStream = async(stream)=>{
      const tracks = stream.getTracks()
      for(const track of tracks){
       peer.addTrack(track,stream)
       console.log("this is track",track)
       setRemoteTrack(track)
      }
    }

    const handleTrackEvent = useCallback((ev)=>{
        const streams = ev.streams
        setRemoteStream(streams[0])
    },[])

    const handleIncomingCandidate =(candidate)=>{
     
    }

   useEffect(()=>{
    peer.addEventListener('track',handleTrackEvent)
    return()=>{
      peer.removeEventListener('track',handleTrackEvent)
    }
  },[remoteTrack])

    const setAnswer = async(ans)=>{
        await peer.setRemoteDescription(ans)
    }


 return (
    <PeerContext.Provider value={{peer,createOffer,createAnswer,setAnswer,sendStream,remoteStream}}>
     {props.children}
   </PeerContext.Provider>
   )}