// Массив для хранения данных об обоях
let wallpapers = [];

// Цвета по умолчанию для категорий
const categoryColors = {
    anime: "#7ed6df",
    nature: "#27ae60",
    pixel: "#0a0a0a",
    minimal: "#2c3e50",
    space: "#0c0d3d",
    blue: "#0277bd"
};

// Функция для загрузки списка видео файлов
function loadWallpapers() {
    // Список видео файлов, которые фактически существуют в папке
    const videoFiles = [
        'Евангелион_anime.mp4',
        'Самурай_anime.mp4',
        'фрирен_anime.mp4',
        'AVATAR_anime.mp4',
        'blue_anime.mp4',
        'frieren-sitting-on-the-water-moewalls_anime.mp4',
        'frieren-starry-night-flower_anime.mp4',
        'hollow-knight-silksong_anime.mp4'
    ];
    
    // Парсим имена файлов и создаем объекты обоев
    wallpapers = videoFiles.map((filename, index) => {
        return parseWallpaperFromFilename(filename, index + 1);
    });
    
    console.log('Загружено обоев:', wallpapers.length);
}

// Функция для парсинга имени файла и создания объекта обоев
function parseWallpaperFromFilename(filename, id) {
    // Удаляем расширение файла
    const nameWithoutExt = filename.replace('.mp4', '');
    
    // Разделяем название и теги
    const parts = nameWithoutExt.split('__');
    
    let title = '';
    let categories = [];
    
    if (parts.length >= 2) {
        // Получаем название, заменяем дефисы на пробелы и делаем первую букву заглавной
        title = parts[0].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        
        // Получаем теги
        categories = parts[1].split('_');
    } else {
        // Если формат не соответствует ожидаемому, используем имя файла как название
        // и пытаемся извлечь категории из имени
        const nameParts = nameWithoutExt.split('_');
        
        if (nameParts.length > 1) {
            // Если есть подчеркивания, считаем первую часть названием, остальные - категориями
            title = nameParts[0].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            categories = nameParts.slice(1);
        } else {
            // Иначе используем все имя как название
            title = nameWithoutExt.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            
            // Пытаемся определить категории из названия
            if (nameWithoutExt.toLowerCase().includes('anime')) {
                categories.push('anime');
            }
            if (nameWithoutExt.toLowerCase().includes('blue')) {
                categories.push('blue');
            }
        }
        
        // Если категории все еще не определены, добавляем 'minimal' по умолчанию
        if (categories.length === 0) {
            categories.push('minimal');
        }
    }
    
    // Определяем цвет на основе первой категории
    const color = categoryColors[categories[0]] || "#1e1e1e";
    
    // Создаем описание
    let description = `Живые обои "${title}"`;
    
    // Путь к видео и миниатюре
    const video = `images/videos/${filename}`;
    const thumbnail = `images/thumbnails/${filename.replace('.mp4', '.jpg')}`;
    
    return {
        id,
        title,
        categories,
        thumbnail,
        video,
        description,
        color
    };
}

// DOM элементы
const wallpapersGrid = document.querySelector('.wallpapers-grid');
const categoryButtons = document.querySelectorAll('.categories li');
const previewModal = document.querySelector('.preview-modal');
const previewVideo = document.querySelector('.wallpaper-preview video');
const previewTitle = document.querySelector('.preview-title');
const previewCategories = document.querySelector('.preview-categories');
const closePreviewBtn = document.querySelector('.close-preview');
const downloadBtn = document.querySelector('.download-btn');
const searchInput = document.querySelector('.search-bar input');
const searchButton = document.querySelector('.search-bar button');

// Текущая выбранная категория
let currentCategory = 'all';
let searchQuery = '';

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    // Загружаем данные об обоях
    loadWallpapers();
    
    // Затем отображаем обои и настраиваем обработчики событий
    renderWallpapers();
    setupEventListeners();
});

