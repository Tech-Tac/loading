CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  this.beginPath();
  this.moveTo(x + r, y);
  this.arcTo(x + w, y, x + w, y + h, r);
  this.arcTo(x + w, y + h, x, y + h, r);
  this.arcTo(x, y + h, x, y, r);
  this.arcTo(x, y, x + w, y, r);
  this.closePath();
  return this;
};
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const PI = Math.PI;
const twoPI = Math.PI * 2;

function int(txtnum) {
  return parseInt(txtnum);
}

function random(min, max) {
  return Math.random() * (max - min) + min;
}

function randomArray(array) {
  return array[Math.round(random(0, array.length - 1))];
}

function degAngleRange(degrees) {
  return (degrees + 360) % 360;
}

function rads2degs(radians) {
  let oldrange = radians * (180 / PI);
  return (oldrange + 360) % 360;
}

function degs2rads(degrees) {
  return degrees * (PI / 180);
}

function invertAngle(degAngle) {
  return (degAngle + 180) % 360;
}

function angleFromPoints(x1, y1, x2, y2) {
  return Math.atan2(y2 - y1, x2 - x1);
}

function distanceB2Points(x1, y1, x2, y2) {
  return Math.hypot(x2 - x1, y2 - y1);
}

let isdragging = false;
let dragModifier = 1;

let raf;
const defupdatefps = 30;
let updatefps = defupdatefps;
let updatetimer;

let pause = false;

let currLevel = 1;
let lives = 3;

let segmentValue = 5;
let numMaxSegments = 100 / segmentValue;

let shaketimer;

let keymap = {
  left: ["ArrowLeft", "KeyA", "Numpad4"],
  right: ["ArrowRight", "KeyD", "Numpad6"],
  up: ["ArrowUp", "KeyW", "Numpad8"],
  down: ["ArrowDown", "KeyS", "Numpad2"],
  pause: ["Escape", "Pause"],
  mute: ["KeyM"],
  theme: ["KeyT"],
  lang: ["KeyL"],
};

let keyspressed = {
  l: false,
  r: false,
  u: false,
  d: false,
};

let themes = [
  {
    themename: "Default light",
    backColor: "#ffffff",
    textColor: "#000000",
    loadingBack: "#c0c0c0",
    loadingText: "#ffffff",
    segText: "#000000",
    emptyColor: "#7f7f7f",
    segColors: {
      pink: "#ff00ff",
      blue: "#0088ff",
      orange: "#ffba00",
      cyan: "#00ffff",
      red: "#ff0000",
      green: "#00ba00",
      gray: "#7f7f7f",
    },
  },
  {
    themename: "Default dark",
    backColor: "#373737",
    textColor: "#ffffff",
    loadingBack: "#7f7f7f",
    loadingText: "#ffffff",
    segText: "#000000",
    emptyColor: "#505050",
    segColors: {
      pink: "#ff00ff",
      blue: "#0088ff",
      orange: "#ffba00",
      cyan: "#00ffff",
      red: "#ff0000",
      green: "#00ba00",
      gray: "#7f7f7f",
    },
  },
  {
    themename: "Neon",
    backColor: "#000000",
    textColor: "#ffffff",
    loadingBack: "#000000",
    loadingText: "#ffffff",
    segText: "#000000",
    emptyColor: "#171717",
    segColors: {
      pink: "#ff00ff",
      blue: "#0037ff",
      orange: "#ffff00",
      cyan: "#00ffff",
      red: "#ff0000",
      green: "#37ff37",
      gray: "#ffffff",
    },
  },
];

let theme = themes[1];

