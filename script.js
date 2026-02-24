document.addEventListener('DOMContentLoaded', function() {
    // ============================================
    // ПЕРЕМЕННЫЕ
    // ============================================
    let splitMode = 1;
    let activeSection = 1;
    let isFurnitureVisible = true;
    let isWallsOnlyMode = false;
    let currentCatalog = 'ral';
    let currentPickerCatalog = 'ral';
    let currentMode = 'similar';
    let isLightOn = true;
    let currentTemperature = 4000;

    // Элементы комнаты
    const mainWall = document.getElementById('mainWall');
    const lightBulb = document.getElementById('lightBulb');
    const tv = document.getElementById('tv');
    const cabinet = document.getElementById('cabinet');
    const chest = document.getElementById('chest');
    const shelf = document.getElementById('shelf');
    const plant = document.getElementById('plant');

    // Элементы управления
    const warmBtn = document.getElementById('warmBtn');
    const coldBtn = document.getElementById('coldBtn');
    const lightToggleBtn = document.getElementById('lightToggleBtn');
    const temperatureInput = document.getElementById('temperatureInput');
    const tempValue = document.getElementById('tempValue');
    const catalogButtons = document.querySelectorAll('.catalog-btn');
    const colorCodeInput = document.getElementById('colorCode');
    const applyWallColorBtn = document.getElementById('applyWallColor');
    const tvColorPicker = document.getElementById('tvColor');
    const cabinetColorPicker = document.getElementById('cabinetColor');
    const chestColorPicker = document.getElementById('chestColor');
    const shelfColorPicker = document.getElementById('shelfColor');
    const plantPotColorPicker = document.getElementById('plantPotColor');
    const plantColorPicker = document.getElementById('plantColor');
    const resetBtn = document.getElementById('resetBtn');
    const status = document.getElementById('status');
    const colorNameContainer = document.getElementById('colorNameContainer');

    // Элементы для отображения HEX кодов
    const tvHex = tvColorPicker.nextElementSibling;
    const cabinetHex = cabinetColorPicker.nextElementSibling;
    const chestHex = chestColorPicker.nextElementSibling;
    const shelfHex = shelfColorPicker.nextElementSibling;
    const plantPotHex = plantPotColorPicker.nextElementSibling;
    const plantHex = plantColorPicker.nextElementSibling;

    // Элементы новых функций
    const toggleFurnitureBtn = document.getElementById('toggleFurnitureBtn');
    const wallsOnlyBtn = document.getElementById('wallsOnlyBtn');
    const resetWallsBtn = document.getElementById('resetWallsBtn');
    const splitButtons = document.querySelectorAll('.split-btn');
    const sectionButtons = document.querySelectorAll('.section-btn');
    const currentSectionSpan = document.getElementById('currentSection');
    const sectionInfo = document.getElementById('sectionInfo');
    const sectionSelector = document.getElementById('sectionSelector');

    // Элементы подбора цветов
    const catalogPickerButtons = document.querySelectorAll('.catalog-btn-picker');
    const colorPickerInput = document.getElementById('colorPickerInput');
    const pickColorsBtn = document.getElementById('pickColorsBtn');
    const modeButtons = document.querySelectorAll('.mode-btn');
    const colorsGrid = document.getElementById('colorsGrid');

    // Начальные значения
    const initialValues = {
        wallColor: '#ffffff',
        lightTemperature: 4000,
        tvColor: '#222222',
        cabinetColor: '#8b4513',
        chestColor: '#654321',
        shelfColor: '#d2691e',
        plantPotColor: '#a0522d',
        plantColor: '#32cd32'
    };

    // ============================================
    // ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
    // ============================================

    function updateStatus(msg) {
        if (status) status.innerHTML = `ℹ️ Статус: ${msg}`;
    }

    function hexToRgb(hex) {
        const res = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return res ? { r: parseInt(res[1],16), g: parseInt(res[2],16), b: parseInt(res[3],16) } : null;
    }

    function rgbToHsl(r,g,b){
        r/=255; g/=255; b/=255;
        const max=Math.max(r,g,b), min=Math.min(r,g,b);
        let h,s,l=(max+min)/2;
        if(max===min){h=s=0;}else{
            const d=max-min;
            s=l>0.5?d/(2-max-min):d/(max+min);
            switch(max){case r: h=(g-b)/d+(g<b?6:0); break; case g: h=(b-r)/d+2; break; case b:h=(r-g)/d+4; break;}
            h/=6;
        }
        return {h:Math.round(h*360), s:Math.round(s*100), l:Math.round(l*100)};
    }

    function darkenColor(color, percent){
        if(!color.startsWith('#')) return color;
        let r=parseInt(color.substr(1,2),16), g=parseInt(color.substr(3,2),16), b=parseInt(color.substr(5,2),16);
        r=Math.floor(r*(100-percent)/100); g=Math.floor(g*(100-percent)/100); b=Math.floor(b*(100-percent)/100);
        return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
    }

    function applyTemperatureTint(color, temp){
        if(!color.startsWith('#')) return color;
        let r=parseInt(color.substr(1,2),16), g=parseInt(color.substr(3,2),16), b=parseInt(color.substr(5,2),16);
        if(temp<3500){ r=Math.min(255,r+15); g=Math.min(255,g+10); } 
        else { b=Math.min(255,b+15); g=Math.min(255,g+5); }
        return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
    }

    function getColorFromCatalog(catalog, code){
        if(!window.colorDatabase) return null;
        const c = colorDatabase[catalog];
        if(!c) return null;
        return c[code] || null;
    }

    function updateHexValues(){
        tvHex.textContent = tvColorPicker.value.toUpperCase();
        cabinetHex.textContent = cabinetColorPicker.value.toUpperCase();
        chestHex.textContent = chestColorPicker.value.toUpperCase();
        shelfHex.textContent = shelfColorPicker.value.toUpperCase();
        plantPotHex.textContent = plantPotColorPicker.value.toUpperCase();
        plantHex.textContent = plantColorPicker.value.toUpperCase();
    }

    // ============================================
    // СЕКЦИИ СТЕН
    // ============================================

    function createWallSections(){
        const existing = mainWall.querySelectorAll('.wall-section');
        existing.forEach(s=>s.remove());
        for(let i=1;i<=4;i++){
            const s=document.createElement('div');
            s.className=`wall-section section-${i}`;
            s.dataset.section=i;
            s.style.backgroundColor='#ffffff';
            if(i===1) s.classList.add('active');
            mainWall.appendChild(s);
        }
        updateWallSections();
        updateSectionInfo();
    }

    function updateWallSections(){
        const wallSections=document.querySelectorAll('.wall-section');
        wallSections.forEach(section=>{
            const n=parseInt(section.dataset.section);
            if(n<=splitMode){
                section.style.display='block';
                section.style.width=`${100/splitMode}%`;
                section.style.left=`${(n-1)*100/splitMode}%`;
                section.style.borderRight=n<splitMode?'2px solid rgba(0,0,0,0.1)':'none';
            }else section.style.display='none';
        });
        if(splitMode>1){ if(sectionSelector) sectionSelector.style.display='block'; if(sectionInfo) sectionInfo.style.display='block'; }
        else { if(sectionSelector) sectionSelector.style.display='none'; if(sectionInfo) sectionInfo.style.display='none'; }
    }

    function updateSectionInfo(){
        if(currentSectionSpan) currentSectionSpan.textContent = activeSection;
        const wallSections=document.querySelectorAll('.wall-section');
        wallSections.forEach(s=>{ s.classList.remove('active'); if(parseInt(s.dataset.section)===activeSection) s.classList.add('active'); });
    }

    function applyWallColorWithSections(){
        const colorCode=colorCodeInput.value.trim();
        if(!colorCode){ updateStatus('Введите код цвета'); return; }
        const colorInfo=getColorFromCatalog(currentCatalog,colorCode);
        let baseColor,darkenedColor,finalColor;
        if(colorInfo){
            baseColor=colorInfo.hex;
            darkenedColor=darkenColor(baseColor,15);
            finalColor=isLightOn?applyTemperatureTint(darkenedColor,currentTemperature):darkenedColor;
        } else if(/^#([0-9A-F]{3}){1,2}$/i.test(colorCode)){
            baseColor=colorCode;
            darkenedColor=darkenColor(baseColor,15);
            finalColor=isLightOn?applyTemperatureTint(darkenedColor,currentTemperature):darkenedColor;
        } else { updateStatus(`Цвет ${colorCode} не найден`); return; }

        let wallSections=document.querySelectorAll('.wall-section');
        if(wallSections.length===0){ createWallSections(); wallSections=document.querySelectorAll('.wall-section'); }

        if(splitMode===1){
            wallSections.forEach(s=>{ if(parseInt(s.dataset.section)<=4) s.style.backgroundColor=finalColor; });
            updateStatus(`Цвет ${colorInfo?colorInfo.nameRu:colorCode} применён ко всей стене`);
        }else{
            const activeEl=document.querySelector(`.wall-section[data-section="${activeSection}"]`);
            if(activeEl){ activeEl.style.backgroundColor=finalColor; updateStatus(`Цвет ${colorInfo?colorInfo.nameRu:colorCode} применён к секции ${activeSection}`); }
        }
    }

    // ============================================
    // ШАБЛОНЫ ДИЗАЙНЕРОВ 60/30/10
    // ============================================

    function applyDesignerTemplate(templateId){
        if(!window.designerTemplates) return;
        const template=designerTemplates[templateId];
        if(!template){ updateStatus('Шаблон не найден'); return; }

        const wallSections=document.querySelectorAll('.wall-section');
        const sectionCount=splitMode;

        // Применяем основной цвет (60%)
        const mainColor=template.mainColor;
        if(sectionCount===1){
            wallSections[0].style.backgroundColor=mainColor;
        }else{
            // распределяем основной цвет по 60%
            const mainSections=Math.ceil(sectionCount*0.6);
            for(let i=0;i<mainSections;i++) wallSections[i].style.backgroundColor=mainColor;
        }

        // Вторичный цвет (30%)
        const secondaryColor=template.secondaryColor;
        const secSections=Math.ceil(sectionCount*0.3);
        for(let i=sectionCount-1;i>=sectionCount-secSections;i--){
            if(wallSections[i]) wallSections[i].style.backgroundColor=secondaryColor;
        }

        // Акцент (10%) - мебель или отдельный блок
        const accentColor=template.accentColor;
        if(template.accentTarget==='furniture'){
            tv.style.backgroundColor=accentColor;
            cabinet.style.backgroundColor=accentColor;
        }else if(template.accentTarget==='wall'){
            if(wallSections[sectionCount-1]) wallSections[sectionCount-1].style.backgroundColor=accentColor;
        }

        // Увеличиваем счетчик популярности шаблона
        template.selectedCount=(template.selectedCount||0)+1;

        updateStatus(`Применён шаблон дизайнера: ${template.name}`);
    }

    // ============================================
    // ПОДБОР ГАРМОНИИ И КОНТРАСТА
    // ============================================

    function calculateColorDifference(color1,color2){
        const rgb1=hexToRgb(color1), rgb2=hexToRgb(color2);
        if(!rgb1||!rgb2) return 1000;
        return Math.sqrt(Math.pow(rgb1.r-rgb2.r,2)+Math.pow(rgb1.g-rgb2.g,2)+Math.pow(rgb1.b-rgb2.b,2));
    }

    function findSimilarColors(baseColor,catalog){
        const allColors=Object.values(colorDatabase[catalog]||{}).filter(c=>c.hex!==baseColor.hex);
        const baseHsl=rgbToHsl(...Object.values(hexToRgb(baseColor.hex)));
        return allColors.sort((a,b)=>{
            const hslA=rgbToHsl(...Object.values(hexToRgb(a.hex)));
            const hslB=rgbToHsl(...Object.values(hexToRgb(b.hex)));
            const diffA=Math.abs(baseHsl.h-hslA.h)+Math.abs(baseHsl.s-hslA.s)+Math.abs(baseHsl.l-hslA.l);
            const diffB=Math.abs(baseHsl.h-hslB.h)+Math.abs(baseHsl.s-hslB.s)+Math.abs(baseHsl.l-hslB.l);
            return diffA-diffB;
        }).slice(0,5);
    }

    function findContrastColors(baseColor,catalog){
        const allColors=Object.values(colorDatabase[catalog]||{}).filter(c=>c.hex!==baseColor.hex);
        const baseHsl=rgbToHsl(...Object.values(hexToRgb(baseColor.hex)));
        return allColors.sort((a,b)=>{
            const hslA=rgbToHsl(...Object.values(hexToRgb(a.hex)));
            const hslB=rgbToHsl(...Object.values(hexToRgb(b.hex)));
            const contrastA=Math.abs(baseHsl.l-hslA.l)*0.7+Math.abs(baseHsl.h-hslA.h)*0.3;
            const contrastB=Math.abs(baseHsl.l-hslB.l)*0.7+Math.abs(baseHsl.h-hslB.h)*0.3;
            return contrastB-contrastA;
        }).slice(0,5);
    }

    function pickColors(){
        const colorCode=colorPickerInput.value.trim();
        if(!colorCode){ updateStatus('Введите код цвета для подбора'); return; }
        const baseColor=getColorFromCatalog(currentPickerCatalog,colorCode);
        if(!baseColor){ updateStatus(`Цвет ${colorCode} не найден в каталоге`); colorsGrid.innerHTML='<div class="no-colors">Цвет не найден</div>'; return; }

        // Увеличиваем счетчик популярности
        baseColor.selectedCount=(baseColor.selectedCount||0)+1;

        let pickedColors=[];
        switch(currentMode){
            case 'similar': pickedColors=findSimilarColors(baseColor,currentPickerCatalog); break;
            case 'contrast': pickedColors=findContrastColors(baseColor,currentPickerCatalog); break;
            default: pickedColors=findSimilarColors(baseColor,currentPickerCatalog);
        }

        colorsGrid.innerHTML='';
        const baseEl=document.createElement('div');
        baseEl.className='color-item base-color';
        baseEl.innerHTML=`<div class="color-preview" style="background-color:${darkenColor(baseColor.hex,15)}"></div>
                           <div class="color-info"><div>${colorCode}</div></div>`;
        colorsGrid.appendChild(baseEl);

        pickedColors.forEach(c=>{
            const el=document.createElement('div');
            el.className='color-item';
            el.innerHTML=`<div class="color-preview" style="background-color:${darkenColor(c.hex,15)}"></div>
                          <div class="color-info"><div>${c.code||''}</div></div>`;
            el.addEventListener('click',()=>{ colorCodeInput.value=c.code; applyWallColorWithSections(); });
            colorsGrid.appendChild(el);
        });
    }

    // ============================================
    // ИНИЦИАЛИЗАЦИЯ
    // ============================================

    function initialize(){
        createWallSections();
        updateHexValues();
        turnLightOn(initialValues.lightTemperature);
        updateStatus('Готово к работе');

        catalogButtons.forEach(btn=>{
            btn.addEventListener('click',function(){
                catalogButtons.forEach(b=>b.classList.remove('active'));
                this.classList.add('active');
                currentCatalog=this.getAttribute('data-catalog');
            });
        });

        catalogPickerButtons.forEach(btn=>{
            btn.addEventListener('click',function(){
                catalogPickerButtons.forEach(b=>b.classList.remove('active'));
                this.classList.add('active');
                currentPickerCatalog=this.getAttribute('data-catalog');
                pickColors();
            });
        });

        modeButtons.forEach(btn=>{
            btn.addEventListener('click',function(){
                modeButtons.forEach(b=>b.classList.remove('active'));
                this.classList.add('active');
                currentMode=this.getAttribute('data-mode');
                pickColors();
            });
        });

        pickColorsBtn.addEventListener('click',pickColors);
        colorPickerInput.addEventListener('keypress',(e)=>{ if(e.key==='Enter') pickColors(); });
    }

    initialize();
});
