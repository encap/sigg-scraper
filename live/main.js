let path = window.location.origin + '/sigg/';

document.body.onclick = () => document.documentElement.webkitRequestFullScreen();

getData();

let interval = window.setInterval(() => getData(), 3400);

window.onfocus = () => {
	interval = window.setInterval(() => getData(), 3400);
}

window.onblur = () => {
	window.clearInterval(interval);
}

async function getData() {

	console.log('fetching');

	try {

		const response = await fetch(`../scraper.php`);

		if (response.status === 200) {

			const jsonData = await response.text();
		  console.log(`fetched`)
			const data = JSON.parse(jsonData);
			console.log(data)

			const username = data['USERNAME'].replace(/@.*$/,"");
			const free = Number(data['WOLNE']);
			const stocks = data.stocks;
			const debts = Number(data['NALEŻNOŚCI (T+2)']);
			const transfers = Number(data['TRANSFERY']);
			const orders = Number(data['ZLECENIA']);
			const profit = Number(data['ZYSK']);
			const pastProfit = Number(data['PAST']);
			const rate = Number(data['STOPA']);
			const rank = Number(data['RANK']);
			const diff = Number(data['DIFF']);

			console.log(pastProfit);
			console.log(profit);

			profitEl.innerText = profit;

			let profitRateSign = '&#9654;';

			if (profit === pastProfit || pastProfit === 0) {

				profitEl.style.color='white';
				rateEl.style.color = 'white';
				profitRateSign = '&#9654;';
				console.log('=');

			} else if (profit > pastProfit && pastProfit != 0) {

				profitEl.style.color='var(--green)';
				rateEl.style.color = 'var(--green)';
				profitRateSign = '&#9650;';

				if (Math.floor(profit) > Math.floor(pastProfit + 50)) {

					var audio = new Audio('up.mp3');
					audio.play();

				}

				console.log('+');

			} else if (profit < pastProfit) {

				rateEl.style.color = 'var(--red)';
				profitRateSign = '&#9660;';
				profitEl.style.color='var(--red)';

				if (Math.floor(profit) < Math.floor(pastProfit - 50)) {
					var audio = new Audio('3.mp3');
					audio.play();
				}

				console.log('-');

			} else {

				profitEl.innerText = 'Not a number';

			}

			rateSignEl.innerHTML= profitRateSign;
			rateEl.innerText = rate + '%';

			let name;
			let color;
			let rateSign = '&#9654;';

			stocksEl.innerHTML = '';
			stocks.forEach((company) => {

				name = Object.getOwnPropertyNames(company)[0];
				if (name != 'END') {

					if (company[name][1] < 0) {

						color = 'var(--red)';
						rateSign = '&#9660;';

					} else if (company[name][1] > 0) {

						color = 'var(--green)';
						rateSign = '&#9650;';

					} else {

						color = 'white';
						rateSign = '&#9654;';

					}

					stocksEl.innerHTML += `
					<p>
						<span class="name">${name} </span>
						<span class="stock_stats">
							<span class="value">${company[name][0]} </span>
							<span class="rate" style="color: ${color}"><span class="rateSign">${rateSign}</span><span>${company[name][1]}%</span>
						</span>
					</p>
					`;
				}

			}); // end forEach

			debtsEl.innerText = debts;
			freeEl.innerText = free;
			ordersEl.innerText = orders;
			transfersEl.innerText = transfers;

			rankEl.innerHTML = `${rank} (<span id="diffEl">${diff}</span>)`;

			if (diff < 0) {
				diffEl.style.color = 'var(--red)';
			} else if (diff > 0) {
				diffEl.style.color = 'var(--green)';
			} else {
				diffEl.style.color = 'white';
			}

		} else {
			throw new Error(`404 not found`);
		}

	} catch (e) {

		console.error(e);
		redirect('..');

	}

}

function redirect(url = '.', absolute = false) {

    if (url === '.') {
      window.location.reload(true);
    } else if (url === '..') {
      window.location = url;
    }  else if (absolute) {
      window.location = 'https://' + url;
    } else {
      window.location = path + url;
    }

}

function getCookie(name) {

    let v = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
    return v ? v[2] : null;

}

function setCookie(name, value, days) {

    let d = new Date;
    d.setTime(d.getTime() + 24*60*60*1000*days);
    document.cookie = name + "=" + value + ";path=/;expires=" + d.toGMTString();

}
