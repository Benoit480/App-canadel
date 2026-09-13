import {firebaseConfig} from "./firebase-config.js";
import {initializeApp} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import {getFirestore,collection,doc,getDoc,getDocs,setDoc,updateDoc,serverTimestamp,query,where} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const fb=initializeApp(firebaseConfig),db=getFirestore(fb),A=document.getElementById("app");
const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
const today=()=>new Date().toISOString().slice(0,10);
const fmt=t=>t?.toDate?t.toDate().toLocaleString("fr-CA"):"—";
const params=new URLSearchParams(location.search);
let lang=localStorage.getItem("canadelLang")==="en"?"en":"fr";
const T={
 fr:{
  confirm:"Confirmer ma livraison",intro:"Merci de prendre quelques instants pour confirmer la réception de votre commande.",
  info:"Informations de commande",order:"Numéro de commande *",orderPh:"Ex. 123456",client:"Nom du client / entreprise *",clientPh:"Ex. Construction ABC",
  date:"Date de réception *",name:"Votre nom",namePh:"Nom de la personne qui reçoit",state:"État de la livraison",
  compliant:"Tout est conforme",damaged:"Produit endommagé",missing:"Produit manquant",wrong:"Mauvais produit",other:"Autre problème",
  satisfaction:"Satisfaction",comment:"Commentaire",commentPh:"Comment s'est passée votre livraison?",problem:"En cas de problème",
  item:"Article concerné",itemPh:"Nom ou numéro d'article",qty:"Quantité",desc:"Description du problème",photos:"📷 Photos",
  photoHelp:"La sélection de photos est prête. L'envoi Firebase Storage sera activé à l'étape Storage.",
  submit:"✓ Confirmer la réception",required:"Numéro de commande et nom du client requis.",checking:"Vérification…",
  checkingOrder:"Vérification de la commande…",duplicate:"Une réception existe déjà pour ce numéro de commande. Communiquez avec Canadel si une correction est nécessaire.",
  success:"✅ Réception confirmée",thanks:"Merci! La réception de la commande",sent:"Votre réponse a été transmise à Canadel.",sellerFollowup:"⚠️ Une anomalie a été signalée avec votre commande. Veuillez communiquer avec votre vendeur afin d’assurer le suivi de votre dossier."
 },
 en:{
  confirm:"Confirm my delivery",intro:"Please take a few moments to confirm receipt of your order.",
  info:"Order information",order:"Order number *",orderPh:"Ex. 123456",client:"Customer / company name *",clientPh:"Ex. ABC Construction",
  date:"Date received *",name:"Your name",namePh:"Name of the person receiving the order",state:"Delivery status",
  compliant:"Everything is correct",damaged:"Damaged product",missing:"Missing product",wrong:"Wrong product",other:"Other issue",
  satisfaction:"Satisfaction",comment:"Comments",commentPh:"How did your delivery go?",problem:"If there is a problem",
  item:"Item concerned",itemPh:"Item name or number",qty:"Quantity",desc:"Problem description",photos:"📷 Photos",
  photoHelp:"Photo selection is ready. Firebase Storage upload will be enabled at the Storage step.",
  submit:"✓ Confirm receipt",required:"Order number and customer name are required.",checking:"Checking…",
  checkingOrder:"Checking the order…",duplicate:"A receipt has already been recorded for this order number. Please contact Canadel if a correction is required.",
  success:"✅ Receipt confirmed",thanks:"Thank you! Receipt of order",sent:"Your response has been sent to Canadel.",sellerFollowup:"⚠️ An issue has been reported with your order. Please contact your salesperson to follow up on your order."
 }
};
const tr=k=>T[lang][k];
function updateLangButton(){const b=document.getElementById("langBtn");if(b)b.textContent=lang==="fr"?"ENG":"FR";}

const adminBtn=document.getElementById("adminBtn");
const langBtn=document.createElement("button");
langBtn.id="langBtn";langBtn.className="secondary";langBtn.style.marginRight="8px";
adminBtn.parentNode.insertBefore(langBtn,adminBtn);
langBtn.addEventListener("click",()=>{lang=lang==="fr"?"en":"fr";localStorage.setItem("canadelLang",lang);updateLangButton();reception();});
updateLangButton();
adminBtn.addEventListener("click",()=>admin("dashboard"));
if(params.get("admin")==="1") admin("dashboard"); else reception();

