from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from resemblyzer import VoiceEncoder, preprocess_wav
import numpy as np
import soundfile as sf
import tempfile
import os

app = FastAPI()

# Optional: test route
@app.get("/")
def root():
    return {"message": "Voice descriptor API is live"}

# CORS setup for frontend (React)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://localhost:3000", "https://artconnect-frontend.onrender.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load voice encoder
encoder = VoiceEncoder()

@app.post("/extract-voice-descriptor")
async def extract_voice_descriptor(audio: UploadFile = File(...)):
    try:
        # Save to temp file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_audio:
            temp_audio.write(await audio.read())
            temp_audio_path = temp_audio.name

        # Load audio from temp path
        wav, sr = sf.read(temp_audio_path)
        if sr != 16000:
            raise HTTPException(status_code=400, detail="Audio must be 16kHz")

        # Preprocess and extract embedding
        preprocessed = preprocess_wav(wav, source_sr=sr)
        embedding = encoder.embed_utterance(preprocessed)

        # Clean up
        os.remove(temp_audio_path)

        return {"descriptor": embedding.tolist()}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))