/* ====== TELEGRAM INQUIRY CONFIG ======
   1. Create a bot via @BotFather in Telegram, copy the token it gives you.
   2. Message your bot once, then open https://api.telegram.org/bot<TOKEN>/getUpdates
      to find your numeric chat id (see the "chat":{"id": ...} field).
   3. Paste both values below between the quotes. Leave as-is to see the
      form running in "demo" mode (it will show an error instead of sending).
*/
const TELEGRAM_BOT_TOKEN = "PASTE_YOUR_BOT_TOKEN_HERE";
const TELEGRAM_CHAT_ID = "PASTE_YOUR_CHAT_ID_HERE";
/* ====================================== */

let products=[], active="All", lang="en";
const search=document.querySelector("#search"), grid=document.querySelector("#grid"), cats=document.querySelector("#categories"), count=document.querySelector("#count"), empty=document.querySelector("#empty"), modal=document.querySelector("#modal"), modalContent=document.querySelector("#modalContent"), backToTop=document.querySelector("#backToTop"), socialToggle=document.querySelector("#socialToggle"), socialDropdown=document.querySelector("#socialDropdown"), socialMenu=document.querySelector(".socialMenu"), zoomOverlay=document.querySelector("#zoomOverlay"), zoomImg=document.querySelector("#zoomImg");