let langs = [
  {
    langnameen: "English",
    langname: "English",
    dir: "ltr",
    numerals: "west-arabic",
    loading: "Loading...",
    level: "Level $0",
    lives: "$0 Lives",
    paused: "Paused",
    pausetext: "Press [$0] to unpause",
    fatalerror: "A FATAL ERROR WAS CAUSED BY [PLAYER]",
    ucantry: "YOU CAN TRY : ",
    uctoption1: "PLAY BETTER",
    uctoption2: "CONTACT SUPPORT",
    pressok: "PRESS [$0] TO CONTINUE",
    loadcomplete: "Loading complete!",
    correct: "Correct",
    corrupted: "Corrupted",
    slowdrag: "Slow drag!",
    speeddrag: "Speed drag!",
    slowtime: "Slow time!",
    speedtime: "Speed time!",
    reverse: "Reverse!",
    shake: "Shake!",
  },
  {
    langnameen: "Arabic",
    langname: "العربية",
    dir: "rtl",
    numerals: "east-arabic",
    loading: "جار التحميل...",
    level: "المرحلة $0",
    lives: "$0 محاولات",
    paused: "متوقف",
    pausetext: "إضغط [$0] للإلغاء",
    fatalerror: "تم إرتكاب خطئ فادح بوسطة [اللاعب]",
    ucantry: "يمكنك أن تجرب : ",
    uctoption1: "اللعب بشكل أفضل",
    uctoption2: "الإتصال بالمساعدة",
    pressok: "إضغط [$0] للمتابعة",
    loadcomplete: "اكتمل التحميل!",
    correct: "صحيح",
    corrupted: "خاطئ",
    slowdrag: "سحب بطئ!",
    speeddrag: "سحب سريع!",
    slowtime: "وقت بطئ!",
    speedtime: "وقت سريع!",
    reverse: "معكوس!",
    shake: "إهتزاز!",
  },
  {
    langnameen: "French",
    langname: "Français",
    dir: "ltr",
    numerals: "west-arabic",
    loading: "Chargement...",
    level: "Niveau $0",
    lives: "$0 Vies",
    paused: "En pause",
    pausetext: "Appuyez sur [$0] pour reprendre",
    fatalerror: "UNE ERREUR FATALE A ÉTÉ CAUSÉE PAR [JOUEUR]",
    ucantry: "TU PEUX ESSAYER : ",
    uctoption1: "MIEUX JOUER",
    uctoption2: "CONTACTEZ LE SUPPORT",
    pressok: "APPUYEZ SUR [$0] POUR CONTINUER",
    loadcomplete: "Chargement terminé!",
    correct: "Corriger",
    corrupted: "Corrompu",
    slowdrag: "traînée lente!",
    speeddrag: "Faites glisser la vitesse!",
    slowtime: "Temps lent!",
    speedtime: "Temps de vitesse!",
    reverse: "Inverse!",
    shake: "Secouer!",
  },
];

let lang = langs[0];

function num(enDigit) {
  if (lang.numerals == "east-arabic") {
    var newValue = "";
    for (var i = 0; i < enDigit.length; i++) {
      var ch = enDigit.charCodeAt(i);
      if (ch >= 48 && ch <= 57) {
        var newChar = ch + 1584;
        newValue = newValue + String.fromCharCode(newChar);
      } else {
        newValue = newValue + String.fromCharCode(ch);
      }
    }
    return newValue.replace(/%/g, "⁒").replace(/\?/g, "؟");
  } else {
    return enDigit;
  }
}

function txt(key) {
  let str = lang[key] ?? langs[0][key] ?? key;
  let finalstr = str;
  for (let i = 0; i < arguments.length; i++) {
    if (i != 0) {
      let regexp = new RegExp("\\$" + (i - 1), "g");
      finalstr = finalstr.replace(regexp, arguments[i]);
    }
  }
  return finalstr;
}

let soundMute = false;
let soundVolume = 1;

let sounds = { hit: new Audio("sounds/hit.wav"), add: new Audio("sounds/add.wav") };

function playSound(sound, defVolume) {
  if (!soundMute) {
    let mysound = new Audio("sounds/" + sound + ".wav"); //sounds[sound];
    mysound.playbackRate = updatefps / defupdatefps;
    mysound.volume = defVolume * soundVolume;
    mysound.play();
  }
}

let segAnim = 150;

class Wait {
  constructor(time, callback, pausable) {
    this.time = time;
    this.callback = callback;
    this.pausable = pausable;

    this.remove = false;
  }

  update() {
    if ((this.pausable == true && pause == false) || this.pausable == false) {
      if (this.remove == false) {
        this.time--;
        if (this.time <= 0) {
          this.callback();
          this.remove = true;
        }
      }
    }
  }
}

let waits = [];

async function wait(time, callback, pausable = true) {
  let newWait = new Wait((time * (updatefps / defupdatefps)) / updatefps, callback, pausable);
  waits.push(newWait);
  return newWait;
  /*let myWait = window.setTimeout(callback,time);
    return myWait;*/
}

function animateProperty(object, property, newValue, time) {
  if (object[property] != newValue) {
    let oldValue = object[property];
    let difference = newValue - oldValue;

    let realtime = time * (defupdatefps / updatefps);
    let fpsdtime = (realtime / 1000) * (1000 / updatefps);
    let change = difference / fpsdtime;

    let interval = window.setInterval(function () {
      if (object[property] != newValue) {
        object[property] += change;
      } else {
        window.clearInterval(interval);
        return;
      }
    }, realtime / fpsdtime);

    let reset = window.setTimeout(function () {
      object[property] = newValue;
      window.clearInterval(interval);
      window.clearTimeout(reset);
    }, realtime);

    return interval;
  }
}

class Effect {
  constructor(x, y) {
    this.x = x;
    this.y = y;

    this.size = 0;

    this.remove = false;

    animateProperty(this, "size", 1, 500);
    wait(500, function () {
      this.remove = true;
    });
  }

