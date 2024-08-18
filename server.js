/**
 * @file server.js
 * @author  CasNine418
 * @createDate  2024-8-18
 * @lastEditors  CasNine418
 * @description  live-kit-server-nodejs
 * @version 0.0.1
 */

import express from 'express';
import {
    AccessToken,
    RoomServiceClient,
    Room, //？这啥
} from 'livekit-server-sdk';
import cors from 'cors';
import clg from './utils/clg.js';
import config from './config.js';


let roomCreateStatue = 0;

const appKey = config.appKey;
const appSecret = config.appSecret;
const livekitHost = config.livekitHost;

const RoomService = new RoomServiceClient(livekitHost, appKey, appSecret);

const getJoinToken = async (roomName, identity, createRoom) =>{
    const params = { roomName, identity, createRoom };
    const createToken = async () =>{
        const roomName = params.roomName;
        const participantName = params.identity;
        const createRoom = params.createRoom;

        if(roomName === undefined || roomName === null){
            // throw new Error('RoomName is required');
            return 'roomName is required';
        }
        if(participantName === undefined || participantName === null){
            // throw new Error('participantName is required');
            return 'participantName is required';
        }
        if(createRoom === undefined || createRoom === null){
            // throw new Error('createRoom is required');
            return 'createRoom is required';
        }


        // const roomName = 'TestRoom';
        // const participantName = 'TestName';
        // const createRoom = '0';

        const at = new AccessToken(appKey, appSecret, {
            identity: participantName,
            ttl: '10m',
        });
        
        at.addGrant({ roomJoin: true, room: roomName });

        if(createRoom === '0'){
            createHomeApi(roomName);
            clg('Try to Create a Room','INFO','ServerProcess')
        }

        // console.log(at);
        return await at.toJwt();
    }
    // console.log(await createToken());
    return await createToken();
}

const createHomeApi = async (roomName) =>{
    //...CREAT_ROOM
    const options = {
        name: roomName,
        emptyTimeout: 10 * 60, // 10min
        maxParticipants: 20, //default 20
    }
    RoomService.createRoom(options)
    .then((room) =>{
        clg(`Room ${options.name} created successfully`,'INFO','ServerProcess');
        roomCreateStatue = 1;
    })
    .catch((err)=>{
        roomCreateStatue = -1;
        clg(`Err: ${err}`,'ERROR','ServerProcess');
    })
}

const getRoomList = async () =>{
    // let returnData = null;
    try {
        const rooms = await RoomService.listRooms();
        // clg(`Existing rooms: ${JSON.stringify(rooms)}`,'INFO','ServerProcess');
        clg('Try to get room list...','INFO','ServerProcess');
        return JSON.stringify(rooms);
    }
    catch (err){
        clg('Error getting room list','ERROR','ServerProcess');
        return "[]";
    }
    // .then((rooms) =>{
    //     clg(`Existing rooms: ${JSON.stringify(rooms)}`,'INFO','ServerProcess');
    //     returnData = JSON.stringify(rooms);
    //     return returnData;
    // })
    // .catch((err) =>{
        // clg('Error getting room list','ERROR','ServerProcess');
    //     return "[]";
    // })
}

const app = express();
app.use(cors());
const port = 3000;

app.post('/getToken', async (req, res) =>{
    //链接解析
    /**
     * @class {roomName: String, identity: String, createRoom: String}
     */
    const _params = {};
    const params = req.url.substring(req.url.indexOf('?') + 1);
    params.split('&').forEach(item =>{
        const t = item.split('=');
        _params[t[0]] = t[1];
    })
    
    const token = await getJoinToken(_params.roomName, _params.identity, _params.createRoom);

    clg(`Token status: ${token}`,'WARN','POST');
    // console.log(await getJoinToken());
    // res.send(await getJoinToken());
    
    const waitRoomCreation = () => {
        return new Promise((resolve, reject) =>{
            const interval = setInterval(() =>{
                if (roomCreateStatue === 1){
                    clearInterval(interval);
                    resolve();
                } else if (roomCreateStatue === -1){
                    clearInterval(interval);
                    reject(new Error('Room creation failed'));
                } else if (roomCreateStatue === 0){
                    clearInterval(interval);
                    reject(new Error('Server connected failed'));
                }
            }, 1000); // 每秒检查一次  
        });  
    }; 

    try{
        await waitRoomCreation();
        res.send(JSON.stringify({
            status: '200',
            data: {
                token: token,
                roomCreateStatue,
            }
        }));
    }
    catch(err){
        res.status(500).send(JSON.stringify({
            status: '500',
            error: err.message,
        }));
        clg(`${err}`,'ERROR','POST');
    }
})

app.post('/getRoomList', async (req, res) =>{
    try{
        const roomList = JSON.parse(await getRoomList());
        clg(`Get room list OK`,'INFO','POST');
        res.send(JSON.stringify({
            status: '200',
            data: {
                roomList: roomList,
            }
        }))
    }
    catch (err){
        clg(err, 'ERROR', 'ServerProcess');
        res.status(500).send(JSON.stringify({
            status: '500',
            error: err.message,
        }));
    }
})

app.listen(port, () => {
    // console.log(`Server listening on port ${port}`)
    clg(`Server listening on port ${port}`,'INFO','ServerStart');
})