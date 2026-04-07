import { useState, useReducer } from "react";

const fmt = n => new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(n||0);
const fmtS = n => { const a=Math.abs(n); if(a>=1e9)return"Rp "+(n/1e9).toFixed(1)+" M"; if(a>=1e6)return"Rp "+(n/1e6).toFixed(1)+" jt"; if(a>=1e3)return"Rp "+(n/1e3).toFixed(0)+" rb"; return fmt(n); };
const fmtIdr = r => { const n=r.replace(/\D/g,""); return n?new Intl.NumberFormat("id-ID").format(parseInt(n,10)):""; };
const parseIdr = s => parseInt((s||"").replace(/\D/g,"")||"0",10);
const todayStr = () => new Date().toISOString().slice(0,10);
const fmtDate = iso => { if(!iso)return"-"; const[y,m,d]=iso.split("-"); return`${d}/${m}/${y}`; };

const BANKS = [
  {code:"BCA",name:"Bank Central Asia (BCA)",color:"#003D82",bg:"#E8F0FE"},
  {code:"Mandiri",name:"Bank Mandiri",color:"#003087",bg:"#FFF3E0"},
  {code:"BRI",name:"Bank Rakyat Indonesia",color:"#003B8E",bg:"#E3F2FD"},
  {code:"BNI",name:"Bank Negara Indonesia",color:"#F16522",bg:"#FFF3E0"},
  {code:"CIMB",name:"CIMB Niaga",color:"#C8102E",bg:"#FFEBEE"},
  {code:"BTN",name:"Bank Tabungan Negara",color:"#006937",bg:"#E8F5E9"},
  {code:"BSI",name:"Bank Syariah Indonesia",color:"#00873B",bg:"#E8F5E9"},
  {code:"Danamon",name:"Bank Danamon",color:"#E21836",bg:"#FFEBEE"},
  {code:"Permata",name:"Bank Permata",color:"#004B87",bg:"#E3F2FD"},
  {code:"Maybank",name:"Maybank Indonesia",color:"#8B6914",bg:"#FFFDE7"},
  {code:"OCBC",name:"OCBC NISP",color:"#C8102E",bg:"#FFEBEE"},
  {code:"BTPN",name:"Bank BTPN / Jenius",color:"#5E2D91",bg:"#F3E5F5"},
  {code:"Jago",name:"Bank Jago",color:"#00C853",bg:"#E8F5E9"},
  {code:"Seabank",name:"SeaBank Indonesia",color:"#EE4D2D",bg:"#FFEBEE"},
  {code:"BCA Digital",name:"BCA Digital (blu)",color:"#007AFF",bg:"#E3F0FF"},
  {code:"Allo",name:"Allo Bank",color:"#00AEEF",bg:"#E3F9FF"},
  {code:"Muamalat",name:"Bank Muamalat",color:"#009262",bg:"#E8F5E9"},
  {code:"Mega",name:"Bank Mega",color:"#C8102E",bg:"#FFEBEE"},
  {code:"BJB",name:"Bank BJB",color:"#0063A3",bg:"#E3F2FD"},
  {code:"GoPay",name:"GoPay",color:"#00AED6",bg:"#E3F9FF"},
  {code:"OVO",name:"OVO",color:"#4C3494",bg:"#EDE7F6"},
  {code:"Dana",name:"DANA",color:"#118EEA",bg:"#E3F0FF"},
  {code:"LinkAja",name:"LinkAja",color:"#E82529",bg:"#FFEBEE"},
  {code:"ShopeePay",name:"ShopeePay",color:"#EE4D2D",bg:"#FFEBEE"},
  {code:"Tunai",name:"Uang Tunai",color:"#2E7D32",bg:"#E8F5E9"},
];

const ASET_CAT = ["Properti","Tanah","Kendaraan","Giro","Investasi","Emas / Perhiasan","Elektronik","Saham","Reksa Dana","Kripto","Lainnya"];

const C = {
  indigo:{bg:"#4F46E5",light:"#EEF2FF",text:"#4338CA",border:"#C7D2FE"},
  teal:  {bg:"#0D9488",light:"#CCFBF1",text:"#0F766E",border:"#99F6E4"},
  red:   {bg:"#DC2626",light:"#FEE2E2",text:"#B91C1C",border:"#FCA5A5"},
  amber: {bg:"#D97706",light:"#FEF3C7",text:"#B45309",border:"#FDE68A"},
  green: {bg:"#16A34A",light:"#DCFCE7",text:"#15803D",border:"#86EFAC"},
};

const USERS = [{username:"febynudya",password:"febynudya",name:"Feby Nudya"}];

function initData() {
  return {uang:[],aset:[],hutang:[],piutang:[],cicilan:[]};
}

function reducer(state, action) {
  switch(action.type) {
    case "ADD":   return {...state,[action.cat]:[{...action.item,id:Date.now()},...state[action.cat]]};
    case "DEL":   return {...state,[action.cat]:state[action.cat].filter(x=>x.id!==action.id)};
    case "EDIT":  return {...state,[action.cat]:state[action.cat].map(x=>x.id===action.id?{...x,...action.item}:x)};
    case "LUNAS": return {...state,[action.cat]:state[action.cat].map(x=>x.id===action.id?{...x,lunas:!x.lunas}:x)};
    case "ADD_BAYAR": return {...state,cicilan:state.cicilan.map(c=>c.id===action.id?{...c,riwayat:[...(c.riwayat||[]),action.bayar],dibayar:Math.min((c.dibayar||0)+action.bayar.jumlah,c.total_cicilan)}:c)};
    default: return state;
  }
}

function getIcon(nama="",jenis="",ket="") {
  const t=(nama+" "+jenis+" "+ket).toLowerCase();
  if(t.match(/gopay|ovo|dana|linkaja|shopeepay/))  return {e:"📱",bg:"#EDE9FE",c:"#6D28D9"};
  if(t.match(/bca|mandiri|bni|bri|btn|bsi|bank/))  return {e:"🏦",bg:"#EEF2FF",c:"#4338CA"};
  if(t.match(/tunai|cash/))                         return {e:"💵",bg:"#DCFCE7",c:"#15803D"};
  if(t.match(/rumah|kpr|properti|apartemen/))        return {e:"🏠",bg:"#EFF6FF",c:"#1D4ED8"};
  if(t.match(/tanah|kavling|lahan/))                 return {e:"🌿",bg:"#ECFDF5",c:"#065F46"};
  if(t.match(/motor|mobil|kendaraan|vario|beat/))    return {e:"🚗",bg:"#FFF7ED",c:"#C2410C"};
  if(t.match(/emas|logam|perhiasan|cincin|gelang/))  return {e:"💍",bg:"#FEF9C3",c:"#A16207"};
  if(t.match(/laptop|macbook|komputer|pc/))          return {e:"💻",bg:"#F5F3FF",c:"#6D28D9"};
  if(t.match(/hp|iphone|samsung|xiaomi|android/))   return {e:"📱",bg:"#EDE9FE",c:"#6D28D9"};
  if(t.match(/saham|stock/))                         return {e:"📈",bg:"#ECFDF5",c:"#065F46"};
  if(t.match(/reksa|reksadana|mutual/))              return {e:"📊",bg:"#EFF6FF",c:"#1D4ED8"};
  if(t.match(/kripto|bitcoin|ethereum/))             return {e:"₿",bg:"#FEF9C3",c:"#A16207"};
  if(t.match(/giro/))                                return {e:"🏦",bg:"#F0FDF4",c:"#15803D"};
  if(t.match(/tv|kulkas|ac|elektronik/))             return {e:"🖥️",bg:"#F0F9FF",c:"#0369A1"};
  if(t.match(/usaha|bisnis|modal/))                  return {e:"💼",bg:"#EFF6FF",c:"#1D4ED8"};
  if(t.match(/kos|kontrakan|sewa/))                  return {e:"🏡",bg:"#FEF9C3",c:"#A16207"};
  return {e:"💰",bg:"#F9FAFB",c:"#374151"};
}