  draw() {
    if (this.size >= 0) {
      ctx.fillStyle = "rgba(0,128,255," + (1 - this.size) / 3 + ")"; //"hsla(" + this.size * 360 + ",100%,50%," + (1 - this.size) / 3 + ")";
      ctx.beginPath();
      ctx.arc(this.x, this.y, Math.max(canvas.width, canvas.height) * this.size, 0, twoPI);
      ctx.fill();
      ctx.closePath();
    }
  }
}

let effects = [];

class Particle {
  constructor(x, y, size, color, speed, life) {
    this.size = size;
    this.color = color;
    this.speed = speed;
    this.life = life;

    this.angle = random(0, 360);

    this.x = x;
    this.y = y;

    this.remove = false;
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x - this.size * 0.5, this.y - this.size * 0.5, this.size, this.size);
  }

  update() {
    let deltaX = Math.cos(degs2rads(this.angle)) * this.speed;
    let deltaY = Math.sin(degs2rads(this.angle)) * this.speed;

    this.x += deltaX;
    this.y += deltaY;

    this.life--;

    if (this.life <= 0) {
      this.remove = true;
    }
  }
}

class FloatingText {
  constructor(text, x, y) {
    this.text = text.toUpperCase();
    this.displayText = "";
    this.x = x;
    this.y = y;

    this.startAnim = 10;

    this.remove = false;
  }

  draw() {
    ctx.fillStyle = theme.textColor;
    ctx.font = "12pt Arial";
    ctx.textAlign = "center";

    ctx.fillText(this.displayText, this.x, this.y + 6);
  }

  update() {
    if (this.startAnim == 10) {
      this.displayText = ".";
    } else if (this.startAnim == 9) {
      this.displayText = "=";
    } else if (this.startAnim == 8) {
      this.displayText = "||";
    } else if (this.startAnim == 7) {
      this.displayText = "[]";
    } else if (this.startAnim == 6) {
      this.displayText = "[ ]";
    } else if (this.startAnim == 5) {
      this.displayText = "{ " + this.text.substring(Math.round(this.text.length * 0.4), Math.round(this.text.length * 0.6)) + " }";
    } else if (this.startAnim == 4) {
      this.displayText = "< " + this.text.substring(Math.round(this.text.length * 0.2), Math.round(this.text.length * 0.8)) + " >";
    } else if (this.startAnim == 3) {
      this.displayText = "-: " + this.text + " :-";
    } else if (this.startAnim == 2) {
      this.displayText = ". - " + this.text + " - .";
    } else if (this.startAnim == 1) {
      this.displayText = ".   " + this.text + "   .";
    } else if (this.startAnim <= 0) {
      this.displayText = this.text;
    }
    if (this.startAnim > 0) {
      this.startAnim -= 0.5;
    }

    this.y -= 5;
    if (this.y <= -6) {
      this.remove = true;
    }
  }
}

let segTypes = ["pink", "blue", "orange", "cyan", "red", "gray", "bonus"];

let segbonusreset;

class Segment {
  constructor() {
    this.angle = random(0, 360);
    this.type = randomArray(segTypes);
    let chance = Math.round(random(0, 127));
    if (chance == 37) {
      //37 can be any number
      this.type = "green";
    }

    this.size = 10;

    let offset = random(-45, 45);
    this.moveAngle = degs2rads(invertAngle(this.angle) + offset);

    this.speed = random(3, 9);

    this.x = canvas.width / 2;
    this.y = canvas.height / 2;

    let radius = distanceB2Points(this.x, this.y, canvas.width, canvas.height) + this.size * 2 + this.speed;
    let deltaX = Math.cos(degs2rads(this.angle)) * radius;
    let deltaY = Math.sin(degs2rads(this.angle)) * radius;

    this.x += deltaX;
    this.y += deltaY;

    this.startX = this.x;
    this.startY = this.y;

    this.remove = false;

    this.hue = 0;
  }

  get color() {
    if (this.type == "bonus") {
      return "hsl(" + this.hue + ", 100%, 50%)";
    }
    return theme.segColors[this.type];
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, twoPI);
    ctx.fill();
    ctx.closePath();

    let text = "";
    ctx.fillStyle = theme.segText;
    let fontSize = this.size * 1.25;
    ctx.font = fontSize + "pt Arial";
    ctx.textAlign = "center";

    if (this.type == "pink") {
      text = "−";
    } else if (this.type == "red") {
      text = "!";
    } else if (this.type == "orange") {
      text = "";
    } else if (this.type == "cyan") {
      text = "2";
    } else if (this.type == "gray") {
      text = "0";
    } else if (this.type == "green") {
      text = "★";
    } else if (this.type == "blue") {
      text = "";
    } else if (this.type == "bonus") {
      text = "?";
    }

