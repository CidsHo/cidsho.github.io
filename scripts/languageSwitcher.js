// languageSwitcher.js
let translations = {};

async function loadTranslations(lang) {
    try {
        const response = await fetch(`assets/translations/${lang}.json`);
        if (!response.ok) {
            throw new Error(`Failed to load ${lang}.json: ${response.statusText}`);
        }
        translations[lang] = await response.json();
        console.log(`Loaded ${lang}.json:`, translations[lang]);
        switchLanguage(lang);
    } catch (error) {
        console.error(error);
    }
}

function switchLanguage(lang) {
    document.documentElement.lang = lang;
    if (!translations[lang]) {
        loadTranslations(lang);
        return;
    }

    // 获取所有需要翻译的元素
    const elements = document.querySelectorAll('[data-key]');
    elements.forEach(el => {
        const key = el.getAttribute('data-key');
        if (translations[lang][key]) {
            if (Array.isArray(translations[lang][key])) {
                // 如果是数组，动态生成列表项
                if (key === 'publicationsList') {
                    // 处理出版物列表
                    el.innerHTML = translations[lang][key].map(item => `
                        <li>
                            <strong>${item.title}</strong><br>
                            <em>${item.author}</em><br>
                            ${item.conference}<br>
                            <a href="${item.doi}" target="_blank"><em>[DOI]</em></a>
                        </li>
                    `).join('');
                } else if (key === 'projectExperienceList') {
                    // 处理项目经验列表
                    el.innerHTML = translations[lang][key].map(item => `
                        <li>
                            <em>${item.period}</em>, ${item.title}<br>
                            <span>${item.institution}</span><br>
                            > ${item.role}
                        </li>
                    `).join('');
                } else if (key === 'awardsList') {
                    // 处理奖项列表
                    el.innerHTML = translations[lang][key].map(item => `<li>${item}</li>`).join('');
                }
            } else if (typeof translations[lang][key] === 'object') {
                // 如果是对象，根据对象结构动态生成内容
                if (key === 'skillsText') {
                    const skills = translations[lang][key];
                    el.innerHTML = `
                        <div class="skill-category">
                            <h3>${skills.designTools}</h3>
                            <ul>${skills.designToolsList.map(item => `<li>${item}</li>`).join('')}</ul>
                        </div>
                        <div class="skill-category">
                            <h3>${skills.multimediaTools}</h3>
                            <ul>${skills.multimediaToolsList.map(item => `<li>${item}</li>`).join('')}</ul>
                        </div>
                        <div class="skill-category">
                            <h3>${skills.languageProficiency}</h3>
                            <ul>${skills.languageProficiencyList.map(item => `<li>${item}</li>`).join('')}</ul>
                        </div>
                    `;
                }
            } else {
                // 如果是普通文本，直接更新内容
                el.innerHTML = translations[lang][key];
            }
        } else {
            console.warn(`Translation not found for key: ${key} in language: ${lang}`);
        }
    });

    // 更新语言切换按钮的状态
    const languageButtons = document.querySelectorAll('.language-switcher button');
    languageButtons.forEach(button => {
        if (button.getAttribute('onclick').includes(lang)) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
}

// 默认显示英文
document.addEventListener('DOMContentLoaded', () => {
    switchLanguage('en');
});