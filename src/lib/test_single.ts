import fs from 'fs';
const WP_URL = 'https://bootflare.com';

async function testSingleMusic() {
    try {
        const url = `${WP_URL}/wp-json/wp/v2/sr_playlist?per_page=1&_embed`;
        const res = await fetch(url);
        const text = await res.text();

        const start = Math.min(text.indexOf('['), text.indexOf('{'));
        const end = Math.max(text.lastIndexOf(']'), text.lastIndexOf('}'));
        const json = JSON.parse(text.substring(start, end + 1));

        fs.writeFileSync('music_data.json', JSON.stringify(json[0], null, 2));
        console.log('Saved to music_data.json');
    } catch (error) {
        console.error('Error:', error);
    }
}

testSingleMusic();
