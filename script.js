const puppeteer = require('puppeteer');

function shuffle(array) {
    var n = array.length, t, i;

    while (n) {
        i = Math.floor(Math.random() * n--);
        t = array[n];
        array[n] = array[i];
        array[i] = t;
    }

    return array;
}


(async() => {
    // Initialize a browser
    const browser = await puppeteer.launch({
        executablePath: '/usr/bin/chromium-browser',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox'
        ]
    });

    // Initialize a page
    const page = await browser.newPage();
    if (CYBOZU_BASICAUTH_USER && CYBOZU_BASICAUTH_PASS) {
        page.authenticate({
            username: CYBOZU_BASICAUTH_USER,
            password: CYBOZU_BASICAUTH_PASS
        });
    }

    // Detect login status
    await page.goto(CYBOZU_BASEURL);
    const logged_in = await page.evaluate(() => {
        const node = document.querySelectorAll(".vr_Loginbase");
        console.log('done');
        return node.length ? true : false;
    });

    // Login if needed
    if (!logged_in) {
        await page.type('input[name="_Account"]', CYBOZU_USERNAME);
        await page.type('input[name="Password"]', CYBOZU_PASSWORD);

        page.click('input[name="Submit"]');
        await page.waitForNavigation({
            waitUntil: 'domcontentloaded'
        });
    }

    // Move to UserListIndex page
    await page.goto(CYBOZU_BASEURL + '?page=UserListIndex&GID=5642', { waitUntil: "domcontentloaded" });

    // scrape user list
    const users = await page.evaluate(() => {
        const users = [];
        const rows = document.querySelectorAll('table[class="dataList"] > tbody > tr');
        rows.forEach(row => {
            name = row.children[0].innerText.trim();
            email = row.children[2].innerText.trim();
            users.push([name, email]);
        })
        users.shift();  // remove heading
        return users;
    });

    // shuffle and celebrate TOP5 members!
    shuffle(users).slice(0, 10).forEach((user, index) => {
        console.log(`${index + 1}. ${user[0]} (${user[1] })`);
    });
    browser.close();
})();
