import { useEffect, useState } from "react";
import { login, status, logout, getOrCreateDeviceId } from "../api/auth";

type Role = "admin" | "assistant" | "guest";

export default function LoginPage() {
  const [ownerName, setOwnerName] = useState("Johan");
  const [role, setRole] = useState<Role>("assistant");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [pending, setPending] = useState<null | { expiresAt?: string }>(null);
  const [user, setUser] = useState<{ ownerName: string; role: Role } | null>(null);

  useEffect(() => {
    // Al cargar, chequea si ya hay sesión
    status().then((r) => {
      if (r.ok && r.data?.user) {
        setUser(r.data.user);
        setInfo("Sesión activa.");
      }
    });
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setInfo("");

    const res = await login({ ownerName, role, password });
    setLoading(false);

    if (res.status === 202 && res.data?.status === "pending_telegram") {
      setPending({ expiresAt: res.data.expiresAt });
      setInfo("Te enviamos un mensaje por Telegram con enlaces para aprobar o rechazar este dispositivo.");
      return;
    }

    if (res.ok && res.data?.user) {
      setUser(res.data.user);
      setInfo("¡Listo! Sesión iniciada.");
      return;
    }

    setError(res.data?.error || "No se pudo iniciar sesión.");
  }

  async function onApprovedClick() {
    // Reintenta el login tras aprobar en Telegram (usa los mismos datos)
    setLoading(true);
    setError("");
    setInfo("Verificando aprobación…");
    const res = await login({ ownerName, role, password });
    setLoading(false);

    if (res.ok && res.data?.user) {
      setPending(null);
      setUser(res.data.user);
      setInfo("¡Dispositivo aprobado y sesión iniciada!");
    } else if (res.status === 202) {
      setError("Aún no aparece aprobado. Dale clic a Aprobar en Telegram y vuelve a intentar.");
    } else {
      setError(res.data?.error || "No se pudo completar el inicio de sesión.");
    }
  }

  async function onLogout() {
    setLoading(true);
    await logout();
    setLoading(false);
    setUser(null);
    setInfo("Sesión cerrada.");
  }

  const deviceId = getOrCreateDeviceId();

  return (
    <div style={{ maxWidth: 440, margin: "3rem auto", padding: "1rem", fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ marginBottom: 12 }}>AmaDeCasa — Login</h1>

      <div style={{ fontSize: 12, marginBottom: 12, opacity: 0.8 }}>
        <b>DeviceId:</b> <code>{deviceId}</code>
      </div>

      {user ? (
        <div style={{ border: "1px solid #ddd", padding: 16, borderRadius: 8 }}>
          <p>
            Sesión como <b>{user.ownerName}</b> (<code>{user.role}</code>)
          </p>
          <button disabled={loading} onClick={onLogout}>
            {loading ? "Cerrando…" : "Cerrar sesión"}
          </button>
        </div>
      ) : (
        <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
          <label>
            Nombre
            <input
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              placeholder="Tu nombre"
              required
              style={{ width: "100%" }}
            />
          </label>

          <label>
            Rol
            <select value={role} onChange={(e) => setRole(e.target.value as Role)} style={{ width: "100%" }}>
              <option value="assistant">assistant</option>
              <option value="admin">admin</option>
              <option value="guest">guest</option>
            </select>
          </label>

          <label>
            Contraseña (según rol)
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              required
              style={{ width: "100%" }}
            />
          </label>

          <button type="submit" disabled={loading}>
            {loading ? "Entrando…" : "Entrar"}
          </button>
        </form>
      )}

      {pending && !user && (
        <div style={{ marginTop: 16, padding: 12, border: "1px dashed #999", borderRadius: 8 }}>
          <p>
            <b>Pendiente de aprobación en Telegram.</b>
          </p>
          {pending.expiresAt && (
            <p style={{ fontSize: 12, opacity: 0.8 }}>
              Expira: <code>{new Date(pending.expiresAt).toLocaleString()}</code>
            </p>
          )}
          <button onClick={onApprovedClick} disabled={loading}>
            {loading ? "Verificando…" : "Ya aprobé"}
          </button>
        </div>
      )}

      {!!info && <p style={{ color: "#2d6a4f", marginTop: 12 }}>{info}</p>}
      {!!error && <p style={{ color: "#b00020", marginTop: 12 }}>{error}</p>}
    </div>
  );
}
