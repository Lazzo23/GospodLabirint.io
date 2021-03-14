// Inicialiacija canvasa in spremenljivk
let labirint = document.querySelector(".labirint");
let ctx = labirint.getContext("2d");
let labirintIzdelan = false;
let trenutnaCelica;
let cilj;
var klik = new Audio('zvok/klik.mp3');


//Funkcije za timer
function timeToString(time) {
  let diffInHrs = time / 3600000;
  let hh = Math.floor(diffInHrs);

  let diffInMin = (diffInHrs - hh) * 60;
  let mm = Math.floor(diffInMin);

  let diffInSec = (diffInMin - mm) * 60;
  let ss = Math.floor(diffInSec);

  let diffInMs = (diffInSec - ss) * 100;
  let ms = Math.floor(diffInMs);

  let formattedMM = mm.toString().padStart(2, "0");
  let formattedSS = ss.toString().padStart(2, "0");
  let formattedMS = ms.toString().padStart(2, "0");

  return `${formattedMM}:${formattedSS}:${formattedMS}`;
}
let startTime;
let elapsedTime = 0;
let timerInterval;

function print(txt) {
  document.getElementById("display").innerHTML = txt;
}

function start() {
  startTime = Date.now() - elapsedTime;
  timerInterval = setInterval(function printTime() {
    elapsedTime = Date.now() - startTime;
    print(timeToString(elapsedTime));
  }, 10);
}

function pause() {
  clearInterval(timerInterval);
}

//Funkcija za konec igre
function konec() {
  
  //Predvajanje sound efekta
  var konec = new Audio("zvok/konec.mp3");
  konec.play();
  document.getElementById("display").style.visibility = "hidden";

  c.style.display="none";
  pause();
  swal({
    title: "Našel si izhod!",
    text:"V času "+timeToString(elapsedTime)+" si Gospoda Labirinta pripeljal v relanost! S klikom na gumb Ponovno igraj se lahko zopet preizkusiš v igri Gospod Labirint.",
    buttons:"Ponovno igraj",
    icon:"success",
  }).then(function () {
    klik.play();
    location.reload(); //Ponoven začetek igre
    });
}

class Labirint {
  constructor(velikost, vrstice, stolpci) {
    this.velikost = velikost;
    this.vrstice = vrstice;
    this.stolpci = stolpci;
    this.mreza = [];
    this.skladBackTracker = [];
  }

// Risanje mreže: this.mreza na podlagi ševila vrstic/stolpcev
narisiMrezo(){
  //Nastavitev težavnosti (Hitrosti vrtenja)
  let tezavnost = document.querySelector("#tezavnost");
  let root = document.documentElement;
  var hitrost;
  switch(tezavnost.value){
  case "1":
    hitrost="15s";
    root.style.setProperty('--hitrost', hitrost);
  break;

  case "2":
    hitrost="9s";  
    root.style.setProperty('--hitrost', hitrost);
  break;

  case "3":
  hitrost="6s";  
  root.style.setProperty('--hitrost', hitrost);
  break;
  }

  for(let i=0;i<this.vrstice;i++){
    let vrstica=[];
    for(let k=0;k<this.stolpci;k++){
      // Kreiranje objekta Celica za vsako celico v mreži, ki ga pošljemo v Array mreza
      let celica = new Celica(i, k, this.mreza, this.velikost);
      vrstica.push(celica);
    }
      this.mreza.push(vrstica);
  }
  // Začetek mreže
  trenutnaCelica = this.mreza[0][0];
  this.mreza[this.vrstice - 1][this.stolpci - 1].cilj = true;
}

// Risanje labirinta na podlagi prebrane velikosti in celic v Arrayu mreza
narisiLabirint() {
  labirint.width = this.velikost;
  labirint.height = this.velikost;

  labirint.style.background = "black";
  // Prva celica je že obiskana
  trenutnaCelica.obiskana = true;
  // Prikazovanje celic v mrezi
  for (let i = 0; i < this.vrstice; i++) {
    for (let k = 0; k < this.stolpci; k++) {
      let mreza = this.mreza;
      mreza[i][k].prikaziCelico(this.velikost, this.vrstice, this.stolpci);
    }
  }
  // Imenovanje naslednje celice, eni izmed naključnih sosedov trenutne celice
  let naslednjaCelica = trenutnaCelica.preveriSosede();
  // Če ni nobenih obiskanih sosednih celic
  if (naslednjaCelica) {
    naslednjaCelica.obiskana = true;
    // Dodamo trenutno celico na sklad za BackTracking
    this.skladBackTracker.push(trenutnaCelica);
    // Obarvanje trenutne celice, na podlagi stolpcev
    trenutnaCelica.obarvaj(this.stolpci);
    // Primerjava trenutne celice z naslednjo in izbriše določene zidove
    trenutnaCelica.izbrisiZidove(trenutnaCelica, naslednjaCelica);
    // Naslednjo celico označimo za trenutno
    trenutnaCelica = naslednjaCelica;
    // Če ni nobenih sosedov na voljo, začnemo "BEKTREJSAT" z uporabo sklada
  } else if (this.skladBackTracker.length > 0) {
    trenutnaCelica = this.skladBackTracker.pop();
    trenutnaCelica.obarvaj(this.stolpci);
  }
  // Če je sklad prazen, so vse celice bile obiskane
  if (this.skladBackTracker.length === 0) {
    if(!labirintIzdelan)
      swal({
        title: "Gospod Labirint potrebuje tvojo pomoč!",
        text:"Ujel se je v past svoje domišljije. Premikaj kvadratek do izhoda s tipkami ↑ ↓ ← →. Pomagaj mu najti izhod v realnost! Srečno!",
        button: "Začni igro",
        icon:"warning"
      }).then(function() {
        document.getElementById("display").style.visibility = "visible";
        klik.play();
        start()
      })
      labirintIzdelan = true;
      return;
}
    // Rekurzivni klic funkcije narisiLibirint, dokler ne bo sklad prazen
    window.requestAnimationFrame(() => {
      this.narisiLabirint();
    });
  }
}

