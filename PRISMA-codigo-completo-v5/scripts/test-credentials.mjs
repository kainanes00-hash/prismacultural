import {hashPassword} from '../src/auth.mjs';
export async function withTestCredentials(env){env.INITIAL_ADMIN_LOGIN='111111';env.INITIAL_ADMIN_HASH=await hashPassword('123456');env.INITIAL_COLLAB_LOGIN='222222';env.INITIAL_COLLAB_HASH=await hashPassword('654321');return env;}
