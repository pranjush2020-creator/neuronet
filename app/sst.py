import sounddevice as sd
from scipy.io.wavfile import write
import whisper

SAMPLE_RATE = 16000
RECORD_SECONDS = 5
MICROPHONE_ID = 11

print("Loading Whisper model...")
model = whisper.load_model("base")

print("Speak now...")

audio = sd.rec(
    int(RECORD_SECONDS * SAMPLE_RATE),
    samplerate=SAMPLE_RATE,
    channels=1,
    dtype="int16",
    device=MICROPHONE_ID
)

sd.wait()

print("Recording finished.")

write("question.wav", SAMPLE_RATE, audio)

print("Converting speech to text...")

result = model.transcribe("question.wav")

print("\nYou said:")
print(result["text"])