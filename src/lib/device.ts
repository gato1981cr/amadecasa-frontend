export function getDeviceId(): string {
  let id = localStorage.getItem('deviceId');
  if (!id) {
    // crypto.randomUUID está en navegadores modernos
    id = crypto.randomUUID();
    localStorage.setItem('deviceId', id);
  }
  return id;
}
