var recs = require('../')()

function GravityWell () {
  this.power = 1000
}

function Body () {
  this.x = 0
  this.y = 0
  this.xv = 0
  this.yv = 0
}

var Blackhole = [Body, GravityWell]
var Ship = [Body]

recs.system(Ship, function (d) {
  d.body.x += d.body.xv
  d.body.y += d.body.yv

  console.log('Physics', d.body.x, d.body.y)
})

recs.system(Blackhole, Ship, function (g, d) {
  var dx = g.body.x - d.body.x
  var dy = g.body.y - d.body.y
  var len = Math.sqrt(dx*dx + dy*dy) + 0.0001
  var force = g.gravityWell.power / (len * len)
  d.body.xv += force * dx / len
  d.body.yv += force * dy / len

  console.log('Suction')
})

recs.entity(Blackhole, function (e) {
  e.body.x = 30
  e.body.y = 0

  console.log('blackhole init')
})

recs.entity(Ship, function (e) {
  e.body.x = 0
  e.body.y = 0
  e.body.xv = 0
  e.body.yv = 0

  console.log('ship init')
})

recs.tick()
recs.tick()
recs.tick()