    ctx.fillText(num(text), this.x, this.y + fontSize * 0.5);
  }

  inLoading() {
    const mySelf = this;
    function segNormal() {
      if (myloading.mode != "normal") {
        myloading.segments = [];
        myloading.mode = "normal";
      }
      playSound("add", 0.3);
      myloading.segments.push(new homeSegment(mySelf.type));
      floatingTexts.push(new FloatingText(num(segmentValue + "%"), mySelf.x, mySelf.y));
    }

    function segCyan() {
      if (myloading.mode != "normal") {
        myloading.segments = [];
        myloading.mode = "normal";
      }
      playSound("add", 0.3);
      myloading.segments.push(new homeSegment("blue"));

      wait(segAnim, function () {
        playSound("add", 0.3);
        myloading.segments.push(new homeSegment("blue"));
      });
      floatingTexts.push(new FloatingText(num(segmentValue * 2 + "%"), mySelf.x, mySelf.y));
    }

    function segGray() {
      if (myloading.mode == "pink") {
        myloading.segments = [];
        myloading.mode = "gray";
      }

      if (myloading.mode == "gray" || myloading.percent == 0) {
        myloading.mode = "gray";
        myloading.segments.push(new homeSegment("gray"));
        playSound("add", 0.3);
      }

      floatingTexts.push(new FloatingText(num("0%"), mySelf.x, mySelf.y));
    }

    function segPink() {
      if (myloading.mode == "gray") {
        myloading.segments = [];
        myloading.mode = "pink";
      }

      if (myloading.mode == "pink" || myloading.percent == 0) {
        myloading.mode = "pink";
        myloading.segments.push(new homeSegment("pink"));
      } else {
        myloading.segments[myloading.segments.length - 1].isRemoving = true;
      }
      playSound("add", 0.3);
      floatingTexts.push(new FloatingText(num("−" + segmentValue + "%"), mySelf.x, mySelf.y));
    }

    function segGreen() {
      myloading.segments = [];
      myloading.mode = "normal";
      const mylod = myloading;
      const hmseg = homeSegment;
      playSound("add", 0.3);
      for (let n = 0; n < numMaxSegments; n++) {
        //wait(segAnim * 0.125 * n, function () {
        mylod.segments.push(new hmseg("blue"));
        //});
      }
      floatingTexts.push(new FloatingText(num("100%"), mySelf.x, mySelf.y));
    }

    function segBonus() {
      let endtime = 15000;

      let bonusTypes = ["slowdrag", "seg", "speedtime", "shake", "slowtime", "reverse", "speeddrag"];
      let bonus = randomArray(bonusTypes);

      const prevDragModifier = dragModifier;
      const prevTimeScale = updatefps / defupdatefps;

      if (bonus == "seg") {
        mySelf.type = randomArray(segTypes.concat(["green"]));
        mySelf.inLoading();
        if (mySelf.type == "red") {
          mySelf.outLoading();
          pause = true;
          window.setTimeout(function () {
            lose();
            pause = false;
          }, 500);
        }
      } else if (bonus == "slowdrag") {
        dragModifier *= 0.5;
        wait(endtime * (updatefps / defupdatefps), function () {
          dragModifier *= 2;
        });
      } else if (bonus == "speeddrag") {
        dragModifier *= 2;
        wait(endtime * (updatefps / defupdatefps), function () {
          dragModifier *= 0.5;
        });
      } else if (bonus == "reverse") {
        dragModifier *= -1;
        wait(endtime * (updatefps / defupdatefps), function () {
          dragModifier *= -1;
        });
      } else if (bonus == "slowtime") {
        timeScale(0.5 * prevTimeScale);
        wait(endtime * (updatefps / defupdatefps), function () {
          timeScale(2 * (updatefps / defupdatefps));
        });
      } else if (bonus == "speedtime") {
        timeScale(2 * prevTimeScale);
        wait(endtime * (updatefps / defupdatefps), function () {
          timeScale(0.5 * (updatefps / defupdatefps));
        });
      } else if (bonus == "shake") {
        let shakes = 0;
        let shakepower = 10 * dragModifier;
        let shakeevery = 50 * (updatefps / defupdatefps);
        shaketimer = window.setInterval(function () {
          if (!pause) {
            myloading.x += random(-shakepower, shakepower);
            myloading.y += random(-shakepower, shakepower);
            myloading.rotation += random(-shakepower, shakepower);
            shakes++;
            if (shakes > endtime / shakeevery) {
              window.clearInterval(shaketimer);
              shaketimer = undefined;
            }
          }
        }, shakeevery);
        wait(endtime * (updatefps / defupdatefps), function () {
          window.clearInterval(shaketimer);
          shaketimer = undefined;
        });
      }

      if (bonus != "seg") {
        floatingTexts.push(new FloatingText(txt(bonus), mySelf.x, mySelf.y));
        playSound("add", 0.3);
      }
      if (bonus == "speedtime" || bonus == "slowtime") {
        effects.push(new Effect(myloading.x, myloading.y));
      }
    }

    if (this.type == "blue" || this.type == "orange") {
      segNormal();
    } else if (this.type == "cyan") {
      segCyan();
    } else if (this.type == "gray") {
      segGray();
    } else if (this.type == "pink") {
      segPink();
    } else if (this.type == "green") {
      segGreen();
    } else if (this.type == "bonus") {
      segBonus();
    }
  }

  outLoading() {
    playSound("hit", 0.75);
    for (let k = 0; k < random(this.size * 1.25, this.size * 1.75); k++) {
      let color = this.color;
      if (this.type == "bonus") {
        color = "hsl(" + random(0, 360) + ", 100%, 50%)";
      }
      particles.push(new Particle(this.x, this.y, random(this.size * 0.75, this.size * 1.25), color, random(4, 8), random(this.size * 0.5, this.size * 1)));
    }
  }

  update() {
    let deltaX = Math.cos(this.moveAngle) * this.speed;
    let deltaY = Math.sin(this.moveAngle) * this.speed;

    this.x += deltaX;
    this.y += deltaY;

    this.hue += 11.25;

    if (distanceB2Points(this.x, this.y, myloading.x, myloading.y) <= myloading.size * 0.75 /*- this.size*/) {
      if (this.type == "red") {
        this.outLoading();
        pause = true;
        setTimeout(function () {
          lose();
          pause = false;
        }, 500);
      } else {
        let myAngle = rads2degs(angleFromPoints(myloading.x, myloading.y, this.x, this.y));

        let startAngle;
        let endAngle;
        let moreThanHalf;

        if (myloading.percent > 50) {
          moreThanHalf = true;
          startAngle = rads2degs((0.5 - (100 - myloading.percent) / 200) * twoPI + degs2rads(invertAngle(myloading.rotation)));
          endAngle = rads2degs((0.5 + (100 - myloading.percent) / 200) * twoPI + degs2rads(invertAngle(myloading.rotation)));
        } else {
          moreThanHalf = false;
          startAngle = rads2degs((0.5 - myloading.percent / 200) * twoPI + degs2rads(myloading.rotation));
          endAngle = rads2degs((0.5 + myloading.percent / 200) * twoPI + degs2rads(myloading.rotation));
        }

        this.startAngle = startAngle;
        this.endAngle = endAngle;
        this.myAngle = myAngle;

        if (moreThanHalf == false) {
          if (myAngle > startAngle && myAngle < endAngle) {
            this.outLoading();
          } else {
            this.inLoading();
          }
        } else if (moreThanHalf == true) {
          if (myAngle > startAngle && myAngle < endAngle) {
            this.inLoading();
          } else {
            this.outLoading();
          }
        }
      }
      this.remove = true;
    }

    if (distanceB2Points(this.startX, this.startY, this.x, this.y) > distanceB2Points(0, 0, canvas.width, canvas.height) + this.size * 2 + this.speed) {
      this.remove = true;
    }
  }
}

