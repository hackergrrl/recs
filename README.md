# recs

> functional entity-component-system experiment

recs allows for the definitions of components, systems, and message handlers on
entities in a way that reduces shared state and promotes isolation.

To read more about the ECS pattern, take a look at
[nano-ecs](https://github.com/noffle/nano-ecs), the underlying module that
powers recs. It's a really useful pattern for writing the core logic in video
games.

## Usage

```js
var recs = require('recs')()

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
```

outputs

```
blackhole init
ship init
Physics 30 0
Physics 0 0
Suction
Physics 30 0
Physics 1.1111000000740736 0
Suction
Physics 30 0
Physics 3.4204114875106733 0
Suction
```

You can see a similar [graphical demo in action, too](https://noffle.github.io/recs/).

## Core Ideas

### Components

Components are any named Javascript functions. For example:

```js
function Health () {
  this.maxHp = 100
  this.hp = this.maxHp
}
```

Components define data and not behaviour.

### Entities

Entities are a collection of component instances. On their own, they have no
data and no functionality. They are created using `recs.entity()`:

```js
recs.entity([Physics, Health, Sprite], function init (e) {
  e.physics.velocity = [10, -4]
  e.health.maxHp = 500
  e.sprite.image = imageFromFile('ship.png')
})
```

### Systems

Systems are stateless functions that operate on all entities that have at least
the system's required components:

```js
recs.system([Physics], function process (e) {
  e.physics.velocity[0] += e.physics.position[0]
  e.physics.velocity[1] += e.physics.position[1]
})
```

### Messages

Messages can be published, in an [EventEmitter]()-style, on a specific entity.
Message receivers specify what components they require in order to be received:
all applicable receivers are fired.

```js
recs.recv([Health], 'damage', function (e, amount) {
  e.health.hp -= amount
})

recs.recv([Human], 'damage', function (e) {
  console.log('ouch!')
})

recs.system([Health, Human], function onFire (e) {
  e.send('damage', 25)
})

recs.system([Health, Cyborg], function onFire (e) {
  e.send('damage', 1)
})
```

## API

```js
var RECS = require('recs')
var recs = RECS()

// or

var recs = require('recs')()
```

### recs.system([name,] components, func)

Defines a system that runs on all entities that have `components`. Runs the
function `func` with an entity as its sole parameter.

### recs.system([name,] componentsA, componentsB, func)

Defines a system that runs on the cartesian product of all entities that have
`componentsA` in one group, and all entities with `componentsB` in the other
group. Runs the function `func` with signature `function (entityA, entityB) {}`.

These systems are particularly useful when two types of entities need to
interact regularly, like collision detection:

```js
recs.system([Player, BoundingBox], [Projectile, BoundingBox], function (plr, proj) {
  if (collides(plr.boundingBox, proj.boundingBox)) {
    plr.send('collision', plr)
    plr.send('collision', proj)
  }
})
```

### recs.recv(components, msg, cb)

Registers a message receiver, which fires if a message is sent to an entity that
has the listed `components` and the message name `msg`. `cb` is called with an
entity as its first parameter; any other params passed on `send` are included as
subsequent arguments.

```js
recs.recv([Balloon], 'burst', function (e, adverb) {
  console.log('the balloon bursts ' + adverb)
})

recs.system([Balloon], function (e) {
  e.balloon.lifetime--

  if (e.balloon.lifetime === 0) {
    e.send('burst', 'loudly')
  }
})
```

### recs.entity([name,] components[, cb])

Creates a new entity with components `components`. `cb` is called with a
reference to the brand new entity for any initialization you'd like to do.

```js
recs.entity([Balloon], function (e) {
  e.balloon.lifetime = 16
})
```

### recs.tick()

Runs all systems on all applicable entities exactly once. Any arguments passed
into `tick()` will be available as additional parameters to all systems called.

This is useful for providing systems with e.g. a time delta.

## Install

With [npm](https://npmjs.org/) installed, run

```
$ npm install recs
```

## Acknowledgments

recs was largely inspired by the [regl](https://github.com/regl-project/regl)
project.

## License

ISC

