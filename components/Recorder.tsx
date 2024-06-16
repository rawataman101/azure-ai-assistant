"use client";
import Image from "next/image";
import activeAssitantIcon from "@/img/active.gif";
import notActiveAssitantIcon from "@/img/notactive.png";
import { use, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
export const mimeType = "audio/webm";

function Recorder({ uploadAudio }: { uploadAudio: (blob: Blob) => void }) {
  const { pending } = useFormStatus();
  const [permission, setPermission] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const [recordingStatus, setRecordingStatus] = useState("inactive");
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [audio, setAudio] = useState<string | null>(null);

  const getMicrophonePermission = async () => {
    if ("MediaRecorder" in window) {
      try {
        const streamData = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false,
        });
        setPermission(true);
        setStream(streamData);
      } catch (error: any) {
        alert(error.message);
      }
    } else {
      alert("The MediaRecorder API is not supported in your browser.");
    }
  };

  const startRecording = async () => {
    if (stream === null || pending || mediaRecorder === null) return;

    setRecordingStatus("recording");
    //create new Media recorder instance using the stream
    const media = new MediaRecorder(stream, { mimeType });
    //set the MediaRecorder instance to the mediaRecorder ref
    mediaRecorder.current = media;
    //invokes the start method to start the recording process
    mediaRecorder.current.start();
    let localAudioChunks: Blob[] = [];
    mediaRecorder.current.ondataavailable = (event) => {
      if (typeof event.data === "undefined" || event.data.size === 0) return;
      localAudioChunks.push(event.data);
    };
    setAudioChunks(localAudioChunks);
  };

  const stopRecording = async () => {
    if (pending || mediaRecorder === null) return;

    setRecordingStatus("inactive");
    //stops the recording instance
    mediaRecorder.current.stop();
    mediaRecorder.current.onstop = () => {
      //creates a blob file from the audiochunks data
      const audioBlob = new Blob(audioChunks, { type: mimeType });
      uploadAudio(audioBlob);
      setAudioChunks([]);
    };
  };

  useEffect(() => {
    getMicrophonePermission();
  }, []);

  return (
    <div className="flex items-center justify-center text-white">
      {!permission && (
        <button onClick={getMicrophonePermission}>Get Microphone</button>
      )}
      {pending && (
        <Image
          src={activeAssitantIcon}
          width={350}
          height={350}
          priority
          alt="Recording"
          className="assistant grayscale"
        />
      )}
      {permission && recordingStatus === "inactive" && !pending && (
        <Image
          src={notActiveAssitantIcon}
          width={350}
          height={350}
          priority
          alt="Recording"
          onClick={startRecording}
          className="assistant cursor-pointer hover:scale-110 duration-150 transition-all ease-in-out"
        />
      )}
      {recordingStatus === "recording" && (
        <Image
          src={activeAssitantIcon}
          width={350}
          height={350}
          priority
          alt="Recording"
          onClick={stopRecording}
          className="assistant cursor-pointer hover:scale-110 duration-150 transition-all ease-in-out"
        />
      )}
    </div>
  );
}

export default Recorder;
