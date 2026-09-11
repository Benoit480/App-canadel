import {firebaseConfig} from "./firebase-config.js";
import {initializeApp} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import {getFirestore,collection,doc,getDoc,getDocs,setDoc,updateDoc,serverTimestamp} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const fb=initializeApp(firebaseConfig),db=getFirestore(fb),A=document.querySelector("#app");
const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
const fmt=t=>t?.toDate?t.toDate().toLocaleString("fr-CA"):"—";
const q=new URLSearchParams(location.search),orderId=q.get("commande");
document.querySelector("#home").onclick=()=>{history.replaceState({},'',location.pathname);admin("dashboard")};
if(orderId) client(orderId); else admin("dashboard");

async function allOrders(){const s=await getDocs(collection(db,"orders"));return s.docs.map(d=>({id:d.id,...d.data()}))}
function tabs(active){return `<div class="tabs noPrint">${["dashboard|Tableau de bord","orders|Commandes","new|Nouvelle commande","claims|Réclamations","stats|Statistiques"].map(x=>{let[a,b]=x.split("|");return `<button data-tab="${a}" class="${active===a?"active":""}">${b}</button>`}).join("")}</div>`}
function wireTabs(){document.querySelectorAll("[data-tab]").forEach(b=>b.onclick=()=>admin(b.dataset.tab))}
async function admin(view){
 A.innerHTML=tabs(view)+`<section class="card"><p class="muted">Chargement…</p></section>`;wireTabs();
 try{
  const o=await allOrders(); if(view==="dashboard") dashboard(o); if(view==="orders") orders(o); if(view==="new") newOrder(); if(view==="claims") claims(o); if(view==="stats") stats(o); wireTabs();
 }catch(e){A.innerHTML=tabs(view)+`<section class="card"><p class="error">Erreur Firebase : ${esc(e.code||e.message)}</p></section>`;wireTabs()}
}
function dashboard(o){
 const received=o.filter(x=>x.received),problems=o.filter(x=>x.issue&&x.issue!=="Tout est conforme"),waiting=o.filter(x=>!x.received);
 A.innerHTML=tabs("dashboard")+`<section class="stats"><div class="stat"><b>${o.length}</b>Commandes</div><div class="stat"><b>${received.length}</b>Reçues</div><div class="stat"><b>${problems.length}</b>Problèmes</div><div class="stat"><b>${waiting.length}</b>En attente</div></section>
 <section class="card"><h2>Dernières commandes</h2>${table(o.slice(-10).reverse())}</section>`;wireTabs()
}
function table(o){return `<div class="tablewrap"><table><thead><tr><th>No</th><th>Client</th><th>Livraison</th><th>Statut</th><th>Note</th><th></th></tr></thead><tbody>${o.map(x=>`<tr><td>${esc(x.number)}</td><td>${esc(x.client)}</td><td>${esc(x.deliveryDate)}</td><td>${!x.received?`<span class="badge byellow">En attente</span>`:x.issue==="Tout est conforme"?`<span class="badge bgreen">Conforme</span>`:`<span class="badge bred">${esc(x.issue)}</span>`}</td><td>${x.rating?`${x.rating}/5`:"—"}</td><td><button class="secondary" onclick="location.search='?commande=${encodeURIComponent(x.id)}&admin=1'">Voir</button></td></tr>`).join("")}</tbody></table></div>`}
function orders(o){A.innerHTML=tabs("orders")+`<section class="card"><h2>Toutes les commandes</h2>${table(o.reverse())}</section>`;wireTabs()}
function newOrder(){
 A.innerHTML=tabs("new")+`<section class="card"><h2>Nouvelle commande</h2><div class="grid"><label>No commande<input id="num"></label><label>Client<input id="cl"></label><label>Date livraison<input id="date" type="date"></label><label>Référence / PO<input id="po"></label></div><label style="margin-top:12px">Description / articles<textarea id="items" placeholder="Ex.: 4 panneaux, 2 moulures…"></textarea></label><div class="actions"><button id="create">Créer la commande + QR</button></div><p id="msg"></p><div id="made"></div></section>`;wireTabs();
 create.onclick=async()=>{if(!num.value.trim()||!cl.value.trim()){msg.textContent="Numéro et client requis.";return}create.disabled=true;msg.textContent="Création…";try{let id=crypto.randomUUID();await setDoc(doc(db,"orders",id),{number:num.value.trim(),client:cl.value.trim(),deliveryDate:date.value,po:po.value.trim(),items:items.value.trim(),received:false,claimStatus:"",createdAt:serverTimestamp()});let url=location.origin+location.pathname+"?commande="+encodeURIComponent(id),qr="https://quickchart.io/qr?size=300&text="+encodeURIComponent(url);made.innerHTML=`<hr><h3 class="ok">✅ Commande créée</h3><div class="qrbox"><img src="${qr}"></div><p class="muted">${esc(url)}</p><div class="actions"><button onclick="print()">Imprimer QR</button><button class="secondary" onclick="location.search='?commande=${id}&admin=1'">Voir la fiche</button></div>`;msg.textContent="";}catch(e){msg.className="error";msg.textContent=e.code||e.message}finally{create.disabled=false}}
}
function claims(o){let c=o.filter(x=>x.issue&&x.issue!=="Tout est conforme");A.innerHTML=tabs("claims")+`<section class="card"><h2>Réclamations</h2>${c.length?table(c):'<p class="muted">Aucune réclamation.</p>'}</section>`;wireTabs()}
function stats(o){let r=o.filter(x=>x.received),avg=r.length?(r.reduce((a,x)=>a+(+x.rating||0),0)/r.length).toFixed(1):"—",p=o.filter(x=>x.issue&&x.issue!=="Tout est conforme").length;A.innerHTML=tabs("stats")+`<section class="stats"><div class="stat"><b>${o.length?Math.round(r.length/o.length*100):0}%</b>Réceptions confirmées</div><div class="stat"><b>${avg}</b>Note moyenne /5</div><div class="stat"><b>${p}</b>Commandes avec problème</div><div class="stat"><b>${r.length?Math.round(p/r.length*100):0}%</b>Taux de problème</div></section>`;wireTabs()}

