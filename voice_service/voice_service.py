from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from resemblyzer import VoiceEncoder, preprocess_wav
import numpy as np
import soundfile as sf
import tempfile
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or restrict to your frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

encoder = VoiceEncoder()

@app.post("/extract-voice-descriptor")
async def extract_voice_descriptor(audio: UploadFile = File(...)):
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_audio:
            temp_audio.write(await audio.read())
            temp_audio_path = temp_audio.name

        wav, sr = sf.read(temp_audio_path)
        os.remove(temp_audio_path)

        if sr != 16000:
            raise HTTPException(status_code=400, detail="Audio must be 16kHz")

        preprocessed = preprocess_wav(wav, source_sr=sr)
        if preprocessed.shape[0] == 0:
            raise HTTPException(status_code=400, detail="No usable audio found")

        embedding = encoder.embed_utterance(preprocessed)

        if embedding is None or len(embedding) == 0:
            raise HTTPException(status_code=500, detail="Descriptor extraction failed")

        return {"descriptor": embedding.tolist()}

    except Exception as e:
        print("❌ Error in /extract-voice-descriptor:", str(e))
        raise HTTPException(status_code=500, detail=str(e))