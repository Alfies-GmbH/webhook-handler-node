const express = require('express');
const app = express();
const { exec } = require("child_process");

const Config = require('./config.json');

app.use(express.json());

app.get('/status', (req, res) => {
    res.send({success: true})
});

const handleHook = (req, res) => {
    let hookId = (req.params.hookId || '').replace(/[^a-zA-Z0-9]*/, '');    
    let hook = Config.hooks[hookId];

    if(!hook){
        return res.status(400).send({success: false, error: 'hook not found.'})
    }

    if(hook.key !== req.query.key){
        return res.status(401).send({success: false, error: 'key incorrect.'})
    }

    let cmd;

    if(hook.branches){
        let branch = req.body.ref;
        cmd = hook.branches[branch]?.cmd;

    } else {
        cmd = hook.cmd;
    }

    if(!cmd){
        return res.status(200).send({success: true, error: 'No cmd.'});
    }    

    exec(cmd, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error:\n${error.message}`);
            return res.status(500).send({success: false, error: error.message});
        }
        console.log(`${stdout}`);
        if (stderr) {
            console.error(`Error:\n${stderr}`);
            //return res.status(500).send({success: false});
        }
        res.send({success: true});
    });
};

app.get('/hook/:hookId', handleHook);
app.post('/hook/:hookId', handleHook);
  
app.listen(Config.port, () => {
    console.log(`hoook running @ http://localhost:${Config.port}`)
});



