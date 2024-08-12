// Keep these lines for a best effort IntelliSense of Visual Studio 2017 and higher.
/// <reference path="./../../Packages/Beckhoff.TwinCAT.HMI.Framework.12.760.59/runtimes/native1.12-tchmi/TcHmi.d.ts" />

(function (/** @type {globalThis.TcHmi} */ TcHmi) {
    var Functions;
    (function (/** @type {globalThis.TcHmi.Functions} */ Functions) {
        var HMI;
        (function (HMI) {
            function TranslateConvPos(Control, xPos, yPos, index) {

                const interval = setInterval(render, 200);
                const spawn = { x: 110, y: 55 };
                var extract = false;

                async function render() {

                    const x = await TcHmi.Extensions.ReadSymbolAsync(xPos.getExpression().toString());
                    const y = await TcHmi.Extensions.ReadSymbolAsync(yPos.getExpression().toString());

                    const xMult = 0.60;
                    const yMult = 0.475;

                    const xOffset = 180 - (index * 60);
                    const yOffset = 0;
                    
                    if (y !== 0) {
                        extract = true;
                    } else {
                        // main conveyor motion
                        Control.setRight(spawn.x + ((x + xOffset) * xMult));
                        Control.setTop(spawn.y + ((x + xOffset) * yMult));
                    }

                    // reset to spawn
                    if (extract && y === 0) {
                        Control.setRight(spawn.x);
                        Control.setTop(spawn.y);
                        Control.setZindex(7);
                        extract = false;
                    }


                }
                
                //const xStart = 98;
                //const yStart = 58;
                //const xOffset = 180 - (index * 60);
                //const xMult = 0.60;
                //const yMult = 0.475;

                //// start pos
                //if (xPos === -180 && yPos === 0) {
                //    Control.setRight(xStart);
                //    Control.setTop(yStart);
                //} else {
                //    Control.setRight(xStart + ((xOffset + xPos)) * xMult);
                //    if (yPos === 0) {
                //        Control.setTop(yStart + ((xOffset + xPos)) * yMult);
                //    } else {
                //        // change direction
                //        Control.setRight(Control.getRight() + (yPos));
                //        Control.setTop(Control.getTop() + -(yPos / 20));
                //    }
                //}
            }
            HMI.TranslateConvPos = TranslateConvPos;
        })(HMI = Functions.HMI || (Functions.HMI = {}));
    })(Functions = TcHmi.Functions || (TcHmi.Functions = {}));
})(TcHmi);
TcHmi.Functions.registerFunctionEx('TranslateConvPos', 'TcHmi.Functions.HMI', TcHmi.Functions.HMI.TranslateConvPos);