const copy={
  en:{eyebrow:"MEDICAL BEAUTY PRODUCTS",title:"Product Catalogue",subtitle:"Premium Korean aesthetic products, presented by product line and available format.",search:"Search products…",clickHint:"Click a product to view details",empty:"No products found.",available:"Available formats",packaging:"Packaging",note:"Product information is provided for catalogue and sourcing purposes. Confirm current manufacturer documentation, composition, intended use and regulatory status for the specific product and destination market before use.",productLine:"product line",productLines:"product lines",formats:"formats total",footer:"Korean Aesthetic Products · Global Distribution",connect:"Connect",followLabel:"Follow",chatLabel:"Chat with us",channelLabel:"Channel · t.me/doublej_holdings",msgLabel:"Send a message",
    addToQuote:"Add to Quote List",removeFromQuote:"Remove from Quote List",quoteBtn:"Quote List",inquiryEyebrow:"GET IN TOUCH",inquiryTitle:"Your Quote Request",inquirySub:"Add products as you browse, then leave your details below.",fieldName:"Name",fieldPhone:"Phone",fieldEmail:"Email",fieldProduct:"Product",fieldMessage:"Message",fieldMessagePh:"Quantities, timeline, destination market…",inquiryHint:"Please provide either a phone number or an email so we can reach you.",inquirySend:"Send Inquiry",inquirySending:"Sending…",inquirySent:"Thank you — your inquiry has been sent. We'll contact you shortly.",inquiryErrNoContact:"Please add a phone number or email.",inquiryErrName:"Please enter your name.",inquiryErrSend:"Something went wrong. Please try WhatsApp or Telegram instead — links are in Connect, top right.",quoteListLabel:"Products",quoteListEmpty:"No products added yet — browse the catalogue and tap \"Add to Quote List\", or just send a general inquiry below.",removeItem:"Remove"},
  ru:{eyebrow:"ЭСТЕТИЧЕСКАЯ МЕДИЦИНА",title:"Каталог продукции",subtitle:"Премиальная корейская эстетическая продукция по линейкам и доступным форматам.",search:"Поиск продукции…",clickHint:"Нажмите на продукт, чтобы посмотреть детали",empty:"Ничего не найдено.",available:"Доступные форматы",packaging:"Упаковка",note:"Информация представлена для целей каталога и подбора продукции. Перед применением необходимо подтвердить актуальную документацию производителя, состав, назначение и регистрационный статус конкретного продукта для страны назначения.",productLine:"товарная позиция",productLines:"товарных позиций",formats:"форматов всего",footer:"Корейская эстетическая продукция · Глобальная дистрибуция",connect:"Контакты",followLabel:"Мы в соцсетях",chatLabel:"Написать нам",channelLabel:"Канал · t.me/doublej_holdings",msgLabel:"Написать сообщение",
    addToQuote:"Добавить в список запроса",removeFromQuote:"Убрать из списка",quoteBtn:"Список запроса",inquiryEyebrow:"СВЯЗАТЬСЯ С НАМИ",inquiryTitle:"Ваш запрос",inquirySub:"Добавляйте товары по мере просмотра, затем оставьте свои данные ниже.",fieldName:"Имя",fieldPhone:"Телефон",fieldEmail:"Email",fieldProduct:"Продукт",fieldMessage:"Сообщение",fieldMessagePh:"Количество, сроки, страна назначения…",inquiryHint:"Укажите телефон или email, чтобы мы могли с вами связаться.",inquirySend:"Отправить запрос",inquirySending:"Отправка…",inquirySent:"Спасибо — ваш запрос отправлен. Мы скоро с вами свяжемся.",inquiryErrNoContact:"Пожалуйста, укажите телефон или email.",inquiryErrName:"Пожалуйста, укажите ваше имя.",inquiryErrSend:"Что-то пошло не так. Попробуйте написать в WhatsApp или Telegram — ссылки в разделе «Контакты» вверху справа.",quoteListLabel:"Товары",quoteListEmpty:"Пока ничего не добавлено — просматривайте каталог и нажимайте «Добавить в список запроса», либо отправьте общий запрос ниже.",removeItem:"Убрать"}
};
const catRu={"FILLER":"ФИЛЛЕРЫ","BODY FILLER":"ФИЛЛЕРЫ ДЛЯ ТЕЛА","PDRN / PN":"PDRN / PN","EXOSOME":"ЭКЗОСОМЫ","HA / HYDRATION":"ГА / УВЛАЖНЕНИЕ","COLLAGEN / REPAIR":"КОЛЛАГЕН / ВОССТАНОВЛЕНИЕ","COLLAGEN STIMULATORS / REGENERATIVE":"СТИМУЛЯТОРЫ КОЛЛАГЕНА / РЕГЕНЕРАЦИЯ","NUMBING CREAM":"АНЕСТЕЗИРУЮЩИЕ КРЕМЫ","INJECTIONS / SOLUTIONS":"ИНЪЕКЦИИ / РАСТВОРЫ","TOXINS":"ТОКСИНЫ","LIPOLYTIC":"ЛИПОЛИТИКИ"};
function t(key){return copy[lang][key]||key}
function catLabel(category){return lang==='ru'?(catRu[category]||category):category}
function esc(value){return String(value??"").replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[char]))}
function localizePack(value){
  if(lang!=="ru")return value||"";
  const forms={vial:["флакон","флакона","флаконов"],syringe:["шприц","шприца","шприцев"],tube:["туба","тубы","туб"],set:["комплект","комплекта","комплектов"],ampoule:["ампула","ампулы","ампул"]};
  return String(value||"").replace(/(\d+)\s*(vials?|syringes?|tubes?|sets?|ampoules?)/gi,(_,number,unit)=>{
    const key=unit.toLowerCase().replace(/s$/,""); const formsForUnit=forms[key]; const n=Number(number), lastTwo=n%100,last=n%10;
    const index=lastTwo>10&&lastTwo<20?2:last===1?0:last>1&&last<5?1:2;
    return `${number} ${formsForUnit[index]}`;
  });
}
function buildCategories(){
  const categories=["All",...new Set(products.map(product=>product.category).filter(Boolean))];
  cats.innerHTML=categories.map(category=>`<button class="cat ${category===active?"active":""}" data-cat="${esc(category)}">${category==="All"?(lang==='ru'?"Все":"All"):esc(catLabel(category))}</button>`).join("");
}
const SEARCH_SYNONYMS=[
  [/\bPDRN\b/i, "пдрн полинуклеотид полинуклеотидов"],
  [/\bPN\b/i, "пдрн полинуклеотид"],
  [/\bPCL\b/i, "поликапролактон полипролактон полипролактона"],
  [/\bPLLA\b/i, "полимолочная кислота плла"],
  [/\bPDLLA\b/i, "полимолочная кислота пдлла"],
  [/\bHA\b/i, "гиалуроновая кислота гиалуроновой"],
];
function buildSearchBlob(product){
  const base=`${product.name} ${product.search} ${product.packaging} ${product.category} ${product.variants.join(" ")} ${product.info||""} ${product.infoRu||""}`;
  let extra="";
  SEARCH_SYNONYMS.forEach(([pattern,terms])=>{ if(pattern.test(base)) extra+=" "+terms; });
  return (base+extra).toLowerCase();
}
function render(){
  const query=search.value.trim().toLowerCase();
  const filtered=products.map((product,index)=>({product,index})).filter(({product})=>(active==="All"||product.category===active)&&(!query||(product._searchBlob||(product._searchBlob=buildSearchBlob(product))).includes(query)));
  const formats=products.reduce((total,product)=>total+(product.variants?.length||1),0);
  count.innerHTML=`<strong>${filtered.length}</strong> ${filtered.length===1?t("productLine"):t("productLines")} <span>· ${formats} ${t("formats")}</span>`;
  empty.hidden=filtered.length>0;
  grid.innerHTML=filtered.map(({product,index})=>{
    const variants=product.variants?.length?`<div class="cardVariants">${product.variants.map(variant=>`<span>${esc(variant)}</span>`).join("")}</div>`:"";
    return `<article class="card" data-i="${index}"><div class="cardTop"><div class="category">${esc(catLabel(product.category||"Product"))}</div><span class="cardArrow" aria-hidden="true">↗</span></div><div class="name">${esc(product.name)}</div>${variants}<div class="pack">${esc(localizePack(product.packaging))}</div></article>`;
  }).join("");
}
function applyLang(){
  document.documentElement.lang=lang;
  document.querySelectorAll("[data-i18n]").forEach(element=>element.textContent=t(element.dataset.i18n));
  document.querySelectorAll("[data-i18n-placeholder]").forEach(element=>element.placeholder=t(element.dataset.i18nPlaceholder));
  search.placeholder=t("search"); search.setAttribute("aria-label",t("search"));
  document.querySelectorAll(".lang").forEach(button=>button.classList.toggle("active",button.dataset.lang===lang));
  buildCategories(); render();
  if(!modal.hidden)refreshProductModalBtn();
  if(inquiryModal.classList.contains("open"))renderQuoteList();
}
function close(){modal.hidden=true;document.body.classList.remove("modalOpen")}
fetch("products.json").then(response=>response.json()).then(data=>{products=data;buildCategories();render()});
cats.addEventListener("click",event=>{if(!event.target.matches(".cat"))return;active=event.target.dataset.cat;buildCategories();render()});
search.addEventListener("input",render);
document.querySelectorAll(".lang").forEach(button=>button.addEventListener("click",()=>{lang=button.dataset.lang;applyLang()}));
function slugify(name){return name.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-+|-+$)/g,"")}
function onProductImgError(img,slug){
  if(img.dataset.step==="png"){img.closest(".modalImage").classList.add("noImage");img.remove();return}
  img.dataset.step="png";img.src=`images/${slug}.png`;
}
grid.addEventListener("click",event=>{
  const card=event.target.closest(".card"); if(!card)return;
  const product=products[+card.dataset.i];
  const variants=product.variants?.length?`<div class="variantBlock"><div class="variantLabel">${t("available")}</div><div class="variants">${product.variants.map(variant=>`<span>${esc(variant)}</span>`).join("")}</div></div>`:"";
  const slug=product.image||slugify(product.name);
  modalContent.innerHTML=`<div class="modalGrid"><div class="modalText"><div class="modalCat">${esc(catLabel(product.category))}</div><h2>${esc(product.name)}</h2>${variants}<div class="meta"><strong>${t("packaging")}:</strong> ${esc(localizePack(product.packaging)||"—")}</div><div class="description">${esc(lang==='ru'?(product.infoRu||product.info):product.info)}</div>${quoteToggleBtnHtml(product.name)}<div class="note">${t("note")}</div></div><div class="modalImage"><img src="images/${slug}.jpg" alt="${esc(product.name)}" onerror="onProductImgError(this,'${slug}')"></div></div>`;
  modal.hidden=false;
  document.body.classList.add("modalOpen");
});
modalContent.addEventListener("click",event=>{
  const btn=event.target.closest(".inquireProductBtn");
  if(btn)toggleQuoteItem(btn.dataset.product,btn);
});
document.querySelector(".backdrop").addEventListener("click",close);
document.querySelector("#close").addEventListener("click",close);
function closeSocial(){socialMenu.classList.remove("open");socialDropdown.hidden=true;socialToggle.setAttribute("aria-expanded","false")}
function openZoom(src,alt){zoomImg.src=src;zoomImg.alt=alt;zoomOverlay.hidden=false}
function closeZoom(){zoomOverlay.hidden=true;zoomImg.src=""}
modalContent.addEventListener("click",event=>{
  const img=event.target.closest(".modalImage img");
  if(img)openZoom(img.src,img.alt);
});
zoomOverlay.addEventListener("click",closeZoom);
socialToggle.addEventListener("click",event=>{
  event.stopPropagation();
  const isOpen=socialMenu.classList.toggle("open");
  socialDropdown.hidden=!isOpen;
  socialToggle.setAttribute("aria-expanded",String(isOpen));
});
document.addEventListener("click",event=>{if(!socialMenu.contains(event.target))closeSocial()});
document.addEventListener("keydown",event=>{if(event.key==="Escape"){closeZoom();close();closeSocial()}});
function updateScrollState(){document.body.classList.toggle("scrolled",window.scrollY>86);backToTop.classList.toggle("visible",window.scrollY>500)}
window.addEventListener("scroll",updateScrollState,{passive:true});
backToTop.addEventListener("click",()=>window.scrollTo({top:0,behavior:"smooth"}));
updateScrollState();

