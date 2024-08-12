## Analytics Lab

### Contents
1. [Setup](#setup)
2. [Analytics Logger](#logger)
3. [Analytics Storage Provider](#storage_provider)
4. [Analytics Workbench](#workbench)
5. [Analytics Runime](#runtime)

---

<a id="setup"></a>

### 1. Setup

- Install / config / run mosquitto MQTT broker
    - Common configurations:
        - authentication, allow_anonymous, certificate paths
        - bridging
        - ...
    - [All conf options](https://mosquitto.org/man/mosquitto-conf-5.html)
- Clone [this](https://github.com/bstiffler582/NEM_2024_Analytics) repository
- Build, activate and run the PLC *programs* locally
    - Make sure both the "_PLC" and "_Simu" projects are running

The application:

This demo program is derived from the OOP [example on infosys](https://infosys.beckhoff.com/english.php?content=../content/1033/tc3_plc_intro/100978955.html&id=7649550070152933723), which uses sensors, conveyors and actuating cylinders to "sort" generic materials through metal or plastic conveyance. It contains two PLC programs - one for the application logic and one to drive the simulation signals. There is a TwinCAT HMI program as well to operate the system in manual or automatic modes.

> Note: If you do not have access to the HMI, you can still run the machine in Auto with the following sequence:
>1. Toggle `PLC1.MAIN.fbMachine.fbVisu.bButtonPowerOut` to turn on machine main power
>2. Toggle `PLC1.MAIN.fbMachine.fbVisu.bButtonAutoOut` to put machine in auto
>3. Toggle `PLC1.MAIN.fbMachine.fbVisu.bButtonStartOut` to start the machine

<a id="logger"></a>

### 2. Analytics Logger

We will configure the Analytics Logger to publish messages to our local broker:
```
Data Format                   ANALYTICS_FORMAT_MQTT_BINARY
...
MQTT Host Name                127.0.0.1
MQTT Tcp Port                 1883
MQTT Main Topic               TcAnalytics
MQTT Client ID                SortingPLC1
```

One stream for each PLC should be automatically created. Our application logic is running on the second PLC instance (port 852), so we will make the following selections under **PlcStream2**:

Machine State:
- MAIN.eMachineState

Clamp cylinder:
- MAIN.fbMachine.fbSeparateModule.fbClamp.bAtBasePos
- MAIN.fbMachine.fbSeparateModule.fbClamp.bAtWorkPos
- MAIN.fbMachine.fbSeparateModule.fbClampDiag.fVibrationSensor
- MAIN.fbMachine.fbSeparateModule.fbClampDiag.fPressureSensor
- MAIN.fbMachine.fbSeparateModule.fbClampTemp.fTempCurrent

Barrier cylinder:
- MAIN.fbMachine.fbSeparateModule.fbBarrier.bAtBasePos
- MAIN.fbMachine.fbSeparateModule.fbBarrier.bAtWorkPos
- MAIN.fbMachine.fbSeparateModule.fbBarrierDiag.fVibrationSensor
- MAIN.fbMachine.fbSeparateModule.fbBarrierDiag.fPressureSensor
- MAIN.fbMachine.fbSeparateModule.fbBarrierTemp.fTempCurrent

Metal divert cylinder:
- MAIN.fbMachine.fbMetalSorting.fbCylinder.bAtBasePos
- MAIN.fbMachine.fbMetalSorting.fbCylinder.bAtWorkPos
- MAIN.fbMachine.fbMetalSorting.fbCylinderDiag.fVibrationSensor
- MAIN.fbMachine.fbMetalSorting.fbCylinderDiag.fPressureSensor
- MAIN.fbMachine.fbMetalSorting.fbCylinderTemp.fTempCurrent

Plastic divert cylinder:
- MAIN.fbMachine.fbPlasticSorting.fbCylinder.bAtBasePos
- MAIN.fbMachine.fbPlasticSorting.fbCylinder.bAtWorkPos
- MAIN.fbMachine.fbPlasticSorting.fbCylinderDiag.fVibrationSensor
- MAIN.fbMachine.fbPlasticSorting.fbCylinderDiag.fPressureSensor
- MAIN.fbMachine.fbPlasticSorting.fbCylinderTemp.fTempCurrent

Conveyors:
- MAIN.Separating_ActPos
- MAIN.Separating_ActVelo
- MAIN.Metal_ActPos
- MAIN.Metal_ActVelo
- MAIN.Plastic_ActPos
- MAIN.Plastic_ActVelo

> Notice that there are fewer available configuration options under the stream's "Data Handling" tab. This is because we are not persisting the data locally. The logger and stream are only responsible for publishing the data upstream to the broker. It will be the job of the Storage Provider to both record this data and make it accessible from the engineering tools.

<a id="storage_provider"></a>

### 3. Analytics Storage Provider

<a id="workbench"></a>

### 4. Analytics Workbench

<a id="runtime"></a>

### 5. Analytics Runtime