//Branje podatkov iz forme
let forma = document.querySelector("#nastavitve");
let velikost = document.querySelector("#velikost");
let stolvrst = document.querySelector("#stolvrst");
let tezavnost = document.querySelector("#tezavnost");
let slika = document.querySelector(".slika");
let novLabirint;

forma.addEventListener("submit", generirajLabirint);
document.addEventListener("keydown", premikanje);

function generirajLabirint(a) {
  //Predvajanje glasbe
  a.preventDefault();
  var bgzvok = new Audio('zvok/bgzvok.mp3');
  bgzvok.loop=true
  bgzvok.play();

  var klik = new Audio('zvok/klik.mp3');
  klik.play();

  //Obvestila
  if (stolvrst.value == "" || velikost.value == "") {
    swal({
      icon: 'warning',
      title: 'Izpolni vsa polja!'
    })
    return;
  }

  if (velikost.value < 100 || stolvrst.value < 5) {
    swal({
      icon: 'warning',
      title: 'Labirint je premajhen!',
      text:'Minimalna velikost: 100, Minimalno število vrstic/stlpcev: 5'
    })
    return;
  }
  
  if (velikost.value > 600 || stolvrst.value > 50) {
    swal({
      icon: 'warning',
      title: 'Labirint je prevelik!',
      text:'Maksimalna velikost: 600, maksimalna število vrstic/stlpcev: 50'
    })
    return;
  }

  forma.style.display = "none"; //Skrijemo začetno stran
  slika.style.display = "none";

  novLabirint = new Labirint(velikost.value, stolvrst.value, stolvrst.value); //Ustvarimo nov labirint iz razreda Labirint

  //Klic funkcij za generiranje labirinta
  novLabirint.narisiMrezo();
  novLabirint.narisiLabirint();
}

function premikanje(a) {
  let key = a.key;
  let vrstica = trenutnaCelica.stVrstic;
  let stolpec = trenutnaCelica.stStolpcev;

  //Key Handler
  switch (key) {
    case "ArrowUp":
      if (!trenutnaCelica.zidovi.zidZgoraj) {
        let next = novLabirint.mreza[vrstica - 1][stolpec];
        trenutnaCelica = next;
        novLabirint.narisiLabirint();
        trenutnaCelica.obarvaj(novLabirint.stolpci);
      }break;

    case "ArrowRight":
      if (!trenutnaCelica.zidovi.zidDesno) {
        let next = novLabirint.mreza[vrstica][stolpec + 1];
        trenutnaCelica = next;
        novLabirint.narisiLabirint();
        trenutnaCelica.obarvaj(novLabirint.stolpci);
        if (trenutnaCelica.cilj) konec();
      }break;

    case "ArrowDown":
      if (!trenutnaCelica.zidovi.zidSpodaj) {
        let next = novLabirint.mreza[vrstica + 1][stolpec];
        trenutnaCelica = next;
        novLabirint.narisiLabirint();
        trenutnaCelica.obarvaj(novLabirint.stolpci);
        if (trenutnaCelica.cilj) konec()
      }break;

    case "ArrowLeft":
      if (!trenutnaCelica.zidovi.zidLevo) {
        let next = novLabirint.mreza[vrstica][stolpec - 1];
        trenutnaCelica = next;
        novLabirint.narisiLabirint();
        trenutnaCelica.obarvaj(novLabirint.stolpci);
      }break;
  }
}

