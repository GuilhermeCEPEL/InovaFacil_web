// Global state to store form data across pages using localStorage
let formData = {};

const LOCAL_STORAGE_KEY = 'inovaFacilFormData';

// Load formData from localStorage on script initialization
function loadFormData() {
    const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedData) {
        formData = JSON.parse(storedData);
    } else {
        // Initialize with static data for Page 4 if no data is stored
        formData["Avaliacao do Potencial de Protecao"] = {
            "Score Geral": "7.7/10",
            "Inovacao": "8.0/10",
            "Originalidade": "7.0/10",
            "Potencial de Propriedade Intelectual": "8.0/10"
        };
    }
    console.log("FormData loaded:", formData);
}

// Save formData to localStorage
function saveFormData() {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(formData));
    console.log("FormData saved:", formData);
}

// Function to collect data from a specific form and store it
function collectFormData(form, sectionName) {
    const inputs = form.querySelectorAll('input, textarea, select');
    // Ensure the section exists in formData
    if (!formData[sectionName]) {
        formData[sectionName] = {};
    }

    inputs.forEach(input => {
        if (input.type === 'radio') {
            if (input.checked) {
                formData[sectionName][input.name] = input.value;
            }
        } else if (input.type !== 'submit' && input.type !== 'button') {
            formData[sectionName][input.name] = input.value;
        }
    });
    saveFormData(); // Save after collecting data
}

// Function to load data into a specific form
function populateForm(form, sectionName) {
    const sectionData = formData[sectionName];
    if (!sectionData) return;

    for (const key in sectionData) {
        if (sectionData.hasOwnProperty(key)) {
            const element = form.querySelector(`[name="${key}"]`);
            if (element) {
                if (element.type === 'radio') {
                    const radio = form.querySelector(`input[name="${key}"][value="${sectionData[key]}"]`);
                    if (radio) radio.checked = true;
                } else if (element.tagName === 'SELECT') {
                    element.value = sectionData[key];
                    // Trigger change event for select to update dependent UI, e.g., on Page 4
                    if (element.id === 'protectionType') {
                        element.dispatchEvent(new Event('change'));
                    }
                } else {
                    element.value = sectionData[key];
                }
            }
        }
    }
}

// Function to clear all stored form data
function resetAllFormData() {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    formData = {}; // Clear in-memory data
    // Re-initialize with static data for Page 4
    formData["Avaliacao do Potencial de Protecao"] = {
        "Score Geral": "7.7/10",
        "Inovacao": "8.0/10",
        "Originalidade": "7.0/10",
        "Potencial de Propriedade Intelectual": "8.0/10"
    };
    console.log("FormData reset:", formData);
}

// Function to toggle expander visibility
function toggleExpander(expanderElement) {
    expanderElement.classList.toggle('open');
}

// Function to simulate backend text generation using Gemini API
async function generateTextFromBackend(prompt, targetElement, loadingMessage = 'Gerando texto...') {
    targetElement.textContent = loadingMessage;
    const apiKey = ""; // IMPORTANT: Replace with your actual Gemini API Key
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    
    let chatHistory = [];
    chatHistory.push({ role: "user", parts: [{ text: prompt }] });
    const payload = { contents: chatHistory };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await response.json();
        if (result.candidates && result.candidates.length > 0 &&
            result.candidates[0].content && result.candidates[0].content.parts &&
            result.candidates[0].content.parts.length > 0) {
            const text = result.candidates[0].content.parts[0].text;
            targetElement.textContent = text;
        } else {
            targetElement.textContent = 'Não foi possível gerar o conteúdo no momento. Tente novamente.';
        }
    } catch (error) {
        console.error('Erro ao chamar a API Gemini:', error);
        targetElement.textContent = 'Erro ao gerar conteúdo. Por favor, tente novamente.';
    }
}

// Load data when script first runs
loadFormData();
