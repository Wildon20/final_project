// Example FAQs data
const faqs = [
    {
      question: "What services do you offer?",
      answer: "We offer teeth cleaning, whitening, braces, implants, and more. Check our Services page!"
    },
    {
      question: "How can I book an appointment?",
      answer: "You can book online via our Contact page or call us directly at (268) 76548232."
    },
    {
      question: "Do you accept insurance?",
      answer: "Yes, we work with most major dental insurance providers. Contact us for more details."
    }
  ];
  
  // Render FAQs
  const faqContainer = document.getElementById('faq-container');
  
  faqs.forEach((faq, index) => {
    const faqItem = document.createElement('div');
    faqItem.classList.add('accordion-item', 'mb-3');
  
    faqItem.innerHTML = `
      <h2 class="accordion-header" id="heading${index}">
        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${index}" aria-expanded="false" aria-controls="collapse${index}">
          ${faq.question}
        </button>
      </h2>
      <div id="collapse${index}" class="accordion-collapse collapse" aria-labelledby="heading${index}" data-bs-parent="#faqAccordion">
        <div class="accordion-body">
          ${faq.answer}
        </div>
      </div>
    `;
  
    faqContainer.appendChild(faqItem);
  });
  