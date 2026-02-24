async function inspect() {
    const url_logo = 'https://bootflare.com/wp-json/wp/v2/logo?per_page=1';
    const url_music = 'https://bootflare.com/wp-json/wp/v2/sr_playlist?per_page=1';

    try {
        console.log("Checking Logos...");
        const resL = await fetch(url_logo);
        const textL = await resL.text();
        const jsonL = textL.substring(textL.indexOf('['));
        const dataL = JSON.parse(jsonL);
        if (dataL[0].custom_fields) {
            console.log("Logo Custom Fields found:", Object.keys(dataL[0].custom_fields).join(', '));
        } else {
            console.log("Logo Custom Fields NOT found.");
        }

        console.log("\nChecking Music...");
        const resM = await fetch(url_music);
        const textM = await resM.text();
        const jsonM = textM.substring(textM.indexOf('['));
        const dataM = JSON.parse(jsonM);
        if (dataM[0].custom_fields) {
            console.log("Music Custom Fields found:", Object.keys(dataM[0].custom_fields).join(', '));
            // Sonaar fields usually start with 'snor_' or similar
            const sonaarFields = Object.keys(dataM[0].custom_fields).filter(k => k.includes('snoar') || k.includes('track') || k.includes('file'));
            console.log("Sonaar related fields:", sonaarFields);
        } else {
            console.log("Music Custom Fields NOT found.");
        }
    } catch (e) {
        console.error(e);
    }
}
inspect();
