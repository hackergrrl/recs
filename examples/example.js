var recs = require('./')()

function GravityWell () {
  this.power = 10
}

function Body () {
  this.x = 0
  this.y = 0
  this.xv = 0
  this.yv = 0
}

function Health () {
  this.amount = 100
}

var Blackhole = [Body, GravityWell]

var Physics = recs.system([Body], function (d) {
  d.body.x += d.body.xv
  d.body.y += d.body.yv
  console.log('Physics', d.body.x, d.body.y)
})

var Suction = recs.system(Blackhole, [Body], function (g, d) {
  console.log('Suction')

  var dx = g.body.x - d.body.x
  var dy = g.body.y - d.body.y
  var len = Math.sqrt(dx*dx + dy*dy) + 0.0001
  var force = g.gravityWell.power / (len * len)
  dx /= len
  dy /= len
  d.body.xv += dx
  d.body.yv += dy

  if (len <= 5) {
    d.emit('sucked-in')
  }
})

recs.on([Health], 'sucked-in', function (e) {
  console.log('sucked in')
  e.amount -= 5
})

recs.entity(Blackhole, function (e) {
  console.log('blackhole init')
  e.body.x = 300
  e.body.y = 300
})

recs.entity([Body, Health], function (e) {
  console.log('ship init')
  e.body.x = 0
  e.body.y = 300
  e.body.xv = 0
  e.body.yv = 0
})

for (var i=0; i < 90; i++) recs.tick()
