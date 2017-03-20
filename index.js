module.exports = Recs

var nano = require('nano-ecs')

function Recs () {
  if (!(this instanceof Recs)) return new Recs()

  var world = nano()

  var singleSystems = []
  var comboSystems = []
  var eventHandlers = []

  this.system = function (name, comps1, comps2, cb) {
    if (typeof name !== 'string') {
      cb = comps2
      comps2 = comps1
      comps1 = name
    }
    if (typeof comps2 === 'function' && !cb) {
      cb = comps2
      singleSystems.push({
        requirements: comps1,
        func: cb
      })
    } else {
      comboSystems.push({
        requirements1: comps1,
        requirements2: comps2,
        func: cb
      })
    }
  }

  this.entity = function (name, comps, cb) {
    if (Array.isArray(name)) {
      cb = comps
      comps = name
      name = ''
    }

    var e = world.createEntity()
    e._name = name
    comps.forEach(function (c) {
      e.addComponent(c)
    })

    e.emit = entityEmit

    cb(e)
  }

  function entityEmit (msg) {
    var self = this
    eventHandlers.forEach(function (handler) {
      if (self.hasAllComponents(handler.requirements)) {
        handler.func(self)
      }
    })
  }

  this.on = function (comps, eventName, cb) {
    eventHandlers.push({
      requirements: comps,
      name: eventName,
      func: cb
    })
  }

  this.tick = function () {
    var args = Array.prototype.slice.call(arguments)

    singleSystems.forEach(function (system) {
      var entities = world.queryComponents(system.requirements)
      entities.forEach(function (e) {
        system.func.apply(null, [e].concat(args))
      })
    })
    comboSystems.forEach(function (system) {
      var entities1 = world.queryComponents(system.requirements1)
      var entities2 = world.queryComponents(system.requirements2)
      for (var i = 0; i < entities1.length; i++) {
        var e1 = entities1[i]
        for (var j = 0; j < entities2.length; j++) {
          var e2 = entities2[j]
          if (e1 === e2) continue
          system.func.apply(null, [e1, e2].concat(args))
        }
      }
    })
  }
}

