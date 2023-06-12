import packageJson from ".././package.json";
import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import os from "os";
import fs from "fs";
import log from "electron-log";
import axios from "axios";
import { exec, execSync } from "child_process";
import { Versions } from "./../App/Components/Home/enum";

// require('update-electron-app')();
// log.initialize({ preload: true });

const appVersion = app.getVersion();
log.info("current_version", appVersion);

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

const iconPath = "images/icon.png";


// app.setIcon(iconPath);

app.setName("HC TOOL");


const states = {
    isSDKupdateing: false,
    isUpdateVscode: false,
    version: Versions.NCS320,
    isRmModules: false,
    ncsVersion: "v2.3.0",
}

const rmDir = (dir: string) => {
    if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true })
    }
}

const stdouts = {
    updateSDK: "",
    updateVscode: "",
}

let mainWindow: any;

function createWindow () {

  mainWindow = new BrowserWindow({
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
    icon: iconPath,
    title: "HC TOOL",
  });

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  ipcMain.on('update-sdk', () => {
    log.info("update-sdk");
    if(!states.isSDKupdateing) {
        states.isSDKupdateing = true;
        stdouts.updateSDK = "";
        mainWindow.webContents.send('stdout-change', stdouts); 
        updateSdk();
    }
  })

  ipcMain.on('update-vscode', () => {
    log.info("update-vscode");
    if(!states.isUpdateVscode) {
        states.isUpdateVscode = true;
        updateVscode();
    }
  })

  ipcMain.on('change-is-ncs', (arg) => {
  });

  ipcMain.on("set-version", (event, arg) => {
    log.info("set-version", arg);
    states.version = arg;
  });

  ipcMain.on("set-is-rm-modules", (event, arg) => {
    log.info("set-is-rm-modules", arg);
    states.isRmModules = arg;
  });
}

app.whenReady().then(() => {
    if (process.platform === 'darwin') {
        app.dock.setIcon(iconPath)
    }

    createWindow();

    app.setAboutPanelOptions({
        applicationName: 'HC TOOL',
        applicationVersion: packageJson.version,
        version: packageJson.version,
        iconPath: iconPath,
    });
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})


function updateSdk() {
    //判断系统
    const platform = os.platform();

    if(platform == "win32"){
        //windows
        log.info("update SDK win32");
        updateWin32Sdk();
    }else if(platform == "darwin"){
        //mac
        log.info("update SDK darwin");
        updateMacSdk();
    }else if(platform == "linux"){
        //linux
        updateLinuxSdk();
    }else{
        log.info("other");
    }
}

function downloadFile(url: any, path: any) {
    return new Promise((resolve)=> {
        axios.get(url, { responseType: 'stream' })
            .then(response => {
                const outputStream = fs.createWriteStream(path);
                response.data.pipe(outputStream);
                outputStream.on('finish', () => {
                    console.log('File downloaded successfully');
                    resolve(true)
                });
            })
            .catch(error => {
                console.error('Error downloading file:', error);
            });
    })
}

const updateWin32Sdk = async() => {
    let url, sdkWestYmlPath;

    const PATH = `C:\\ncs\\toolchains\\${states.ncsVersion}\\bin;C:\\ncs\\toolchains\\${states.ncsVersion}\\opt\\bin\\Scripts;C:\\ncs\\toolchains\\${states.ncsVersion}\\opt\\bin` // 设置对应SDK的west和python等路径
    let env = {
        PATH,
        PYTHONPATH: `C:\ncs\toolchains\${states.ncsVersion}\opt\bin;C:\ncs\toolchains\${states.ncsVersion}\opt\bin\Lib;C:\ncs\toolchains\${states.ncsVersion}\opt\bin\Lib\site-packages`,
    }

    if(states.isRmModules) {
        rmDir(`C:\\ncs\\${states.ncsVersion}\\modules`);
        rmDir(`C:\\ncs\\${states.ncsVersion}\\zephyr`);
    }

    switch(states.version) {
        case Versions.NCS320:
            url = 'http://10.1.20.100/hc_zephyr/hc_tool_statics/-/raw/main/ncs_extend_file/west.yml';
            sdkWestYmlPath = `C:\\ncs\\${states.ncsVersion}\\nrf\\west.yml`;
            execSync(`cd /ncs/${states.ncsVersion} && west config manifest.path nrf`, {
                env,
            });
            break;
        case Versions.ZEPHYR330:
            url = 'http://10.1.20.100/hc_zephyr/hc_tool_statics/-/raw/main/ncs_extend_file/zephyr3.3-west.yml'
            const sdkWestYmlPathDir = `C:\\ncs\\${states.ncsVersion}\\hc`;
            sdkWestYmlPath = `${sdkWestYmlPathDir}\\west.yml`;

            // 检查文件夹是否存在
            if (!fs.existsSync(sdkWestYmlPathDir)) {
                fs.mkdirSync(sdkWestYmlPathDir);
            }

            execSync(`cd /ncs/${states.ncsVersion} && west config manifest.path hc`, {
                env
            });
            break
    }

    await downloadFile(url, sdkWestYmlPath); 


    const westShell = exec(`cd /ncs/${states.ncsVersion} && west update`, {
        env
    }, (error, stdout, stderr) => {
        log.info("run west shell error", error);
        log.info("run west shell stderr", stderr);
    });

    westShell.stdout.on('data', function(data) {
        log.info("data", data);
        stdouts.updateSDK += data;
        mainWindow.webContents.send('stdout-change', stdouts);
    });

    westShell.stdout.on('end', function(data: any) {
        stdouts.updateSDK += "west update end";
        log.info("end", data);
        mainWindow.webContents.send('stdout-change', stdouts);
        states.isSDKupdateing = false;
    });
}

