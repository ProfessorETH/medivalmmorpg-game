"use strict";
const soundscape = (() => {
  let context, music, foley, noise, next = 0, beat = 0, scene = "";
  const last = new Map();
  const controls = ["musicLevel", "effectsLevel"].map((id, index) => {
    const input = document.getElementById(id);
    try { input.value = localStorage.getItem(id) ?? (index ? 80 : 65) } catch {}
    input.oninput = () => {
      try { localStorage.setItem(id, input.value) } catch {}
      levels();
    };
    return input;
  });
  function levels() {
    if (!context) return;
    [music, foley].forEach((bus, i) => bus.gain.setTargetAtTime(1.65 * (controls[i].value / 100) ** 1.5, context.currentTime, .025));
  }
  function unlock() {
    if (document.hidden) return;
    if (!context) {
      const Engine = window.AudioContext || window.webkitAudioContext;
      if (!Engine) return;
      context = new Engine();
      const limiter = context.createDynamicsCompressor();
      limiter.threshold.value = -13;
      limiter.connect(context.destination);
      music = context.createGain(); foley = context.createGain();
      music.connect(limiter); foley.connect(limiter);
      levels();
      noise = context.createBuffer(1, context.sampleRate, context.sampleRate);
      const samples = noise.getChannelData(0);
      for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;
    }
    if (context.state !== "running") context.resume().catch(() => {});
  }
  for (const event of ["pointerdown", "keydown", "click"]) document.addEventListener(event, unlock, {capture:true});
  function silence() { if (context) context.suspend().catch(() => {}) }
  document.addEventListener("visibilitychange", () => document.hidden ? silence() : context && unlock());
  window.addEventListener("pagehide", silence);
  window.addEventListener("pageshow", () => context && unlock());

  function voice(bus, time, hz, tail, level, shape = "sine", end = hz, attack = .006) {
    const source = context.createOscillator(), volume = context.createGain();
    source.type = shape;
    source.frequency.setValueAtTime(hz, time);
    source.frequency.exponentialRampToValueAtTime(end, time + tail);
    volume.gain.setValueAtTime(.0001, time);
    volume.gain.exponentialRampToValueAtTime(level, time + attack);
    volume.gain.exponentialRampToValueAtTime(.0001, time + tail);
    source.connect(volume); volume.connect(bus); source.start(time); source.stop(time + tail);
  }
  function brush(bus, time, hz, end, tail, level) {
    const source = context.createBufferSource(), filter = context.createBiquadFilter(), volume = context.createGain();
    source.buffer = noise; source.loop = true;
    filter.type = "bandpass"; filter.Q.value = .85;
    filter.frequency.setValueAtTime(hz,time); filter.frequency.exponentialRampToValueAtTime(end,time+tail);
    volume.gain.setValueAtTime(.0001,time); volume.gain.exponentialRampToValueAtTime(level,time+.014);
    volume.gain.exponentialRampToValueAtTime(.0001,time+tail);
    source.connect(filter); filter.connect(volume); volume.connect(bus);
    source.start(time, Math.random()*.8); source.stop(time+tail);
  }
  const frequency = note => 440 * 2 ** ((note-69)/12);
  function string(t, note, strength, tail) {
    const hz = frequency(note);
    voice(music,t,hz,tail,strength,"triangle");
    voice(music,t,hz*2.002,tail*.43,strength*.38);
    brush(music,t,3200,900,.05,strength*.22);
  }
  const phrases = {
    ford: [0,null,7,null,12,10,null,7, 3,null,null,5,7,null,null,null],
    yard: [0,7,null,3,5,null,10,7, 0,null,3,7,5,null,null,2],
    fight:[0,7,12,null,10,7,3,5, 0,3,7,10,12,null,7,5],
    boss: [0,1,7,0,10,7,1,5, 0,7,12,1,10,7,5,1]
  };
  function tick(place) {
    if (!context || context.state !== "running" || document.hidden) return;
    const now = context.currentTime;
    if (place !== scene) { scene=place; beat=0; next=now+.03 }
    if (next<now) next=now+.015;
    const battle = place==="fight" || place==="boss";
    const step = {ford:.39,yard:.33,fight:.245,boss:.208}[place];
    while (next < now+.11) {
      const t=next, i=beat%16, root=50+[0,-2,-5,-7][Math.floor(beat/16)%4];
      if (+controls[0].value) {
        const note=phrases[place][i];
        if (note!==null) string(t,root+note+(battle?0:12),i%4?.073:.11,battle?.37:1.35);
        if (i%4===0) voice(music,t,frequency(root-12),step*3.7,.14,"triangle",frequency(root-12),.045);
        if (battle && (i%4===0 || i===11 || place==="boss" && i%4===2)) {
          voice(music,t,145,.23,.26,"sine",52); brush(music,t,1500,390,.12,.16);
        }
        if (battle && i%2) brush(music,t,4500,2300,.09,.085);
      }
      if (+controls[1].value && place==="ford" && i%8===5) brush(foley,t,820,410,1.2,.043);
      if (+controls[1].value && !battle && (i===3 || i===13)) brush(foley,t,1900,760,.09,.031);
      beat++; next+=step;
    }
  }
  function play(name, spacing = .07) {
    if (!context || context.state!=="running" || document.hidden || !+controls[1].value) return;
    const t=context.currentTime;
    if (t-(last.get(name)??-10)<spacing) return;
    last.set(name,t);
    const tone=(hz,len,vol,end=hz,delay=0)=>voice(foley,t+delay,hz,len,vol,"sine",end);
    const air=(hz,end,len,vol,delay=0)=>brush(foley,t+delay,hz,end,len,vol);
    switch(name) {
      case "anvil": tone(685,.33,.05);tone(1440,.18,.033);air(2800,1400,.06,.08);break;
      case "bell": case "forge":
        for (const [ratio,gain] of [[1,.23],[2.02,.11],[2.76,.055],[4.19,.032]]) tone((name==="bell"?293:523)*ratio,name==="bell"?2.5:.65,gain);
        air(3600,1100,.07,.21); break;
      case "oar": air(1200,390,.41,.32); tone(278,.14,.08,116); break;
      case "step": air(650+Math.random()*250,290,.11,.13); break;
      case "warning": tone(260,.21,.15,470); break;
      case "hurt": tone(134,.22,.24,70); air(960,260,.16,.21); break;
      case "dash": air(360,3200,.21,.35); break;
      case "lightning": for(let i=0;i<3;i++) air(6200,550,.16,.47,i*.063); break;
      case "sweep": air(420,2400,.27,.5); tone(170,.24,.25,53,.09); break;
      case "steel": case "twins":
        air(800,3500,.09,.31); tone(1020,.15,.16,740,.035);
        if(name==="twins") air(3600,1100,.12,.25,.11); break;
      case "reward": case "flask":
        [0,1,2].forEach(i=>tone((name==="reward"?390:520)*[1,1.25,1.5][i],.35,.12,undefined,i*.075)); break;
    }
  }
  return { tick, play };
})();
