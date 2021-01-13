let path = window.location.origin + '/sigg/';

if (getCookie('remember')) {

  container.innerHTML += `
  <div id="actions">

    <button id="repairBtn" onclick="repair(1);">Napraw powiadomienie</button>
    <button id="liveBtn" onclick="redirect('live/')">Przejdź na podgląd live</button>
    <button id="updateBtn" onclick="repair(3)">Zaktualizuj Service Workera</button>
    <button id="goToSigg" onclick="redirect('sigg.gpw.pl/main', true)">Przejdź na witrynę SIGG</button>
    <button id="logOutBtn" onclick="logOut()">Wyloguj</button>

  </div>
  `;

} else {

  container.innerHTML += `
  <div id="actions">

    <p id="info">Strona wykorzystuje pliki Cookie. 
    <br>Serwis nie jest powiązany z sigg.gpw.pl.
    <br>Zdjęcia mają charakter symboliczny. Ich właścicielem jest GPW S.A
    <br>W związku z problemami sigg.gpw.pl strona może nie działać prawidłowo.
    <br><br>Musisz wprowadzić te dane raz na 14 dni.</p>
    <input type="email" name="username" id="username" placeholder="e-mail">
    <input type="password" name="password" id="password" placeholder="hasło">

    <button id="logInBtn" onclick="logIn()">Zaloguj i włącz powiadomienie</button>

  </div>
  `;

  document.addEventListener('keydown', (ev) => {
    if(ev.key === 'Enter') {
      logIn();
    }
  });

}

function logIn(e) {

  logInBtn.style.pointerEvents = 'none';

  let params = `username=${username.value}&password=${password.value}&submit`;
  let url = path + 'scraper.php';

  let xhr = new XMLHttpRequest();
  xhr.open('POST', url, true);
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  showLoading();

  xhr.onload = function() {
    if (this.status == 200) {

      const jsonData = this.responseText;
      console.log(`fetched`)
      const data = JSON.parse(jsonData);
      console.log(data);
      

      if (data["SUCCESS"] === 'TRUE') {
        register();

        actions.innerHTML = `
        Zalogowano pomyślnie.
        <br>
        <br>
        <span style="font-size: 13px; word-wrap: break-word;">
        E-mail: ${data["USERNAME"]}
        <br>
        Sesja: ${data["SESSION"]}
        <br>
        CSRF-token: ${data["CSRF"]}
        <br>
        Device-cookie: ${data["REMEMBER"]}
        </span>
        <br>
        <br>
        Powiadomienie pojawi się już za chwilę.
        <br>
        <button id="liveBtn" onclick="redirect('live/');">Przejdź na podgląd live</button>
        <button id="reload" onclick="redirect();">Zarządzaj</button>
        `;

      } else {

        info.innerHTML = `
        Błąd logowania.
        <br>
        <br>
        ${data["SUCCESS"]}
        <br>
        E-mail: ${data["USERNAME"]}
        <br>
        Sesja: ${data["SESSION"]}
        <br>
        CSRF-token: ${data["CSRF"]}
        <br>
        Device-cookie: ${data["REMEMBER"]}
        <br>
        <br>
        `;

        logInBtn.style.pointerEvents = 'all';

      }
    } else {

      console.warn(`XHR failed. Status: ${this.status}`);
      info.innerHTML = `
      Błąd logowania.
      <br>
      [404] Serwer nie odpowiedział.
      <br>
      <br>
      `;

      logInBtn.style.pointerEvents = 'all';

    }

    setTimeout(() => {
        closeLoading();
    },600)

  } // end onload function

  xhr.send(params);

}

async function logOut() {

  console.log("logOut");
  // document.cookie = 'remember=; expires=Thu, 01 Jan 1970 00:00:01 GMT;'; // doesn't work


  await navigator.serviceWorker.getRegistrations()
  .then(async (registrations) => {

    for(let registration of registrations) {
      await registration.unregister()
    }

  });

  logOutBtn.innerText = 'WYCZYŚĆ COOKIE TEJ STRONY RĘCZENIE!';

}

function redirect(url = '.', absolute = false) {

    if (url === '.') {
      window.location.reload(true);
    } else if (url === '..') {
      window.location = url;
    } else if (absolute) {
      window.location = 'https://' + url;
    } else {
      window.location = path + url;
    }

}

function showLoading() {

  overlay.style.filter = 'blur(3px)';
  loading.style.display = 'block';

  setTimeout(() => {

    loading.style.opacity = '1';
    loading.style.transform = 'translate(-50%, -50%) scale(1)';

  }, 100);

}

function closeLoading() {

  overlay.style.filter = 'none';
  loading.style.opacity = '0';
  loading.style.transform = 'translate(-50%, -50%) scale(.5)';

  setTimeout(() => {

    loading.style.display = 'none';

  }, 100);

}

async function repair(times) {

  showLoading();
  if (times === 3) {
    await register();

    await setTimeout(async () => {

      await register();
      setTimeout(async () => {

        register();
        setTimeout(async () => {
          window.location.reload(true);
        }, 50)
        closeLoading();

      },3000);

    }, 3000)
  } else if (times === 1) {
    register();
    setTimeout(async () => {
      window.location.reload(true);
    }, 50)
    closeLoading();
  }

}

async function check() {

  if (!('serviceWorker' in navigator)) {
    throw new Error('No Service Worker')
  }

}

async function requestNotificationPermission() {

  const permission = await window.Notification.requestPermission();

  if (permission !== 'granted') {
    throw new Error('Permission not granted for Notification');
  }

}

async function register() {

  const unregistered = navigator.serviceWorker.getRegistrations()
  .then(async (registrations) => {

    for(let registration of registrations) {
      await registration.unregister()
    }

    await check();
    console.log('registering');
    const permission = await requestNotificationPermission();

    await navigator.serviceWorker.register('service.js')
    .then((worker) => {

      worker.active.postMessage({"wake": "worker"});

    });

  })

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
