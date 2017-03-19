var recs = require('./')()
var PIXI = require('pixi.js')

var app = new PIXI.Application(640, 480, {backgroundColor : 0x1099bb})
document.body.appendChild(app.view)

function GravityWell () {
  this.power = 1000
}

function Sprite () {
  var sprite = PIXI.Sprite.fromImage('bunny.png')
  sprite.anchor.set(0.5)
  app.stage.addChild(sprite)
  return sprite
}

function Health () {
  this.amount = 100
}

function Body () {
  this.x = 0
  this.y = 0
  this.xv = 0
  this.yv = 0
  this.rot = 0
  this.rotVel = 0
}

var Blackhole = [Body, GravityWell, Sprite]

recs.system([Body], function (d) {
  d.body.x += d.body.xv
  d.body.y += d.body.yv
  d.body.rot += d.body.rotVel
  // console.log('Physics', d.body.x, d.body.y)
})

recs.system(Blackhole, [Body, Sprite], function (g, d) {
  // console.log('Suction')
  var dx = g.body.x - d.body.x
  var dy = g.body.y - d.body.y
  var len = Math.sqrt(dx*dx + dy*dy) + 0.0001
  var force = g.gravityWell.power / (len * len)
  dx /= len
  dy /= len
  d.body.xv += force * dx
  d.body.yv += force * dy

  d.body.rotVel = force

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
  e.sprite.tint = 0xff44ff
})

for (var i=0; i < 10; i++) {
  recs.entity([Body, Health, Sprite], function (e) {
    console.log('bunny init')
    e.body.x = 300
    e.body.y = 200 - i * 10
    e.body.xv = 3
    e.body.yv = 0

    e.sprite.scale.x = 0.5 + i * 0.2
    e.sprite.scale.y = 0.5 + i * 0.2

    e.body.rotVel = 0.1
  })
}

recs.system([Body, Sprite], function (e) {
  e.sprite.x = e.body.x
  e.sprite.y = e.body.y
  e.sprite.rotation = e.body.rot
})

recs.system(Blackhole, function (e) {
  var c = Math.sin((new Date()).getTime() / 160) * 0.03 + 1
  e.sprite.scale.x = c
  e.sprite.scale.y = c
})

app.ticker.add(function(delta) {
  // TODO: accept delta
  recs.tick()
})
