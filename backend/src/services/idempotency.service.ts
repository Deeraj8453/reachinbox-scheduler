import { redisConnection } from '../config/redis';

/**
 * Acquires a distributed lock in Redis for the given key.
 * TTL is in seconds.
 */
export async function acquireLock(key: string, ttlSeconds: number = 60): Promise<boolean> {
  const lockKey = `email-lock:${key}`;
  const result = await redisConnection.set(lockKey, 'locked', 'EX', ttlSeconds, 'NX');
  return result === 'OK';
}

/**
 * Releases the distributed lock.
 */
export async function releaseLock(key: string): Promise<void> {
  const lockKey = `email-lock:${key}`;
  await redisConnection.del(lockKey);
}