function AutoAvatar({nama="",jenis="",ket="",size=42}) {
  const {e,bg} = getIcon(nama,jenis,ket);
  return (
    <div style={{width:size,height:size,borderRadius:Math.round(size*0.28),background:bg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:Math.round(size*0.48)}}>
      {e}
    </div>
  );
}

function BankLogo({code,size=36}) {
  const b = BANKS.find(x=>x.code===code)||{code:"?",color:"#6B7280",bg:"#F3F4F6"};
  return (
    <div style={{width:size,height:size,borderRadius:Math.round(size*0.28),background:b.bg,border:`1px solid ${b.color}33`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
      <span style={{fontSize:Math.round(size*0.28),fontWeight:800,color:b.color,letterSpacing:-0.5}}>{b.code.slice(0,3).toUpperCase()}</span>
    </div>
  );
}

function ProgressBar({pct,color,h=7}) {
  return (
    <div style={{height:h,background:"#E5E7EB",borderRadius:99,overflow:"hidden"}}>
      <div style={{width:`${Math.min(pct,100)}%`,height:"100%",background:color,borderRadius:99,transition:"width .4s"}} />
    </div>
  );
}

function Drawer({visible,onClose,title,children}) {
  if(!visible) return null;
  return (
    <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"flex-end",zIndex:300,borderRadius:36}}>
      <div style={{background:"#fff",borderRadius:"22px 22px 0 0",padding:"18px 18px 26px",width:"100%",maxHeight:"88%",overflowY:"auto",boxSizing:"border-box"}}>
        <div style={{width:40,height:4,background:"#D1D5DB",borderRadius:99,margin:"0 auto 14px"}} />
        {title && <div style={{fontSize:15,fontWeight:700,color:"#111827",marginBottom:14}}>{title}</div>}
        {children}
      </div>
    </div>
  );
}