async function client(id){
 try{
  const s=await getDoc(doc(db,"orders",id));if(!s.exists())throw Error("Commande introuvable");let o={id,...s.data()},isAdmin=q.get("admin")==="1";
  if(isAdmin){adminDetail(o);return}
  if(o.received){A.innerHTML=`<section class="card hero"><h1>✅ Merci!</h1><p>La réception de la commande <b>#${esc(o.number)}</b> a déjà été enregistrée.</p><p class="muted">${esc(o.client)}</p></section>`;return}
  let rating=5;
  A.innerHTML=`<section class="card hero"><p class="muted">CONFIRMATION DE LIVRAISON</p><h1>Commande #${esc(o.number)}</h1><p>${esc(o.client)}</p>${o.items?`<p class="muted">${esc(o.items)}</p>`:""}</section>
  <section class="card"><h2>État de votre commande</h2>${["Tout est conforme","Produit endommagé","Produit manquant","Mauvais produit","Autre problème"].map((x,i)=>`<label class="choice"><input type="radio" name="issue" value="${x}" ${i===0?"checked":""}>${x}</label>`).join("")}</section>
  <section class="card"><h2>Votre satisfaction</h2><div class="stars">${[1,2,3,4,5].map(n=>`<span class="star on" data-n="${n}">⭐</span>`).join("")}</div><label>Commentaire<textarea id="comment" placeholder="Comment s'est passée votre livraison?"></textarea></label></section>
  <section class="card problemBox"><h2>En cas de problème</h2><div class="grid"><label>Article concerné<input id="problemItem" placeholder="Nom ou numéro d'article"></label><label>Quantité<input id="qty" type="number" min="1"></label></div><label style="margin-top:12px">Description du problème<textarea id="problemDesc"></textarea></label><p class="muted">Les photos seront ajoutées dès l'activation de Firebase Storage.</p></section>
  <section class="card"><button id="confirm" class="success">✓ Confirmer la réception</button><p id="cm"></p></section>`;
  document.querySelectorAll(".star").forEach(x=>x.addEventListener("click",()=>{rating=+x.dataset.n;document.querySelectorAll(".star").forEach(y=>y.classList.toggle("on",+y.dataset.n<=rating))}));
  const confirmBtn=document.getElementById("confirm");
  const messageEl=document.getElementById("cm");
  confirmBtn.addEventListener("click",async()=>{
    confirmBtn.disabled=true;
    confirmBtn.textContent="Enregistrement…";
    messageEl.className="muted";
    messageEl.textContent="Enregistrement de votre réception…";
    try{
      const selectedIssue=document.querySelector('input[name="issue"]:checked');
      if(!selectedIssue) throw new Error("Veuillez sélectionner l’état de la commande.");
      const issueValue=selectedIssue.value;
      const commentEl=document.getElementById("comment");
      const problemItemEl=document.getElementById("problemItem");
      const qtyEl=document.getElementById("qty");
      const problemDescEl=document.getElementById("problemDesc");
      await updateDoc(doc(db,"orders",id),{
        received:true, issue:issueValue, rating,
        comment:commentEl?.value.trim()||"",
        problemItem:problemItemEl?.value.trim()||"",
        problemQty:qtyEl?.value ? Number(qtyEl.value) : null,
        problemDescription:problemDescEl?.value.trim()||"",
        claimStatus:issueValue==="Tout est conforme" ? "" : "Nouvelle",
        receivedAt:serverTimestamp()
      });
      A.innerHTML=`<section class="card hero"><h1>✅ Réception confirmée</h1><p>Merci! Votre réception a été enregistrée avec succès.</p><p>Commande #${esc(o.number)}</p></section>`;
    }catch(err){
      console.error(err);
      confirmBtn.disabled=false;
      confirmBtn.textContent="✓ Confirmer la réception";
      messageEl.className="error";
      messageEl.textContent="❌ Impossible de confirmer : "+(err.code||err.message);
    }
  });
 }catch(e){A.innerHTML=`<section class="card"><h2>Erreur</h2><p>${esc(e.message)}</p></section>`}
}
function adminDetail(o){
 let url=location.origin+location.pathname+"?commande="+encodeURIComponent(o.id),qr="https://quickchart.io/qr?size=300&text="+encodeURIComponent(url);
 A.innerHTML=`<section class="card"><div class="actions noPrint"><button onclick="location.href=location.pathname">← Administration</button><button class="secondary" onclick="print()">Imprimer</button></div><h1>Commande #${esc(o.number)}</h1><div class="grid"><p><b>Client</b><br>${esc(o.client)}</p><p><b>Livraison</b><br>${esc(o.deliveryDate)}</p><p><b>PO</b><br>${esc(o.po||"—")}</p><p><b>Réception</b><br>${o.received?"Confirmée":"En attente"}</p></div>${o.items?`<p><b>Articles</b><br>${esc(o.items)}</p>`:""}<hr><div class="qrbox"><img src="${qr}"></div><p class="muted">${esc(url)}</p></section>
 ${o.received?`<section class="card ${o.issue==="Tout est conforme"?"":"problemBox"}"><h2>Réponse du client</h2><p><b>État :</b> ${esc(o.issue)}</p><p><b>Satisfaction :</b> ${o.rating}/5</p><p><b>Reçu le :</b> ${fmt(o.receivedAt)}</p><p><b>Commentaire :</b> ${esc(o.comment||"—")}</p>${o.issue!=="Tout est conforme"?`<p><b>Article :</b> ${esc(o.problemItem||"—")} &nbsp; <b>Qté :</b> ${esc(o.problemQty||"—")}</p><p><b>Description :</b> ${esc(o.problemDescription||"—")}</p><label>Statut réclamation<select id="claim"><option>Nouvelle</option><option>En traitement</option><option>Réglée</option></select></label><div class="actions"><button id="saveClaim">Enregistrer statut</button></div>`:""}</section>`:""}`;
 if(o.received&&o.issue!=="Tout est conforme"){claim.value=o.claimStatus||"Nouvelle";saveClaim.onclick=async()=>{await updateDoc(doc(db,"orders",o.id),{claimStatus:claim.value});saveClaim.textContent="✓ Enregistré"}}
}