/* ====== Quote list + inquiry drawer (sends to Telegram) ====== */
let quoteItems=[]; // array of product name strings
const inquiryModal=document.querySelector("#inquiryModal"), inquiryForm=document.querySelector("#inquiryForm"), inquiryStatus=document.querySelector("#inquiryStatus"), inquirySubmit=document.querySelector("#inquirySubmit"), quoteBtn=document.querySelector("#quoteBtn"), quoteBadge=document.querySelector("#quoteBadge"), inquiryClose=document.querySelector("#inquiryClose"), quoteListItems=document.querySelector("#quoteListItems"), quoteListEmpty=document.querySelector("#quoteListEmpty");

function quoteToggleBtnHtml(productName){
  const inList=quoteItems.includes(productName);
  return `<button type="button" class="inquireProductBtn ${inList?"inList":""}" data-product="${esc(productName)}">${inList?t("removeFromQuote"):t("addToQuote")}</button>`;
}
function refreshProductModalBtn(){
  const btn=modalContent.querySelector(".inquireProductBtn");
  if(btn){
    const inList=quoteItems.includes(btn.dataset.product);
    btn.textContent=inList?t("removeFromQuote"):t("addToQuote");
    btn.classList.toggle("inList",inList);
  }
}
function renderQuoteList(){
  quoteListItems.innerHTML=quoteItems.map(name=>`<li><span>${esc(name)}</span><button type="button" class="quoteRemove" data-product="${esc(name)}" aria-label="${t("removeItem")}">×</button></li>`).join("");
  quoteListEmpty.hidden=quoteItems.length>0;
  quoteBadge.hidden=quoteItems.length===0;
  quoteBadge.textContent=quoteItems.length;
}
function toggleQuoteItem(productName,btn){
  const i=quoteItems.indexOf(productName);
  if(i===-1)quoteItems.push(productName); else quoteItems.splice(i,1);
  renderQuoteList();
  if(btn)refreshProductModalBtn();
}
quoteListItems.addEventListener("click",event=>{
  const btn=event.target.closest(".quoteRemove");
  if(!btn)return;
  toggleQuoteItem(btn.dataset.product);
  refreshProductModalBtn();
});

