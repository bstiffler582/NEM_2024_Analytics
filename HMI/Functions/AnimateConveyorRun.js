// Keep these lines for a best effort IntelliSense of Visual Studio 2017 and higher.
/// <reference path="./../../Packages/Beckhoff.TwinCAT.HMI.Framework.12.760.59/runtimes/native1.12-tchmi/TcHmi.d.ts" />

(function (/** @type {globalThis.TcHmi} */ TcHmi) {
    (function (AnimateConveyor) {

        var timers = {};

        AnimateConveyor.ToggleRun = (running, control, interval) => {

            const id = control.getId();

            // get polygon child controls
            const shapes = control.getChildren()
                .filter(c => c.getType() === 'TcHmi.Controls.Beckhoff.TcHmiPolygon');

            if (shapes.length < 2)
                return;

            // clear timer if stopped / detached
            if (!running) {
                shapes.forEach((s) => s.setVisibility('Hidden'));
                clearInterval(timers[id]);
                timers[id] = 0;
            }

            // toggle polygon visibility
            if (running && !timers[id]) {
                const vis = ['Hidden', 'Visible'];
                let j = 1;

                timers[id] = setInterval(() => {
                    shapes.forEach((s, i) => s.setVisibility(vis[(j + i) % 2]));
                    j++;
                }, interval);
            }
        };

    })(AnimateConveyor = TcHmi.AnimateConveyor || (TcHmi.AnimateConveyor = {}));
})(TcHmi);

(function (/** @type {globalThis.TcHmi} */ TcHmi) {
    var Functions;
    (function (/** @type {globalThis.TcHmi.Functions} */ Functions) {
        var HMI;
        (function (HMI) {
            function AnimateConveyorRun(running, control, interval) {
                TcHmi.AnimateConveyor.ToggleRun(running, control, interval);
            }
            HMI.AnimateConveyorRun = AnimateConveyorRun;
        })(HMI = Functions.HMI || (Functions.HMI = {}));
    })(Functions = TcHmi.Functions || (TcHmi.Functions = {}));
})(TcHmi);
TcHmi.Functions.registerFunctionEx('AnimateConveyorRun', 'TcHmi.Functions.HMI', TcHmi.Functions.HMI.AnimateConveyorRun);
