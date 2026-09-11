import { firebaseConfig } from "./firebase-config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getFirestore, collection, addDoc, doc, getDoc, getDocs, setDoc, updateDoc, serverTimestamp, query, orderBy } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-storage.js";

const appEl=document.querySelector("#app");
const configured=firebaseConfig.apiKey!=="REMPLACER";
let db=null,storage=null;
if(configured){const fb=initializeApp(firebaseConfig);db=getFirestore(fb);storage=getStorage(fb);}

const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
const params=new URLSearchParams(location.search);
const orderParam=params.get("commande");

document.querySelector("#adminBtn").onclick=()=>admin();
if(orderParam) client(orderParam); else home();

function home(){
 appEl.innerHTML=document.querySelector("#homeTpl").innerHTML;
 document.querySelector("#openOrder").onclick=()=>{let c=document.querySelector("#orderCode").value.trim();if(c) location.search="?commande="+encodeURIComponent(c)};
}
function needFirebase(){if(!configured){appEl.innerHTML=`<section class="card"><h2>Configuration Firebase requise</h2><p>Ouvre <b>firebase-config.js</b> et remplace les valeurs REMPlACER par celles de ton projet Firebase.</p></section>`;return false}return true}

async function admin(){
 if(!needFirebase())return;

 // Affiche l'administration immédiatement; Firestore charge ensuite.
 appEl.innerHTML=`<section class="grid">
 <div class="stat"><b id="stTotal">…</b>Commandes</div><div class="stat"><b id="stReceived">…</b>Reçues</div>
 <div class="stat"><b id="stProblems">…</b>Problèmes</div><div class="stat"><b id="stWaiting">…</b>En attente</div></section>
 <section class="card"><h2>Nouvelle commande</h2><div class="grid">
 <label>No commande<input id="n" autocomplete="off"></label><label>Client<input id="c" autocomplete="off"></label><label>Date livraison<input id="d" type="date"></label>
 </div><div class="actions"><button id="create">Créer + générer QR</button></div><p id="createStatus" class="muted"></p><div id="created"></div></section>
 <section class="card"><h2>Commandes</h2><p id="loadStatus" class="muted">Chargement des commandes…</p>
 <div class="tableWrap"><table><thead><tr><th>No</th><th>Client</th><th>Livraison</th><th>Statut</th><th>Satisfaction</th><th></th></tr></thead>
 <tbody id="ordersBody"></tbody></table></div></section>`;

 document.querySelector("#create").onclick=createOrder;

 try{
   const snap=await getDocs(collection(db,"orders"));
   const orders=snap.docs.map(d=>({id:d.id,...d.data()}));
   const received=orders.filter(o=>o.received).length;
   const problems=orders.filter(o=>o.issue&&o.issue!=="Tout est conforme").length;
   document.querySelector("#stTotal").textContent=orders.length;
   document.querySelector("#stReceived").textContent=received;
   document.querySelector("#stProblems").textContent=problems;
   document.querySelector("#stWaiting").textContent=orders.length-received;
   document.querySelector("#loadStatus").textContent="";
   document.querySelector("#ordersBody").innerHTML=orders.map(o=>`<tr><td>${esc(o.number||o.id)}</td><td>${esc(o.client)}</td><td>${esc(o.deliveryDate)}</td><td>${o.received?`<span class="badge ${o.issue==="Tout est conforme"?"green":"red"}">${esc(o.issue)}</span>`:`<span class="badge yellow">En attente</span>`}</td><td>${o.rating?`${o.rating}/5`:"—"}</td><td><button onclick="location.search='?commande=${encodeURIComponent(o.id)}'">Voir</button></td></tr>`).join("");
 }catch(err){
   console.error(err);
   document.querySelector("#loadStatus").innerHTML=`⚠️ Impossible de lire Firestore : <b>${esc(err.code||err.message)}</b>. Vérifie que Firestore Database est créé et que les règles sont publiées.`;
   ["stTotal","stReceived","stProblems","stWaiting"].forEach(id=>document.querySelector("#"+id).textContent="—");
 }
}
async function createOrder(){
 const number=document.querySelector("#n").value.trim(),client=document.querySelector("#c").value.trim(),deliveryDate=document.querySelector("#d").value;
 const status=document.querySelector("#createStatus"),btn=document.querySelector("#create");
 if(!number||!client){status.textContent="⚠️ Numéro de commande et client requis.";return}
 btn.disabled=true; btn.textContent="Création…"; status.textContent="Enregistrement dans Firestore…";
 try{
   const id=crypto.randomUUID();
   await setDoc(doc(db,"orders",id),{number,client,deliveryDate,received:false,createdAt:serverTimestamp()});
   const url=location.origin+location.pathname+"?commande="+encodeURIComponent(id);
   const box=document.querySelector("#created");
   box.innerHTML=`<hr><h3>✅ Commande ${esc(number)} créée</h3><div class="qrbox"><canvas id="qr"></canvas></div><p class="muted">${esc(url)}</p><button id="print">Imprimer</button>`;
   QRCode.toCanvas(document.querySelector("#qr"),url,{width:220},err=>{if(err) console.error(err)});
   document.querySelector("#print").onclick=()=>print();
   status.textContent="Commande enregistrée avec succès.";
 }catch(err){
   console.error(err);
   status.innerHTML=`❌ La commande n'a pas été créée. Erreur Firebase : <b>${esc(err.code||err.message)}</b>.`;
 }finally{
   btn.disabled=false; btn.textContent="Créer + générer QR";
 }
}
async function client(id){
 if(!needFirebase())return;
 const refDoc=doc(db,"orders",id),snap=await getDoc(refDoc);
 if(!snap.exists()){appEl.innerHTML=`<section class="card"><h2>Commande introuvable</h2></section>`;return}
 const o={id,...snap.data()};
 if(o.received){renderResult(o);return}
 let rating=5;
 appEl.innerHTML=`<section class="card"><p class="muted">Commande</p><h2>#${esc(o.number)}</h2><p>${esc(o.client)} • Livraison ${esc(o.deliveryDate||"")}</p></section>
 <section class="card"><h3>Avez-vous reçu votre commande?</h3><label class="choice"><input type="radio" name="received" value="yes" checked> Oui, commande reçue</label><label class="choice"><input type="radio" name="received" value="no"> Non, pas encore reçue</label></section>
 <section class="card"><h3>État de la commande</h3>${["Tout est conforme","Produit endommagé","Produit manquant","Mauvais produit","Autre problème"].map((x,i)=>`<label class="choice"><input type="radio" name="issue" value="${x}" ${i===0?"checked":""}> ${x}</label>`).join("")}</section>
 <section class="card"><h3>Satisfaction</h3><div class="stars">${[1,2,3,4,5].map(n=>`<span class="star on" data-n="${n}">⭐</span>`).join("")}</div><textarea id="comment" rows="4" placeholder="Commentaires (optionnel)"></textarea></section>
 <section class="card"><h3>Photos</h3><input id="photos" type="file" accept="image/*" multiple><div id="previews"></div><div class="actions"><button id="submit" class="success">Confirmer la réception</button></div></section>`;
 document.querySelectorAll(".star").forEach(s=>s.onclick=()=>{rating=+s.dataset.n;document.querySelectorAll(".star").forEach(x=>x.classList.toggle("on",+x.dataset.n<=rating))});
 document.querySelector("#photos").onchange=e=>{document.querySelector("#previews").innerHTML=[...e.target.files].map(f=>`<img class="preview" src="${URL.createObjectURL(f)}">`).join("")};
 document.querySelector("#submit").onclick=async()=>{
   const received=document.querySelector('input[name="received"]:checked').value==="yes";
   const issue=document.querySelector('input[name="issue"]:checked').value;
   const comment=document.querySelector("#comment").value.trim();
   const urls=[];
   for(const f of document.querySelector("#photos").files){const p=ref(storage,`orders/${id}/${crypto.randomUUID()}-${f.name}`);await uploadBytes(p,f);urls.push(await getDownloadURL(p))}
   await updateDoc(refDoc,{received,issue,rating,comment,photos:urls,receivedAt:serverTimestamp()});
   renderResult({...o,received,issue,rating,comment,photos:urls});
 };
}
function renderResult(o){
 appEl.innerHTML=`<section class="card"><h2>${o.received?"✅ Réception enregistrée":"⏳ Réception non confirmée"}</h2><p>Commande #${esc(o.number)} — ${esc(o.client)}</p>
 <p><b>État :</b> ${esc(o.issue||"En attente")}<br><b>Satisfaction :</b> ${o.rating?`${o.rating}/5`:"—"}<br><b>Commentaire :</b> ${esc(o.comment||"—")}</p>
 ${(o.photos||[]).map(u=>`<img class="preview" src="${u}">`).join("")}</section>`;
}
