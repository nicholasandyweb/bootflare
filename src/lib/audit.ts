import * as fs from 'fs';

async function audit() {
    try {
        const typesRes = await fetch('https://bootflare.com/wp-json/wp/v2/types');
        const types = await typesRes.json();

        const taxRes = await fetch('https://bootflare.com/wp-json/wp/v2/taxonomies');
        const taxonomies = await taxRes.json();

        const auditData = { types, taxonomies };

        fs.writeFileSync('wp_audit.json', JSON.stringify(auditData, null, 2));
        console.log("WP Audit successful. Results written to wp_audit.json");

        console.log("\nDetected Post Types:");
        console.log(Object.keys(types).join(', '));

        const logoType = Object.values(types).find((t: any) => t.name.toLowerCase().includes('logo'));
        if (logoType) {
            console.log("\nLogo Post Type Info:");
            console.log(JSON.stringify(logoType, null, 2));
        } else {
            console.log("\nLogo Post Type NOT FOUND in REST API.");
        }

    } catch (error) {
        console.error('Audit failed:', error);
    }
}

audit();
