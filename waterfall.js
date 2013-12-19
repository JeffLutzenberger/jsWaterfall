'use strict';

$(function () {
    var canvas = new Canvas($('canvas')[0]),
        waterfall = new Waterfall(canvas),
        debug = false,
        mouseDown = false;
    if (debug) {
        waterfall.update();
    } else {
        setInterval(waterfall.update.bind(waterfall), 24);
    }

    $("#canvas").click(function (e) {
        var x = Math.floor((e.pageX - $("#canvas").offset().left)),
            y = Math.floor((e.pageY - $("#canvas").offset().top));
        waterfall.wayPoint = new Vector(x, y);
    });
   
    $("#canvas").mousedown(function () {
        mouseDown = true;
    });

    $(document).mouseup(function () {
        mouseDown = false;
    });

    $("#canvas").mousemove(function (e) {
        if (mouseDown === false) {
            return;
        }
        var x = Math.floor((e.pageX - $("#canvas").offset().left)),
            y = Math.floor((e.pageY - $("#canvas").offset().top));
        waterfall.wayPoint = new Vector(x, y);
    });
});

var Waterfall = function (canvas) {
    
    var i, p, waterfallWidth = 400;
    this.originX = canvas.width / 2 - waterfallWidth / 2;
    this.originY = 0;
    this.waterfallWidth = waterfallWidth;
    this.canvas = canvas;
    this.nParticles = 100;
    this.particles = [];
    this.wayPoint = new Vector(canvas.width / 2, this.originY + 200);

    for (i = 0; i < this.nParticles; i += 1) {
        p = new Particle(this.originX + Math.random() * this.waterfallWidth,
                         this.originY + Math.random() * this.canvas.height);
        p.vel.x = 0;
        p.vel.y = 0;
        this.particles[i] = p;
    }
};

Waterfall.prototype = {
    
    update: function () {
        var i = 0, nearest, color;

        this.canvas.clear();
        
        this.drawWayPoint();

        for (i = 0; i < this.nParticles; i += 1) {
            nearest = this.nearestNeighbor(i);
            this.moveParticle(this.particles[i], this.wayPoint, nearest);
        }

        for (i = 0; i < this.nParticles; i += 1) {
            color = 'rgba(0,153,255,1)';
            this.drawParticle(this.particles[i], color);
        }
        
    },

    nearestNeighbor: function (index) {
        /**
         * Find the particle closest to the particle at this index
         * @param {integer} index of particle to test against
         * @return {Particle} closest neighboring particle
         * */
        var i = 0,
            minD = 1e6,
            nearest,
            p = this.particles[index],
            d = minD;

        for (i = 0; i < this.nParticles; i += 1) {
            if (i !== index) {
                d = p.distanceSquared(this.particles[i]);
                if (d < minD) {
                    minD = d;
                    nearest = this.particles[i];
                }
            }
        }
        return nearest;
    },

    moveParticle: function (particle, wayPoint, nearestNeighbor) {
        /**
         * move our particle
         * @param {Particle} the particle to move
         * @param {Vector} wayPoint where we're headed
         * @param {Particle} nearest particle 
         * */
        var i = 0, v2, d2;

        particle.trace();

        particle.vel.y += 0.1;
       
        v2 = new Vector(this.wayPoint.x - particle.x, this.wayPoint.y - particle.y);
        d2 = v2.squaredLength();
        d2 = 500 / d2;
        if (d2 > 0.3) {
            d2 = 0.3;
        }
        v2 = v2.normalize();
        v2 = v2.scalarMultiply(d2);
        particle.vel.x -= v2.x;
        particle.vel.y -= v2.y;
        particle.x += particle.vel.x;
        particle.y += particle.vel.y;

        if (particle.y > this.canvas.height) {
            particle.x = this.originX + Math.random() * this.waterfallWidth;
            particle.y = this.originY + Math.random() * 10;
            particle.vel.x = 0;
            particle.vel.y = 0;
            for (i = 0; i < particle.numTracers; i += 1) {
                particle.trail[i].x = particle.x;
                particle.trail[i].y = particle.y;
            }
        }
    },

    drawParticle: function (p, color) {
        if (p.y > this.canvas.height) {
            return;
        }
        var i = 0, alpha = 1.0, t1, t2;
        this.canvas.circle(p.x, p.y, p.radius, color);
        for (i = 1; i < p.numTracers; i += 1) {
            t1 = p.trail[i - 1];
            t2 = p.trail[i];
            alpha = (p.numTracers - p.trail[i].age) / p.numTracers;
            color = 'rgba(0,153,255,' + alpha + ')';
            this.canvas.line(t1, t2, color);
        }
    },

    drawWayPoint: function () {
        var alpha = 1, color = 'rgba(0,153,255,' + alpha + ')';
        this.canvas.circle(this.wayPoint.x, this.wayPoint.y, 5, color);
    }

};
