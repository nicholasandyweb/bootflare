async function checkTotal() {
    const endpoints = ['logo', 'sr_playlist', 'logos'];
    for (const ep of endpoints) {
        const res = await fetch(`https://bootflare.com/wp-json/wp/v2/${ep}?per_page=1`);
        console.log(`${ep}: ${res.headers.get('x-wp-total')}`);
    }
}
checkTotal();
