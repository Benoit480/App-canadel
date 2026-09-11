import {firebaseConfig} from "./firebase-config.js";
import {initializeApp} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import {getFirestore,collection,doc,getDoc,getDocs,setDoc,updateDoc,serverTimestamp} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const fb=initializeApp(firebaseConfig),db=getFirestore(fb),A=document.querySelector("#app");
const e=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
document.querySelector("#adminBtn").onclick=admin;
const id=new URLSearchParams(location.search).get("commande"); if(id) client(id); else admin();

async function admin(){
 A.innerHTML=`<section class="grid"><div class="stat"><b id="t">…</b>Commandes</div><div class="stat"><b id="r">…</b>Reçues</div><div class="stat"><b id="p">…</b>Problèmes</div><div class="stat"><b id="w">…</b>En attente</div></section>
 <section class="card"><h2>Nouvelle commande</h2><div class="grid"><label>No commande<input id="n"></label><label>Client<input id="c"></label><label>Date livraison<input id="d" type="date"></label></div><div class="actions"><button id="create">Créer + générer QR</button></div><p id="msg"></p><div id="result"></div></section>
 <section class="card"><h2>Commandes</h2><div class="table"><table><thead><tr><th>No</th><th>Client</th><th>Livraison</th><th>Statut</th></tr></thead><tbody id="rows"></tbody></table></div></section>`;
 document.querySelector("#create").onclick=create;
 await refresh();
}
async function refresh(){
 try{const s=await getDocs(collection(db,"orders")),o=s.docs.map(x=>({id:x.id,...x.data()})),r=o.filter(x=>x.received).length,p=o.filter(x=>x.issue&&x.issue!=="Tout est conforme").length;
 t.textContent=o.length;document.querySelector("#r").textContent=r;document.querySelector("#p").textContent=p;w.textContent=o.length-r;
 rows.innerHTML=o.map(x=>`<tr><td><a style="color:#6fb4ff" href="?commande=${encodeURIComponent(x.id)}">${e(x.number)}</a></td><td>${e(x.client)}</td><td>${e(x.deliveryDate)}</td><td>${x.received?e(x.issue||"Reçue"):"En attente"}</td></tr>`).join("");
 }catch(x){msg.className="error";msg.textContent="Erreur Firestore : "+(x.code||x.message)}
}
async function create(){
 const number=n.value.trim(),clientName=c.value.trim(),date=d.value,msg=document.querySelector("#msg"),btn=document.querySelector("#create");
 if(!number||!clientName){msg.textContent="Numéro et client requis.";return}
 btn.disabled=true;msg.className="muted";msg.textContent="Création…";
 try{
  const oid=crypto.randomUUID(); await setDoc(doc(db,"orders",oid),{number,client:clientName,deliveryDate:date,received:false,createdAt:serverTimestamp()});
  const url=location.origin+location.pathname+"?commande="+encodeURIComponent(oid);
  // QR rendered by a direct image endpoint: no global QRCode JS variable, fixing Safari error.
  const qr="https://quickchart.io/qr?size=300&text="+encodeURIComponent(url);
  result.innerHTML=`<hr><h3>✅ Commande ${e(number)} créée</h3><div class="qrbox"><img alt="QR de la commande" src="${qr}"></div><p class="muted">${e(url)}</p><button id="printBtn">Imprimer</button>`;
  document.querySelector("#printBtn").onclick=()=>print(); msg.className="ok";msg.textContent="Commande enregistrée avec succès."; await refresh();
 }catch(x){msg.className="error";msg.textContent="❌ Erreur : "+(x.code||x.message)}
 finally{btn.disabled=false}
}
async function client(oid){
 try{const s=await getDoc(doc(db,"orders",oid));if(!s.exists())throw new Error("Commande introuvable");const o=s.data();
 A.innerHTML=`<section class="card"><h2>Commande #${e(o.number)}</h2><p>${e(o.client)}</p>${o.received?`<h3>✅ Réception déjà enregistrée</h3>`:`<h3>Confirmer la réception</h3><label>État<select id="issue" style="width:100%;padding:14px;border-radius:10px"><option>Tout est conforme</option><option>Produit endommagé</option><option>Produit manquant</option><option>Mauvais produit</option><option>Autre problème</option></select></label><label style="margin-top:14px">Satisfaction (1 à 5)<input id="rating" type="number" min="1" max="5" value="5"></label><label style="margin-top:14px">Commentaire<textarea id="comment"></textarea></label><div class="actions"><button id="confirm">Confirmer la réception</button></div><p id="cm"></p>`}</section>`;
 if(!o.received)confirm.onclick=async()=>{try{await updateDoc(doc(db,"orders",oid),{received:true,issue:issue.value,rating:+rating.value,comment:comment.value,receivedAt:serverTimestamp()});cm.className="ok";cm.textContent="✅ Réception enregistrée.";confirm.disabled=true}catch(x){cm.className="error";cm.textContent=x.code||x.message}};
 }catch(x){A.innerHTML=`<section class="card"><h2>Erreur</h2><p>${e(x.message)}</p></section>`}
}