class Celica {
  // Konstruktor sprejme številko vrstice in stolpca, katera bosta predstavljala koordinate mreže
  constructor(stVrstic, stStolpcev, mreza2, velikost2) {
    this.stVrstic = stVrstic;
    this.stStolpcev = stStolpcev;
    this.obiskana = false;
    this.zidovi = {
      zidZgoraj: true,
      zidDesno: true,
      zidSpodaj: true,
      zidLevo: true,
    };
    this.cilj = false;
    this.mreza2 = mreza2;
    this.velikost2 = velikost2;
  }

  preveriSosede() {
    let mreza = this.mreza2;
    let vrst = this.stVrstic;
    let stol = this.stStolpcev;
    let sosedi = [];

    // Vse razpoložljive sosede dodamov Array. Ko pridemo do roba, vrnemo undefined
    let zgoraj = vrst !== 0 ? mreza[vrst - 1][stol] : undefined;
    let desno = stol !== mreza.length - 1 ? mreza[vrst][stol + 1] : undefined;
    let spodaj = vrst !== mreza.length - 1 ? mreza[vrst + 1][stol] : undefined;
    let levo = stol !== 0 ? mreza[vrst][stol - 1] : undefined;

    if (zgoraj && !zgoraj.obiskana) sosedi.push(zgoraj);
    if (desno && !desno.obiskana) sosedi.push(desno);
    if (spodaj && !spodaj.obiskana) sosedi.push(spodaj);
    if (levo && !levo.obiskana) sosedi.push(levo);

    // Izbiranje naključnega soseda v Arrayu
    if (sosedi.length !== 0) {
      let a = Math.floor(Math.random() * sosedi.length);
      return sosedi[a];
    } else {
      return undefined;
    }
  }

  // Risanje zidov vsake celicel drawing functions for each cell. Will be called if relevent wall is set to true in cell constructor
  narisiZidZgoraj(x, y, velikost, stolpci, vrstice) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + velikost / stolpci, y);
    ctx.stroke();
  }
  narisiZidDesno(x, y, velikost, stolpci, vrstice) {
    ctx.beginPath();
    ctx.moveTo(x + velikost / stolpci, y);
    ctx.lineTo(x + velikost / stolpci, y + velikost / vrstice);
    ctx.stroke();
  }
  narisiZidSpodaj(x, y, velikost, stolpci, vrstice) {
    ctx.beginPath();
    ctx.moveTo(x, y + velikost / vrstice);
    ctx.lineTo(x + velikost / stolpci, y + velikost / vrstice);
    ctx.stroke();
  }
  narisiZidLevo(x, y, velikost, stolpci, vrstice) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + velikost / vrstice);
    ctx.stroke();
  }

  // Obarvanje trenutne celice v mreži
  obarvaj(stolpci) {
    let x = (this.stStolpcev * this.velikost2) / stolpci + 1;
    let y = (this.stVrstic * this.velikost2) / stolpci + 1;
	
	  ctx.fillStyle = "#00ccff";
    ctx.fillRect(x,y,this.velikost2 / stolpci - 3,this.velikost2 / stolpci - 3);
  }

  izbrisiZidove(celica1, celica2) {
    // Primerjanje dveh celic na podlagi x osi
    let x = celica1.stStolpcev - celica2.stStolpcev;
    // Izbris zidov, če je razlika na x osi
    if (x === 1) {
      celica1.zidovi.zidLevo = false;
      celica2.zidovi.zidDesno = false;
    } else if (x === -1) {
      celica1.zidovi.zidDesno = false;
      celica2.zidovi.zidLevo = false;
    }
    // Primerjanje dveh celic na podlagi y osi
    let y = celica1.stVrstic - celica2.stVrstic;
    // Izbris zidov, če je razlika na y osi
    if (y === 1) {
      celica1.zidovi.zidZgoraj = false;
      celica2.zidovi.zidSpodaj = false;
    } else if (y === -1) {
      celica1.zidovi.zidSpodaj = false;
      celica2.zidovi.zidZgoraj = false;
    }
  }

  // Risanje vsake celice v labirintu
  prikaziCelico(velikost, vrstice, stolpci) {
    let x = (this.stStolpcev * velikost) / stolpci;
    let y = (this.stVrstic * velikost) / vrstice;
    ctx.strokeStyle = "white";
    ctx.fillStyle = "black";
    ctx.lineWidth = 2;
    if (this.zidovi.zidZgoraj) this.narisiZidZgoraj(x, y, velikost, stolpci, vrstice);
    if (this.zidovi.zidDesno) this.narisiZidDesno(x, y, velikost, stolpci, vrstice);
    if (this.zidovi.zidSpodaj) this.narisiZidSpodaj(x, y, velikost, stolpci, vrstice);
    if (this.zidovi.zidLevo) this.narisiZidLevo(x, y, velikost, stolpci, vrstice);
	  if(this.obiskana) ctx.fillRect(x + 1, y + 1, velikost / stolpci - 2, velikost / vrstice - 2);
	  if (this.cilj){
      ctx.fillStyle = "#ff3300";
      ctx.fillRect(x + 1, y + 1, velikost / stolpci - 2, velikost / vrstice - 2);
    }
  }
}
