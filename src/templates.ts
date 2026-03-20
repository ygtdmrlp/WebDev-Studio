export interface Template {
    id: string;
    name: string;
    description: string;
    html: string;
    css: string;
    js: string;
    icon: string;
}

export const templates: Template[] = [
    {
        id: 'blank',
        name: 'Boş Proje',
        description: 'Temiz bir başlangıç yapın.',
        icon: 'file',
        html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Boş Proje</title>
</head>
<body>
    <h1>Yeni Proje</h1>
    <p>Kodlamaya başlayın!</p>
</body>
</html>`,
        css: `body {
    font-family: sans-serif;
    padding: 2rem;
    text-align: center;
}`,
        js: `console.log('Başlatıldı!');`
    },
    {
        id: 'landing',
        name: 'Landing Page',
        description: 'Modern ve responsive bir karşılama sayfası.',
        icon: 'layout-template',
        html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Modern Landing Page</title>
</head>
<body>
    <nav>
        <div class="logo">MyBrand</div>
        <div class="links">
            <a href="#">Home</a>
            <a href="#">About</a>
            <a href="#">Contact</a>
        </div>
    </nav>
    <header>
        <h1>Build Something Amazing</h1>
        <p>The best way to predict the future is to create it.</p>
        <button class="cta">Get Started</button>
    </header>
    <section class="features">
        <div class="feature">Fast</div>
        <div class="feature">Secure</div>
        <div class="feature">Responsive</div>
    </section>
</body>
</html>`,
        css: `* { box-sizing: border-box; }
body {
    margin: 0;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    line-height: 1.6;
}
nav {
    display: flex;
    justify-content: space-between;
    padding: 1.5rem 10%;
    background: #fff;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}
.logo { font-weight: bold; font-size: 1.5rem; color: #4f46e5; }
.links a { margin-left: 1.5rem; text-decoration: none; color: #333; }
header {
    padding: 100px 10%;
    text-align: center;
    background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
    color: white;
}
header h1 { font-size: 3.5rem; margin-bottom: 1rem; }
header p { font-size: 1.25rem; opacity: 0.9; margin-bottom: 2rem; }
.cta {
    padding: 1rem 2.5rem;
    font-size: 1.1rem;
    background: white;
    color: #4f46e5;
    border: none;
    border-radius: 50px;
    cursor: pointer;
    font-weight: bold;
    transition: transform 0.2s;
}
.cta:hover { transform: scale(1.05); }
.features {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 2rem;
    padding: 80px 10%;
    background: #f9fafb;
}
.feature {
    padding: 2rem;
    background: white;
    border-radius: 12px;
    text-align: center;
    box-shadow: 0 4px 6px rgba(0,0,0,0.05);
    font-weight: bold;
    color: #4f46e5;
}`,
        js: `document.querySelector('.cta').addEventListener('click', () => {
    alert('Welcome to MyBrand!');
});`
    }
];
