import { createIcons, Code2, Plus, Save, Download, LayoutTemplate, Sun, Moon, Maximize, Share2, FilePlus2, X, File, CheckCircle, Trash2, Upload, Info, User, Lightbulb, Zap, Check, Github, FileText } from 'lucide';
import { editorManager, Language } from './editor';
import { getProjects, saveProject, createNewProject, ProjectFile, deleteProject } from './storage';
import { templates } from './templates';

// Initialize Lucide Icons
const icons = {
    Code2, Plus, Save, Download, LayoutTemplate, Sun, Moon, Maximize, Share2, FilePlus2, X, File, CheckCircle, Trash2, Upload, Info, User, Lightbulb, Zap, Check, Github, FileText
};

function initIcons() {
    createIcons({ icons });
}

// State
let currentProject: ProjectFile;
let isDarkMode = document.documentElement.classList.contains('dark');

// DOM Elements
const editorContainer = document.getElementById('editor-container')!;
const previewIframe = document.getElementById('preview-iframe') as HTMLIFrameElement;
const btnNew = document.getElementById('btn-new')!;
const btnUpload = document.getElementById('btn-upload')!;
const inputUpload = document.getElementById('input-upload') as HTMLInputElement;
const btnSave = document.getElementById('btn-save')!;
const btnDelete = document.getElementById('btn-delete')!;
const btnDownload = document.getElementById('btn-download')!;
const btnTemplates = document.getElementById('btn-templates')!;
const btnAbout = document.getElementById('btn-about')!;
const btnLicense = document.getElementById('btn-license')!;
const btnThemeToggle = document.getElementById('btn-theme-toggle')!;
const btnPreviewFullscreen = document.getElementById('btn-preview-fullscreen')!;
const btnShare = document.getElementById('btn-share')!;
const fileListContainer = document.getElementById('file-list')!;
const activeFilename = document.getElementById('active-filename')!;
const tabBtns = document.querySelectorAll('.tab-btn');
const toast = document.getElementById('toast')!;
const toastMessage = document.getElementById('toast-message')!;

// Modal Elements
const modalContainer = document.getElementById('modal-container')!;
const templatesModal = document.getElementById('templates-modal')!;
const aboutModal = document.getElementById('about-modal')!;
const licenseModal = document.getElementById('license-modal')!;
const templateCardsContainer = templatesModal.querySelector('.grid')!;
const closeModals = document.querySelectorAll('.close-modal');

// Functions
async function init() {
    initIcons();
    
    // Initialize Editor
    editorManager.init(editorContainer);
    
    // Load projects or create new one
    const projects = await getProjects();
    if (projects.length > 0) {
        currentProject = projects[0];
    } else {
        currentProject = createNewProject('index.html');
        await saveProject(currentProject);
    }
    
    loadProject(currentProject);
    renderFileList();
    
    // Set up editor change listener
    editorManager.onContentChange(() => {
        updatePreview();
        debouncedSave();
    });
    
    setupEventListeners();
}

function loadProject(project: ProjectFile) {
    currentProject = project;
    editorManager.setProject(project);
    activeFilename.textContent = project.name;
    updatePreview();
    
    // Update active state in sidebar
    document.querySelectorAll('.file-item').forEach(item => {
        item.classList.toggle('active', item.getAttribute('data-id') === project.id);
    });
}

function updatePreview() {
    const project = currentProject;
    const blob = new Blob([`
        <!DOCTYPE html>
        <html>
            <head>
                <style>${project.css}</style>
            </head>
            <body>
                ${project.html}
                <script>${project.js}<\/script>
            </body>
        </html>
    `], { type: 'text/html' });
    
    const url = URL.createObjectURL(blob);
    previewIframe.src = url;
}

