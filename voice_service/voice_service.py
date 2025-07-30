from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from resemblyzer import VoiceEncoder, preprocess_wav
import numpy as np
import soundfile as sf
import tempfile
import os
import time

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
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_audio:
            contents = await audio.read()
            temp_audio.write(contents)
            temp_audio_path = temp_audio.name

        # 🧠 Buffer: wait to ensure file is flushed and readable
        time.sleep(0.2)

        # ✅ Try to read the audio file
        try:
            wav, sr = sf.read(temp_audio_path)
        except Exception as e:
            print("❌ Error reading audio file:", e)
            raise HTTPException(status_code=400, detail="Invalid audio file format.")

        if sr != 16000:
            print(f"❌ Sample rate incorrect: {sr}")
            raise HTTPException(status_code=400, detail="Audio must be 16kHz.")

        preprocessed = preprocess_wav(wav, source_sr=sr)
        embedding = encoder.embed_utterance(preprocessed)

        os.remove(temp_audio_path)

        print("✅ Descriptor length:", len(embedding))
        return { "descriptor": embedding.tolist() }

    except Exception as e:
        print("🔥 Server error:", str(e))
        raise HTTPException(status_code=500, detail="Internal server error.")