class homeSegment {
  constructor(type) {
    this.type = type;
    this.width = 0;
    this.isRemoving = false;
    this.offset = 0; //degAngleRange(((100 - myloading.percent) / 100) * 180);
    animateProperty(this, "width", 1, segAnim);
    //animateProperty(this, "offset", 0, segAnim);
  }

  get color() {
    return theme.segColors[this.type];
  }
}

class Loading {
  constructor() {
    this.x = canvas.width / 2;
    this.y = canvas.height / 2;
    this.size = 64;

    //this.percent = 0;
    this.rotation = 270;

    this.segments = [];

    this.loading = true;
    this.loadingfor = 60; // ~2 sec

    this.mode = "normal";

    this.viewPercent = 0;
    this.realpercent = 0;

    //this.grdrot = 0;
  }

  get rotation() {
    return 270;
  }

  set rotation(val) {
    return;
  }

  get percent() {
    return this.viewPercent; //((this.segments.length) / numMaxSegments) * 100;
  }

  draw() {
    ctx.fillStyle = theme.loadingBack;
    //ctx.roundRect(this.x - this.r, this.y - this.r, this.r * 2, this.r * 2, this.r * 0.25).fill();
    //ctx.fillRect(this.x - this.r, this.y - this.r, this.r * 2, this.r * 2);
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, twoPI);
    ctx.fill();
    ctx.closePath();

