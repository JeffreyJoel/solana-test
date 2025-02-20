import type { NextApiRequest, NextApiResponse } from 'next';
import { PublicKey } from '@solana/web3.js';
import nacl from 'tweetnacl';
// import { nonceStore } from '@/pages/utils/store';
import { serialize } from 'cookie';
import { parse } from 'cookie';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { wallet, nonce, signature } = req.body;
  
  if (!wallet || !nonce || !signature) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }
  
  const cookies = parse(req.headers.cookie || '');
  const nonceDataCookie = cookies.nonceData;
 
  if (!nonceDataCookie) {
    return res.status(401).json({ verified: false, error: 'No nonce found' });
  }

  let storedNonceData;
  try {
    storedNonceData = JSON.parse(nonceDataCookie);
  } catch (error) {
    return res.status(401).json({ verified: false, error: 'Invalid nonce data' });
  }

  if (storedNonceData.wallet !== wallet || storedNonceData.nonce !== nonce) {
    return res.status(401).json({ verified: false, error: 'Invalid nonce' });
  }
  
  try {
    const publicKey = new PublicKey(wallet);
    const message = new TextEncoder().encode(`Sign this message for authentication: ${nonce}`);
    const signatureUint8 = Buffer.from(signature, 'base64');

    const verified = nacl.sign.detached.verify(
      message,
      signatureUint8,
      publicKey.toBytes()
    );
    
    res.setHeader('Set-Cookie', serialize('nonceData', '', { maxAge: -1, path: '/' }));
    
    if (verified) {     
      return res.json({ 
        verified: true,
        wallet
      });
    } else {
      return res.status(401).json({ verified: false, error: 'Invalid signature' });
    }
  } catch (error) {
    return res.status(500).json({ verified: false, error: 'Verification error' });
  }
}