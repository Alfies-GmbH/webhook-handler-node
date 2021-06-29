const express = require('express');
const app = express();
const { exec } = require("child_process");

const Config = require('./config.json');

app.get('/status', (req, res) => {
    res.send({success: true})
});

app.get('/hook/:hookId', (req, res) => {
    let hookId = (req.params.hookId || '').replace(/[^a-zA-Z0-9]*/, '');    
    let hook = Config.hooks[hookId];

    if(!hook){
        return res.status(400).send({success: false, error: 'hook not found.'})
    }

    if(hook.key !== req.query.key){
        return res.status(401).send({success: false, error: 'key incorrect.'})
    }

    exec(hook.cmd, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error:\n${error.message}`);
            return res.status(500).send({success: false, error: error.message});
        }
        if (stderr) {
            console.error(`Error:\n${stderr}`);
            return res.status(500).send({success: false});
        }
        console.log(`stdout: ${stdout}`);
        res.send({success: true});
    });
    
});
  
app.listen(Config.port, () => {
    console.log(`hoook running @ http://localhost:${Config.port}`)
});



