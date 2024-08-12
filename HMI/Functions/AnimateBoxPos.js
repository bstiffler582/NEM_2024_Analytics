// Keep these lines for a best effort IntelliSense of Visual Studio 2017 and higher.
/// <reference path="./../../Packages/Beckhoff.TwinCAT.HMI.Framework.12.760.59/runtimes/native1.12-tchmi/TcHmi.d.ts" />

(function (/** @type {globalThis.TcHmi} */ TcHmi) {
    (function (AnimateBoxPos) {

        // static motion offsets
        const spawn = { x: 115, y: 60 };
        const xMult = 0.60;
        const yMult = 0.475;
        const yDivert = 0.50;
        const renderLoop = 250;
        const imgSrc = 'Imports/Images';

        const symbolX = '%s%PLC1.MAIN.fbMachine.fbVisu.aBoxX%/s%';
        const symbolY = '%s%PLC1.MAIN.fbMachine.fbVisu.aBoxY%/s%';

        var boxes = [];
        var interval;

        AnimateBoxPos.Init = () => {

            // only initialize one 
            // configured for KeepAlive = true
            if (!boxes.length) {

                // initialize controls
                boxes = Array.from(Array(4), (_, i) => {
                    return {
                        ctrl: TcHmi.Controls.get(`imgBox${i + 1}`),
                        index: i,
                        extract: false,
                        dright: 0,
                        dtop: 0
                    };
                });

                // apply transition style
                boxes.forEach(x => {
                    const elem = x.ctrl.getElement();
                    elem.css("transition", `all ${renderLoop * 2}ms`)
                });

                // initialize render loop
                interval = setInterval(render, renderLoop);
            }
            
        };

        AnimateBoxPos.Cleanup = () => {
            // stop render loop
            clearInterval(interval);
        };

        // reorder box z-indices
        AnimateBoxPos.SetZindex = (index) => {
            const startZ = 7;
            for (let i = 0; i < 4; i++) {
                boxes[Math.abs(index - i + 4) % 4].ctrl.setZindex(startZ + i);
            }
        };

        AnimateBoxPos.SetBoxMaterial = (metal) => {
            const sensorMin = (metal) ? 200 : 320;
            const sensorMax = (metal) ? 220 : 340;

            const box = boxes.find(b => {
                const top = b.ctrl.getTop();
                return (top >= sensorMin && top <= sensorMax);
            });

            box.ctrl.setSrc((metal) ? `${imgSrc}/metal.png` : `${imgSrc}/nonmetal1.png`);
        };

        async function render() {

            // read x, y pos arrays
            const x = await TcHmi.Extensions.ReadSymbolAsync(symbolX);
            const y = await TcHmi.Extensions.ReadSymbolAsync(symbolY);

            boxes.forEach(b => {

                // box start offset
                const xOffset = 180 - (b.index * 60);

                if (y[b.index] !== 0 && !b.extract) {
                    // diverting
                    b.extract = true;
                    b.dright = b.ctrl.getRight();
                    b.dtop = b.ctrl.getTop();
                } else {
                    // show
                    if (b.ctrl.getVisibility() === 'Collapsed')
                        b.ctrl.setVisibility('Visible');

                    // main conveyor motion
                    b.ctrl.setRight(spawn.x + ((x[b.index] + xOffset) * xMult));
                    b.ctrl.setTop(spawn.y + ((x[b.index] + xOffset) * yMult));
                }

                // reset to spawn
                if (b.extract) {
                    if (y[b.index] === 0) {
                        // hide to prevent animated motion to start (css transition)
                        b.ctrl.setVisibility('Collapsed');
                        b.ctrl.setSrc(`${imgSrc}/box_unknown.png`);
                        AnimateBoxPos.SetZindex(b.index);
                        b.extract = false;
                    } else {
                        // divert motion
                        b.ctrl.setRight(b.dright + y[b.index]);
                        b.ctrl.setTop(b.dtop - y[b.index] * yDivert);
                    }
                }
            });
        }

    })(AnimateBoxPos = TcHmi.AnimateBoxPos || (TcHmi.AnimateBoxPos = {}));
})(TcHmi);
