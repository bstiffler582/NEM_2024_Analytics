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
    - Activate licenses for Analytics Storage Provider and PLC

The application:

This demo program is derived from the OOP [example on infosys](https://infosys.beckhoff.com/english.php?content=../content/1033/tc3_plc_intro/100978955.html&id=7649550070152933723), which uses sensors, conveyors and actuating cylinders to "sort" generic materials through metal or non-metal conveyance. It contains two PLC programs - one for the application logic and one to drive the simulation signals. There is a TwinCAT HMI program as well to operate the system in manual or automatic modes.

> Note: If you do not have access to the HMI, you can still run the machine in Auto with the following sequence:
>1. Toggle `PLC1.MAIN.fbMachine.fbVisu.bButtonPowerOut` to turn on machine main power
>2. Toggle `PLC1.MAIN.fbMachine.fbVisu.bButtonAutoOut` to put machine in auto
>3. Toggle `PLC1.MAIN.fbMachine.fbVisu.bButtonStartOut` to start the machine

<a id="logger"></a>

### 2. Analytics Logger

Analytics Logger is our PLC's "flight recorder"; where any program symbol or IO signal can be logged locally or remotely, at rates (up to) the PLC scan rate. We will configure the Analytics Logger to publish messages to our local MQTT message broker:
```
Data Format                   ANALYTICS_FORMAT_MQTT_BINARY
...
MQTT Host Name                127.0.0.1
MQTT Tcp Port                 1883
MQTT Main Topic               TcAnalytics
MQTT Client ID                SortingPLC1
```

One stream for each PLC should be automatically created. Our application logic is running on the second PLC instance (port 852), so we will make our Logger selections under **PlcStream2**:

> The symbols are already available via the input and output process images to drive the simulation logic. Otherwise, we would have to add the `{attribute 'TcAnalytics'}` pragma in the symbol declaration for them to show up in this list.

Machine State:
- `MAIN.eMachineState`

Clamp cylinder:
- `MAIN.fbMachine.fbSeparateModule.fbClamp.bAtBasePos`
- `MAIN.fbMachine.fbSeparateModule.fbClamp.bAtWorkPos`
- `MAIN.fbMachine.fbSeparateModule.fbClampDiag.fVibrationSensor`
- `MAIN.fbMachine.fbSeparateModule.fbClampDiag.fPressureSensor`
- `MAIN.fbMachine.fbSeparateModule.fbClampTemp.fTempCurrent`

Barrier cylinder:
- `MAIN.fbMachine.fbSeparateModule.fbBarrier.bAtBasePos`
- `MAIN.fbMachine.fbSeparateModule.fbBarrier.bAtWorkPos`
- `MAIN.fbMachine.fbSeparateModule.fbBarrierDiag.fVibrationSensor`
- `MAIN.fbMachine.fbSeparateModule.fbBarrierDiag.fPressureSensor`
- `MAIN.fbMachine.fbSeparateModule.fbBarrierTemp.fTempCurrent`

Metal divert cylinder:
- `MAIN.fbMachine.fbMetalSorting.fbCylinder.bAtBasePos`
- `MAIN.fbMachine.fbMetalSorting.fbCylinder.bAtWorkPos`
- `MAIN.fbMachine.fbMetalSorting.fbCylinderDiag.fVibrationSensor`
- `MAIN.fbMachine.fbMetalSorting.fbCylinderDiag.fPressureSensor`
- `MAIN.fbMachine.fbMetalSorting.fbCylinderTemp.fTempCurrent`

Plastic divert cylinder:
- `MAIN.fbMachine.fbPlasticSorting.fbCylinder.bAtBasePos`
- `MAIN.fbMachine.fbPlasticSorting.fbCylinder.bAtWorkPos`
- `MAIN.fbMachine.fbPlasticSorting.fbCylinderDiag.fVibrationSensor`
- `MAIN.fbMachine.fbPlasticSorting.fbCylinderDiag.fPressureSensor`
- `MAIN.fbMachine.fbPlasticSorting.fbCylinderTemp.fTempCurrent`

Conveyors:
- `MAIN.Separating_ActPos`
- `MAIN.Separating_ActVelo`
- `MAIN.Metal_ActPos`
- `MAIN.Metal_ActVelo`
- `MAIN.Plastic_ActPos`
- `MAIN.Plastic_ActVelo`

> Notice that there are fewer available configuration options under the stream's "Data Handling" tab. This is because we are not persisting the data locally. The logger and stream are only responsible for publishing the data upstream to the broker.

Upon re-activating and running the project, you should be able to check the 'Online' tab of the stream to see that the logger is <span style="color: green">Connected</span> and samples are being issued.

<a id="storage_provider"></a>

### 3. Analytics Storage Provider

The Analytics Storage Provider has two primary functions:
1. Aggregate multiple Logger streams into a single entry point
2. Create, manage and access Logger recordings

Open the **Storage Provider Configurator**. If you are familiar with the old interface, you will notice some changes. Primarily, we can now add multiple message broker configurations, *and* multiple storage configurations. We also have a few new storage configuration **types**:
- Microsoft SQL Database Storage (Plain Text)
- Influx Database Storage
- CSV Storage

These "plain text" storage offerings allow customers to leverage TwinCAT with the Logger and Storage Provider, while bringing their own analyses and visualization tooling.

The default configuration will have a broker already pointed to localhost, and an "AutoGenerated" analytics binary file store. We will keep these, but also add a new CSV store. For the path, create a new directory `C:\CSV`.

Change the Main Topic field to `TcAnalytics` and start the service.

Now, we will use the **Storage Provider Manager** to configure recordings. Add the local broker and make sure you can see your storage provider service with the two data stores. If either data store is not started, manually start them via the right-click menu. 

We will configure two templates:
- Alias "Recording" which records all "MAIN" symbols on a 2 hour ring buffer
- Alias "Triggered" which records only metal sorting symbols for 1 minute

Publish each template, assigning "Recording" to the Analytics data file store, and "Triggered" to the CSV file store. Both published recording instances should now show up in the "Global" tab. From here, we can manually start both of them. The "Recording" record will run indefinitely, while "Triggered" runs for 1 minute and then stops. We can view the results of the triggered acquisition in the `C:\CSV` directory.

In addition to starting the recordings through this interface, we can programmatically trigger them via the Storage Provider [PLC API](https://infosys.beckhoff.com/english.php?content=../content/1033/tf3520_tc3_analytics_storage_provider/5759740299.html&id=3885893500507671552), or the [Client CLI](https://infosys.beckhoff.com/english.php?content=../content/1033/tf3520_tc3_analytics_storage_provider/14570286987.html&id=707581678590924035).

Open a PowerShell or CMD window, and `cd` to `C:\TwinCAT\Functions\TF3520-Analytics-StorageProvider\Client`. Enter the following command, replacing the username and provider GUID with your own:
```ps
.\TwinCAT.Analytics.StorageProvider.Client.exe 
    -ConfigFile "C:\Users\[Username]\AppData\Roaming\Beckhoff\TwinCAT Analytics Storage Provider\TcAnalyticsStorageProvider_Recorder.xml"
    -ProviderGuid your-provider-guid-sorry-notfun-totype
    -StartRecord
    -ConfigCmdAlias Triggered
```
And observe another one minute CSV recording start.

<a id="workbench"></a>

### 4. Analytics Workbench

Now that we have real time and historical data being captured by the Storage Provider, we can use the Analytics Workbench to analyze our process. Open a new XaeShell instance and create a new TwinCAT Analytics project.

For starters, we will build out basic high-level machine analysis. Even though we have not implemented any metrics in the PLC logic, we can measure things like run time, stop time and cycle time within Workbench using the algorithms.
- Rename the blank Network something like "MachineStatus"
- Add algorithms to calculate the following
    - Run time ()

Sources and Virtual Inputs: The Analytics engineering tools create an abstraction layer between data sources and the actual analyses. This is so that input data can be seamlessly swapped without having to recreate any mappings to the algorithms. This is most commonly demonstrated when changing between "Live" and historical sources. We create a new source 

<a id="runtime"></a>

### 5. Analytics Runtime