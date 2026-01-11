// Story Frames i18n (shared for all pages)
const I18N = {
  en: {
    tagline: "Crafting stories from photos",
    nav_products: "Products",
    nav_gallery: "Gallery",
    nav_service: "Service",
    nav_home: "Home",

    hero_title: "Personalized gifts that come to life.",
    hero_text: "Send us a photo — we transform it into a short video and embed it into your chosen product. A moving memory that feels premium, personal, and unforgettable.",
    cta_products: "View products",
    cta_email: "Order by email",
    cta_fb: "Message on Facebook",

    how_title: "How ordering works",
    how_1: "You send us your photo (even an old paper photo).",
    how_2: "We turn it into a short “magic” video story.",
    how_3: "We deliver it inside your selected product.",

    products_title: "Products",
    p1_title: "Video Ball",
    p1_desc: "A modern spherical display with your animated memory inside.",
    p2_title: "Premium Frame",
    p2_desc: "A clean, premium digital frame for memories that deserve a spotlight.",
    p3_title: "Digital Greeting Card",
    p3_desc: "A stylish digital card with your story and your music.",

    pay_physical: "PayPal (card) • Bulgaria COD",
    pay_digital: "PayPal (card) • Instant delivery",
    open_details: "Open details →",

    gallery_title: "Gallery",
    gallery_hint: "Click any photo to view it bigger.",

    service_title: "Service",
    about_title: "STORY FRAMES — The most innovative gift",
    about_text: "Bring memories to life: every photo becomes a short video. We offer digital frames for your memories and digital invitation / greeting cards. Warm someone’s heart with a moving memory. Message us to order. ✨",

    why_title: "Why choose a digital card?",
    why_1: "✨ <b>Living memories:</b> we transform even an old paper photo into a short video story.",
    why_2: "🎁 <b>A gift that impresses:</b> perfect for birthdays, anniversaries, holidays — or “just because”.",
    why_3: "🎵 <b>Your personal soundtrack:</b> add the song that matters to you.",
    why_4: "📱 <b>Stylish & lasting:</b> compact, easy to keep, and brings a smile every time.",
    why_5: "💖 <b>Fully personalized:</b> designed for your unique story.",
    quote: "“Flowers fade, chocolates get eaten — but the feeling you share stays forever.”",

    // product page keys
    back_home: "Back to home",
    buy_paypal: "Pay with PayPal",
    buy_cod: "Bulgaria COD",
    details_title: "Details",
    what_you_get: "<b>What you get:</b><br>• Your photo becomes a short “magic” video story<br>• Personal, emotional, premium gift<br>• Perfect for birthdays, anniversaries, surprises"
  },

  bg: {
    tagline: "Оживяваме спомените от снимки",
    nav_products: "Продукти",
    nav_gallery: "Галерия",
    nav_service: "Услуга",
    nav_home: "Начало",

    hero_title: "Персонализирани подаръци, които оживяват.",
    hero_text: "Изпратете ни снимка — ние я превръщаме в кратко видео и я вграждаме в избрания от вас продукт. Движещ се спомен, който е личен, стилен и незабравим.",
    cta_products: "Виж продуктите",
    cta_email: "Поръчай по имейл",
    cta_fb: "Пиши ни във Facebook",

    how_title: "Как става поръчката",
    how_1: "Изпращате ни снимка (дори стара хартиена снимка).",
    how_2: "Превръщаме я в „магическо“ кратко видео.",
    how_3: "Доставяме я в избрания от вас продукт.",

    products_title: "Продукти",
    p1_title: "Видео Сфера",
    p1_desc: "Модерна сфера с твоя оживял спомен вътре.",
    p2_title: "Премиум Рамка",
    p2_desc: "Стилна дигитална рамка за спомени, които заслужават внимание.",
    p3_title: "Дигитална Картичка",
    p3_desc: "Модерна дигитална картичка с твоята история и музика.",

    pay_physical: "PayPal (карта) • България: наложен платеж",
    pay_digital: "PayPal (карта) • Моментна доставка",
    open_details: "Виж детайли →",

    gallery_title: "Галерия",
    gallery_hint: "Кликни върху снимка, за да я видиш по-голяма.",

    service_title: "Какво правим",
    about_title: "STORY FRAMES: 🎁 Най-иновативният подарък!",
    about_text: "Оживете спомените: всяка снимка се превръща в кратко видео. Предлагаме дигитални рамки за вашите спомени и дигитални картички/покани. Стоплете сърцето с движещ се спомен! Пишете ни за поръчка! ✨",

    why_title: "Защо да избереш дигитална картичка?",
    why_1: "✨ <b>Оживели спомени:</b> имаш само стара хартиена снимка? Ние ще я преобразим в кратко видео, което разказва историята ѝ по нов начин.",
    why_2: "🎁 <b>Подарък, който впечатлява:</b> подходящ за празници, рожден ден, годишнина или просто за да зарадваш любим човек.",
    why_3: "🎵 <b>Твоят личен саундтрак:</b> добави песента, на която сте танцували за първи път.",
    why_4: "📱 <b>Стилно и вечно:</b> компактен формат, който се пази лесно и носи усмивка всеки път, когато бъде отворен.",
    why_5: "💖 <b>Напълно персонализирано:</b> дизайн, създаден специално за вашата уникална история.",
    quote: "„Цветята увяхват, бонбоните се изяждат, но споменът за начина, по който се чувствате заедно, остава завинаги.“",

    back_home: "Обратно към началото",
    buy_paypal: "Плати с PayPal",
    buy_cod: "Наложен платеж (България)",
    details_title: "Детайли",
    what_you_get: "<b>Какво получаваш:</b><br>• Снимката става „магическо“ кратко видео<br>• Личен, емоционален и премиум подарък<br>• Идеален за рожден ден, годишнина, изненада"
  }
};

function setLang(lang){
  const dict = I18N[lang] || I18N.en;
  document.documentElement.lang = lang;

  document.querySelectorAll("[data-i18n]").forEach(el=>{
    const key = el.getAttribute("data-i18n");
    if(dict[key] !== undefined){
      // allow HTML in some translations
      if(String(dict[key]).includes("<b>") || String(dict[key]).includes("<br>") || String(dict[key]).includes("✨") ){
        el.innerHTML = dict[key];
      } else {
        el.textContent = dict[key];
      }
    }
  });

  document.querySelectorAll(".langbtn").forEach(b=>{
    b.classList.toggle("active", b.dataset.lang === lang);
  });

  localStorage.setItem("sf_lang", lang);
}

function initLang(){
  document.querySelectorAll(".langbtn").forEach(btn=>{
    btn.addEventListener("click", ()=> setLang(btn.dataset.lang));
  });
  setLang(localStorage.getItem("sf_lang") || "en");
}

window.addEventListener("DOMContentLoaded", initLang);