    ctx.strokeStyle = theme.emptyColor;
    ctx.lineWidth = this.size * 0.25;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * 0.75, 0, twoPI);
    ctx.stroke();
    ctx.closePath();

    ctx.lineWidth = this.size * 0.25 + 0.5;
    let rotation = (0.5 - this.viewPercent / 200) * twoPI + degs2rads(this.rotation);
    let lastSegWidth = 1;

    for (let i = 0; i < this.segments.length; i++) {
      ctx.strokeStyle = this.segments[i].color;
      ctx.beginPath();
      let startAngle = (i - 1 + lastSegWidth) * (twoPI / numMaxSegments) + rotation + degs2rads(this.segments[i].offset) - degs2rads(0.4);
      let endAngle =
        (i - 1 + lastSegWidth + this.segments[i].width) * (twoPI / numMaxSegments) + rotation + degs2rads(this.segments[i].offset) + degs2rads(0.4);
      ctx.arc(this.x, this.y, this.size * 0.75, startAngle, endAngle);
      ctx.stroke();
      ctx.closePath();
      lastSegWidth = this.segments[i].width;
    }

    /*let gradient = ctx.createConicGradient(degs2rads(this.grdrot), this.x, this.y);
        gradient.addColorStop(0, "red");
        gradient.addColorStop((1 / 7) * 1, "orange");
        gradient.addColorStop((1 / 7) * 2, "yellow");
        gradient.addColorStop((1 / 7) * 3, "green");
        gradient.addColorStop((1 / 7) * 4, "blue");
        gradient.addColorStop((1 / 7) * 5, "indigo");
        gradient.addColorStop((1 / 7) * 6, "violet");
        gradient.addColorStop(1, "red");

        ctx.strokeStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 0.75, ((0.5 - (this.percent / 200)) * twoPI) + degs2rads(this.rotation), ((0.5 + (this.percent / 200)) * twoPI) + degs2rads(this.rotation));
        ctx.stroke();
        ctx.closePath();*/

    ctx.fillStyle = theme.loadingText;
    ctx.font = this.size * 0.25 + "pt Arial";
    ctx.textAlign = "center";
    let roundpercent = Math.round(this.percent); // percent breaks at 55 (displays as 55.00000000000001) so round it.
    let text = roundpercent + "%";
    if (this.mode == "normal") {
      text = roundpercent + "%";
    } else if (this.mode == "pink") {
      text = "-" + roundpercent + "%";
    } else if (this.mode == "gray") {
      text = roundpercent + "×0";
    }
    ctx.fillText(num(text), this.x, this.y + this.size * 0.125);
  }

  center() {
    /*this.x = canvas.width / 2;
        this.y = canvas.height / 2;
        this.rotation = 270;*/
    isdragging = false;

    keyspressed = {
      l: false,
      r: false,
      u: false,
      d: false,
    };

    animateProperty(this, "x", canvas.width / 2, 250);
    animateProperty(this, "y", canvas.height / 2, 250);
    animateProperty(this, "rotation", 270, 250);
  }

  update() {
    this.viewPercent = 0;
    this.realpercent = 0;
    for (let i = this.segments.length - 1; i >= 0; i--) {
      if (this.segments[i].isRemoving == true) {
        animateProperty(this.segments[i], "width", 0, segAnim);
        const mysegments = this.segments;
        const thisi = i;
        wait(segAnim, function () {
          mysegments.splice(thisi, 1);
        });
        this.segments[i].isRemoving = false;
      }

      this.viewPercent += segmentValue * this.segments[i].width;
      this.realpercent += segmentValue * Math.floor(this.segments[i].width);
    }

    if (this.realpercent >= 100 && this.segments.length >= numMaxSegments && pause == false) {
      pause = true;
      segments = [];
      this.center();
      window.setTimeout(function () {
        win();
        pause = false;
      }, 500);
    }

    /*this.grdrot += 1 + (this.percent / 100) * 14;
        this.grdrot = degAngleRange(this.grdrot);*/

    let speed = 16 * (defupdatefps / updatefps) * dragModifier;

    /*if (
			(keyspressed.l == true && keyspressed.u == true) ||
			(keyspressed.l == true && keyspressed.d == true) ||
			(keyspressed.r == true && keyspressed.u == true) ||
			(keyspressed.r == true && keyspressed.d == true)
		) {
			speed *= 0.75;
		}*/

    if (keyspressed.l == true) {
      this.x -= speed;
    }
    if (keyspressed.r == true) {
      this.x += speed;
    }
    if (keyspressed.u == true) {
      this.y -= speed;
    }
    if (keyspressed.d == true) {
      this.y += speed;
    }

    if (this.x > canvas.width) {
      this.x = canvas.width;
    }
    if (this.x < 0) {
      this.x = 0;
    }
    if (this.y > canvas.height) {
      this.y = canvas.height;
    }
    if (this.y < 0) {
      this.y = 0;
    }
  }
}

let myloading = new Loading();
let segments = [];
let floatingTexts = [];
let particles = [];