// Отображение обоев
function renderWallpapers() {
    wallpapersGrid.innerHTML = '';
    
    const filteredWallpapers = wallpapers.filter(wallpaper => {
        // Фильтрация по категории
        const categoryMatch = currentCategory === 'all' || wallpaper.categories.includes(currentCategory);
        
        // Фильтрация по поисковому запросу
        const searchMatch = searchQuery === '' ||
            wallpaper.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            wallpaper.categories.some(cat => cat.toLowerCase().includes(searchQuery.toLowerCase()));
        
        return categoryMatch && searchMatch;
    });
    
    if (filteredWallpapers.length === 0) {
        wallpapersGrid.innerHTML = '<div class="no-results">Обои не найдены</div>';
        return;
    }
    
    filteredWallpapers.forEach(wallpaper => {
        const wallpaperCard = document.createElement('div');
        wallpaperCard.className = 'wallpaper-card';
        
        // Форматирование категорий для отображения
        const categoriesHTML = wallpaper.categories.map(category => {
            let categoryName;
            switch(category) {
                case 'anime': categoryName = 'Аниме'; break;
                case 'nature': categoryName = 'Природа'; break;
                case 'pixel': categoryName = 'Пиксели'; break;
                case 'minimal': categoryName = 'Минимализм'; break;
                case 'space': categoryName = 'Космос'; break;
                case 'blue': categoryName = 'Синий'; break;
                default: categoryName = category;
            }
            return `<span class="category-tag">${categoryName}</span>`;
        }).join('');
        
        // Создаем HTML для карточки
        wallpaperCard.innerHTML = `
            <div class="wallpaper-thumbnail">
                <video loop muted autoplay>
                    <source src="${wallpaper.video}" type="video/mp4">
                    <p>Ваш браузер не поддерживает HTML5 видео</p>
                </video>
            </div>
            <div class="wallpaper-info">
                <h3 class="wallpaper-title">${wallpaper.title}</h3>
                <div class="wallpaper-categories">
                    ${categoriesHTML}
                </div>
                <div class="wallpaper-actions">
                    <button class="try-btn" data-id="${wallpaper.id}" onclick="openPreview(${wallpaper.id}); console.log('Клик по кнопке Примерить');">Примерить</button>
                    <button class="download-card-btn" data-id="${wallpaper.id}">
                        <i class="fas fa-download"></i>
                    </button>
                </div>
            </div>
        `;
        
        wallpapersGrid.appendChild(wallpaperCard);
        
        // Добавляем обработчик для воспроизведения видео при наведении
        const video = wallpaperCard.querySelector('video');
        
        // Обработчик ошибки загрузки видео
        video.addEventListener('error', () => {
            handleVideoError(video, wallpaperCard);
        });
        
        wallpaperCard.addEventListener('mouseenter', () => {
            if (video && !video.error) {
                video.play().catch(err => {
                    console.error('Ошибка воспроизведения видео:', err);
                });
            }
        });
        
        wallpaperCard.addEventListener('mouseleave', () => {
            if (video && !video.error) {
                video.pause();
                video.currentTime = 0;
            }
        });
    });
    
    // Добавляем обработчики для кнопок скачивания
    document.querySelectorAll('.download-card-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            const wallpaperId = parseInt(this.dataset.id);
            downloadWallpaper(wallpaperId);
            e.stopPropagation(); // Предотвращаем всплытие события
        });
    });
    
    // Добавляем прямые обработчики для кнопок "Примерить"
    document.querySelectorAll('.try-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            const wallpaperId = parseInt(this.dataset.id);
            console.log('Клик по кнопке Примерить, ID:', wallpaperId);
            openPreview(wallpaperId);
            e.stopPropagation(); // Предотвращаем всплытие события
        });
    });
    
    console.log('Обработчики событий настроены');
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Переключение категорий
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentCategory = button.dataset.category;
            renderWallpapers();
        });
    });
    
    // Закрытие модального окна
    closePreviewBtn.addEventListener('click', closePreview);
    previewModal.addEventListener('click', (e) => {
        if (e.target === previewModal) {
            closePreview();
        }
    });
    
    // Скачивание из модального окна
    downloadBtn.addEventListener('click', () => {
        const wallpaperId = parseInt(downloadBtn.dataset.id);
        downloadWallpaper(wallpaperId);
    });
    
    // Поиск
    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    // Клавиша Escape для закрытия модального окна
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && previewModal.classList.contains('active')) {
            closePreview();
        }
    });
    
    // Добавляем обработчик для кнопок "Примерить" после рендеринга
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('try-btn')) {
            const wallpaperId = parseInt(e.target.dataset.id);
            openPreview(wallpaperId);
        }
    });
}

