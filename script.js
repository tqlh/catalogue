let products=[], active="All", lang="en";
const search=document.querySelector("#search"), grid=document.querySelector("#grid"), cats=document.querySelector("#categories"), count=document.querySelector("#count"), empty=document.querySelector("#empty"), modal=document.querySelector("#modal"), modalContent=document.querySelector("#modalContent"), backToTop=document.querySelector("#backToTop"), socialToggle=document.querySelector("#socialToggle"), socialDropdown=document.querySelector("#socialDropdown"), socialMenu=document.querySelector(".socialMenu"), zoomOverlay=document.querySelector("#zoomOverlay"), zoomImg=document.querySelector("#zoomImg");

const copy={
  en:{eyebrow:"MEDICAL BEAUTY PRODUCTS",title:"Product Catalogue",subtitle:"Premium Korean aesthetic products, presented by product line and available format.",search:"Search products…",clickHint:"Click a product to view details",empty:"No products found.",available:"Available formats",packaging:"Packaging",note:"Product information is provided for catalogue and sourcing purposes. Confirm current manufacturer documentation, composition, intended use and regulatory status for the specific product and destination market before use.",productLine:"product line",productLines:"product lines",formats:"formats total",footer:"Korean Aesthetic Products · Global Distribution",connect:"Connect"},
  ru:{eyebrow:"ЭСТЕТИЧЕСКАЯ МЕДИЦИНА",title:"Каталог продукции",subtitle:"Премиальная корейская эстетическая продукция по линейкам и доступным форматам.",search:"Поиск продукции…",clickHint:"Нажмите на продукт, чтобы посмотреть детали",empty:"Ничего не найдено.",available:"Доступные форматы",packaging:"Упаковка",note:"Информация представлена для целей каталога и подбора продукции. Перед применением необходимо подтвердить актуальную документацию производителя, состав, назначение и регистрационный статус конкретного продукта для страны назначения.",productLine:"товарная позиция",productLines:"товарных позиций",formats:"форматов всего",footer:"Корейская эстетическая продукция · Глобальная дистрибуция",connect:"Контакты"}
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
  search.placeholder=t("search"); search.setAttribute("aria-label",t("search"));
  document.querySelectorAll(".lang").forEach(button=>button.classList.toggle("active",button.dataset.lang===lang));
  buildCategories(); render();
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
  modalContent.innerHTML=`<div class="modalGrid"><div class="modalText"><div class="modalCat">${esc(catLabel(product.category))}</div><h2>${esc(product.name)}</h2>${variants}<div class="meta"><strong>${t("packaging")}:</strong> ${esc(localizePack(product.packaging)||"—")}</div><div class="description">${esc(lang==='ru'?(product.infoRu||product.info):product.info)}</div><div class="note">${t("note")}</div></div><div class="modalImage"><img src="images/${slug}.jpg" alt="${esc(product.name)}" onerror="onProductImgError(this,'${slug}')"></div></div>`;
  modal.hidden=false;
  document.body.classList.add("modalOpen");
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
