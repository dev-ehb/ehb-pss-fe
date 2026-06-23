'use client';

import { Suspense, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';

const PSS = process.env.NEXT_PUBLIC_PSS_API_URL ?? 'http://localhost:3001';

type Step = 'capture' | 'submitting' | 'review' | 'error';

function CaptureScreen() {
  const params = useParams<{ app_id: string }>();
  const search = useSearchParams();
  const appId = params.app_id;
  const token = search.get('token') ?? '';
  const platformId = search.get('platform_id') ?? '';
  const originEntity = search.get('entity') ?? undefined;
  const returnUrl = search.get('return_url') ?? '';

  const [image, setImage] = useState<string | null>(null);
  const [step, setStep] = useState<Step>('capture');
  const [error, setError] = useState('');
  const [cameraOn, setCameraOn] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraOn(true);
    } catch {
      setError('Could not access the camera. You can upload a photo instead.');
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraOn(false);
  };

  const capture = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 480;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    setImage(canvas.toDataURL('image/jpeg', 0.8));
    stopCamera();
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImage(typeof reader.result === 'string' ? reader.result : null);
    reader.readAsDataURL(file);
  };

  const submit = async () => {
    if (!image) return;
    if (!token) { setError('Missing session token. Open this screen from your platform.'); setStep('error'); return; }
    setStep('submitting');
    try {
      const startRes = await fetch(`${PSS}/verification/${appId}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ platform_id: platformId, origin_entity: originEntity }),
      });
      if (!startRes.ok) throw new Error(`start failed (${startRes.status})`);
      const { request_id } = await startRes.json();

      const submitRes = await fetch(`${PSS}/verification/${appId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ request_id, proof_ref: image }),
      });
      if (!submitRes.ok) throw new Error(`submit failed (${submitRes.status})`);
      setStep('review');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed');
      setStep('error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Facial Verification</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Take a clear selfie. A reviewer will compare it to your CNIC. You only do this once — it is reused everywhere.
        </p>

        {step === 'review' ? (
          <div className="mt-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600 text-2xl">⏳</div>
            <p className="font-medium text-gray-900 dark:text-gray-100">Submitted — under review</p>
            <p className="mt-1 text-sm text-gray-500">A PSS admin will review it shortly. You will be notified when it is approved.</p>
            {returnUrl && (
              <a href={returnUrl} className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                Return
              </a>
            )}
          </div>
        ) : step === 'error' ? (
          <div className="mt-6 text-center">
            <p className="font-medium text-red-600">Something went wrong</p>
            <p className="mt-1 text-sm text-gray-500">{error}</p>
            <button onClick={() => { setError(''); setStep('capture'); }} className="mt-4 rounded-lg border px-4 py-2 text-sm">Try again</button>
          </div>
        ) : (
          <>
            <div className="mt-4 aspect-square w-full overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              {image ? (
                <img src={image} alt="selfie" className="h-full w-full object-cover" />
              ) : cameraOn ? (
                <video ref={videoRef} className="h-full w-full object-cover" playsInline muted />
              ) : (
                <span className="text-sm text-gray-400">No photo yet</span>
              )}
            </div>

            {error && <p className="mt-2 text-xs text-red-500">{error}</p>}

            <div className="mt-4 space-y-2">
              {!image && !cameraOn && (
                <button onClick={startCamera} className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                  Start camera
                </button>
              )}
              {cameraOn && (
                <button onClick={capture} className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                  Capture
                </button>
              )}
              {image && (
                <div className="flex gap-2">
                  <button onClick={() => setImage(null)} className="flex-1 rounded-lg border px-4 py-2 text-sm">Retake</button>
                  <button onClick={submit} disabled={step === 'submitting'} className="flex-1 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50">
                    {step === 'submitting' ? 'Submitting…' : 'Submit'}
                  </button>
                </div>
              )}
              {!image && (
                <label className="block w-full cursor-pointer rounded-lg border border-dashed px-4 py-2 text-center text-sm text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800">
                  or upload a photo
                  <input type="file" accept="image/*" className="hidden" onChange={onFile} />
                </label>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-sm text-gray-400">Loading…</div>}>
      <CaptureScreen />
    </Suspense>
  );
}
