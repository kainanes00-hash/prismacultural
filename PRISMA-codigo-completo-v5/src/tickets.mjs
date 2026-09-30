import {one,all,run} from './db.mjs';
import {fail,requireAccount,csrf,limited,digest} from './auth.mjs';
import {bounded} from './portal.mjs';
const json=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
const str=(v,max)=>{if(typeof v!=='string'||!v.trim()||v.length>max)throw fail(400,'Confira os campos obrigatórios.');return v.trim();};
const number=(v,min,max)=>{if(!Number.isSafeInteger(v)||v<min||v>max)throw fail(400,'Confira as quantidades e os valores.');return v;};
async function data(request){if(!request.headers.get('content-type')?.includes('application/json'))throw fail(415,'Formato inválido.');let d;try{d=JSON.parse(new TextDecoder().decode(await bounded(request,12000)));}catch(e){throw e.status?e:fail(400,'Dados inválidos.');}if(!d||typeof d!=='object'||Array.isArray(d))throw fail(400,'Dados inválidos.');return d;}
const soldLot="(SELECT COUNT(*) FROM ticket_orders o WHERE o.lot_id=l.id AND o.status!='cancelled')";
const soldSector="(SELECT COUNT(*) FROM ticket_orders o JOIN ticket_lots ol ON ol.id=o.lot_id WHERE ol.sector_id=s.id AND o.status!='cancelled')";
const catalog=`SELECT l.id,l.name AS lot_name,l.price_cents,l.capacity AS lot_capacity,s.id AS sector_id,s.name AS sector_name,s.capacity AS sector_capacity,e.id AS event_id,e.name AS event_name,MAX(0,MIN(l.capacity-${soldLot},s.capacity-${soldSector})) AS available FROM ticket_lots l JOIN ticket_sectors s ON s.id=l.sector_id JOIN events e ON e.id=s.event_id WHERE l.active=1 AND s.active=1 AND e.status='published' ORDER BY e.name,s.name,l.created_at,l.id`;
export async function ticketsApi(request,env,url){const p=url.pathname,m=request.method;
 if(p==='/api/tickets'&&m==='GET')return json({lots:await all(env,catalog)});
 if(p==='/api/tickets/orders'&&m==='POST'){
  csrf(request);const d=await data(request);if(d.fictional!==true)throw fail(400,'Confirme que esta é uma simulação com dados fictícios.');
  const name=str(d.name,160),cpf=str(d.cpf,14).replace(/[.\-]/g,''),dob=str(d.birth_date,10),key=str(d.request_key,36),lotId=str(d.lot_id,36);
  if(!/^\d{11}$/.test(cpf))throw fail(400,'Use 11 dígitos fictícios no campo CPF.');
  const date=new Date(dob+'T12:00:00Z');if(!/^\d{4}-\d{2}-\d{2}$/.test(dob)||isNaN(date)||date.toISOString().slice(0,10)!==dob||dob<'1900-01-01'||dob>new Date().toISOString().slice(0,10))throw fail(400,'Informe uma data de nascimento válida para o personagem fictício.');
  if(!/^[0-9a-f-]{36}$/.test(key)||!/^[0-9a-f-]{36}$/.test(lotId))throw fail(400,'Reabra a seleção de ingressos.');
  const previous=await one(env,'SELECT id FROM ticket_orders WHERE request_key=?',key);if(previous)return json({id:previous.id,message:'Pedido já recebido. Aguarde a criação do design pela PRISMA.'});
  await limited(env,'tickets:'+await digest(request.headers.get('cf-connecting-ip')||'unknown'),30,900000);
  const id=crypto.randomUUID();
  await run(env,`INSERT INTO ticket_orders (id,request_key,lot_id,name,cpf,birth_date,status,event_name,sector_name,lot_name,price_cents,created_at) SELECT ?,?,l.id,?,?,?,'pending',e.name,s.name,l.name,l.price_cents,? FROM ticket_lots l JOIN ticket_sectors s ON s.id=l.sector_id JOIN events e ON e.id=s.event_id WHERE l.id=? AND l.active=1 AND s.active=1 AND e.status='published' AND l.capacity>${soldLot} AND s.capacity>${soldSector} ON CONFLICT(request_key) DO NOTHING`,id,key,name,cpf,dob,new Date().toISOString(),lotId);
  const saved=await one(env,'SELECT id FROM ticket_orders WHERE request_key=?',key);if(!saved)throw fail(409,'Este setor ou lote não está mais disponível. Atualize as opções e escolha outro ingresso.');
  return json({id:saved.id,message:'Simulação recebida. O pedido está no Administrador, aguardando o design do ingresso. Não houve cobrança.'},201);
 }
 if(!p.startsWith('/api/admin/tickets'))return null;
 await requireAccount(request,env,'admin');if(m!=='GET')csrf(request);
 if(p==='/api/admin/tickets'&&m==='GET')return json({
  events:await all(env,'SELECT id,name,status FROM events ORDER BY name'),
  sectors:await all(env,`SELECT s.*,${soldSector} AS reserved FROM ticket_sectors s ORDER BY created_at,id`),
  lots:await all(env,`SELECT l.*,${soldLot} AS reserved FROM ticket_lots l ORDER BY created_at,id`),
  orders:await all(env,'SELECT id,event_name,sector_name,lot_name,price_cents,status,created_at FROM ticket_orders ORDER BY created_at DESC LIMIT 500')
 });
 if(p==='/api/admin/tickets/sectors'&&m==='POST'){
  const d=await data(request),name=str(d.name,100),capacity=number(d.capacity,0,100000),eventId=str(d.event_id,36);
  if(!await one(env,'SELECT id FROM events WHERE id=?',eventId))throw fail(404,'Evento não encontrado.');
  const id=crypto.randomUUID();await run(env,'INSERT INTO ticket_sectors (id,event_id,name,capacity,active,version,created_at) VALUES (?,?,?,?,0,1,?)',id,eventId,name,capacity,new Date().toISOString());return json({id},201);
 }
 if(p==='/api/admin/tickets/lots'&&m==='POST'){
  const d=await data(request),name=str(d.name,100),capacity=number(d.capacity,0,100000),price=number(d.price_cents,0,100000000),sectorId=str(d.sector_id,36);
  if(!await one(env,'SELECT id FROM ticket_sectors WHERE id=?',sectorId))throw fail(404,'Setor não encontrado.');
  const id=crypto.randomUUID();await run(env,'INSERT INTO ticket_lots (id,sector_id,name,capacity,price_cents,active,version,created_at) VALUES (?,?,?,?,?,0,1,?)',id,sectorId,name,capacity,price,new Date().toISOString());return json({id},201);
 }
 const edit=p.match(/^\/api\/admin\/tickets\/(sectors|lots)\/([0-9a-f-]{36})$/);
 if(edit&&m==='PUT'){
  const d=await data(request),name=str(d.name,100),capacity=number(d.capacity,0,100000),version=number(d.version,1,100000000);if(typeof d.active!=='boolean')throw fail(400,'Status inválido.');let r;
  if(edit[1]==='sectors')r=await run(env,"UPDATE ticket_sectors SET name=?,capacity=?,active=?,version=version+1 WHERE id=? AND version=? AND ? >= (SELECT COUNT(*) FROM ticket_orders o JOIN ticket_lots l ON l.id=o.lot_id WHERE l.sector_id=ticket_sectors.id AND o.status!='cancelled')",name,capacity,Number(d.active),edit[2],version,capacity);
  else r=await run(env,"UPDATE ticket_lots SET name=?,capacity=?,price_cents=?,active=?,version=version+1 WHERE id=? AND version=? AND ? >= (SELECT COUNT(*) FROM ticket_orders o WHERE o.lot_id=ticket_lots.id AND o.status!='cancelled')",name,capacity,number(d.price_cents,0,100000000),Number(d.active),edit[2],version,capacity);
  if(!r.meta.changes)throw fail(409,'Não foi possível salvar: a quantidade não pode ser menor que as reservas, ou houve uma alteração em outra aba. Atualize os dados antes de tentar novamente.');return json({ok:true});
 }
 const order=p.match(/^\/api\/admin\/tickets\/orders\/([0-9a-f-]{36})$/);
 if(order){const o=await one(env,'SELECT * FROM ticket_orders WHERE id=?',order[1]);if(!o)throw fail(404,'Pedido não encontrado.');if(m==='GET'){const {request_key,...safe}=o;return json({order:safe});}if(m==='PUT'){const d=await data(request);if(!['pending','designed','cancelled'].includes(d.status))throw fail(400,'Status inválido.');const r=await run(env,"UPDATE ticket_orders SET status=? WHERE id=? AND status!='cancelled'",d.status,o.id);if(!r.meta.changes)throw fail(409,'Um pedido cancelado não pode ser reativado.');return json({ok:true});}}
 throw fail(404,'Conteúdo não encontrado.');
}