function clientBrand(){return `<div class="canadelHeroImage"><img src="canadel-header.jpg" alt="Canadel — Confirmer ma livraison"></div>`}
async function getAll(){let s=await getDocs(collection(db,"receipts"));return s.docs.map(d=>({id:d.id,...d.data()}))}
function tabs(a){let x=[["dashboard","▣  Tableau de bord"],["receipts","▰  Réceptions"],["claims","◷  Réclamations"],["stats","▥  Statistiques"],["qr","⌗  QR universel"]];return `<div class="tabs adminSide noPrint">${x.map(([k,v])=>`<button data-tab="${k}" class="${a===k?"active":""}">${v}</button>`).join("")}</div>`}
function wire(){document.querySelectorAll("[data-tab]").forEach(b=>b.addEventListener("click",()=>admin(b.dataset.tab)))}

async function reception(){
 document.body.classList.remove("admin"); updateLangButton();
 let rating=5;
 const issues=[tr("compliant"),tr("damaged"),tr("missing"),tr("wrong"),tr("other")];
 A.innerHTML=`<section class="card hero canadelHeroCard">${clientBrand()}</section>
 <section class="card"><h2>${tr("info")}</h2><div class="grid"><label>${tr("order")}<input id="orderNo" autocomplete="off" placeholder="${tr("orderPh")}"></label><label>${tr("client")}<input id="customer" autocomplete="organization" placeholder="${tr("clientPh")}"></label><label>${tr("date")}<input id="receivedDate" type="date" value="${today()}"></label><label>${tr("name")}<input id="contact" autocomplete="name" placeholder="${tr("namePh")}"></label></div></section>
 <section class="card"><h2>${tr("state")}</h2>${issues.map((x,i)=>`<label class="choice"><input type="radio" name="issue" value="${["compliant","damaged","missing","wrong","other"][i]}" ${i===0?"checked":""}>${x}</label>`).join("")}<h3>${tr("satisfaction")}</h3><div class="stars">${[1,2,3,4,5].map(n=>`<span class="star on" data-n="${n}">⭐</span>`).join("")}</div><label>${tr("comment")}<textarea id="comment" placeholder="${tr("commentPh")}"></textarea></label></section>
 <section class="card problem" id="problemBox"><h2>${tr("problem")}</h2><div class="grid"><label>${tr("item")}<input id="item" placeholder="${tr("itemPh")}"></label><label>${tr("qty")}<input id="qty" type="number" min="1"></label></div><label>${tr("desc")}<textarea id="desc"></textarea></label></section>
 <section class="card"><button id="submit">${tr("submit")}</button><p id="msg"></p></section>`;
 document.querySelectorAll(".star").forEach(s=>s.addEventListener("click",()=>{rating=+s.dataset.n;document.querySelectorAll(".star").forEach(x=>x.classList.toggle("on",+x.dataset.n<=rating))}));
 document.getElementById("submit").addEventListener("click",async()=>{
   const btn=document.getElementById("submit"),msg=document.getElementById("msg"),orderNo=document.getElementById("orderNo").value.trim(),customer=document.getElementById("customer").value.trim();
   if(!orderNo||!customer){msg.className="error";msg.textContent=tr("required");return}
   btn.disabled=true;btn.textContent=tr("checking");msg.className="muted";msg.textContent=tr("checkingOrder");
   try{
     const dup=await getDocs(query(collection(db,"receipts"),where("orderNo","==",orderNo)));
     if(!dup.empty){throw new Error(tr("duplicate"));}
     let issue=document.querySelector('input[name="issue"]:checked').value,id=crypto.randomUUID();
     await setDoc(doc(db,"receipts",id),{orderNo,customer,receivedDate:document.getElementById("receivedDate").value,contact:document.getElementById("contact").value.trim(),issue,rating,language:lang,comment:document.getElementById("comment").value.trim(),problemItem:document.getElementById("item").value.trim(),problemQty:document.getElementById("qty").value?Number(document.getElementById("qty").value):null,problemDescription:document.getElementById("desc").value.trim(),claimStatus:issue==="compliant"?"":"Nouvelle",createdAt:serverTimestamp(),photoUrls:[]});
     const followup=issue==="compliant"?"":`<div class="seller-followup">${tr("sellerFollowup")}</div>`;
     A.innerHTML=`<section class="card hero">${logo()}<h1>${tr("success")}</h1><p>${tr("thanks")} <b>#${esc(orderNo)}</b> ${lang==="fr"?"a été enregistrée.":"has been recorded."}</p><p class="muted">${tr("sent")}</p>${followup}</section>`;
   }catch(e){btn.disabled=false;btn.textContent=tr("submit");msg.className="error";msg.textContent="❌ "+(e.code||e.message)}
 });
}

