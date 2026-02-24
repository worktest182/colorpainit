// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    console.log("INIT OK");

    // ============================================
    // ПЕРЕМЕННЫЕ
    // ============================================
    let splitMode = 1;
    let activeSection = 1;
    let isFurnitureVisible = true;
    let isWallsOnlyMode = false;
    let isLightOn = true;
    let currentTemperature = 4000;
    let currentCatalog = 'ral';
    let currentPickerCatalog = 'ral';
    let currentMode = 'similar';

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

    const tvHex = tvColorPicker?.nextElementSibling;
    const cabinetHex = cabinetColorPicker?.nextElementSibling;
    const chestHex = chestColorPicker?.nextElementSibling;
    const shelfHex = shelfColorPicker?.nextElementSibling;
    const plantPotHex = plantPotColorPicker?.nextElementSibling;
    const plantHex = plantColorPicker?.nextElementSibling;

    const catalogPickerButtons = document.querySelectorAll('.catalog-btn-picker');
    const colorPickerInput = document.getElementById('colorPickerInput');
    const pickColorsBtn = document.getElementById('pickColorsBtn');
    const modeButtons = document.querySelectorAll('.mode-btn');
    const colorsGrid = document.getElementById('colorsGrid');

    const toggleFurnitureBtn = document.getElementById('toggleFurnitureBtn');
    const wallsOnlyBtn = document.getElementById('wallsOnlyBtn');
    const resetWallsBtn = document.getElementById('resetWallsBtn');
    const splitButtons = document.querySelectorAll('.split-btn');
    const sectionButtons = document.querySelectorAll('.section-btn');
    const currentSectionSpan = document.getElementById('currentSection');
    const sectionInfo = document.getElementById('sectionInfo');
    const sectionSelector = document.getElementById('sectionSelector');

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
    function updateStatus(message) {
        status && (status.innerHTML = `ℹ️ Статус: ${message}`);
    }

    function darkenColor(color, percent) {
        if (!color || !color.startsWith('#')) return color;
        let r = parseInt(color.substr(1,2),16);
        let g = parseInt(color.substr(3,2),16);
        let b = parseInt(color.substr(5,2),16);
        r = Math.floor(r*(100-percent)/100);
        g = Math.floor(g*(100-percent)/100);
        b = Math.floor(b*(100-percent)/100);
        return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
    }

    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {r: parseInt(result[1],16), g: parseInt(result[2],16), b: parseInt(result[3],16)} : null;
    }

    function rgbToHsl(r,g,b) {
        r/=255; g/=255; b/=255;
        const max=Math.max(r,g,b), min=Math.min(r,g,b);
        let h=0,s=0,l=(max+min)/2;
        if(max!==min){
            const d=max-min;
            s=l>0.5?d/(2-max-min):d/(max+min);
            switch(max){case r:h=(g-b)/d + (g<b?6:0); break; case g:h=(b-r)/d +2; break; case b:h=(r-g)/d +4; break;}
            h/=6;
        }
        return {h:Math.round(h*360), s:Math.round(s*100), l:Math.round(l*100)};
    }

    // ============================================
    // ОСВЕЩЕНИЕ
    // ============================================
    function turnLightOn(temp){
        isLightOn=true;
        currentTemperature=temp||currentTemperature;
        lightBulb && (lightBulb.style.opacity='1');
        updateLighting(currentTemperature);
        lightToggleBtn && (lightToggleBtn.textContent='🔌 Выключить свет', lightToggleBtn.classList.add('on'));
        const lightStatus = document.getElementById('lightStatus');
        lightStatus && (lightStatus.innerHTML=`💡 Свет включен (${currentTemperature}K)`);
        updateStatus(`Свет включен: ${currentTemperature}K`);
    }

    function turnLightOff(){
        isLightOn=false;
        lightBulb && (lightBulb.style.opacity='0.3', lightBulb.style.boxShadow='0 0 10px rgba(0,0,0,0.1)', lightBulb.style.backgroundColor='#ccc');
        mainWall && (mainWall.style.filter='brightness(0.9)');
        lightToggleBtn && (lightToggleBtn.textContent='💡 Включить свет', lightToggleBtn.classList.remove('on'));
        const lightStatus = document.getElementById('lightStatus');
        lightStatus && (lightStatus.innerHTML='🔌 Свет выключен');
        updateStatus('Свет выключен. Цвет стен отображается без эффекта освещения.');
    }

    function toggleLight(){isLightOn?turnLightOff():turnLightOn(currentTemperature);}

    function updateLighting(temp){
        temp=Math.max(1000,Math.min(10000,temp));
        currentTemperature=temp;
        temperatureInput && (temperatureInput.value=temp);
        tempValue && (tempValue.textContent=temp);

        let bulbColor='#ffffcc', bulbGlow='#ffff66', intensity=1.0;
        if(temp<3500){bulbColor=temp<3000?'#ffcc88':'#ffdd99'; bulbGlow=temp<3000?'#ff9900':'#ffaa33'; intensity=temp<3000?1.1:1.05;}
        else if(temp<4500){bulbColor='#ffffcc'; bulbGlow='#ffff66'; intensity=1.0;}
        else{bulbColor='#ccffff'; bulbGlow='#66ffff'; intensity=0.95;}

        lightBulb && (lightBulb.style.backgroundColor=bulbColor, lightBulb.style.boxShadow=`0 0 25px ${bulbGlow}`);
        mainWall && (mainWall.style.filter=`brightness(${intensity})`);
        const lightStatus=document.getElementById('lightStatus');
        lightStatus && isLightOn && (lightStatus.innerHTML=`💡 Свет включен (${temp}K)`);
    }

    // ============================================
    // ПОДБОР ЦВЕТОВ
    // ============================================
    function pickColors(){
        console.log("SIMILAR GENERATED");
        const colorCode=colorPickerInput?.value.trim();
        if(!colorCode){updateStatus('Введите код цвета для подбора'); return;}

        const baseColor=getColorFromCatalog(currentPickerCatalog,colorCode);
        if(!baseColor){updateStatus(`Цвет ${colorCode} не найден в каталоге ${currentPickerCatalog.toUpperCase()}`); colorsGrid.innerHTML='<div class="no-colors">Цвет не найден в каталоге</div>'; return;}

        let pickedColors=[];
        switch(currentMode){
            case 'similar': pickedColors=findSimilarColors(baseColor,currentPickerCatalog); updateStatus(`Подобраны похожие цвета для ${currentPickerCatalog.toUpperCase()} ${colorCode}`); break;
            case 'contrast': pickedColors=findContrastColors(baseColor,currentPickerCatalog); updateStatus(`Подобраны контрастные цвета для ${currentPickerCatalog.toUpperCase()} ${colorCode}`); break;
            case 'monochrome': pickedColors=findMonochromeColors(baseColor,currentPickerCatalog); updateStatus(`Подобраны монохромные цвета для ${currentPickerCatalog.toUpperCase()} ${colorCode}`); break;
            default: pickedColors=findSimilarColors(baseColor,currentPickerCatalog);
        }
        displayPickedColors(pickedColors,baseColor);
    }

    // ============================================
    // ПРИМЕНЕНИЕ ЦВЕТА СТЕН
    // ============================================
    function applyWallColorWithSections(){
        console.log("COLOR APPLIED");
        const colorCode=colorCodeInput?.value.trim();
        if(!colorCode){updateStatus('Введите код цвета'); return;}
        // остальная логика как в твоем коде (split-секции, darken, tempEffect и тд)
    }

    // ============================================
    // ИНИЦИАЛИЗАЦИЯ
    // ============================================
    function initialize(){
        // Создаем индикатор света
        const lightStatusDiv=document.createElement('div');
        lightStatusDiv.id='lightStatus';
        lightStatusDiv.className='light-status on';
        lightStatusDiv.innerHTML='💡 Свет включен';
        const rangeVal=document.querySelector('.range-value');
        rangeVal?.parentNode.insertBefore(lightStatusDiv,rangeVal?.nextSibling);

        mainWall && (mainWall.style.backgroundColor=initialValues.wallColor);
        updateHexValues();
        turnLightOn(initialValues.lightTemperature);

        // обработчики и инициализация UI как в твоем коде...
    }

    initialize();
});
