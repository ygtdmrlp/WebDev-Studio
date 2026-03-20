import * as monaco from 'monaco-editor';
import { ProjectFile } from './storage';

// @ts-ignore
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
// @ts-ignore
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
// @ts-ignore
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
// @ts-ignore
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
// @ts-ignore
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';

// Monaco Worker Configuration for Vite
// @ts-ignore
window.MonacoEnvironment = {
    getWorker(_: any, label: string) {
        if (label === 'json') {
            return new jsonWorker();
        }
        if (label === 'css' || label === 'scss' || label === 'less') {
            return new cssWorker();
        }
        if (label === 'html' || label === 'handlebars' || label === 'razor') {
            return new htmlWorker();
        }
        if (label === 'typescript' || label === 'javascript') {
            return new tsWorker();
        }
        return new editorWorker();
    }
};

export type Language = 'html' | 'css' | 'javascript';

class EditorManager {
    private editor: monaco.editor.IStandaloneCodeEditor | null = null;
    private currentProject: ProjectFile | null = null;
    private currentLang: Language = 'html';
    private models: Record<Language, monaco.editor.ITextModel> = {
        html: monaco.editor.createModel('', 'html'),
        css: monaco.editor.createModel('', 'css'),
        javascript: monaco.editor.createModel('', 'javascript')
    };
    private onChangeListeners: ((lang: Language, value: string) => void)[] = [];

    init(container: HTMLElement) {
        this.editor = monaco.editor.create(container, {
            theme: document.documentElement.classList.contains('dark') ? 'vs-dark' : 'vs',
            automaticLayout: true,
            fontSize: 14,
            minimap: { enabled: false },
            padding: { top: 16 },
            scrollbar: {
                vertical: 'visible',
                horizontal: 'visible',
                useShadows: false,
                verticalScrollbarSize: 8,
                horizontalScrollbarSize: 8
            }
        });

        // Add event listeners for content changes
        Object.keys(this.models).forEach((key) => {
            const lang = key as Language;
            this.models[lang].onDidChangeContent(() => {
                if (this.currentProject) {
                    this.currentProject[lang] = this.models[lang].getValue();
                    this.onChangeListeners.forEach(l => l(lang, this.models[lang].getValue()));
                }
            });
        });

        this.setLanguage('html');
    }

    setProject(project: ProjectFile) {
        this.currentProject = project;
        this.models.html.setValue(project.html);
        this.models.css.setValue(project.css);
        this.models.javascript.setValue(project.js);
        this.setLanguage(this.currentLang);
    }

    setLanguage(lang: Language) {
        this.currentLang = lang;
        if (this.editor) {
            this.editor.setModel(this.models[lang]);
        }
    }

    setTheme(isDark: boolean) {
        monaco.editor.setTheme(isDark ? 'vs-dark' : 'vs');
    }

    onContentChange(callback: (lang: Language, value: string) => void) {
        this.onChangeListeners.push(callback);
    }

    getProject(): ProjectFile | null {
        return this.currentProject;
    }

    getCurrentContent(): string {
        return this.models[this.currentLang].getValue();
    }
}

export const editorManager = new EditorManager();
