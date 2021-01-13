self.addEventListener('install', (ev) => {

  console.log('Service Worker installed');

  self.skipWaiting()

});

self.addEventListener('activate', (ev) => {

  console.log('Service Worker activated');

  show();
  self.skipWaiting()

});

self.addEventListener('message', (ev) => {

  setTimeout(() => {

      console.log('Service Worker resumed on message');

      show();
    }, 200)

})

let redirected = false;
let path = '****';

self.addEventListener('notificationclick', async (ev) => {

  console.log('Clicked!');

  if (ev.action === 'update' || ev.action === 'retry') {

    console.log('clicked update');
    show();

  } else if (ev.action === 'sigg') {
    show();
    console.log('clicked sigg');

    ev.waitUntil(clients.matchAll({
      type: "window"
    })
    .then((clientList) => {
      for (let i = 0; i < clientList.length; i++) {
        let client = clientList[i];

        if (client.url == 'https://sigg.gpw.pl/' && 'focus' in client) {
          return client.focus()
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('https://sigg.gpw.pl/')
      }
    })
    );

    redirected = true;
    ev.notification.close();

  } else if (ev.action === 'order') {

    console.log('clicked order');
    show();
    ev.waitUntil(clients.matchAll({
      type: "window"
    })
    .then((clientList) => {
      for (let i = 0; i < clientList.length; i++) {
        let client = clientList[i];

        if (client.url == 'https://sigg.gpw.pl/exchange-order/action' && 'focus' in client) {
          return client.focus()
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('https://sigg.gpw.pl/exchange-order/action')
      }
    })
    );

    redirected = true;
    ev.notification.close();

  } else {

    console.log('clicked else');
    show();
    ev.waitUntil(clients.matchAll({
      type: "window"
    })
    .then((clientList) => {
      for (let i = 0; i < clientList.length; i++) {
        let client = clientList[i];

        if (client.url == path + 'live/' && 'focus' in client) {
          return client.focus()
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(path + 'live/')
      }
    })
    );

    redirected = true;
    ev.notification.close();

  }

})

let closed = 0;

self.addEventListener('notificationclose', async (ev) => {

  console.log('Closed!');

  if (!redirected) {

    closed = 0;

  } else {

    closed++;

    if (closed <= 3) {
      show();
    }

  }

})


// let inc = 1;
let free;
let username;
let stocks;
let debts;
let transfers;
let orders;
let profit;
let pastProfit;
let rate;
let rank;
let diff;
let sign;
let letters;
let letters2;
let temp;

let title = 'ERROR';

let actions = {
  'actions': [
  // {
  //   action: 'order',
  //   title: 'Zlecenie'
  // },
  {
    action: 'sigg',
    title: 'Portfel'
  },
  {
    action: 'update',
    title: 'Odśwież portfel'
  }
]};

let options = {
  body: 'Nie wiem co tu się stało.',
  silent: true,
  tag: 'sigg',
  dir: 'ltr',
  badge: './badge.png',
  icon: 'right.png',
  requireInteraction: true,
  ...actions
}

let waitTitle = 'Odświeżanie...';

let waitActions = {
  'actions': [
  {
    action: 'update',
    title: 'Spróbuj Ponownie'
  }
]};

let waitOptions = {
  body: 'Oczekiwanie na serwer SIGG',
  silent: true,
  tag: 'sigg',
  dir: 'ltr',
  badge: './badge.png',
  icon: 'gpwLogo.png',
  requireInteraction: true,
  ...waitActions
}



const show = async () => {

  self.registration.showNotification(waitTitle, waitOptions);

  const resp = await getData();

  if (resp === 'getData success') {

    title = username;
    // simulate second column on android
    letters = Math.ceil((25 - title.length - profit.toString().length)*2.65);
    for (let i = 0; i < letters; i++) {
      title += '\u00A0';
    }

    title += `${profit} PLN`;

    letters2 = Math.round((8 - profit.toString().length));
    for (let i = 0; i < letters2; i++) {
      title += '\u00A0';
    }

    title += `${rate}%`;

    options.body = '';
    stocks.forEach((company) => {

      name = Object.getOwnPropertyNames(company)[0];

      if (name != 'END') {

        options.body += `${name}:`

        letters = Math.ceil((24 - name.length - company[name][0].length)*2.25);
        for (let i = 0; i < letters; i++) {
          options.body += '\u00A0';
        }
        options.body += `${company[name][0]} PLN`;

        letters2 = Math.round((9 - company[name][0].length));
        for (let i = 0; i < letters2; i++) {
          options.body += '\u00A0';
        }
        options.body += `${company[name][1]}%\n`;

      }

    }); // end forEach

    temp = 'Należności:'
    options.body += temp;
    letters = Math.round((24 - temp.length - debts.length)*3.25);
    for (let i = 0; i < letters; i++) {
      options.body += '\u00A0';
    }

    options.body += `${debts} PLN\n`;

    temp = 'Wolne środki:';
    options.body += temp;
    letters = Math.round((26 - temp.length - free.length)*3);
    for (let i = 0; i < letters; i++) {
      options.body += '\u00A0';
    }

    options.body += `${free} PLN\n`;

    temp = 'Miejsce w rankingu:';
    options.body += temp;
    letters = Math.round((32 - temp.length - rank.length - diff.length - 2)*2.75);
    for (let i = 0; i < letters; i++) {
      options.body += '\u00A0';
    }

    options.body += `${rank} (${diff})`;

    if (profit === pastProfit || pastProfit === 0) {

      options.icon = './right.png';

    } else if (profit > pastProfit && pastProfit != 0) {

      options.icon = './up.png';

    } else if (profit < pastProfit && pastProfit != 0) {

      options.icon = './down.png';

    } else {

      title = 'ERROR';
      options.icon = '';

    }

    await setTimeout(() => {
      self.registration.showNotification(title, options);
    }, 50);

  } else {
    self.registration.showNotification('ERROR',
    {
      ...waitOptions,
      body: 'Jeszcze nie wiem co tu się stało. \n Testuje nowy system pobierania danych.'
    }
    );

  }

}

const getData = () => {
  let promise1 = new Promise(async (resolve, reject) => {

  	console.log('fetching');

  	const response = await fetch(`scraper.php`)
    .catch(() => {

      console.log('fetch no internet');

      self.registration.showNotification(waitTitle,
        {
          ...waitOptions,
          body: 'Wygląda na to, że nie masz połączenia z internetem'
        }
      );
      reject('no_internet');

      setTimeout(getData(), 500);

      return
    });

		if (response.status === 200) {

			const jsonData = await response.text();
		  console.log(`fetched`)

      try {
  			const data = JSON.parse(jsonData);

        username = data['USERNAME'].replace(/@.*$/,"");
  			free = data['WOLNE'];
  			stocks = data.stocks;
  			debts = data['NALEŻNOŚCI (T+2)'];
  			transfers = Number(data['TRANSFERY']);
  			orders = data['ZLECENIA'];
  			profit = Number(data['ZYSK']);
  			pastProfit = Number(data['PAST']);
  			rate = Number(data['STOPA']);
  			rank = data['RANK'];
  			diff = data['DIFF'];

        if (!isNaN(profit)) {
          console.warn('getData success ' + profit);
          resolve('getData success')
        }

      } catch (err) {
        console.warn('JSON INVALID');
        console.warn(err);
        console.warn(jsonData);
        reject('json_invalid')
        return
      }

    } else {
      console.warn(`Fetch failed. Status: ${response.status}`);
      reject('fetch_failed')
      return
    }

  }); // end promise

return promise1;
}
