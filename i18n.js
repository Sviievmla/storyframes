// Story Frames - i18n Translation System
const translations = {
  en: {
    // Navigation
    nav_home: "Home",
    nav_products: "Products",
    nav_gallery: "Gallery",
    nav_service: "Service",
    cart: "Cart",
    tagline: "Crafting stories from photos",
    
    // Hero Section
    hero_title: "Personalized gifts that come to life.",
    hero_text: "Send us a photo — we transform it into a short video and embed it into your chosen product. A moving memory that feels premium, personal, and unforgettable.",
    cta_products: "View products",
    cta_email: "Order by email",
    cta_fb: "Message on Facebook",
    
    // How it Works
    how_title: "How ordering works",
    how_1: "You send us your photo (even an old paper photo).",
    how_2: 'We turn it into a short "magic" video story.',
    how_3: "We deliver it inside your selected product.",
    
    // Products Section
    products_title: "Products",
    p1_title: "Video Ball",
    p1_desc: "A modern spherical display with your animated memory inside.",
    p2_title: "Premium Frame",
    p2_desc: "A clean, premium digital frame for memories that deserve a spotlight.",
    p3_title: "Digital Greeting Card",
    p3_desc: "A stylish digital card with your story and your music.",
    order_now: "Order",
    add_to_cart: "Add to Cart",
    open_details: "Open details →",
    pay_physical: "PayPal (card) • Bulgaria COD",
    pay_digital: "PayPal (card) • Instant delivery",
    
    // Gallery Section
    gallery_title: "Gallery",
    gallery_hint: "Click any photo to view it bigger.",
    
    // Service Section
    service_title: "Service",
    about_title: "STORY FRAMES — The most innovative gift",
    about_text: "Bring memories to life: every photo becomes a short video. We offer digital frames for your memories and digital invitation / greeting cards. Warm someone's heart with a moving memory. Message us to order. ✨",
    why_title: "Why choose a digital card?",
    why_1: "✨ <b>Living memories:</b> we transform even an old paper photo into a short video story.",
    why_2: '🎁 <b>A gift that impresses:</b> perfect for birthdays, anniversaries, holidays — or "just because".',
    why_3: "🎵 <b>Your personal soundtrack:</b> add the song that matters to you.",
    why_4: "📱 <b>Stylish & lasting:</b> compact, easy to keep, and brings a smile every time.",
    why_5: "💖 <b>Fully personalized:</b> designed for your unique story.",
    quote: '"Flowers fade, chocolates get eaten — but the feeling you share stays forever."',
    
    // Cart
    cart_title: "Shopping Cart",
    cart_empty: "Your cart is empty",
    total: "Total:",
    subtotal: "Subtotal:",
    clear_cart: "Clear Cart",
    remove: "Remove",
    quantity: "Qty:",
    update_quantity: "Update",
    checkout_btn: "Proceed to Checkout",
    continue_shopping: "Continue Shopping",
    card_payment_note: "💳 PayPal also accepts credit and debit cards",
    cod_info_text: "Cash on Delivery available for Bulgaria orders only. We'll contact you to confirm delivery details.",
    
    // Product Details Pages
    back_home: "Back to home",
    buy_cod: "Bulgaria COD",
    buy_cod_checkout: "ORDER NOW (Bulgaria COD)",
    what_you_get: '<b>What you get:</b><br>• Your photo becomes a short "magic" video story<br>• Personal, emotional, premium gift<br>• Perfect for birthdays, anniversaries, surprises',
    
    // Checkout Page
    checkout_title: "Checkout",
    checkout_subtitle: "Complete your order",
    customer_details: "Customer Details",
    full_name: "Full Name",
    email: "Email Address",
    phone: "Phone Number",
    address: "Shipping Address",
    city: "City",
    postal_code: "Postal Code",
    country: "Country",
    order_summary: "Order Summary",
    order_notes: "Order Notes (Optional)",
    order_notes_placeholder: "Special instructions, delivery preferences, etc.",
    payment_method: "Payment Method",
    place_order: "Place Order",
    required_field: "This field is required",
    invalid_email: "Please enter a valid email address"
  },
  bg: {
    // Navigation
    nav_home: "Начало",
    nav_products: "Продукти",
    nav_gallery: "Галерия",
    nav_service: "Услуги",
    cart: "Количка",
    tagline: "Създаваме истории от снимки",
    
    // Hero Section
    hero_title: "Персонализирани подаръци, които оживяват.",
    hero_text: "Изпратете ни снимка — ние я превръщаме в кратко видео и я вграждаме в избрания от вас продукт. Движеща се спомена, която е премиум, лична и незабравима.",
    cta_products: "Виж продуктите",
    cta_email: "Поръчай по имейл",
    cta_fb: "Съобщение във Facebook",
    
    // How it Works
    how_title: "Как работи поръчването",
    how_1: "Изпращате ни вашата снимка (дори стара хартиена снимка).",
    how_2: 'Превръщаме я в кратка „магическа" видео история.',
    how_3: "Доставяме я вградена в избрания продукт.",
    
    // Products Section
    products_title: "Продукти",
    p1_title: "Видео топка",
    p1_desc: "Модерен сферичен дисплей с вашата анимирана спомена вътре.",
    p2_title: "Премиум рамка",
    p2_desc: "Чиста, премиум дигитална рамка за спомени, които заслужават внимание.",
    p3_title: "Дигитална поздравителна картичка",
    p3_desc: "Стилна дигитална картичка с вашата история и музика.",
    order_now: "Поръчай",
    add_to_cart: "Добави в количката",
    open_details: "Отвори детайли →",
    pay_physical: "PayPal (карта) • Наложен платеж в България",
    pay_digital: "PayPal (карта) • Незабавна доставка",
    
    // Gallery Section
    gallery_title: "Галерия",
    gallery_hint: "Кликнете върху снимка, за да я видите по-голяма.",
    
    // Service Section
    service_title: "Услуги",
    about_title: "STORY FRAMES — Най-иновативният подарък",
    about_text: "Оживете спомените: всяка снимка става кратко видео. Предлагаме дигитални рамки за вашите спомени и дигитални покани / поздравителни картички. Затоплете нечие сърце с движеща се спомена. Пишете ни, за да поръчате. ✨",
    why_title: "Защо да изберете дигитална картичка?",
    why_1: "✨ <b>Живи спомени:</b> превръщаме дори стара хартиена снимка в кратка видео история.",
    why_2: '🎁 <b>Подарък, който впечатлява:</b> перфектен за рождени дни, годишнини, празници — или „просто така".',
    why_3: "🎵 <b>Вашият личен саундтрак:</b> добавете песента, която има значение за вас.",
    why_4: "📱 <b>Стилен и траен:</b> компактен, лесен за съхранение и носи усмивка всеки път.",
    why_5: "💖 <b>Напълно персонализиран:</b> проектиран за вашата уникална история.",
    quote: '„Цветята увяхват, шоколадите се изяждат — но чувството, което споделяте, остава завинаги."',
    
    // Cart
    cart_title: "Количка за пазаруване",
    cart_empty: "Вашата количка е празна",
    total: "Общо:",
    subtotal: "Междинна сума:",
    clear_cart: "Изчисти количката",
    remove: "Премахни",
    quantity: "Бр.:",
    update_quantity: "Актуализирай",
    checkout_btn: "Продължи към плащане",
    continue_shopping: "Продължи пазаруването",
    card_payment_note: "💳 PayPal приема също кредитни и дебитни карти",
    cod_info_text: "Наложен платеж е достъпен само за поръчки в България. Ще се свържем с вас за потвърждение на детайлите за доставка.",
    
    // Product Details Pages
    back_home: "Обратно към начало",
    buy_cod: "Наложен платеж в България",
    buy_cod_checkout: "ПОРЪЧАЙ (Наложен платеж България)",
    what_you_get: '<b>Какво получавате:</b><br>• Вашата снимка става кратка „магическа" видео история<br>• Личен, емоционален, премиум подарък<br>• Перфектен за рождени дни, годишнини, изненади',
    
    // Checkout Page
    checkout_title: "Плащане",
    checkout_subtitle: "Завършете поръчката си",
    customer_details: "Данни на клиента",
    full_name: "Пълно име",
    email: "Имейл адрес",
    phone: "Телефонен номер",
    address: "Адрес за доставка",
    city: "Град",
    postal_code: "Пощенски код",
    country: "Държава",
    order_summary: "Обобщение на поръчката",
    order_notes: "Бележки към поръчката (по избор)",
    order_notes_placeholder: "Специални инструкции, предпочитания за доставка и др.",
    payment_method: "Метод на плащане",
    place_order: "Направи поръчка",
    required_field: "Това поле е задължително",
    invalid_email: "Моля, въведете валиден имейл адрес"
  }
};