function openInquiry(){
  inquiryStatus.textContent="";
  inquiryStatus.className="inquiryStatus";
  renderQuoteList();
  inquiryModal.classList.add("open");
  setTimeout(()=>document.querySelector("#inquiryName").focus(),300);
}
function closeInquiry(){
  inquiryModal.classList.remove("open");
}
quoteBtn.addEventListener("click",()=>{
  inquiryModal.classList.contains("open")?closeInquiry():openInquiry();
});
inquiryClose.addEventListener("click",closeInquiry);
document.addEventListener("keydown",event=>{if(event.key==="Escape"&&inquiryModal.classList.contains("open"))closeInquiry()});

async function sendToTelegram(text){
  const url=`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const response=await fetch(url,{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({chat_id:TELEGRAM_CHAT_ID,text,parse_mode:"HTML"})
  });
  if(!response.ok)throw new Error("Telegram API error");
  return response.json();
}

inquiryForm.addEventListener("submit",async event=>{
  event.preventDefault();
  const name=document.querySelector("#inquiryName").value.trim();
  const phone=document.querySelector("#inquiryPhone").value.trim();
  const email=document.querySelector("#inquiryEmail").value.trim();
  const message=document.querySelector("#inquiryMessage").value.trim();

  if(!name){inquiryStatus.textContent=t("inquiryErrName");inquiryStatus.className="inquiryStatus err";return}
  if(!phone&&!email){inquiryStatus.textContent=t("inquiryErrNoContact");inquiryStatus.className="inquiryStatus err";return}

  inquirySubmit.disabled=true;
  inquirySubmit.querySelector("span").textContent=t("inquirySending");
  inquiryStatus.textContent="";
  inquiryStatus.className="inquiryStatus";

  const lines=[
    "🌸 <b>New catalogue inquiry</b>",
    `<b>Name:</b> ${esc(name)}`,
    phone?`<b>Phone:</b> ${esc(phone)}`:null,
    email?`<b>Email:</b> ${esc(email)}`:null,
    quoteItems.length?`<b>Products:</b>\n${quoteItems.map(p=>"• "+esc(p)).join("\n")}`:null,
    message?`<b>Message:</b> ${esc(message)}`:null,
    `<b>Language:</b> ${lang.toUpperCase()}`
  ].filter(Boolean).join("\n");

  try{
    await sendToTelegram(lines);
    inquiryForm.reset();
    quoteItems=[];
    renderQuoteList();
    inquiryStatus.textContent=t("inquirySent");
    inquiryStatus.className="inquiryStatus ok";
    setTimeout(closeInquiry,2200);
  }catch(error){
    inquiryStatus.textContent=t("inquiryErrSend");
    inquiryStatus.className="inquiryStatus err";
  }finally{
    inquirySubmit.disabled=false;
    inquirySubmit.querySelector("span").textContent=t("inquirySend");
  }
});
renderQuoteList();
