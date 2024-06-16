"use client";
import Image from "next/image";
import { SettingsIcon } from "lucide-react";
import Messages from "@/components/Messages";
import Recorder, { mimeType } from "@/components/Recorder";
import { useEffect, useRef, useState } from "react";
import { useFormState } from "react-dom";
import transcript from "@/actions/transcript";
import VoiceSynthesizer from "@/components/VoiceSynthesizer";

const initialState = {
  sender: "",
  response: "",
  id: "",
};

export type Message = {
  sender: string;
  response: string;
  id: string;
};

export default function Home() {
  const [state, formAction] = useFormState(transcript, initialState);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const submitButtonRef = useRef<HTMLButtonElement | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [displaySettings, setDisplaySettings] = useState(false);

  //blob data object
  const uploadAudio = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const file = new File([blob], "audio.webm", {
      type: mimeType,
    });
    // set the file as the value to the hidden input field
    if (fileRef.current) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      fileRef.current.files = dataTransfer.files;
      //stimulate click and submit the form
      if (submitButtonRef.current) {
        submitButtonRef.current.click();
      }
    }
  };

  // Responsible for updating the messages when the Server Action completes
  useEffect(() => {
    if (state.response && state.sender) {
      setMessages((messages) => [
        {
          sender: state.sender || "",
          response: state.response || "",
          id: state.id || "",
        },
        ...messages,
      ]);
    }
  }, [state]);

  return (
    <main className="bg-black h-screen overflow-y-visible">
      {/* header */}
      <header className="flex justify-between fixed top-0 w-full text-white p-5">
        <Image
          className="object-contain rounded-full"
          src="https://cdn.dribbble.com/users/398475/screenshots/19434406/media/378ea75ccc6fd1b40baa093fd63b95bf.gif?resize=400x0"
          width={80}
          height={40}
          alt="Picture of Siri"
        />
        <SettingsIcon
          onClick={() => setDisplaySettings(!displaySettings)}
          size={40}
          className="p-2 m-2 rounded-full cursor-pointer bg-purple-600 text-black transition-all ease-in-out duration-150 hover:bg-purple-700 hover:text-white"
        />
      </header>
      {/* form */}
      <form action={formAction} className="flex flex-col bg-black">
        {/* Messages */}
        <div className="flex-1 bg-gradient-to-b from-purple-500 to-black">
          <Messages />
        </div>
        {/* hidden */}
        <input type="file" name="audio" hidden ref={fileRef} />
        <button type="submit" hidden ref={submitButtonRef}></button>
        <div className="fixed bottom-0 w-full overflow-hidden bg-black rounded-t-3xl">
          {/* recorder */}
          <Recorder uploadAudio={uploadAudio} />
          <div>
            {" "}
            {/* voice synthesier - output of the Assistant voice*/}
            <VoiceSynthesizer state={state} displaySettings={displaySettings} />
          </div>
        </div>
      </form>
    </main>
  );
}

// learning sub components
// to use Image we need the whitelist the domain where images comes from
