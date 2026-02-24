// Инициализация при загрузке страницы
// eslint-disable-next-line no-undef
document.addEventListener('DOMContentLoaded', function () {
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

    const wallSections = ['#ffffff', '#ffffff', '#ffffff', '#ffffff'];
    let furnitureBackup = null;

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

    function ensureGlobalSources() {
        if (typeof colorDatabase !== 'undefined' && !window.colorDatabase) {
            window.colorDatabase = colorDatabase;
        }
        if (!window.colorDatabase) {
            window.colorDatabase = {};
        }

        if (typeof designerTemplates !== 'undefined' && !window.designerTemplates) {
            window.designerTemplates = designerTemplates;
        }
        if (!window.designerTemplates) {
            window.designerTemplates = {};
        }
    }

    function updateStatus(message) {
        if (status) {
            status.innerHTML = `ℹ️ Статус: ${message}`;
        }
    }

    function darkenColor(color, percent) {
        if (!color || !color.startsWith('#')) return color;
        let r = parseInt(color.substr(1, 2), 16);
        let g = parseInt(color.substr(3, 2), 16);
        let b = parseInt(color.substr(5, 2), 16);
        r = Math.floor(r * (100 - percent) / 100);
        g = Math.floor(g * (100 - percent) / 100);
        b = Math.floor(b * (100 - percent) / 100);
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }

    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
            ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
            : null;
    }

    function rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h = 0;
        let s = 0;
        const l = (max + min) / 2;

        if (max !== min) {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / d + 2;
                    break;
                case b:
                    h = (r - g) / d + 4;
                    break;
                default:
                    break;
            }
            h /= 6;
        }
        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            l: Math.round(l * 100)
        };
    }

    function applySectionBackgrounds() {
        const active = wallSections.slice(0, splitMode);
        if (!mainWall) return;
        if (splitMode === 1) {
            mainWall.style.background = active[0];
            return;
        }
        const step = 100 / splitMode;
        const parts = active.map(function (color, index) {
            const start = (index * step).toFixed(2);
            const end = ((index + 1) * step).toFixed(2);
            return `${color} ${start}% ${end}%`;
        });
        mainWall.style.background = `linear-gradient(90deg, ${parts.join(', ')})`;
    }

    function updateHexValues() {
        if (tvHex && tvColorPicker) tvHex.textContent = tvColorPicker.value;
        if (cabinetHex && cabinetColorPicker) cabinetHex.textContent = cabinetColorPicker.value;
        if (chestHex && chestColorPicker) chestHex.textContent = chestColorPicker.value;
        if (shelfHex && shelfColorPicker) shelfHex.textContent = shelfColorPicker.value;
        if (plantPotHex && plantPotColorPicker) plantPotHex.textContent = plantPotColorPicker.value;
        if (plantHex && plantColorPicker) plantHex.textContent = plantColorPicker.value;
    }

    function setFurnitureVisibility(visible) {
        [tv, cabinet, chest, shelf, plant].forEach(function (el) {
            if (el) el.style.display = visible ? '' : 'none';
        });
    }

    function updateSplitUI() {
        sectionButtons.forEach(function (btn) {
            const section = Number(btn.dataset.section);
            btn.style.display = section <= splitMode ? '' : 'none';
            btn.classList.toggle('active', section === activeSection);
        });

        const multi = splitMode > 1;
        if (sectionSelector) sectionSelector.style.display = multi ? '' : 'none';
        if (sectionInfo) sectionInfo.style.display = multi ? '' : 'none';
        if (currentSectionSpan) currentSectionSpan.textContent = String(activeSection);
    }

    function getColorFromData(catalog, code) {
        if (typeof getColorFromCatalog === 'function') {
            return getColorFromCatalog(catalog, code);
        }
        const db = window.colorDatabase || {};
        const branch = db[catalog.toLowerCase()] || {};
        return branch[String(code).toUpperCase()] || null;
    }

    function getCatalogEntries(catalog) {
        const db = window.colorDatabase || {};
        return Object.values(db[catalog.toLowerCase()] || {});
    }

    function findSimilarColors(baseColor, catalog) {
        const baseRgb = hexToRgb(baseColor.hex);
        if (!baseRgb) return [];
        const baseHsl = rgbToHsl(baseRgb.r, baseRgb.g, baseRgb.b);

        return getCatalogEntries(catalog)
            .map(function (item) {
                const rgb = hexToRgb(item.hex);
                if (!rgb) return null;
                const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
                const hueDiff = Math.min(Math.abs(hsl.h - baseHsl.h), 360 - Math.abs(hsl.h - baseHsl.h));
                const satDiff = Math.abs(hsl.s - baseHsl.s);
                const lightDiff = Math.abs(hsl.l - baseHsl.l);
                return { item, score: hueDiff * 2 + satDiff + lightDiff };
            })
            .filter(Boolean)
            .sort(function (a, b) { return a.score - b.score; })
            .slice(1, 7)
            .map(function (x) { return x.item; });
    }

    function findContrastColors(baseColor, catalog) {
        const baseRgb = hexToRgb(baseColor.hex);
        if (!baseRgb) return [];
        const baseHsl = rgbToHsl(baseRgb.r, baseRgb.g, baseRgb.b);

        return getCatalogEntries(catalog)
            .map(function (item) {
                const rgb = hexToRgb(item.hex);
                if (!rgb) return null;
                const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
                const hueDiff = Math.min(Math.abs(hsl.h - baseHsl.h), 360 - Math.abs(hsl.h - baseHsl.h));
                const lightDiff = Math.abs(hsl.l - baseHsl.l);
                return { item, score: Math.abs(180 - hueDiff) + lightDiff };
            })
            .filter(Boolean)
            .sort(function (a, b) { return a.score - b.score; })
            .slice(0, 6)
            .map(function (x) { return x.item; });
    }

    function findMonochromeColors(baseColor, catalog) {
        const baseRgb = hexToRgb(baseColor.hex);
        if (!baseRgb) return [];
        const baseHsl = rgbToHsl(baseRgb.r, baseRgb.g, baseRgb.b);

        return getCatalogEntries(catalog)
            .map(function (item) {
                const rgb = hexToRgb(item.hex);
                if (!rgb) return null;
                const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
                const hueDiff = Math.min(Math.abs(hsl.h - baseHsl.h), 360 - Math.abs(hsl.h - baseHsl.h));
                const satDiff = Math.abs(hsl.s - baseHsl.s);
                const lightDiff = Math.abs(hsl.l - baseHsl.l);
                return { item, score: hueDiff * 3 + satDiff + lightDiff };
            })
            .filter(Boolean)
            .sort(function (a, b) { return a.score - b.score; })
            .slice(1, 7)
            .map(function (x) { return x.item; });
    }

    function displayPickedColors(colors, baseColor) {
        if (!colorsGrid) return;
        const source = [baseColor].concat(colors || []);
        colorsGrid.innerHTML = source.map(function (item) {
            return `<div class="picked-color-card"><div class="picked-color-swatch" style="background:${item.hex}"></div><div class="picked-color-code">${item.nameRu || ''}<br><strong>${item.hex}</strong></div></div>`;
        }).join('');
    }

    function updateColorName(catalog, code, colorObj) {
        if (!colorNameContainer) return;
        if (!colorObj) {
            colorNameContainer.innerHTML = '';
            return;
        }
        colorNameContainer.innerHTML = `${catalog.toUpperCase()} ${code}: <strong>${colorObj.nameRu}</strong> (${colorObj.hex})`;
    }

    function applyWallColorWithSections() {
        console.log('COLOR APPLIED');
        const colorCode = colorCodeInput?.value.trim();
        if (!colorCode) {
            updateStatus('Введите код цвета');
            return;
        }

        const selectedColor = getColorFromData(currentCatalog, colorCode);
        if (!selectedColor) {
            updateStatus(`Цвет ${colorCode} не найден в каталоге ${currentCatalog.toUpperCase()}`);
            updateColorName(currentCatalog, colorCode, null);
            return;
        }

        wallSections[activeSection - 1] = selectedColor.hex;
        applySectionBackgrounds();
        updateColorName(currentCatalog, colorCode, selectedColor);
        updateStatus(`Применён цвет ${currentCatalog.toUpperCase()} ${colorCode}`);
    }

    function pickColors() {
        console.log('SIMILAR GENERATED');
        const colorCode = colorPickerInput?.value.trim();
        if (!colorCode) {
            updateStatus('Введите код цвета для подбора');
            return;
        }

        const baseColor = getColorFromData(currentPickerCatalog, colorCode);
        if (!baseColor) {
            updateStatus(`Цвет ${colorCode} не найден в каталоге ${currentPickerCatalog.toUpperCase()}`);
            if (colorsGrid) {
                colorsGrid.innerHTML = '<div class="no-colors">Цвет не найден в каталоге</div>';
            }
            return;
        }

        let pickedColors = [];
        switch (currentMode) {
            case 'similar':
                pickedColors = findSimilarColors(baseColor, currentPickerCatalog);
                break;
            case 'contrast':
                pickedColors = findContrastColors(baseColor, currentPickerCatalog);
                break;
            case 'monochrome':
                pickedColors = findMonochromeColors(baseColor, currentPickerCatalog);
                break;
            default:
                pickedColors = findSimilarColors(baseColor, currentPickerCatalog);
                break;
        }

        displayPickedColors(pickedColors, baseColor);
        updateStatus(`Подобраны цвета для ${currentPickerCatalog.toUpperCase()} ${colorCode}`);
    }

    function updateLighting(temp) {
        const normalized = Math.max(1000, Math.min(10000, Number(temp) || 4000));
        currentTemperature = normalized;
        if (temperatureInput) temperatureInput.value = String(normalized);
        if (tempValue) tempValue.textContent = String(normalized);

        let bulbColor = '#ffffcc';
        let bulbGlow = '#ffff66';
        let intensity = 1;

        if (normalized < 3500) {
            bulbColor = normalized < 3000 ? '#ffcc88' : '#ffdd99';
            bulbGlow = normalized < 3000 ? '#ff9900' : '#ffaa33';
            intensity = normalized < 3000 ? 1.1 : 1.05;
        } else if (normalized >= 4500) {
            bulbColor = '#ccffff';
            bulbGlow = '#66ffff';
            intensity = 0.95;
        }

        if (lightBulb) {
            lightBulb.style.backgroundColor = bulbColor;
            lightBulb.style.boxShadow = `0 0 25px ${bulbGlow}`;
        }

        if (mainWall) {
            mainWall.style.filter = `brightness(${intensity})`;
        }

        const lightStatus = document.getElementById('lightStatus');
        if (lightStatus && isLightOn) {
            lightStatus.innerHTML = `💡 Свет включен (${normalized}K)`;
        }
    }

    function turnLightOn(temp) {
        isLightOn = true;
        if (lightBulb) lightBulb.style.opacity = '1';
        updateLighting(temp || currentTemperature);
        if (lightToggleBtn) {
            lightToggleBtn.textContent = '🔌 Выключить свет';
            lightToggleBtn.classList.add('on');
        }
        updateStatus(`Свет включен: ${currentTemperature}K`);
    }

    function turnLightOff() {
        isLightOn = false;
        if (lightBulb) {
            lightBulb.style.opacity = '0.3';
            lightBulb.style.boxShadow = '0 0 10px rgba(0,0,0,0.1)';
            lightBulb.style.backgroundColor = '#ccc';
        }
        if (mainWall) {
            mainWall.style.filter = 'brightness(0.9)';
        }
        if (lightToggleBtn) {
            lightToggleBtn.textContent = '💡 Включить свет';
            lightToggleBtn.classList.remove('on');
        }

        const lightStatus = document.getElementById('lightStatus');
        if (lightStatus) lightStatus.innerHTML = '🔌 Свет выключен';
        updateStatus('Свет выключен');
    }

    function toggleLight() {
        if (isLightOn) {
            turnLightOff();
            return;
        }
        turnLightOn(currentTemperature);
    }

    function resetWalls() {
        for (let i = 0; i < wallSections.length; i += 1) {
            wallSections[i] = initialValues.wallColor;
        }
        splitMode = 1;
        activeSection = 1;
        splitButtons.forEach(function (btn) {
            btn.classList.toggle('active', Number(btn.dataset.split) === 1);
        });
        updateSplitUI();
        applySectionBackgrounds();
    }

    function resetAll() {
        resetWalls();
        if (tvColorPicker) tvColorPicker.value = initialValues.tvColor;
        if (cabinetColorPicker) cabinetColorPicker.value = initialValues.cabinetColor;
        if (chestColorPicker) chestColorPicker.value = initialValues.chestColor;
        if (shelfColorPicker) shelfColorPicker.value = initialValues.shelfColor;
        if (plantPotColorPicker) plantPotColorPicker.value = initialValues.plantPotColor;
        if (plantColorPicker) plantColorPicker.value = initialValues.plantColor;

        if (tv) tv.style.backgroundColor = initialValues.tvColor;
        if (cabinet) cabinet.style.backgroundColor = initialValues.cabinetColor;
        if (chest) chest.style.backgroundColor = initialValues.chestColor;
        if (shelf) shelf.style.backgroundColor = initialValues.shelfColor;
        const plantPot = plant?.querySelector('.plant-pot');
        const plantLeaves = plant?.querySelector('.plant-leaves');
        if (plantPot) plantPot.style.backgroundColor = initialValues.plantPotColor;
        if (plantLeaves) plantLeaves.style.backgroundColor = initialValues.plantColor;

        updateHexValues();
        turnLightOn(initialValues.lightTemperature);
        updateStatus('Настройки сброшены');
    }

    function bindEvents() {
        warmBtn?.addEventListener('click', function () { turnLightOn(2700); });
        coldBtn?.addEventListener('click', function () { turnLightOn(4000); });
        lightToggleBtn?.addEventListener('click', toggleLight);
        temperatureInput?.addEventListener('input', function (e) { updateLighting(e.target.value); });

        catalogButtons.forEach(function (btn) {
            btn.addEventListener('click', function () {
                catalogButtons.forEach(function (item) { item.classList.remove('active'); });
                btn.classList.add('active');
                currentCatalog = btn.dataset.catalog || 'ral';
            });
        });

        catalogPickerButtons.forEach(function (btn) {
            btn.addEventListener('click', function () {
                catalogPickerButtons.forEach(function (item) { item.classList.remove('active'); });
                btn.classList.add('active');
                currentPickerCatalog = btn.dataset.catalog || 'ral';
            });
        });

        modeButtons.forEach(function (btn) {
            btn.addEventListener('click', function () {
                modeButtons.forEach(function (item) { item.classList.remove('active'); });
                btn.classList.add('active');
                currentMode = btn.dataset.mode || 'similar';
            });
        });

        applyWallColorBtn?.addEventListener('click', applyWallColorWithSections);
        pickColorsBtn?.addEventListener('click', pickColors);

        tvColorPicker?.addEventListener('input', function (e) {
            if (tv) tv.style.backgroundColor = e.target.value;
            updateHexValues();
        });
        cabinetColorPicker?.addEventListener('input', function (e) {
            if (cabinet) cabinet.style.backgroundColor = e.target.value;
            updateHexValues();
        });
        chestColorPicker?.addEventListener('input', function (e) {
            if (chest) chest.style.backgroundColor = e.target.value;
            updateHexValues();
        });
        shelfColorPicker?.addEventListener('input', function (e) {
            if (shelf) shelf.style.backgroundColor = e.target.value;
            updateHexValues();
        });
        plantPotColorPicker?.addEventListener('input', function (e) {
            const pot = plant?.querySelector('.plant-pot');
            if (pot) pot.style.backgroundColor = darkenColor(e.target.value, 10);
            updateHexValues();
        });
        plantColorPicker?.addEventListener('input', function (e) {
            const leaves = plant?.querySelector('.plant-leaves');
            if (leaves) leaves.style.backgroundColor = e.target.value;
            updateHexValues();
        });

        toggleFurnitureBtn?.addEventListener('click', function () {
            isFurnitureVisible = !isFurnitureVisible;
            if (isWallsOnlyMode) return;
            setFurnitureVisibility(isFurnitureVisible);
            const label = toggleFurnitureBtn.querySelector('.btn-text');
            if (label) label.textContent = isFurnitureVisible ? 'Скрыть мебель' : 'Показать мебель';
        });

        wallsOnlyBtn?.addEventListener('click', function () {
            isWallsOnlyMode = !isWallsOnlyMode;
            if (isWallsOnlyMode) {
                furnitureBackup = isFurnitureVisible;
                setFurnitureVisibility(false);
            } else {
                setFurnitureVisibility(furnitureBackup ?? true);
            }
        });

        resetWallsBtn?.addEventListener('click', resetWalls);
        resetBtn?.addEventListener('click', resetAll);

        splitButtons.forEach(function (btn) {
            btn.addEventListener('click', function () {
                splitMode = Number(btn.dataset.split) || 1;
                activeSection = Math.min(activeSection, splitMode);
                splitButtons.forEach(function (item) {
                    item.classList.toggle('active', item === btn);
                });
                updateSplitUI();
                applySectionBackgrounds();
            });
        });

        sectionButtons.forEach(function (btn) {
            btn.addEventListener('click', function () {
                activeSection = Number(btn.dataset.section) || 1;
                updateSplitUI();
            });
        });
    }

    function initialize() {
        console.log('INIT OK');
        ensureGlobalSources();

        const lightStatusDiv = document.createElement('div');
        lightStatusDiv.id = 'lightStatus';
        lightStatusDiv.className = 'light-status on';
        lightStatusDiv.innerHTML = '💡 Свет включен';
        const rangeVal = document.querySelector('.range-value');
        rangeVal?.parentNode?.insertBefore(lightStatusDiv, rangeVal.nextSibling);

        applySectionBackgrounds();
        updateHexValues();
        bindEvents();
        updateSplitUI();
        turnLightOn(initialValues.lightTemperature);
    }

    initialize();
});
