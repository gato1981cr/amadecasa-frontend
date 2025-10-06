import React, { useEffect, useRef, useState } from 'react';
import { fetchJson } from '../lib/api';
import { getDeviceId } from '../lib/device';
import { useAuth } from '../context/AuthContext';

type StatusResp = { approved: boolean; valid?: boolean; last_login?: string; reason?: string };
type RequestRespOk = { status: 'ok'; name: string; role: 'assistant'|'guest' };
type RequestRespPending = { status: 'pending' };
type RequestResp = RequestRespOk | RequestRespPending;

export default function Login() {
  const { setSession } = useAuth();
  const [name, setName] = useState('');
  const [role, setRole] = useState<'assistant'|'guest'>('assistant');
  const [step, setStep] = useState<'idle'|'requesting'|'pending'|'done'|'error'>('idle');
  const [message, setMessage] = useState<string>('');
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  async function handleAccess(e: React.FormEvent) {
    e.preventDefault();
    try {
      setMessage('');
      setStep('requesting');

      const deviceId = getDeviceId();
      const resp = await fetchJson<RequestResp>('/api/auth/request', {
        method: 'POST',
        body: { name: name.trim(), role, deviceId, userAgent: navigator.userAgent },
      });

      if (resp.status === 'ok') {
        setSession({ name: name.trim(), role, deviceId });
        setStep('done');
        return;
      }

      // pending: empezamos polling a /api/auth/status
      setStep('pending');
      setMessage('Te envié una notificación a Telegram. Aprobá el dispositivo y luego se completará el acceso.');
      await pollUntilApproved(name.trim(), role, deviceId, 120_000, 5_000); // 2 min, cada 5s

      // si aprobado, volvemos a disparar request para setear cookie
      const final = await fetchJson<RequestResp>('/api/auth/request', {
        method: 'POST',
        body: { name: name.trim(), role, deviceId, userAgent: navigator.userAgent },
      });
      if (final.status === 'ok') {
        setSession({ name: name.trim(), role, deviceId });
        setStep('done');
      } else {
        setStep('error');
        setMessage('Aprobado, pero no se pudo crear sesión. Intenta otra vez.');
      }
    } catch (err: any) {
      setStep('error');
      setMessage(err?.message || 'Error inesperado');
    }
  }

  async function pollUntilApproved(
    name: string,
    role: 'assistant'|'guest',
    deviceId: string,
    timeoutMs: number,
    intervalMs: number,
  ) {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    const start = Date.now();

    while (Date.now() - start < timeoutMs) {
      await new Promise(r => setTimeout(r, intervalMs));
      const status = await fetchJson<StatusResp>('/api/auth/status', {
        query: { name, role, deviceId },
        signal: abortRef.current.signal,
      });
      if (status.approved && status.valid !== false) {
        return;
      }
    }
    throw new Error('Tiempo de espera agotado. Vuelve a intentar luego de aprobar.');
  }

  const disabled = step === 'requesting' || step === 'pending';

  return (
    <div className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-semibold mb-4">Acceso</h1>
      <form onSubmit={handleAccess} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Nombre</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="Escribe tu nombre"
            required
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Rol</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as any)}
            className="w-full border rounded px-3 py-2"
          >
            <option value="assistant">Asistente</option>
            <option value="guest">Invitado</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={disabled}
          className="w-full rounded px-4 py-2 bg-black text-white disabled:opacity-60"
        >
          {step === 'requesting' ? 'Verificando…' : step === 'pending' ? 'Esperando aprobación…' : 'Acceder'}
        </button>

        {message && <p className="text-sm text-gray-700">{message}</p>}
      </form>
    </div>
  );
}