function IdrInput({label,value,onChange,required=true}) {
  return (
    <div style={{marginBottom:11}}>
      <div style={{fontSize:12,color:"#6B7280",marginBottom:3,fontWeight:600}}>{label}{required?" *":""}</div>
      <div style={{position:"relative"}}>
        <div style={{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",fontSize:12,fontWeight:700,color:C.indigo.text,pointerEvents:"none"}}>Rp</div>
        <input inputMode="numeric" placeholder="0" value={value} onChange={e=>onChange(fmtIdr(e.target.value))}
          style={{width:"100%",boxSizing:"border-box",padding:"10px 12px 10px 34px",fontSize:14,borderRadius:10,border:`1.5px solid ${C.indigo.border}`,background:"#EEF2FF",color:"#111827",fontWeight:600,outline:"none"}} />
      </div>
      {value && <div style={{fontSize:11,color:C.indigo.text,marginTop:2,marginLeft:2}}>{fmt(parseIdr(value))}</div>}
    </div>
  );
}

function TxtF({label,value,onChange,placeholder="",required=true,type="text"}) {
  return (
    <div style={{marginBottom:11}}>
      <div style={{fontSize:12,color:"#6B7280",marginBottom:3,fontWeight:600}}>{label}{required?" *":""}</div>
      <input type={type} placeholder={placeholder} value={value} onChange={e=>onChange(e.target.value)}
        style={{width:"100%",boxSizing:"border-box",padding:"10px 12px",fontSize:14,borderRadius:10,border:"1.5px solid #E5E7EB",background:"#F9FAFB",color:"#111827",outline:"none"}} />
    </div>
  );
}

function SelectF({label,value,onChange,options,required=true}) {
  return (
    <div style={{marginBottom:11}}>
      <div style={{fontSize:12,color:"#6B7280",marginBottom:3,fontWeight:600}}>{label}{required?" *":""}</div>
      <select value={value} onChange={e=>onChange(e.target.value)}
        style={{width:"100%",boxSizing:"border-box",padding:"10px 12px",fontSize:14,borderRadius:10,border:"1.5px solid #E5E7EB",background:"#F9FAFB",color:value?"#111827":"#9CA3AF",outline:"none"}}>
        <option value="">Pilih...</option>
        {options.map(o=><option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function BankSelect({value,onChange}) {
  const [q,setQ] = useState("");
  const [open,setOpen] = useState(false);
  const sel = BANKS.find(b=>b.code===value);
  const filtered = BANKS.filter(b=>b.name.toLowerCase().includes(q.toLowerCase())||b.code.toLowerCase().includes(q.toLowerCase()));
  return (
    <div style={{marginBottom:11}}>
      <div style={{fontSize:12,color:"#6B7280",marginBottom:3,fontWeight:600}}>Bank / Dompet Digital</div>
      <div style={{position:"relative"}}>
        <button type="button" onClick={()=>setOpen(p=>!p)}
          style={{width:"100%",padding:"10px 12px",borderRadius:10,border:"1.5px solid #E5E7EB",background:"#F9FAFB",textAlign:"left",cursor:"pointer",display:"flex",alignItems:"center",gap:10,boxSizing:"border-box"}}>
          {sel
            ? <><BankLogo code={sel.code} size={28}/><span style={{fontSize:13,color:"#111827",fontWeight:600}}>{sel.name}</span></>
            : <span style={{fontSize:14,color:"#9CA3AF"}}>Pilih bank...</span>
          }
          <span style={{marginLeft:"auto",color:"#9CA3AF"}}>▾</span>
        </button>
        {open && (
          <div style={{position:"absolute",top:"calc(100% + 4px)",left:0,right:0,background:"#fff",borderRadius:12,border:"1.5px solid #E5E7EB",zIndex:500,boxShadow:"0 8px 24px rgba(0,0,0,.15)",overflow:"hidden"}}>
            <div style={{padding:"8px 10px",borderBottom:"1px solid #F3F4F6"}}>
              <input placeholder="Cari bank..." value={q} onChange={e=>setQ(e.target.value)}
                style={{width:"100%",boxSizing:"border-box",padding:"7px 10px",borderRadius:8,border:"1px solid #E5E7EB",fontSize:13,outline:"none"}} />
            </div>
            <div style={{overflowY:"auto",maxHeight:150}}>
              {filtered.map(b=>(
                <button key={b.code} type="button" onClick={()=>{onChange(b.code);setOpen(false);setQ("");}}
                  style={{width:"100%",padding:"8px 12px",border:"none",background:value===b.code?b.bg:"#fff",textAlign:"left",cursor:"pointer",display:"flex",alignItems:"center",gap:10,borderBottom:"1px solid #F9FAFB"}}>
                  <BankLogo code={b.code} size={26}/>
                  <span style={{fontSize:13,color:"#111827"}}>{b.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function BtnRow({onCancel,onSave,color,label="Simpan"}) {
  return (
    <div style={{display:"flex",gap:10,marginTop:14}}>
      <button onClick={onCancel} style={{flex:1,padding:11,borderRadius:12,border:"none",background:"#F3F4F6",fontWeight:700,fontSize:14,cursor:"pointer",color:"#374151"}}>Batal</button>
      <button onClick={onSave}   style={{flex:2,padding:11,borderRadius:12,border:"none",background:color,color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer"}}>{label}</button>
    </div>
  );
}

function EditDelBtns({onEdit,onDel,editBg,editColor}) {
  return (
    <div style={{display:"flex",gap:6,flexShrink:0}}>
      <button onClick={onEdit} style={{background:editBg,border:"none",borderRadius:8,width:30,height:30,cursor:"pointer",color:editColor,fontSize:14}}>✎</button>
      <button onClick={onDel}  style={{background:"#FEE2E2",border:"none",borderRadius:8,width:30,height:30,cursor:"pointer",color:"#DC2626",fontSize:14}}>✕</button>
    </div>
  );
}

// ── LOGIN ──────────────────────────────────────────────────────────────────────
function LoginScreen({onLogin}) {
  const [u,setU] = useState("");
  const [p,setP] = useState("");
  const [show,setShow] = useState(false);
  const [err,setErr] = useState("");
  const [loading,setLoading] = useState(false);

  const login = () => {
    setErr("");
    if(!u||!p){setErr("Username dan password wajib diisi.");return;}
    setLoading(true);
    setTimeout(()=>{
      const usr = USERS.find(x=>x.username===u&&x.password===p);
      if(usr) onLogin(usr);
      else { setErr("Username atau password salah."); setLoading(false); }
    },700);
  };

  const guestLogin = () => {
    const name = (navigator?.userAgentData?.platform||navigator.platform||"Perangkat");
    onLogin({username:"guest",name,avatar:name.slice(0,2).toUpperCase(),isGuest:true});
  };

  const bioLogin = () => {
    const name = (navigator?.userAgentData?.platform||navigator.platform||"Perangkat");
    onLogin({username:"bio",name,avatar:name.slice(0,2).toUpperCase(),isBio:true});
  };

  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",background:"#fff",overflowY:"auto"}}>
      <div style={{background:"linear-gradient(160deg,#4F46E5 0%,#7C3AED 100%)",padding:"44px 28px 36px",textAlign:"center"}}>
        <div style={{width:68,height:68,borderRadius:22,background:"rgba(255,255,255,.18)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px"}}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" fill="white" opacity=".92"/>
            <path d="M12 6v12M9 9.5h4a1.5 1.5 0 010 3H9m0 0h4.5a1.5 1.5 0 010 3H9" stroke="#4F46E5" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </div>
        <div style={{fontSize:24,fontWeight:800,color:"#fff",letterSpacing:-.5}}>FR Finance</div>
        <div style={{fontSize:13,color:"rgba(255,255,255,.7)",marginTop:4}}>Kelola Keuangan Lebih Cerdas</div>
      </div>

      <div style={{padding:"26px 22px",flex:1}}>
        <div style={{fontSize:17,fontWeight:800,color:"#111827",marginBottom:4}}>Masuk ke akun</div>
        <div style={{fontSize:13,color:"#6B7280",marginBottom:20}}>Masukkan kredensial Anda</div>
        <TxtF label="Username" value={u} onChange={v=>{setU(v);setErr("");}} placeholder="Username"/>
        <div style={{marginBottom:18}}>
          <div style={{fontSize:12,color:"#6B7280",marginBottom:3,fontWeight:600}}>Password *</div>
          <div style={{position:"relative"}}>
            <input type={show?"text":"password"} placeholder="Password" value={p}
              onChange={e=>{setP(e.target.value);setErr("");}} onKeyDown={e=>e.key==="Enter"&&login()}
              style={{width:"100%",boxSizing:"border-box",padding:"10px 72px 10px 12px",fontSize:14,borderRadius:10,border:"1.5px solid #E5E7EB",background:"#F9FAFB",color:"#111827",outline:"none"}}/>
            <button onClick={()=>setShow(x=>!x)} style={{position:"absolute",right:10,top:9,background:"none",border:"none",fontSize:12,color:"#6B7280",cursor:"pointer"}}>
              {show?"Sembunyikan":"Lihat"}
            </button>
          </div>
        </div>
        {err && <div style={{background:"#FEF2F2",border:"1px solid #FCA5A5",borderRadius:10,padding:"9px 12px",fontSize:13,color:"#B91C1C",marginBottom:12}}>{err}</div>}
        <button onClick={login} disabled={loading}
          style={{width:"100%",padding:13,borderRadius:14,border:"none",background:loading?"#A5B4FC":"#4F46E5",color:"#fff",fontWeight:700,fontSize:15,cursor:"pointer"}}>
          {loading?"Memverifikasi...":"Masuk"}
        </button>
        <div style={{display:"flex",alignItems:"center",gap:10,margin:"16px 0"}}>
          <div style={{flex:1,height:1,background:"#E5E7EB"}}/>
          <span style={{fontSize:12,color:"#9CA3AF"}}>atau</span>
          <div style={{flex:1,height:1,background:"#E5E7EB"}}/>
        </div>
        <div style={{display:"flex",gap:10}}>
          <button onClick={bioLogin} style={{flex:1,padding:12,borderRadius:14,border:"1.5px solid #E5E7EB",background:"#F9FAFB",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:7}}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="1.8" strokeLinecap="round">
              <path d="M12 10a2 2 0 00-2 2c0 1.1.9 2 2 2a2 2 0 002-2c0-1.1-.9-2-2-2zm0-6C7 4 3 7.6 3 12c0 2 .7 3.8 1.8 5.2M21 12c0-5-4-9-9-9M8 19.5A8.9 8.9 0 0012 21c4.97 0 9-4 9-9"/>
            </svg>
            <span style={{fontSize:13,color:"#4F46E5",fontWeight:700}}>Sidik Jari</span>
          </button>
          <button onClick={guestLogin} style={{flex:1,padding:12,borderRadius:14,border:"1.5px dashed #D1D5DB",background:"#F9FAFB",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:7}}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
            <span style={{fontSize:13,color:"#6B7280",fontWeight:700}}>Tamu</span>
          </button>
        </div>
        <div style={{fontSize:11,color:"#9CA3AF",textAlign:"center",marginTop:8}}>Sidik jari & tamu: nama otomatis dari perangkat Anda</div>
      </div>
    </div>
  );
}

// ── DASHBOARD ──────────────────────────────────────────────────────────────────
function TabDashboard({data,user,onLogout}) {
  const tU = data.uang.reduce((a,x)=>a+x.jumlah,0);
  const tA = data.aset.reduce((a,x)=>a+x.nilai,0);
  const tH = data.hutang.filter(x=>!x.lunas).reduce((a,x)=>a+x.jumlah,0);
  const tP = data.piutang.filter(x=>!x.lunas).reduce((a,x)=>a+x.jumlah,0);
  const sC = data.cicilan.reduce((a,x)=>a+(x.total_cicilan-x.dibayar),0);
  const bersih = tU+tA+tP-tH-sC;
  const now = new Date().toLocaleDateString("id-ID",{weekday:"long",day:"numeric",month:"long"});

  return (
    <div style={{overflowY:"auto",flex:1,background:"#F8F7FF"}}>
      <div style={{background:"linear-gradient(135deg,#4F46E5 0%,#7C3AED 100%)",padding:"16px 20px 20px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
          <div>
            <div style={{fontSize:11,color:"rgba(255,255,255,.65)"}}>{now}</div>
            <div style={{fontSize:14,fontWeight:700,color:"#fff",marginTop:2}}>Halo, {user.name.split(" ")[0]} 👋</div>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            {(user.isGuest||user.isBio) && (
              <div style={{background:"rgba(255,255,255,.18)",borderRadius:10,padding:"5px 10px"}}>
                <span style={{fontSize:10,color:"#fff",fontWeight:700}}>{user.isBio?"Biometrik":"Mode Tamu"}</span>
              </div>
            )}
            <button onClick={onLogout} style={{background:"rgba(255,255,255,.15)",border:"none",borderRadius:10,padding:"6px 12px",color:"#fff",fontSize:12,fontWeight:600,cursor:"pointer"}}>Keluar</button>
          </div>
        </div>
        <div style={{fontSize:12,color:"rgba(255,255,255,.65)",marginBottom:4}}>Kekayaan Bersih</div>
        <div style={{fontSize:28,fontWeight:800,color:"#fff",letterSpacing:-.5}}>{fmt(bersih)}</div>
        <div style={{display:"flex",gap:16,marginTop:14,paddingTop:12,borderTop:"1px solid rgba(255,255,255,.18)"}}>
          {[{l:"Uang & Aset",v:tU+tA},{l:"Piutang",v:tP},{l:"Kewajiban",v:tH+sC}].map(m=>(
            <div key={m.l}>
              <div style={{fontSize:11,color:"rgba(255,255,255,.6)"}}>{m.l}</div>
              <div style={{fontSize:12,fontWeight:700,color:"#fff"}}>{fmtS(m.v)}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{padding:"14px 16px"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
          {[{l:"Uang & Bank",v:tU,c:C.indigo},{l:"Total Aset",v:tA,c:C.teal},{l:"Piutang",v:tP,c:C.green},{l:"Kewajiban",v:tH+sC,c:C.red}].map(m=>(
            <div key={m.l} style={{background:"#fff",borderRadius:14,border:"1px solid #F3F4F6",padding:"12px 14px"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                <span style={{fontSize:11,color:"#6B7280"}}>{m.l}</span>
                <span style={{width:8,height:8,borderRadius:99,background:m.c.bg,display:"block"}}/>
              </div>
              <div style={{fontSize:14,fontWeight:800,color:m.c.text}}>{fmtS(m.v)}</div>
            </div>
          ))}
        </div>

        {data.cicilan.length > 0 && (
          <div style={{background:"#fff",borderRadius:16,border:"1px solid #F3F4F6",padding:"14px 16px",marginBottom:12}}>
            <div style={{fontSize:13,fontWeight:700,color:"#111827",marginBottom:12}}>Cicilan Aktif</div>
            {data.cicilan.map(c=>{
              const pct = Math.round((c.dibayar/c.total_cicilan)*100);
              return (
                <div key={c.id} style={{marginBottom:12}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                    <span style={{fontSize:13,fontWeight:600,color:"#111827"}}>{c.nama}</span>
                    <span style={{fontSize:12,fontWeight:700,color:C.amber.text}}>{pct}%</span>
                  </div>
                  <ProgressBar pct={pct} color={C.amber.bg}/>
                  <div style={{display:"flex",justifyContent:"space-between",marginTop:3}}>
                    <span style={{fontSize:11,color:"#9CA3AF"}}>{fmt(c.dibayar)} lunas</span>
                    <span style={{fontSize:11,color:C.red.text}}>Sisa {fmtS(c.total_cicilan-c.dibayar)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {data.uang.length > 0 && (
          <div style={{background:"#fff",borderRadius:16,border:"1px solid #F3F4F6",padding:"14px 16px"}}>
            <div style={{fontSize:13,fontWeight:700,color:"#111827",marginBottom:10}}>Rekening & Dompet</div>
            {data.uang.slice(0,4).map(u=>(
              <div key={u.id} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 0",borderBottom:"1px solid #F9FAFB"}}>
                {u.bank ? <BankLogo code={u.bank} size={32}/> : <AutoAvatar nama={u.nama} size={32}/>}
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:600,color:"#111827"}}>{u.nama}</div>
                  {u.bank && <div style={{fontSize:11,color:"#9CA3AF"}}>{BANKS.find(b=>b.code===u.bank)?.name}</div>}
                </div>
                <div style={{fontSize:13,fontWeight:800,color:C.indigo.text}}>{fmtS(u.jumlah)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── TAB UANG ───────────────────────────────────────────────────────────────────
function TabUang({data,dispatch}) {
  const [open,setOpen] = useState(false);
  const [edit,setEdit] = useState(null);
  const [f,setF] = useState({nama:"",bank:"",jumlah:"",noRek:"",keterangan:""});
  const sf = (k,v) => setF(p=>({...p,[k]:v}));

  const openAdd = () => { setF({nama:"",bank:"",jumlah:"",noRek:"",keterangan:""}); setEdit(null); setOpen(true); };
  const openEdit = item => { setF({nama:item.nama,bank:item.bank||"",jumlah:fmtIdr(String(item.jumlah)),noRek:item.noRek||"",keterangan:item.keterangan||""}); setEdit(item); setOpen(true); };
  const save = () => {
    if(!f.nama||!f.jumlah) return;
    const item = {nama:f.nama,bank:f.bank,jumlah:parseIdr(f.jumlah),noRek:f.noRek,keterangan:f.keterangan};
    if(edit) dispatch({type:"EDIT",cat:"uang",id:edit.id,item});
    else dispatch({type:"ADD",cat:"uang",item});
    setOpen(false);
  };

  const total = data.reduce((a,x)=>a+x.jumlah,0);
  return (
    <div style={{display:"flex",flexDirection:"column",flex:1,overflow:"hidden",background:"#F8F7FF"}}>
      <div style={{padding:"14px 16px 10px",display:"flex",justifyContent:"space-between",alignItems:"center",background:"#fff",borderBottom:"1px solid #F3F4F6"}}>
        <div><div style={{fontSize:16,fontWeight:800,color:"#111827"}}>Uang & Rekening</div><div style={{fontSize:12,color:"#6B7280"}}>Total: {fmt(total)}</div></div>
        <button onClick={openAdd} style={{background:C.indigo.bg,border:"none",borderRadius:10,padding:"7px 14px",color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer"}}>+ Tambah</button>
      </div>
      <div style={{overflowY:"auto",flex:1,padding:"12px 16px 80px"}}>
        {data.length===0 && <div style={{textAlign:"center",color:"#9CA3AF",marginTop:40,fontSize:14}}>Belum ada data.</div>}
        {data.map(item=>{
          const bank = BANKS.find(b=>b.code===item.bank);
          return (
            <div key={item.id} style={{background:"#fff",borderRadius:14,border:"1px solid #F3F4F6",padding:"12px 14px",marginBottom:10}}>
              <div style={{display:"flex",gap:12,alignItems:"center"}}>
                {item.bank ? <BankLogo code={item.bank} size={42}/> : <AutoAvatar nama={item.nama} ket={item.keterangan} size={42}/>}
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:700,color:"#111827"}}>{item.nama}</div>
                  {bank && <div style={{fontSize:12,color:"#6B7280"}}>{bank.name}</div>}
                  {item.noRek && <div style={{fontSize:11,color:"#9CA3AF"}}>No. Rek: {item.noRek}</div>}
                  <div style={{fontSize:16,fontWeight:800,color:C.indigo.text,marginTop:2}}>{fmt(item.jumlah)}</div>
                </div>
                <EditDelBtns onEdit={()=>openEdit(item)} onDel={()=>dispatch({type:"DEL",cat:"uang",id:item.id})} editBg={C.indigo.light} editColor={C.indigo.text}/>
              </div>
            </div>
          );
        })}
      </div>
      <Drawer visible={open} onClose={()=>setOpen(false)} title={edit?"Edit Rekening":"Tambah Uang / Rekening"}>
        <TxtF label="Nama Rekening" value={f.nama} onChange={v=>sf("nama",v)} placeholder="Tabungan BCA / Tunai"/>
        <BankSelect value={f.bank} onChange={v=>sf("bank",v)}/>
        <IdrInput label="Saldo / Jumlah" value={f.jumlah} onChange={v=>sf("jumlah",v)}/>
        <TxtF label="No. Rekening" value={f.noRek} onChange={v=>sf("noRek",v)} placeholder="1234567890" required={false}/>
        <TxtF label="Keterangan" value={f.keterangan} onChange={v=>sf("keterangan",v)} placeholder="Rekening utama" required={false}/>
        <BtnRow onCancel={()=>setOpen(false)} onSave={save} color={C.indigo.bg}/>
      </Drawer>
    </div>
  );
}

// ── TAB ASET ───────────────────────────────────────────────────────────────────
function TabAset({data,dispatch}) {
  const [open,setOpen] = useState(false);
  const [edit,setEdit] = useState(null);
  const [f,setF] = useState({nama:"",jenis:"",nilai:"",lokasi:"",keterangan:""});
  const sf = (k,v) => setF(p=>({...p,[k]:v}));

  const openAdd = () => { setF({nama:"",jenis:"",nilai:"",lokasi:"",keterangan:""}); setEdit(null); setOpen(true); };
  const openEdit = item => { setF({nama:item.nama,jenis:item.jenis||"",nilai:fmtIdr(String(item.nilai)),lokasi:item.lokasi||"",keterangan:item.keterangan||""}); setEdit(item); setOpen(true); };
  const save = () => {
    if(!f.nama||!f.nilai) return;
    const item = {nama:f.nama,jenis:f.jenis,nilai:parseIdr(f.nilai),lokasi:f.lokasi,keterangan:f.keterangan};
    if(edit) dispatch({type:"EDIT",cat:"aset",id:edit.id,item});
    else dispatch({type:"ADD",cat:"aset",item});
    setOpen(false);
  };

  const total = data.reduce((a,x)=>a+x.nilai,0);
  return (
    <div style={{display:"flex",flexDirection:"column",flex:1,overflow:"hidden",background:"#F8F7FF"}}>
      <div style={{padding:"14px 16px 10px",display:"flex",justifyContent:"space-between",alignItems:"center",background:"#fff",borderBottom:"1px solid #F3F4F6"}}>
        <div><div style={{fontSize:16,fontWeight:800,color:"#111827"}}>Aset</div><div style={{fontSize:12,color:"#6B7280"}}>Total: {fmt(total)}</div></div>
        <button onClick={openAdd} style={{background:C.teal.bg,border:"none",borderRadius:10,padding:"7px 14px",color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer"}}>+ Tambah</button>
      </div>
      <div style={{overflowY:"auto",flex:1,padding:"12px 16px 80px"}}>
        {data.length===0 && <div style={{textAlign:"center",color:"#9CA3AF",marginTop:40,fontSize:14}}>Belum ada data.</div>}
        {data.map(item=>(
          <div key={item.id} style={{background:"#fff",borderRadius:14,border:"1px solid #F3F4F6",padding:"12px 14px",marginBottom:10}}>
            <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
              <AutoAvatar nama={item.nama} jenis={item.jenis} ket={item.keterangan} size={44}/>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:700,color:"#111827"}}>{item.nama}</div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:2}}>
                  {item.jenis && <span style={{fontSize:11,background:C.teal.light,color:C.teal.text,borderRadius:6,padding:"2px 8px",fontWeight:600}}>{item.jenis}</span>}
                  {item.lokasi && <span style={{fontSize:11,color:"#9CA3AF"}}>📍 {item.lokasi}</span>}
                </div>
                {item.keterangan && <div style={{fontSize:12,color:"#6B7280",marginTop:2}}>{item.keterangan}</div>}
                <div style={{fontSize:16,fontWeight:800,color:C.teal.text,marginTop:4}}>{fmt(item.nilai)}</div>
              </div>
              <EditDelBtns onEdit={()=>openEdit(item)} onDel={()=>dispatch({type:"DEL",cat:"aset",id:item.id})} editBg={C.teal.light} editColor={C.teal.text}/>
            </div>
          </div>
        ))}
      </div>
      <Drawer visible={open} onClose={()=>setOpen(false)} title={edit?"Edit Aset":"Tambah Aset"}>
        <TxtF label="Nama Aset" value={f.nama} onChange={v=>sf("nama",v)} placeholder="Rumah, Motor, Emas..."/>
        <SelectF label="Kategori" value={f.jenis} onChange={v=>sf("jenis",v)} options={ASET_CAT}/>
        <IdrInput label="Nilai Estimasi" value={f.nilai} onChange={v=>sf("nilai",v)}/>
        <TxtF label="Lokasi / No. Polisi" value={f.lokasi} onChange={v=>sf("lokasi",v)} placeholder="Jakarta / B 1234 XX" required={false}/>
        <TxtF label="Keterangan" value={f.keterangan} onChange={v=>sf("keterangan",v)} placeholder="Tahun, kondisi, dll" required={false}/>
        <BtnRow onCancel={()=>setOpen(false)} onSave={save} color={C.teal.bg}/>
      </Drawer>
    </div>
  );
}

// ── TAB HUTANG ─────────────────────────────────────────────────────────────────
function TabHutang({data,dispatch}) {
  const [open,setOpen] = useState(false);
  const [edit,setEdit] = useState(null);
  const [f,setF] = useState({nama:"",jumlah:"",jatuh_tempo:"",keterangan:""});
  const sf = (k,v) => setF(p=>({...p,[k]:v}));

  const openAdd = () => { setF({nama:"",jumlah:"",jatuh_tempo:"",keterangan:""}); setEdit(null); setOpen(true); };
  const openEdit = item => { setF({nama:item.nama,jumlah:fmtIdr(String(item.jumlah)),jatuh_tempo:item.jatuh_tempo||"",keterangan:item.keterangan||""}); setEdit(item); setOpen(true); };
  const save = () => {
    if(!f.nama||!f.jumlah) return;
    const item = {nama:f.nama,jumlah:parseIdr(f.jumlah),jatuh_tempo:f.jatuh_tempo,keterangan:f.keterangan,lunas:edit?edit.lunas:false};
    if(edit) dispatch({type:"EDIT",cat:"hutang",id:edit.id,item});
    else dispatch({type:"ADD",cat:"hutang",item});
    setOpen(false);
  };

  const aktif = data.filter(x=>!x.lunas);
  const lunas  = data.filter(x=>x.lunas);
  return (
    <div style={{display:"flex",flexDirection:"column",flex:1,overflow:"hidden",background:"#F8F7FF"}}>
      <div style={{padding:"14px 16px 10px",display:"flex",justifyContent:"space-between",alignItems:"center",background:"#fff",borderBottom:"1px solid #F3F4F6"}}>
        <div><div style={{fontSize:16,fontWeight:800,color:"#111827"}}>Hutang</div><div style={{fontSize:12,color:"#6B7280"}}>Aktif: {fmt(aktif.reduce((a,x)=>a+x.jumlah,0))}</div></div>
        <button onClick={openAdd} style={{background:C.red.bg,border:"none",borderRadius:10,padding:"7px 14px",color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer"}}>+ Tambah</button>
      </div>
      <div style={{overflowY:"auto",flex:1,padding:"12px 16px 80px"}}>
        {data.length===0 && <div style={{textAlign:"center",color:"#9CA3AF",marginTop:40,fontSize:14}}>Belum ada data.</div>}
        {[...aktif,...lunas].map(item=>(
          <div key={item.id} style={{background:item.lunas?"#F9FAFB":"#fff",borderRadius:14,border:"1px solid #F3F4F6",padding:"12px 14px",marginBottom:10,opacity:item.lunas?.7:1}}>
            <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
              <AutoAvatar nama={item.nama} ket={item.keterangan} size={42}/>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:700,color:item.lunas?"#9CA3AF":"#111827",textDecoration:item.lunas?"line-through":"none"}}>{item.nama}</div>
                {item.jatuh_tempo && <div style={{fontSize:12,color:C.amber.text,fontWeight:600}}>Tempo: {fmtDate(item.jatuh_tempo)}</div>}
                {item.keterangan && <div style={{fontSize:12,color:"#6B7280"}}>{item.keterangan}</div>}
                <div style={{fontSize:16,fontWeight:800,color:item.lunas?"#9CA3AF":C.red.text,marginTop:2}}>{fmt(item.jumlah)}</div>
              </div>
              <div style={{display:"flex",gap:6,alignItems:"center"}}>
                {item.lunas && <span style={{fontSize:11,background:C.green.light,color:C.green.text,borderRadius:8,padding:"3px 8px",fontWeight:700}}>Lunas</span>}
                <EditDelBtns onEdit={()=>openEdit(item)} onDel={()=>dispatch({type:"DEL",cat:"hutang",id:item.id})} editBg={C.red.light} editColor={C.red.text}/>
              </div>
            </div>
            {!item.lunas && (
              <button onClick={()=>dispatch({type:"LUNAS",cat:"hutang",id:item.id})} style={{marginTop:10,width:"100%",padding:"8px 0",borderRadius:10,border:"none",background:C.red.light,color:C.red.text,fontWeight:700,fontSize:13,cursor:"pointer"}}>Tandai Lunas</button>
            )}
          </div>
        ))}
      </div>
      <Drawer visible={open} onClose={()=>setOpen(false)} title={edit?"Edit Hutang":"Tambah Hutang"}>
        <TxtF label="Nama / Ke Siapa" value={f.nama} onChange={v=>sf("nama",v)} placeholder="Bank BRI / Pak Budi"/>
        <IdrInput label="Jumlah" value={f.jumlah} onChange={v=>sf("jumlah",v)}/>
        <TxtF label="Jatuh Tempo" value={f.jatuh_tempo} onChange={v=>sf("jatuh_tempo",v)} type="date" required={false}/>
        <TxtF label="Keterangan" value={f.keterangan} onChange={v=>sf("keterangan",v)} placeholder="Opsional" required={false}/>
        <BtnRow onCancel={()=>setOpen(false)} onSave={save} color={C.red.bg}/>
      </Drawer>
    </div>
  );
}

// ── TAB PIUTANG ────────────────────────────────────────────────────────────────
function TabPiutang({data,dispatch}) {
  const [open,setOpen] = useState(false);
  const [edit,setEdit] = useState(null);
  const [f,setF] = useState({nama:"",jumlah:"",tgl_pinjam:todayStr(),jatuh_tempo:"",keterangan:""});
  const sf = (k,v) => setF(p=>({...p,[k]:v}));

  const openAdd = () => { setF({nama:"",jumlah:"",tgl_pinjam:todayStr(),jatuh_tempo:"",keterangan:""}); setEdit(null); setOpen(true); };
  const openEdit = item => { setF({nama:item.nama,jumlah:fmtIdr(String(item.jumlah)),tgl_pinjam:item.tgl_pinjam||"",jatuh_tempo:item.jatuh_tempo||"",keterangan:item.keterangan||""}); setEdit(item); setOpen(true); };
  const save = () => {
    if(!f.nama||!f.jumlah) return;
    const item = {nama:f.nama,jumlah:parseIdr(f.jumlah),tgl_pinjam:f.tgl_pinjam,jatuh_tempo:f.jatuh_tempo,keterangan:f.keterangan,lunas:edit?edit.lunas:false};
    if(edit) dispatch({type:"EDIT",cat:"piutang",id:edit.id,item});
    else dispatch({type:"ADD",cat:"piutang",item});
    setOpen(false);
  };

  const aktif = data.filter(x=>!x.lunas);
  const lunas  = data.filter(x=>x.lunas);
  return (
    <div style={{display:"flex",flexDirection:"column",flex:1,overflow:"hidden",background:"#F8F7FF"}}>
      <div style={{padding:"14px 16px 10px",display:"flex",justifyContent:"space-between",alignItems:"center",background:"#fff",borderBottom:"1px solid #F3F4F6"}}>
        <div><div style={{fontSize:16,fontWeight:800,color:"#111827"}}>Piutang</div><div style={{fontSize:12,color:"#6B7280"}}>Dipinjamkan · {fmt(aktif.reduce((a,x)=>a+x.jumlah,0))}</div></div>
        <button onClick={openAdd} style={{background:C.green.bg,border:"none",borderRadius:10,padding:"7px 14px",color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer"}}>+ Tambah</button>
      </div>
      <div style={{overflowY:"auto",flex:1,padding:"12px 16px 80px"}}>
        {data.length===0 && <div style={{textAlign:"center",color:"#9CA3AF",marginTop:40,fontSize:14}}>Belum ada data.</div>}
        {[...aktif,...lunas].map(item=>(
          <div key={item.id} style={{background:item.lunas?"#F9FAFB":"#fff",borderRadius:14,border:"1px solid #F3F4F6",padding:"12px 14px",marginBottom:10,opacity:item.lunas?.7:1}}>
            <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
              <div style={{width:44,height:44,borderRadius:13,background:item.lunas?"#E5E7EB":C.green.light,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:18,fontWeight:700,color:item.lunas?"#9CA3AF":C.green.text}}>
                {item.nama.charAt(0).toUpperCase()}
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:700,color:item.lunas?"#9CA3AF":"#111827",textDecoration:item.lunas?"line-through":"none"}}>{item.nama}</div>
                {item.keterangan && <div style={{fontSize:12,color:"#6B7280"}}>{item.keterangan}</div>}
                <div style={{display:"flex",gap:10,flexWrap:"wrap",marginTop:2}}>
                  {item.tgl_pinjam && <span style={{fontSize:11,color:"#9CA3AF"}}>Pinjam: {fmtDate(item.tgl_pinjam)}</span>}
                  {item.jatuh_tempo && <span style={{fontSize:11,color:C.amber.text,fontWeight:600}}>Tempo: {fmtDate(item.jatuh_tempo)}</span>}
                </div>
                <div style={{fontSize:16,fontWeight:800,color:item.lunas?"#9CA3AF":C.green.text,marginTop:2}}>{fmt(item.jumlah)}</div>
              </div>
              <div style={{display:"flex",gap:6,alignItems:"center"}}>
                {item.lunas && <span style={{fontSize:11,background:C.green.light,color:C.green.text,borderRadius:8,padding:"3px 8px",fontWeight:700}}>Lunas</span>}
                <EditDelBtns onEdit={()=>openEdit(item)} onDel={()=>dispatch({type:"DEL",cat:"piutang",id:item.id})} editBg={C.green.light} editColor={C.green.text}/>
              </div>
            </div>
            {!item.lunas && (
              <button onClick={()=>dispatch({type:"LUNAS",cat:"piutang",id:item.id})} style={{marginTop:10,width:"100%",padding:"8px 0",borderRadius:10,border:"none",background:C.green.light,color:C.green.text,fontWeight:700,fontSize:13,cursor:"pointer"}}>Tandai Lunas</button>
            )}
          </div>
        ))}
      </div>
      <Drawer visible={open} onClose={()=>setOpen(false)} title={edit?"Edit Piutang":"Tambah Piutang"}>
        <TxtF label="Nama Peminjam" value={f.nama} onChange={v=>sf("nama",v)} placeholder="Andi / Sinta"/>
        <IdrInput label="Jumlah" value={f.jumlah} onChange={v=>sf("jumlah",v)}/>
        <TxtF label="Tanggal Pinjam" value={f.tgl_pinjam} onChange={v=>sf("tgl_pinjam",v)} type="date" required={false}/>
        <TxtF label="Jatuh Tempo" value={f.jatuh_tempo} onChange={v=>sf("jatuh_tempo",v)} type="date" required={false}/>
        <TxtF label="Keterangan" value={f.keterangan} onChange={v=>sf("keterangan",v)} placeholder="Opsional" required={false}/>
        <BtnRow onCancel={()=>setOpen(false)} onSave={save} color={C.green.bg}/>
      </Drawer>
    </div>
  );
}

// ── TAB CICILAN ────────────────────────────────────────────────────────────────
function TabCicilan({data,dispatch}) {
  const [open,setOpen]           = useState(false);
  const [edit,setEdit]           = useState(null);
  const [bayarModal,setBayarModal] = useState(null);
  const [detailModal,setDetailModal] = useState(null);
  const [previewBukti,setPreviewBukti] = useState(null);
  const [f,setF]   = useState({nama:"",total_cicilan:"",per_bulan:"",dibayar:"",keterangan:""});
  const [b,setB]   = useState({jumlah:"",tanggal:todayStr(),bank:"",noRef:"",keterangan:""});
  const sf = (k,v) => setF(p=>({...p,[k]:v}));
  const sb = (k,v) => setB(p=>({...p,[k]:v}));

  const openAdd = () => { setF({nama:"",total_cicilan:"",per_bulan:"",dibayar:"",keterangan:""}); setEdit(null); setOpen(true); };
  const openEdit = c => { setF({nama:c.nama,total_cicilan:fmtIdr(String(c.total_cicilan)),per_bulan:fmtIdr(String(c.per_bulan)),dibayar:fmtIdr(String(c.dibayar)),keterangan:c.keterangan||""}); setEdit(c); setOpen(true); };
  const save = () => {
    if(!f.nama||!f.total_cicilan||!f.per_bulan) return;
    const item = {nama:f.nama,total_cicilan:parseIdr(f.total_cicilan),per_bulan:parseIdr(f.per_bulan),dibayar:parseIdr(f.dibayar),keterangan:f.keterangan,riwayat:edit?edit.riwayat:[]};
    if(edit) dispatch({type:"EDIT",cat:"cicilan",id:edit.id,item});
    else dispatch({type:"ADD",cat:"cicilan",item});
    setOpen(false);
  };
  const saveBayar = () => {
    if(!b.jumlah||!b.tanggal) return;
    const bayar = {id:Date.now(),jumlah:parseIdr(b.jumlah),tanggal:b.tanggal,bank:b.bank,noRef:b.noRef,keterangan:b.keterangan};
    dispatch({type:"ADD_BAYAR",id:bayarModal.id,bayar});
    setBayarModal(null);
    setB({jumlah:"",tanggal:todayStr(),bank:"",noRef:"",keterangan:""});
  };

  return (
    <div style={{display:"flex",flexDirection:"column",flex:1,overflow:"hidden",background:"#F8F7FF"}}>
      <div style={{padding:"14px 16px 10px",display:"flex",justifyContent:"space-between",alignItems:"center",background:"#fff",borderBottom:"1px solid #F3F4F6"}}>
        <div><div style={{fontSize:16,fontWeight:800,color:"#111827"}}>Cicilan</div><div style={{fontSize:12,color:"#6B7280"}}>{data.length} cicilan aktif</div></div>
        <button onClick={openAdd} style={{background:C.amber.bg,border:"none",borderRadius:10,padding:"7px 14px",color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer"}}>+ Tambah</button>
      </div>
      <div style={{overflowY:"auto",flex:1,padding:"12px 16px 80px"}}>
        {data.length===0 && <div style={{textAlign:"center",color:"#9CA3AF",marginTop:40,fontSize:14}}>Belum ada data cicilan.</div>}
        {data.map(c=>{
          const pct  = Math.round((c.dibayar/c.total_cicilan)*100);
          const sisa = c.total_cicilan-c.dibayar;
          const rw   = c.riwayat||[];
          return (
            <div key={c.id} style={{background:"#fff",borderRadius:16,border:"1px solid #F3F4F6",padding:14,marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                <div style={{display:"flex",gap:10,alignItems:"center"}}>
                  <AutoAvatar nama={c.nama} ket={c.keterangan} size={40}/>
                  <div>
                    <div style={{fontSize:14,fontWeight:700,color:"#111827"}}>{c.nama}</div>
                    {c.keterangan && <div style={{fontSize:12,color:"#9CA3AF"}}>{c.keterangan}</div>}
                  </div>
                </div>
                <EditDelBtns onEdit={()=>openEdit(c)} onDel={()=>dispatch({type:"DEL",cat:"cicilan",id:c.id})} editBg={C.amber.light} editColor={C.amber.text}/>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                <span style={{fontSize:12,color:"#6B7280"}}>{fmt(c.dibayar)} dibayar</span>
                <span style={{fontSize:12,fontWeight:700,color:C.amber.text}}>{pct}%</span>
              </div>
              <ProgressBar pct={pct} color={C.amber.bg} h={8}/>
              <div style={{display:"flex",justifyContent:"space-between",marginTop:6,marginBottom:10}}>
                <span style={{fontSize:12,color:"#9CA3AF"}}>Sisa {fmtS(sisa)} · ~{c.per_bulan>0?Math.ceil(sisa/c.per_bulan):"-"} bln</span>
                <span style={{fontSize:12,color:"#6B7280"}}>{fmt(c.per_bulan)}/bln</span>
              </div>
              {rw.length > 0 && (
                <div style={{background:"#FFFBEB",borderRadius:10,padding:"8px 10px",marginBottom:10}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                    <span style={{fontSize:12,fontWeight:700,color:C.amber.text}}>Riwayat ({rw.length}x)</span>
                    <button onClick={()=>setDetailModal(c)} style={{fontSize:11,background:C.amber.light,border:"none",borderRadius:6,padding:"3px 10px",color:C.amber.text,fontWeight:700,cursor:"pointer"}}>Lihat Semua</button>
                  </div>
                  {rw.slice(-2).reverse().map(r=>(
                    <div key={r.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"4px 0",borderBottom:"1px solid #FDE68A"}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        {r.bank && <BankLogo code={r.bank} size={20}/>}
                        <span style={{fontSize:12,fontWeight:600,color:"#111827"}}>{fmt(r.jumlah)}</span>
                      </div>
                      <span style={{fontSize:11,color:"#9CA3AF"}}>{fmtDate(r.tanggal)}</span>
                    </div>
                  ))}
                </div>
              )}
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>{setBayarModal(c);setB({jumlah:"",tanggal:todayStr(),bank:"",noRef:"",keterangan:""});}} style={{flex:1,padding:"9px 0",borderRadius:10,border:"none",background:C.amber.light,color:C.amber.text,fontWeight:700,fontSize:13,cursor:"pointer"}}>+ Catat Bayar</button>
                <button onClick={()=>setDetailModal(c)} style={{padding:"9px 14px",borderRadius:10,border:`1px solid ${C.amber.border}`,background:"#fff",color:C.amber.text,fontWeight:700,fontSize:13,cursor:"pointer"}}>Detail</button>
              </div>
            </div>
          );
        })}
      </div>

      <Drawer visible={open} onClose={()=>setOpen(false)} title={edit?"Edit Cicilan":"Tambah Cicilan"}>
        <TxtF label="Nama Cicilan" value={f.nama} onChange={v=>sf("nama",v)} placeholder="KPR / Kredit Motor"/>
        <IdrInput label="Total Cicilan" value={f.total_cicilan} onChange={v=>sf("total_cicilan",v)}/>
        <IdrInput label="Cicilan per Bulan" value={f.per_bulan} onChange={v=>sf("per_bulan",v)}/>
        <IdrInput label="Sudah Dibayar" value={f.dibayar} onChange={v=>sf("dibayar",v)} required={false}/>
        <TxtF label="Keterangan" value={f.keterangan} onChange={v=>sf("keterangan",v)} placeholder="Bank BTN / Leasing" required={false}/>
        <BtnRow onCancel={()=>setOpen(false)} onSave={save} color={C.amber.bg}/>
      </Drawer>

      <Drawer visible={!!bayarModal} onClose={()=>setBayarModal(null)} title="Catat Pembayaran">
        {bayarModal && (
          <div style={{background:C.amber.light,borderRadius:10,padding:"8px 12px",marginBottom:12,fontSize:12,color:C.amber.text,fontWeight:600}}>
            {bayarModal.nama} · Sisa {fmt(bayarModal.total_cicilan-bayarModal.dibayar)}
          </div>
        )}
        <IdrInput label="Jumlah Bayar" value={b.jumlah} onChange={v=>sb("jumlah",v)}/>
        <TxtF label="Tanggal Bayar" value={b.tanggal} onChange={v=>sb("tanggal",v)} type="date"/>
        <BankSelect value={b.bank} onChange={v=>sb("bank",v)}/>
        <TxtF label="No. Referensi / Bukti Transfer" value={b.noRef} onChange={v=>sb("noRef",v)} placeholder="Nomor transaksi" required={false}/>
        <TxtF label="Keterangan" value={b.keterangan} onChange={v=>sb("keterangan",v)} placeholder="Opsional" required={false}/>
        <BtnRow onCancel={()=>setBayarModal(null)} onSave={saveBayar} color={C.amber.bg} label="Simpan Pembayaran"/>
      </Drawer>

      <Drawer visible={!!detailModal} onClose={()=>setDetailModal(null)} title={detailModal?`Detail: ${detailModal.nama}`:""}>
        {detailModal && (
          <>
            <div style={{display:"flex",gap:8,marginBottom:12}}>
              {[{l:"Total",v:fmt(detailModal.total_cicilan),c:C.indigo},{l:"Terbayar",v:fmt(detailModal.dibayar),c:C.green},{l:"Sisa",v:fmt(detailModal.total_cicilan-detailModal.dibayar),c:C.red}].map(m=>(
                <div key={m.l} style={{flex:1,background:m.c.light,borderRadius:10,padding:"8px",textAlign:"center"}}>
                  <div style={{fontSize:10,color:m.c.text,fontWeight:600}}>{m.l}</div>
                  <div style={{fontSize:11,fontWeight:800,color:m.c.text,marginTop:2}}>{m.v}</div>
                </div>
              ))}
            </div>
            <ProgressBar pct={Math.round((detailModal.dibayar/detailModal.total_cicilan)*100)} color={C.amber.bg} h={8}/>
            <div style={{fontSize:12,color:"#6B7280",textAlign:"right",marginTop:4,marginBottom:14}}>{Math.round((detailModal.dibayar/detailModal.total_cicilan)*100)}% lunas</div>
            <div style={{fontSize:13,fontWeight:700,color:"#111827",marginBottom:8}}>Riwayat Pembayaran</div>
            {(!detailModal.riwayat||detailModal.riwayat.length===0) && <div style={{textAlign:"center",color:"#9CA3AF",fontSize:13,padding:"20px 0"}}>Belum ada riwayat.</div>}
            {(detailModal.riwayat||[]).slice().reverse().map(r=>(
              <div key={r.id} style={{background:"#F9FAFB",borderRadius:12,padding:"10px 12px",marginBottom:8}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                  <span style={{fontSize:14,fontWeight:700,color:C.green.text}}>{fmt(r.jumlah)}</span>
                  <span style={{fontSize:12,fontWeight:600,color:"#6B7280"}}>{fmtDate(r.tanggal)}</span>
                </div>
                {r.bank && (
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                    <BankLogo code={r.bank} size={22}/>
                    <span style={{fontSize:12,color:"#374151"}}>{BANKS.find(x=>x.code===r.bank)?.name||r.bank}</span>
                  </div>
                )}
                {r.noRef && (
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div style={{fontSize:12,color:"#6B7280"}}>Ref: <span style={{color:"#111827",fontWeight:600}}>{r.noRef}</span></div>
                    <button onClick={()=>setPreviewBukti(r)} style={{fontSize:11,background:C.indigo.light,border:"none",borderRadius:6,padding:"3px 10px",color:C.indigo.text,fontWeight:700,cursor:"pointer"}}>Preview Bukti</button>
                  </div>
                )}
                {r.keterangan && <div style={{fontSize:12,color:"#9CA3AF",marginTop:2}}>{r.keterangan}</div>}
              </div>
            ))}
          </>
        )}
      </Drawer>

      <Drawer visible={!!previewBukti} onClose={()=>setPreviewBukti(null)} title="Bukti Transfer">
        {previewBukti && (
          <div style={{background:"#F9FAFB",borderRadius:14,padding:"20px 16px"}}>
            <div style={{textAlign:"center",marginBottom:16}}>
              <div style={{width:56,height:56,borderRadius:16,background:C.green.light,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 10px"}}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={C.green.bg} strokeWidth="2.2" strokeLinecap="round">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <div style={{fontSize:13,color:C.green.text,fontWeight:700}}>Pembayaran Berhasil</div>
              {previewBukti.bank && <div style={{display:"flex",justifyContent:"center",marginTop:8}}><BankLogo code={previewBukti.bank} size={36}/></div>}
            </div>
            <div style={{borderTop:"1px dashed #E5E7EB",paddingTop:14}}>
              {[{l:"Jumlah",v:fmt(previewBukti.jumlah)},{l:"Tanggal",v:fmtDate(previewBukti.tanggal)},{l:"Bank / Metode",v:BANKS.find(x=>x.code===previewBukti.bank)?.name||"-"},{l:"No. Referensi",v:previewBukti.noRef||"-"},{l:"Keterangan",v:previewBukti.keterangan||"-"}].map(row=>(
                <div key={row.l} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid #F3F4F6"}}>
                  <span style={{fontSize:13,color:"#6B7280"}}>{row.l}</span>
                  <span style={{fontSize:13,fontWeight:700,color:"#111827",textAlign:"right",maxWidth:"60%",wordBreak:"break-all"}}>{row.v}</span>
                </div>
              ))}
            </div>
            <div style={{marginTop:14,textAlign:"center",fontSize:11,color:"#9CA3AF"}}>FR Finance · Catatan Keuangan Pribadi</div>
          </div>
        )}
      </Drawer>
    </div>
  );
}

// ── NAV & APP ──────────────────────────────────────────────────────────────────
const NAV = [
  {key:"dashboard",label:"Beranda", color:C.indigo.bg},
  {key:"uang",     label:"Uang",    color:C.indigo.bg},
  {key:"aset",     label:"Aset",    color:C.teal.bg},
  {key:"piutang",  label:"Piutang", color:C.green.bg},
  {key:"hutang",   label:"Hutang",  color:C.red.bg},
  {key:"cicilan",  label:"Cicilan", color:C.amber.bg},
];

const NAV_ICONS = {
  dashboard: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
  uang:      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v12M9 9h4.5a1.5 1.5 0 010 3H9m0 0h5.5a1.5 1.5 0 010 3H9"/></svg>,
  aset:      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  piutang:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 11l-5-5-5 5M17 18l-5-5-5 5"/></svg>,
  hutang:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 13l-5 5-5-5M17 6l-5 5-5-5"/></svg>,
  cicilan:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>,
};

export default function App() {
  const [user, setUser]   = useState(null);
  const [tab, setTab]     = useState("dashboard");
  const [state, dispatch] = useReducer(reducer, initData());

  const isDash = tab === "dashboard";

  const screens = {
    dashboard: <TabDashboard data={state} user={user||{}} onLogout={()=>setUser(null)}/>,
    uang:      <TabUang      data={state.uang}    dispatch={dispatch}/>,
    aset:      <TabAset      data={state.aset}    dispatch={dispatch}/>,
    piutang:   <TabPiutang   data={state.piutang} dispatch={dispatch}/>,
    hutang:    <TabHutang    data={state.hutang}  dispatch={dispatch}/>,
    cicilan:   <TabCicilan   data={state.cicilan} dispatch={dispatch}/>,
  };

  return (
    <div style={{display:"flex",justifyContent:"center",alignItems:"center",minHeight:"100vh",background:"#E8E5F5",padding:24}}>
      <div style={{width:375,height:812,background:"#18181B",borderRadius:44,padding:10,boxShadow:"0 32px 80px rgba(0,0,0,.45),inset 0 0 0 1px #333"}}>
        <div style={{width:"100%",height:"100%",borderRadius:36,display:"flex",flexDirection:"column",overflow:"hidden",position:"relative",background:"#F8F7FF"}}>

          {/* Status bar */}
          <div style={{background:(!user||isDash)?"#4F46E5":"#fff",padding:"14px 20px 10px",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
            <span style={{fontSize:12,fontWeight:700,color:(!user||isDash)?"rgba(255,255,255,.7)":"#9CA3AF"}}>9:41</span>
            <div style={{display:"flex",gap:4,alignItems:"center"}}>
              {[3,2,1].map(h=>(
                <div key={h} style={{width:3,height:h*3+2,background:(!user||isDash)?"rgba(255,255,255,.7)":"#9CA3AF",borderRadius:1}}/>
              ))}
            </div>
          </div>

          {/* Logo bar */}
          {user && isDash && (
            <div style={{background:"#4F46E5",padding:"0 20px 16px",display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:36,height:36,borderRadius:11,background:"rgba(255,255,255,.15)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" fill="white" opacity=".9"/>
                  <path d="M12 6v12M9 9.5h4a1.5 1.5 0 010 3H9m0 0h4.5a1.5 1.5 0 010 3H9" stroke="#4F46E5" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <div style={{fontSize:15,fontWeight:800,color:"#fff",letterSpacing:-.3}}>FR Finance</div>
                <div style={{fontSize:10,color:"rgba(255,255,255,.6)"}}>Kelola Keuangan Lebih Cerdas</div>
              </div>
            </div>
          )}

          {/* Content */}
          <div style={{flex:1,overflow:"hidden",display:"flex",flexDirection:"column",position:"relative"}}>
            {!user ? <LoginScreen onLogin={u=>{setUser(u);setTab("dashboard");}} /> : screens[tab]}
          </div>

          {/* Bottom nav */}
          {user && (
            <div style={{background:"#fff",borderTop:"1px solid #F3F4F6",display:"flex",paddingBottom:10,paddingTop:6,flexShrink:0}}>
              {NAV.map(n=>{
                const active = tab===n.key;
                return (
                  <button key={n.key} onClick={()=>setTab(n.key)} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2,border:"none",background:"none",cursor:"pointer",padding:"4px 0"}}>
                    <div style={{color:active?n.color:"#9CA3AF"}}>{NAV_ICONS[n.key]}</div>
                    <span style={{fontSize:9,fontWeight:active?700:500,color:active?n.color:"#9CA3AF"}}>{n.label}</span>
                    {active && <div style={{width:14,height:3,borderRadius:99,background:n.color}}/>}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}