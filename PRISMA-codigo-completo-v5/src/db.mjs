export const stmt=(env,sql,...params)=>{if(!env.DB)throw Error('DB unavailable');return env.DB.prepare(sql).bind(...params);};
export const one=(env,sql,...params)=>stmt(env,sql,...params).first();
export const all=async(env,sql,...params)=>(await stmt(env,sql,...params).all()).results;
export const run=(env,sql,...params)=>stmt(env,sql,...params).run();