async function renderFileList() {
    const projects = await getProjects();
    fileListContainer.innerHTML = '';
    
    projects.forEach(project => {
        const item = document.createElement('div');
        item.className = `file-item group ${project.id === currentProject.id ? 'active' : ''}`;
        item.setAttribute('data-id', project.id);
        item.innerHTML = `
            <i data-lucide="file" class="w-4 h-4"></i>
            <span class="flex-1 truncate">${project.name}</span>
            <button class="delete-btn p-1 hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-500 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                <i data-lucide="trash-2" class="w-3 h-3"></i>
            </button>
        `;
        
        item.addEventListener('click', (e) => {
            if ((e.target as HTMLElement).closest('.delete-btn')) return;
            loadProject(project);
        });

        const nameSpan = item.querySelector('span')!;
        nameSpan.addEventListener('dblclick', async (e) => {
            e.stopPropagation();
            const newName = prompt('Dosya adını değiştir:', project.name);
            if (newName && newName !== project.name) {
                project.name = newName;
                await saveProject(project);
                if (currentProject.id === project.id) {
                    activeFilename.textContent = newName;
                }
                renderFileList();
            }
        });

        const deleteBtn = item.querySelector('.delete-btn')!;
        deleteBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            if (confirm(`"${project.name}" projesini silmek istediğinize emin misiniz?`)) {
                const projects = await getProjects();
                if (projects.length <= 1) {
                    showToast('En az bir proje olmalıdır!');
                    return;
                }
                
                // Delete logic
                await deleteProject(project.id);
                if (currentProject.id === project.id) {
                    const remaining = await getProjects();
                    loadProject(remaining[0]);
                }
                renderFileList();
                showToast('Proje silindi');
            }
        });
        fileListContainer.appendChild(item);
    });
    
    initIcons();
}

let saveTimeout: number;
function debouncedSave() {
    clearTimeout(saveTimeout);
    saveTimeout = window.setTimeout(async () => {
        await saveProject(currentProject);
        showToast('Otomatik kaydedildi');
    }, 2000);
}

function showToast(message: string) {
    toastMessage.textContent = message;
    toast.classList.add('toast-show');
    setTimeout(() => toast.classList.remove('toast-show'), 3000);
}

const resizer = document.getElementById('resizer')!;
const editorPanel = editorContainer.parentElement!;
const previewPanel = previewIframe.parentElement!;

function setupResizer() {
    let isResizing = false;

    resizer.addEventListener('mousedown', () => {
        isResizing = true;
        document.body.style.cursor = 'col-resize';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;

        const containerWidth = editorPanel.parentElement!.clientWidth;
        const leftWidth = (e.clientX / containerWidth) * 100;
        const rightWidth = 100 - leftWidth;

        if (leftWidth > 20 && leftWidth < 80) {
            editorPanel.style.flex = `0 0 ${leftWidth}%`;
            previewPanel.style.flex = `0 0 ${rightWidth}%`;
        }
    });

    document.addEventListener('mouseup', () => {
        isResizing = false;
        document.body.style.cursor = 'default';
    });
}

function setupTemplates() {
    templateCardsContainer.innerHTML = '';
    templates.forEach(template => {
        const card = document.createElement('div');
        card.className = 'template-card p-4 border-2 border-transparent hover:border-indigo-600 bg-gray-50 dark:bg-slate-900 rounded-xl cursor-pointer transition-all group';
        card.innerHTML = `
            <div class="aspect-video bg-gray-200 dark:bg-slate-800 rounded-lg mb-4 flex items-center justify-center">
                <i data-lucide="${template.icon}" class="w-10 h-10 text-gray-400"></i>
            </div>
            <h3 class="font-bold">${template.name}</h3>
            <p class="text-sm text-gray-500">${template.description}</p>
        `;
        card.addEventListener('click', async () => {
            const project = createNewProject(`${template.name}.html`);
            project.html = template.html;
            project.css = template.css;
            project.js = template.js;
            await saveProject(project);
            loadProject(project);
            renderFileList();
            closeModal();
        });
        templateCardsContainer.appendChild(card);
    });
    initIcons();
}

function openModal(modal: HTMLElement) {
    modalContainer.classList.remove('hidden');
    modalContainer.classList.add('flex');
    modal.classList.remove('hidden');
}

function closeModal() {
    modalContainer.classList.add('hidden');
    modalContainer.classList.remove('flex');
    templatesModal.classList.add('hidden');
    aboutModal.classList.add('hidden');
    licenseModal.classList.add('hidden');
}