// Поиск обоев
function performSearch() {
    searchQuery = searchInput.value.trim();
    renderWallpapers();
}

// Открытие предпросмотра
// Делаем функцию openPreview глобальной
window.openPreview = function(wallpaperId) {
    // Добавляем отладочные сообщения
    console.log('=== Функция openPreview вызвана ===');
    console.log('Функция openPreview вызвана с ID:', wallpaperId);
    
    const wallpaper = wallpapers.find(w => w.id === wallpaperId);
    if (!wallpaper) {
        console.error('Обои с ID', wallpaperId, 'не найдены');
        return;
    }
    
    console.log('Найдены обои:', wallpaper);
    
    // Сбрасываем предыдущее состояние
    const videoContainer = previewVideo.parentElement;
    const previewWindow = document.querySelector('.preview-window');
    
    // Убедимся, что изображение Windows-overlay видимо
    const windowsOverlay = document.querySelector('.windows-overlay');
    if (windowsOverlay) {
        console.log('Windows-overlay найден');
        windowsOverlay.style.display = 'block';
        windowsOverlay.style.zIndex = '10'; // Поверх видео
        windowsOverlay.style.opacity = '1'; // Полная непрозрачность
    } else {
        console.error('Windows-overlay не найден!');
    }
    
    if (videoContainer.querySelector('canvas')) {
        videoContainer.removeChild(videoContainer.querySelector('canvas'));
        videoContainer.appendChild(previewVideo);
    }
    
    // Устанавливаем источник видео
    previewVideo.innerHTML = `
        <source src="${wallpaper.video}" type="video/mp4">
        <p>Ваш браузер не поддерживает HTML5 видео</p>
    `;
    previewVideo.autoplay = true;
    previewVideo.controls = false; // Убираем элементы управления
    
    console.log('Установлен источник видео:', wallpaper.video);
    
    // Обработчик ошибки загрузки видео
    previewVideo.onerror = function() {
        // Создаем canvas для заглушки
        const canvas = document.createElement('canvas');
        canvas.width = 1280;
        canvas.height = 720;
        
        // Создаем градиент
        const ctx = canvas.getContext('2d');
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, wallpaper.color || '#3498db');
        gradient.addColorStop(1, '#2c3e50');
        
        // Заливаем фон градиентом
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Добавляем текст
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = 'bold 40px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(wallpaper.title, canvas.width/2, canvas.height/2);
        
        // Заменяем видео на canvas
        videoContainer.removeChild(previewVideo);
        videoContainer.appendChild(canvas);
        
        // Убедимся, что изображение Windows-overlay видимо даже при ошибке видео
        const windowsOverlay = document.querySelector('.windows-overlay');
        windowsOverlay.style.display = 'block';
        windowsOverlay.style.zIndex = '10'; // Поверх canvas
    };
    previewTitle.textContent = wallpaper.title;
    
    // Форматирование категорий
    const categoriesText = wallpaper.categories.map(category => {
        switch(category) {
            case 'anime': return 'Аниме';
            case 'nature': return 'Природа';
            case 'pixel': return 'Пиксели';
            case 'minimal': return 'Минимализм';
            case 'space': return 'Космос';
            case 'blue': return 'Синий';
            default: return category;
        }
    }).join(', ');
    
    previewCategories.textContent = categoriesText;
    downloadBtn.dataset.id = wallpaperId;
    
    // Делаем модальное окно видимым
    previewModal.style.display = 'flex';
    previewModal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Блокировка прокрутки
    
    console.log('Модальное окно должно быть видимым сейчас');
    
    // Еще раз проверяем, что Windows-overlay видим
    setTimeout(() => {
        const windowsOverlay = document.querySelector('.windows-overlay');
        if (windowsOverlay) {
            console.log('Проверка Windows-overlay после открытия модального окна');
            windowsOverlay.style.display = 'block';
            windowsOverlay.style.zIndex = '10';
            windowsOverlay.style.opacity = '1';
        }
    }, 100);
    
    // Воспроизведение видео
    previewVideo.play().catch(err => {
        console.error('Ошибка воспроизведения видео в предпросмотре:', err);
    });
    
    // Выводим информацию о модальном окне
    console.log('Стиль модального окна:', previewModal.style.display);
    console.log('Классы модального окна:', previewModal.className);
    console.log('Открыто модальное окно предпросмотра для обоев:', wallpaper.title);
    
    // Принудительно обновляем отображение
    setTimeout(() => {
        previewModal.style.opacity = '0';
        setTimeout(() => {
            previewModal.style.opacity = '1';
        }, 50);
    }, 0);
}

