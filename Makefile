run:
	@docker run -i --init --rm --cap-add=SYS_ADMIN \
		-e CYBOZE_PASSWORD=${CYBOZU_PASSWORD} \
		--name puppeteer-chrome -v `pwd`:/mnt \
		puppeteer-chrome-linux \
		node -e "`cat config.js script.js`"

build:
	docker build -t puppeteer-chrome-linux .
