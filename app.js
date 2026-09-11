import {firebaseConfig} from "./firebase-config.js";
import {initializeApp} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import {getFirestore,collection,doc,getDoc,getDocs,setDoc,updateDoc,serverTimestamp,query,where} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const fb=initializeApp(firebaseConfig),db=getFirestore(fb),A=document.getElementById("app");
const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
const today=()=>new Date().toISOString().slice(0,10);
const fmt=t=>t?.toDate?t.toDate().toLocaleString("fr-CA"):"—";
const params=new URLSearchParams(location.search);
document.getElementById("adminBtn").addEventListener("click",()=>admin("dashboard"));
if(params.get("admin")==="1") admin("dashboard"); else reception();

function logo(){return `<img src="assets/canadel-logo.jpg" alt="Canadel">`}
async function getAll(){let s=await getDocs(collection(db,"receipts"));return s.docs.map(d=>({id:d.id,...d.data()}))}
function tabs(a){let x=[["dashboard","▣  Tableau de bord"],["receipts","▰  Réceptions"],["claims","◷  Réclamations"],["stats","▥  Statistiques"],["qr","⌗  QR universel"]];return `<div class="tabs adminSide noPrint">${x.map(([k,v])=>`<button data-tab="${k}" class="${a===k?"active":""}">${v}</button>`).join("")}</div>`}
function wire(){document.querySelectorAll("[data-tab]").forEach(b=>b.addEventListener("click",()=>admin(b.dataset.tab)))}

async function reception(){document.body.classList.remove("admin");
 let rating=5;
 A.innerHTML=`<section class="card hero">${logo()}<h1>Confirmer ma livraison</h1><p class="muted">Merci de prendre quelques minutes pour confirmer la réception de votre commande.</p></section>
 <section class="card"><h2>Informations de commande</h2><div class="grid"><label>Numéro de commande *<input id="orderNo" autocomplete="off" placeholder="Ex. 123456"></label><label>Nom du client / entreprise *<input id="customer" autocomplete="organization" placeholder="Ex. Construction ABC"></label><label>Date de réception *<input id="receivedDate" type="date" value="${today()}"></label><label>Votre nom<input id="contact" autocomplete="name" placeholder="Nom de la personne qui reçoit"></label></div></section>
 <section class="card"><h2>État de la livraison</h2><p class="muted">Tout était en ordre ? Dites-nous comment s’est passée votre livraison.</p>${["Tout est conforme","Produit endommagé","Produit manquant","Mauvais produit","Autre problème"].map((x,i)=>`<label class="choice"><input type="radio" name="issue" value="${x}" ${i===0?"checked":""}>${x}</label>`).join("")}<h3>Satisfaction</h3><div class="stars">${[1,2,3,4,5].map(n=>`<span class="star on" data-n="${n}">⭐</span>`).join("")}</div><label>Commentaire<textarea id="comment" placeholder="Comment s'est passée votre livraison?"></textarea></label></section>
 <section class="card problem" id="problemBox"><h2>En cas de problème</h2><div class="grid"><label>Article concerné<input id="item" placeholder="Nom ou numéro d'article"></label><label>Quantité<input id="qty" type="number" min="1"></label></div><label>Description du problème<textarea id="desc"></textarea></label><div class="upload"><b>📷 Photos</b><p class="muted">La sélection de photos est prête. L'envoi Firebase Storage sera activé à l'étape Storage.</p><input id="photos" type="file" accept="image/*" multiple><div id="previews" class="photos"></div></div></section>
 <section class="card"><button id="submit">✓ Confirmer la réception</button><p id="msg"></p></section>`;
 document.querySelectorAll(".star").forEach(s=>s.addEventListener("click",()=>{rating=+s.dataset.n;document.querySelectorAll(".star").forEach(x=>x.classList.toggle("on",+x.dataset.n<=rating))}));
 document.getElementById("photos").addEventListener("change",e=>{document.getElementById("previews").innerHTML=[...e.target.files].map(f=>`<img src="${URL.createObjectURL(f)}">`).join("")});
 document.getElementById("submit").addEventListener("click",async()=>{
   const btn=document.getElementById("submit"),msg=document.getElementById("msg"),orderNo=document.getElementById("orderNo").value.trim(),customer=document.getElementById("customer").value.trim();
   if(!orderNo||!customer){msg.className="error";msg.textContent="Numéro de commande et nom du client requis.";return}
   btn.disabled=true;btn.textContent="Vérification…";msg.className="muted";msg.textContent="Vérification de la commande…";
   try{
     const dup=await getDocs(query(collection(db,"receipts"),where("orderNo","==",orderNo)));
     if(!dup.empty){throw new Error("Une réception existe déjà pour ce numéro de commande. Communiquez avec Canadel si une correction est nécessaire.");}
     let issue=document.querySelector('input[name="issue"]:checked').value,id=crypto.randomUUID();
     await setDoc(doc(db,"receipts",id),{orderNo,customer,receivedDate:document.getElementById("receivedDate").value,contact:document.getElementById("contact").value.trim(),issue,rating,comment:document.getElementById("comment").value.trim(),problemItem:document.getElementById("item").value.trim(),problemQty:document.getElementById("qty").value?Number(document.getElementById("qty").value):null,problemDescription:document.getElementById("desc").value.trim(),claimStatus:issue==="Tout est conforme"?"":"Nouvelle",createdAt:serverTimestamp(),photoUrls:[]});
     A.innerHTML=`<section class="card hero">${logo()}<h1>✅ Réception confirmée</h1><p>Merci! La réception de la commande <b>#${esc(orderNo)}</b> a été enregistrée.</p><p class="muted">Votre réponse a été transmise à Canadel.</p></section>`;
   }catch(e){btn.disabled=false;btn.textContent="✓ Confirmer la réception";msg.className="error";msg.textContent="❌ "+(e.code||e.message)}
 });
}