function reset() {
  dragModifier = 1;
  keyspressed = {
    l: false,
    r: false,
    u: false,
    d: false,
  };
  timeScale(1);
  waits = [];
  window.clearTimeout(segbonusreset);
  window.clearInterval(shaketimer);
  shaketimer = undefined;
  segments = [];
  isdragging = false;
  myloading = new Loading();
  myloading.center();
  floatingTexts = [];
  floatingTexts.push(new FloatingText(txt("loading"), myloading.x, myloading.y));
  wait(250, function () {
    floatingTexts.push(new FloatingText(num(txt("level", currLevel)), myloading.x, myloading.y));
  });
  wait(500, function () {
    floatingTexts.push(new FloatingText(num(txt("lives", lives)), myloading.x, myloading.y));
  });
}

function lose() {
  if (lives > 0) {
    lives--;
  } else if (currLevel > 1) {
    currLevel--;
  }

  alert(
    num(`:(\n\n${txt("fatalerror")}\n\n−1❤\n\n${txt("ucantry")}\n\n* ${txt("uctoption1")}\n* ${txt("uctoption2")}\n\n${txt("pressok", "OK")}`).toUpperCase()
  );
  reset();
}

function win() {
  currLevel++;

  let correct = 0;
  let corrupted = 0;

  let mode = "";

  let bar = "[";

  for (let i = 0; i < myloading.segments.length; i++) {
    if (i >= numMaxSegments) {
      break;
    }

    if (myloading.segments[i].type == "blue") {
      correct += segmentValue;
      bar += "✓";
    } else if (myloading.segments[i].type == "orange") {
      corrupted += segmentValue;
      bar += "X";
    } else if (myloading.segments[i].type == "pink") {
      correct += segmentValue;
      bar += "-";
      mode = "Negative!\n\n";
    } else if (myloading.segments[i].type == "gray") {
      correct += segmentValue;
      bar += "  ";
      mode = "Zero!\n\n";
    }
  }

  bar += "]";

  let extra = myloading.segments.length * segmentValue - 100;
  let extrastring = ``;
  if (extra > 0) {
    extrastring = `${"✓".repeat(extra / 5)}`;
    //correct -= extra;
  }

  let lifestring = ``;
  if (correct >= 100) {
    lifestring = "\n+1❤\n";
    if (lives < 5) {
      lives++;
    }
  }
  alert(
    num(
      `${txt("loadcomplete")}\n\n${bar + extrastring}\n\n${mode}${txt("correct")} : ${correct}%${extra > 0 ? " ( +" + extra + "% )" : ""}\n${txt(
        "corrupted"
      )} : ${corrupted}%\n${lifestring}`
    )
  );
  reset();
}

function drawFrame() {
  //ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = theme.backColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  myloading.draw();

  for (i = 0; i < segments.length; i++) {
    segments[i].draw();
  }

  for (i = 0; i < particles.length; i++) {
    particles[i].draw();
  }

  for (i = 0; i < effects.length; i++) {
    effects[i].draw();
  }

  for (i = 0; i < floatingTexts.length; i++) {
    floatingTexts[i].draw();
  }

  if (pause == true) {
    ctx.fillStyle = "#7f7f7f7f";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#000000";
    ctx.font = "32pt Arial";
    ctx.textAlign = "center";
    ctx.fillText(txt("paused"), canvas.width / 2, canvas.height / 2 - 8);

    ctx.font = "16pt Arial";
    ctx.fillText(txt("pausetext", keymap.pause[0]), canvas.width / 2, canvas.height / 2 + 24);
  }

  raf = window.requestAnimationFrame(drawFrame);
}

let newsegwait = 60;

function updateFrame() {
  if (pause == false) {
    for (i = segments.length - 1; i >= 0; i--) {
      if (segments[i]) {
        segments[i].update();
        if (segments[i].remove == true) {
          segments.splice(i, 1);
        }
      }
    }

    newsegwait--;
    if (newsegwait <= 0) {
      newsegwait = random(60, 120);
      let numsegments = Math.round(random(1, 3));
      for (i = 0; i < numsegments; i++) {
        segments.push(new Segment());
      }
    }

    for (i = floatingTexts.length - 1; i >= 0; i--) {
      floatingTexts[i].update();
      if (floatingTexts[i].remove == true) {
        floatingTexts.splice(i, 1);
      }
    }

    for (i = particles.length - 1; i >= 0; i--) {
      particles[i].update();
      if (particles[i].remove == true) {
        particles.splice(i, 1);
      }
    }

    for (i = effects.length - 1; i >= 0; i--) {
      if (effects[i].remove == true) {
        effects.splice(i, 1);
      }
    }

    myloading.update();
  }

  for (i = waits.length - 1; i >= 0; i--) {
    waits[i].update();
    if (waits[i].remove == true) {
      waits.splice(i, 1);
    }
  }
}

function timeScale(scale) {
  window.clearInterval(updatetimer);
  updatefps = defupdatefps * scale;
  if (scale != 0) {
    updatetimer = window.setInterval(updateFrame, 1000 / updatefps);
  }
}

function pauseOn() {
  pause = true;
  document.title = txt("loading") + " (" + txt("paused") + ")";
}