const updateMacSdk = async() => {
    let url, sdkWestYmlPath;

    let env = {
        PATH: `/usr/bin:/usr/local/bin:/opt/nordic/ncs/toolchains/${states.ncsVersion}/bin`,
    };

    if(states.isRmModules) {
        rmDir(`/opt/nordic/ncs/${states.ncsVersion}/modules`);
        rmDir(`/opt/nordic/ncs/${states.ncsVersion}/zephyr`);
    }
    
    switch(states.version) {
        case Versions.NCS320:
            url = 'http://10.1.20.100/hc_zephyr/hc_tool_statics/-/raw/main/ncs_extend_file/ncs3.2-west.yml'
            sdkWestYmlPath = `/opt/nordic/ncs/${states.ncsVersion}/nrf/west.yml`;
            execSync(`cd /opt/nordic/ncs/${states.ncsVersion} && west config manifest.path nrf`, {
                env,
            });
            break;
        case Versions.ZEPHYR330:
            url = 'http://10.1.20.100/hc_zephyr/hc_tool_statics/-/raw/main/ncs_extend_file/zephyr3.3-west.yml'
            const sdkWestYmlPathDir = `/opt/nordic/ncs/${states.ncsVersion}/hc/`;
            sdkWestYmlPath = `${sdkWestYmlPathDir}/west.yml`;

            // 检查文件夹是否存在
            if (!fs.existsSync(sdkWestYmlPathDir)) {
                fs.mkdirSync(sdkWestYmlPathDir);
            }

            execSync(`cd /opt/nordic/ncs/${states.ncsVersion} && west config manifest.path hc`, {
                env,
            });
            break
    }

    await downloadFile(url, sdkWestYmlPath);
    const westShell = exec(`cd /opt/nordic/ncs/${states.ncsVersion} && west update`, {
        env,
    }, (error, stdout, stderr) => {
        log.info("run west shell error", error);
        log.info("run west shell stderr", stderr);
    });

    westShell.stdout.on('data', function (data) {
        log.info("data", data);
        stdouts.updateSDK += data;
        mainWindow.webContents.send('stdout-change', stdouts);
    });

    westShell.stdout.on('end', function (data: any) {
        stdouts.updateSDK += "west update end";
        log.info("end", data);
        mainWindow.webContents.send('stdout-change', stdouts);
        states.isSDKupdateing = false;
    });
}

function updateLinuxSdk() {
    log.info("updateLinuxSdk");
}


const updateVscode = async() => {
  const url = "http://10.1.20.100/hc_zephyr/hc_tool_statics/-/raw/main/vscode_extend_file/extension.js";
  let nordicExtensionPath;

  const extensionDirPath = path.join(os.homedir(), '.vscode', 'extensions');
  
  // find nordic-semiconductor.nrf-connect file
    const files = fs.readdirSync(extensionDirPath);
    for(let i = 0; i < files.length; i++) {
        const file = files[i];
        if(file.indexOf("nordic-semiconductor.nrf-connect-20") != -1) {
            nordicExtensionPath = path.join(extensionDirPath, file, 'dist', 'extension.js');
            break;
        }
    }
  log.info("nordicExtensionPath", nordicExtensionPath);

  await downloadFile(url, nordicExtensionPath);
  states.isUpdateVscode = false;
  stdouts.updateVscode = "update success";
  mainWindow.webContents.send('stdout-change', stdouts); 
}