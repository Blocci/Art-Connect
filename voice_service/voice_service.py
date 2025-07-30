from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from resemblyzer import VoiceEncoder, preprocess_wav
import numpy as np
import soundfile as sf
import tempfile
import os
import time
import subprocess

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

encoder = VoiceEncoder()

@app.post("/extract-voice-descriptor")
async def extract_voice_descriptor(audio: UploadFile = File(...)):
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as temp_input:
            contents = await audio.read()
            temp_input.write(contents)
            input_path = temp_input.name

        # 🔄 Convert to .wav using ffmpeg
        output_path = input_path.replace(".webm", ".wav")
        try:
            subprocess.run(
                ["ffmpeg", "-i", input_path, "-ar", "16000", "-ac", "1", output_path],
                check=True,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
            )
        except subprocess.CalledProcessError as e:
            print("❌ ffmpeg failed:", e)
            raise HTTPException(status_code=400, detail="Audio conversion failed.")

        # ✅ Read the .wav file
        try:
            wav, sr = sf.read(output_path)
        except Exception as e:
            print("❌ Error reading converted audio file:", e)
            raise HTTPException(status_code=400, detail="Invalid converted audio file.")

        if sr != 16000:
            print(f"❌ Sample rate incorrect: {sr}")
            raise HTTPException(status_code=400, detail="Audio must be 16kHz.")

        preprocessed = preprocess_wav(wav, source_sr=sr)
        embedding = encoder.embed_utterance(preprocessed)

        # Clean up
        os.remove(input_path)
        os.remove(output_path)

        print("✅ Descriptor length:", len(embedding))
        return { "descriptor": embedding.tolist() }

    except Exception as e:
        print("🔥 Server error:", str(e))
        raise HTTPException(status_code=500, detail="Internal server error.")