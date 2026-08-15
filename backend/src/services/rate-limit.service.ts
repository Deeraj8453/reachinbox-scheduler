import { redisConnection } from '../config/redis';
import { env } from '../config/env';

/**
 * Returns the next available timestamp for a job respecting the hourly limit and minimum delay.
 * Uses an atomic Lua script to reserve capacity.
 */
export async function getNextAvailableSendTime(
  senderId: string,
  requestedTimeMs: number,
  minDelayMs: number,
  hourlyLimit: number
): Promise<number> {
  const LUA_SCRIPT = `
    local senderId = KEYS[1]
    local requestedTimeMs = tonumber(ARGV[1])
    local minDelayMs = tonumber(ARGV[2])
    local hourlyLimit = tonumber(ARGV[3])
    
    -- Keys for tracking
    local lastSendKey = 'email-last-send:' .. senderId
    
    local lastSendTime = tonumber(redis.call('GET', lastSendKey) or '0')
    
    local targetTime = requestedTimeMs
    if lastSendTime > 0 and (targetTime - lastSendTime) < minDelayMs then
      targetTime = lastSendTime + minDelayMs
    end
    
    -- Calculate hour window for the target time
    local hourWindow = math.floor(targetTime / 3600000)
    local rateKey = 'email-rate:' .. senderId .. ':' .. hourWindow
    
    local currentCount = tonumber(redis.call('GET', rateKey) or '0')
    
    -- If current hour is full, move to the next hour
    while currentCount >= hourlyLimit do
      hourWindow = hourWindow + 1
      targetTime = hourWindow * 3600000 -- Start of the next hour
      rateKey = 'email-rate:' .. senderId .. ':' .. hourWindow
      currentCount = tonumber(redis.call('GET', rateKey) or '0')
    end
    
    -- Increment the count for the window
    redis.call('INCR', rateKey)
    redis.call('EXPIRE', rateKey, 7200) -- Expire in 2 hours
    
    -- Update last send time
    redis.call('SET', lastSendKey, targetTime)
    redis.call('EXPIRE', lastSendKey, 7200)
    
    return targetTime
  `;

  const result = await redisConnection.eval(
    LUA_SCRIPT,
    1,
    senderId,
    requestedTimeMs.toString(),
    minDelayMs.toString(),
    hourlyLimit.toString()
  );

  return Number(result);
}