async function admin(view){document.body.classList.add("admin");
 A.innerHTML=tabs(view)+`<section class="card"><p class="muted">Chargement…</p></section>`;wire();
 try{let o=await getAll(); if(view==="dashboard")dashboard(o);else if(view==="receipts")receipts(o);else if(view==="claims")claims(o);else if(view==="stats")stats(o);else universalQR();wire()}catch(e){A.innerHTML=tabs(view)+`<section class="card"><p class="error">${esc(e.code||e.message)}</p></section>`;wire()}
}
function status(x){const ok=x.issue==="Tout est conforme"||x.issue==="compliant";const names={damaged:"Produit endommagé",missing:"Produit manquant",wrong:"Mauvais produit",other:"Autre problème"};return ok?`<span class="badge green">Conforme</span>`:`<span class="badge red">${esc(names[x.issue]||x.issue)}</span>`}
function table(o){return `<div class="tablewrap"><table><thead><tr><th>Date</th><th>Commande</th><th>Client</th><th>État</th><th>Note</th><th>Réclamation</th><th>Détails</th></tr></thead><tbody>${o.map(x=>`<tr><td>${esc(x.receivedDate)}</td><td>${esc(x.orderNo)}</td><td>${esc(x.customer)}</td><td>${status(x)}</td><td>${x.rating||"—"}/5</td><td>${esc(x.claimStatus||"—")}</td><td><button class="secondary detailBtn" data-detail-id="${esc(x.id)}">Voir détails</button></td></tr>`).join("")}</tbody></table></div>`}

