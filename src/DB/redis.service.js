// import { redisClient } from "./redis.connection.js";


// export const revokeTokenKeyPrefix = ({ userId }) =>{
//     return `user:revokeToken:${userId}`;
// };

// export const revokeTokenKey = ({userId, jti}) =>{
//     return `${revokeTokenKeyPrefix({userId})}:${jti}`;
// }

// // set a key-value pair in Redis
// export const set = async ({key, value, ttl = null}) => {
//     try {
//         const data = typeof value != "string" ? JSON.stringify(value) : value;
//         if(ttl) {
//              return await redisClient.set(key, data,{
//                 expiration: {
//                     type: 'EX',
//                     value: ttl
//                 },
//             });
//         } else{
//             return await redisClient.set(key, data);
//         }
//     }
//     catch (error) {
//         console.log("Redis Set Erorr", error);
//     }
// };

// // get a key-value pair in Redis
// export const get = async ({key}) => {
//     try {
//         const data = await redisClient.get(key);
//         return data;
//     }
//     catch (error) {
//         console.log("Redis Get Erorr", error);
//     }
// };

// // update a key-value pair in Redis
// export const update = async ({key, value, ttl = null}) => {
//     try {
//         const isExists = await redisClient.exists(key);
//         if(!isExists) return false;
//         const data = typeof value != "string" ? JSON.stringify(value) : value;
//         if(ttl) {
//              return await redisClient.set(key, data,{
//                 expiration: {
//                     type: 'EX',
//                     value: ttl
//                 },
//             });
//         } else{
//             return await redisClient.set(key, data);
//         }  
//     }
//     catch (error) {
//         console.log("Redis Update Erorr", error);
//     }
// };

// // delete a key-value pair in Redis
// export const del = async ({key}) => {
//     try {
//         const isExists = await redisClient.exists(key);
//         if(!isExists) return false;
//         return await redisClient.del(key);
//     }
//     catch (error) {
//         console.log("Redis Delete Erorr", error);
//         }
// };

// // expire
// export const expire = async ({key, ttl}) => {
//     try {
//         const isExists = await redisClient.exists(key);
//         if(!isExists) return false;
//         return await redisClient.expire(key, ttl);
//     }
//     catch (error) {
//         console.log("Redis Expire Erorr", error);
//         }
// };

// // ttl 
// export const ttl = async ({key}) => {
//     try {
//         const isExists = await redisClient.exists(key);
//         if(!isExists) return false;
//         return await redisClient.ttl(key);
//     }
//     catch (error) {
//         console.log("Redis TTL Erorr", error);
//         }
// };

// // keys pattern
// export const keys = async ({pattern}) => {
//     try {
//         return await redisClient.keys(pattern);
//     }
//     catch (error) {
//         console.log("Redis Keys Erorr", error);
//         }
// };

// export const incr = async ({ key }) => {
//     try {
//         return await redisClient.incr(key);
//     } catch (error) {
//         console.log("Redis INCR Error", error);
//     }
// };

// backend/src/DB/redis.service.js
import { redisClient, isRedisReady } from "./redis.connection.js";

// Guard مشترك
const checkReady = (operation) => {
  if (!isRedisReady()) {
    console.warn(`Redis ${operation}: client not ready, skipping`);
    return false;
  }
  return true;
};

export const revokeTokenKeyPrefix = ({ userId }) => {
  return `user:revokeToken:${userId}`;
};

export const revokeTokenKey = ({ userId, jti }) => {
  return `${revokeTokenKeyPrefix({ userId })}:${jti}`;
};

export const set = async (keyOrObj, valueOrNull, ttlOrNull = null) => {
  if (!checkReady("set")) return false;  // ← الإضافة
  try {
    let key, value, ttl;
    if (typeof keyOrObj === 'object') {
      key = keyOrObj.key;
      value = keyOrObj.value;
      ttl = keyOrObj.ttl;
    } else {
      key = keyOrObj;
      value = valueOrNull;
      ttl = ttlOrNull;
    }
    if (!key || key === 'undefined') {
      console.error("Redis set: invalid key", key);
      return false;
    }
    if (value === undefined || value === null) {
      console.error("Redis set: invalid value", value);
      return false;
    }
    const data = typeof value !== "string" ? JSON.stringify(value) : value;
    if (ttl && typeof ttl === 'number' && ttl > 0) {
      return await redisClient.setEx(key, ttl, data);
    } else {
      return await redisClient.set(key, data);
    }
  } catch (error) {
    console.log("Redis Set Error:", error.message);
    return false;
  }
};

export const get = async (keyOrObj) => {
  if (!checkReady("get")) return null;  // ← الإضافة
  try {
    const key = typeof keyOrObj === 'object' ? keyOrObj.key : keyOrObj;
    if (!key || key === 'undefined') {
      console.error("Redis get: invalid key", key);
      return null;
    }
    return await redisClient.get(key);
  } catch (error) {
    console.log("Redis Get Error:", error.message);
    return null;
  }
};

export const update = async ({ key, value, ttl = null }) => {
  if (!checkReady("update")) return false;  // ← الإضافة
  try {
    const isExists = await redisClient.exists(key);
    if (!isExists) return false;
    const data = typeof value !== "string" ? JSON.stringify(value) : value;
    if (ttl) {
      return await redisClient.setEx(key, ttl, data);
    } else {
      return await redisClient.set(key, data);
    }
  } catch (error) {
    console.log("Redis Update Error:", error.message);
    return false;
  }
};

export const del = async ({ key }) => {
  if (!checkReady("del")) return false;  // ← الإضافة
  try {
    const isExists = await redisClient.exists(key);
    if (!isExists) return false;
    return await redisClient.del(key);
  } catch (error) {
    console.log("Redis Delete Error:", error.message);
    return false;
  }
};

export const expire = async ({ key, ttl }) => {
  if (!checkReady("expire")) return false;  // ← الإضافة
  try {
    const isExists = await redisClient.exists(key);
    if (!isExists) return false;
    return await redisClient.expire(key, ttl);
  } catch (error) {
    console.log("Redis Expire Error:", error.message);
    return false;
  }
};

export const ttl = async ({ key }) => {
  if (!checkReady("ttl")) return false;  // ← الإضافة
  try {
    const isExists = await redisClient.exists(key);
    if (!isExists) return false;
    return await redisClient.ttl(key);
  } catch (error) {
    console.log("Redis TTL Error:", error.message);
    return false;
  }
};

export const keys = async ({ pattern }) => {
  if (!checkReady("keys")) return [];  // ← الإضافة
  try {
    return await redisClient.keys(pattern);
  } catch (error) {
    console.log("Redis Keys Error:", error.message);
    return [];
  }
};

export const incr = async (keyOrObj) => {
  if (!checkReady("incr")) return null;  // ← الإضافة
  try {
    const key = typeof keyOrObj === 'object' ? keyOrObj.key : keyOrObj;
    if (!key || key === 'undefined') {
      console.error("Redis incr: invalid key", key);
      return null;
    }
    return await redisClient.incr(key);
  } catch (error) {
    console.log("Redis INCR Error:", error.message);
    return null;
  }
};