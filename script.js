document.addEventListener('DOMContentLoaded', () => {
    // Configure marked
    marked.setOptions({
        renderer: new marked.Renderer(),
        highlight: function (code, lang) {
            const language = hljs.getLanguage(lang) ? lang : 'plaintext';
            return hljs.highlight(code, { language }).value;
        },
        langPrefix: 'hljs language-', // highlight.js css expects a top-level 'hljs' class.
        pedantic: false,
        gfm: true,
        breaks: false,
        sanitize: false,
        smartLists: true,
        smartypants: false,
        xhtml: false
    });

    // Content container
    const contentBox = document.getElementById('content-box');

    // Scripts containing markdown text
    const sections = {
        'overview': document.getElementById('md-overview').textContent,
        'experiment': document.getElementById('md-experiment').textContent,
        'analysis': document.getElementById('md-analysis').textContent
    };

    // Navigation items
    const navItems = document.querySelectorAll('.nav-item');

    function loadContent(sectionId) {
        // Update active class on nav
        navItems.forEach(item => {
            if (item.dataset.section === sectionId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        // Set markdown content
        const rawMarkdown = sections[sectionId];
        const htmlContent = marked.parse(rawMarkdown || '# Content not found');

        // Add animation class
        contentBox.classList.remove('fadeIn');
        void contentBox.offsetWidth; // trigger reflow
        contentBox.classList.add('fadeIn');

        // Render HTML
        contentBox.innerHTML = htmlContent;

        // Render MathJax if present
        if (window.MathJax) {
            MathJax.typesetPromise([contentBox]).catch(function (err) {
                console.error(err);
            });
        }
    }

    // Add click listeners
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const section = item.dataset.section;
            loadContent(section);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });

    // Load default
    loadContent('overview');
});