function issueLabel(v){return ({compliant:"Tout est conforme","Tout est conforme":"Tout est conforme",damaged:"Produit endommagé",missing:"Produit manquant",wrong:"Mauvais produit",other:"Autre problème"})[v]||v||"—"}
function fullDate(v){try{return v?.toDate?v.toDate().toLocaleString("fr-CA"):v?new Date(v).toLocaleString("fr-CA"):"—"}catch(e){return "—"}}
function wireDetails(o){
 document.querySelectorAll("[data-detail-id]").forEach(btn=>{
  btn.addEventListener("click",()=>{
   const x=o.find(r=>String(r.id)===String(btn.dataset.detailId)); if(!x)return;
   const problem=!(x.issue==="compliant"||x.issue==="Tout est conforme");
   const overlay=document.createElement("div");
   overlay.className="detailOverlay";
   overlay.innerHTML=`<section class="card detailModal">
    <div class="detailHead"><h2>Détails de la réception</h2><button type="button" class="secondary detailClose">✕</button></div>
    <div class="detailGrid">
     <div><span>Numéro de commande</span><b>${esc(x.orderNo||"—")}</b></div>
     <div><span>Client / entreprise</span><b>${esc(x.customer||"—")}</b></div>
     <div><span>Date de réception</span><b>${esc(x.receivedDate||"—")}</b></div>
     <div><span>Votre nom</span><b>${esc(x.contact||x.name||"—")}</b></div>
     <div><span>État de la livraison</span><b>${esc(issueLabel(x.issue))}</b></div>
     <div><span>Satisfaction</span><b>${esc(x.rating||"—")} / 5</b></div>
     <div class="detailWide"><span>Commentaire</span><b>${esc(x.comment||"Aucun commentaire")}</b></div>
     ${problem?`<div><span>Article concerné</span><b>${esc(x.problemItem||x.item||"—")}</b></div><div><span>Quantité</span><b>${esc(x.problemQty||x.qty||"—")}</b></div><div class="detailWide"><span>Description du problème</span><b>${esc(x.problemDescription||x.description||"—")}</b></div><div><span>Statut de réclamation</span><b>${esc(x.claimStatus||"Nouvelle")}</b></div>`:""}
     <div><span>Date / heure d'envoi</span><b>${esc(fullDate(x.createdAt))}</b></div>
    </div>
   </section>`;
   document.body.appendChild(overlay);
   const close=()=>overlay.remove();
   overlay.querySelector(".detailClose").addEventListener("click",close);
   overlay.addEventListener("click",e=>{if(e.target===overlay)close()});
  });
 });
}
function dashboard(o){let p=o.filter(x=>x.issue!=="Tout est conforme"&&x.issue!=="compliant"),avg=o.length?(o.reduce((a,x)=>a+(+x.rating||0),0)/o.length).toFixed(1):"—";const shown=o.slice(-10).reverse();A.innerHTML=tabs("dashboard")+`<section class="stats"><div class="stat"><b>${o.length}</b>Total réceptions</div><div class="stat"><b>${o.length-p.length}</b>Conformes</div><div class="stat"><b>${p.length}</b>Avec problème</div><div class="stat"><b>${avg}</b>Satisfaction /5</div></section><section class="card"><h2>Réceptions récentes</h2>${table(shown)}</section>`;wire();wireDetails(shown)}
function receipts(o){const shown=[...o].reverse();A.innerHTML=tabs("receipts")+`<section class="card"><h2>Réceptions</h2><input id="search" class="search" placeholder="Rechercher commande ou client…">${table(shown)}</section>`;wire();wireDetails(shown);const searchEl=document.getElementById("search");searchEl.addEventListener("input",()=>{let q=searchEl.value.toLowerCase();document.querySelectorAll("tbody tr").forEach(r=>r.style.display=r.textContent.toLowerCase().includes(q)?"":"none")})}
function claims(o){let c=o.filter(x=>x.issue!=="Tout est conforme"&&x.issue!=="compliant").reverse();A.innerHTML=tabs("claims")+`<section class="card"><h2>Réclamations</h2>${c.length?table(c):'<p class="muted">Aucune réclamation.</p>'}</section>`;wire();wireDetails(c)}
function stats(o){let p=o.filter(x=>x.issue!=="Tout est conforme"&&x.issue!=="compliant"),avg=o.length?(o.reduce((a,x)=>a+(+x.rating||0),0)/o.length).toFixed(1):"—";A.innerHTML=tabs("stats")+`<section class="stats"><div class="stat"><b>${o.length}</b>Réceptions</div><div class="stat"><b>${avg}</b>Note moyenne</div><div class="stat"><b>${p.length}</b>Problèmes</div><div class="stat"><b>${o.length?Math.round(p.length/o.length*100):0}%</b>Taux de problème</div></section>`;wire()}

async function buildBrandedQR(url){
  const size=900;
  const qrUrl="https://quickchart.io/qr?size="+size+"&margin=2&ecLevel=H&text="+encodeURIComponent(url);
  const qrImg=new Image();
  qrImg.crossOrigin="anonymous";
  const load=(img,src)=>new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=reject;img.src=src;});
  await load(qrImg,qrUrl);
  const c=document.createElement("canvas"); c.width=size; c.height=size;
  const ctx=c.getContext("2d");
  ctx.fillStyle="#fff"; ctx.fillRect(0,0,size,size);
  ctx.drawImage(qrImg,0,0,size,size);
  const boxW=260, boxH=96, x=(size-boxW)/2, y=(size-boxH)/2;
  ctx.fillStyle="#ffffff"; ctx.fillRect(x,y,boxW,boxH);
  ctx.fillStyle="#071522"; ctx.font="900 42px system-ui, sans-serif"; ctx.textAlign="center"; ctx.textBaseline="middle";
  ctx.fillText("CONFIRVO",size/2,size/2);
  return c.toDataURL("image/png");
}

async function universalQR(){
 let url=location.origin+location.pathname;
 A.innerHTML=tabs("qr")+`<section class="card printSheet"><h1>Scannez ici</h1><p>Confirmez votre livraison avec CONFIRVO</p><div class="qrbox"><img id="finalQR" class="qr" alt="QR universel CONFIRVO" style="display:block;width:300px;height:300px"></div><p class="muted">${esc(url)}</p><div class="actions noPrint"><button class="blue" onclick="print()">Imprimer le QR universel</button></div><p><b>Un seul QR pour toutes les boîtes.</b></p></section>`;
 wire();
 try{
   const finalSrc=await buildBrandedQR(url);
   document.getElementById("finalQR").src=finalSrc;
 }catch(e){
   document.getElementById("finalQR").alt="Impossible de générer le QR";
   console.error(e);
 }
}