// Закрытие предпросмотра
function closePreview() {
    previewModal.classList.remove('active');
    document.body.style.overflow = ''; // Разблокировка прокрутки
    previewVideo.pause();
    previewVideo.currentTime = 0;
}

// Скачивание обоев
function downloadWallpaper(wallpaperId) {
    const wallpaper = wallpapers.find(w => w.id === wallpaperId);
    if (!wallpaper) return;
    
    // В реальном проекте здесь был бы код для скачивания файла
    // Для демонстрации просто создаем ссылку и имитируем скачивание
    
    // В демо-версии просто показываем уведомление
    showNotification(`Скачивание "${wallpaper.title}" началось`);
    
    // Для реального проекта здесь был бы код для скачивания
    const link = document.createElement('a');
    link.href = wallpaper.video;
    link.download = `${wallpaper.title.replace(/\s+/g, '-').toLowerCase()}.mp4`;
    document.body.appendChild(link);
    
    // Обработка ошибки, если файл не существует
    link.onerror = function() {
        showNotification(`Ошибка при скачивании "${wallpaper.title}"`);
    };
    
    link.click();
    document.body.removeChild(link);
    
    // Показываем уведомление о скачивании
    showNotification(`Скачивание "${wallpaper.title}" началось`);
}

// Показ уведомления
function showNotification(message) {
    // Проверяем, существует ли уже контейнер для уведомлений
    let notificationContainer = document.querySelector('.notification-container');
    
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.className = 'notification-container';
        document.body.appendChild(notificationContainer);
        
        // Добавляем стили для контейнера уведомлений
        const style = document.createElement('style');
        style.textContent = `
            .notification-container {
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 1000;
            }
            
            .notification {
                background-color: var(--primary-color);
                color: white;
                padding: 12px 20px;
                margin-top: 10px;
                border-radius: 5px;
                box-shadow: 0 3px 10px rgba(0, 0, 0, 0.3);
                transform: translateX(120%);
                animation: slide-in 0.3s forwards, fade-out 0.3s 3s forwards;
                display: flex;
                align-items: center;
            }
            
            .notification i {
                margin-right: 10px;
            }
            
            @keyframes slide-in {
                to { transform: translateX(0); }
            }
            
            @keyframes fade-out {
                to { 
                    opacity: 0;
                    transform: translateX(120%);
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Создаем уведомление
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `<i class="fas fa-download"></i> ${message}`;
    
    notificationContainer.appendChild(notification);
    
    // Удаляем уведомление после анимации
    setTimeout(() => {
        notification.remove();
    }, 3300);
}

// Функция для обработки ошибок загрузки видео
function handleVideoError(video, wallpaperCard) {
    // Создаем canvas для заглушки
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 360;
    
    // Создаем градиент
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#3498db');
    gradient.addColorStop(1, '#2980b9');
    
    // Заливаем фон градиентом
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Добавляем текст
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Видео недоступно', canvas.width/2, canvas.height/2);
    
    // Заменяем видео на canvas
    const thumbnailDiv = wallpaperCard.querySelector('.wallpaper-thumbnail');
    thumbnailDiv.innerHTML = '';
    thumbnailDiv.appendChild(canvas);
}