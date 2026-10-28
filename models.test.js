import test from 'node:test';
import assert from 'node:assert/strict';
import {Road,demandModel,braess,signalModel,driverStyle} from '../models.js';
const base={inflow:4000,lanes:2,speed:80,trucks:25,autos:25,gap:1.5,count:36};
test('fixed demand benefits from widening; response restores pressure',()=>{assert.ok(demandModel(4,1,0).time<11.5);assert.ok(Math.abs(demandModel(4,1,10).time-11.5)<.1);assert.ok(demandModel(4,1.5,10).time>11.5);assert.equal(demandModel(4,0,10).demand,3600)});
test('Braess classic and low/high demand boundary cases',()=>{assert.equal(braess(4000,false).time,65);assert.equal(braess(4000,true).time,80);assert.equal(braess(1000,true).time,20);assert.equal(braess(10000,true).time,95);for(let n=1000;n<=10000;n+=500){const m=braess(n,true);assert.equal(2*m.outer+m.shortcut,n);if(m.outer>0&&m.shortcut>0)assert.equal(m.variable,45)}});
test('signal capacity obeys green-time conservation',()=>{const m=signalModel(900,500,60,65);assert.equal(m.greenA+m.greenB,52);assert.ok(Math.abs(m.capA+m.capB-1560)<1e-8);assert.ok(m.capA>900&&m.capB>500)});
function check(r){for(const c of r.cars){assert.ok(Number.isFinite(c.v)&&c.v>=0);assert.ok(Number.isFinite(c.x));assert.ok(r.leader(c).gap>=.49,`overlap at ${r.t}`)}}
test('road conserves arrivals, remains finite and prevents overlaps',()=>{const r=new Road(base);let departed=0;for(let i=0;i<3600;i++){const before=r.cars.length+r.queue.length;r.step();const after=r.cars.length+r.queue.length;departed+=Math.max(0,before+Math.floor(r.t*base.inflow/3600+1e-7)-Math.floor((r.t-.05)*base.inflow/3600+1e-7)-after);if(i%20===0)check(r)}assert.ok(r.metrics().flow>0);assert.ok(r.queue.length+r.cars.length>0);assert.ok(departed>0)});
test('ring preserves cars across wrap and braking at every supported density',()=>{for(const count of [12,36,60]){const r=new Road({...base,count,trucks:0,autos:0},true);for(let i=0;i<3600;i++){if(i===600)r.brake();r.step();if(i%20===0)check(r)}assert.equal(r.cars.length,count)}});
test('same seed gives reproducible mixed traffic',()=>{const a=new Road(base),b=new Road(base);for(let i=0;i<2000;i++){a.step();b.step()}assert.deepEqual(a.cars,b.cars);assert.deepEqual(a.metrics(),b.metrics())});
test('aggressiveness changes motion while both extremes remain collision-free',()=>{
 const speeds=[];
 for(const aggression of [0,100]){
  const r=new Road({...base,aggression});const c=r.make();c.type='car';r.cars=[c];r.p.inflow=0;
  for(let i=0;i<100;i++)r.step();speeds.push(c.v);
  for(const ring of [false,true]){const dense=new Road({...base,count:60,gap:.7,aggression,inflow:6000},ring);for(let i=0;i<3600;i++){if(i===600)dense.brake();dense.step();if(i%20===0)check(dense)}}
 }
 assert.ok(speeds[1]>speeds[0]);assert.ok(driverStyle({...base,aggression:100}).gap<driverStyle({...base,aggression:0}).gap);
});
