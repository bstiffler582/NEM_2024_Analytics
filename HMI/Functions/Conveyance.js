// Keep these lines for a best effort IntelliSense of Visual Studio 2017 and higher.
/// <reference path="./../../Packages/Beckhoff.TwinCAT.HMI.Framework.12.760.59/runtimes/native1.12-tchmi/TcHmi.d.ts" />

(function (/** @type {globalThis.TcHmi} */ TcHmi) {
    (function (Conveyance) {

        // motion: top: 1, right: 1.25 (0.8 ratio t:r)
        const rVeloc = 1.25;
        const src = 'Imports/Images/';

        var interval;
        var boxes = [];

        var objects = {
            clamp: {
                top: 110,
                block: false
            },
            barrier: {
                top: 140,
                block: false
            },
            sensor1: {
                top: 230,
                state: false
            },
            sensor2: {
                top: 360,
                state: false
            },
            actuator1: {
                top: 275,
                block: false
            },
            actuator2: {
                top: 415,
                block: true
            }
        };

        Conveyance.Init = () => {
            boxes = [];
            const control = TcHmi.Controls.get('imgBox1');
            boxes.push({ ctrl: control, metallic: false, at: '' });
            interval = setInterval(renderLoop, 200);
        }

        Conveyance.Cleanup = () => {
            clearInterval(interval);
        }

        Conveyance.SetObject = (id, property, value) => {
            objects[id][property] = value;
        }

        function renderLoop() {

            // conveyance motion
            const speed = 4.40;

            // for each box
            boxes.forEach(b => {

                const top = b.ctrl.getTop();
                const right = b.ctrl.getRight();
                const id = b.ctrl.getId();
                let stop = false;

                // box to box collision
                /*for (var x in boxes) {
                    if (!x.ctrl.getId() === id) {
                        if (top - x.ctrl.getTop() <= 25)
                            stop = true;
                    }
                }*/

                // for each static object
                for (var o in objects) {

                    // check for object interference
                    if (interference(top, objects[o].top, speed)) {

                        // set box pos
                        b.at = o;

                        // stop if blocking object
                        if (objects[o].block) {
                            stop = true;
                            break;
                        } else {
                            stop = false;
                        }

                        // sensors and actuators
                        if (o === 'sensor1' && objects[o].state) {
                            b.metallic = true;
                            b.ctrl.setSrc(src + 'metal.png');
                            objects['actuator1'].block = true;
                        } else if (o === 'sensor2') {
                            b.ctrl.setSrc(src + 'nonmetal1.png');
                            objects['actuator2'].block = true;
                        }
                    }
                }

                if (!stop) {
                    if ((b.at === 'actuator1' && b.metallic) || b.at === 'actuator2') {
                        // actuation
                        b.ctrl.setTop(top + speed);
                        b.ctrl.setRight(right - (speed * 2.5));
                    } else {
                        // main conveyor motion
                        b.ctrl.setTop(top + speed);
                        b.ctrl.setRight(right + (speed * rVeloc));
                    }
                }
            });
            
        }

        function interference(atop, btop, speed) {
            const db = speed / 2;
            return (btop - atop <= db && atop - btop <= db);
        }

    })(Conveyance = TcHmi.Conveyance || (TcHmi.Conveyance = {}));
})(TcHmi);