// Initialize i18n system
(function() {
  // Get saved language or default to English
  let currentLang = localStorage.getItem('storyframes_lang') || 'en';
  
  // Function to apply translations
  function applyTranslations(lang) {
    currentLang = lang;
    localStorage.setItem('storyframes_lang', lang);
    document.documentElement.setAttribute('lang', lang);
    
    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      if (translations[lang] && translations[lang][key]) {
        // Check if element has placeholder attribute
        if (element.hasAttribute('placeholder')) {
          element.setAttribute('placeholder', translations[lang][key]);
        } else {
          element.innerHTML = translations[lang][key];
        }
      }
    });
    
    // Update active language button
    document.querySelectorAll('.langbtn').forEach(btn => {
      if (btn.getAttribute('data-lang') === lang) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
    
    // Update HTML lang attribute
    document.documentElement.lang = lang;
    
    // Dispatch custom event for other scripts to listen to
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang: lang } }));
  }
  
  // Initialize translations when DOM is ready
  function initTranslations() {
    // Apply saved language
    applyTranslations(currentLang);
    
    // Add click handlers to language buttons
    document.querySelectorAll('.langbtn').forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        const lang = this.getAttribute('data-lang');
        if (lang && (lang === 'en' || lang === 'bg')) {
          applyTranslations(lang);
        }
      });
    });
  }
  
  // Run initialization - ensure it runs after DOM is fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTranslations);
  } else {
    // DOM already loaded, run immediately
    initTranslations();
  }
  
  // Export for use in other scripts
  window.i18n = {
    t: function(key) {
      return translations[currentLang][key] || key;
    },
    getCurrentLang: function() {
      return currentLang;
    },
    setLang: function(lang) {
      applyTranslations(lang);
    }
  };
})();
