document.addEventListener("DOMContentLoaded", function () {
      var processingEvent = getUrlParameter('room');

      function getUrlParameter(e) {
            e = e.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
            var r = new RegExp("[\\?&]" + e + "=([^&#]*)"),
                  a = r.exec(location.search);
            return null === a ? "" : decodeURIComponent(a[1].replace(/\+/g, " "))
      };
      var mouse = {
            click: false,
            move: false,
            pos: {
                  x: 0,
                  y: 0
            },
            pos_prev: false
      };
      // get canvas element and create context
      var canvas = document.getElementById('drawing');
      var context = canvas.getContext('2d');
      var width = window.innerWidth;
      var height = window.innerHeight;
      // var socket = io.connect();
      var socket = io.connect({
            query: "Event=" + processingEvent
      });
      // var socket = io.connect(
      //       '/whiteboard', {
      //       query: "Event=" + processingEvent
      // });

      // set canvas to full browser width/height
      canvas.width = width;
      canvas.height = height;

      // register mouse event handlers
      canvas.onmousedown = function (e) {
            mouse.pos_prev = {
                  x: e.clientX / width,
                  y: e.clientY / height
            };
            mouse.click = true;
      };
      canvas.onmouseup = function (e) {
            mouse.click = false;
      };

      canvas.onmousemove = function (e) {
            // normalize mouse position to range 0.0 - 1.0
            mouse.pos.x = e.clientX / width;
            mouse.pos.y = e.clientY / height;
            mouse.move = true;
            //mouse.click = true;
      };
      //mobile events
      canvas.ontouchstart = function (e) {
            mouse.pos.x = e.targetTouches[0].clientX / width;
            mouse.pos.y = e.targetTouches[0].clientY / height;
            // normalize mouse position to range 0.0 - 1.0
            mouse.pos_prev = {
                  x: e.targetTouches[0].clientX / width,
                  y: e.targetTouches[0].clientY / height
            };
            mouse.click = true;
      };
      canvas.ontouchmove = function (e) {
            // normalize mouse position to range 0.0 - 1.0
            mouse.pos.x = e.targetTouches[0].clientX / width;
            mouse.pos.y = e.targetTouches[0].clientY / height;
            mouse.move = true;
      };
      canvas.ontouchend = function (e) {
            // normalize mouse position to range 0.0 - 1.0
            mouse.click = false;
      };

      // draw line received from server
      socket.on('draw_line', function (data) {
            var line = data.line;
            context.beginPath();
            context.moveTo(line[0].x * width, line[0].y * height);
            context.lineTo(line[1].x * width, line[1].y * height);
            context.stroke();
      });

      // main loop, running every 25ms
      function mainLoop() {
            // check if the user is drawing
            if (mouse.click && mouse.move && mouse.pos_prev !== undefined) {
                  // send line to to the server
                  if (!processingEvent)
                        return;
                  else {
                        socket.emit('draw_line', {
                              line: [mouse.pos, mouse.pos_prev],
                              eventId: processingEvent
                        });
                  }

                  mouse.move = false;
            }
            mouse.pos_prev = {
                  x: mouse.pos.x,
                  y: mouse.pos.y
            };

            setTimeout(mainLoop, 25);
      }
      mainLoop();
});
//for remove rubber scroll
document.addEventListener(
      'touchmove',
      function (e) {
            e.preventDefault();
      },
      false
);