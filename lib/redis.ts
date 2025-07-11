import Redis from 'ioredis'

const redisUrl = process.env.UPSTASH_REDIS_URL || process.env.REDIS_URL

if (!redisUrl) {
  throw new Error('Redis URL não configurada. Defina UPSTASH_REDIS_URL ou REDIS_URL no .env')
}

export const redis = new Redis(redisUrl)

export default redis 