function pauseOff() {
  pause = false;
  document.title = txt("loading");
}

function togglePause() {
  if (pause) {
    pauseOff();
  } else {
    pauseOn();
  }
}

function mousewheel(e) {
  if (pause == false) {
    let newangle = myloading.rotation + e.deltaY * -0.15;
    newangle = Math.round(degAngleRange(newangle));

    myloading.rotation = newangle;

    //animateProperty(myloading, "rotation", newangle, 250);
  }
}

let lastdownpos = [];
let lastmovepos = [];
let lastuppos = [];

function mousedown(e) {
  isdragging = !pause;
  lastdownpos = [e.clientX, e.clientY];
  lastmovepos = [e.clientX, e.clientY];
}

function mousemove(e) {
  if (isdragging && pause == false) {
    let deltaX = e.clientX - lastmovepos[0];
    let deltaY = e.clientY - lastmovepos[1];

    myloading.x += deltaX * dragModifier;
    myloading.y += deltaY * dragModifier;

    if (myloading.x > canvas.width) {
      myloading.x = canvas.width;
    }
    if (myloading.x < 0) {
      myloading.x = 0;
    }
    if (myloading.y > canvas.height) {
      myloading.y = canvas.height;
    }
    if (myloading.y < 0) {
      myloading.y = 0;
    }
  }
  lastmovepos = [e.clientX, e.clientY];

  /*for (let k = 0; k < random(10, 16); k++) {
        particles.push(new Particle(e.clientX, e.clientY, random(5, 10), randomArray(["red","orange","yellow","green","blue","indigo","violet"]), random(4, 8), random(4, 10)));
    }*/
}

function mouseup(e) {
  isdragging = false;
  lastuppos = [e.clientX, e.clientY];
}

canvas.onwheel = mousewheel;
canvas.onmousedown = mousedown;
canvas.onmousemove = mousemove;
canvas.onmouseup = mouseup;

canvas.ontouchstart = function (e) {
  e.preventDefault();
  mousedown(e.changedTouches[0]);
};
canvas.ontouchmove = function (e) {
  e.preventDefault();
  mousemove(e.changedTouches[0]);
};
canvas.ontouchend = function (e) {
  e.preventDefault();
  mouseup(e.changedTouches[0]);
};

let tnum = 0;
let lnum = 1;

function keydown(e) {
  if (!pause) {
    if (keymap.left.includes(e.code)) {
      keyspressed.l = true;
    }
    if (keymap.right.includes(e.code)) {
      keyspressed.r = true;
    }
    if (keymap.up.includes(e.code)) {
      keyspressed.u = true;
    }
    if (keymap.down.includes(e.code)) {
      keyspressed.d = true;
    }
  }

  if (keymap.mute.includes(e.code)) {
    if (soundMute) {
      soundMute = false;
    } else {
      soundMute = true;
    }
    floatingTexts.push(new FloatingText(soundMute ? "Mute" : "UnMute", myloading.x, myloading.y));
  }

  if (keymap.theme.includes(e.code)) {
    theme = themes[tnum];
    if (e.shiftKey) {
      tnum -= 1;
      if (tnum < 0) {
        tnum = themes.length - 1;
      }
    } else {
      tnum = (tnum + 1) % themes.length;
    }
    floatingTexts.push(new FloatingText(theme.themename, myloading.x, myloading.y));
  }

  if (keymap.lang.includes(e.code)) {
    lang = langs[lnum];
    if (e.shiftKey) {
      lnum -= 1;
      if (lnum < 0) {
        lnum = langs.length - 1;
      }
    } else {
      lnum = (lnum + 1) % langs.length;
    }
    document.dir = lang.dir;
    canvas.dir = lang.dir;
    document.title = lang.loading;
    if (pause) {
      document.title = txt("loading") + " (" + txt("paused") + ")";
    }
    floatingTexts.push(new FloatingText(lang.langname, myloading.x, myloading.y));
  }

  if (keymap.pause.includes(e.code)) {
    togglePause();
  }
}

function keyup(e) {
  if (keymap.left.includes(e.code)) {
    keyspressed.l = false;
  }
  if (keymap.right.includes(e.code)) {
    keyspressed.r = false;
  }
  if (keymap.up.includes(e.code)) {
    keyspressed.u = false;
  }
  if (keymap.down.includes(e.code)) {
    keyspressed.d = false;
  }
}

document.onkeydown = keydown;

document.onkeyup = keyup;

//-----------------------------------------

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function initialize() {
  resize();
  reset();
  window.clearInterval(updatetimer);
  updatetimer = window.setInterval(updateFrame, 1000 / updatefps);
  raf = window.requestAnimationFrame(drawFrame);
  document.dir = lang.dir;
  canvas.dir = lang.dir;
  document.title = lang.loading;
}

window.onload = initialize;
window.onresize = resize;
