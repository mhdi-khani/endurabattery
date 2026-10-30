/* Endura demo admin: localhost-only, explicit opt-in. NOT production authentication. */
import {remote} from './supabase-live.js';
const VALID=new Set(['localhost','127.0.0.1','[::1]']);
const USER='endura-demo';
const PASS='EnduraLocal!2026';
export function localDemoMode(){return VALID.has(location.hostname)&&new URLSearchParams(location.search).get('localDemo')==='1';}
export function localLoginMarkup(){return `<section class="max section" style="max-width:620px;min-height:65vh"><div class="card card-pad" style="padding:30px"><div class="kicker">ENDURA / LOCAL DEMO</div><h1>ورود آزمایشی مدیر</h1><div class="note warn">این حالت فقط روی localhost کار می‌کند. داده‌ها فقط در مرورگر همین دستگاه ذخیره می‌شوند؛ هیچ دسترسی به Supabase وجود ندارد.</div><form id="localAdminLoginForm" class="stack" style="margin-top:20px"><label class="label">نام کاربری</label><input name="username" class="field latin" required autocomplete="username" value="${USER}"><label class="label">رمز عبور</label><input name="password" type="password" class="field latin" required autocomplete="current-password"><button class="btn primary" type="submit">ورود آزمایشی ←</button></form></div></section>`;}
export function signInLocal(user,password){if(!localDemoMode())throw Error('ورود آزمایشی فقط روی localhost مجاز است.');if(user!==USER||password!==PASS)throw Error('نام کاربری یا رمز آزمایشی نادرست است.');sessionStorage.setItem('endura-local-demo-auth','1');remote.admin=true;remote.user={email:'endura-demo@localhost'};remote.client=null;return true;}
export function restoreLocalLogin(){if(localDemoMode()&&sessionStorage.getItem('endura-local-demo-auth')==='1'){remote.admin=true;remote.user={email:'endura-demo@localhost'};remote.client=null;}}
export function signOutLocal(){sessionStorage.removeItem('endura-local-demo-auth');remote.admin=false;remote.user=null;remote.client=null;}
export const LOCAL_USER=USER;
export const LOCAL_PASS=PASS;
