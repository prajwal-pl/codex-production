"use client";

import React, { useState, useRef } from "react";
import { Paperclip, Mic, MicOff, Send, X, Loader2 } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (content: string, attachments?: File[]) => void;
  isLoading: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Handle text input submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() === "" && attachments.length === 0) return;
    
    onSendMessage(message, attachments);
    setMessage("");
    setAttachments([]);
  };

  // Handle file attachment
  const handleAttachFiles = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setAttachments(prev => [...prev, ...filesArray]);
      // Reset file input so the same file can be selected again
      e.target.value = "";
    }
  };

  // Remove a specific attachment
  const removeAttachment = (index: number) => {
    const newAttachments = [...attachments];
    newAttachments.splice(index, 1);
    setAttachments(newAttachments);
  };

  // Handle audio recording
  const toggleRecording = async () => {
    if (isRecording) {
      stopRecording();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      recordingChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          recordingChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(recordingChunksRef.current, { type: "audio/webm" });
        const audioFile = new File([audioBlob], `recording-${Date.now()}.webm`, {
          type: "audio/webm"
        });
        
        setAttachments(prev => [...prev, audioFile]);
        
        // Stop all tracks on the stream to release the microphone
        stream.getTracks().forEach(track => track.stop());
        
        setIsRecording(false);
        setRecordingTime(0);
        if (recordingTimerRef.current) {
          clearInterval(recordingTimerRef.current);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Start recording timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  // Format recording time
  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="border-t dark:border-zinc-800 p-4">
      {/* Attachment preview area */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {attachments.map((file, index) => (
            <div key={index} className="flex items-center gap-1 bg-zinc-900 dark:bg-zinc-800 rounded-full px-2 py-1">
              <span className="text-xs truncate max-w-[100px]">{file.name}</span>
              <button
                onClick={() => removeAttachment(index)}
                className="p-0.5 hover:bg-zinc-800 dark:hover:bg-zinc-700 rounded-full"
                aria-label="Remove attachment"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Recording indicator */}
      {isRecording && (
        <div className="flex items-center gap-2 bg-red-950/20 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-2 rounded-md mb-2">
          <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-sm">Recording {formatRecordingTime(recordingTime)}</span>
        </div>
      )}

      {/* Message input form */}
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <div className="flex-1 relative">
          <textarea
            className="resize-none w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-600 dark:bg-zinc-900 dark:border-zinc-700 min-h-[40px] max-h-[200px]"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            disabled={isLoading}
            rows={1}
          />
        </div>

        {/* Input actions */}
        <div className="flex gap-1">
          {/* File attachment button */}
          <button
            type="button"
            onClick={handleAttachFiles}
            className="p-2 rounded-full hover:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-500"
            aria-label="Attach files"
            disabled={isLoading}
          >
            <Paperclip size={20} />
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              multiple
            />
          </button>

          {/* Audio recording button */}
          <button
            type="button"
            onClick={toggleRecording}
            className={`p-2 rounded-full ${
              isRecording 
                ? "bg-red-950/20 text-red-600 dark:bg-red-900/20 dark:text-red-400" 
                : "hover:bg-zinc-900 text-zinc-500 dark:hover:bg-zinc-800"
            }`}
            aria-label={isRecording ? "Stop recording" : "Start recording"}
            disabled={isLoading}
          >
            {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
          </button>

          {/* Send button */}
          <button
            type="submit"
            className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white"
            aria-label="Send message"
            disabled={isLoading || (message.trim() === "" && attachments.length === 0)}
          >
            {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
          </button>
        </div>
      </form>
    </div>
  );
};