function setupEventListeners() {
    setupResizer();
    setupTemplates();
    
    btnTemplates.addEventListener('click', () => openModal(templatesModal));
    btnAbout.addEventListener('click', () => openModal(aboutModal));
    btnLicense.addEventListener('click', () => openModal(licenseModal));
    closeModals.forEach(btn => btn.addEventListener('click', closeModal));
    modalContainer.addEventListener('click', (e) => {
        if (e.target === modalContainer) closeModal();
    });

    // Tab switching
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.getAttribute('data-lang') as Language;
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            editorManager.setLanguage(lang);
        });
    });
    
    // New Project
    btnNew.addEventListener('click', async () => {
        const name = prompt('Proje adı girin:', 'Yeni Proje.html') || 'index.html';
        const project = createNewProject(name);
        await saveProject(project);
        loadProject(project);
        renderFileList();
    });

    // Upload Project
    btnUpload.addEventListener('click', () => {
        inputUpload.click();
    });

    inputUpload.addEventListener('change', async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            const content = event.target?.result as string;
            if (!content) return;

            // Simple parsing for HTML, CSS, JS
            let html = content;
            let css = '';
            let js = '';

            // Extract CSS from <style> tags
            const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
            let styleMatch;
            while ((styleMatch = styleRegex.exec(content)) !== null) {
                css += styleMatch[1] + '\n';
                html = html.replace(styleMatch[0], '');
            }

            // Extract JS from <script> tags
            const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
            let scriptMatch;
            while ((scriptMatch = scriptRegex.exec(content)) !== null) {
                js += scriptMatch[1] + '\n';
                html = html.replace(scriptMatch[0], '');
            }

            // Clean up empty head/body tags if necessary, but keep it simple for now
            const project = createNewProject(file.name);
            project.html = html.trim();
            project.css = css.trim();
            project.js = js.trim();

            await saveProject(project);
            loadProject(project);
            renderFileList();
            showToast('Dosya yüklendi!');
            
            // Reset input
            inputUpload.value = '';
        };
        reader.readAsText(file);
    });
    
    // Save Project
    btnSave.addEventListener('click', async () => {
        await saveProject(currentProject);
        showToast('Proje kaydedildi!');
    });

    // Delete Current Project
    btnDelete.addEventListener('click', async () => {
        if (confirm(`"${currentProject.name}" projesini silmek istediğinize emin misiniz?`)) {
            const projects = await getProjects();
            if (projects.length <= 1) {
                showToast('En az bir proje olmalıdır!');
                return;
            }
            await deleteProject(currentProject.id);
            const remaining = await getProjects();
            loadProject(remaining[0]);
            renderFileList();
            showToast('Proje silindi');
        }
    });
    
    // Theme Toggle
    btnThemeToggle.addEventListener('click', () => {
        isDarkMode = !isDarkMode;
        document.documentElement.classList.toggle('dark', isDarkMode);
        editorManager.setTheme(isDarkMode);
    });
    
    // Download
    btnDownload.addEventListener('click', () => {
        const project = currentProject;
        const fullHtml = `
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${project.name}</title>
    <style>${project.css}</style>
</head>
<body>
    ${project.html}
    <script>${project.js}<\/script>
</body>
</html>`;
        const blob = new Blob([fullHtml], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = project.name.endsWith('.html') ? project.name : `${project.name}.html`;
        a.click();
        URL.revokeObjectURL(url);
    });

    // Preview Fullscreen
    btnPreviewFullscreen.addEventListener('click', () => {
        const win = window.open('', '_blank');
        if (win) {
            const project = currentProject;
            win.document.write(`
                <!DOCTYPE html>
                <html>
                    <head>
                        <title>${project.name} - Önizleme</title>
                        <style>${project.css}</style>
                    </head>
                    <body>
                        ${project.html}
                        <script>${project.js}<\/script>
                    </body>
                </html>
            `);
            win.document.close();
        }
    });

    // Share (Mock)
    btnShare.addEventListener('click', () => {
        const shareText = `WebDev Studio Projesi: ${currentProject.name}`;
        if (navigator.share) {
            navigator.share({
                title: 'WebDev Studio',
                text: shareText,
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            showToast('Link kopyalandı!');
        }
    });
}

// Start app
init();
