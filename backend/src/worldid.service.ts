import fetch from 'node-fetch';

export class WorldIDService {
  static async verifyProofWithWorldcoinAPI({
    nullifier_hash,
    merkle_root,
    proof,
    verification_level,
    action,
    signal_hash,
    app_id,
  }: {
    nullifier_hash: string;
    merkle_root: string;
    proof: string;
    verification_level: string;
    action: string;
    signal_hash?: string;
    app_id: string;
  }) {
    const url = `https://developer.worldcoin.org/api/v2/verify/${app_id}`;
    const body = {
      nullifier_hash,
      merkle_root,
      proof,
      verification_level,
      action,
    };
    if (signal_hash) body['signal_hash'] = signal_hash;
    console.log('[WorldID] Enviando request a Worldcoin Cloud API:', url, body);
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    console.log('[WorldID] Respuesta de Worldcoin Cloud API:', data);
    return data;
  }
}
