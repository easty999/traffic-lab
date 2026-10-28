export const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export function driverStyle(p){
 const level=clamp(p.aggression??50,0,100);
 return {level,gap:p.gap*(1.4-.008*level),acceleration:.6+.008*level,laneGain:30-.24*level};
}
// Synthetic planning example. Elasticity is a scenario assumption, not an estimate for India.
export function demandModel(lanes,elasticity,years,baseDemand=3600){
 const capacity=lanes*1800, demand=baseDemand*(1+(Math.pow(lanes/2,elasticity)-1)*(1-Math.exp(-years/2)));
 const time=q=>10*(1+.15*Math.pow(q/capacity,4));
 return {capacity,demand,time:time(demand),opening:time(baseDemand),before:11.5,ratio:demand/capacity};
}
// Wardrop equilibrium for S-A: x/100, A-T:45, S-B:45, B-T:x/100, A-B:0.
export function braess(n,open){
 const outer=open?clamp(n-4500,0,n/2):n/2, shortcut=open?n-2*outer:0;
 const variable=(outer+shortcut)/100;
 return {outer,shortcut,variable,time:open?(shortcut>0?2*variable:variable+45):variable+45,before:n/200+45};
}
export function signalModel(flowA,flowB,cycle,share){
 const effective=cycle-8, greenA=effective*share/100,greenB=effective-greenA;
 return {greenA,greenB,capA:1800*greenA/cycle,capB:1800*greenB/cycle,flowA,flowB};
}
export class Road{
 constructor(p,ring=false){this.p={...p};this.ring=ring;this.length=800;this.t=0;this.seed=42;this.cars=[];this.queue=[];this.arrival=0;this.exits=[];this.nextId=0;this.brakeUntil=0;this.brakeId=-1;this.history=[];this.lastSample=-1;
  if(ring){for(let i=0;i<p.count;i++){const c=this.make();c.type='car';c.len=4.5;c.x=i*this.length/p.count;c.lane=0;c.v=12;this.cars.push(c)}}
 }
 random(){this.seed=(1664525*this.seed+1013904223)>>>0;return this.seed/4294967296}
 make(){const r=this.random()*100,type=r<this.p.trucks?'truck':r<this.p.trucks+this.p.autos?'auto':'car';return {id:this.nextId++,type,len:type==='truck'?10:type==='auto'?3:4.5,x:0,v:0,lane:0,a:0}}
 leader(c,lane=c.lane){let best=null,gap=Infinity;for(const o of this.cars){if(o.id===c.id||o.lane!==lane)continue;let d=o.x-c.x;if(this.ring&&d<=0)d+=this.length;if(d>0&&d-o.len<gap){gap=d-o.len;best=o}}return {car:best,gap}}
 brake(){if(this.cars.length){const c=this.cars[Math.floor(this.cars.length/2)];this.brakeId=c.id;this.brakeUntil=this.t+2;c.v=Math.min(c.v,2)}}
 step(dt=.05){const p=this.p,style=driverStyle(p);this.t+=dt;
  if(!this.ring){this.arrival+=p.inflow/3600*dt;while(this.arrival>=1){this.queue.push(this.make());this.arrival--}
   if(this.queue.length){let bestLane=0,bestGap=-1;for(let lane=0;lane<p.lanes;lane++){let gap=Infinity;for(const c of this.cars)if(c.lane===lane)gap=Math.min(gap,c.x-c.len);if(gap>bestGap){bestGap=gap;bestLane=lane}}
    if(bestGap>18){const c=this.queue.shift();c.lane=bestLane;c.v=Math.min(p.speed/3.6,10);this.cars.push(c)}}
  }
  // Simplified safe-gap lane choice; deliberately not the full MOBIL model.
  if(!this.ring&&Math.floor(this.t)!==Math.floor(this.t-dt)){for(const c of this.cars){const current=this.leader(c).gap;for(const lane of [c.lane-1,c.lane+1]){if(lane<0||lane>=p.lanes)continue;const front=this.leader(c,lane);const rear=this.cars.filter(o=>o.lane===lane&&o.x<=c.x).sort((a,b)=>b.x-a.x)[0];if(front.gap>Math.max(14,c.v*style.gap)&&front.gap>current+style.laneGain&&(!rear||c.x-c.len-rear.x>Math.max(12,rear.v*style.gap))){c.lane=lane;break}}}}
  const moves=this.cars.map(c=>{const lead=this.leader(c),v0=Math.max(2,Math.min(p.speed,c.type==='truck'?65:c.type==='auto'?45:130)/3.6),a=(c.type==='truck'?.7:1.2)*style.acceleration,b=2;
   const desired=2+Math.max(0,c.v*style.gap+c.v*(c.v-(lead.car?.v??c.v))/(2*Math.sqrt(a*b)));
   let accel=a*(1-Math.pow(c.v/v0,4)-Math.pow(desired/Math.max(.1,lead.gap),2));
   if(c.id===this.brakeId&&this.t<this.brakeUntil)accel=-5;
   let v=Math.max(0,c.v+clamp(accel,-9,a)*dt),distance=(c.v+v)*dt/2;
   if(lead.car)distance=Math.min(distance,Math.max(0,lead.gap-.5));
   if(distance<(c.v+v)*dt/2)v=distance/dt;
   return {c,v,x:c.x+distance,a:accel};});
  for(const m of moves){Object.assign(m.c,{v:m.v,x:this.ring?m.x%this.length:m.x,a:m.a});if(!this.ring&&m.x>this.length)this.exits.push(this.t)}
  if(!this.ring)this.cars=this.cars.filter(c=>c.x<=this.length);
  this.exits=this.exits.filter(t=>t>this.t-60);
  if(Math.floor(this.t)!==this.lastSample){this.lastSample=Math.floor(this.t);this.history.push(this.metrics().speed);if(this.history.length>120)this.history.shift()}
 }
 metrics(){return {speed:this.cars.length?this.cars.reduce((s,c)=>s+c.v*3.6,0)/this.cars.length:0,queue:this.queue.length,flow:this.exits.length*3600/Math.max(1,Math.min(60,this.t)),count:this.cars.length};}
}
