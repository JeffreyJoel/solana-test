import type { NextApiRequest, NextApiResponse } from 'next';
import { PublicKey } from '@solana/web3.js';
import { v4 as uuidv4 } from 'uuid';
// import { nonceStore } from '@/pages/utils/store';
import { serialize } from 'cookie';

const NONCE_EXPIRY = 5 * 60 * 1000;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { wallet } = req.query;
  
  if (!wallet || typeof wallet !== 'string') {
    return res.status(400).json({ error: 'Invalid wallet address' });
  }
  
  try {
    new PublicKey(wallet);
    const nonce = uuidv4();
    const expiresAt = Date.now() + NONCE_EXPIRY;
    const cookieValue = JSON.stringify({ nonce, expiresAt, wallet });
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: true,
      maxAge: NONCE_EXPIRY,
      path: '/',
    };

    res.setHeader('Set-Cookie', serialize('nonceData', cookieValue, cookieOptions));

    await new Promise(resolve => setTimeout(resolve, 100)); 
    return res.json({ nonce });
  } catch (error) {
    return res.status(400).json({ error: 'Invalid Solana address' });
  }
}