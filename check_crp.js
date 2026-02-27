const WP_URL = 'https://bootflare.com';

async function checkCRP() {
    // VS Code database ID might be around 32560 based on other logs or I can just test a few
    const logoId = 32560; // Just an example, I should find a real one
    const endpoints = [
        `wp-json/contextual-related-posts/v1/posts/${logoId}?limit=8`,
        `wp-json/contextual-related-posts/v1/posts/${logoId}?count=8`,
        `wp-json/contextual-related-posts/v1/posts/${logoId}?posts_per_page=8`
    ];

    for (const endpoint of endpoints) {
        const url = `${WP_URL}/${endpoint}`;
        console.log(`Checking ${url}...`);
        try {
            const res = await fetch(url);
            const data = await res.json();
            console.log(`Results for ${endpoint}: ${Array.isArray(data) ? data.length : 'Not an array'}`);
            if (Array.isArray(data) && data.length > 0) {
                console.log('Sample IDs:', data.slice(0, 2).map(i => i.id || i.ID));
            }
        } catch (e) {
            console.error(`Failed ${url}:`, e.message);
        }
    }
}

checkCRP();