async function admin(view){document.body.classList.add("admin");
 A.innerHTML=tabs(view)+`<section class="card"><p class="muted">Chargement…</p></section>`;wire();
 try{let o=await getAll(); if(view==="dashboard")dashboard(o);else if(view==="receipts")receipts(o);else if(view==="claims")claims(o);else if(view==="stats")stats(o);else universalQR();wire()}catch(e){A.innerHTML=tabs(view)+`<section class="card"><p class="error">${esc(e.code||e.message)}</p></section>`;wire()}
}
function status(x){return x.issue==="Tout est conforme"?`<span class="badge green">Conforme</span>`:`<span class="badge red">${esc(x.issue)}</span>`}
function table(o){return `<div class="tablewrap"><table><thead><tr><th>Date</th><th>Commande</th><th>Client</th><th>État</th><th>Note</th><th>Réclamation</th></tr></thead><tbody>${o.map(x=>`<tr><td>${esc(x.receivedDate)}</td><td>${esc(x.orderNo)}</td><td>${esc(x.customer)}</td><td>${status(x)}</td><td>${x.rating}/5</td><td>${esc(x.claimStatus||"—")}</td></tr>`).join("")}</tbody></table></div>`}
function dashboard(o){let p=o.filter(x=>x.issue!=="Tout est conforme"),avg=o.length?(o.reduce((a,x)=>a+(+x.rating||0),0)/o.length).toFixed(1):"—";A.innerHTML=tabs("dashboard")+`<section class="stats"><div class="stat"><b>${o.length}</b>Total réceptions</div><div class="stat"><b>${o.length-p.length}</b>Conformes</div><div class="stat"><b>${p.length}</b>Avec problème</div><div class="stat"><b>${avg}</b>Satisfaction /5</div></section><section class="card"><h2>Réceptions récentes</h2>${table(o.slice(-10).reverse())}</section>`;wire()}
function receipts(o){A.innerHTML=tabs("receipts")+`<section class="card"><h2>Réceptions</h2><input id="search" class="search" placeholder="Rechercher commande ou client…">${table(o.reverse())}</section>`;wire();search.addEventListener("input",()=>{let q=search.value.toLowerCase();document.querySelectorAll("tbody tr").forEach(r=>r.style.display=r.textContent.toLowerCase().includes(q)?"":"none")})}
function claims(o){let c=o.filter(x=>x.issue!=="Tout est conforme");A.innerHTML=tabs("claims")+`<section class="card"><h2>Réclamations</h2>${c.length?table(c.reverse()):'<p class="muted">Aucune réclamation.</p>'}</section>`;wire()}
function stats(o){let p=o.filter(x=>x.issue!=="Tout est conforme"),avg=o.length?(o.reduce((a,x)=>a+(+x.rating||0),0)/o.length).toFixed(1):"—";A.innerHTML=tabs("stats")+`<section class="stats"><div class="stat"><b>${o.length}</b>Réceptions</div><div class="stat"><b>${avg}</b>Note moyenne</div><div class="stat"><b>${p.length}</b>Problèmes</div><div class="stat"><b>${o.length?Math.round(p.length/o.length*100):0}%</b>Taux de problème</div></section>`;wire()}
function universalQR(){
 let url=location.origin+location.pathname,qr="https://quickchart.io/qr?size=500&margin=2&ecLevel=H&text="+encodeURIComponent(url);
 A.innerHTML=tabs("qr")+`<section class="card printSheet"><h1>Scannez ici</h1><p>Confirmez votre livraison Canadel</p><div class="qrbox"><div class="qrwrap"><img class="qr" src="${qr}" alt="QR universel"><img class="qrlogo" src="assets/canadel-logo.jpg" alt=""></div></div><p class="muted">${esc(url)}</p><div class="actions noPrint"><button class="blue" onclick="print()">Imprimer le QR universel</button></div><p><b>Un seul QR pour toutes les boîtes.</b></p></section>`;wire()
}