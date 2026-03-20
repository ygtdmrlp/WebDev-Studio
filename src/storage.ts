import localforage from 'localforage';

export interface ProjectFile {
    id: string;
    name: string;
    html: string;
    css: string;
    js: string;
    updatedAt: number;
}

const storage = localforage.createInstance({
    name: 'webdev-studio',
    storeName: 'projects'
});

export const getProjects = async (): Promise<ProjectFile[]> => {
    const keys = await storage.keys();
    const projects = await Promise.all(keys.map(key => storage.getItem<ProjectFile>(key)));
    return (projects.filter(Boolean) as ProjectFile[]).sort((a, b) => b.updatedAt - a.updatedAt);
};

export const saveProject = async (project: ProjectFile): Promise<void> => {
    await storage.setItem(project.id, {
        ...project,
        updatedAt: Date.now()
    });
};

export const getProject = async (id: string): Promise<ProjectFile | null> => {
    return await storage.getItem<ProjectFile>(id);
};

export const deleteProject = async (id: string): Promise<void> => {
    await storage.removeItem(id);
};

export const createNewProject = (name: string = 'Untitled Project'): ProjectFile => {
    return {
        id: crypto.randomUUID(),
        name,
        html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${name}</title>
</head>
<body>
    <h1>Hello World!</h1>
    <p>Welcome to WebDev Studio.</p>
</body>
</html>`,
        css: `body {
    font-family: system-ui, -apple-system, sans-serif;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    margin: 0;
    background: #f0f2f5;
    color: #1c1e21;
}

h1 {
    color: #4f46e5;
    font-size: 3rem;
    margin-bottom: 0.5rem;
}

p {
    color: #4b5563;
    font-size: 1.25rem;
}`,
        js: `console.log('Project loaded!');`,
        updatedAt: Date.now()
    };
};
